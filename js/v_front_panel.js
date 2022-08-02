"use strict";
var action;
var access;
var userAccess;
var power_state = '';
var status_state = '';
var chassis_state = '';
var buttonState = 0;
var PowerledObj, powerBtnObj, statusLedObj, resetBtnObj, chassisLedObj, chassisIdBtnObj, messageObj;
var PwrBtn_status =false;
var ResetBtn_status =false;
var button_State = 0;
var hostTimer;
var chassis_setinterval = 0;
var power_setinterval =0;
var ID_setinterval =0;
var lang;
var lang_setting;
var rt;
var t;
window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/v_front_panel_hlp.html";

    PowerledObj = document.getElementById("powerled");
    powerBtnObj = document.getElementById("powerBtn");
    resetBtnObj = document.getElementById("ResetBtn");
    statusLedObj = document.getElementById("StatusledDiv");
    chassisLedObj = document.getElementById("chassIdLedDiv");
    chassisIdBtnObj = document.getElementById("chassisIDBtn");
    messageObj = document.getElementById("Message");
    //hidden messageObj
    messageObj.style.display = "none";

    PwrBtn_status = false;
    ResetBtn_status =false;

    powerBtnObj.onclick = DoPowerAction;
    resetBtnObj.onclick = DoResetAction;
    chassisIdBtnObj.onclick = DoChassisAction;

    getHostStatus();
    chassisIDStatus();
    getResetStatus();

    document.getElementById("caption_div").textContent = lang.LANG_REMOTE_CNTRL_SUBMENU_VIRTUAL_FRONT_PANEL;
    CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(Privilege)
{
  if (Privilege == '04' || Privilege == '03') // Operator or higher
  {
    access = 1;
    userAccess = 1;
  } else if (Privilege == '02') {
    access = 0;
    userAccess = 1;
  } else {
    // no access
    access = 0;
    userAccess = 0;
  }
}

function getLedHandler(originalRequest) {
    /*if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    //alert(originalRequest.responseText);
    var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
    var xmldoc=GetResponseXML(response);
    if(xmldoc == null) {
    SessionTimeout();
    return;
    }
    }*/
}

function clearLedImage(){
  while (PowerledObj.firstChild) {
    PowerledObj.removeChild(PowerledObj.firstChild);
  }
}

function getResetHandler(arg) {
  status_state = arg;
  var bSec = 500;
  clearInterval(ID_setinterval);
  ID_setinterval = null;
  var status_img = document.createElement('IMG');
  if (status_state == 'GREEN_ON') {
    status_img.setAttribute('class', "comp-alert-i statusled");
    status_img.setAttribute('id', "_IDLed");
    status_img.setAttribute('src', "../images/green.png");
    // statusLedObj.appendChild(status_img);
    setTimeout(function() { statusLedObj.appendChild(status_img) }, bSec);
  } else if (status_state == 'AMBER_ON') {
    status_img.setAttribute('class', "comp-alert-i statusled");
    status_img.setAttribute('id', "_IDLed");
    status_img.setAttribute('src', "../images/red.png");
    // statusLedObj.appendChild(status_img);
    setTimeout(function() { statusLedObj.appendChild(status_img) }, bSec);
  } else if (status_state == 'GREEN_BLINKING') {
    status_img.setAttribute('class', "comp-alert-i statusled");
    status_img.setAttribute('id', "_IDLed");
    status_img.setAttribute('src', "../images/greenbig_blink.gif");
    // statusLedObj.appendChild(status_img);
    setTimeout(function() { statusLedObj.appendChild(status_img) }, bSec);

    // ID_setinterval = setInterval(BlinkGreen,500);
  } else if (status_state == 'AMBER_BLINKING') {
    status_img.setAttribute('class', "comp-alert-i statusled");
    status_img.setAttribute('id', "_IDLed");
    status_img.setAttribute('src', "../images/redbig_blink.gif");
    // statusLedObj.appendChild(status_img);
    setTimeout(function() { statusLedObj.appendChild(status_img) }, bSec);

    // ID_setinterval = setInterval(BlinkAmber,2000);
  }
}

function getChassisIDHandler(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var res = JSON.parse(arg.responseText);
    var chassisID_Status = res.IndicatorLED;
    chassis_state = chassisID_Status.toLocaleUpperCase();
    var bSec = 500;
    var chassis_img = document.createElement('IMG');
    if (chassis_state == 'ON' || chassis_state == 'LIT') {
      if (chassis_setinterval) {
        clearInterval(chassis_setinterval);
      }
      chassis_img.setAttribute('class', "comp-alert-i statusled");
      chassis_img.setAttribute('id', "_IDLed");
      chassis_img.setAttribute('src', "../images/blue.png");
      // chassisLedObj.appendChild(chassis_img);
      setTimeout(function() { chassisLedObj.appendChild(chassis_img) }, bSec);
    } else if (chassis_state == 'OFF') {
      if (chassis_setinterval) {
        clearInterval(chassis_setinterval);
      }
      chassis_img.setAttribute('class', "comp-alert-i statusled");
      chassis_img.setAttribute('id', "_IDLed");
      chassis_img.setAttribute('src', "../images/grey.png");
      // chassisLedObj.appendChild(chassis_img);
      setTimeout(function() { chassisLedObj.appendChild(chassis_img) }, bSec);
    } else if (chassis_state == 'BLINKING') {
      chassis_setinterval = setInterval(BlinkChassisID, 500);
    }
  }
}

function getHostHandler(arg)
{
    if (arg.readyState == 4 && arg.status == 200) {
      var res = JSON.parse(arg.responseText);
      var server_data = res.PowerState;

      if (power_state.toLowerCase() != server_data.toLowerCase()) {
        clearLedImage();
        power_state = server_data == "Off" ? "OFF" : "ON";
        var front_panel_text = "UNKNOW";
        messageObj.textContent = "";// clear text info
        var bSec = 500;
        var power_img = document.createElement('IMG');
        if(power_state == 'OFF') { // host power is OFF
          power_img.setAttribute('class', "comp-alert-i statusled");
          power_img.setAttribute('id', "_Power");
          power_img.setAttribute('src', "../images/grey.png");
          setTimeout(function() { PowerledObj.appendChild(power_img) }, bSec);
        } else if(power_state == 'ON') { // host power is ON
          power_img.setAttribute('class', "comp-alert-i statusled");
          power_img.setAttribute('id', "_Power");
          power_img.setAttribute('src', "../images/green.png");
          setTimeout(function() { PowerledObj.appendChild(power_img) }, bSec);
        } else if(power_state == 'BLINKING') {
          power_setinterval = setInterval(BlinkPowerLED, 500);
        }
        messageObj.textContent = front_panel_text;
        messageObj.style.color = '#00FF00';
        messageObj.style.width = '180px';
      }

      clearTimeout(hostTimer);
      hostTimer = setTimeout(getHostStatus, 2000);
    }
}

var BlinkAmber =
    function() {
  // Removing all children from an element
  while (statusLedObj.firstChild) {
    statusLedObj.removeChild(statusLedObj.firstChild);
  }
  var status_img = document.createElement('IMG');
  status_img.setAttribute('class', "comp-alert-i statusled");
  status_img.setAttribute('id', "_Statusled");
  button_State = 0;
  if (button_State == 0) {
    status_img.setAttribute('src', "../images/red.png");
  }
  statusLedObj.appendChild(status_img);
}

var BlinkGreen =
    function() {
  // Removing all children from an element
  while (statusLedObj.firstChild) {
    statusLedObj.removeChild(statusLedObj.firstChild);
  }

  var status_img = document.createElement('IMG');
  status_img.setAttribute('class', "comp-alert-i statusled");
  status_img.setAttribute('id', "_Statusled");
  if (button_State == 0) {
    status_img.setAttribute('src', "../images/green.png");
    button_State = 1;
  } else {
    status_img.setAttribute('src', "../images/grey.png");
    button_State = 0;
  }
  statusLedObj.appendChild(status_img);
}

var BlinkPowerLED =
    function() {
  // Removing all children from an element
  while (PowerledObj.firstChild) {
    PowerledObj.removeChild(PowerledObj.firstChild);
  }

  var power_img = document.createElement('IMG');
  power_img.setAttribute('class', "comp-alert-i statusled");
  power_img.setAttribute('id', "_Power");
  if (buttonState == 0) {
    power_img.setAttribute('src', "../images/grey.png");
    buttonState = 1;
  } else {
    power_img.setAttribute('src', "../images/green.png");
    buttonState = 0;
  }
  PowerledObj.appendChild(power_img);
}

var BlinkChassisID =
    function() {
  // Removing all children from an element
  while (chassisLedObj.firstChild) {
    chassisLedObj.removeChild(chassisLedObj.firstChild);
  }

  var chassis_img = document.createElement('IMG');
  chassis_img.setAttribute('class', "comp-alert-i statusled");
  chassis_img.setAttribute('id', "_IDLed");
  if (buttonState == 0) {
    chassis_img.setAttribute('src', "../images/blue.png");
    buttonState = 1;
  } else {
    chassis_img.setAttribute('src', "../images/grey.png");
    buttonState = 0;
  }
  chassisLedObj.appendChild(chassis_img);
}

function
getHostStatus() {
  var ajax_url = '/redfish/v1/Systems/system';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : getHostHandler,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() { Loading(false); }
  });
} function
getResetStatus() {
  var ajax_url = '/redfish/v1/Systems/system';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : function(arg) {
      var res = JSON.parse(arg.responseText);
      var status = res.Oem.OpenBmc.PhysicalLED.GreenLED;
      var send_stat = '';
      switch (status.toLowerCase()) {
      case "off":
        send_stat = "GREEN_OFF";
        getAmberStatus();
        break;
      case "blinking":
        send_stat = "GREEN_BLINKING";
        getResetHandler(send_stat);
        break;
      case "on":
        send_stat = "GREEN_ON";
        getResetHandler(send_stat);
        break;
      default:
        send_stat = "GREEN_OFF";
        getAmberStatus();
        break;
      }
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() { Loading(false); }
  });
} function
getAmberStatus() {
  var ajax_url = '/redfish/v1/Systems/system';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : function(arg) {
      var res = JSON.parse(arg.responseText);
      var status = res.Oem.OpenBmc.PhysicalLED.AmberLED;
      var send_stat = '';
      switch (status.toLowerCase()) {
      case "off":
        send_stat = "AMBER_OFF";
        break;
      case "blinking":
        send_stat = "AMBER_BLINKING";
        break;
      case "on":
        send_stat = "AMBER_ON";
        break;
      default:
        send_stat = "AMBER_OFF";
        break;
      }
      getResetHandler(send_stat);
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() { Loading(false); }
  });
}

function
chassisIDStatus() {
  var ajax_url = '/redfish/v1/Systems/system';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : getChassisIDHandler,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() { Loading(false); }
  });
}

function getChassisHandler(originalRequest) {
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var response = originalRequest.responseText.replace(/^\s+|\s+$/g, "");
    // alert(response);
    var xmldoc = GetResponseXML(response);
    if (xmldoc == null) {
      SessionTimeout();
      return;
    }

    // check session & privilege result
    if (CheckInvalidResult(xmldoc) < 0) {
      return;
    }

    var IPMIRoot = xmldoc.documentElement; // point to IPMI

    var ledinfo = IPMIRoot.getElementsByTagName("LED");

    chassis_state = ledinfo.item(0).firstChild.nodeValue;

    // Removing all children from an element
    while (chassisLedObj.firstChild) {
      chassisLedObj.removeChild(chassisLedObj.firstChild);
    }
    var chassis_img = document.createElement('IMG');
    chassis_img.setAttribute('class', "comp-alert-i statusled");
    chassis_img.setAttribute('id', "_IDLed");
    // alert(chassis_state);
    if (chassis_state == 'ON') {
      chassis_img.setAttribute('src', "../images/blue.png");
    } else if (chassis_state == 'OFF') {
      chassis_img.setAttribute('src', "../images/grey.png");
    }
    chassisLedObj.appendChild(chassis_img);
  }
}

function
DoPowerAction() {
  Loading(false);
  if (access) {
    if (false == PwrBtn_status && false == ResetBtn_status) {
      PwrBtn_status = true;
      switch (power_state) {
      case 'OFF': // power OFF
        showWait(true, lang.LANG_VIRTUAL_FRONT_PANEL_POWER_ON);
        action = 1;
        break;
      default: // power ON
        showWait(true, lang.LANG_VIRTUAL_FRONT_PANEL_POWER_OFF);
        // action = 5;
        action = 0;
        break;
      }
      doPwrOnOff(action);
    }
  } else {
    alert(lang.LANG_COMMON_CANNOT_MODIFY);
    Loading(false);
  }
}

/*
   state: OFF-->do power on, others --> do power off
   */
function doPwrOnOff(state) {
  Loading(true);
  var data = "";
  var ajax_url = '/redfish/v1/Systems/system/Actions/ComputerSystem.Reset';
  if (state == 1) {
    data = {"ResetType" : "On"};
  } else {
    data = {"ResetType" : "GracefulShutdown"};
  }

  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'POST',
    parameters : JSON.stringify(data),
    onSuccess : getHostPowerActionRes,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() { Loading(false); }
  });
}

var checkHostPwrStatus =
    function() {
  showWait(false);
  PwrBtn_status = false;
  getHostStatus();
  clearTimeout(t);
}

var getHostPowerActionRes =
    function() {
  Loading(false);
  t = setTimeout(checkHostPwrStatus, 9000);
}

var resetHostRes =
    function() {
  Loading(false);
  showWait(true, lang.LANG_VIRTUAL_FRONT_RESET_START);
  rt = setTimeout(setResetOK, 9000);
}

var setResetOK =
    function() {
  showWait(false);
  ResetBtn_status = false;
  clearTimeout(rt);
}

function
DoResetAction() {
  if (access) {
    if (/*current_state!=0 &&*/ false == ResetBtn_status &&
        false == PwrBtn_status) {
      ResetBtn_status = true;
      showWait(true);

      action = 3;
      resetHost();
    }
  } else {
    alert(lang.LANG_COMMON_CANNOT_MODIFY);
    showWait(false);
  }
}

function
resetHost() {
  Loading(true);
  var ajax_url = '/redfish/v1/Systems/system/Actions/ComputerSystem.Reset';
  var object = JSON.stringify({"ResetType" : "ForceRestart"});
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'POST',
    parameters : object,
    onSuccess : resetHostRes,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() { Loading(false); }
  });
}

function doChassisOnOffRes(originalRequest) {
  if (originalRequest.readyState == 4 && originalRequest.status == 204) {
    Loading(false);
    chassisIDStatus();
  }
}

function doChassisOnOff(state) {
  Loading(true);
  var data = {};
  if (state == 'OFF') {
    data = {"LocationIndicatorActive" : true};
  } else {
    data = {"LocationIndicatorActive" : false};
  }
  var ajax_url = '/redfish/v1/Systems/system';
  var object = JSON.stringify(data);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    parameters : object,
    onSuccess : doChassisOnOffRes,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() { Loading(false); }
  });
}

function
DoChassisAction() {
  if (userAccess) {
    doChassisOnOff(chassis_state);
  } else {
    alert(lang.LANG_COMMON_CANNOT_MODIFY);
  }
}
