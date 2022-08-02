/* STORAGE - Physical Information page */

var dataTabObjPhysical;
var physical_list;
var gInfo = {};
var totalStorageCount = 0;
var totalPhysicalCount = 0;
var physicalDeviceArray = [];
var gRaidId;
var lang;
var btnPhysicalDeviceDropdown;
"use strict";
window.addEventListener('load', PageInit);
if (parent.lang) {
  lang = parent.lang;
}

function PageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/storage_physical_hlp.html";
  physical_list = document.getElementById("physical_list");
  btnPhysicalDeviceDropdown = document.getElementById("physicalDeviceDropdown");
  btnPhysicalDeviceDropdown.onchange = displayPhysicalInfo;

  document.getElementById("physical_caption_div").textContent =
      lang.LANG_SYSTEM_STORAGE_PHYSICAL_DESC;

  gRaidId = GetVars("raid_id");
  if (gRaidId) {
    var links = top.frames.topmenu.document.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].innerText == lang.LANG_SYSTEM_STORAGE_PHYSICAL_DEVICE_INFO) {
        links[i].className = "submenu_item_select";
      }
      if (links[i].innerText == lang.LANG_SYSTEM_STORAGE_ADAPTER_INFO ||
          links[i].innerText == lang.LANG_SYSTEM_STORAGE_LOGICAL_DEVICE_INFO) {
        links[i].className = "submenu_item"
      }
    }
  }
  PhysicalListTab();
  CheckUserPrivilege(PrivilegeCallBack);
}

function PhysicalListTab() {
  var myColumns = [
    [ "ID", "10%", "center" ], [ "Failure Predicted", "10%", "center" ],
    [ "Block Size Bytes", "10%", "center" ],
    [ "Manufacturer", "10%", "center" ],
    [ "Negotiated Speed Gbs", "10%", "center" ],
    [ "Protocol", "10%", "center" ], [ "Revision", "10%", "center" ],
    [ "SerialNumber", "10%", "center" ], [ "Status", "10%", "center" ],
    [ "Slot Number", "10%", "center" ]
  ];
  // replace table header content with string table
  myColumns[0][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE0;
  myColumns[1][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE1;
  myColumns[2][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE2;
  myColumns[3][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE3;
  myColumns[4][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE4;
  myColumns[5][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE5;
  myColumns[6][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE6;
  myColumns[7][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE7;
  myColumns[8][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE8;
  myColumns[9][0] = lang.LANG_SYS_STORAGE_PHYSICAL_COLUMN_TITLE9;
  dataTabObjPhysical = GetTableElement();
  dataTabObjPhysical.setColumns(myColumns);
  dataTabObjPhysical.init('dataTabObjPhysical', physical_list, '200px');
}

function PrivilegeCallBack(privilege) {
  if (privilege == '04') {
    Loading(true);
    getSwlStatus(SwlCallBack);
  } else {
    location.href = SubMainPage;
    return;
  }
}

function SwlCallBack(swl_status) {
  if (swl_status == "ACTIVATED") {
    document.getElementById('physical_table').classList.remove("hide");
    getStorageInfo();
  } else {
    Loading(false);
    document.getElementById("add_desc_div").textContent = lang.LANG_VM_WEBISO_UPLOAD_LICENSE_ERR;
    document.getElementById('physical_noconfig_msg').classList.remove("hide");
    alert(lang.LANG_SYS_INFO_SOFT_LICENSE_INACTIVATED);
  }
}

function getStorageInfo() {
  Loading(true);
  var url = '/redfish/v1/Systems/system/Storage';
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : handleStorageInformationResponse,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}

function handleStorageInformationResponse(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var storage_info = JSON.parse(arg.responseText);
    if (storage_info.hasOwnProperty("Members") != -1) {
      var memberData = storage_info.Members;
      var checkRaidFlag = false;
      totalStorageCount += memberData.length;
      for (var i = 0; i < memberData.length; i++) {
        if (memberData[i]["@odata.id"].indexOf("Raid") != -1 ||
            memberData[i]["@odata.id"].indexOf("HBA") != -1) {
          var raidId = memberData[i]["@odata.id"].split("/").pop();
          gInfo[raidId] = [];
          checkRaidFlag = true;
          UpdateRAIDInfo(memberData[i]["@odata.id"], raidId);
        } else {
          totalStorageCount--;
        }
      }
      if (!checkRaidFlag) {
        alert(lang.LANG_SYSTEM_STORAGE_PHYSICAL_NOT_AVAIL);
      }
    }
    Loading(false);
  }
}

function UpdateRAIDInfo(url, raidId) {
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(
        response) { handleRaidInformationResponse(response, raidId); },
    onFailure : function() {
      totalStorageCount--;
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}

function handleRaidInformationResponse(arg, raidId) {
  if (arg.readyState == 4 && arg.status == 200) {
    var storageControllersInfo = JSON.parse(arg.responseText);
    if (storageControllersInfo.hasOwnProperty("Drives")) {
      UpdatePhysicalInfo(storageControllersInfo.Drives, raidId);
    }
  }
}

function updateDropdownOption(id, sId) {
  var selector = document.getElementById("physicalDeviceDropdown");
  var option = document.createElement("option");
  option.text = sId;
  option.value = id;
  selector.add(option);
}

function getPhysicalId(val) {
  return "Storage " + val.replace("_", "") + ", Physical Devices";
}

function UpdatePhysicalInfo(data, raidId) {
  var numberOfDrives = data;
  totalPhysicalCount += numberOfDrives.length;
  if (numberOfDrives.length) {
    var physicalId = getPhysicalId(raidId);
    updateDropdownOption(raidId, physicalId);
    for (var i = 0; i < numberOfDrives.length; i++) {
      if (numberOfDrives[i].hasOwnProperty("@odata.id")) {
        getPhysicalDriveData(numberOfDrives[i]["@odata.id"], raidId);
      }
    }
  } else {
    totalStorageCount--;
  }
}

function getPhysicalDriveData(url, raidId) {
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(
        response) { handlePhysicalInformationResponse(response, raidId); },
    onFailure : function() {
      totalPhysicalCount--;
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}

function handlePhysicalInformationResponse(response, raidId) {
  if (response.readyState == 4 && response.status == 200) {
    var physicalDeviceInfo = JSON.parse(response.responseText);
    gInfo[raidId].push(physicalDeviceInfo);
    totalStorageCount =
        totalStorageCount ? totalStorageCount - 1 : totalStorageCount;
    totalPhysicalCount--;
    if (totalPhysicalCount == 0 && totalStorageCount == 0) {
      displayPhysicalInfo();
    }
  }
}

function checkProperty(obj, key) {
  if (obj.hasOwnProperty(key)) {
    return obj[key];
  } else {
    return 'N/A';
  }
}

function displayPhysicalInfo() {
  if (gRaidId) {
    btnPhysicalDeviceDropdown.value = gRaidId;
    gRaidId = '';
  }
  var selectedRaidId = btnPhysicalDeviceDropdown.value;
  if (!selectedRaidId) {
    alert(lang.LANG_SYSTEM_STORAGE_PHYSICAL_NOT_AVAIL);
  }
  var physicalDeviceInfoToShow = gInfo[selectedRaidId];
  physicalDeviceArray = [];
  for (var i = 0; i < physicalDeviceInfoToShow.length; i++) {
    var slotNumber =
        physicalDeviceInfoToShow[i].Oem
            ? checkProperty(physicalDeviceInfoToShow[i].Oem.OpenBmc,
                            'SlotNumber')
            : 'N/A';
    physicalDeviceArray.push([
      i, checkProperty(physicalDeviceInfoToShow[i], 'Id'), // ID
      checkProperty(physicalDeviceInfoToShow[i],
                    'FailurePredicted'), // Failure Predicted
      checkProperty(physicalDeviceInfoToShow[i],
                    'BlockSizeBytes'), // Block Size Bytes
      checkProperty(physicalDeviceInfoToShow[i],
                    'Manufacturer'), // Manufacturer
      checkProperty(physicalDeviceInfoToShow[i],
                    'NegotiatedSpeedGbs'), // Negotiated Speed Gbs
      checkProperty(physicalDeviceInfoToShow[i], 'Protocol'), // Protocol
      checkProperty(physicalDeviceInfoToShow[i], 'Revision'), // Revision
      checkProperty(physicalDeviceInfoToShow[i],
                    'SerialNumber'),             // SerialNumber
      physicalDeviceInfoToShow[i].Status.Health, // Status
      slotNumber                                 // Slot Number
    ]);
  }
  dataTabObjPhysical.empty();
  dataTabObjPhysical.show(physicalDeviceArray);
  document.getElementById("physical_list_info").textContent = lang.LANG_SYS_STORAGE_PHYSICAL_DRIVE_COUNT + physicalDeviceArray.length + lang.LANG_COMMON_SPACE;
}
