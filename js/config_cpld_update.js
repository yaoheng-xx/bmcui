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
var ApplyTime;
var taskURI;
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
      .click(askConfirmation);
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
  GetUpdateStatus();
}

function GetUpdateStatus() {
  var ajax_url = "/redfish/v1/TaskService/Tasks/";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    contentType : "application/json",
    onComplete : getUpdateStatusResponse,
    onFailure: function() {
      //Get progress error.
    }
  });
}

function getUpdateStatusResponse(args) {
  Loading(false);
  if (args.readyState == 4 && args.status == 200) {
    var res = JSON.parse(args.responseText);
    var cnt = res["Members@odata.count"];
    if (cnt != 0) {
      if (ReadCookie("CPLDTASKURI") != null) {
        taskURI = ReadCookie("CPLDTASKURI");
        var members = res["Members"];
        for (var i = 0; i < cnt; i++) {
          if (members[i]["@odata.id"] == taskURI) {
            checkStartTime(taskURI);
          }
        }
      }

    } else if (cnt == 0 && ReadCookie("CPLDTASKURI") != null) {
      EraseCookie("CPLDTASKURI");
      EraseCookie("CPLDSTARTTIME");
    }
  }
}
function checkStartTime(taskURI) {
  var ajax_url = taskURI;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    contentType : "application/json",
    onComplete : checkStartTimeResp,
    onFailure: function() {
      //Get start Time error.
    }
  });
}

function checkStartTimeResp(args) {
  Loading(false);
  if (args.readyState == 4 && args.status == 200) {
    var res = JSON.parse(args.responseText);
    if (ReadCookie("CPLDSTARTTIME") != null) {
      var st = ReadCookie("CPLDSTARTTIME");
      if (res.StartTime == st) {
        LoadFileStart();
        getUpdateProgress();
      } else {
        EraseCookie("CPLDSTARTTIME");
        EraseCookie("CPLDTASKURI");
      }
    }
  }
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
  document.getElementById("fwready-value").textContent =
      lang.LANG_CONFIG_FWUPD_PENDING;
  document.getElementById("fwerror-label").textContent =
      lang.LANG_CONFIG_FWUPD_ERROR;
  document.getElementById("fwerror-value").textContent =
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
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      document.getElementById("FileBrowse").disabled = false;
      document.getElementById("uploadBtn").disabled = false;
      document.getElementById("cpld_recovery_check").disabled = false;
      alert("Failed to set CPLD Update Options!");
      document.getElementById("cpld_recovery_check").checked = false;
    }
  });
}

function updateCPLDReset() {
  Loading(true);
  document.getElementById("cpld_defer_check").disabled = true;
  document.getElementById("FileBrowse").disabled = true;
  document.getElementById("uploadBtn").disabled = true;
  ApplyTime = document.getElementById("cpld_defer_check").checked == false
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
  if (xml_obj.HttpPushUriTargetsBusy && xml_obj.HttpPushUriTargets == "cpld_recovery") {
    document.getElementById("cpld_recovery_check").checked = true;
  } else {
    document.getElementById("cpld_recovery_check").checked = false;
  }

  ApplyTime = xml_obj.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
  if (ApplyTime == "OnReset") {
    document.getElementById("cpld_defer_check").checked = false;
  } else {
    document.getElementById("cpld_defer_check").checked = true;
  }
}

function LoadFileStart() {
  UploadEnable(false);
  $('#cpld_defer_check').prop("disabled", true);
  $('#cpld_recovery_check').prop("disabled", true);
  $("#fwready-value").hide();
}

function askConfirmation(file) {
  Loading(false);
  var fw_file = document.getElementById("FileBrowse").files[0];
  UtilsConfirm(
      lang.LANG_CONFIG_OOB_FWUPD_CPLD_RESET_IMMEDIATE_ALERT_CONFIRM,
      {
        onOk : function() {
          LoadFileStart();
          $("#fwupload-value").text(lang.LANG_CONFIG_OOB_FWUPD_UPLOADING);
          setTimeout(function() {
            if (fw_file) {
              UploadStart(fw_file);
            } else if (file) {
              UploadStart(file);
            } else {
              alert("Error in CPLD Firmware Update!");
              reset_page();
            }
          }, 1000);
        },
        onClose : function() { console.log("closed"); }
      });
}

function UploadStart(fw_file) {
  var CSRFTOKEN = getCSRFToken();
  var ajax_url = "/redfish/v1/UpdateService";
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
      if (xhr.readyState == 4 && xhr.status == 202) {
        taskURI = data["@odata.id"];
        CreateCookie("CPLDTASKURI", taskURI);
        setStartTimeCookie();
        getUpdateProgress();
      }
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
}
function setStartTimeCookie() {
  var ajax_url = taskURI;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    contentType : "application/json",
    onComplete : setStartTimeCookieResp,
    onFailure: function() {
      //Get startTime error.
    }
  });
}
function setStartTimeCookieResp(args) {
  Loading(false);
  if (args.readyState == 4 && args.status == 200) {
    var res = JSON.parse(args.responseText);
    CreateCookie("CPLDSTARTTIME", res.StartTime);
  }
}
function getUpdateProgress() {
  var ajax_url = taskURI;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    contentType : "application/json",
    onComplete : getProgressResponse,
    onFailure: function() {
      //Get progress error.
    }
  });
}
function getProgressResponse(args) {
  Loading(false);
  if (args.readyState == 4 && args.status == 200) {
    var res = JSON.parse(args.responseText);
    if (res.PercentComplete == 100 || res.TaskState == "Stopping") {
      $("#fwupload-value").text(lang.LANG_CONFIG_FWUPD_DONE);
      if (ApplyTime == "Immediate") {
        $("#fwready-value").text(lang.LANG_CONFIG_OOB_FWUPD_SYSTEM_RESTART)
          .addClass('fwupd-active');
      } else {
        $("#fwready-value")
        .text(lang.LANG_CONFIG_OOB_READY_START)
        .addClass('fwupd-active');
      }
      $("#fwready-value").show();
    } else {
      $("#fwupload-value").text(lang.LANG_CONFIG_OOB_FWUPD_UPLOADING);
      setTimeout(function () {
        getUpdateProgress();
      }, 2000);
    }
  }
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
