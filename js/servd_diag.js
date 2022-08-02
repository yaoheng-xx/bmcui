"use strict";
var lang;
var lang_setting;
/* Server Diagnostics -- System Diagnostics page for download debug log.*/

window.addEventListener('load', pageInit);
if (parent.lang) { lang = parent.lang; }
var lastTime;
var lastLink;
function pageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/servd_diag_hlp.html";
  outputString();
  CheckUserPrivilege(privilegeCallBack);
  var runBtn = document.getElementById("runBtn");
  runBtn.setAttribute("value",
                      lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_BTN);
  runBtn.onclick = genDebugLog;
  lastTime = document.getElementById("lastTime");
  lastLink = document.getElementById("lastLink");
}
function outputString() {
  document.getElementById("title_div").textContent =
      lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_TITLE;
  document.getElementById("interpretion_td").textContent =
      lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_INTERPRETION;
  document.getElementById("caption_legend").textContent =
      lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_CAPTION;
  document.getElementById("lastlog_td").textContent =
      lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_LASTLOG;
}
function privilegeCallBack(privilege) {
  if (privilege == '04' || privilege == '03') {
    runBtn.disabled = false;
  } else if (privilege == '02') {
    runBtn.disabled = true;
  } else {
    location.href = SubMainPage;
    runBtn.disabled = true;
    return;
  }
}
function getDiagState(){
  Loading(true);
  var ajaxUrl = "/redfish/v1/Systems/system/LogServices/LogCollector";
  var myAjax = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : replyDiagState,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_COMMON_ERROR_MESSAGE);
    }
  });
}
function replyDiagState(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var sysDiagResDiagState = JSON.parse(arg.responseText);
    if (sysDiagResDiagState.hasOwnProperty("DateTime")) {
      var logTime = sysDiagResDiagState.DateTime;
      if (!logTime) {
        lastLink.disabled = true;
        lastLink.className = 'debugLogDownloadBtn';
      } else {
        var logTimeToDisplay = logTime.split('+')[0].replace('T', '_');
        lastTime.textContent = logTimeToDisplay;
        lastLink.disabled = false;
        lastLink.className += ' debugLogDownloadBtnActive';
        var downloadUrl =
            sysDiagResDiagState.Actions.Oem["#LogCollector.Download"].target;
        lastLink.value = 'DebugLogs_' + logTimeToDisplay + '.tar';
        lastLink.onclick =
            function() { downloadLogs(downloadUrl, logTimeToDisplay) };
      }
    } else {
      lastTime.textContent =
          lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_NONETEXT;
    }
  }
}

function downloadLogs(ajaxUrl, logTime) {
  Loading(true);
  var myAjax = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(response) { handleDownloadedLogs(response, logTime); },
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_COMMON_ERROR_MESSAGE);
    }
  });
}

function handleDownloadedLogs(arg, logTime) {
  if (arg.readyState == 4 && arg.status == 200) {
    var sysDiagResDiagState = arg.responseText;
    var zip = new JSZip();
    zip.file("DebugLogs.html", sysDiagResDiagState);
    zip.generateAsync({type : "blob"})
        .then(function(blob) { saveAs(blob, "DebugLogs_" + logTime + ".tar"); },
              function(err) { alert(err); });
    Loading(false);
  }
}

function genDebugLog(){
  Loading(true);
  document.getElementById("runBtn").disabled = true;
  lastTime.textContent = "";
  lastLink.disabled = true;
  lastLink.className = 'debugLogDownloadBtn';
  var ajaxUrl =
      "/redfish/v1/Systems/system/LogServices/LogCollector/Actions/Oem/LogCollector.OnDemand";
  var myAjax = new Ajax.Request(ajaxUrl, {
    method : 'POST',
    contentType : "application/json",
    parameters : JSON.stringify({"data" : []}),
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function() {
      getDiagState();
      alert(lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_LOGS_SUCCESS)
      document.getElementById("runBtn").disabled = false;
    },
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_COMMON_ERROR_MESSAGE);
      document.getElementById("runBtn").disabled = false;
    }
  });
}
