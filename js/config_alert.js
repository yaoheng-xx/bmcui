"use strict";
var AlertTable;
var ButtonSaveOBJ;
var ButtonSendOBJ;
var eventfilterObj = {};
var destinationObj = {};
var destIndex = 0;
var eventfilterObj = {};
var lang;

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

    btn = document.getElementById("_input_alert1_email_address");
    btn = document.getElementById("_input_alert2_email_address");

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

function setSensorType(){
    document.getElementById("_check_temperature").setAttribute("sensor_type","1");
    document.getElementById("_check_voltage_out_of_range").setAttribute("sensor_type","2");

}

function getPEFGlobalControls(){
    Loading(true);
    var ajax_url = "/redfish/v1/PefService";
    var ajax_data = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: bindGlobalParamters,
        onFailure: function() {
            alert("Error in Getting PEF Global Controls!!");
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

function performSaveGlobalControls() {
  Loading(true);
  var ajax_url = "/redfish/v1/PefService";
  var ajax_param = {"PEFActionGblControl" : enable_data};
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : responsepeformGlobalControls,
    onFailure : function() {
      Loading(false);
      alert("Error in settings PEF Global parameters");
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
      SendMultiplePEF(tmp);
}

function CompleteTestAlert() {
    alert(lang.LANG_CONFALERT_ALERTSENT, {title:lang.LANG_CONFALERT_BTNTESTALR});
    location.reload();
}

function GetAlerts() {
    Loading(true);
    var ajax_url = "/redfish/v1/PefService";
    var ajax_data = new Ajax.Request(ajax_url, {
      method : 'GET',
      onSuccess : ShowAlertTable,
      onFailure : function() { alert("Error in Getting alert destination!!"); }
    })
}

function GetDestinationType() {
    Loading(true);
    var ajax_url = "/redfish/v1/PefService";
    var ajax_data = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: ShowDestinationType,
        onFailure: function() {
            // alert("Error in Getting destination type!!");
            Loading(false);
        }
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

function updateTextObj(obj, value) {
    if(obj != null) {
        if(value != null) {
            obj.value = value;
        }
    }
}

function responseTestAlertSNMP(originalRequest) {
  Loading(false);
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    ButtonSaveOBJ.disabled = false;
    ButtonSendOBJ.disabled = false;
    alert(lang.LANG_CONFALERT_ALERTSENT,
          {title : lang.LANG_CONFALERT_BTNTESTALR});
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
        if(email1.value != ""){
            tmp_arr.push(email1.value);
        }
        if(email2.value != ""){
            tmp_arr.push(email2.value);
        }
        var ajax_param = {"Recipient" : tmp_arr};
        var ajax_url = "/redfish/v1/PefService";
        var object = JSON.stringify(ajax_param);
        var ajax_req = new Ajax.Request(ajax_url, {
          method : 'PATCH',
          contentType : 'application/json',
          parameters : object,
          onSuccess : function() {
            Loading(false);
            alert("Alert Configuration saved successfully!!");
          },
          onFailure : function() {
            Loading(false);
            alert(lang.LANG_CONFALERT_FAILSAVE);
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
    if(mail_address1 == '' && mail_address2 == ''){
        alert("Configure Email Address to Send Test Alert!!");
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
}
function call_send_mail_API(data){
    var object = JSON.stringify(data);
    var ajax_url =
        '/redfish/v1/PefService/Actions/PefService.SendAlertMail/';
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'POST',
      contentType : 'application/json',
      parameters : object,
      onSuccess : responseTestAlertSNMP,
      onFailure : function() {
        Loading(false);
        ButtonSaveOBJ.disabled = false;
        ButtonSendOBJ.disabled = false;
        alert("Error in sending test alert");
      }
    });
}

function onChangeAlertDestination(dest, type) {
    var obj = null;
    if(dest == "1") {
        if(type == "snmp") {
            obj = document.getElementById("_input_alert1_email_address");
            obj.disabled = true;
        }
        else if(type == "email") {
            obj = document.getElementById("_input_alert1_email_address");
            obj.disabled = false;
        }
    }
    else if(dest == "2") {
        if(type == "snmp") {
            obj = document.getElementById("_input_alert2_email_address");
            obj.disabled = true;
        }
        else if(type == "email") {
            obj = document.getElementById("_input_alert2_email_address");
            obj.disabled = false;
        }
    }
}
