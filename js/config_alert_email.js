"use strict";
var alertElements = {};
var buttonEnableObj;
var buttonSaveObj;
var lang;
window.addEventListener('load', pageInit);
if (parent.lang) { lang = parent.lang; }
function pageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/configure_alert_email_hlp.html";
  buttonSaveObj = document.getElementById("btn_save");
  buttonSaveObj.value = lang.LANG_MODALERT_BTNSAVE;
  buttonSaveObj.addEventListener("click", onSave);
  buttonEnableObj = document.getElementById("_text_smtp_authentication");
  buttonEnableObj.addEventListener("click", enableAlertEmail);
  outputString();
  // check input format
  initCheckInputListener("_text_smtp_address",
                         lang.LANG_CONFALERT_SMTP_SERVERIP,
                         INPUT_FIELD.HOSTNAMEANDIPV4);
  initCheckInputListener("_text_smtp_port", lang.LANG_CONFALERT_SMTP_SERVERPORT,
                         INPUT_FIELD.PORT);
  initCheckInputListener("_text_sender_address",
                         lang.LANG_CONFALERT_SMTP_SERVERPORT,
                         INPUT_FIELD.EMAIL);
  // check user Privilege
  CheckUserPrivilege(privilegeCallBack);
}
function outputString() {
  document.getElementById("email_caption_div").textContent =
      lang.LANG_CONFALERT_EMAIL_CAPTION;
  document.getElementById("smtp_authentication_lbl").textContent =
      lang.LANG_CONFPEF_ENABLE;
  document.getElementById("smtp_serverip_lbl").textContent =
      lang.LANG_CONFALERT_SMTP_SERVERIP;
  document.getElementById("smtp_serverport_lbl").textContent =
      lang.LANG_CONFALERT_SMTP_SERVERPORT;
  document.getElementById("sender_address_lbl").textContent =
      lang.LANG_CONFALERT_SENDER_ADDRESS;
}
function privilegeCallBack(privilege) {
  // full access
  if (privilege == '04') {
    requestConfig();
    buttonSaveObj.disabled = false;
  }
  // only view
  else if (privilege == '03' || privilege == '02') {
    requestConfig();
    buttonSaveObj.disabled = true;
  }
  // no access
  else {
    location.href = SubMainPage;
    return;
  }
}
function enableAlertEmail() {
  var checkedVal = document.getElementById("_text_smtp_authentication").checked;
  enableInputElements(!checkedVal);
}
function enableInputElements(value) {
  document.getElementById("_text_sender_address").disabled = value;
  document.getElementById("_text_smtp_port").disabled = true;
  document.getElementById("_text_smtp_address").disabled = value;
}
function onSave() { saveSmtpConfig(); }
function saveSmtpConfig(){
  var ajaxUrl = '/redfish/v1/EventService/';
  var ajaxParam = {
    "SMTP" : {
      "FromAddress" : document.getElementById("_text_sender_address").value,
      "Port" : parseInt(document.getElementById("_text_smtp_port").value, 10),
      "ServerAddress" : document.getElementById("_text_smtp_address").value,
      "ServiceEnabled" : document.getElementById("_text_smtp_authentication").checked
    }
  };
  var object = JSON.stringify(ajaxParam);
  Loading(true);
  var myAjax = new Ajax.Request(ajaxUrl, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : responseSaveAlertEmail,
    onFailure : function() { alert(lang.LANG_CONFIG_ALERT_EMAIL_SAVE_FAILED); }
  });
  Loading(false);
}
function validateFormat() {
  var svrIp = null;
  var obj = null;
  svrIp = document.getElementById("_text_smtp_address");
  if (svrIp != null) {
    if (svrIp.value) {
      if (!CheckIP6(svrIp.value)) {
        alert(lang.LANG_CONFALERT_SMTP_SERVERIP + "\n" +
                  lang.LANG_CONFIG_NETWORK_ERR_INVALID_IP + " \"" + obj.value +
                  "\"",
              {type : "pre"});
        return false;
      }
    }
    obj = document.getElementById("_text_smtp_port");
    if ((obj.value && !svrIp.value) || (!obj.value && svrIp.value)) {
      alert(lang.LANG_CONFALERT_SMTP_SERVERIP + "\n" +
                lang.LANG_CONFALERT_SMTP_SERVERPORT + "\n" +
                lang.LANG_GENERAL_INTERDEPENDENT_VALUE,
            {type : "pre"});
      return false;
    } else if (obj.value && !CheckPortNumber(obj.value)) {
      alert(lang.LANG_CONFALERT_SMTP_SERVERPORT + "\n" +
                lang.LANG_SMTP_INVALID_PORT + " \"" + obj.value + "\"",
            {type : "pre"});
      return false;
    }
    obj = document.getElementById("_text_sender_address");
    if ((obj.value && !svrIp.value) || (!obj.value && svrIp.value)) {
      alert(lang.LANG_CONFALERT_SMTP_SERVERIP + "\n" +
                lang.LANG_CONFALERT_SENDER_ADDRESS + "\n" +
                lang.LANG_GENERAL_INTERDEPENDENT_VALUE,
            {type : "pre"});
      return false;
    } else if (obj.value && !CheckEmail(obj.value)) {
      alert(lang.LANG_CONFALERT_SENDER_ADDRESS + "\n" +
                lang.LANG_MODALERT_ERRMAIL + " \"" + obj.value + "\"",
            {type : "pre"});
      return false;
    }
  }
    return true;
}
function requestConfig() {
    Loading(true);
    var ajaxUrl = '/redfish/v1/EventService';
    var ajaxReq = new Ajax.Request(ajaxUrl, {
      method : 'GET',
      onSuccess : responseAlertEmail,
      onFailure : function() {
        Loading(false);
        alert(lang.LANG_CONFIG_ALERT_EMAIL_GET_FAILED);
      }
    });
}
function responseAlertEmail(arg) {
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      alertElements = JSON.parse(arg.responseText);
      if (alertElements.hasOwnProperty("SMTP")) {
        document.getElementById("_text_smtp_address").value =
            alertElements.SMTP.ServerAddress;
        document.getElementById("_text_smtp_port").value =
            alertElements.SMTP.Port;
        document.getElementById("_text_sender_address").value =
            alertElements.SMTP.FromAddress;
        document.getElementById("_text_smtp_authentication").checked =
            alertElements.SMTP.ServiceEnabled;
        enableAlertEmail();
      }
    }
}
function responseSaveAlertEmail(originalRequest) {
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
        alert(lang.LANG_CONFALERT_EMAIL_SUCCSAVE, {title:lang.LANG_SAVECONF_SAVE_BTN});
    }
}
