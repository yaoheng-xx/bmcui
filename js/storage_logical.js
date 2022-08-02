/* STORAGE - Logical Information page */

var dataTabObjLogical;
var logical_list;
var gInfo = {};
var totalStorageCount = 0;
var totalLogicalCount = 0;
var logicalDeviceArray = [];
var gRaidId;
var btnLogicalDeviceDropdown;
var createLogicalBtn;
var createLogicalDevicePage = "/page/storage_create_logical.html";
var logicalDevicePage = "/page/storage_logical.html";
var lang;
var isConfigComplete = false;
"use strict";
window.addEventListener('load', PageInit);
if (parent.lang) {
  lang = parent.lang;
}

function PageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/storage_logical_hlp.html";
  logical_list = document.getElementById("logical_list");
  btnLogicalDeviceDropdown = document.getElementById("logical_dropdown");
  btnLogicalDeviceDropdown.style.display = 'none';
  createLogicalBtn = document.getElementById("create_logical_btn");
  createLogicalBtn.value = lang.LANG_SYSTEM_STORAGE_CREATE_LOGICAL_DEVICE_INFO;
  createLogicalBtn.onclick = showCreateLogicalBtn;
  createLogicalBtn.disabled = true;
  btnLogicalDeviceDropdown.onchange = displayLogicalInfo;
  document.getElementById("logical_caption_div").textContent =
      lang.LANG_SYSTEM_STORAGE_LOGICAL_DESC;
  LogicalListTab();
  CheckUserPrivilege(PrivilegeCallBack);

  gRaidId = GetVars("raid_id");
  if (gRaidId) {
    var links = top.frames.topmenu.document.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].innerText == lang.LANG_SYSTEM_STORAGE_LOGICAL_DEVICE_INFO) {
        links[i].className = "submenu_item_select";
      }
      if (links[i].innerText == lang.LANG_SYSTEM_STORAGE_ADAPTER_INFO ||
          links[i].innerText == lang.LANG_SYSTEM_STORAGE_PHYSICAL_DEVICE_INFO) {
        links[i].className = "submenu_item"
      }
    }
  }
}

function resetValues() {
  gInfo = {};
  totalStorageCount = 0;
  totalLogicalCount = 0;
  logicalDeviceArray = [];
  isConfigComplete = false;
}

function emptyDropDown() {
  var idx = 0;
  for (idx = (btnLogicalDeviceDropdown.options.length - 1); idx >= 0; idx--) {
    btnLogicalDeviceDropdown.remove(idx);
  }
}

function LogicalListTab() {
  var myColumns = [
    [ "Name", "10%", "center" ], [ "RAID Type", "10%", "center" ],
    [ "Strip Size Bytes", "10%", "center" ],
    [ "Read Cache Policy Type", "10%", "center" ],
    [ "Write Cache Policy Type", "10%", "center" ],
    [ "Capacity Bytes", "10%", "center" ],
    [ "Physical Devices IDs", "10%", "center" ], [ "Action", "10%", "center" ]
  ];
  // replace table header content with string table
  myColumns[0][0] = lang.LANG_SYS_STORAGE_LOGICAL_COLUMN_TITLE0;
  myColumns[1][0] = lang.LANG_SYS_STORAGE_LOGICAL_COLUMN_TITLE1;
  myColumns[2][0] = lang.LANG_SYS_STORAGE_LOGICAL_COLUMN_TITLE2;
  myColumns[3][0] = lang.LANG_SYS_STORAGE_LOGICAL_COLUMN_TITLE3;
  myColumns[4][0] = lang.LANG_SYS_STORAGE_LOGICAL_COLUMN_TITLE4;
  myColumns[5][0] = lang.LANG_SYS_STORAGE_LOGICAL_COLUMN_TITLE5;
  myColumns[6][0] = lang.LANG_SYS_STORAGE_LOGICAL_COLUMN_TITLE6;
  myColumns[7][0] = lang.LANG_SYS_STORAGE_LOGICAL_COLUMN_TITLE7;
  dataTabObjLogical = GetTableElement();
  dataTabObjLogical.setColumns(myColumns);
  dataTabObjLogical.init('dataTabObjLogical', logical_list, '200px');
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
    document.getElementById('logical_table').classList.remove("hide");
    getStorageInfo();
  } else {
    Loading(false);
    document.getElementById("add_desc_div").textContent = lang.LANG_VM_WEBISO_UPLOAD_LICENSE_ERR;
    document.getElementById('logical_noconfig_msg').classList.remove("hide");
    alert(lang.LANG_SYS_INFO_SOFT_LICENSE_INACTIVATED);
  }
}

function getStorageInfo() {
  resetValues();
  emptyDropDown();
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
  if (arg.readyState == 4 && arg.status == 200) {
    var storage_info = JSON.parse(arg.responseText);
    if (storage_info.hasOwnProperty("Members") != -1 &&
        storage_info.Members.length) {
      var memberData = storage_info.Members;
      var checkRaidFlag = false;
      totalStorageCount = memberData.length;
      for (var i = 0; i < memberData.length; i++) {
        if (memberData[i]["@odata.id"].indexOf("Raid") != -1) {
          checkRaidFlag = true;
          var raidId = memberData[i]["@odata.id"].split("/").pop();
          gInfo[raidId] = [];
          UpdateRAIDInfo(memberData[i]["@odata.id"], raidId);
        } else {
          totalStorageCount--;
        }
      }
      if (!checkRaidFlag) {
        alert(lang.LANG_SYSTEM_STORAGE_LOGICAL_NOT_AVAIL);
      }
    } else {
      Loading(false);
    }
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

    if (storageControllersInfo.Oem.OpenBmc.configComplete != 0) {
      isConfigComplete = true;
    } else {
      isConfigComplete = false;
    }

    if (storageControllersInfo.hasOwnProperty("Volumes")) {
      UpdateLogicalInfo(storageControllersInfo.Volumes["@odata.id"], raidId);
    }
  }
}

function updateDropdownOption(id, sId) {
  var selector = document.getElementById("logical_dropdown");
  var option = document.createElement("option");
  option.text = sId;
  option.value = id;
  selector.add(option);
}

function getLogicalId(val) {
  return "Storage " + val.replace("_", "") + ", Logical Devices";
}

function UpdateLogicalInfo(url, raidId) {
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(arg) {
      var arg = JSON.parse(arg.responseText);
      var numberOflogicalDevices = arg.Members;
      totalLogicalCount += numberOflogicalDevices.length;
      if (numberOflogicalDevices.length) {
        var logicalId = getLogicalId(raidId);
        updateDropdownOption(raidId, logicalId);
        for (var i = 0; i < numberOflogicalDevices.length; i++) {
          getLogicalDeviceInfos(numberOflogicalDevices[i]["@odata.id"], raidId);
        }
      } else {
        totalStorageCount--;
      }
      if (totalStorageCount == 0 && totalLogicalCount == 0) {
        if (isConfigComplete) {
          setTimeout(function() { getStorageInfo(); }, 3000)
        } else {
          Loading(false);
          alert(lang.LANG_SYSTEM_STORAGE_LOGICAL_NOT_AVAIL);
          createLogicalBtn.disabled = false;
          btnLogicalDeviceDropdown.style.display = 'block';
        }
      }
    },
    onFailure : function() {
      totalStorageCount--;
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}
function getLogicalDeviceInfos(url, raidId) {
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    contentType : 'application/json',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(
        response) { handleLogicalInformationResponse(response, raidId); },
    onFailure : function() {
      totalLogicalCount--;
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}
function handleLogicalInformationResponse(response, raidId) {
  if (response.readyState == 4 && response.status == 200) {
    var logicalDeviceInfo = JSON.parse(response.responseText);
    gInfo[raidId].push(logicalDeviceInfo);

    totalStorageCount =
        totalStorageCount ? totalStorageCount - 1 : totalStorageCount;
    totalLogicalCount--;
    if (totalLogicalCount == 0 && totalStorageCount == 0) {
      if (isConfigComplete) {
        setTimeout(function() { getStorageInfo(); }, 3000);
      } else {
        displayLogicalInfo();
        createLogicalBtn.disabled = false;
        btnLogicalDeviceDropdown.style.display = 'block';
      }
    }
  }
}

function checkProperty(obj, key) {
  if (obj.hasOwnProperty(key)) {
    if (key == 'CapacityBytes' || key == 'StripSizeBytes') {
      var tmp = checkTheBytes(obj[key]);
      return tmp;
    }
    return obj[key];
  } else {
    return 'N/A';
  }
}

function checkTheBytes(bytes) {
  var sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ];
  if (bytes == 0)
    return '0 Bytes';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function displayLogicalInfo() {
  if (gRaidId && gRaidId.indexOf("HBA") == -1) {
    btnLogicalDeviceDropdown.value = gRaidId;
    gRaidId = '';
  }
  var selectedRaidId = btnLogicalDeviceDropdown.value;
  if (!selectedRaidId) {
    alert(lang.LANG_SYSTEM_STORAGE_LOGICAL_NOT_AVAIL);
  }
  var logicalInfoToShow = gInfo[selectedRaidId];
  logicalDeviceArray = [];
  for (var i = 0; i < logicalInfoToShow.length; i++) {
    var physicalDevices = JSON.stringify(logicalInfoToShow[i].Oem.OpenBmc.DriveList)
                              .replace('[', '')
                              .replace(']', '');
    var deleteLogical =
        '<input type="image" img src="/images/bin.png" style="width: 15px;" class="killicon" onclick="deleteLogicalDevice(' +
        logicalInfoToShow[i].Id + ')">';
    logicalDeviceArray.push([
      i, checkProperty(logicalInfoToShow[i], 'Name'),  //"Name"
      checkProperty(logicalInfoToShow[i], 'RAIDType'), //"RAID Type"
      checkProperty(logicalInfoToShow[i],
                    'StripSizeBytes'), //"Strip Size Bytes"
      checkProperty(logicalInfoToShow[i],
                    'ReadCachePolicy'), //"Read Cache Policy Type"
      checkProperty(logicalInfoToShow[i],
                    'WriteCachePolicy'), //"Write Cache Policy Type"
      checkProperty(logicalInfoToShow[i], 'CapacityBytes'), //"Capacity Bytes"
      physicalDevices,                                      // Number of Drives
      deleteLogical
    ]);
  }
  dataTabObjLogical.empty();
  dataTabObjLogical.show(logicalDeviceArray);
  Loading(false);
}

function deleteLogicalDevice(id) {
  Loading(true);
  UtilsConfirm(lang.LANG_SYS_STORAGE_DELETE_CONFIRM, {
    onOk : function() {
      id = typeof (id) != 'string' ? String(id) : id;
      var selectedRaidId = btnLogicalDeviceDropdown.value;
      if (!id || !selectedRaidId) {
        alert(lang.LANG_SYS_STORAGE_DELETE_ERROR);
        return;
      }
      var obj = {"LDriveId" : String(id)};
      var object = JSON.stringify(obj);
      var ajax_url = '/redfish/v1/Systems/system/Storage/' + selectedRaidId +
                     '/Actions/StorageLDrive.Delete';
      var ajax_req = new Ajax.Request(ajax_url, {
        method : 'POST',
        contentType : 'application/json',
        parameters : object,
        onSuccess : function() {
          alert(lang.LANG_SYS_STORAGE_DELETE_SUCCESS, {
            title : lang.LANG_GENERAL_SUCCESS,
            onClose : function() { location.href = logicalDevicePage; }
          });
        },
        onFailure : function() { alert(lang.LANG_SYS_STORAGE_DELETE_ERROR); }
      });
    },
    onCancel : function() { Loading(false); }
  });
}

function showCreateLogicalBtn() { location.href = createLogicalDevicePage; }
