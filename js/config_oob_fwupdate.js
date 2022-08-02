/* configuration OOB firmware update page */

(function($) {

"use strict";
$(document).ready(function() { $.PageInit(); });
var lang;
if (parent.lang) {
  lang = parent.lang;
}
var PFRSupported = 0;
var capFileFlag = 0;
var uploadBtn;
var FileBrowse;
var last_state;
$.PageInit = function() {
  document.title = lang.LANG_CONFIG_SUBMENU_OOB_FWUPD;
  // GetBoardInfo();
  if (PFRSupported) {
    top.frames.topmenu.document.getElementById("frame_help").src =
        "../help/" + lang_setting + "/config_oob_fwupdate_2_hlp.html";
    // $("#ImageType").hide();
  } else {
    $("#_imagetype").change(UpdateImageType);
    // $("#PFRActVer").hide();
    // $("#PFRRecoveryVer").hide();
    $("#bios_defer_option").hide();
    $("#Bios_defer_check").hide();
    // $("#Bios_nvram_check").hide();
    // $("#bios_nvram_option").hide();
    top.frames.topmenu.document.getElementById("frame_help").src =
        "../help/" + lang_setting + "/config_oob_fwupdate_hlp.html";
  }
  document.getElementById("Bios_nvram_check")
      .addEventListener("change", setBIOSRegionOptionReset);
  document.getElementById("Bios_backup_check")
      .addEventListener("change", setBIOSRegionOptionRecovery);
  $("#uploadBtn")
      .attr("value", lang.LANG_COMMON_BTN_UPLOAD)
      .click(askConfirmation);
  $("#FileBrowse")
      .click(function(e) { $(this).attr("value", null); })
      .change(function() { checkfile(); });
  $("#FileBrowse").prop("disabled", false);
  $("#fwerror").hide();
  $("#Enforce_Password").hide();
  UploadEnable(true);
  OutputString();
  CheckUserPrivilege(PrivilegeCallBack);
};

function updateInfo() {
  // get the firmware update status
  GetFwInfo();
  GetMEInfo();
  GetUpdateOptions();
}

function setBIOSRegionOptionRecovery() {
  Loading(true);
  document.getElementById("Bios_backup_check").disabled = true;
  document.getElementById("FileBrowse").disabled = true;
  document.getElementById("uploadBtn").disabled = true;
  var target = document.getElementById("Bios_backup_check").checked;
  var HttpPushUriTargets = target ? [ "bios_recovery" ] : [];
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
      document.getElementById("Bios_backup_check").disabled = false;
      Loading(false);
      alert("Successfully Updated BIOS Region Options!");
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      document.getElementById("FileBrowse").disabled = false;
      document.getElementById("uploadBtn").disabled = false;
      document.getElementById("Bios_backup_check").disabled = false;
      alert("Failed to set BIOS Region Options!");
    }
  });
}

function setBIOSRegionOptionReset() {
  Loading(true);
  document.getElementById("Bios_nvram_check").disabled = true;
  document.getElementById("FileBrowse").disabled = true;
  document.getElementById("uploadBtn").disabled = true;
  var ApplyTime = document.getElementById("Bios_nvram_check").checked == false
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
      document.getElementById("Bios_nvram_check").disabled = false;
      Loading(false);
      alert("Successfully Updated BIOS Region Options!");
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      document.getElementById("FileBrowse").disabled = false;
      document.getElementById("uploadBtn").disabled = false;
      document.getElementById("Bios_nvram_check").disabled = false;
      alert("Failed to set BIOS Region Options!");
    }
  });
}

function GetUpdateOptions() {
  Loading(true);
  var ajax_url = '/redfish/v1/UpdateService';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : onGetUpdateResponse,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() { Loading(false); }
  });
}

function onGetUpdateResponse(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var res = JSON.parse(arg.responseText);
    var ApplyTime = res.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
    document.getElementById("Bios_backup_check").checked =
        res.HttpPushUriTargetsBusy;
    if (ApplyTime == "OnReset") {
      document.getElementById("Bios_nvram_check").checked = false;
    } else {
      document.getElementById("Bios_nvram_check").checked = true;
    }
  }
}

var ImageType_t = {BIOS : 2, ME : 3, FD : 4};

var SelectedImageType = ImageType_t.BIOS;
function UpdateImageType() {
  var value = $(this).children('option:selected').val();
  if (value != ImageType_t.BIOS) {
    $("#BiosRegion").hide();
  } else {
    $('#BiosRegion').show();
  }
  SelectedImageType = value;
  $("#fwerror").hide();
  UploadEnable(true);
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
      askConfirmation(filesArray[0]);
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

function sendFile(file) {
  document.getElementById("fwready-value").textContent =
      lang.LANG_CONFIG_OOB_FWUPD_PENDING;
  LoadFileStart();
  FW_UploadBtn(file);
}

function OutputString() {
  document.getElementById("submenu_div").textContent =
      lang.LANG_CONFIG_SUBMENU_OOB_FWUPD;
  document.getElementById("desc_p").textContent =
      lang.LANG_CONFIG_OOB_FWUPD_DESC;
  document.getElementById("submenu_legend").textContent =
      lang.LANG_CONFIG_SUBMENU_OOB_FWUPD;
  document.getElementById("bios_rev_span").textContent =
      lang.LANG_SYS_INFO_BIOS_REV;
  document.getElementById("me_rev_span").textContent =
      lang.LANG_SYS_INFO_ME_FW_REV;
  document.getElementById("bios_me_image_upload").textContent =
      lang.LANG_CONFIG_OOB_FWUPD_FILE;
  document.getElementById("fwupload-label").textContent =
      lang.LANG_CONFIG_OOB_FWUPD_UPLOAD;
  document.getElementById("fwready-label").textContent =
      lang.LANG_CONFIG_OOB_FWUPD_READY;
  document.getElementById("fwready-value").textContent =
      lang.LANG_CONFIG_OOB_FWUPD_PENDING;
  document.getElementById("fwerror-label").textContent =
      lang.LANG_CONFIG_OOB_FWUPD_ERROR;
  document.getElementById("fwerror-value").textContent =
      lang.LANG_CONFIG_OOB_FWUPD_PENDING;
  document.getElementById("Bios_Update_lbl").textContent =
      lang.LANG_BIOS_UPDATE_OPTIONS_LABLE_NAME;
  document.getElementById("bios_nvram_option").textContent =
      lang.LANG_BIOS_ACTIVE_REGION_VALUE;
  document.getElementById("bios_backup_option").textContent =
      lang.LANG_BIOS_BACKUP_REGION_VALUE;
  document.getElementById("Bios_password_lbl").textContent =
      lang.LANG_BIOS_LOGIN_PASSWORD;

  if (PFRSupported) {
    document.getElementById("bios_defer_option").textContent =
        lang.LANG_BIOS_DEFER_RESET_VALUE;
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
    // CheckBios_OOB_Capabilities();
  }
  // only view
  else if (Privilege == '02' || Privilege == '03') {
    document.getElementById('Bios_backup_check').disabled = true;
    document.getElementById('Bios_nvram_check').disabled = true;
    uploadBtn.prop("disabled", true);
    FileBrowse.prop("disabled", true);
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
    uploadBtn.prop("disabled", false);
    FileBrowse.prop("disabled", false);
  } else {
    uploadBtn.prop("disabled", true);
    FileBrowse.prop("disabled", true);
    FileBrowse.attr("value", null);
  }
}

function FwUpdateAbort(jqXHR) {
  if (jqXHR.status == 401) {
    clearSessionInfo();
    location.href = "/";
  }
}

function GetFwInfo() {
  Loading(true);
  var url = '/redfish/v1/UpdateService/FirmwareInventory/bios_active';
  $.ajax(url, {
    type : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    success : ParseFWVersion,
    error : FwUpdateAbort
  });
}

function ParseFWVersion(arg) {
  Loading(false);
  $('#curBIOSVer').text(arg.Version);
}

function GetMEInfo() {
  Loading(true);
  var url = '/redfish/v1/UpdateService/FirmwareInventory/me';
  $.ajax(url, {
    type : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    success : ParseMEVersion,
    error : FwUpdateAbort
  });
}

function ParseMEVersion(arg) {
  Loading(false);
  $('#curMEVer').text(arg.Version);
}

function FW_UploadBtn(file) {
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
      updateUploadCompleted();
      var alertStr;
      if (capFileFlag) {
        alertStr = lang.LANG_CONFIG_OOB_SAVED;
        capFileFlag = 0;
      } else {
        alertStr = lang.LANG_CONFIG_OOB_UPLOAD_ALERT;
      }
      alert(alertStr);
    },
    error : function(data) {
      if (data.status == 401) {
        clearSessionInfo();
        location.href = "/";
      } else {
        reset_file_upload();
        UploadEnable(true);
        alert(lang.LANG_CONFIG_OOB_UPLOAD_ERROR);
      }
    }
  });
}

function updateUploadCompleted() {
  $('#fwupload-value').text(lang.LANG_CONFIG_OOB_COMPLETED);
  $('#fwready-value').text(lang.LANG_CONFIG_OOB_COMPLETED);
}

function askConfirmation(file) {
  var fw_file = document.getElementById("FileBrowse").files[0];
  var hintStr;
  if (capFileFlag) {
    hintStr = lang.LANG_CONFIG_OOB_CONFIRM_STRING1;
  } else {
    hintStr = lang.LANG_CONFIG_OOB_CONFIRM_STRING2;
  }
  UtilsConfirm(hintStr, {
    onOk : function() {
      if (fw_file) {
        sendFile(fw_file);
      } else if (file) {
        sendFile(file);
      } else {
        alert(lang.LANG_CONFIG_OOB_UPLOAD_ERROR);
      }
    },
    onClose : function() { console.log("closed"); }
  });
}

function LoadFileStart() {
  last_state = null;
  UploadEnable(false);
  $('#Bios_nvram_check').prop("disabled", true);
  $('#Bios_backup_check').prop("disabled", true);
  $('#Bios_defer_check').prop("disabled", true);
}

function reset_page() {
  UploadEnable(true);
  CheckUserPrivilege(PrivilegeCallBack);
}

function reset_file_upload() {
  $('#FileBrowse').val(null);
  $("#uploadBtn").prop("disabled", true);
}

last_state = null;
function checkfile() {
  FileBrowse = $("#FileBrowse");
  var input_file = FileBrowse.val();
  var file;
  if (input_file.length == 0) {
    return -1;
  }
  if (!window.FileReader) {
    // If browser does not support FileReader, just bypass fw size check.
    alert(lang.LANG_CONFIG_FWUPD_WARNING_NO_SUPPORT);
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
  if (FileBrowse.val() == null)
    return -1;
  file = files[0];
  // capsule file would not exceed 64MB. If size is larger than that, wrong file
  // is selected.
  if (file.size > (64 * 1024 * 1024)) {
    reset_file_upload();
    alert(lang.LANG_CONFIG_SDRFW_WARNING_SELECT);
    return -1;
  }

  if (file.name.split('.').pop() == "cap" ||
      file.name.split('.').pop() == "CAP") {
    capFileFlag = 1;
  } else {
    capFileFlag = 0;
  }
  return file;
}
})(jQuery);
