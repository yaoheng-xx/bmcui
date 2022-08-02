"use strict";
/*
   global variables
*/
var gRebootTimeout = 0;
var gRebootDelayTimer = 0;
var lang;
var lang_setting;
window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }
function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/main_factorydefaults_hlp.html";
    // Get multi-language string
    document.title = lang.LANG_FACTORYDEFAULT_TITLE;
    document.getElementById("restoreBtn").value = lang.LANG_FACTORYDEFAULT_RESTORE;
    document.getElementById("caption_div").textContent = lang.LANG_FACTORYDEFAULT_CAPTION;
    document.getElementById("partialreset_lbl").textContent =
        lang.LANG_FACTORYDEFAULT_RESTORE_PARTIAL;
    document.getElementById("fullreset_lbl").textContent =
        lang.LANG_FACTORYDEFAULT_RESTORE_FULL;
    document.getElementById("restoreBtn").addEventListener("click", resetToDefault);
    CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(privilege)
{
    if(privilege == '04')
    {
        //full access
        document.getElementById("restoreBtn").disabled = false;
    }
    else
    {
        //no access
        location.href = SubMainPage;
        return;
    }
}

function resetToDefault()
{

  if (!document.getElementById("fullresetinput").checked &&
      !document.getElementById("partialresetinput").checked) {
    alert(lang.LANG_FACTORYDEFAULT_SELECT_RESTORE_TYPE_ALERT);
    return;
  }

    document.getElementById("restoreBtn").disabled = true;
    Loading(true);
    var alert_string = document.getElementById("partialresetinput").checked
                           ? lang.LANG_SERVER_DIAG_PARTIAL_DEFAULT_WARNING
                           : lang.LANG_SERVER_DIAG_DEFAULTS_WARNING2;
    UtilsConfirm(
        alert_string, {
          onOk : function() {
            Loading(true);
            var object = "";
            var ajax_url =
                '/redfish/v1/Managers/bmc/Actions/Manager.ResetToDefaults';
            if (document.getElementById("fullresetinput").checked) {
              object = JSON.stringify({"ResetToDefaultsType" : "ResetAll"});
            } else {
              object = JSON.stringify({
                "ResetToDefaultsType" : "ResetToDefaultButKeepReservedSettings"
              });
            }
            var ajax_req = new Ajax.Request(ajax_url, {
              method : 'POST',
              contentType : "application/json",
              parameters : object,
              onSuccess : resetToDefaultHandler,
              onFailure : function() {
                Loading(false);
                alert(lang.LANG_SYSTEM_DEFAULTS_FAILED);
              }
            });
          },
          onClose : function() {
            Loading(false);
            document.getElementById("restoreBtn").disabled = false;
          }
        });
}

function launchRebootCountdown() {
    gRebootTimeout = 10;
    Loading(true, lang.LANG_FW_RESET_DESC1 + "  " + gRebootTimeout + "  " + lang.CONF_LOGIN_STR_WEB_TIME_SEC + "...")
        if(gRebootDelayTimer != null) {
            clearInterval(gRebootDelayTimer);
            gRebootDelayTimer = null;
        }
    gRebootDelayTimer = setInterval(delayLogout, 1000);
}

function delayLogout() {
    //var timerLogout = setTimeout(goLogout, delay);
    Loading(true, lang.LANG_FW_RESET_DESC1 + "  " + gRebootTimeout + "  " + lang.CONF_LOGIN_STR_WEB_TIME_SEC + "...")
        gRebootTimeout--;
    if(gRebootTimeout < 0) {
        if(gRebootDelayTimer != null) {
            clearInterval(gRebootDelayTimer);
            gRebootDelayTimer = null;
        }
        goLogout();
    }
}

function resetToDefaultHandler(originalRequest)
{
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        alert(lang.LANG_SYSTEM_DEFAULTS_SUCCESS);
        launchRebootCountdown();
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc=GetResponseXML(response);
        if(xmldoc == null)
        {
            SessionTimeout();
            return;
        }
        if(CheckInvalidResult(xmldoc) < 0) {
            return;
        }
        deleteAllCookies();
        clearSessionInfo();
    }
}
