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
  getDiagState();
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
    if (sysDiagResDiagState.Oem.OpenBmc.hasOwnProperty("FileName")) {
      var logTimeInFilename = sysDiagResDiagState.Oem.OpenBmc.FileName;
      lastLink.style.display = null;
      lastLink.href = sysDiagResDiagState.Actions.Oem["#LogCollector.Download"].target;
      lastLink.download = logTimeInFilename;
      lastLink.textContent = logTimeInFilename;
      var lastTimeDate = logTimeInFilename.slice(10,20);
      var lastTimeTime = logTimeInFilename.slice(21,-4).replaceAll('_', ':');;
      lastTime.textContent = lastTimeDate + ' ' + lastTimeTime;
    }else {
      lastTime.textContent =
          lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_NONETEXT;
    }
  }
}

function genDebugLog(){
  Loading(true);
  document.getElementById("runBtn").disabled = true;
  lastLink.style.display = "none";
  lastTime.textContent = lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_RUNNING;
  var ajaxUrl =
      "/redfish/v1/Systems/system/LogServices/LogCollector/Actions/Oem/LogCollector.OnDemand";
  var myAjax = new Ajax.Request(ajaxUrl, {
    method : 'POST',
    contentType : "application/json",
    parameters : JSON.stringify({"data" : []}),
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
