"use strict";
var urlRdirect = 0;
var RemoteRoleMapping_array = [];
var RowData = [];
var selected_row = '';
var AdPage = "/page/config_ad.html";
var sslLdapFlag;
var sslCaFlag;
var EnableAdSwitch;
var AdIp;
var enableLDAPoverSSL;
var AdBinPW;
var AdBinDN;
var AdBase;
var AdUserID;
var AdTimeout;
var AdPortValue;
var AdGroupName;
var AdGroupPrivilege;
var AdGroupDomain;
var AdGroupDelete;
var AdSave;
var GridTable;
window.addEventListener('load', PageInit);
var lang;
if (parent.lang) { lang = parent.lang; }

function PageInit() {
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
  AdTimeout = document.getElementById("ADTIMEOUT");
  AdPortValue = document.getElementById("ADPORTVALUE");
  AdGroupName = document.getElementById("GROUPNAME");
  AdGroupPrivilege = document.getElementById("GROUPPRIVILEGE");
  AdGroupDomain = document.getElementById("GROUPDOMAIN");
  AdGroupDelete = document.getElementById("ADButtonDeleteGroup");
  AdGroupDelete.addEventListener("click", deleteAdGroup);
  AdSave = document.getElementById("ADButtonSave");
  AdSave.addEventListener("click", function() {
    if (EnableAdSwitch.checked) {

      validateAdform();
    } else {

      saveAdconfig();
    }
  });
  OutputString();
  initCheckInputListener("ADIP", lang.LANG_CONFIG_ACTIVE_DIRECTORY_IP,
                         INPUT_FIELD.HOSTNAMEANDIPV4);
  CheckUserPrivilege(PrivilegeCallBack);
  AdGroupTableInit();
}

function OutputString() {
  document.getElementById("caption_div").textContent = lang.LANG_AD_CAPTION;
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
  document.getElementById("ad_timeout_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_TIMEOUT;
  document.getElementById("ad_port_span").textContent = lang.LANG_AD_ADV_PORT;
  document.getElementById("ad_groupname_span").textContent =
      lang.LANG_AD_GROUP_NAME;
  document.getElementById("ad_groupprivilege_span").textContent =
      lang.LANG_CONFIG_AD_GROUP_PRIVILEGE;
  document.getElementById("ad_groupdomain_span").textContent =
      lang.LANG_AD_COLUMN_TITLE2;
  document.getElementById("ad_gf_header_span").textContent =
      lang.LANG_CONFIG_AD_GF_TITLE;
  document.getElementById("ADssl_enable").textContent = lang.LANG_AD_ADV_SSL;
  document.getElementById("ADcaValid").textContent =
      lang.LANG_AD_SSL_CA_VALID_INFO;
  document.getElementById("ADldapValid").textContent =
      lang.LANG_AD_SSL_LDAP_VALID_INFO;
  document.getElementById("ADsslValidInfo").textContent =
      lang.LANG_LDAP_SSL_VALID_INFO;
}

function AdGroupTableInit() {
  var TableTitles = [
    [ lang.LANG_ADDAD_NAME, "50%", "center" ],
    [ lang.LANG_ADDAD_DOMAIN, "50%", "center" ],
    [ lang.LANG_ADDAD_PRIV, "50%", "center" ],
  ];
  var AdGroupTable = document.getElementById("ADGroupTable");
  GridTable = GetTableElement();
  SetRowSelectEnable(1);
  GridTable.setColumns(TableTitles);
  GridTable.init('GridTable', AdGroupTable, "100px");
  AdGroupTable.onclick = onClickAdGroupList;
  document.getElementById("ADButtonDeleteGroup").style.display = "none";
  document.getElementById("role_group_name").style.display = "none";
  document.getElementById("role_group_domain").style.display = "none";
  document.getElementById("role_group_priv").style.display = "none";
}

function onClickAdGroupList() {
  enableAdGroupInfos(EnableAdSwitch.checked);
  document.getElementById("role_group_name").style.display = "";
  document.getElementById("role_group_domain").style.display = "";
  document.getElementById("role_group_priv").style.display = "";
  document.getElementById("ADButtonDeleteGroup").style.display = "";
  selected_row = GetSelectedRowCellInnerHTML(0);
  if (selected_row == "~") {
    AdGroupName.value = '';
    AdGroupDomain.value = '';
    AdGroupPrivilege.value = '';
    document.getElementById("ADButtonDeleteGroup").style.display = "none";
  } else {
    document.getElementById("role_group_name").style.display = "";
    document.getElementById("role_group_domain").style.display = "";
    document.getElementById("role_group_priv").style.display = "";
    document.getElementById("ADButtonDeleteGroup").style.display = "";
    for (var i = 0; i < RemoteRoleMapping_array.length; i++) {
      if (RemoteRoleMapping_array[i].RemoteGroup == selected_row) {
        AdGroupName.value = RemoteRoleMapping_array[i].RemoteGroup;
        AdGroupDomain.value = RemoteRoleMapping_array[i].Oem.OpenBMC.RemoteDomain;
        AdGroupPrivilege.value = RemoteRoleMapping_array[i].LocalRole;
      }
    }
  }
}

function deleteAdGroup() {
  selected_row = GetSelectedRowCellInnerHTML(0);
  Loading(true);
  if (selected_row != "~") {
    for (var i = 0; i < RemoteRoleMapping_array.length; i++) {
      if (RemoteRoleMapping_array[i].RemoteGroup == selected_row) {
        RemoteRoleMapping_array[i] = null;
      }
    }
    var ajax_url = '/redfish/v1/AccountService';
    var ajax_param = {
      "ActiveDirectory" : {"RemoteRoleMapping" : RemoteRoleMapping_array}
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

function PrivilegeCallBack(Privilege) {
  if (Privilege == '04') {
    getSwlStatus(AdminSwlCallBack);
  } else if (Privilege == '03' || Privilege == '02') {
    getSwlStatus(SwlCallBack);
  } else {
    location.href = SubMainPage;
    return;
  }
}

function AdminSwlCallBack(swl_status) {
  if (swl_status == "ACTIVATED") {
    document.getElementById('ad_table').classList.remove("hide");
    getCertificateInfo();
    requestReadAdInfo();
  } else {
    Loading(false);
    document.getElementById("add_desc_div").textContent = lang.LANG_VM_WEBISO_UPLOAD_LICENSE_ERR;
    document.getElementById('ad_noconfig_msg').classList.remove("hide");
    alert(lang.LANG_SYS_INFO_SOFT_LICENSE_INACTIVATED);
  }
}

function SwlCallBack(swl_status) {
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

function disablefunc() {
  AdIp.disabled = true;
  AdUserID.disabled = true;
  AdBinPW.disabled = true;
  AdBinDN.disabled = true;
  AdBase.disabled = true;
  AdGroupName.disabled = true;
  AdGroupPrivilege.disabled = true;
  AdGroupDomain.disabled = true;
  AdSave.disabled = true;
  EnableAdSwitch.disabled = true;
}

function getCertificateInfo() {
  Loading(true);
  var ajaxUrl = '/redfish/v1/CertificateService/CertificateLocations';
  var ajaxReq = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    onSuccess : GETCertificateURL,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFIG_SSL_CERTIFICATE_GET_FAILED);
    },
  });
}
function GETCertificateURL(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var response = JSON.parse(arg.responseText);
    var certificate_array = response.Links.Certificates;
    if (certificate_array.length == 0) {
      Loading(false);
      document.getElementById("ldapValidDate").textContent = "--";
      document.getElementById("CAvalidDate").textContent = "--";
      sslLdapFlag = false;
      sslCaFlag = false;
    }
    for (var i = 0; i < certificate_array.length; i++) {
      GetSSLReading(certificate_array[i]["@odata.id"]);
    }
  }
}
function GetSSLReading(url) {
  if (url.indexOf("/LDAP/") != -1) {
    updateCertificateValidInfo(url, "ldapValidDate");
    sslLdapFlag = true;
  }
  if (url.indexOf("/Truststore/") != -1) {
    updateCertificateValidInfo(url, "CAvalidDate");
    sslCaFlag = true;
  }
  Loading(false);
}
function updateCertificateValidInfo(url, id) {
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
function requestReadAdInfo() {
  Loading(true);
  var ajax_url = '/redfish/v1/AccountService';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : responseAdInfo,
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response, lang.LANG_CONFIG_AD_GET_FAILED,
                          disablefunc);
    }
  });
}

function responseWriteAdInfo(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var response = JSON.parse(arg.responseText);
    if (response.ActiveDirectory.ServiceEnabled) {
      RemoteRoleMapping_array = response.ActiveDirectory.RemoteRoleMapping;
    } else {
      RemoteRoleMapping_array = [];
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

function responseAdInfo(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
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
    AdTimeout.value = ad.LDAPService.Oem.OpenBMC.LDAPBindTime;
    AdUserID.value = ad.LDAPService.SearchSettings.UsernameAttribute;
    AdPortValue.value = ad.LDAPService.Oem.OpenBMC.LDAPServerPort;
    AdIp.value = ad_ip;

    AdBinPW.value = ad_pwd;
    AdBinDN.value = ad_bind;
    AdBase.value = ad_base;

    RemoteRoleMapping_array = filterData(ad.RemoteRoleMapping);

    if (ad_en == "1") {
      EnableAdSwitch.checked = true;
    } else {
      EnableAdSwitch.checked = false;
    }
    var adGroupData = ad.RemoteRoleMapping;
    if (adGroupData.length == 0) {
      RowData.push([ 1, "~", "~", "~" ]);
    } else {
      for (var i = 0; i < adGroupData.length; i++) {
        var roleGroupPriv = adGroupData[i].LocalRole == "ReadOnly"
                                ? "User"
                                : adGroupData[i].LocalRole;
        RowData.push([
          i, adGroupData[i].RemoteGroup,
          adGroupData[i].Oem.OpenBMC.RemoteDomain, roleGroupPriv
        ]);
      }
      RowData.push([ adGroupData.length + 1, "~", "~", "~" ]);
    }
    GridTable.empty();
    GridTable.show(RowData);
    enableAdInfos(EnableAdSwitch.checked);
    if (ad.ServiceAddresses[0].indexOf("ldap://") != -1) {
      enableLDAPoverSSL.checked = false;
    }
    if (ad.ServiceAddresses[0].indexOf("ldaps://") != -1) {
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
  if (AdTimeout.value == '') {
    error_msg_dtring += "Time out\n";
    bool_validation = false;
  }
  if (AdGroupName.value == '' && selected_row != '') {
    error_msg_dtring += "Group Name\n";
    bool_validation = false;
  }
  if (AdGroupPrivilege.value == '' && selected_row != '') {
    error_msg_dtring += "Group Privilege\n";
    bool_validation = false;
  }
  if (AdGroupDomain.value == '' && selected_row != '') {
    error_msg_dtring += "Group Domain\n";
    bool_validation = false;
  }
  if (!bool_validation) {
    alert("Invalid Inputs are given to \nthe following fields.\n " +
              error_msg_dtring,
          {type : "pre"});
    error_msg_dtring = "";
  } else {
    error_msg_dtring = "";
    saveAdconfig();
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
            "LDAPBindTime" : AdTimeout.value,
            "LDAPServerPort" : AdPortValue.value
          }
        },
        "SearchSettings" : {
          "BaseDistinguishedNames" : [ AdBase.value ],
          "UsernameAttribute" : AdUserID.value
        }
      },
      "ServiceAddresses" : [ sslString + AdIp.value ]
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

function Create_AD_Group() {
  Loading(true);
  if (AdGroupName.value != '' && AdGroupPrivilege.value != '' &&
      AdGroupDomain.value != '' && EnableAdSwitch.checked) {
    if (selected_row != "~") {
      for (var i = 0; i < RemoteRoleMapping_array.length; i++) {
        if (RemoteRoleMapping_array[i].RemoteGroup == selected_row) {
          RemoteRoleMapping_array[i] = null;
        }
      }
    }

    RemoteRoleMapping_array.push({
      "RemoteGroup" : AdGroupName.value,
      "LocalRole" : AdGroupPrivilege.value,
      "Oem" : {"OpenBMC" : {"RemoteDomain" : AdGroupDomain.value}},
    });
  }

  var ajax_url = '/redfish/v1/AccountService';
  RemoteRoleMapping_array = filterData(RemoteRoleMapping_array);
  var ajax_param = {
    "ActiveDirectory" : {"RemoteRoleMapping" : RemoteRoleMapping_array}
  };
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : response_Create_Ad_Group,
    onFailure : function() { alert(lang.LANG_CONFIG_AD_GROUP_SAVE_FAILED); }
  });
  Loading(false);
}

function response_Create_Ad_Group(originalRequest) {
  /*f (originalRequest.readyState == 4 && originalRequest.status == 200) {
      alert(lang.LANG_CONFIG_LDAP_SUCCSAVE, {title: lang.LANG_GENERAL_SUCCESS});
    requestReadAdInfo();
  }
  else {
     alert(lang.LANG_COMMON_UNSAVE);
  }*/
}

function enableAdInfos(enable) {
  AdIp.disabled = !enable;
  AdBinPW.disabled = !enable;
  AdUserID.disabled = !enable;
  AdBinDN.disabled = !enable;
  AdBase.disabled = !enable;
  AdTimeout.disabled = !enable;
  AdPortValue.disabled = !enable;
  checkSSL(enable);
}

function enableAdGroupInfos(enable) {
  AdGroupName.disabled = !enable;
  AdGroupPrivilege.disabled = !enable;
  AdGroupDomain.disabled = !enable;
  AdGroupDelete.disabled = !enable;
}

function onAdEnable() {
  enableAdInfos(EnableAdSwitch.checked);
  enableAdGroupInfos(EnableAdSwitch.checked);
}

function checkSSL(ldapStatus) {
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