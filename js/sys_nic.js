/* SYSTEM -- NIC Information page */

"use strict";

var dataTabObj;
var idx = 1;
var nic_list_info;
var nic_list;

window.addEventListener('load', PageInit);
var lang;
if (parent.lang) {
  lang = parent.lang;
}

function PageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/sys_nic_hlp.html";
  nic_list = document.getElementById("nic_list");
  nic_list_info = document.getElementById("nic_list_info");
  document.getElementById("nic_caption_div").textContent =
      lang.LANG_SYS_NIC_CAPTION;
  initNICTab();
  // check user Privilege
  CheckUserPrivilege(PrivilegeCallBack);
}

function initNICTab() {
  var myColumns = [
    [ "PCI Class Code", "10%", "center" ], [ "Slot Number", "10%", "center" ],
    [ "Vender ID", "10%", "center" ], [ "Device ID", "10%", "center" ],
    [ "Current Speed (Mbps)", "10%", "center" ], [ "Portldx", "10%", "center" ],
    [ "Media state", "10%", "center" ], [ "MAC Address", "20%", "center" ],
    [ "Firmware Version", "10%", "center" ]
  ];
  // replace table header content with string table
  myColumns[0][0] = lang.LANG_SYS_NIC_COLUMN_TITLE0;
  myColumns[1][0] = lang.LANG_SYS_NIC_COLUMN_TITLE1;
  myColumns[2][0] = lang.LANG_SYS_NIC_COLUMN_TITLE2;
  myColumns[3][0] = lang.LANG_SYS_NIC_COLUMN_TITLE3;
  myColumns[4][0] = lang.LANG_SYS_NIC_COLUMN_TITLE4;
  myColumns[5][0] = lang.LANG_SYS_NIC_COLUMN_TITLE5;
  myColumns[6][0] = lang.LANG_SYS_NIC_COLUMN_TITLE6;
  myColumns[7][0] = lang.LANG_SYS_NIC_COLUMN_TITLE7;
  myColumns[8][0] = lang.LANG_SYS_NIC_COLUMN_TITLE8;
  dataTabObj = GetTableElement();
  dataTabObj.setColumns(myColumns);

  dataTabObj.init('dataTabObj', nic_list);
}

function PrivilegeCallBack(privilege) {
  if (privilege == '04' || privilege == '03' || privilege == '02') {
    getNICInfo();
  } else {
    location.href = SubMainPage;
    return;
  }
}

function getNICInfo() {
  Loading(true);
  var url = '/redfish/v1/Systems/system/NetworkInterfaces';
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : getNICInfoHandler,
    onFailure : function() { Loading(false); }
  });
}
function getNICInfoHandler(response) {
  if (response.readyState == 4 && response.status == 200) {
    var nic_data = JSON.parse(response.responseText);
    var nic_url_arr = nic_data.Members;
    if (nic_url_arr.length) {
      for (var i = 0; i < nic_url_arr.length; i++) {
        GetNumberofNIC(nic_url_arr[i]["@odata.id"]);
      }
    } else {
      Loading(false);
    }
  }
}
function GetNumberofNIC(url) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : GetNumberofNICHandler,
    onFailure : function() { Loading(false); }
  });
}
function GetNumberofNICHandler(response) {
  if (response.readyState == 4 && response.status == 200) {
    var nic_NP_data = JSON.parse(response.responseText);
    getNICInfo_data(nic_NP_data.Links.NetworkAdapter["@odata.id"]);
  }
}
function getNICInfo_data(url) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : getNICInfo_dataHandler,
    onFailure : function() { Loading(false); }
  });
}
function getNICInfo_dataHandler(response) {
  if (response.readyState == 4 && response.status == 200) {
    var nic_NP_data2 = JSON.parse(response.responseText);
    var firmware_Rev = "N/A";
    if(nic_NP_data2.hasOwnProperty("Controllers")){
      for (var j = 0; j < nic_NP_data2.Controllers.length; j++) {
        if (nic_NP_data2.Controllers[j].hasOwnProperty("FirmwarePackageVersion")) {
          firmware_Rev = nic_NP_data2.Controllers[j].FirmwarePackageVersion;
        }

        if(nic_NP_data2.Controllers[j].hasOwnProperty("Links")){
          if (nic_NP_data2.Controllers[j].Links.hasOwnProperty("NetworkPorts")) {
            var nic_data_arr = nic_NP_data2.Controllers[j].Links.NetworkPorts;
            for (var i = 0; i < nic_data_arr.length; i++) {
              UpdateNICInfo_data(nic_data_arr[i]["@odata.id"], firmware_Rev);
            }
          }
        }
      }
    }
    Loading(false);
  }
}
function UpdateNICInfo_data(url, firmwareRev) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(response) {
      UpdateNICInfo_dataHandler(response, firmwareRev);
    },
    onFailure : function() { Loading(false); }
  });
}
function checkProperty(data, value) {
  if (data.hasOwnProperty(value)) {
    var tmp_data;
    if (data[value] == "") {
      if (data[value] == 0) {
        tmp_data = data[value];
      } else {
        tmp_data = "N/A"
      }
    } else {
      tmp_data = data[value];
    }
    return tmp_data;
  } else {
    return "N/A";
  }
}
function UpdateNICInfo_dataHandler(response, firmwareRev) {
  if (response.readyState == 4 && response.status == 200) {
    var org_data = JSON.parse(response.responseText);
    var table_data_arr = [];
    var PCIClassCode = 'N/A';
    var SlotNumber = 'N/A';
    var PortIndex = 'N/A';
    var State = 'N/A';
    if (org_data.hasOwnProperty("Oem")) {
      PCIClassCode = checkProperty(org_data.Oem.OpenBmc, 'PCIClassCode');
      SlotNumber = checkProperty(org_data.Oem.OpenBmc, 'SlotNumber');
      PortIndex = checkProperty(org_data.Oem.OpenBmc, 'PortIndex');
      State = (checkProperty(org_data.Oem.OpenBmc, 'MediaState') == 1)
                  ? "Connected"
                  : "Not Connected";
    }
    if (org_data.hasOwnProperty('LinkStatus')) {
      State = (checkProperty(org_data, 'LinkStatus') == "Up") ? "Connected"
                                                              : "Not Connected";
    }
    table_data_arr.push([
      idx,
      PCIClassCode,                                    // PCI Class Code
      SlotNumber,                                      // Slot Number
      checkProperty(org_data, 'VendorId'),             // Vender ID
      checkProperty(org_data.Oem.OpenBmc, 'DeviceId'),         // Device ID
      checkProperty(org_data, 'CurrentLinkSpeedMbps'), // Current Speed (Mbps)
      PortIndex,                                       // Portldx
      State,                                           // Media state
      checkProperty(org_data, 'AssociatedNetworkAddresses'), // MAC Address
      firmwareRev                                            // Firmware Version
    ]);
    dataTabObj.show(table_data_arr);
    idx++;
    Loading(false);
  }
}
