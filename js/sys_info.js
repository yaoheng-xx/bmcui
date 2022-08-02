"use strict";
/* system information page */

var baseboard_sn;
var bios_id;
var browser_ie;
var color;
var curCPLDVer;
var dev_ave;
var host_pwr_st;
var image;
var lang_setting;
var lang;
var LEDamber;
var LEDblue;
var LEDgreen;
var me_rev;
var srcName;
var var_bak_fw_rev;
var var_build_time;
var var_fw_rev;
var var_sess_timeout;

window.addEventListener('load', PageInit);

if (parent.lang) { lang = parent.lang; }

var msgCableChkBMC = lang.LANG_CHASSIS_CHECK1;
var msgCableChkFeature = lang.LANG_CHASSIS_CHECK2;

var Device = new Array();

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/sys_info_hlp.html";

    dev_ave = document.getElementById("dev_ave");
    bios_id = document.getElementById("bios_id");
    me_rev = document.getElementById("me_rev");
    baseboard_sn = document.getElementById("baseboard_sn");
    LEDgreen = document.getElementById("LEDHealthGreen");
    LEDamber = document.getElementById("LEDFaultAmber");
    LEDblue = document.getElementById("LEDIDBlue");

    curCPLDVer=document.getElementById("curCPLDVer");

    OutputString();

    var_fw_rev=document.getElementById("fw_rev");
    var_bak_fw_rev=document.getElementById("backup_fw_rev");
    var_build_time=document.getElementById("build_time");
    image = document.getElementById('img1');

    var_sess_timeout=document.getElementById("session_timeout_opt1");
    image.onmouseover = function()
    {
        image.style.cursor = 'pointer';
        return;
    }
    if(browser_ie)
    {
      var_sess_timeout.add(
          new Option('30 ' + lang.CONF_LOGIN_STR_WEB_UNIT_MINUTES, 1800), 0);
      var_sess_timeout.add(
          new Option('1 ' + lang.CONF_LOGIN_STR_WEB_UNIT_HOUR, 3600), 1);
      var_sess_timeout.add(
          new Option('2 ' + lang.CONF_LOGIN_STR_WEB_UNIT_HOURS, 7200), 2);
      var_sess_timeout.add(
          new Option('4 ' + lang.CONF_LOGIN_STR_WEB_UNIT_HOURS, 14400), 3);
      var_sess_timeout.add(
          new Option('8 ' + lang.CONF_LOGIN_STR_WEB_UNIT_HOURS, 28800), 4);
      var_sess_timeout.add(
          new Option('1 ' + lang.CONF_LOGIN_STR_WEB_UNIT_DAY, 86400), 5);
    } else {
      var_sess_timeout.add(
          new Option('30 ' + lang.CONF_LOGIN_STR_WEB_UNIT_MINUTES, 1800), null);
      var_sess_timeout.add(
          new Option('1 ' + lang.CONF_LOGIN_STR_WEB_UNIT_HOUR, 3600), null);
      var_sess_timeout.add(
          new Option('2 ' + lang.CONF_LOGIN_STR_WEB_UNIT_HOURS, 7200), null);
      var_sess_timeout.add(
          new Option('4 ' + lang.CONF_LOGIN_STR_WEB_UNIT_HOURS, 14400), null);
      var_sess_timeout.add(
          new Option('8 ' + lang.CONF_LOGIN_STR_WEB_UNIT_HOURS, 28800), null);
      var_sess_timeout.add(
          new Option('1 ' + lang.CONF_LOGIN_STR_WEB_UNIT_DAY, 86400), null);
    }

    var_sess_timeout.onchange = function() {
      var timeout = parseInt(var_sess_timeout.value);
      var ajax_url = '/redfish/v1/SessionService';
      var ajax_param = {"SessionTimeout" : timeout};
      var object = JSON.stringify(ajax_param);
      var ajax_req = new Ajax.Request(ajax_url, {
        method : 'PATCH',
        contentType : 'application/json',
        parameters : object,
        onSuccess : function(
            arg) { alert(lang.LANG_CONFIG_WEBSESSION_TIMEOUT_SUCCESS); },
        onFailure :
            function() { alert(lang.LANG_CONFIG_WEBSESSION_TIMEOUT_FAIL); }
      });
    }
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("caption_div").textContent = lang.LANG_SYS_INFO_CAPTION;
    document.getElementById("caption_legend").textContent = lang.LANG_SYS_INFO_CAPTION;
    document.getElementById("host_pwr_st_label").textContent = lang.LANG_SYS_INFO_HOST_PWR_ST;
    document.getElementById("soft_license_st_label").textContent = lang.LANG_SYS_INFO_SOFT_LICENSE_ST;
    document.getElementById("dev_ave_label").textContent = lang.LANG_SYS_INFO_DEV_AVE;
    document.getElementById("build_time_label").textContent = lang.LANG_SYS_INFO_BUILD_TIME;
    document.getElementById("bios_id_label").textContent = lang.LANG_SYS_INFO_BIOS_ID;
    document.getElementById("fw_rev_label").textContent = lang.LANG_SYS_INFO_FW_REV;
    document.getElementById("back_fw_label").textContent = lang.LANG_SYS_INFO_BAK_FW_REV;
    document.getElementById("mw_fw_rev_label").textContent = lang.LANG_SYS_INFO_ME_FW_REV;
    document.getElementById("baseboard_sn_no_label").textContent = lang.LANG_SYS_INFO_BASEBOARD_SN_NO;
    document.getElementById("sys_health_label").textContent = lang.LANG_SYS_INFO_OVERALL_SYS_HEALTH;
    document.getElementById("sess_timeout_legend").textContent = lang.LANG_SYS_INFO_USER_SESS_TIMEOUT;
    document.getElementById("remote_console_legend").textContent = lang.LANG_SYS_INFO_REMOTE_CONSOLE_GROUP;
    document.getElementById("web_timeout_legend").textContent = lang.CONF_LOGIN_STR_WEB_TIMEOUT;

    document.getElementById("cpld_rev_span").textContent = lang.LANG_SYS_INFO_CPLD_REV;
}

function ConfigWebSessionHandler(arg) {
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
        alert(lang.LANG_CONFIG_WEBSESSION_TIMEOUT_SUCCESS, {title: lang.LANG_GENERAL_SUCCESS});
        checkSessionExpired();
        parent.resetIdleTimer();
    }
}
function PrivilegeCallBack(Privilege)
{
  var_sess_timeout.disabled = false;
  // full access
  if (Privilege == '04') {
    requestKcsAndSystemHealthAndPwrStatus();
    requestSystemInfoAndBmcBuildTime();
    getSessionTimeout();
    getFruDevice();
    getBIOSID();
    getMEFWRev();
    getCPLDFWRev();
    getBackupBMCFWRev();
    getSwlStatus(SwlCallBack);
    }
    else if(Privilege == '03')
    {
        requestKcsAndSystemHealthAndPwrStatus();
        requestSystemInfoAndBmcBuildTime();
        getSessionTimeout();
        getFruDevice();
        getBIOSID();
        getMEFWRev();
        getCPLDFWRev();
        getBackupBMCFWRev();
        getSwlStatus(SwlCallBack);
    }
    //only view
    else if(Privilege == '02')
    {
        requestKcsAndSystemHealthAndPwrStatus();
        requestSystemInfoAndBmcBuildTime();
        getSessionTimeout();
        getFruDevice();
        getBIOSID();
        getMEFWRev();
        getCPLDFWRev();
        getBackupBMCFWRev();
        getSwlStatus(SwlCallBack);
    }
    //no access
    else
    {
        location.href = SubMainPage;
        var_sess_timeout.disabled = true;
        return;
    }
}
function requestKcsAndSystemHealthAndPwrStatus() {
  var ajaxUrl = "/redfish/v1/Systems/system";
  var ajaxData = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    onSuccess : function(response) {
      getKcsStatus(response);
      SystemHealthHandler(response);
      getPwrStatusHandler(response);
    },
    onFailure : function() { alert("Error in Getting System Informations!!"); }
  });
}

function getKcsStatus(response) {
  if (response.readyState == 4 && response.status == 200) {
    var orgReq = JSON.parse(response.responseText);
    var kcsData = orgReq.Oem.OpenBmc;
    if (kcsData.hasOwnProperty("KcsPolicyControlMode")) {
      if (kcsData.KcsPolicyControlMode.Value == "Provisioning") {
        CreateCookie("KCSMode", "allow_all");
      } else if (kcsData.KcsPolicyControlMode.Value ==
                 "ProvisionedHostAllowlist") {
        CreateCookie("KCSMode", "restricted");
      } else if (kcsData.KcsPolicyControlMode.Value ==
                 "ProvisionedHostDisabled") {
        CreateCookie("KCSMode", "deny_all");
      } else {
        CreateCookie("KCSMode", "deny_all");
      }
    }
    checkBmcSecurityControlModeWarning(lang.CONF_KCS_BANNER);
  }
}

function getBIOSID(){
  Loading(true);
  var ajax_url = '/redfish/v1/UpdateService/FirmwareInventory/bios_active';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : onBiosIDResponse,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      bios_id.textContent = "N/A";
    }
  })
}
function onBiosIDResponse(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
        var res = JSON.parse(arg.responseText);
        bios_id.textContent = res.Version;
    }
}

function getMEFWRev() {
  Loading(true);
  var ajax_url = '/redfish/v1/UpdateService/FirmwareInventory/me';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : onMEFWRevResponse,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      me_rev.textContent = "N/A";
    }
  });
}

function onMEFWRevResponse(arg) {
  Loading(false);
  me_rev.textContent = "N/A";
  if (arg.readyState == 4 && arg.status == 200) {
    var res = JSON.parse(arg.responseText);
    me_rev.textContent = res.Version;
  }
}

function getCPLDFWRev() {
  Loading(true);
  var ajax_url = '/redfish/v1/UpdateService/FirmwareInventory/cpld_active';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : onCPLDFWRevResponse,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      curCPLDVer.textContent = "N/A";
    }
  });
}

function onCPLDFWRevResponse(arg) {
  Loading(false);
  curCPLDVer.textContent = "N/A";
  if (arg.readyState == 4 && arg.status == 200) {
    var res = JSON.parse(arg.responseText);
    curCPLDVer.textContent = res.Version;
  }
}

function getBackupBMCFWRev() {
  var ajax_url = '/redfish/v1/UpdateService/FirmwareInventory/bmc_recovery';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : onBackupBMCFWRevResponse,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      var_bak_fw_rev.textContent = "N/A";
    }
  })
}
function onBackupBMCFWRevResponse(arg) {
  Loading(false);
  var_bak_fw_rev.textContent = "N/A";
  if (arg.readyState == 4 && arg.status == 200) {
    var res = JSON.parse(arg.responseText);
    var_bak_fw_rev.textContent = res.Version;
  }
}
function requestSystemInfoAndBmcBuildTime() {
  Loading(true);
  var ajax_url = '/redfish/v1/Managers/bmc';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : function(response) {
      onSystemInfoResponse(response);
      recBMCBuildTime(response);
    },
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_FIRMWARE_INFO_GET_FAILED);
    }
  });
}

function getSessionTimeout() {
  Loading(true);
  var ajax_url = '/redfish/v1/SessionService';
  var ajax_req = new Ajax.Request(ajax_url, {
    method: 'GET',
    onSuccess: function (response) {
      const preDefinedValues = [1800, 3600, 7200, 14400, 28800, 86400];
      if (response.readyState == 4 && response.status == 200) {
        var res = JSON.parse(response.responseText);
        if (!preDefinedValues.includes(res.SessionTimeout)) {
          var_sess_timeout.add(
            new Option(lang.CONF_LOGIN_STR_WEB_TIMEOUT_CUSTOM + res.SessionTimeout.toString().concat(' ') + lang.CONF_LOGIN_STR_WEB_TIME_SEC, res.SessionTimeout), null);
        }
        var_sess_timeout.value = res.SessionTimeout;
      }
    },
    timeout: g_CGIRequestTimeout,
    ontimeout: onCGIRequestTimeout,
    onFailure: function () {
      Loading(false);
      alert(lang.LANG_SESSION_TIMEOUT_GET_FAILED);
    }
  });
}


function getLedStatus(status){
    var ledStatus = 2;
    switch(status){
        case "Off":
          ledStatus = 0;
          break;

        case "Lit":
        case "On":
          ledStatus = 2;
          break;

        case "Blinking":
          ledStatus = 1;
          break;

        default:
          ledStatus = 0;
          break;
    }

    return ledStatus;
}

function SystemHealthHandler(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var res = JSON.parse(arg.responseText);
    var status = "";
    status = res.Oem.OpenBmc.PhysicalLED;
    for (var i in status) {
      if (i.indexOf("@") != -1) {
        continue;
      }
      var imgtag = document.createElement('IMG');
      var health_status = 0;
      if (i == "SusackLED") {
        color = "blue";
        health_status = getLedStatus(res.IndicatorLED);
      }
      if (i == "GreenLED") {
        color = "green";
        health_status = getLedStatus(status[i]);
      }
      if (i == "AmberLED") {
        color = "amber";
        health_status = getLedStatus(status[i]);
      }

      if (health_status == 1) {
        srcName = "../images/" + color + "_" + health_status + ".gif";
      } else if (health_status == 0) {
        srcName = "../images/" + color + "_" + health_status + ".gif";
      } else {
        srcName = "../images/" + color + "_" + health_status + ".gif";
      }
      imgtag.setAttribute('src', srcName);
      if (color == "green") {
        LEDgreen.appendChild(imgtag);
        health_status == 0 ? LEDgreen.style.filter = 'brightness(0.6)'
                           : LEDgreen.style.filter = 'none';
      }
      if (color == "amber") {
        LEDamber.appendChild(imgtag);
        health_status == 0 ? LEDamber.style.filter = 'brightness(0.6)'
                           : LEDamber.style.filter = 'none';
      }
      if (color == "blue") {
        LEDblue.appendChild(imgtag);
        health_status == 0 ? LEDblue.style.filter = 'brightness(0.6)'
                           : LEDblue.style.filter = 'none';
      }
    }
  }
}

function getPwrStatusHandler(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var res = arg.responseJSON;
      var status = "Off";
      var currentPwrStatus = 0;

      status = res.PowerState;
      if (status == 'On') {
        currentPwrStatus = 1;
      }

        if(currentPwrStatus == 0)
        {
            document.getElementById("host_pwr_st").textContent = lang.LANG_S_POWER_CONTROL_STATUS_OFF;
            document.getElementById("host_pwr_st").className = 'labeltext text_power_state_off';
            host_pwr_st.style.color = "#990000";
            host_pwr_st.style.fontWeight = "bold";
        }
        else
        {
            document.getElementById("host_pwr_st").textContent = lang.LANG_S_POWER_CONTROL_STATUS_ON;
            document.getElementById("host_pwr_st").className = 'labeltext text_power_state_on';
            host_pwr_st.style.color = "#009900";
            host_pwr_st.style.fontWeight = "bold";
        }
    }
}

function onSystemInfoResponse(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var res = arg.responseJSON;

      if (res.PowerState.indexOf("On") != -1) {
        dev_ave.textContent = "Yes";
      } else {
        dev_ave.textContent = "No";
      }
      var firmware_version = res.FirmwareVersion;
      var fw_version = firmware_version;
      var_fw_rev.textContent = fw_version;
    }
}

function SwlCallBack(swl_status)
{
    if (swl_status == "ACTIVATED") {
        document.getElementById("soft_license_st").textContent = lang.LANG_CONFIG_SOFT_LICENSE_ACTIVED;
    } else {
        document.getElementById("soft_license_st").textContent = lang.LANG_CONFIG_SOFT_LICENSE_UNACTIVE;
    }
}

function getFruDevice() {
  var ajax_url = '/redfish/v1/Chassis';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onComplete : getFRUinfo,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_FRU_READ_FAIL);
    }
  })
}
function getFRUinfo(res) {
  if (res.readyState == 4 && res.status == 200) {
    var response = JSON.parse(res.responseText);
    var info_url = response.Members;
    baseboard_sn.textContent = "N/A";
    for (var i = 0; i < info_url.length; i++) {
      var url = info_url[i]["@odata.id"];
      var ajax_req = new Ajax.Request(url, {
        method : 'GET',
        onSuccess : function(res) {
          var response = JSON.parse(res.responseText);
          if (response.hasOwnProperty("Oem")) {
            recFruDev(response.Oem.FRUUpdatableProperties);
          }
        },
        onFailure : function() { Loading(false); }
      });
    }
  }
}
function recFruDev(arg) {
  if (arg.hasOwnProperty('Board')) {
    baseboard_sn.textContent = arg.Board.BoardSerialNumber;
  }
}
function recBMCBuildTime(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var dateString = "";
    var res = arg.responseJSON;
    dateString = res.Oem.OpenBmc.FirmwareBuildTime;
    var con_date =
        new Date(dateString.substring(0, 4), dateString.substring(4, 6) - 1,
                 dateString.substring(6, 8), dateString.substring(8, 10),
                 dateString.substring(10, 12), dateString.substring(12)) +
        "";
    var_build_time.textContent =
        con_date.split(" ").slice(1, 5).join(" ") + " UTC";
  }
}
