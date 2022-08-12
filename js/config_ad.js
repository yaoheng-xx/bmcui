"use strict";
var urlRdirect = 0;
var AdRemoteRoleMapping_array = [];
var LdRemoteRoleMapping_array = [];
var AdRowData = [];
var LdRowData = [];
var selected_row = '';
var AdPage = "/page/config_ad.html";
var sslLdapFlag;
var sslCaFlag;
var EnableAdSwitch;


var enableAd=true;

var AdIp;
var enableLDAPoverSSL;
var AdBinPW;
var AdBinDN;
var AdBase;
var AdUserID;
var AdTimeout;
var AdPortValue;
var AdIpValue;
var AdGroupName;
var AdGroupPrivilege;
var AdGroupDomain;
var AdGroupDelete;
var AdSave;
var LDGridTable;

window.addEventListener('load', ADPageInit);
var lang;
if (parent.lang) { lang = parent.lang; }
// TODO
/*
switch id设置查看ad还是ldap

Save delete 根据 switch调换
init使用ad
groupclick根据改变
*/

function ADPageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/configure_ad_hlp.html";
  document.getElementById("ADButtonSave").value = lang.LANG_CONFIG_AD_SAVE;
  document.getElementById("ADButtonDeleteGroup").value = "Delete";
  EnableAdSwitch = document.getElementById("ADSwitchAD");
  EnableAdSwitch.addEventListener("click", onAdEnable);
  AdIp = document.getElementById("ADIP");
  enableLDAPoverSSL = document.getElementById("ADenableSSL");
  AdBinPW = document.getElementById("ADBINDPW");
  AdBinDN = document.getElementById("ADBINDWN");
  AdBase = document.getElementById("ADBASE");
  AdUserID = document.getElementById("ADUSERID");
  AdGroupName = document.getElementById("ADGROUPNAME");
  AdGroupPrivilege = document.getElementById("ADGROUPPRIVILEGE");
  AdGroupDomain = "NULL";
  AdGroupDelete = document.getElementById("ADButtonDeleteGroup");
  AdGroupDelete.addEventListener("click", deleteGroup);
  AdSave = document.getElementById("ADButtonSave");
  AdSave.addEventListener("click", function() {
      validateAdform();
  });
  ADOutputString();
  CheckUserPrivilege(ADPrivilegeCallBack);
  AdGroupTableInit();
}



function ADOutputString() {
  document.getElementById("ad_en_span").textContent = lang.LANG_AD_ADV_ENABLE;
  document.getElementById("ad_en_span").textContent = lang.LANG_AD_ADV_ENABLE;
  document.getElementById("ad_ip_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_IP;
  document.getElementById("ad_dn_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_BIND_DN;
  document.getElementById("ad_pwd_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_BIND_PASSWORD;
  document.getElementById("ad_sb_span").textContent =
      lang.LANG_CONFIG_AD_SEARCH_BASE;
  document.getElementById("ad_userid_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_USER_ID;
  document.getElementById("ad_groupname_span").textContent =
      lang.LANG_AD_GROUP_NAME;
  document.getElementById("ad_groupprivilege_span").textContent =
      lang.LANG_CONFIG_AD_GROUP_PRIVILEGE;
  document.getElementById("ADssl_enable").textContent = "Active LDAP over SSL";//lang.LANG_AD_ADV_SSL;
  document.getElementById("ADcaValid").textContent =
      lang.LANG_AD_SSL_CA_VALID_INFO;
  document.getElementById("ldapValid").textContent =
      lang.LANG_AD_SSL_LDAP_VALID_INFO;
  document.getElementById("ADsslValidInfo").textContent =
      lang.LANG_LDAP_SSL_VALID_INFO;
}

function AdGroupTableInit() {
  var TableTitles = [
    [ lang.LANG_ADDAD_NAME, "50%", "center" ],
    [ lang.LANG_ADDAD_PRIV, "50%", "center" ],
  ];
  var AdGroupTable = document.getElementById("ADGroupTable");
  LDGridTable = GetTableElement();
  SetRowSelectEnable(1);
  LDGridTable.setColumns(TableTitles);
  LDGridTable.init('LDGridTable', AdGroupTable, "60px");
  AdGroupTable.onclick = onClickAdGroupList;
}

function onClickAdGroupList() {
  document.getElementById("role_group_name").style.display = "";
  document.getElementById("role_group_priv").style.display = "";
  document.getElementById("ADButtonDeleteGroup").style.display = "";
  selected_row = GetSelectedRowCellInnerHTML(0);
  if (selected_row == "~") {
    AdGroupName.value = '';
    AdGroupPrivilege.value = '';
  } else {
    document.getElementById("role_group_name").style.display = "";
    document.getElementById("role_group_priv").style.display = "";
    document.getElementById("ADButtonDeleteGroup").style.display = "";

    var tempmap = EnableAdSwitch.check?AdRemoteRoleMapping_array:LdRemoteRoleMapping_array;

    for (var i = 0; i < tempmap.length; i++) {
      if (tempmap[i].RemoteGroup == selected_row) {
        AdGroupName.value = tempmap[i].RemoteGroup;
        AdGroupPrivilege.value = tempmap[i].LocalRole;
      }
    }
  }
}

function deleteAdGroup() {
  selected_row = GetSelectedRowCellInnerHTML(0);
  Loading(true);
  if (selected_row != "~") {
    for (var i = 0; i < AdRemoteRoleMapping_array.length; i++) {
      if (AdRemoteRoleMapping_array[i].RemoteGroup == selected_row) {
        AdRemoteRoleMapping_array[i] = null;
      }
    }
    var ajax_url = '/redfish/v1/AccountService';
    var ajax_param = {
      "ActiveDirectory" : {"RemoteRoleMapping" : AdRemoteRoleMapping_array}
    };
    var object = JSON.stringify(ajax_param);
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'PATCH',
      contentType : 'application/json',
      parameters : object,
      onSuccess : function() {
        alert(lang.LANG_AD_GRP_DELETE_SUCCESS,
              {onClose : function() { location.href = AdPage; }});
      },
      onFailure : function() { alert(lang.LANG_CONFIG_AD_GROUP_SAVE_FAILED); }
    });
    Loading(false);
  }
}

function deleteLDAPGroup() {
  LDselected_row = GetSelectedRowCellInnerHTML(0);
  Loading(true);
  if (LDselected_row != "~") {
    for (var i = 0; i < LDRemoteRoleMapping_array.length; i++) {
      if (LDRemoteRoleMapping_array[i].RemoteGroup == LDselected_row) {
        LDRemoteRoleMapping_array[i] = null;
      }
    }
    var ajax_url = '/redfish/v1/AccountService';
    ajax_param = {"LDAP" : {"RemoteRoleMapping" : LDRemoteRoleMapping_array}};
    var object = JSON.stringify(ajax_param);
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'PATCH',
      contentType : 'application/json',
      parameters : object,
      onSuccess : function() {
        alert(lang.LANG_GRP_DELETE_SUCCESS,
              {onClose : function() { location.href = LDAPpage; }});
      },
      onFailure : function() { alert(lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED); }
    });
    Loading(false);
  }
}


function deleteGroup() {
  LDselected_row = GetSelectedRowCellInnerHTML(0);
  Loading(true);
  if (selected_row == "~") return;
  var tempGroup;
  if(EnableAdSwitch){
    for (var i = 0; i < AdRemoteRoleMapping_array.length; i++) {
      if (AdRemoteRoleMapping_array[i].RemoteGroup == selected_row) {
        AdRemoteRoleMapping_array[i] = null;
      }
    }
    tempGroup = AdRemoteRoleMapping_array;
  }else{
    for (var i = 0; i < LDRemoteRoleMapping_array.length; i++) {
      if (LDRemoteRoleMapping_array[i].RemoteGroup == LDselected_row) {
        LDRemoteRoleMapping_array[i] = null;
      }
    }
    tempGroup = LDRemoteRoleMapping_array;
  }

  var tempService=EnableAdSwitch.checked?"ActiveDirectory":"LDAP";
  var tempPage= EnableAdSwitch.checked?AdPage:LDAPpage;
  var tempFailureAlert=EnableAdSwitch.checked?lang.LANG_CONFIG_AD_GROUP_SAVE_FAILED:lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED;
  var ajax_url = '/redfish/v1/AccountService';
  ajax_param = {tempService: {"RemoteRoleMapping" : tempGroup}};
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : function() {
      alert(lang.LANG_GRP_DELETE_SUCCESS,
            {onClose : function() { location.href = tempPage; }});
    },
    onFailure : function() { alert(tempFailureAlert); }
  });
  Loading(false);
  
}




function ADPrivilegeCallBack(Privilege) {
  if (Privilege == '04') {
    getSwlStatus(AdminSwlCallBack);
  } else if (Privilege == '03' || Privilege == '02') {
    getSwlStatus(ADSwlCallBack);
  } else {
    location.href = SubMainPage;
    return;
  }
}

function AdminSwlCallBack(swl_status) {
  if (swl_status == "ACTIVATED") {
    document.getElementById('ad_table').classList.remove("hide");
    ADgetCertificateInfo();
    requestReadAdInfo();
  } else {
    Loading(false);
    document.getElementById("add_desc_div").textContent = lang.LANG_VM_WEBISO_UPLOAD_LICENSE_ERR;
    document.getElementById('ad_noconfig_msg').classList.remove("hide");
    alert(lang.LANG_SYS_INFO_SOFT_LICENSE_INACTIVATED);
  }
}

function ADSwlCallBack(swl_status) {
  if (swl_status == "ACTIVATED") {
    document.getElementById('ad_table').classList.remove("hide");
    AdSave.disabled = true;
    EnableAdSwitch.disabled = true;
    requestReadAdInfo();
  } else {
    Loading(false);
    document.getElementById("add_desc_div").textContent = lang.LANG_VM_WEBISO_UPLOAD_LICENSE_ERR;
    document.getElementById('ad_noconfig_msg').classList.remove("hide");
    alert(lang.LANG_SYS_INFO_SOFT_LICENSE_INACTIVATED);
  }
}


function ADdisablefunc() {
  AdIpPort.disabled = true;
  AdUserID.disabled = true;
  AdBinPW.disabled = true;
  AdBinDN.disabled = true;
  AdBase.disabled = true;
  AdGroupName.disabled = true;
  AdGroupPrivilege.disabled = true;
  AdSave.disabled = true;
  EnableAdSwitch.disabled = true;
}


function ADGETCertificateURL(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var response = JSON.parse(arg.responseText);
    var certificate_array = response.Links.Certificates;
    if (certificate_array.length == 0) {
      Loading(false);
      document.getElementById("ldapValidDate").textContent = "--";
      document.getElementById("ADCAvalidDate").textContent = "--";
      sslLdapFlag = false;
      sslCaFlag = false;
    }
    for (var i = 0; i < certificate_array.length; i++) {
      ADGetSSLReading(certificate_array[i]["@odata.id"]);
    }
  }
}

function ADGetSSLReading(url) {
  if (url.indexOf("/LDAP/") != -1) {
    ADupdateCertificateValidInfo(url, "ldapValidDate");
    sslLdapFlag = true;
  }
  if (url.indexOf("/Truststore/") != -1) {
    ADupdateCertificateValidInfo(url, "ADCAvalidDate");
    sslCaFlag = true;
  }
  Loading(false);
}

function ADupdateCertificateValidInfo(url, id) {
  var ajax_req = new Ajax.Request(url, {
    method : 'GET',
    onSuccess : function(arg) {
      var sslinfo = JSON.parse(arg.responseText);
      document.getElementById(id).textContent =
          sslinfo.ValidNotAfter.replace("T", " ");
    },
    onFailure : function() {
      document.getElementById(id).textContent = "--";
      Loading(false);
    },
  });
}

//查看countservice
function requestReadAdInfo() {
  Loading(true);
  var ajax_url = '/redfish/v1/AccountService';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : function(response) {
      responseAdInfo
    },
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response, lang.LANG_CONFIG_AD_GET_FAILED,
                          disablefunc);
    }
  });
}

function ADgetCertificateInfo() {
  Loading(true);
  var ajaxUrl = '/redfish/v1/CertificateService/CertificateLocations';
  var ajaxReq = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    onSuccess : ADGETCertificateURL,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFIG_SSL_CERTIFICATE_GET_FAILED);
    },
  });
}



function responseWriteAdInfo(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var response = JSON.parse(arg.responseText);
    if (response.ActiveDirectory.ServiceEnabled) {
      AdRemoteRoleMapping_array = response.ActiveDirectory.RemoteRoleMapping;
    } else {
      AdRemoteRoleMapping_array = [];
    }
    Create_AD_Group();
    alert(lang.LANG_CONFIG_AD_UPDATE_SUCCESS, {
      title : lang.LANG_GENERAL_SUCCESS,
      onClose : function() { location.href = AdPage; }
    });
    if (urlRdirect == 1) {
      var redirect_url = location.host;
      clearSessionInfo();
      redirect_url = window.location.protocol + "//" + redirect_url;
      setTimeout(function() { top.location.assign(redirect_url); }, 500);
    }
  }
}

function responseAdInfo(arg) {
  Loading(false);
  if(arg.readyState != 4 || arg.status != 200) return;
  var content = JSON.parse(arg.responseText);
  var ad = {};
  ad = content.ActiveDirectory;

  var ad_en = (ad.ServiceEnabled) ? "1" : "0";

  var ad_ip = '';

  if (ad.ServiceAddresses[0] != "") {
    ad_ip = ad.ServiceAddresses[0].split("://")[1];
  }

  var ad_bind = ad.Authentication.Username;

  var ad_base = ad.LDAPService.SearchSettings.BaseDistinguishedNames[0];
  var ad_pwd = "";
  AdUserID.value = ad.LDAPService.SearchSettings.UsernameAttribute;
  AdIp.value = ad_ip;

  AdBinPW.value = ad_pwd;
  AdBinDN.value = ad_bind;
  AdBase.value = ad_base;

  AdRemoteRoleMapping_array = filterData(ad.RemoteRoleMapping);

  if (ad_en == "1") {
    EnableAdSwitch.checked = true;
  } else {
    EnableAdSwitch.checked = false;
  }
  var adGroupData = ad.RemoteRoleMapping;
  if (adGroupData.length == 0) {
    AdRowData.push([ 1, "~", "~", "~" ]);
  } else {
    for (var i = 0; i < adGroupData.length; i++) {
      var roleGroupPriv = adGroupData[i].LocalRole == "ReadOnly"
                              ? "User"
                              : adGroupData[i].LocalRole;
      AdRowData.push([
        i, adGroupData[i].RemoteGroup,
        adGroupData[i].Oem.OpenBMC.RemoteDomain, roleGroupPriv
      ]);
    }
    AdRowData.push([ adGroupData.length + 1, "~", "~", "~" ]);
  }
  LDGridTable.empty();
  LDGridTable.show(AdRowData);
  enableAdInfos(EnableAdSwitch.checked);
  if (ad.ServiceAddresses[0].indexOf("ldap://") != -1) {
    enableLDAPoverSSL.checked = false;
  }
  if (ad.ServiceAddresses[0].indexOf("ldaps://") != -1) {
    enableLDAPoverSSL.checked = true;
  }
}


function responseLDAPInfo(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var content = JSON.parse(arg.responseText);
      var ldap = {};
      ldap = content.LDAP;
      var ldap_en = (ldap.ServiceEnabled) ? "1" : "0";
      var ldap_ip = '';
      if (ldap.ServiceAddresses[0] != "") {
        ldap_ip = ldap.ServiceAddresses[0].split("://")[1];
        }
        var ldap_bind = ldap.Authentication.Username;
        var ldap_base =
            ldap.LDAPService.SearchSettings.BaseDistinguishedNames[0];
        var ldap_pwd = "";
        LDUserID.value = ldap.LDAPService.SearchSettings.UsernameAttribute;
        LDIP.value = ldap_ip;
        LDBinPW.value = ldap_pwd;
        LDBinDN.value = ldap_bind;
        LDBase.value = ldap_base;
        LDRemoteRoleMapping_array = ldap.RemoteRoleMapping;
        if(ldap_en == "1") {
            EnableLDAPSwitch.checked = true;
        } else {
          EnableLDAPSwitch.checked = false;
        }
        var LDAPGroupData = ldap.RemoteRoleMapping;
        if (LDAPGroupData.length == 0) {
          LDRowData.push([ 1, "~", "~" ]);
        } else {
          for (var i = 0; i < LDAPGroupData.length; i++) {
            var roleGroupPriv = LDAPGroupData[i].LocalRole == "ReadOnly" ? "User" : LDAPGroupData[i].LocalRole;
            LDRowData.push([
              i, LDAPGroupData[i].RemoteGroup, roleGroupPriv
            ]);
          }
          LDRowData.push([ LDAPGroupData.length + 1, "~", "~" ]);
        }
        GridTable.empty();
        GridTable.show(LDRowData);
        enableLDAPInfos(EnableLDAPSwitch.checked);
        if (ldap.ServiceAddresses[0].indexOf("ldap://") != -1) {
          enableLDAPoverSSL.checked = false;
        }
        if (ldap.ServiceAddresses[0].indexOf("ldaps://") != -1) {
          enableLDAPoverSSL.checked = true;
        }
    }
}






function validateAdform() {

    var bool_validation = true;
    var error_msg_dtring = "";
    if ((!(/^(((cn=)|(uid=))[a-z]{1}[\w\-\.]{2,63},?)+$/i.test(
            AdBinDN.value.split(",")[0])) ||
        !(/^(((cn=)|(uid=)|(ou=)|(dc=)|(o=))[a-z]{0}[\w\-\.]{1,63},?)+$/i.test(
            AdBinDN.value)) ||
        AdBinDN.value.length > 63 || AdBinDN.value.length < 4)) {
      error_msg_dtring += "Bind DN\n";
      bool_validation = false;
    }
    if (!(/^[^ ]+$/.test(AdBinPW.value))) {
      error_msg_dtring += "Password\n";
      bool_validation = false;
    }
    if (!(/^(((cn=)|(uid=)|(ou=)|(dc=)|(o=))[a-z]{0}[\w\-\.]{1,63},?)+$/i)
            .test(AdBase.value) &&
        !(AdBase.value.length >= 4 && AdBase.value.length <= 64)) {
      error_msg_dtring += "Search Base\n";
      bool_validation = false;
    }
    if(AdIp.value=='' ) {
      error_msg_dtring += "AdIp\n";
      bool_validation = false;
    }
    var tempVar = AdIp.value.split(":");
    if(tempVar.length>2) {
      error_msg_dtring += "AdIp\n";
      bool_validation = false;
    }
    AdIpValue = tempVar[0];
    AdPortValue = "";
    if(tempVar.leng==2)
      AdPortValue = tempVar[1];

    if (AdGroupName.value == '' && selected_row != '') {
      error_msg_dtring += "Group Name\n";
      bool_validation = false;
    }
    if (AdGroupPrivilege.value == '' && selected_row != '') {
      error_msg_dtring += "Group Privilege\n";
      bool_validation = false;
    }


    if (!bool_validation) {
      alert("Invalid Inputs are given to \nthe following fields.\n " +
                error_msg_dtring,
            {type : "pre"});
      error_msg_dtring = "";
    } else {
      error_msg_dtring = "";
      if(enableAd){
        saveAdconfig();
      }else{
        saveLDAPconfig();
      }
    }
}

function saveAdconfig() {
  var ajax_url = "/redfish/v1/AccountService";
  var ajax_param = {
    "LDAP" : {"ServiceEnabled" : false}
  };
  var ajax_data = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : ajax_data,
    onSuccess : saveAdconfig_Cont,
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response, lang.LANG_CONFIG_AD_SAVE_FAILED, null);
    }
  });
}

function saveAdconfig_Cont() {

  var sslString = enableLDAPoverSSL.checked ? "ldaps://" : "ldap://";
  Loading(true);
  var data = {
    "ActiveDirectory" : {
      "ServiceEnabled" : EnableAdSwitch.checked,
      "Authentication" :
          {"Username" : AdBinDN.value, "Password" : AdBinPW.value},
      "LDAPService" : {
        "Oem" : {
          "OpenBMC" : {
            "LDAPBindTime" : "5",//AdTimeout.value,
            "LDAPServerPort" :  AdPortValue
          }
        },
        "SearchSettings" : {
          "BaseDistinguishedNames" : [ AdBase.value],
          "UsernameAttribute" : AdUserID.value
        }
      },
      "ServiceAddresses" : [ sslString +  AdIpValue]  // AdIp.value ]
    }
  };

  var ajax_url = '/redfish/v1/AccountService';

  var payload = JSON.stringify(data);

  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : payload,
    onSuccess : responseWriteAdInfo,
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response, lang.LANG_CONFIG_AD_SAVE_FAILED, null);
    }
  });
}

function saveLDAPconfig() {
  var ajax_url = "/redfish/v1/AccountService";
  var ajax_param = {"ActiveDirectory" : {"ServiceEnabled" : false}};
  var ajax_data = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : ajax_data,
    onSuccess : saveLDAPconfig_Cont,
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response, lang.LANG_CONFIG_LDAP_SAVE_FAILED, null);
    }
  });
}

function saveLDAPconfig_Cont() {
  Loading(true);
  var sslString = enableLDAPoverSSL.checked ? "ldaps://" : "ldap://";
  var data = {
    "LDAP" : {
      "ServiceEnabled" : EnableLDAPSwitch.checked,
      "Authentication" :
          {"Username" : LDBinDN.value, "Password" : LDBinPW.value},
      "LDAPService" : {
        "SearchSettings" : {
          "BaseDistinguishedNames" : [ LDBase.value ],
          "UsernameAttribute" : LDUserID.value
        }
      },
      "ServiceAddresses" : [ sslString + LDIP.value ]
    }
  };
  var ajax_url = '/redfish/v1/AccountService';
  var object = JSON.stringify(data);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : responseWriteLDAPInfo,
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response, lang.LANG_CONFIG_LDAP_SAVE_FAILED, null);
    }
  });
}

function Create_LDAP_Group() {
    Loading(true);
    if (LDGroupName.value != '' && LDGroupPrivilege.value != '' &&
        EnableLDAPSwitch.checked) {
      if (LDselected_row != "~") {
        for (var i = 0; i < LDRemoteRoleMapping_array.length; i++) {
          if (LDRemoteRoleMapping_array[i].RemoteGroup == LDselected_row) {
            LDRemoteRoleMapping_array[i] = null;
          }
        }
      }
      LDRemoteRoleMapping_array.push({
        "RemoteGroup" : LDGroupName.value,
        "LocalRole" : LDGroupPrivilege.value
      });
    }
    var ajax_url = '/redfish/v1/AccountService';
    ajax_param = {"LDAP" : {"RemoteRoleMapping" : LDRemoteRoleMapping_array}};
    var object = JSON.stringify(ajax_param);
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'PATCH',
      contentType : 'application/json',
      parameters : object,
      onSuccess : response_Create_LDAP_Group,
      onFailure : function() { alert(lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED); }
    });
    Loading(false);
}






function responseWriteLDAPInfo(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var response = JSON.parse(arg.responseText);
      if (response.LDAP.ServiceEnabled) {
        LDRemoteRoleMapping_array = response.LDAP.RemoteRoleMapping;
      } else {
        LDRemoteRoleMapping_array = [];
      }
      Create_LDAP_Group();
      alert(lang.LANG_CONFIG_LDAP_UPDATE_SUCCESS, {
        title : lang.LANG_GENERAL_SUCCESS,
        onClose : function() { location.href = LDAPpage; }
      });
      if (LDurlRdirect == 1) {
        var redirect_url = location.host;
        clearSessionInfo();
        redirect_url = window.location.protocol + "//" + redirect_url;
        setTimeout(function() { top.location.assign(redirect_url); }, 500);
        }
    }
}












function Create_LDAP_Group() {
  Loading(true);
  if (LDGroupName.value != '' && LDGroupPrivilege.value != '' &&
      EnableLDAPSwitch.checked) {
    if (LDselected_row != "~") {
      for (var i = 0; i < LDRemoteRoleMapping_array.length; i++) {
        if (LDRemoteRoleMapping_array[i].RemoteGroup == LDselected_row) {
          LDRemoteRoleMapping_array[i] = null;
        }
      }
    }
    LDRemoteRoleMapping_array.push({
      "RemoteGroup" : LDGroupName.value,
      "LocalRole" : LDGroupPrivilege.value
    });
  }
  var ajax_url = '/redfish/v1/AccountService';
  ajax_param = {"LDAP" : {"RemoteRoleMapping" : LDRemoteRoleMapping_array}};
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : response_Create_LDAP_Group,
    onFailure : function() { alert(lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED); }
  });
  Loading(false);
}


function Create_AD_Group() {
  Loading(true);
  if (AdGroupName.value != '' && AdGroupPrivilege.value != '' && EnableAdSwitch.checked) {
    if (selected_row != "~") {
      for (var i = 0; i < AdRemoteRoleMapping_array.length; i++) {
        if (AdRemoteRoleMapping_array[i].RemoteGroup == selected_row) {
          AdRemoteRoleMapping_array[i] = null;
        }
      }
    }

    AdRemoteRoleMapping_array.push({
      "RemoteGroup" : AdGroupName.value,
      "LocalRole" : AdGroupPrivilege.value
      //,"Oem" : {"OpenBMC" : {"RemoteDomain" : "bmctest.net"}},   //AdGroupDomain.value}},
    });
  }

  var ajax_url = '/redfish/v1/AccountService';
  //AdRemoteRoleMapping_array = filterData(AdRemoteRoleMapping_array);
  var ajax_param = {
    "ActiveDirectory" : {"RemoteRoleMapping" : AdRemoteRoleMapping_array}
  };
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : function(){alert("Create_AD_Group success");},
    onFailure : function() { alert(lang.LANG_CONFIG_AD_GROUP_SAVE_FAILED); }
  });
  Loading(false);
}

function ADcheckSSL(ldapStatus){
  if (sslCaFlag && sslLdapFlag) {
    if (ldapStatus) {
      enableLDAPoverSSL.disabled = false;
    } else {
      enableLDAPoverSSL.disabled = true;
    }
    enableLDAPoverSSL.checked = true;
  } else {
    enableLDAPoverSSL.disabled = true;
    enableLDAPoverSSL.checked = false;
  }
}

function enableAdInfos(enable) {
  AdIp.disabled = !enable;
  AdBinPW.disabled = !enable;
  AdUserID.disabled = !enable;
  AdBinDN.disabled = !enable;
  AdBase.disabled = !enable;

  ADcheckSSL(enable);
}

function enableAdGroupInfos(enable) {
  AdGroupName.disabled = !enable;
  AdGroupPrivilege.disabled = !enable;
  AdGroupDelete.disabled = !enable;
}


function filterData(
  data) { // Removing @odata.type key pair value in get response
for (var i = 0; i < data.length; i++) {
  if (data[i] != null && data[i].hasOwnProperty('Oem') &&
      data[i].Oem.hasOwnProperty('OpenBMC') &&
      data[i].Oem.OpenBMC.hasOwnProperty('@odata.type')) {
    delete data[i].Oem.OpenBMC['@odata.type'];
  }
}
return data;
}



function LDAPGroupTableInit() {
  var TableTitles = [
    [ lang.LANG_CONFIG_LDAP_GROUP_NAME, "50%", "center" ],
    [ lang.LANG_CONFIG_LDAP_GROUP_PRIVILEGE, "50%", "center" ],
  ];
  LDAPGroupTable = document.getElementById("LDAPGroupTable");
  GridTable = GetTableElement();
  SetRowSelectEnable(1);
  GridTable.setColumns(TableTitles);
  GridTable.init('GridTable', LDAPGroupTable, "100px");
  LDAPGroupTable.onclick =
      function() { CheckUserPrivilege(onClickLDAPGroupList); };
  document.getElementById("LDButtonDeleteGroup").style.display = "none";
  //document.getElementById("LDgroup_name").style.display = "none";
  //document.getElementById("LDgroup_priv").style.display = "none";
}

function onClickLDAPGroupList(privilege) {
  if (privilege == '03' || privilege == '02') {
    enableLDAPGroupInfos(false);
  } else {
    enableLDAPGroupInfos(EnableLDAPSwitch.checked);
  }
  //document.getElementById("LDgroup_name").style.display = "";
  //document.getElementById("LDgroup_priv").style.display = "";
  document.getElementById("LDButtonDeleteGroup").style.display = "";
  LDselected_row = GetSelectedRowCellInnerHTML(0);
  if (LDselected_row == "~") {
    LDGroupName.value = '';
    LDGroupPrivilege.value = '';
    document.getElementById("LDButtonDeleteGroup").style.display = "none";
  } else {
    //document.getElementById("LDgroup_name").style.display = "";
    //document.getElementById("LDgroup_priv").style.display = "";
    document.getElementById("LDButtonDeleteGroup").style.display = "";
    for (var i = 0; i < LDRemoteRoleMapping_array.length; i++) {
      if (LDRemoteRoleMapping_array[i].RemoteGroup == LDselected_row) {
        LDGroupName.value = LDRemoteRoleMapping_array[i].RemoteGroup;
        LDGroupPrivilege.value = LDRemoteRoleMapping_array[i].LocalRole;
      }
    }
  }
}

function deleteLDAPGroup() {
  LDselected_row = GetSelectedRowCellInnerHTML(0);
  Loading(true);
  if (LDselected_row != "~") {
    for (var i = 0; i < LDRemoteRoleMapping_array.length; i++) {
      if (LDRemoteRoleMapping_array[i].RemoteGroup == LDselected_row) {
        LDRemoteRoleMapping_array[i] = null;
      }
    }
    var ajax_url = '/redfish/v1/AccountService';
    ajax_param = {"LDAP" : {"RemoteRoleMapping" : LDRemoteRoleMapping_array}};
    var object = JSON.stringify(ajax_param);
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'PATCH',
      contentType : 'application/json',
      parameters : object,
      onSuccess : function() {
        alert(lang.LANG_GRP_DELETE_SUCCESS,
              {onClose : function() { location.href = LDAPpage; }});
      },
      onFailure : function() { alert(lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED); }
    });
    Loading(false);
  }
}


function onAdEnable() {
  enableAd = !enableAd;
  enableAdInfos(EnableAdSwitch.checked);
  enableAdGroupInfos(EnableAdSwitch.checked);
}
