/* Configuration -- Security Settings  */
"use strict";
var solSSHservicePrevious = false;
var RMservicePrevious = false;
var RMCPservicePrevious = false;
var ComplexPasswordPrevious = 0;
var PasswordHistoryPrevious = 0;
var httpsPort;
var solSSHPort;
var HTTPsPORTPrevious = '';
var solSSHPortPrevious = '';
var FAILEDTIMESPrevious = '';
var LOCKOUTIMEPrevious = '';
var passwordService_history;
var passwordService;
var solSSHService;
var rmcpService;
var RemoteMediaService;
var change_count = 0;
var kcsMode = '';
var kcsModePrevious = '';
var selectOption;
var failedAttempts;
var saveBtn;
var lockoutTime;

var hostInterfaceEnabledPrevious = false;
var hostInterfaceEnabled = false;

window.addEventListener('load', PageInit);
var lang;
if (parent.lang) { lang = parent.lang; }

function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_security_hlp.html";
    solSSHService = document.getElementById("SOLsshService");
    rmcpService = document.getElementById("rmcpService");
    RemoteMediaService = document.getElementById("RemoteMediaService");
    passwordService = document.getElementById("passwordService");
    passwordService_history = document.getElementById("password_history");

    saveBtn = document.getElementById("saveBtn");
    saveBtn.setAttribute("value", lang.CONF_LOGIN_STR_SAVE);
    saveBtn.onclick= btnSaved;
    initKcsPolicyControlMode();

    failedAttempts = document.getElementById("failedAttempts");
    failedAttempts.addEventListener("keypress", validateNumeric);
    failedAttempts.addEventListener("keydown", validateNumeric);

    lockoutTime = document.getElementById("lockoutTime");
    lockoutTime.addEventListener("keypress", validateNumeric);
    lockoutTime.addEventListener("keydown", validateNumeric);

    httpsPort = document.getElementById("httpsPort");
    httpsPort.addEventListener("keypress", validateNumeric);
    httpsPort.addEventListener("keydown", validateNumeric);

    solSSHPort = document.getElementById("solsshPort");
    solSSHPort.addEventListener("keypress", validateNumeric);
    solSSHPort.addEventListener("keydown", validateNumeric);
    OutputString();
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("title_div").textContent = lang.CONF_LOGIN_PAGE_TITLE;
    document.getElementById("attemp_legen").textContent = lang.CONF_LEGEND_LOGIN_ATTEMPT;
    document.getElementById("failed_attempts_lbl").textContent = lang.CONF_LOGIN_STR_FAILED_ATTEMPTS;
    document.getElementById("lockout_time_lbl").textContent = lang.CONF_LOGIN_STR_LOCKOUT_TIME;
    document.getElementById("port_setting_legend").textContent = lang.CONF_LEGEND_PORT_SETTING;
    document.getElementById("https_port_lbl").textContent = lang.CONF_LOGIN_STR_HTTP_SEC_PORT;
    document.getElementById("solssh_port_lbl").textContent =
        lang.CONF_LOGIN_STR_SOL_SSH_PORT;
    document.getElementById("network_services_legend").textContent = lang.CONF_LEGEND_NETWORK_SERVICES;
    document.getElementById("sol_service_lbl").textContent =
        lang.CONF_LOGIN_STR_SOL_SSH_SERVICE;
    document.getElementById("login3_enable_lbl").textContent =
        lang.CONF_LOGIN_STR_ENABLE;
    document.getElementById("rmcp_service_lbl").textContent = lang.CONF_LOGIN_STR_RMCP_SERVICE;
    document.getElementById("login4_enable_lbl").textContent = lang.CONF_LOGIN_STR_ENABLE;
    document.getElementById("rm_service_lbl").textContent = lang.CONF_LOGIN_STR_RM_SERVICE;
    document.getElementById("login5_enable_lbl").textContent = lang.CONF_LOGIN_STR_ENABLE;
    document.getElementById("password_services_legend").textContent = lang.CONF_LEGNED_PASSWORD_MODE_SERVICES;
    document.getElementById("password_service_lbl").textContent = lang.CONF_COMPLEX_PASSWORD_SERVICES;
    document.getElementById("password_history_service_lbl").textContent =
        lang.CONF_HISTORY_PASSWORD_SERVICES;
    document.getElementById("kcs_policy_control_mode_legend").textContent =
        lang.CONF_LEGNED_KCS_POLICY_CONTROL_MODE;
    document.getElementById("kcs_pcm_lbl").textContent =
        lang.CONF_KCS_RESTRICTION_MODE;

    document.getElementById("enable_host_interface_legend").textContent =
        lang.LANG_CONF_LEGEND_HOST_INTERFACE;
    document.getElementById("enable_host_interface_lbl").textContent =
        lang.LANG_CONF_ENABLE_HOST_INTERFACE;
}

function PrivilegeCallBack(Privilege)
{
    if (Privilege == '04')
    {
      requestReadConfig();
      requestKcsMode();
      getServicesStatus();
      getOptional_network_IPMI_Over_LAN();
      getloginAttempt_passwordMode();
      getRMediastatus();
    } else if (Privilege == '03') {
      requestReadConfig();
      requestKcsMode();
      getServicesStatus();
      getOptional_network_IPMI_Over_LAN();
      getloginAttempt_passwordMode();
      getRMediastatus();
      saveBtn.disabled = true;
    } else {
      location.href = SubMainPage;
      saveBtn.disabled = true;
    }
}
function initKcsPolicyControlMode() {
  var kcsTypeCategory = {
    "Provisioning" : lang.CONF_KCS_ALLOW_ALL_MODE,
    "ProvisionedHostAllowlist" : lang.CONF_KCS_RESTRICTED_MODE,
    "ProvisionedHostDisabled" : lang.CONF_KCS_DENY_ALL_MODE
  };
  selectOption = document.getElementById("kcs_type_select");
  var i = 0;
  for (var prop in kcsTypeCategory) {
    if (kcsTypeCategory[prop]) {
      selectOption.add(new Option(kcsTypeCategory[prop], prop),
                       browser_ie ? i : null);
      i++;
    }
  }
  selectOption.onchange = storeKcsMode;
}
function storeKcsMode() { kcsMode = selectOption.value; }
function requestKcsMode() {
  var ajaxUrl = "/redfish/v1/Systems/system";
  var ajaxData = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    onSuccess : getKcsStatus,
    onFailure :
        function() { alert("Error in Getting KCS Mode Configurations!!"); }
  });
}
function getKcsStatus(response) {
  if (response.readyState == 4 && response.status == 200) {
    var orgReq = JSON.parse(response.responseText);
    var kcsData = orgReq.Oem.OpenBmc;
    if (kcsData.KcsPolicyControlMode.Value == "Provisioning") {
      CreateCookie("KCSMode", "allow_all");
      selectOption.selectedIndex = 0;
      kcsModePrevious = kcsMode = "Provisioning";
    } else if (kcsData.KcsPolicyControlMode.Value ==
               "ProvisionedHostAllowlist") {
      CreateCookie("KCSMode", "restricted");
      selectOption.selectedIndex = 1;
      kcsModePrevious = kcsMode = "ProvisionedHostAllowlist";
    } else if (kcsData.KcsPolicyControlMode.Value ==
               "ProvisionedHostDisabled") {
      CreateCookie("KCSMode", "deny_all");
      selectOption.selectedIndex = 2;
      kcsModePrevious = kcsMode = "ProvisionedHostDisabled";
    } else {
      CreateCookie("KCSMode", "deny_all");
      selectOption.selectedIndex = 2;
      kcsModePrevious = kcsMode = "ProvisionedHostDisabled";
    }
    checkBmcSecurityControlModeWarning(lang.CONF_KCS_BANNER);
    updateSolSSHStatus(orgReq);
  }
}
function updateSolSSHStatus(arg) {
  solSSHPortPrevious = solSSHPort.value = arg.SerialConsole.SSH.Port;
  solSSHservicePrevious = solSSHService.checked =
      arg.SerialConsole.SSH.ServiceEnabled;
}
function getloginAttempt_passwordMode() {
  Loading(true);
  var ajax_url = "/redfish/v1/AccountService";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : updateLoginAttempAndPasswordStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_PASS_ERROR_MSG);
    }
  });
}

function updateLoginAttempAndPasswordStatus(response) {
  Loading(false);
  if (response.readyState == 4 && response.status == 200) {
    var org_req = JSON.parse(response.responseText);
    var complex_password_mode = org_req.Oem.OpenBMC.PasswordPolicyComplexity;
    var password_history_mode = org_req.Oem.OpenBMC.RememberOldPasswordTimes;
    ComplexPasswordPrevious = passwordService.value = complex_password_mode;
    PasswordHistoryPrevious = passwordService_history.value = password_history_mode;
    var failTimes = org_req.AccountLockoutThreshold;
    var blockoutTime = org_req.AccountLockoutDuration;
    FAILEDTIMESPrevious = failedAttempts.value = failTimes;
    LOCKOUTIMEPrevious = lockoutTime.value = blockoutTime;
  }
}

function getOptional_network_IPMI_Over_LAN() {
  Loading(true);
  var ajax_url = "/redfish/v1/Managers/bmc/NetworkProtocol";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : updateOptional_network_IPMI_Over_LAN,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_OPTIONAL_ERROR_MSG);
    }
  });
}
function updateOptional_network_IPMI_Over_LAN(response) {
  Loading(false);
  if (response.readyState == 4 && response.status == 200) {
    var org_req = JSON.parse(response.responseText);
    RMCPservicePrevious = rmcpService.checked = org_req.IPMI.ProtocolEnabled;
  }
}
function getRMediastatus() {
  Loading(true);
  var ajax_url = "/redfish/v1/Systems/system";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : updateRmediaStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_RMEDIA_ERROR_MSG);
    }
  });
}
function updateRmediaStatus(response) {
  Loading(false);
  if (response.readyState == 4 && response.status == 200) {
    var org_req = JSON.parse(response.responseText);
    var rmediaStatus = org_req.VirtualMediaConfig.ServiceEnabled;
    RMservicePrevious = RemoteMediaService.checked = rmediaStatus;
  }
}
function setPasswordStatus() {
  Loading(true);
  var ajax_url = "/redfish/v1/AccountService";
  var ajax_param = {};
  ajax_param.Oem = {};
  ajax_param.Oem.OpenBMC = {};
  ajax_param.Oem.OpenBMC.PasswordPolicyComplexity = passwordService.value;
  ajax_param.Oem.OpenBMC.RememberOldPasswordTimes =
      parseInt(passwordService_history.value, 10);
  ComplexPasswordPrevious = passwordService.value;
  PasswordHistoryPrevious = passwordService_history.value;
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : HandleSuccessStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_PASS_MODE_SET_ERROR_MSG);
    }
  });
}
onload = function() { document.title = lang.CONF_LOGIN_STR_TITLE; };
function btnSaved() {
  change_count = 0;

  var enableHostinterface = document.getElementById("_enableHostInterface");
  if (enableHostinterface.checked != hostInterfaceEnabledPrevious) {
    change_count += 1;
    updateHosthostinterface(enableHostinterface.checked);
  }

  if (FAILEDTIMESPrevious != failedAttempts.value ||
      LOCKOUTIMEPrevious != lockoutTime.value) {
    if (parseInt(failedAttempts.value, 10) <= 255 &&
        parseInt(lockoutTime.value, 10) <= 65535) {
      change_count += 1;
      setUserBlockout();
    } else {
      if (parseInt(failedAttempts.value, 10) > 255) {
        alert(lang.CONF_LOGIN_STR_FAILED_ATTEMPTS_WARN);
        return;
      }
      if (parseInt(lockoutTime.value, 10) > 65535) {
        alert(lang.CONF_LOGIN_STR_LOCKOUT_TIME_WARN);
        return;
      }
    }
  }
  if (passwordService.value != ComplexPasswordPrevious ||
      passwordService_history.value != PasswordHistoryPrevious) {
    change_count += 1;
    setPasswordStatus();
  }
  if (HTTPsPORTPrevious != httpsPort.value) {
    change_count += 1;
    if (!confirm(
            "Warning: Changing port will cause the Web server to stop responding on the current port. You will need to reconnect after this action completes.")) {
      change_count--;
    } else {
      setHTTPSPort();
    }
  }
  if (solSSHPortPrevious != solSSHPort.value) {
    change_count += 1;
    setSolSSHPort();
  }
  if (solSSHservicePrevious != solSSHService.checked) {
    change_count += 1;
    setSolSSHServiceStatus();
  }
  if (rmcpService.checked != RMCPservicePrevious) {
    change_count += 1;
    setRMCPserviceStatus();
  }
  if (RemoteMediaService.checked != RMservicePrevious) {
    change_count += 1;
    setRMediaStatus();
  }
  if (kcsModePrevious != kcsMode) {
    change_count += 1;
    setKCSMode();
  }
}
function setKCSMode() {
  Loading(true);
  if (!kcsMode) {
    return;
  }
  var ajaxUrl = "/redfish/v1/Systems/system";
  var ajaxParam = {"KcsPolicyControlMode" : kcsMode};
  var object = JSON.stringify(ajaxParam);
  var ajaxReq = new Ajax.Request(ajaxUrl, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : function() {
      Loading(false);
      HandleSuccessStatus();
    },
    onFailure : function() { alert("Error in Setting kcs mode!!"); }
  });
}
function setHTTPSPort() {
  Loading(true);
  var ajax_url = "/redfish/v1/Managers/bmc/NetworkProtocol";
  var ajax_param = {};
  ajax_param.HTTPS = {};
  ajax_param.HTTPS.Port = parseInt(httpsPort.value);
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : HandleSuccessStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_HTTPS_PORT_SET_ERROR_MSG);
    }
  });
}
function setSolSSHPort() {
  Loading(true);
  var ajax_url = "/redfish/v1/Systems/system";
  var ajax_param = {
    "SerialConsole" : {"SSH" : {"Port" : parseInt(solSSHPort.value, 10)}}
  };
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : HandleSuccessStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_SOL_SSH_PORT_SET_ERROR_MSG);
    }
  });
}
function setSolSSHServiceStatus() {
  Loading(true);
  var ajax_url = "/redfish/v1/Systems/system";
  var ajax_param = {
    "SerialConsole" : {"SSH" : {"ServiceEnabled" : solSSHService.checked}}
  };
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : HandleSuccessStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_SOL_SSH_SET_ERROR_MSG);
    }
  });
}
function setRMCPserviceStatus() {
  Loading(true);
  var ajax_url = "/redfish/v1/Managers/bmc/NetworkProtocol";
  var ajax_param = {};
  ajax_param.IPMI = {};
  ajax_param.IPMI.ProtocolEnabled = rmcpService.checked;
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : HandleSuccessStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_IPMI_OVER_LAN_SET_ERROR_MSG);
    }
  });
}
function setRMediaStatus() {
  Loading(true);
  var ajax_url = "/redfish/v1/Systems/system";
  var rmediaStatus = RemoteMediaService.checked;
  var object = JSON.stringify(
      {"VirtualMediaConfig" : {"ServiceEnabled" : rmediaStatus}});
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : HandleSuccessStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_RMEDIA_SET_ERROR_MSG);
    }
  });
}
function getServicesStatus() {
  Loading(true);
  var ajax_url = "/redfish/v1/Managers/bmc/NetworkProtocol";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : servicesStateResult,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_OPTIONAL_NET_ERROR_MSG);
    }
  });
}
function servicesStateResult(originalRequest) {
  Loading(false);
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var org_req = JSON.parse(originalRequest.responseText);
    var HTTPS_DATA = org_req.HTTPS;
    HTTPsPORTPrevious = httpsPort.value = HTTPS_DATA.Port;
  }
}
function setUserBlockout() {
  Loading(true);
  var ajax_url = "/redfish/v1/AccountService";
  var ajax_param = {};
  ajax_param.AccountLockoutThreshold = parseInt(failedAttempts.value, 10);
  ajax_param.AccountLockoutDuration = parseInt(lockoutTime.value, 10);
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : HandleSuccessStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_USER_LOCK_ERROR_MSG);
    }
  });
}
function HandleSuccessStatus(originalRequest) {
  change_count = change_count - 1;
  if (change_count == 0) {
    Loading(false);
    alert(lang.CONF_SUCCESS_MSG, {
      title : lang.LANG_GENERAL_SUCCESS,
      onClose : function() {
        location.href = "/page/config_no_smash_security_settings.html";
      }
    });
  }
}

function updateHosthostinterface(value) {
  var ajax_url = "/redfish/v1/Managers/bmc/EthernetInterfaces/eth2";
  var obj = {};
  obj.InterfaceEnabled = value;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : JSON.stringify(obj),
    onSuccess : HandleSuccessStatus,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_USER_LOCK_ERROR_MSG);
    }
  });
}

function requestReadConfig() {
  var ajax_url = '/redfish/v1/Managers/bmc/EthernetInterfaces/';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    contentType : "application/json",
    onComplete : readNICConfig,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout
  });
}

function readNICConfig(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var channelInfo = arg.responseJSON;
    var i = 0;
    for (i = 0; i < channelInfo["Members@odata.count"]; i++) {
      var url = channelInfo.Members[i]["@odata.id"];
      var interfaceId = url.split('/').pop();

      if (interfaceId.indexOf("eth2") != -1) {
        var ajax_url = url;
        var ajax_req = new Ajax.Request(ajax_url, {
          method : 'GET',
          asynchronous : false,
          contentType : "application/json",
          onComplete : readNICInfo,
          timeout : g_CGIRequestTimeout,
          ontimeout : onCGIRequestTimeout
        });
      }
    }
    updateNICConfiguration();
  }
}

function readNICInfo(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var channelconfig = arg.responseJSON;
    hostInterfaceEnabledPrevious = channelconfig.InterfaceEnabled;
    hostInterfaceEnabled = channelconfig.InterfaceEnabled;
  }
}

function updateNICConfiguration() {
  if (!hostInterfaceEnabled) {
    return;
  }
  var attr;
  attr = hostInterfaceEnabled;
  var enableHosinterface = document.getElementById("_enableHostInterface");
  if (attr) {
    enableHosinterface.checked = true;
  } else {
    enableHosinterface.checked = false;
  }
}
