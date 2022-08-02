/* configuration firmware update page */
(function($) {
"use strict";
$(document).ready(function() { $.PageInit(); });
var lang;
if (parent.lang) {
  lang = parent.lang;
}
var FileExist;
var ApplyTime;
var firmwareUpdateOptionModified;
var PFRSupported = 0;
var uploadBtn;
var FileBrowse;
var resetBtn;
$.PageInit = function() {
  stopTimer();
  document.title = lang.LANG_CONFIG_SUBMENU_FWUPD;
  PFRSupported = 1;
  if (PFRSupported) {
    top.frames.topmenu.document.getElementById("frame_help").src =
        "../help/" + lang_setting + "/fwupd_config_2_hlp.html";
  } else {
    $("#BMCUpdateOption").hide();
    $("#BMCUpdateOption1").hide();
    $("#BMCUpdateFirmwareOption").hide();
    $("#BMCPFMActiveTr").hide();
    top.frames.topmenu.document.getElementById("frame_help").src =
        "../help/" + lang_setting + "/fwupd_config_hlp.html";
  }
  document.getElementById("bmc_recovery_check")
      .addEventListener("change", setFirmwarUpdateOptionRecovery);
  document.getElementById("bmc_active_check")
      .addEventListener("change", function() {
        firmwareUpdateOptionModified = false;
        setFirmwarUpdateOptionReset();
      });
  $("#uploadBtn")
      .attr("value", lang.LANG_COMMON_BTN_UPLOAD)
      .click(FW_UploadBtn);
  resetBtn = $("#resetBtn");
  $("#resetBtn")
      .attr("value", lang.LANG_CONFIG_FWUPD_RESET)
      .click(ErrorFinishFwUpdate);
  $("#FileBrowse")
      .click(function(e) { $(this).attr("value", null); })
      .change(function() { FileExist = checkfile(); });
  $("#fwmsg").hide();
  $("#fwerror").hide();
  UploadEnable(true);
  OutputString();
  CheckUserPrivilege(PrivilegeCallBack);
};
function updateInfo() {
  // get the firmware update status
  GetFwInfo();
  GetUpdateOptions();
}
function GetUpdateOptions() {
  Loading(true);
  var ajax_url = '/redfish/v1/UpdateService';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : onGetUpdateResponse,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_FIRMWARE_INFO_GET_FAILED);
    }
  });
}
function onGetUpdateResponse(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var res = JSON.parse(arg.responseText);
    ApplyTime = res.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
    document.getElementById("bmc_recovery_check").checked =
        res.HttpPushUriTargetsBusy;
  }
}
function setFirmwarUpdateOptionReset() {
  Loading(true);
  document.getElementById("bmc_active_check").disabled = true;
  document.getElementById("FileBrowse").disabled = true;
  document.getElementById("uploadBtn").disabled = true;
  ApplyTime = document.getElementById("bmc_active_check").checked == false
                  ? 'OnReset'
                  : 'Immediate';
  var ajax_url = '/redfish/v1/UpdateService';
  var data = {
    "HttpPushUriOptions" : {"HttpPushUriApplyTime" : {"ApplyTime" : ApplyTime}}
  };
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    parameters : JSON.stringify(data),
    onSuccess : function() {
      document.getElementById("FileBrowse").disabled = false;
      document.getElementById("uploadBtn").disabled = false;
      document.getElementById("bmc_active_check").disabled = false;
      firmwareUpdateOptionModified = true;
      Loading(false);
      alert(lang.LANG_CONFIG_FWUPD_UPDATE_OPTION);
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      document.getElementById("FileBrowse").disabled = false;
      document.getElementById("uploadBtn").disabled = false;
      document.getElementById("bmc_active_check").disabled = false;
      alert(lang.LANG_CONFIG_FWUPD_UPDATE_OPTION_FAILED);
    }
  });
}
function setFirmwarUpdateOptionRecovery() {
  Loading(true);
  document.getElementById("bmc_recovery_check").disabled = true;
  document.getElementById("FileBrowse").disabled = true;
  document.getElementById("uploadBtn").disabled = true;
  var target = document.getElementById("bmc_recovery_check").checked;
  var HttpPushUriTargets = target ? [ "bmc_recovery" ] : [];
  var ajax_url = '/redfish/v1/UpdateService';
  var data = {"HttpPushUriTargetsBusy" : target};
  if (HttpPushUriTargets.length) {
    data["HttpPushUriTargets"] = HttpPushUriTargets;
  }
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    parameters : JSON.stringify(data),
    onSuccess : function() {
      document.getElementById("FileBrowse").disabled = false;
      document.getElementById("uploadBtn").disabled = false;
      document.getElementById("bmc_recovery_check").disabled = false;
      Loading(false);
      alert(lang.LANG_CONFIG_FWUPD_UPDATE_OPTION);
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      document.getElementById("FileBrowse").disabled = false;
      document.getElementById("uploadBtn").disabled = false;
      document.getElementById("bmc_recovery_check").disabled = false;
      alert(lang.LANG_CONFIG_FWUPD_UPDATE_OPTION_FAILED);
    }
  });
}
function UploadEnable(enable) {
  var dropzone = document.documentElement;
  var uploader = $("#fwUpdButtons");
  var curstatus = $("#fwUpdStatus");
  if (enable) {
    $("#FileBrowse").val(null);
    dropzone.ondragover = function(e) {
      e.stopPropagation();
      e.preventDefault();
    };
    dropzone.ondragenter = function(e) {
      e.stopPropagation();
      e.preventDefault();
    };

    dropzone.ondrop = function(e) {
      e.stopPropagation();
      e.preventDefault();

      var filesArray = e.dataTransfer.files;
      if (filesArray.length > 1) {
        return false;
      }
      setFwUpdateOptions(filesArray[0]);
    };
    uploader.show();
    curstatus.hide();
  } else {
    dropzone.ondrop = function(e) {};
    dropzone.ondragover = function(e) {};
    dropzone.ondragenter = function(e) {};
    uploader.hide();
    curstatus.show();
  }
}
function updateFirmwareOptionToOnReset(file) {
  // If user doesn't modify any firmware update option, set OnReset as default
  $('#bmc_active_check').prop("disabled", true);
  $('#bmc_recovery_check').prop("disabled", true);
  if (!firmwareUpdateOptionModified && ApplyTime != "OnReset") {
    var ajax_url = '/redfish/v1/UpdateService';
    var data = {
      "HttpPushUriOptions" :
          {"HttpPushUriApplyTime" : {"ApplyTime" : "OnReset"}}
    };
    var ajaxReq = new Ajax.Request(ajax_url, {
      method : 'PATCH',
      parameters : JSON.stringify(data),
      onSuccess : function() { continueFirmwareFileUpload(file); },
      onFailure : function() {
        Loading(false);
        reset_page();
        alert(lang.LANG_CONFIG_OOB_FWUPD_ERROR);
        $('#bmc_active_check').prop("disabled", false);
        $('#bmc_recovery_check').prop("disabled", false);
      }
    });
  } else {
    continueFirmwareFileUpload(file);
  }
}
function continueFirmwareFileUpload(file) {
  var CSRFTOKEN = getCSRFToken();
  var ajax_url = "/redfish/v1/UpdateService";
  $.ajax({
    url : ajax_url,
    async : false,
    headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
    type : "POST",
    data : file,
    contentType : 'application/octet-stream',
    processData : false,
    cache : false,
    success : function(data, status, xhr) {
      Loading(false);
      $("#fwupload-value").text(lang.LANG_CONFIG_FWUPD_DONE);
      if (firmwareUpdateOptionModified && ApplyTime == "Immediate") {
        $("#fwmsg-value")
            .text(lang.LANG_CONFIG_OOB_FWUPD_SYSTEM_RESTART)
            .addClass('fwupd-active');
      } else {
        $("#fwmsg-value")
            .text(lang.LANG_CONFIG_OOB_FWUPD_READY +
                  lang.LANG_CONFIG_OOB_READY_START)
            .addClass('fwupd-active');
      }
      $('#bmc_active_check').prop("disabled", true);
      $('#bmc_recovery_check').prop("disabled", true);
      $("#fwmsg").show();
      $("#fwmsg-value").show();
      alert(lang.LANG_CONFIG_FWUPD_SUCCESS, {
        title : lang.LANG_GENERAL_SUCCESS,
      });
    },
    error : function(data) {
      if (data.status == 401) {
        clearSessionInfo();
        location.href = "/";
      } else {
        Loading(false);
        $('#bmc_active_check').prop("disabled", false);
        $('#bmc_recovery_check').prop("disabled", false);
        reset_page();
        alert(lang.LANG_CONFIG_OOB_FWUPD_ERROR);
      }
    }
  });
}
function setFwUpdateOptions(file) {
  // By default firmware update option will be On Reset
  // Display confirmation alert if firmware update option set to Reset Immediate
  // If user doesn't modify any firmware update option, OnReset option will..
  // ..be set as default option in updateFirmwareOptionToOnReset function
  if (firmwareUpdateOptionModified && ApplyTime == "Immediate") {
    UtilsConfirm(lang.LANG_CONFIG_OOB_FWUPD_RESET_IMMEDIATE_ALERT,
                 {onOk : function() { updateFirmwareUpdateProgress(file); }});
  } else {
    updateFirmwareUpdateProgress(file);
  }
}
function updateFirmwareUpdateProgress(file) {
  $("#fwUpdButtons").hide();
  $("#fwUpdStatus").show();
  $("#fwupload-value").text("Uploading...");
  UploadEnable(false);
  // WEBUI will hang while uploading firmware file
  // So added timeout to set the Uploading status in UI before upload starts
  setTimeout(function() { updateFirmwareOptionToOnReset(file); }, 1500);
}
function OutputString() {
  document.getElementById("submenu_div").textContent =
      lang.LANG_CONFIG_SUBMENU_FWUPD;
  document.getElementById("desc_p").textContent = lang.LANG_CONFIG_FWUPD_DESC;
  document.getElementById("submenu_legend").textContent =
      lang.LANG_CONFIG_SUBMENU_FWUPD;
  document.getElementById("fw_rev_span").textContent =
      lang.LANG_SYS_INFO_FW_REV;
  document.getElementById("build_time_span").textContent =
      lang.LANG_SYS_INFO_BUILD_TIME;
  document.getElementById("drop_file").textContent =
      lang.LANG_CONFIG_FWUPD_DROP_FILE;
  document.getElementById("fwupload-label").textContent =
      lang.LANG_CONFIG_FWUPD_UPLOAD;
  document.getElementById("fwerror-label").textContent =
      lang.LANG_CONFIG_FWUPD_ERROR;
  document.getElementById("fwerror-value").textContent =
      lang.LANG_CONFIG_FWUPD_PENDING;
  document.getElementById("fwmsg-value").textContent =
      lang.LANG_CONFIG_FWUPD_PENDING;
  if (PFRSupported) {
    document.getElementById("BMC_Update_lbl").textContent =
        lang.LANG_CONFIG_FWUPD_OPTION_LABEL;
    document.getElementById("bmc_active_option").textContent =
        lang.LANG_BIOS_ACTIVE_REGION_VALUE;
    document.getElementById("bmc_recovery_option").textContent =
        lang.LANG_BIOS_RECOVERY_REGION_VALUE;
  }
}
function PrivilegeCallBack(Privilege) {
  // full access
  uploadBtn = $("#uploadBtn");
  FileBrowse = $("#FileBrowse");
  if (Privilege == '04') {
    uploadBtn.prop("disabled", true);
    FileBrowse.prop("disabled", false);
    updateInfo();
  }
  // only view
  else if (Privilege == '02' || Privilege == '03') {
    uploadBtn.prop("disabled", true);
    FileBrowse.prop("disabled", true);
    document.getElementById('bmc_recovery_check').disabled = true;
    document.getElementById('bmc_active_check').disabled = true;
    updateInfo();
  }
  // no access
  else {
    location.href = SubMainPage;
    uploadBtn.prop("disabled", true);
    FileBrowse.prop("disabled", true);
  }
}
function PrivilegeCallBackFileReady(Privilege) {
  // full access
  if (Privilege == '04') {
    // uploadBtn.prop("disabled", false);
    FileBrowse.prop("disabled", false);
  } else {
    uploadBtn.prop("disabled", true);
    FileBrowse.prop("disabled", true);
    FileBrowse.attr("value", null);
  }
}
function GetFwInfo() {
  Loading(true);
  var ajax_url = '/redfish/v1/Managers/bmc/';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : ParseFWVersion,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_FIRMWARE_INFO_GET_FAILED);
    }
  });
}
function ParseFWVersion(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var res = JSON.parse(arg.responseText);
    var dateString = res.Oem.OpenBmc.FirmwareBuildTime;
    var con_date =
        new Date(dateString.substring(0, 4), dateString.substring(4, 6) - 1,
                 dateString.substring(6, 8), dateString.substring(8, 10),
                 dateString.substring(10, 12), dateString.substring(12)) +
        "";
    var fw_version = res.FirmwareVersion;
    $('#curFwTS').text(con_date.split(" ").slice(1, 5).join(" ") + " UTC");
    $('#curFwVer').text(fw_version);
    GetFwUpdateImageStatus(res);
  }
}

function FW_UploadBtn() {
  FileExist = checkfile();
  if (FileExist == -1) {
    return;
  }
  Loading(true);
  setFwUpdateOptions(FileExist);
}
function reset_page() {
  UploadEnable(true);
  CheckUserPrivilege(PrivilegeCallBack);
}
function reset_file_upload() {
  Loading(false);
  $('#FileBrowse').val(null);
  $("#uploadBtn").prop("disabled", true);
}
function ErrorFinishFwUpdate() {
  resetBtn.disabled = true;
  $("#fwready-value").text(lang.LANG_CONFIG_FWUPD_DONE);
  // allow the BMC state transitions to complete and get the status again
  setTimeout(GetFwUpdateStatus, 1500);
}
function GetFwUpdateStatus() {}
function GetFwUpdateImageStatus(res) {
  if (!res) {
    return;
  }
  var softwareImages = res.Links.SoftwareImages;
  if (softwareImages.length) {
    for (var i = 0; i < softwareImages.length; i++) {
      if (softwareImages[i]["@odata.id"].indexOf("bmc_active") == -1 &&
          softwareImages[i]["@odata.id"].indexOf("bmc_recovery") == -1) {
        checkFwImageUploaded(true);
      }
    }
  } else {
    checkFwImageUploaded(false);
  }
}
function checkFwImageUploaded(val) {
  if (val) {
    UploadEnable(false);
    $("#fwupload-value").text(lang.LANG_CONFIG_FWUPD_DONE);
    $("#fwmsg-value")
        .text(lang.LANG_CONFIG_OOB_FWUPD_READY +
              lang.LANG_CONFIG_OOB_READY_START)
        .addClass('fwupd-active');
    $('#bmc_active_check').prop("disabled", true);
    $('#bmc_recovery_check').prop("disabled", true);
    $("#fwmsg").show();
    $("#fwmsg-value").show();
  } else {
    $('#bmc_active_check').prop("disabled", false);
    $('#bmc_recovery_check').prop("disabled", false);
    $("#fwmsg").hide();
    $("#fwmsg-value").hide();
  }
}
function checkfile() {
  $("#uploadBtn").prop("disabled", true);
  Loading(true);
  FileBrowse = $("#FileBrowse");
  var input_file = FileBrowse.val();
  var file;
  if (input_file.length == 0) {
    return -1;
  }
  var files = FileBrowse.prop("files");
  if (!files) {
    alert(lang.LANG_CONFIG_FWUPD_WARNING_BROWSER);
    return -1;
  } else if (!files[0]) {
    return -1;
  }

  CheckUserPrivilege(PrivilegeCallBackFileReady);
  if (FileBrowse.val() == null) {
    return -1;
  }
  file = files[0];
  Loading(false);
  $("#uploadBtn").prop("disabled", false);
  $("#fwupload-value").text("");
  return file;
}
})(jQuery);
