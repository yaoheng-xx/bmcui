"use strict";
/* SYSTEM -- Storage Information page */

var dataTabObj;
var firmware_Rev;
var idx = 1;
var lang_setting;
var lang;
var storage_list_info;
var storage_list;

window.addEventListener('load', PageInit);
var lang;
if (parent.lang) {
  lang = parent.lang;
}
function PageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/sys_storage_info_hlp.html";
  storage_list = document.getElementById("storage_list");
  storage_list_info = document.getElementById("storage_list_info");
  document.getElementById("storageInfo_caption_div").textContent =
      lang.LANG_SYSTEM_STORAGE_INFO;
  initStorageTab();
  // check user Privilege
  CheckUserPrivilege(PrivilegeCallBack);
}
function initStorageTab() {
  var myColumns = [
    [ "Port Destination", "15%", "center" ],
    [ "Device Index", "10%", "center" ], [ "Connector Type", "5%", "center" ],
    [ "Protocol", "5%", "center" ], [ "Device Type", "5%", "center" ],
    [ "Capacity (GB)", "10%", "center" ], [ "RPM", "5%", "center" ],
    [ "Model", "10%", "center" ], [ "Serial", "10%", "center" ],
    [ "PCI Class Code", "5%", "center" ], [ "Vendor Id", "5%", "center" ],
    [ "Device Id", "5%", "center" ], [ "Firmware Version", "10%", "center" ]
  ];
  // replace table header content with string table
  myColumns[0][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE0;
  myColumns[1][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE1;
  myColumns[2][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE2;
  myColumns[3][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE3;
  myColumns[4][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE4;
  myColumns[5][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE5;
  myColumns[6][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE6;
  myColumns[7][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE7;
  myColumns[8][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE8;
  myColumns[9][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE9;
  myColumns[10][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE10;
  myColumns[11][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE11;
  myColumns[12][0] = lang.LANG_SYS_STORAGE_COLUMN_TITLE12;

  dataTabObj = GetTableElement();
  dataTabObj.setColumns(myColumns);
  dataTabObj.init('dataTabObj', storage_list);
}
function PrivilegeCallBack(privilege) {
  if (privilege == '04' || privilege == '03' || privilege == '02') {
    getStorageInfo();
  } else {
    location.href = SubMainPage;
    return;
  }
}
function getStorageInfo() {
  Loading(true);
  document.getElementById("storageTableInfo").textContent =
      lang.LANG_SYS_NUMBER_OF_STORAGE + "0";
  var url = '/redfish/v1/Systems/system/Storage/Smbios';
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : getStorageInfoHandler,
    onFailure : function() {
      alert(lang.LANG_SYS_STORAGE_GET_ERROR);
      Loading(false);
    }
  });
}
function getStorageInfoHandler(response) {
  if (response.readyState == 4 && response.status == 200) {
    var storageData = JSON.parse(response.responseText);
    var storageUrlArr = storageData.Drives;
    if (storageUrlArr.length) {
      for (var i = 0; i < storageUrlArr.length; i++) {
        GetNumberOfStorageInfo(storageUrlArr[i]["@odata.id"]);
      }
    } else {
      alert(lang.LANG_SYS_STORAGE_NO_INFORMATION);
      Loading(false);
    }
  }
}
function GetNumberOfStorageInfo(url) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : GetNumberOfStorageHandler,
    onFailure : function() { Loading(false); }
  });
}
function checkTheBytes(kb) {
  var sizes = [ 'KB', 'MB', 'GB', 'TB' ]; // dbus value is KB, so remove 'Bytes'.
  if (kb == 0)
    return '0 KB';
  var i = parseInt(Math.floor(Math.log(kb) / Math.log(1024)));
  return Math.round(kb / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
function checkProperty(data, value) {
  if (data.hasOwnProperty(value)) {
    var tmp_data = data[value] === "" ? "N/A" : data[value];
    if (tmp_data != 'N/A' && (value == 'Index' || value == 'DeviceId' ||
                              value == 'PciClass' || value == 'VendorId')) {
      var hexData = IntegerToHexString(tmp_data);
      if (hexData.length == 1) {
        tmp_data = "0x0" + hexData;
      } else {
        tmp_data = "0x" + hexData;
      }
    }
    if (tmp_data != 'N/A' && value == 'CapacityBytes') {
      tmp_data = checkTheBytes(tmp_data);
    }
    return tmp_data;
  } else {
    return "N/A";
  }
}
function GetNumberOfStorageHandler(response) {
  if (response.readyState == 4 && response.status == 200) {
    var org_data = JSON.parse(response.responseText);
    var table_data_arr = [];
    var DeviceId = 'N/A';
    var PciClass = 'N/A';
    var ConnectorType = 'N/A';
    var VendorId = 'N/A';
    var Index = 'N/A';
    var mediaType = 'N/A';
    if (org_data.hasOwnProperty("Oem")) {
      DeviceId = checkProperty(org_data.Oem.OpenBmc, 'DeviceId');
      PciClass = checkProperty(org_data.Oem.OpenBmc, 'PciClass');
      ConnectorType = checkProperty(org_data.Oem.OpenBmc, 'ConnectorType');
      VendorId = checkProperty(org_data.Oem.OpenBmc, 'VendorId');
      Index = checkProperty(org_data.Oem.OpenBmc, 'Index');
    }
    if (ConnectorType == 'USB') {
      mediaType = 'USB';
    } else {
      mediaType = org_data.MediaType;
    }
    table_data_arr.push([
      idx,
      checkProperty(org_data, "Name"),
      Index,
      ConnectorType,
      checkProperty(org_data, "Protocol"),
      mediaType,
      checkProperty(org_data, "CapacityBytes"),
      checkProperty(org_data, "RotationSpeedRPM"),
      checkProperty(org_data, "Model"),
      checkProperty(org_data, "SerialNumber"),
      PciClass,
      VendorId,
      DeviceId,
      checkProperty(org_data, "Revision"),
    ]);
    dataTabObj.show(table_data_arr);
    document.getElementById("storageTableInfo").textContent =
        lang.LANG_SYS_NUMBER_OF_STORAGE + idx;
    idx++;
    Loading(false);
  }
}
