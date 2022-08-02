"use strict";
var pwr_Action;
var currentPwrStatus;
var expectStatus = 0xf;
var retryCount = 5;
var externalBMC = 0;
var cableChkBMC = lang.LANG_S_POWER_CONTROL_CHECK1;
var cableChkFeature = lang.LANG_S_POWER_CONTROL_CHECK2;

var currentStatusObj;
var	pwrResetObj;
var	cbxforceBIOSObj;
var	pwrImmOffObj;
var	pwrGracefulShutdownObj;
var	pwrOnObj;
var	cbxforceBIOSpwronObj;
var	pwrCycleObj;

var prfmActionBtn;
var isAdmin;

var PowerOffServer_Immediate = 0;
var PowerOnServer = 1;
var PowerCycleServer = 2;
var ResetServer = 3;
var GracefulShutdown = 5;
var lang;
var lang_setting;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/server_power_control_hlp.html";
    // Get multi-language string
    document.title = lang.LANG_S_POWER_CONTROL_TITLE;

    currentStatusObj 		= document.getElementById("currentStatus");
    pwrResetObj 	 		= document.getElementById("pwrReset");
    cbxforceBIOSObj  		= document.getElementById("forceBIOS");
    pwrImmOffObj 			= document.getElementById("pwrImmOff");
    pwrGracefulShutdownObj 	= document.getElementById("pwrGracefulShutdown");
    pwrOnObj 				= document.getElementById("pwrOn");
    cbxforceBIOSpwronObj 	= document.getElementById("forceBIOSpwron");
    pwrCycleObj 			= document.getElementById("pwrCycle");

    prfmActionBtn = document.getElementById("actionBtn");
    prfmActionBtn.value = lang.LANG_S_POWER_CONTROL_ACTION;

    CheckUserPrivilege(PrivilegeCallBack);
    OutputString();
    prfmActionBtn.onclick = doPwrAction;
}

function PrivilegeBtnCheck(privilege)
{
    if (privilege == '04' || privilege == '03') {
        prfmActionBtn.disabled = false;
    } else if (privilege == '02') {
        prfmActionBtn.disabled = true;
    } else {
        prfmActionBtn.disabled = true;
    }
}

function OutputString() {
    document.getElementById("caption_div").textContent = lang.LANG_S_POWER_CONTROL_CAPTION;
    document.getElementById("pwrReset_lbl").textContent = lang.LANG_S_POWER_CONTROL_RESET;
    document.getElementById("forceBIOS_lbl").textContent = lang.LANG_S_POWER_CONTROL_FORCE_ENTER_BIOS;
    document.getElementById("pwrImmOff_lbl").textContent = lang.LANG_S_POWER_CONTROL_IMMOFF;
    document.getElementById("pwrGracefulShutdown_lbl").textContent = lang.LANG_S_POWER_CONTROL_GRACEFUL_SHUTDOWN;
    document.getElementById("pwrOn_lbl").textContent = lang.LANG_S_POWER_CONTROL_ON;
    document.getElementById("forceBIOSpwron_lbl").textContent = lang.LANG_S_POWER_CONTROL_FORCE_ENTER_BIOS;
    document.getElementById("pwrCycle_lbl").textContent = lang.LANG_S_POWER_CONTROL_CYCLE;
}

function PrivilegeCallBack(privilege)
{
    if(privilege == '04' || privilege == '03') //oper or higher
    {
        //full access
        getPwrStatus();
        prfmActionBtn.disabled = false;
        isAdmin = 0;
    }
    else if(privilege == '02')//user only view
    {
        //read only
        //alert(lang.LANG_COMMON_CANNOT_MODIFY);
        getPwrStatus();
        prfmActionBtn.disabled = true;
        pwrResetObj.disabled = true;
        cbxforceBIOSObj.disabled = true;
        pwrImmOffObj.disabled = true;
        pwrGracefulShutdownObj.disabled = true;
        pwrOnObj.disabled = true;
        pwrCycleObj.disabled = true;
        isAdmin = 1;
    }
    else
    {
        //no access
        location.href = SubMainPage;
    }

    let KCSMode = ReadCookie("KCSMode");
    if (KCSMode == "restricted" || KCSMode == "deny_all") {
        cbxforceBIOSObj.disabled = true;
        cbxforceBIOSpwronObj.disabled = true;
    }
}

function getPwrStatus()
{
    Loading(true);
    var ajax_url = '/redfish/v1/Systems/system';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: getPwrStatusHandler,
        timeout: g_CGIRequestTimeout,
        ontimeout: onCGIRequestTimeout,
        onFailure: function() {
            Loading(false);
            alert(lang.CONF_LOGIN_STR_WEB_TIMEOUT);
        }
    });
}

function getPwrStatusHandler(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var powerctrlInfo = JSON.parse(arg.responseText);

      currentPwrStatus = powerctrlInfo.PowerState == "Off" ? 0 : 1;
      if (expectStatus != 0xf) {
        if (currentPwrStatus != expectStatus) {
          retryCount--;
          Loading(true);
          if (retryCount == 0) {
            Loading(false);
            var cableStr = externalBMC ? cableChkBMC : cableChkFeature;
            if (pwr_Action == 5) {
              alert(lang.LANG_S_POWER_CONTROL_SOFTOFF_FAIL + cableStr);
            } else {
              alert(lang.LANG_S_POWER_CONTROL_ACTION_FAIL + cableStr);
            }
            // reset button state & status info
            CheckUserPrivilege(PrivilegeBtnCheck);
            currentStatusObj.textContent =
                lang.LANG_S_POWER_CONTROL_POWER_OFF_START;
            currentStatusObj.className = 'text_power_state_off';
            return;
          }

          setTimeout(getPwrStatus, 10000);

          return;
        } else {
          if (pwr_Action == 2 && expectStatus == 0) {
            document.getElementById("currentStatus").textContent =
                lang.LANG_S_POWER_CONTROL_STATUS_OFF;
            document.getElementById("currentStatus").className =
                'text_power_state_on';

            document.getElementById("pwrReset").checked = false;
            document.getElementById("pwrReset").disabled = true;

            document.getElementById("pwrImmOff").checked = false;
            document.getElementById("pwrImmOff").disabled = true;

            document.getElementById("pwrGracefulShutdown").checked = false;
            document.getElementById("pwrGracefulShutdown").disabled = true;

            document.getElementById("pwrCycle").checked = true;
            document.getElementById("pwrCycle").disabled = true;

            document.getElementById("pwrOn").checked = false;
            document.getElementById("pwrOn").disabled = true;
            expectStatus = 1;
            setTimeout(getPwrStatus, 10000);
            return;
          }
        }
      }

        if(currentPwrStatus == 0) //power status if off
        {
            document.getElementById("currentStatus").textContent = lang.LANG_S_POWER_CONTROL_STATUS_OFF;
            document.getElementById("currentStatus").className = 'text_power_state_off';

            document.getElementById("pwrReset").checked = false;
            document.getElementById("pwrReset").disabled = true;

            document.getElementById("forceBIOS").checked = false;
            document.getElementById("forceBIOS").disabled = true;

            document.getElementById("pwrImmOff").checked = false;
            document.getElementById("pwrImmOff").disabled = true;

            document.getElementById("pwrGracefulShutdown").checked = false;
            document.getElementById("pwrGracefulShutdown").disabled = true;

            document.getElementById("pwrCycle").checked = false;
            document.getElementById("pwrCycle").disabled = true;

            document.getElementById("pwrOn").checked = true;
            document.getElementById("pwrOn").disabled = false;

            cbxforceBIOSpwronObj.checked = false;
            cbxforceBIOSpwronObj.disabled = false;

            pwr_Action = 1;
            retryCount = 5;
        }
        else //power status is on
        {
            document.getElementById("currentStatus").textContent = lang.LANG_S_POWER_CONTROL_STATUS_ON;
            document.getElementById("currentStatus").className = 'text_power_state_on';

            document.getElementById("pwrReset").checked = true;
            document.getElementById("pwrReset").disabled = false;

            document.getElementById("pwrImmOff").checked = false;
            document.getElementById("pwrImmOff").disabled = false;

            document.getElementById("pwrGracefulShutdown").checked = false;
            document.getElementById("pwrGracefulShutdown").disabled = false;

            document.getElementById("pwrCycle").checked = false;
            document.getElementById("pwrCycle").disabled = false;

            document.getElementById("pwrOn").checked = false;
            document.getElementById("pwrOn").disabled = true;

            document.getElementById("forceBIOSpwron").checked = false;
            document.getElementById("forceBIOSpwron").disabled = false;

            //console.log("==now is on ===== pwr_Action is " + pwr_Action);
            if(pwr_Action == undefined || pwr_Action == 3) {
                cbxforceBIOSpwronObj.checked = false;
                cbxforceBIOSpwronObj.disabled = true;
            } else {
                cbxforceBIOSObj.checked = false;
                cbxforceBIOSObj.disabled = false;
                cbxforceBIOSpwronObj.checked = false;
                cbxforceBIOSpwronObj.disabled = true;
            }

            pwr_Action = 3;
            retryCount = 5;
        }

        let KCSMode = ReadCookie("KCSMode");
        if (KCSMode == "restricted" || KCSMode == "deny_all") {
            cbxforceBIOSObj.disabled = true;
            cbxforceBIOSpwronObj.disabled = true;
        }
        CheckUserPrivilege(PrivilegeBtnCheck);
        //prfmActionBtn.disabled = false;
    }
}

function doPwrActionHandler(arg) {
  var inittmout;
  Loading(false);
  document.getElementById("currentStatus").textContent =
      lang.LANG_S_POWER_CONTROL_PROGRESS_STATUS;
  document.getElementById("currentStatus").className = 'text_power_state_on';
  if (arg.readyState == 4 && arg.status == 200) {

    if (pwr_Action == 2) { // power cycle
      inittmout = 20000; // for power cycle we check if host is powered on again
                         // after 10 secs
    } else if (pwr_Action == 5) // soft OFF (OS-mediated)
    {
      inittmout = 30000;
    } else {
      inittmout = 10000;
    }
    retryCount = 5;
    setTimeout(getPwrStatus, inittmout);
  }
}

function doPwrAction(){
  var object;
  if (!cbxforceBIOSObj.checked && !cbxforceBIOSpwronObj.checked) {
    object = {
      "Boot" : {
        "BootSourceOverrideTarget" : "None",
        "BootSourceOverrideEnabled" : "Disabled"
      }
    };
  } else if (cbxforceBIOSObj.checked || cbxforceBIOSpwronObj.checked) {
    object = {
      "Boot" : {
        "BootSourceOverrideTarget" : "BiosSetup",
        "BootSourceOverrideEnabled" : "Once"
      }
    };
  }
  var ajax_url = '/redfish/v1/Systems/system';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : JSON.stringify(object),
    onSuccess : function(response) { doPwrAction_Server(); },
    onFailure : function(error) {
      Loading(false);
      alert(lang.LANG_S_POWER_CONTROL_ACTION_FAIL);
    }
  });
}

function doPwrAction_Server()
{

    if ( isAdmin == 0 ) {
        var data={};
        var ajax_url =
            '/redfish/v1/Systems/system/Actions/ComputerSystem.Reset';
        var powerStatus = 0;

        var powerGroupSelector = document.getElementsByName("pwrControl");
        for (var i = 0; i < powerGroupSelector.length; i++) {
          if (powerGroupSelector[i].checked) {
            pwr_Action = parseInt(powerGroupSelector[i].value);
          }
        }
        // data.power_command = pwr_Action;
        switch(pwr_Action)
        {
            case PowerOffServer_Immediate:
              // Power Off Server - Immediate
              expectStatus = 0;
              data = {"ResetType" : "ForceOff"};
              break;

            case PowerOnServer:
              // Power On Server
              expectStatus = 1;
              data = {"ResetType" : "On"};
              break;
            case PowerCycleServer:
              // Power Cycle Server
              expectStatus = 1;
              data = {"ResetType" : "GracefulRestart"};
              break;
            case ResetServer:
              // Reset Server
              expectStatus = 1;
              data = {"ResetType" : "ForceRestart"};
              break;
                
            case GracefulShutdown:
              // Graceful Shutdown
              expectStatus = 0;
              data = {"ResetType" : "GracefulShutdown"};
              break;
        }

        var object= JSON.stringify(data);
        var ajax_req = new Ajax.Request(ajax_url, {
          method : 'POST',
          contentType : "application/json",
          parameters : object,
          onSuccess : doPwrActionHandler,
          timeout : g_CGIRequestTimeout,
          ontimeout : onCGIRequestTimeout,
          onFailure :
              function() { alert(lang.LANG_S_POWER_CONTROL_ACTION_FAIL); }
        })

    }else{
        alert(lang.LANG_COMMON_CANNOT_MODIFY);
    }
}
