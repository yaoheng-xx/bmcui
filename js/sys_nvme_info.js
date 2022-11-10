"use strict";
var lang_setting;
var lang;
var lv = 0;

/******************************************************************************
*
*                   INTEL CORPORATION PROPRIETARY INFORMATION
*       This software is supplied under the terms of a license agreement or
*       nondisclosure agreement with Intel Corporation and may not be copied
*       or disclosed except in accordance with the terms of that agreement.
*         Copyright (c) 2016-2020 Intel Corporation. All Rights Reserved.
*
*     Abstract:  sys_nvme_info.js
*
* Framework based on content by Insyde Software Corporation.
*
******************************************************************************/

window.addEventListener('load', pageInit);
if (parent.lang) { lang = parent.lang; }
function pageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/sys_nvme_hlp.html";
  var nvmeTitleDiv = document.getElementById("nvme_title_div");
  nvmeTitleDiv.textContent = lang.LANG_NVME_TITLE;
  // check user Privilege
  CheckUserPrivilege(privilegeCallBack);
}
function privilegeCallBack(privilege) {
  if (privilege == '02' || privilege == '03' || privilege == '04') {
    getNvmeStats();
  } else {
    location.href = SubMainPage;
    return;
  }
}

function getNvmeStats() {
  Loading(true);
  var url = '/redfish/v1/Systems/system/Storage/Nvme';
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : recNvmeStats,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_SYS_NVME_ALERT);
    }
  });
}
function recNvmeStats(originalRequest) {
  var nvmeInfo;
  var nvmeCount;
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var response = JSON.parse(originalRequest.responseText);
    if (response == null) {
      document.getElementById("NVMe_InfoBox_0").textContent =
          lang.LANG_SYS_NVME_CALLFAIL_REASON;
      SessionTimeout();
      Loading(false);
      return;
    }
    nvmeCount = response["Drives@odata.count"];
    nvmeInfo = response.Drives;
    if (nvmeCount > 0) {
      for (var i = 0; i < nvmeInfo.length; i++) {
        if (nvmeInfo[i].hasOwnProperty("@odata.id")) {
          getNvmeDriveInfos(nvmeInfo[i]["@odata.id"]);
        }
      }
      Loading(false);
    } else {
      Loading(false);
      document.getElementById("NVMe_InfoBox_0").textContent =
          lang.LANG_SYS_NVME_CALLFAIL_REASON;
    }
  }
}
function getNvmeDriveInfos(url) {
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(response) {
      var org = JSON.parse(response.responseText);
      // Getting the data, that should render in the WEBUI
      displayNvmeStats(org);
    },
    onFailure : function() {
      alert(lang.LANG_SYS_NVME_ALERT);
    }
  });
}
function displayNvmeStats(nvmeData) {
  document.getElementById("NVMe_InfoBox_" + lv).innerHTML =
      "<div align=\"left\" id=\"NVMe_" + lv + "\">" +
      "<fieldset class=\"nvme_info group\">" +
      "<legend class=\"legendcaption\">" + lang.LANG_SYSTEM_NVME_INFO_TITLE +
      "</legend>" +
      "<table>" +
      // SSD MFR/Model
      "<tr>" +
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_MODEL +
      "</label></td>" +
      "<td><span id=\"vendorID_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "<span id=\"model_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      // SSD Serial Number
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_SERIALNUM +
      "</label></td>" +
      "<td><span id=\"serialNum_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      "</tr>" +
      // PCIe Link 0 Speed
      "<tr>" +
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_PCIE0_SPEED +
      "</label></td>" +
      "<td><span id=\"pcie0Speed_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      // PCIe Link 0 Lane Width
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_PCIE0_WIDTH +
      "</label></td>" +
      "<td><span id=\"pcie0Width_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      "</tr>" +
      // PCIe Link 1 Speed
      "<tr>" +
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_PCIE1_SPEED +
      "</label></td>" +
      "<td><span id=\"pcie1Speed_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      // PCIe Link 1 Lane Width
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_PCIE1_WIDTH +
      "</label></td>" +
      "<td><span id=\"pcie1Width_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      "</tr>" +
      // NVMe Powered
      "<tr>" +
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_POWERED +
      "</label></td>" +
      "<td><span id=\"powered_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      // Functional
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_FUNCTIONAL +
      "</label></td>" +
      "<td><span id=\"functional_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      "</tr>" +
      // Reset Rqd
      "<tr>" +
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_RESET_RQD +
      "</label></td>" +
      "<td><span id=\"resetRqd_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      // PCIe Link0 Active
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_LINK_ACTIVE +
      "</label></td>" +
      "<td><span id=\"linkActv_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      "</tr>" +
      // NVMe Base Class/Sub class
      "<tr><td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_BASECLASS +
      "</label></td>" +
      "<td><span id=\"baseClass_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      // NVMe Sub Class
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_SUBCLASS +
      "</label></td>" +
      "<td><span id=\"subClass_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      "</tr>" +
      // NVMe Programming Intfc
      "<tr><td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_PROGINTFC +
      "</label></td>" +
      "<td><span id=\"progIntfc_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      // Percent Life Consumed
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_PERCENT_LIFE +
      "</label></td>" +
      "<td><span id=\"percentLife_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      "</tr>" +
      // PCIe Link1 Active
      "<tr>" +
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_LINK_ACTIVE1 +
      "</label></td>" +
      "</td>" +
      "<td><span id=\"linkActv1_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      // Manufacture
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_MANUFACTURE +
      "</label></td>" +
      "<td><span id=\"manufacture_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_DEVICE_LOCATION +
      "</label></td>" +
      "</td>" +
      "<td><span id=\"deviceLocation_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      // Drive FW Version
      "<td align=\"left\" class=\"bold\">" +
      "<label class=\"labeltitle\">" + lang.LANG_SYS_NVME_FWVER +
      "</label></td>" +
      "</td>" +
      "<td><span id=\"fwVer_" + lv + "\"" +
      " class=\"labeltext\"></span>" +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</fieldset>" +
      "</div>";
  document.getElementById("model_" + lv).textContent =
      checkPropertyAndReturnValue(nvmeData, "PartNumber");
  document.getElementById("serialNum_" + lv).textContent =
      checkPropertyAndReturnValue(nvmeData, "SerialNumber");
  document.getElementById("manufacture_" + lv).textContent =
      checkPropertyAndReturnValue(nvmeData, "Manufacturer");
  document.getElementById("vendorID_" + lv).textContent = '';
  document.getElementById("powered_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "NVMe_Powered");
  document.getElementById("functional_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "NVMe_Functional");
  document.getElementById("fwVer_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "Firmware_Version");
  document.getElementById("pcie0Speed_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "PCIe_0_Link_Speed");
  document.getElementById("pcie0Width_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "PCIe_0_Link_Width");
  document.getElementById("pcie1Speed_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "PCIe_1_Link_Speed");
  document.getElementById("pcie1Width_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "PCIe_1_Link_Width");
  document.getElementById("resetRqd_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "NVMe_Reset_Required");
  document.getElementById("linkActv_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "Port_0_PCIe_Link_Active");
  document.getElementById("linkActv1_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "Port_1_PCIe_Link_Active");
  document.getElementById("deviceLocation_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "DeviceLocation");

  // Below Data will be updated from SMBIOS
  var device_class_desc =
      checkOemPropertyAndReturnValue(nvmeData, "Device_Class") == 2
          ? "Mass Storage Device"
          : "Unknown Base Class";
  document.getElementById("baseClass_" + lv).textContent = device_class_desc;

  var device_sub_class_desc =
      checkOemPropertyAndReturnValue(nvmeData, "Device_Sub_Class") == 8
          ? "Non-volatile Memory Controller"
          : "Unknown Sub Class";
  document.getElementById("subClass_" + lv).textContent = device_sub_class_desc;

  var progr_interface_desc =
      checkOemPropertyAndReturnValue(nvmeData, "Device_Programming_Intf") == 1
          ? "NVMe Programming Interface"
          : "Unknown Programming Interface";
  document.getElementById("progIntfc_" + lv).textContent = progr_interface_desc;
  document.getElementById("percentLife_" + lv).textContent =
      checkOemPropertyAndReturnValue(nvmeData, "Drive_Life_Consumed");
  lv++;
}
function checkPropertyAndReturnValue(data, val) {
  if (data.hasOwnProperty(val)) {
    return data[val];
  } else {
    return "N/A";
  }
}
function checkOemPropertyAndReturnValue(nvmeData, val) {
  if (nvmeData.Oem && nvmeData.Oem.OpenBmc &&
      nvmeData.Oem.OpenBmc.hasOwnProperty(val)) {
    return val == "Drive_Life_Consumed" ? nvmeData.Oem.OpenBmc[val] + " %"
                                        : nvmeData.Oem.OpenBmc[val];
  } else {
    return "N/A";
  }
}
