/* SYSTEM -- Storage Information page */
var gInfo = {};
var totalStorageCount = 0;
var btn_logical;
var btn_physical;
var physicalPage = "/page/storage_physical.html";
var logicalPage = "/page/storage_logical.html";
var lang;
"use strict";
window.addEventListener('load', PageInit);
if (parent.lang) {
  lang = parent.lang;
}

function PageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/storage_adapter_hlp.html";
  btn_logical = document.getElementById("logical_btn");
  btn_logical.disabled = true;
  btn_physical = document.getElementById("physical_btn");
  btn_physical.disabled = true;
  btn_raid_dropdown = document.getElementById("raid_dropdown");
  btn_raid_dropdown.onchange = showContollerInfo;
  btn_physical.onclick = goToPhysicalDevice;
  btn_logical.onclick = goToLogicalDevice;
  document.getElementById("storage_caption_div").textContent =
      lang.LANG_SYSTEM_STORAGE_ADAPTER_INFO;
  document.getElementById("noInfoLbl").textContent =
      lang.LANG_SYSTEM_STORAGE_ADAPTER_NO_INFO;
  btn_physical.value = lang.LANG_SYSTEM_STORAGE_ADAPTER_PHYSICAL_BTN;
  btn_logical.value = lang.LANG_SYSTEM_STORAGE_ADAPTER_LOGICAL_BTN;
  CheckUserPrivilege(PrivilegeCallBack);
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
    document.getElementById('adapter_table').classList.remove("hide");
    getStorageInfo();
  } else {
    Loading(false);
    document.getElementById("add_desc_div").textContent = lang.LANG_VM_WEBISO_UPLOAD_LICENSE_ERR;
    document.getElementById('adapter_noconfig_msg').classList.remove("hide");
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
      totalStorageCount = memberData.length;
      for (var i = 0; i < memberData.length; i++) {
        if (memberData[i]["@odata.id"].indexOf("Raid") != -1 ||
            memberData[i]["@odata.id"].indexOf("HBA") != -1) {
          var raidId = memberData[i]["@odata.id"].split('/').pop();
          gInfo[raidId] = {};
          UpdateRAIDInfo(memberData[i]["@odata.id"], raidId);
        } else {
          totalStorageCount--;
        }
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
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}

function getStorageId(val) {
  var tmp = val.split("/");
  return lang.LANG_SYS_STORAGE_STORAGE + tmp[6].replace("_", "") + ", " +
          lang.LANG_SYS_STORAGE_CONTROLLER + tmp[8];
}

function handleRaidInformationResponse(arg, raidId) {
  if (arg.readyState == 4 && arg.status == 200) {
    var storageControllersInfo = JSON.parse(arg.responseText);
    if (storageControllersInfo.hasOwnProperty("StorageControllers")) {
      var storageInfo = storageControllersInfo.StorageControllers;
      for (var i = 0; i < storageInfo.length; i++) {
        storageInfo[i].PhysicalDeviceCount =
            storageControllersInfo["Drives@odata.count"];
        storageInfo[i].Status = storageControllersInfo.Status.Health;
        var storageId = getStorageId(storageInfo[i]["@odata.id"]);
        var id = storageInfo[i]["@odata.id"].split('/').pop();
        displayControllerInfo(id, storageId, storageInfo[i], raidId);
      }
    }
  }
}

function displayControllerInfo(id, sId, info, raidId) {
  gInfo[raidId][id] = info;
  var dropDownId = raidId + "-" + id;
  updateDropdownOption(dropDownId, sId);
  totalStorageCount--;
  if (totalStorageCount == 0) {
    btn_logical.disabled = false;
    btn_physical.disabled = false;
    showContollerInfo();
  }
}

function updateDropdownOption(id, sId) {
  var selector = document.getElementById("raid_dropdown");
  var option = document.createElement("option");
  option.text = sId;
  option.value = id;
  selector.add(option);
}

function showContollerInfo() {
  if (btn_raid_dropdown.value) {
    var id = btn_raid_dropdown.value.split("-");
    var dataToDisplay = gInfo[id[0]][id[1]];
    var htmlString = '';
    for (var key in dataToDisplay) {
      if (key != "@odata.id") {
        var label = key.replace(/([A-Z])/g, ' $1').trim();
        var value = dataToDisplay[key];
        if (key == "FirmwareVersion") {
          label = lang.LANG_SYS_STORAGE_RAID_COLUMN_TITLE3;
        } else if (key == "MemberId") {
          label = lang.LANG_SYS_STORAGE_RAID_COLUMN_TITLE1;
        } else if (key == "Name") {
          label = lang.LANG_SYS_STORAGE_RAID_COLUMN_TITLE0;
        } else if (key == "SerialNumber") {
          label = lang.LANG_SYS_STORAGE_RAID_COLUMN_TITLE2;
        } else if (key == "Status") {
          label = lang.LANG_SYS_STORAGE_RAID_COLUMN_TITLE5;
        } else if (key == "SupportedRAIDTypes") {
          value = JSON.stringify(dataToDisplay[key])
                      .replaceAll("[", "")
                      .replaceAll("]", "")
                      .replaceAll('"', '')
                      .replaceAll(' ,', ',');
          label = lang.LANG_SYS_STORAGE_RAID_COLUMN_TITLE4;
        }
        if (key.indexOf("PhysicalDeviceCount") == -1) {
          htmlString += `
          <tr>
          <td align="right" class="bold">
          <label class="labeltitle">${label} :</label>
          </td>
          <td>
          <span class="labeltext">${value}</span>
          </td>
          </tr>`;
        }
      }
      document.getElementById("infoTable").innerHTML = htmlString;
    }
    if (JSON.stringify(id).indexOf("HBA") != -1) {
      btn_logical.classList.add("hide");
    } else {
      btn_logical.classList.remove("hide");
    }
    if (dataToDisplay.PhysicalDeviceCount > 0) {
      btn_physical.disabled = false;
    } else {
      alert(lang.LANG_SYSTEM_STORAGE_PHYSICAL_NOT_AVAIL);
      btn_physical.disabled = true;
    }
  }
}

function goToPhysicalDevice() {
  var id = btn_raid_dropdown.value.split("-");
  var parameters = "?raid_id=" + id[0];
  location.href = physicalPage + parameters;
}

function goToLogicalDevice() {
  var id = btn_raid_dropdown.value.split("-");
  var parameters = "?raid_id=" + id[0];
  location.href = logicalPage + parameters;
}
