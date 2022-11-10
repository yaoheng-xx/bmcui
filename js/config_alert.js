"use strict";
var AlertTable;
var ButtonSaveOBJ;
var ButtonSendOBJ;
var eventfilterObj = {};
var destinationObj = {};
var destIndex = 0;
var eventfilterObj = {};
var lang;
var subscriptionId;
var testAlertmessage = false;


window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_alerts_hlp.html";

    //Grid table Init
    AlertTable = document.getElementById("HtmlAlertTable");

    var btn = document.getElementById("_checkAllBtn");
    btn.value = lang.LANG_CONFALERT_CHECK_ALL;
    btn.addEventListener("click", onCheckAll);

    btn = document.getElementById("_clearAllBtn");
    btn.value = lang.LANG_CONFALERT_CLEAR_ALL;
    btn.addEventListener("click", onClearAll);

    btn = document.getElementById("_saveBtn");
    btn.value = lang.LANG_MODALERT_BTNSAVE;
    btn.addEventListener("click", onSave);

    btn = document.getElementById("_sendTestAlertsBtn");
    btn.value = lang.LANG_CONFALERT_BTNTESTALR;
    btn.addEventListener("click", onSendTestAlert);

    ButtonSaveOBJ = document.getElementById("_saveBtn");
    ButtonSendOBJ = document.getElementById("_sendTestAlertsBtn");

    OutputString();
    //check input format
    initCheckInputListener("_input_alert1_email_address", lang.LANG_CONFALERT_ALERT_MAIL_TO, INPUT_FIELD.EMAIL);
    initCheckInputListener("_input_alert2_email_address", lang.LANG_CONFALERT_ALERT_MAIL_TO, INPUT_FIELD.EMAIL);

    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("caption_div").textContent = lang.LANG_CONFALERT_CAPTION;
    document.getElementById("trigger_alert_legeng").textContent = lang.LANG_CONFALERT_TRIGGER_ALERTS;
    document.getElementById("event_temperature_lbl").textContent = lang.LANG_CONFALERT_EVENT_TEMPERATURE;
    document.getElementById("event_out_of_range_lbl").textContent = lang.LANG_CONFALERT_EVENT_VOLTAGE_OUT_OF_RANGE;
    document.getElementById("fan_fail_lbl").textContent = lang.LANG_CONFALERT_EVENT_FAN_FAILURE;
    document.getElementById("psu_fail_lbl").textContent = lang.LANG_CONFALERT_EVENT_PSU_FAILURE;
    document.getElementById("event_psu_redundancy_failure_lbl").textContent = lang.LANG_CONFALERT_EVENT_FSU_REDUNDANCY_FAIL;
    document.getElementById("system_restart_lbl").textContent = lang.LANG_CONFALERT_EVENT_SYSTEM_RESTART;
    document.getElementById("therm_trip_lbl").textContent = lang.LANG_CONFALERT_EVENT_PROCESSOR_THERM_TRIP;
    document.getElementById("dimm_therm_trip_lbl").textContent = lang.LANG_CONFALERT_EVENT_PROCESSOR_DIMM_THERM_TRIP;
    document.getElementById("memory_error_lbl").textContent = lang.LANG_CONFALERT_EVENT_MEMORY_ERROR;
    document.getElementById("cpu_error_lbl").textContent = lang.LANG_CONFALERT_EVENT_CPU_ERROR;
    document.getElementById("alert_dest1_legend").textContent = lang.LANG_CONFALERT_ALERT_DEST1;
    document.getElementById("alert_mail_to_lbl").textContent = lang.LANG_CONFALERT_ALERT_MAIL_TO;
    
    alert_dest2_legend.textContent = lang.LANG_CONFALERT_ALERT_DEST2;
    document.getElementById("alert2_mail_to_lbl").textContent = lang.LANG_CONFALERT_ALERT_MAIL_TO;
}

function PrivilegeCallBack(Privilege) {
    //full access
    if (Privilege == '04') {
        getPEFGlobalControls();
        GetAlerts();
    }
    //only view
    else if (Privilege == '03') {
        getPEFGlobalControls();
        GetAlerts();
        var tmp = document.getElementById("_checkAllBtn");
        tmp.disabled = true;
        tmp = document.getElementById("_clearAllBtn");
        tmp.disabled = true;
        ButtonSaveOBJ.disabled = true;
        ButtonSendOBJ.disabled = true;
    }
    //no access
    else {
        location.href = SubMainPage;
        return;
    }
}

function getPEFGlobalControls(){
    Loading(true);
    var ajax_url = "/redfish/v1/PefService";
    var ajax_data = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: bindGlobalParamters,
        onFailure: function() {
            alert(lang.LANG_CONFALERT_ALERT_GET_PEF_ERROR);
        }
    })
}

function bindGlobalParamters(originalRequest){
  Loading(false);
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var org_res = JSON.parse(originalRequest.responseText);
    var action_status = org_res.PEFActionGblControl;
    ShowDestinationType(originalRequest);
  }
}

function getsubscriptionId(originalRequest) {
  Loading(false);
  if (originalRequest.readyState == 4 && originalRequest.status == 201) {
    var mData = JSON.parse(originalRequest.responseText);
    var ExtendedInfo = mData["@Message.ExtendedInfo"][0];
    var subscriptionURL = ExtendedInfo["@odata.id"];
    subscriptionId= subscriptionURL.split("/").pop();
  }
}

function creatSmtpSubscriptions() {
  Loading(true);
  var ajax_param = {"Protocol" : "SMTP"};
  var object = JSON.stringify(ajax_param);
  var ajax_url = "/redfish/v1/EventService/Subscriptions";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'POST',
    contentType : 'application/json',
    parameters : object,
    onSuccess : getsubscriptionId,
    onFailure : function() {
      Loading(false);
    }
  });
}

function destorySmtpSubscriptions() {
  Loading(true);
  var ajax_param = {"Protocol" : "SMTP"};
  var object = JSON.stringify(ajax_param);
  var ajax_url = "/redfish/v1/EventService/Subscriptions/"+subscriptionId;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'DELETE',
    contentType : 'application/json',
    parameters : object,
    onSuccess : function() {
      Loading(false);
    },
    onFailure : function() {
      Loading(false);
    }
  });
}

function responsepeformGlobalControls(originalRequest){
      var tmp = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
      jQuery('#pef_types input[type=checkbox]').each(function() {
        var id = jQuery(this).attr('value');
        id = id - 1;
        var check_value = (jQuery(this).is(":checked") == true) ? 1 : 0;
        if (check_value) {
          tmp[id] = 1;
        } else {
          tmp[id] = 0;
        }
      });
      var SmtpSubscription = false;
      var bitmap = [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 0 ];
      for(var i=0;i<bitmap.length;i++){
        if ((tmp[i] == bitmap[i]) && (i != 0) && (i != 9)) {
          SmtpSubscription = true;
          break;
        }
      }
      if (SmtpSubscription == true)
      {
        creatSmtpSubscriptions();
      }
      else
      {
        destorySmtpSubscriptions();
      }
      SendMultiplePEF(tmp);
}

function CompleteTestAlert() {
  Loading(false);
  if (testAlertmessage)
  {
    ButtonSaveOBJ.disabled = false;
    ButtonSendOBJ.disabled = false;
    alert(lang.LANG_CONFALERT_ALERTSENT, {title:lang.LANG_CONFALERT_BTNTESTALR});
  }
  else
  {
    ButtonSaveOBJ.disabled = false;
    ButtonSendOBJ.disabled = false;
    alert(lang.LANG_CONFALERT_ALERT_SENDING_ERROR, {title:lang.LANG_CONFALERT_BTNTESTALR});
  }
}

function GetAlerts() {
    Loading(true);
    var ajax_url = "/redfish/v1/PefService";
    var ajax_data = new Ajax.Request(ajax_url, {
      method : 'GET',
      onSuccess : ShowAlertTable,
      onFailure : function() { alert(lang.LANG_CONFALERT_ALERT_GET_DESTINATION_ERROR); }
    })
}

function ShowDestinationType(res){
    var obj1 = document.getElementById("_input_alert1_email_address");
    var obj2 = document.getElementById("_input_alert2_email_address");
    if (res.readyState == 4 && res.status == 200)
    {
        var org_req = JSON.parse(res.responseText);
        var data = org_req.Recipient;
        if(data[0] != undefined){
            obj1.disabled = false;
            obj1.value = data[0];
        }
        if(data[1] != undefined){
            obj2.disabled = false;
            obj2.value = data[1];
        }
    }
}
function updateCheckboxObj(obj, checked) {
    if(obj != null) {
      if (checked != null && checked == 1) {
        obj.checked = true;
      } else {
        obj.checked = false;
      }
    }
}

function responseTestAlertSuccess(originalRequest) {
  Loading(false);
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    testAlertmessage = true;
  }
}

function responseTestAlertFailure(originalRequest) {
  Loading(false);
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    testAlertmessage = false;
  }
}

function ShowAlertTable(originalRequest) {
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        var org_req = JSON.parse(originalRequest.responseText);
        eventfilterObj = org_req.FilterEnable;
        bindEventSensorTypeFields();
    }
}

function bindEventSensorTypeFields(){
    var id= 1;
    for(var i=0;i<eventfilterObj.length;i++){
        if(eventfilterObj[i] == 0){
            jQuery("#pef_types input[type='checkbox'][value="+id+"]").prop("checked",false);
        }else{
            jQuery("#pef_types input[type='checkbox'][value="+id+"]").prop("checked",true);
        }
        id++;
    }
}

function checkAll(checked) {
    var obj = null;

    obj = document.getElementById("_check_temperature");
    obj.checked = checked;

    obj = document.getElementById("_check_voltage_out_of_range");
    obj.checked = checked;

    obj = document.getElementById("_check_fan_failure");
    obj.checked = checked;

    obj = document.getElementById("_check_psu_failure");
    obj.checked = checked;

    obj = document.getElementById("_check_psu_redundancy_failure");
    obj.checked = checked;

    obj = document.getElementById("_check_system_restart");
    obj.checked = checked;

    obj = document.getElementById("_check_processor_therm_trip");
    obj.checked = checked;

    obj = document.getElementById("_check_processor_dimm_therm_trip");
    obj.checked = checked;

    obj = document.getElementById("_check_memeory_error");
    obj.checked = checked;

    obj = document.getElementById("_check_cpu_error");
    obj.checked = checked;
}

function onCheckAll() {
    checkAll(true);
}

function onClearAll() {
    checkAll(false);
}

function onSave() { responsepeformGlobalControls(); }

function SendMultiplePEF(arr){
  Loading(true);
  var ajax_url = "/redfish/v1/PefService";
  var ajax_param = {"FilterEnable" : arr};
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : responseSendMultiplePEF,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFALERT_FAILSAVE);
    }
  });
}

function responseSendMultiplePEF(originalRequest){
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
        var email1 = document.getElementById("_input_alert1_email_address");
        var email2 = document.getElementById("_input_alert2_email_address");
        var tmp_arr = [];
        //When email address is "", just port it into array Recipient
        tmp_arr.push(email1.value);
        tmp_arr.push(email2.value);
        var ajax_param = {"Recipient" : tmp_arr};
        var ajax_url = "/redfish/v1/PefService";
        var object = JSON.stringify(ajax_param);
        var ajax_req = new Ajax.Request(ajax_url, {
          method : 'PATCH',
          contentType : 'application/json',
          parameters : object,
          onSuccess : function() {
            Loading(false);
            alert(lang.LANG_CONFALERT_ALERT_SAVED_SUCCESS);
          },
          onFailure : function() {
            Loading(false);
            alert(lang.LANG_CONFALERT_ALERT_SAVED_FAIL);
          }
        });
    } else {
      Loading(false);
    }
}

function onSendTestAlert() {
    Loading(true);
    ButtonSaveOBJ.disabled = true;
    ButtonSendOBJ.disabled = true;
    testAlertmessage = false;
    if(mail_address1 == '' && mail_address2 == ''){
        alert(lang.LANG_CONFALERT_ALERT_CONFIG_MAIL_ADDRESS);
        ButtonSaveOBJ.disabled = false;
        ButtonSendOBJ.disabled = false;
        return;
    }
    var ajax_param = {};
    var mail_address1 = document.getElementById("_input_alert1_email_address").value;
    if(mail_address1 != ""){
      ajax_param = {
        "Recipient" : mail_address1,
        "Subject" : "PEF Alert",
        "MailContent" : "This is Test Mail."
      };
      call_send_mail_API(ajax_param);
    }
    var mail_address2 = document.getElementById("_input_alert2_email_address").value;
    if(mail_address2 != ""){
      ajax_param = {
        "Recipient" : mail_address2,
        "Subject" : "PEF Alert",
        "MailContent" : "This is Test Mail."
      };
      call_send_mail_API(ajax_param);
    }
    setTimeout(CompleteTestAlert, 500);
}

function call_send_mail_API(data){
    var object = JSON.stringify(data);
    var ajax_url =
        '/redfish/v1/PefService/Actions/PefService.SendAlertMail/';
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'POST',
      contentType : 'application/json',
      parameters : object,
      onSuccess : responseTestAlertSuccess,
      onFailure : responseTestAlertFailure,
    });
}
