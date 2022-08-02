/* configuration firmware update page */
(function($) {
"use strict";
$( document ).ready(function() { $.PageInit(); });
var lang;
var saveBtn;
var newRsysip;
if (parent.lang) {
  lang = parent.lang;
}

$.PageInit = function() {
  document.title = lang.LANG_CONFIG_SUBMENU_FWUPD;
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/config_sysrd_ip_hlp.html";
  $("#saveBtn").attr("value", lang.LANG_AD_ADV_SAVE).click(RsysIp_update);
  $("#enable_remote_syslog").change(function() {
    var objEnable = document.getElementById("enable_remote_syslog");
    if (objEnable.checked == true) {
      $('#newRsysIp').attr("disabled", false);
    } else {
      $('#newRsysIp').val('');
      $('#newRsysIp').attr("disabled", true);
    }
  });
  OutputString();
  CheckUserPrivilege(PrivilegeCallBack);
};

function updateInfo() { GetRsysIpInfo(); }

function OutputString() {
  document.getElementById("submenu_div").textContent =
      lang.LANG_CONFIG_SUBMENU_RSYS_LOG_IP;
  document.getElementById("desc_p").textContent =
      lang.LANG_CONFIG_RSYS_LOG_IP_DESC;
  document.getElementById("submenu_legend").textContent =
      lang.LANG_CONFIG_SUBMENU_RSYS_LOG_IP;
  document.getElementById("current_rsys_ip_address").textContent =
      lang.LANG_SYS_INFO_CURRENT_RSYS_LOG_ADDRESS;
  document.getElementById("new_rsys_ip_address").textContent =
      lang.LANG_SYS_INFO_NEW_RSYS_LOG_ADDRESS;
  document.getElementById("enable_remote_syslog_header").textContent =
      lang.LANG_ENABLE_SYSLOG_SERVER_HEADER;
}

function PrivilegeCallBack(Privilege) {
  // full access
  saveBtn = $("#saveBtn");
  newRsysip = $('#newRsysIp');
  if (Privilege == '04') {
    saveBtn.prop("disabled", false);
    newRsysip.attr("disabled", true);
    updateInfo();
  }
  // only view
  else if (Privilege == '03' || Privilege == '02') {
    saveBtn.prop("disabled", true);
    newRsysip.attr("disabled", true);
    updateInfo();
  }
  // no access
  else {
    location.href = SubMainPage;
    saveBtn.prop("disabled", true);
    newRsysip.attr("disabled", true);
  }
}

function GetRsysIpInfo() {
  Loading(true);
  var ajax_url = '/redfish/v1/Systems/system/LogServices/Rsyslog';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : ParseRsysIp,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFIG_SYS_LOG_SERVER_CONFIG_GET_FAILED);
    }
  });
}

function ParseRsysIp(arg) {
  Loading(false);
  if (arg.readyState == 4 && (arg.status == 200 || arg.status == 204)) {
    var SysInfo = JSON.parse(arg.responseText);
    var sysRdEnable = SysInfo.ServiceEnabled;
    var sysRdIP = SysInfo.Oem.Intel.ServerIP == 'local2'
                      ? ''
                      : SysInfo.Oem.Intel.ServerIP;
    if (sysRdEnable) {
      $('#curRsysIp').text(sysRdIP);
      $('#enable_remote_syslog').attr('checked', true);
      $('#newRsysIp').attr("disabled", false);
    } else {
      $('#curRsysIp').text("0.0.0.0");
      $('#enable_remote_syslog').attr('checked', false);
      $('#newRsysIp').attr("disabled", true);
    }
  }
}

function updateconfig(arg) {
  Loading(false);
  if (arg.readyState == 4 && (arg.status == 200 || arg.status == 204)) {
    var item = document.getElementById("enable_remote_syslog");
    if (item.checked == true) {
      var ipAddr = $('#newRsysIp').val();
      $('#curRsysIp').text(ipAddr);
      alert(lang.LANG_CONF_SYSRD_IP_UPDATE_SUCCESS);
    } else {
      $('#curRsysIp').text('0.0.0.0');
      alert(lang.LANG_CONF_SYSRD_IP_DISABLE_SUCCESS);
    }
  }
}

function RsysIp_update() {
  var ipAddr = $('#newRsysIp').val();
  var item = document.getElementById("enable_remote_syslog");
  if (item.checked == true) {
    if (!CheckIP(ipAddr)) {
      alert(lang.LANG_CONFIG_NETWORK_ERR_INVALID_IP);
      return;
    }
  }

  Loading(true);
  var ajax_url;
  var object = {};
  if (item.checked == false) {
    ajax_url = '/redfish/v1/Systems/system/LogServices/Rsyslog';
    object = JSON.stringify({"ServiceEnabled" : false});
    call_API(ajax_url, object);
    return;
  }
  if (ipAddr != '') {
    ajax_url = '/redfish/v1/Systems/system/LogServices/Rsyslog';
    object = JSON.stringify({"Oem" : {"Intel" : {"ServerIP" : ipAddr}}});
    call_API(ajax_url, object);
  }
}

function call_API(ajax_url, object) {
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : object,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : updateconfig,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFIG_SYS_LOG_SERVER_CONFIG_SET_FAILED);
    },
  });
}
})(jQuery);
