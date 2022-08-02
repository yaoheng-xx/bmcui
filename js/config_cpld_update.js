/* configuration firmware update page */
(function($) {

"use strict";
$( document ).ready(function() { $.PageInit(); });
var lang;
if (parent.lang) {
  lang = parent.lang;
}
var uploadBtn;
var FileBrowse;
var resetBtn;
$.PageInit = function() {
  document.title = lang.LANG_CONFIG_SUBMENU_CPLD_UPD;
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/config_cpld_help.html";
  document.getElementById("cpld_recovery_check")
      .addEventListener("change", updateCPLDRecovery);
  document.getElementById("cpld_defer_check")
      .addEventListener("change", updateCPLDReset);
  $("#uploadBtn")
      .attr("value", lang.LANG_COMMON_BTN_UPLOAD)
      .click(FW_UploadBtn);
  resetBtn = $("#resetBtn");
  $("#resetBtn")
      .attr("value", lang.LANG_CONFIG_FWUPD_RESET)
      .click(ErrorFinishFwUpdate);
  $("#FileBrowse")
      .click(function(e) { $(this).attr("value", null); })
      .change(function() { checkfile(); });
  $("#fwmsg").hide();
  $("#fwerror").hide();
  UploadEnable(true);
  OutputString();
  CheckUserPrivilege(PrivilegeCallBack);
};

function
updateInfo() {
  // get the firmware update status
  GetFwInfo();
  GetCPLDUpdateOption();
}

function
    UploadEnable(enable) {
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
      sendFile(filesArray[0]);
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
  var fw_file = document.getElementById("FileBrowse").files[0];
  if (fw_file) {
    LoadFileStart();
    UploadStart(fw_file);
  } else if (file) {
    LoadFileStart();
    UploadStart(file);
  } else {
    alert("Error in CPLD Firmware Update!");
    reset_page();
  }
}

function
OutputString() {
  document.getElementById("submenu_div").textContent =
      lang.LANG_CONFIG_SUBMENU_CPLD_UPD;
  document.getElementById("desc_p").textContent =
      lang.LANG_CONFIG_CPLD_UPD_DESC;
  document.getElementById("submenu_legend").textContent =
      lang.LANG_CONFIG_SUBMENU_CPLD_UPD;
  document.getElementById("cpld_rev_span").textContent =
      lang.LANG_SYS_INFO_CPLD_REV;
  document.getElementById("CPLD_Update_lbl").textContent =
      lang.LANG_CONFIG_CPLDUPD_OPTION_LABEL;
  document.getElementById("cpld_defer_option").textContent =
      lang.LANG_BIOS_ACTIVE_REGION_VALUE;
  document.getElementById("cpld_recovery_option").textContent =
      lang.LANG_BIOS_RECOVERY_REGION_VALUE;
  document.getElementById("drop_file").textContent =
      lang.LANG_CONFIG_FWUPD_DROP_FILE;
  document.getElementById("fwupload-label").textContent =
      lang.LANG_CONFIG_FWUPD_UPLOAD;
  document.getElementById("fwauthenticate-label").textContent =
      lang.LANG_CONFIG_FWUPD_AUTHENTICATE;
  document.getElementById("fwauthenticate-value").textContent =
      lang.LANG_CONFIG_FWUPD_PENDING;
  document.getElementById("fwprogram-label").textContent =
      lang.LANG_CONFIG_FWUPD_PROGRAM;
  document.getElementById("fwprogram-value").textContent =
      lang.LANG_CONFIG_FWUPD_PENDING;
  document.getElementById("fwready-label").textContent =
      lang.LANG_CONFIG_FWUPD_REBOOT;
  document.getElementById("fwready-value").textContent =
      lang.LANG_CONFIG_FWUPD_PENDING;
  document.getElementById("fwerror-label").textContent =
      lang.LANG_CONFIG_FWUPD_ERROR;
  document.getElementById("fwerror-value").textContent =
      lang.LANG_CONFIG_FWUPD_PENDING;
  document.getElementById("fwmsg-value").textContent =
      lang.LANG_CONFIG_FWUPD_PENDING;
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
    document.getElementById('cpld_recovery_check').disabled = true;
    document.getElementById('cpld_defer_check').disabled = true;
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
  Loading(false);
  if (jqXHR.status == 401) {
    clearSessionInfo();
    location.href = "/";
  }
}

function GetFwInfo() {
  Loading(true);
  var url = '/redfish/v1/UpdateService/FirmwareInventory/cpld_active';
  $.ajax(url, {
    type : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    success : ParseFWVersion,
    error : FwUpdateAbort
  });
}

function ParseFWVersion(xml_obj) {
  Loading(false);
  $('#curCPLDVer').text(xml_obj.Version);
  // GetFwUpdateStatus();
}

function updateCPLDRecovery() {
  Loading(true);
  document.getElementById("cpld_recovery_check").disabled = true;
  document.getElementById("FileBrowse").disabled = true;
  document.getElementById("uploadBtn").disabled = true;
  var target = document.getElementById("cpld_recovery_check").checked;
  var HttpPushUriTargets = target ? [ "cpld_recovery" ] : [];
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
      document.getElementById("cpld_recovery_check").disabled = false;
      Loading(false);
      alert("Successfully Updated CPLD Firmware Update Options!");
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      document.getElementById("FileBrowse").disabled = false;
      document.getElementById("uploadBtn").disabled = false;
      document.getElementById("cpld_recovery_check").disabled = false;
      alert("Failed to set CPLD Update Options!");
    }
  });
}

function updateCPLDReset() {
  Loading(true);
  document.getElementById("cpld_defer_check").disabled = true;
  document.getElementById("FileBrowse").disabled = true;
  document.getElementById("uploadBtn").disabled = true;
  var ApplyTime = document.getElementById("cpld_defer_check").checked == false
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
      document.getElementById("cpld_defer_check").disabled = false;
      Loading(false);
      alert("Successfully Updated CPLD Firmware Update Options!");
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      document.getElementById("FileBrowse").disabled = false;
      document.getElementById("uploadBtn").disabled = false;
      document.getElementById("cpld_defer_check").disabled = false;
      alert("Failed to set CPLD Update Options!");
    }
  });
}

function GetCPLDUpdateOption() {
  Loading(true);
  var url = '/redfish/v1/UpdateService';
  $.ajax(url, {
    type : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    success : ParseCPLDUpdateOptions,
    error : FwUpdateAbort
  });
}

function ParseCPLDUpdateOptions(xml_obj) {
  Loading(false);
  document.getElementById("cpld_recovery_check").checked =
      xml_obj.HttpPushUriTargetsBusy;
  var ApplyTime = xml_obj.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
  if (ApplyTime == "OnReset") {
    document.getElementById("cpld_defer_check").checked = false;
  } else {
    document.getElementById("cpld_defer_check").checked = true;
  }
}

function FW_UploadBtn(){
  var FileExist = checkfile();
  if (FileExist == -1) {
    return;
  }
  Loading(true);
  sendFile(FileExist);
}

function LoadFileStart() {
  UploadEnable(false);
  $('#cpld_defer_check').prop("disabled", true);
}

function UploadStart(fw_file) {
  Loading(false);
  $("#uploadBtn").prop("disabled", true);
  var CSRFTOKEN = getCSRFToken();
  var ajax_url = "/redfish/v1/UpdateService";
  UtilsConfirm(
      "After CPLD Firmware Update starts, BMC will hang for few minutes and reset automatically. Click OK to continue,or click Cancel to stop now.",
      {
        onOk : function() {
          $.ajax({
            url : ajax_url,
            async : false,
            headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
            type : "POST",
            data : fw_file,
            contentType : 'application/octet-stream',
            processData : false,
            cache : false,
            success : function(data, status, xhr) {
              alert(
                  "Firmware upload is complete and BMC will be hang for sometime and reset automatically. Please wait for few minutes for firmware update to complete. ",
                  {
                    title : lang.LANG_GENERAL_SUCCESS,
                    onClose : function() {
                      deleteAllCookies();
                      sessionStorage.clear();
                      location.href = "/page/login.html";
                    }
                  });
            },
            error : function(data) {
              if (data.status == 401) {
                clearSessionInfo();
                location.href = "/";
              } else {
                alert("Error in CPLD Firmware Update!");
                reset_page();
              }
            }
          });
        },
        onClose : function() { $("#uploadBtn").prop("disabled", false); }
      });
}

function reset_page() {
  UploadEnable(true);
  CheckUserPrivilege(PrivilegeCallBack);
}

function reset_file_upload() {
  $('#FileBrowse').val(null);
  $("#uploadBtn").prop("disabled", true);
}

function FinishFwUpdate() {}
function ErrorFinishFwUpdate() {
  FinishFwUpdate();
  resetBtn.disabled = true;
  $("#fwready-value").text(lang.LANG_CONFIG_FWUPD_DONE);
  // allow the BMC state transitions to complete and get the status again
  setTimeout(GetFwUpdateStatus, 1500);
}
function GetFwUpdateStatus() {}

function checkfile(){
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
  if (file.size > (20 * 1024 * 1024)) {
    reset_file_upload();
    alert(lang.LANG_CONFIG_SDRFW_WARNING_SELECT);
    return -1;
  }
  return file;
}
})(jQuery);
