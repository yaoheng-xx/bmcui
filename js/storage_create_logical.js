/* STORAGE - Create Logical Device page */

var idPrl, idStripeSize, idInitState, idDiskCacheCapacity, idSizeLow,
  idSizeHigh, idReadPolicy, idWritePolicy, idIoPolicy, idAccessPolicy,
  idSpanDepth, idNumberOfDrives, idAccelerator, idParityGroupCount,
  idArrayNumber, idVdName, idSpanId, idDeviceId, unConfiguredPhysicalDrives,
  raidControllerDropdown, saveNewLogicalDeviceBtn, cancelNewLogicalDeviceBtn,
  alertFlag = false, gInfo = {},
  logicalDevicePage = "/page/storage_logical.html",
  createLogicalPage = "/page/storage_create_logical.html";
var lang;
var totalLogicalCount = 0, totalPhysicalCount = 0, ErrStr;
var unconfiguredDeviceSpanMap = new Map();
"use strict";
window.addEventListener('load', PageInit);
if (parent.lang) {
  lang = parent.lang;
}
function PageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
    "../help/" + lang_setting + "/storage_create_logical_hlp.html";
  OutputString();
  InitActionsAndListeners();
  CheckUserPrivilege(PrivilegeCallBack);
}
function OutputString() {
  document.getElementById("createLogicalCaptionDiv").textContent =
    lang.LANG_SYSTEM_STORAGE_CREATE_LOGICAL_DEVICE_INFO;
  document.getElementById("raidContrlabel").textContent =
    lang.LANG_SYS_STORAGE_CLD_RAID_CTRL;
  document.getElementById("prl").textContent = lang.LANG_SYS_STORAGE_CLD_PRL;
  document.getElementById("vdName").textContent =
    lang.LANG_SYS_STORAGE_CLD_VDNAME;
  document.getElementById("spanDepth").textContent =
    lang.LANG_SYS_STORAGE_CLD_SPAN_DEPTH;
  document.getElementById("numberOfDrives").textContent =
    lang.LANG_SYS_STORAGE_CLD_NUMBER_OF_DRIVES;
  document.getElementById("initState").textContent =
    lang.LANG_SYS_STORAGE_CLD_INIT_STATE;
  document.getElementById("stripeSize").textContent =
    lang.LANG_SYS_STORAGE_CLD_STRIPE_SIZE;
  document.getElementById("readPolicy").textContent =
    lang.LANG_SYS_STORAGE_CLD_READ_POLICY;
  document.getElementById("writePolicy").textContent =
    lang.LANG_SYS_STORAGE_CLD_WRITE_POLICY;
  document.getElementById("ioPolicy").textContent =
    lang.LANG_SYS_STORAGE_CLD_IO_POLICY;
  document.getElementById("accessPolicy").textContent =
    lang.LANG_SYS_STORAGE_CLD_ACCESS_POLICY;
  document.getElementById("diskCacheCapacity").textContent =
    lang.LANG_SYS_STORAGE_CLD_DISK_CACHE_CAPACITY;
  document.getElementById("unConfiguredPhysicalDevice").textContent =
    lang.LANG_SYS_STORAGE_CLD_UNCONFIGURED_PD;
  document.getElementById("saveDevice").value = lang.LANG_SYS_STORAGE_CREATE;
  document.getElementById("cancelCreateLogical").value =
    lang.LANG_SYS_STORAGE_CANCEL;
}
function InitActionsAndListeners() {
  saveNewLogicalDeviceBtn = document.getElementById("saveDevice");
  cancelNewLogicalDeviceBtn = document.getElementById("cancelCreateLogical");
  raidControllerDropdown = document.getElementById("logical_dropdown");
  unConfiguredPhysicalDrives =
    document.getElementById("unConfiguredPhysicalDrives");
  idPrl = document.getElementById("idPrl");
  idStripeSize = document.getElementById("idStripeSize");
  idInitState = document.getElementById("idInitState");
  idDiskCacheCapacity = document.getElementById("idDiskCacheCapacity");
  idSizeLow = document.getElementById("idSizeLow");
  idSizeHigh = document.getElementById("idSizeHigh");
  idReadPolicy = document.getElementById("idReadPolicy");
  idWritePolicy = document.getElementById("idWritePolicy");
  idIoPolicy = document.getElementById("idIoPolicy");
  idAccessPolicy = document.getElementById("idAccessPolicy");
  idSpanDepth = document.getElementById("idSpanDepth");
  idSpanDepth.addEventListener("change", spanLevelChange);
  idNumberOfDrives = document.getElementById("idNumberOfDrives");
  idAccelerator = document.getElementById("idAccelerator");
  idParityGroupCount = document.getElementById("idParityGroupCount");
  idArrayNumber = document.getElementById("idArrayNumber");
  idVdName = document.getElementById("idVdName");
  idSpanId = document.getElementById("idSpanId");
  idDeviceId = document.getElementById("idDeviceId");
  idPrl.onchange = onRaidLevelChange;
  raidControllerDropdown.onchange = function () {
    alertFlag = false;
    onRaidControllerChange();
  };
  saveNewLogicalDeviceBtn.onclick = saveNewLogicalDevice;
  cancelNewLogicalDeviceBtn.onclick = cancelCreateLogical;
}
function PrivilegeCallBack(privilege) {
  if (privilege == '04') {
    getStorageInfo();
    saveNewLogicalDeviceBtn.disabled = false;
  } else {
    location.href = SubMainPage;
    return;
  }
}
function getStorageInfo() {
  Loading(true);
  var url = '/redfish/v1/Systems/system/Storage';
  var myAjax = new Ajax.Request(url, {
    method: 'GET',
    contentType: 'application/json',
    timeout: g_CGIRequestTimeout,
    ontimeout: onCGIRequestTimeout,
    onSuccess: handleStorageInformationResponse,
    onFailure: function () {
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}
function handleStorageInformationResponse(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var storage_info = JSON.parse(arg.responseText);
    if (storage_info.hasOwnProperty("Members")) {
      var memberData = storage_info.Members;
      for (var i = 0; i < memberData.length; i++) {
        if (memberData[i]["@odata.id"].indexOf("Raid") != -1) {
          var raidId = memberData[i]["@odata.id"].split("/").pop();
          gInfo[raidId] = [];
          UpdateRAIDInfo(memberData[i]["@odata.id"], raidId);
        }
      }
    } else {
      Loading(false);
    }
  }
}
function UpdateRAIDInfo(url, raidId) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method: 'GET',
    contentType: 'application/json',
    timeout: g_CGIRequestTimeout,
    ontimeout: onCGIRequestTimeout,
    onSuccess: function (
      response) { handleRaidInformationResponse(response, raidId); },
    onFailure: function () {
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}
function handleRaidInformationResponse(arg, raidId) {
  if (arg.readyState == 4 && arg.status == 200) {
    var storageControllersInfo = JSON.parse(arg.responseText);
    updateDropdownOption(raidId);
    updateStripOption(storageControllersInfo.Oem.OpenBmc.SupportedStripSize);
    updateRaidLevelOption(storageControllersInfo.StorageControllers[0].SupportedRAIDTypes);
    gInfo[raidId] = storageControllersInfo;
    var loadingFlag = false;
    if (storageControllersInfo.hasOwnProperty("Volumes")) {
      loadingFlag = true;
      gInfo[raidId].occupiedDriveId = [];
      GetLogicalInfo(storageControllersInfo.Volumes["@odata.id"], raidId);
    }
    if (storageControllersInfo.hasOwnProperty("Drives")) {
      loadingFlag = true;
      gInfo[raidId].PhysicalDriveData = [];
      UpdatePhysicalInfo(storageControllersInfo.Drives, raidId);
    }
    if (storageControllersInfo.hasOwnProperty("Actions")) {
      loadingFlag = true;
      // gInfo[raidId].PhysicalDriveData = [];
      UpdateRaidCfgInfo(storageControllersInfo.Actions, raidId);
    }
    if (!loadingFlag) {
      Loading(false);
    }
  }
}
function GetLogicalInfo(url, raidId) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method: 'GET',
    contentType: 'application/json',
    timeout: g_CGIRequestTimeout,
    ontimeout: onCGIRequestTimeout,
    onSuccess: function (response) {
      var arg = JSON.parse(response.responseText);
      if (arg.hasOwnProperty('Members')) {
        UpdateLogicalInfo(arg.Members, raidId);
      }
    },
    onFailure: function () {
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}
function UpdateLogicalInfo(data, raidId) {
  var numberOfLogicalDrives = data;
  totalLogicalCount = numberOfLogicalDrives.length;
  if (numberOfLogicalDrives.length) {
    for (var i = 0; i < numberOfLogicalDrives.length; i++) {
      if (numberOfLogicalDrives[i].hasOwnProperty("@odata.id")) {
        getLogicalDriveData(numberOfLogicalDrives[i]["@odata.id"], raidId);
      }
    }
  } else {
    Loading(false);
  }
}
function getLogicalDriveData(url, raidId) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method: 'GET',
    contentType: 'application/json',
    timeout: g_CGIRequestTimeout,
    ontimeout: onCGIRequestTimeout,
    onSuccess: function (
      response) { handleLogicalInformationResponse(response, raidId); },
    onFailure: function () {
      Loading(false);
      totalLogicalCount--;
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}
function handleLogicalInformationResponse(response, raidId) {
  Loading(false);
  if (response.readyState == 4 && response.status == 200) {
    var logicalDeviceInfo = JSON.parse(response.responseText);
    gInfo[raidId].occupiedDriveId =
      gInfo[raidId].occupiedDriveId.concat(logicalDeviceInfo.Oem.OpenBmc.DriveList);
  }
  manageDeviceCounts('logical');
}
function manageDeviceCounts(type) {
  if (type == 'logical' && totalLogicalCount > 0) {
    totalLogicalCount--;
  }
  if (type == 'physical' && totalPhysicalCount > 0) {
    totalPhysicalCount--;
  }
  if (totalLogicalCount == 0 && totalPhysicalCount == 0) {
    onRaidLevelChange();
    onRaidControllerChange();
  }
}
function UpdatePhysicalInfo(data, raidId) {
  var numberOfDrives = data;
  totalPhysicalCount = numberOfDrives.length;
  if (numberOfDrives.length) {
    for (var i = 0; i < numberOfDrives.length; i++) {
      if (numberOfDrives[i].hasOwnProperty("@odata.id")) {
        getPhysicalDriveData(numberOfDrives[i]["@odata.id"], raidId);
      }
    }
  } else {
    Loading(false);
    manageDeviceCounts('physical');
  }
}
function getPhysicalDriveData(url, raidId) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method: 'GET',
    contentType: 'application/json',
    timeout: g_CGIRequestTimeout,
    ontimeout: onCGIRequestTimeout,
    onSuccess: function (response) {
      handlePhysicalInformationResponse(response, raidId);
    },
    onFailure: function () {
      Loading(false);
      totalPhysicalCount--;
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}
function handlePhysicalInformationResponse(response, raidId) {
  Loading(false);
  if (response.readyState == 4 && response.status == 200) {
    var physicalDeviceInfo = JSON.parse(response.responseText);
    gInfo[raidId].PhysicalDriveData.push(physicalDeviceInfo);
    manageDeviceCounts('physical');
  }
}

function UpdateRaidCfgInfo(data, raidId) {
  var actionInfoURL =
    data.Oem["#StorageCollection.CreateDrive"]["@Redfish.ActionInfo"];
  Loading(true);
  var myAjax = new Ajax.Request(actionInfoURL, {
    method: 'GET',
    contentType: 'application/json',
    timeout: g_CGIRequestTimeout,
    ontimeout: onCGIRequestTimeout,
    onSuccess: function (response) {
      if (response.readyState == 4 && response.status == 200) {
        var createActionInfo = JSON.parse(response.responseText);
        for (var i = 0; i < createActionInfo.Parameters.length; i++) {
          if (createActionInfo.Parameters[i].Name == "RaidLevel") {
            removeDropDownOptions(idPrl);
            updateRaidLevelOption(createActionInfo.Parameters[i]["RaidLevel@Redfish.AllowableValues"]);
          }
          // else if (createActionInfo.Parameters[i].Name == "DriveIds") {
          //   gInfo[raidId].PhysicalDriveData = createActionInfo.Parameters[i]["DriveIds@Redfish.AllowableValues"];
          //   totalPhysicalCount = gInfo[raidId].PhysicalDriveData.size();
          // }
        }
        // manageDeviceCounts('physical');
        manageDeviceCounts('logical');
      }
    },
    onFailure: function () {
      Loading(false);
      alert(lang.LANG_SYSTEM_STORAGE_GET_FAILED);
    }
  });
}

function updateDropdownOption(id) {
  var option = document.createElement("option");
  option.text = id;
  option.value = id;
  raidControllerDropdown.add(option);
}

function updateStripOption(value) {
  var stripSizeArr =
    ["512 Bytes", "1 KB", "2 KB", "4 KB",
      "8 KB", "16 KB", "32 KB", "64 KB",
      "128 KB", "256 KB", "512 KB", "1 MB"];

  for (var i = 0; i < value.length; i++) {
    for (var j = 0; j < stripSizeArr.length; j++) {
      if (value[i] == stripSizeArr[j]) {
        var option = document.createElement("option");
        option.text = stripSizeArr[j];
        option.value = j;
        idStripeSize.add(option);
        break;
      }
    }
  }
}

function updateRaidLevelOption(value) {
  var raidTypesArr = ["RAID0", "RAID1", "RAID5", "RAID6", "RAID1E_RLQ1",
    "RAID1E_RLQ0", "RAID1E0_RLQ0",
    "RAID00", "RAID10", "RAID50", "RAID60"];
  for (var i = 0; i < value.length; i++) {
    for (var j = 0; j < raidTypesArr.length; j++) {
      if (value[i] == raidTypesArr[j]) {
        var option = document.createElement("option");
        if (raidTypesArr[j].search('_') > 0) {
          option.text = raidTypesArr[j].replace('_', ' ');
        } else {
          option.text = raidTypesArr[j];
        }
        option.value = j;
        idPrl.add(option);
        break;
      }
    }
  }
}

function getNameInDecimal(vdName) {
  var tmp = [];
  if (vdName.length) {
    for (var i = 0; i < vdName.length; i++) {
      var decimalVal = vdName.charCodeAt(i);
      tmp.push(decimalVal);
    }
  }
  return tmp;
}

function checkDeviceNumOfSpan() {
  var ret = [-1, -1]; // spanDept & numberOfDrives
  var spanDept = parseInt(idSpanDepth.value, 10);
  var numOfSpan = [];
  if (spanDept <= 1)
    return ret;
  for (let j = 0; j < spanDept; j++) {
    var selectName = "driversOf" + lang.LANG_SYS_STORAGE_CLD_SPAN + j;
    var selectSpan = document.getElementById(selectName);
    numOfSpan.push(getSelectValues(selectSpan).length);
  }
  // start from span0
  if (numOfSpan[0] == 0) {
    return ret;
  }
  numOfSpan.sort(function (a, b) { return a - b });
  if (numOfSpan[0] == numOfSpan[numOfSpan.length - 1] &&
    numOfSpan[0] != 0) {
    ret[1] = numOfSpan[0]; // numberOfDrives
  } else {
    return ret;
  }
  if (idPrl.value == 7) {
    if (ret[1] < 1 || ret[1] > 32)
      return ret;
  }
  // using an even number of drives in each RAID 10 virtual drive in the span
  else if (idPrl.value == 8) {
    if (ret[1] % 2 != 0 ||
      (ret[1] < 2 || ret[1] > 32))
      return ret;
  }
  // Eight spans of RAID 5 drive groups that contain 3 to 32 drives each
  else if (idPrl.value == 9) {
    if (ret[1] % 3 != 0 ||
      (ret[1] < 3 || ret[1] > 32))
      return ret;
  }
  // raid60
  else if (idPrl.value == 10) {
    if (ret[1] % 4 != 0 ||
      (ret[1] < 4 || ret[1] > 32))
      return ret;
  }
  ret[0] = numOfSpan.length; // spanDept
  return ret;
}

function saveNewLogicalDevice() {
  var selectedRaid = raidControllerDropdown.value;
  var selectedRaidData = gInfo[selectedRaid];
  var virtualDeviceName = idVdName.value;
  var spanDept = 1;
  var numberOfDrives = 0;
  if (idPrl.value >= 7 && idPrl.value <= 10) {
    var parameter = checkDeviceNumOfSpan();
    if (parameter[0] == -1) {
      alert(lang.LANG_SYS_STORAGE_CLD_SPAN_CONFIGURE);
      return;
    }
    spanDept = parameter[0]; //parseInt(idSpanDepth.value, 10);
    numberOfDrives = parameter[1]; //parseInt(idNumberOfDrives.value, 10);
    var spanIDArray = [];
    var deviceId = [];
    for (const [key, value] of unconfiguredDeviceSpanMap) {
      if (value === '') {
        continue;
      }
      spanIDArray.push(value);
      deviceId.push(key);
    }
  } else {
    var deviceId = getSelectValues(unConfiguredPhysicalDrives);
    if (!deviceId.length) {
      alert(lang.LANG_SYS_STORAGE_CLD_SELECT_ANY_PD);
      return;
    }
    numberOfDrives = deviceId.length;
    if (numberOfDrives > deviceId.length) {
      alert(lang.LANG_SYS_STORAGE_NUMBER_OF_DRIVE_VALIDATION);
      return;
    }
    var spanIDArray =
      new Array(deviceId.length + 1).join('0').split('').map(parseFloat);
  }
  Loading(true);
  saveNewLogicalDeviceBtn.disabled = true;
  var obj = {
    "CmdParm": 1,
    "Prl": parseInt(idPrl.value, 10),
    "StripSize": parseInt(idStripeSize.value, 10),
    "InitState": parseInt(idInitState.value, 10),
    "DiskCachePolicy": parseInt(idDiskCacheCapacity.value, 10),
    "Readpolicy": parseInt(idReadPolicy.value, 10),
    "Writepolicy": parseInt(idWritePolicy.value, 10),
    "Iopolicy": parseInt(idIoPolicy.value, 10),
    "Accesspolicy": parseInt(idAccessPolicy.value, 10),
    "SpanDepth": spanDept,
    "VDName": virtualDeviceName,
    "SizeLow": 0,
    "SizeHigh": 0,
    "NumDrives": numberOfDrives,
    "Accelerator": 0,
    "ParityGroupCount": 0,
    "ArrayNumber": 0,
    "SpanID": spanIDArray,
    "DeviceID": deviceId
  };
  var object = JSON.stringify(obj);
  var ajax_url =
    selectedRaidData.Actions.Oem["#StorageCollection.CreateDrive"].target;
  var ajax_req = new Ajax.Request(ajax_url, {
    method: 'POST',
    contentType: 'application/json',
    parameters: object,
    onSuccess: function () {
      Loading(false);
      alert(lang.LANG_SYS_STORAGE_CLD_SUCCESS, {
        title: lang.LANG_GENERAL_SUCCESS,
        onClose: function () { location.href = logicalDevicePage; }
      });
      saveNewLogicalDeviceBtn.disabled = false;
    },
    onFailure: function (errorResponse) {
      Loading(false);
      ErrStr = '';
      var org = JSON.parse(errorResponse.responseText);
      for (var i in org) {
        updateErrorMsg(org[i]);
      }
      saveNewLogicalDeviceBtn.disabled = false;
    }
  });
}

function updateErrorMsg(errData) {
  for (var i = 0; i < errData.length; i++) {
    ErrStr += ' ' + errData[i].Message;
  }
  alert(lang.LANG_SYS_STORAGE_CLD_ERROR + ErrStr);
}

function getSelectValues(select) {
  var result = [];
  var options = select && select.options;
  var opt;
  for (var i = 0, iLen = options.length; i < iLen; i++) {
    opt = options[i];
    if (opt.selected) {
      result.push(parseInt(opt.value, 10));
    }
  }
  return result;
}
function removeDropDownOptions(selectElement) {
  var i, list = selectElement.options.length - 1;
  for (i = list; i >= 0; i--) {
    selectElement.remove(i);
  }
}
function copyDropDownOptions(selectorSrc, selectorDestID) {
  var selectorDest = document.getElementById(selectorDestID);
  selectorDest.innerHTML = selectorDest.innerHTML + selectorSrc.innerHTML;
}
function onRaidControllerChange() {
  var raidSelectedValue = raidControllerDropdown.value;
  removeDropDownOptions(unConfiguredPhysicalDrives);
  if ((gInfo[raidSelectedValue].PhysicalDriveData.length ==
    gInfo[raidSelectedValue].occupiedDriveId.length)) {
    if (!alertFlag) {
      alertFlag = true;
      saveNewLogicalDeviceBtn.disabled = true;
      alert(lang.LANG_SYS_STORAGE_CLD_NO_PD);
    }
    return;
  } else {
    if (gInfo[raidSelectedValue].PhysicalDriveData.length) {
      saveNewLogicalDeviceBtn.disabled = false;
      var selector = unConfiguredPhysicalDrives;
      for (var i = 0; i < gInfo[raidSelectedValue].PhysicalDriveData.length;
        i++) {
        if (gInfo[raidSelectedValue].occupiedDriveId.length &&
          gInfo[raidSelectedValue].occupiedDriveId.indexOf(parseInt(
            gInfo[raidSelectedValue].PhysicalDriveData[i].Id, 10)) != -1) {
          continue;
        }
        if (gInfo[raidSelectedValue].PhysicalDriveData[i].Status.Health != "OK") {
          continue;
        }
        var option = document.createElement("option");
        option.text = gInfo[raidSelectedValue].PhysicalDriveData[i].Name +
          ' (' + gInfo[raidSelectedValue].PhysicalDriveData[i].Id +
          ')';
        option.value = gInfo[raidSelectedValue].PhysicalDriveData[i].Id;
        selector.add(option);
        unconfiguredDeviceSpanMap.set(parseInt(option.value, 10), '');
      }
    }
  }
}
function onRaidLevelChange() {
  var selectedValue = idPrl.value;
  // raid10 50 60
  if (selectedValue >= 7 && selectedValue <= 10) {
    document.getElementById("rowSpanDept").style.display = '';
    // document.getElementById("rowNumberOfDrives").style.display = '';
    document.getElementById("allUnconfiguredPhysicalDisk").style.display = 'none';
    document.getElementById("spanList").style.display = '';
    spanLevelChange();
  } else {
    document.getElementById("rowSpanDept").style.display = 'none';
    // document.getElementById("rowNumberOfDrives").style.display = 'none';
    document.getElementById("allUnconfiguredPhysicalDisk").style.display = '';
    document.getElementById("spanList").style.display = 'none';
    clearSpanLevel();
  }
}
function cancelCreateLogical() { location.href = logicalDevicePage; }

function clearSpanLevel() {
  var tb = document.getElementById('spanList');
  var rowNum = tb.rows.length;
  for (i = 0; i < rowNum; i++) {
    tb.deleteRow(i);
    rowNum = rowNum - 1;
    i = i - 1;
  }
}

function spanLevelChange() {
  if (idSpanDepth.value > idSpanDepth.max) {
    idSpanDepth.value = idSpanDepth.max;
  }
  if (idSpanDepth.value < idSpanDepth.min) {
    idSpanDepth.value = idSpanDepth.min;
  }
  var spanDept = parseInt(idSpanDepth.value, 10);

  clearSpanLevel();
  // raid10 50 60
  // var tb = document.getElementById("spanList").querySelector("tbody");
  // var tr = tb.insertRow(tb.rows.length);

  var table_dom = document.getElementById("spanList");

  for (let i = 0; i < spanDept; i++) {
    var trDOM = document.createElement("tr");
    var resArr = [];
    var selectName = "driversOf" + lang.LANG_SYS_STORAGE_CLD_SPAN + i;
    resArr.push('<td></td>');
    resArr.push("<td width=\"127\"> <label class=\"labelhead\">" +
      lang.LANG_SYS_STORAGE_CLD_SPAN + i +
      "</label> </td>");
    resArr.push("<td><div class=\"storageTableDescCreate\">" +
      "<select class=\"wid170\" id=\"driversOf" + lang.LANG_SYS_STORAGE_CLD_SPAN + i +
      "\" multiple></select> </div> </td>");
    trDOM.innerHTML = resArr.join("");
    table_dom.appendChild(trDOM);

    copyDropDownOptions(unConfiguredPhysicalDrives, selectName);
    document.getElementById(selectName).addEventListener("change", spanSelectChange);
  }
}

function spanSelectChange(e) {
  var selected = e.target;
  console.dir(selected);
  var deviceId = getSelectValues(selected);

  var spanIndex = selected.id.substring(selected.id.length - 1);
  var spanDept = parseInt(idSpanDepth.value, 10);

  // set unselect device ID status as null
  var selectName = "driversOf" + lang.LANG_SYS_STORAGE_CLD_SPAN + spanIndex;
  var selectSpan = document.getElementById(selectName);
  for (const [key, value] of unconfiguredDeviceSpanMap) {
    if (value == parseInt(spanIndex, 10)) {
      if (deviceId.length == 0) {
        unconfiguredDeviceSpanMap.set(key, '');
        // clear span selector options
        for (let j = 0; j < spanDept; j++) {
          var selectName = "driversOf" + lang.LANG_SYS_STORAGE_CLD_SPAN + j;
          var selectSpan = document.getElementById(selectName);
          for (let k = 0; k < selectSpan.options.length; k++) {
            var deviceIDtemp = parseInt(selectSpan.options[k].value, 10);
            if (unconfiguredDeviceSpanMap.get(deviceIDtemp) === '') {
              selectSpan.options[k].disabled = false;
            }
          }
        }
      } else {
        var m;
        for (m = 0; m < deviceId.length; m++) {
          if (key == deviceId[m]) {
            break;
          }
        }
        if (m == deviceId.length) {
          unconfiguredDeviceSpanMap.set(key, '');
        }
      }
    }
  }

  for (var i = 0; i < deviceId.length; i++) {
    unconfiguredDeviceSpanMap.set(deviceId[i], parseInt(spanIndex, 10));
  }
  for (let j = 0; j < spanDept; j++) {
    if (spanIndex == j)
      continue;
    var selectName = "driversOf" + lang.LANG_SYS_STORAGE_CLD_SPAN + j;
    var selectSpan = document.getElementById(selectName);
    for (let k = 0; k < selectSpan.options.length; k++) {
      for (var i = 0; i < deviceId.length; i++) {
        if (parseInt(selectSpan.options[k].value, 10) == deviceId[i]) {
          selectSpan.options[k].disabled = true;
          break;
        }
        else if (unconfiguredDeviceSpanMap.get(parseInt(selectSpan.options[k].value, 10)) === '') {
          selectSpan.options[k].disabled = false;
        }
      }
    }
  }
}

