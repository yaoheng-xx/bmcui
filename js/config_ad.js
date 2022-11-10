"use strict";
var urlRdirect = 0;
var localRoleMapGroupData = [];
var tempLocalRoleMapGroupData = [];
var selected_row = '';
var AdPage = "/page/config_ad.html";
var sslCaFlag;
var EnableAdSwitch;
var EnableLdSwitch;
var EnableNoneSwitch;

var enableAd=false;
var enableLd=false;
var enableNone=true;

var ServerUrl;
var enableLDAPoverSSL;
var AdBinPW;
var AdBinDN;
var AdBase;
var AdUserID;
var AdTimeout;
var AdPortValue;
var AdIpValue;
// AdGroupName AdGroupPrivilege:These two variables are used to store clicked group item data.
var AdGroupName;
var AdGroupPrivilege;

var AdGroupDelete;
var AdSave;
var LDGridTable;
//url prefix is ldap:// or ldaps://.
var urlPrefixTextIndents = ['42px','36px']; 
var IpLable;
var remoteConfiguration = {}
window.addEventListener('load', ADPageInit);
var lang;
if (parent.lang) { lang = parent.lang; }

function ADPageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/configure_ad_hlp.html";
  document.getElementById("ADButtonSave").value = lang.LANG_CONFIG_AD_SAVE;
  document.getElementById("ADButtonDeleteGroup").value = lang.LANG_CONFIG_AD_DELETE;
  EnableAdSwitch = document.getElementById("AdSwitch");
  EnableLdSwitch = document.getElementById("LdSwitch");
  EnableNoneSwitch = document.getElementById("NoneSwitch");
  enableLDAPoverSSL = document.getElementById("ADenableSSL");

  EnableAdSwitch.addEventListener("click", onAdEnable);
  EnableLdSwitch.addEventListener("click", onLdEnable);
  EnableNoneSwitch.addEventListener("click", onNoneEnable);
  enableLDAPoverSSL.addEventListener("click", setUrlFixedSSLPrefix);

  enableAd = true;

  ServerUrl = document.getElementById("ADIP");
  IpLable = document.getElementById("IPLABLE");
  
  AdBinPW = document.getElementById("ADBINDPW");
  AdBinDN = document.getElementById("ADBINDWN");
  AdBase = document.getElementById("ADBASE");
  AdUserID = document.getElementById("ADUSERID");
  AdGroupName = document.getElementById("ADGROUPNAME");
  AdGroupPrivilege = document.getElementById("ADGROUPPRIVILEGE");
  AdGroupDelete = document.getElementById("ADButtonDeleteGroup");
  AdGroupDelete.addEventListener("click", deleteGroup);
  AdSave = document.getElementById("ADButtonSave");
  AdSave.addEventListener("click", function() {
      validateAdform();
  });
  ADOutputString();

  CheckUserPrivilege(ADPrivilegeCallBack);
  AdGroupTableInit();
  onNoneEnable();
}


function ADOutputString() {
  document.getElementById("caption_div").textContent = lang.LANG_LDAP_AD_CAPTION; 
  document.getElementById("ad_en_span").textContent = lang.LANG_AD_ADV_ENABLE;
  document.getElementById("ldap_en_span").textContent = lang.LANG_LDAP_ENABLE; 
  document.getElementById("none_en_span").textContent = lang.LANG_NONE_ENABLE;
  document.getElementById("ad_ip_span").textContent = lang.LANG_LDAP_AD_SERVER_URL; 
  document.getElementById("ad_dn_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_BIND_DN;
  document.getElementById("ad_pwd_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_BIND_PASSWORD;
  document.getElementById("ad_sb_span").textContent =
      lang.LANG_CONFIG_AD_SEARCH_BASE;
  document.getElementById("ad_userid_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_USER_ID;

  document.getElementById("ADssl_enable").textContent =lang.LANG_LDAP_AD_SSL ;

  document.getElementById("ad_gf_header_span").style.display = "none";
  
  document.getElementById("ADButtonDeleteGroup").style.display = "none";
  document.getElementById("ad_groupname_span").textContent =lang.LANG_LDAP_AD_REMOTE_GROUP;
  document.getElementById("ad_groupprivilege_span").textContent =lang.LANG_LDAP_AD_LOCAL_PRIVILEGE;
  document.getElementById("role_group_name").style.display = "none";
  document.getElementById("role_group_priv").style.display = "none";

  setInfoField();
}

function AdGroupTableInit() {
  var TableTitles = [
    [lang.LANG_LDAP_AD_REMOTE_GROUP, "50%", "center" ],
    [lang.LANG_LDAP_AD_LOCAL_PRIVILEGE, "50%", "center" ],
  ];
  var AdGroupTable = document.getElementById("ADGroupTable");
  LDGridTable = GetTableElement();
  SetRowSelectEnable(1);
  LDGridTable.setColumns(TableTitles);
  LDGridTable.init('LDGridTable', AdGroupTable, "60px");
  AdGroupTable.onclick =function() { CheckUserPrivilege(onClickAdGroupList); };
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

    for (var i = 0; i < localRoleMapGroupData.length; i++) {
      if (localRoleMapGroupData[i].RemoteGroup == selected_row) {
        AdGroupName.value = localRoleMapGroupData[i].RemoteGroup;
        AdGroupPrivilege.value = localRoleMapGroupData[i].LocalRole;
      }
    }
  }
}

function ADPrivilegeCallBack(Privilege) {
  sslCaFlag=false;
  if (Privilege == '04') {
    getSwlStatus(AdminSwlCallBack);
  } else if (Privilege == '03' || Privilege == '02') {
    getSwlStatus(ADSwlCallBack);
  } else {
    location.href = SubMainPage;
    return;
  }

  if(sslCaFlag==false){
    enableLDAPoverSSL.disabled=true;
  }

}

function AdminSwlCallBack(swl_status) {
  if (swl_status == "ACTIVATED") {
    document.getElementById('ad_table').classList.remove("hide");
    ADgetCertificateInfo();
    fetchRemoteConfiguration();
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
    fetchRemoteConfiguration();
  } else {
    Loading(false);
    document.getElementById("add_desc_div").textContent = lang.LANG_VM_WEBISO_UPLOAD_LICENSE_ERR;
    document.getElementById('ad_noconfig_msg').classList.remove("hide");
    alert(lang.LANG_SYS_INFO_SOFT_LICENSE_INACTIVATED);
  }
}

function ADGETCertificateURL(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var response = JSON.parse(arg.responseText);
    var certificate_array = response.Links.Certificates;
    if (certificate_array.length == 0) {
      Loading(false);
      sslCaFlag = false;
    }
    for (var i = 0; i < certificate_array.length; i++) {
      ADGetSSLReading(certificate_array[i]["@odata.id"]);
    }
  }
}

function ADGetSSLReading(url) {
  if (url.indexOf("/Truststore/") != -1) {
    sslCaFlag = true;
  }
  Loading(false);
}

// get the remote configuration and update local info 
function fetchRemoteConfiguration() {
  Loading(true);
  var failureAlert = enableAd?lang.LANG_CONFIG_AD_GET_FAILED:lang.LANG_CONFIG_LDAP_GET_FAILED;
  var ajax_url = '/redfish/v1/AccountService';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    asynchronous:false,
    onSuccess : function(response) {
      Loading(false);
      if(response.readyState != 4 || response.status != 200) return;
      remoteConfiguration = JSON.parse(response.responseText);
      if(remoteConfiguration.ActiveDirectory.ServiceEnabled ==true){
        EnableAdSwitch.checked=true;
        localRoleMapGroupData = remoteConfiguration.ActiveDirectory.RemoteRoleMapping;
        onAdEnable();
      }
      if(remoteConfiguration.LDAP.ServiceEnabled ==true){
        EnableLdSwitch.checked=true;
        localRoleMapGroupData = remoteConfiguration.LDAP.RemoteRoleMapping;
        onLdEnable();
      }
      if(remoteConfiguration.LDAP.ServiceEnabled == false && remoteConfiguration.ActiveDirectory.ServiceEnabled == false){
        EnableNoneSwitch.checked=true;
        onNoneEnable();
      }
      },
      onFailure : function(response) {
      Loading(false);
      remoteConfiguration = {};
      HandleFailureStatus(response, failureAlert,
                          disablefunc);
    }
  });
}

function ADgetCertificateInfo() {
  Loading(true);
  var ajaxUrl = '/redfish/v1/CertificateService/CertificateLocations';
  var ajaxReq = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    asynchronous:false,
    onSuccess : ADGETCertificateURL,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFIG_SSL_CERTIFICATE_GET_FAILED);
    }
  });
}

function showLDAPConfiguration(curPageContent) {
  var ad_ip = curPageContent.ServiceAddresses[0];

  if(sslCaFlag == false && curPageContent.ServiceAddresses[0].indexOf("ldaps://") != -1)
  {
    alert(lang.LANG_CONFIG_SSL_CERTIFICATE_GET_FAILED);
    return;
  }
  if (curPageContent.ServiceAddresses[0].indexOf("ldap://") != -1) {
    enableLDAPoverSSL.checked = false;
    ad_ip = ad_ip.replace("ldap://","");
  }
  else if(curPageContent.ServiceAddresses[0].indexOf("ldaps://") != -1) {
    enableLDAPoverSSL.checked = true;
    ad_ip = ad_ip.replace("ldaps://","");
  }else{
    alert(lang.LANG_CONFIG_SSL_CERTIFICATE_GET_FAILED);
    return;
  }
  var curService = curPageContent.LDAPService;
  if (curService!=null && curService.hasOwnProperty('Oem') &&
      curService.Oem.hasOwnProperty('OpenBMC') &&
      curService.Oem.OpenBMC.hasOwnProperty('LDAPServerPort') &&
      curService.Oem.OpenBMC.LDAPServerPort!=""){

      ad_ip = ad_ip + ":" + curService.Oem.OpenBMC.LDAPServerPort;
    }

  setUrlFixedSSLPrefix();
  var ad_bind = curPageContent.Authentication.Username;
  var ad_base = curPageContent.LDAPService.SearchSettings.BaseDistinguishedNames[0];
  var ad_pwd = "";

  ServerUrl.value = ad_ip;
  AdBinPW.value = ad_pwd;
  AdBinDN.value = ad_bind;
  AdBase.value = ad_base;
  if(AdBinDN.value!="")
    AdUserID.value = curPageContent.LDAPService.SearchSettings.UsernameAttribute;
}

function showRoleMapGroup(roleMapGroupData){
  var AdRowData=[];
  if (roleMapGroupData.length == 0) {
    AdRowData.push([ 1, "~", "~"]);
  } else {
    for (var i = 0; i < roleMapGroupData.length; i++) {
      var roleGroupPriv = roleMapGroupData[i].LocalRole == "ReadOnly"
                              ? "User"
                              : roleMapGroupData[i].LocalRole;
      AdRowData.push([
        i, roleMapGroupData[i].RemoteGroup, roleGroupPriv
      ]);
    }
    AdRowData.push([ roleMapGroupData.length + 1, "~", "~"]);
  }
  LDGridTable.empty();
  LDGridTable.show(AdRowData);
}


function isValidPort(port) {
  if (/^[1-9]\d*|0$/.test(port) && port * 1 >= 0 && port * 1 <= 65535){
      return true
  }
  return false;
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

    var tempVar = ServerUrl.value.split(":");
    if(tempVar.length>=3) {
      error_msg_dtring += "ServerUrl\n";
      bool_validation = false;
    }

    AdPortValue = "";
    if(tempVar.length==2)
      AdPortValue = tempVar[1];
    AdIpValue = tempVar[0];
    var IpExp=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    var reg = AdIpValue.match(IpExp);
    
    if(reg==null){
      error_msg_dtring += lang.LANG_CONFIG_ACTIVE_DIRECTORY_IP+"\n"; 
      bool_validation = false;
    }

    if(AdPortValue!="" && !isValidPort(AdPortValue)){
      error_msg_dtring += lang.LANG_AD_ADV_PORT+"\n";
      bool_validation = false;
    }

    if(sslCaFlag==false && enableLDAPoverSSL.checked){
      error_msg_dtring += lang.LANG_CONFIG_LDAP_CACERT_FILE +"\n";
      bool_validation = false;
    }

    if (AdGroupName.value == '' && selected_row != '') {
      error_msg_dtring += lang.LANG_AD_GROUP_NAME+"\n";
      bool_validation = false;
    }
    if (AdGroupPrivilege.value == '' && selected_row != '') {
      error_msg_dtring += lang.LANG_CONFIG_AD_GROUP_PRIVILEGE+"\n";
      bool_validation = false;
    }
    if(AdUserID.value=="" && enableLd==true){
      AdUserID.value = "sAMAccountName";
    }
    if(AdUserID.value=="" && enableAd==true){
      AdUserID.value = "uid";
    }
    if (!bool_validation) {
      alert(lang.LANG_LDAP_CONFIG_INFO_ERROR_PREFIX +
                error_msg_dtring,
            {type : "pre"});
      error_msg_dtring = "";
    } else {
      error_msg_dtring = "";
      saveAdconfig();}
}

// functions related with patch
function saveAdconfig() {
  var ajax_url = "/redfish/v1/AccountService";
  var failureAlert=enableAd?lang.LANG_CONFIG_AD_SAVE_FAILED:lang.LANG_CONFIG_LDAP_SAVE_FAILED;
  var ajax_param = enableAd?{
    "LDAP" : {"ServiceEnabled" : false}
  }:{
    "ActiveDirectory" : {"ServiceEnabled" : false}
  };
  var ajax_data = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    asynchronous:false,
    contentType : "application/json",
    parameters : ajax_data,
    onSuccess : saveAdconfig_Cont,
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response, failureAlert, null);
    }
  });
}
//Ip and port are stored separately in AD json, , ip and port are stored together as url(ServiceAddresses) in LDAP json.
function saveAdconfig_Cont() {
  var sslString = enableLDAPoverSSL.checked ? "ldaps://" : "ldap://";
  var failureAlert=enableAd?lang.LANG_CONFIG_AD_SAVE_FAILED: lang.LANG_CONFIG_LDAP_SAVE_FAILED;
  var successAlert=enableAd?lang.LANG_CONFIG_AD_UPDATE_SUCCESS:lang.LANG_CONFIG_LDAP_UPDATE_SUCCESS;
  Loading(true);
  var serviceAddress=sslString+AdIpValue;
  if(enableLd && AdPortValue!=""){
      serviceAddress += AdPortValue;
  }
  var adConfigJson = {
    "ActiveDirectory" : {
      "ServiceEnabled" : true,
      "Authentication" :
          {"Username" : AdBinDN.value, "Password" : AdBinPW.value},
      "LDAPService" : {
        "Oem" : {
          "OpenBMC" : {
            "LDAPBindTime" : "5",
            "LDAPServerPort" : AdPortValue
          }
        },
        "SearchSettings" : {
          "BaseDistinguishedNames" : [ AdBase.value],
          "UsernameAttribute" : AdUserID.value
        }
      },
      "ServiceAddresses" : [serviceAddress]  
    }
  };

  var ldConfigJson = {
    "LDAP" : {
      "ServiceEnabled" : true,
      "Authentication" :
          {"Username" : AdBinDN.value, "Password" : AdBinPW.value},
      "LDAPService" : {
        "SearchSettings" : {
          "BaseDistinguishedNames" : [ AdBase.value],
          "UsernameAttribute" : AdUserID.value
        }
      },
      "ServiceAddresses" : [serviceAddress] 
    }
  };
  var data = enableAd?adConfigJson:ldConfigJson;
  var ajax_url = '/redfish/v1/AccountService';

  var payload = JSON.stringify(data);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    asynchronous:false,
    contentType : 'application/json',
    parameters : payload,
    onSuccess : function(response) {
      Loading(false);
      alert(successAlert, {
        title : lang.LANG_GENERAL_SUCCESS,
        onClose : function() { location.href = AdPage; }
      });
      if(AdGroupName.value!=="" && AdGroupPrivilege.value!="") {
        modifyGroup();
      };
      fetchRemoteConfiguration();
    },
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response,failureAlert, null);
    }
  });
}

// modify existed group item or add new group item
function modifyGroup(){
  if(AdGroupName.value=="" || AdGroupPrivilege.value=="") return;
  var curRoleMapGroupData=prepareGroupDataForSavebutton();
  if(curRoleMapGroupData==localRoleMapGroupData) return;
  saveRoleMappingGroup(curRoleMapGroupData);
}

//According to different types of group data update, 
//patch group json generation is handled by 
//different functions (prepareGroupDataForSavebutton,prepareGroupDataForDeleteButton).
function prepareGroupDataForSavebutton() {
  if(AdGroupName.value=="" || AdGroupPrivilege.value=="") return localRoleMapGroupData;
  var selected_row = GetSelectedRowCellInnerHTML(0);
  Loading(true);
  tempLocalRoleMapGroupData = localRoleMapGroupData.slice();
  if (selected_row != "~") {
    for (var i = 0; i < tempLocalRoleMapGroupData.length; i++) {
      if (tempLocalRoleMapGroupData[i].RemoteGroup == selected_row) {
        tempLocalRoleMapGroupData[i] = null;
      }
    }
  }
  tempLocalRoleMapGroupData.push({
    "RemoteGroup" : AdGroupName.value,
    "LocalRole" : AdGroupPrivilege.value
  });
  Loading(false);
  return tempLocalRoleMapGroupData;
}


function saveRoleMappingGroup(curRoleMapGroupData) {
  var failureAlert = enableAd?lang.LANG_CONFIG_AD_GROUP_SAVE_FAILED:lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED;
  var successAlert = enableAd?lang.LANG_CONFIG_AD_GROUP_SAVE_SUCCESS:lang.LANG_CONFIG_LDAP_GROUP_SAVE_SUCCESS;
  if(AdGroupName.value == '' || AdGroupPrivilege.value == '')
    return;

  var groupPatchResult =false;
  groupPatchResult = patchRemoteGroup(curRoleMapGroupData);
  alert(successAlert, {
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

function prepareGroupDataForDeleteButton() {
  Loading(true);
  if (selected_row == "~") return localRoleMapGroupData;
  tempLocalRoleMapGroupData = localRoleMapGroupData.slice();
  for (var i = 0; i < tempLocalRoleMapGroupData.length; i++) {
    if (tempLocalRoleMapGroupData[i].RemoteGroup == selected_row) {
      tempLocalRoleMapGroupData[i] = null;//.splice(i, 1); 
    }
  }
  return tempLocalRoleMapGroupData;
}

function deleteGroup(){
  if (selected_row == "~") return;
  var groupPatchResult = false;
  var curRoleMapGroupData=prepareGroupDataForDeleteButton();
  if(curRoleMapGroupData==localRoleMapGroupData)
    return;
  groupPatchResult = patchRemoteGroup(curRoleMapGroupData);
  fetchRemoteConfiguration();
  resetLocalRoleMappingGroup();
  alert(lang.LANG_GRP_DELETE_SUCCESS,{
    title : lang.LANG_GENERAL_SUCCESS,
    onClose : function() { location.href = AdPage; }});
}

// patch local mapping role group(localRoleMapGroupData) to remote server
function patchRemoteGroup(curRoleMapGroupData){
  Loading(true);
  var ajax_url = '/redfish/v1/AccountService';
  var ajax_param = enableAd?{"ActiveDirectory": {"RemoteRoleMapping" : curRoleMapGroupData}}:{"LDAP": {"RemoteRoleMapping" : curRoleMapGroupData}};
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    asynchronous:false,
    contentType : 'application/json',
    parameters : object,
    onSuccess : function(){return true},
    onFailure : function() {return false},
  });
  Loading(false);
}

function enableConfigurationInfos(enable) {
  ServerUrl.disabled = !enable;
  AdBinPW.disabled = !enable;
  AdUserID.disabled = !enable;
  AdBinDN.disabled = !enable;
  AdBase.disabled = !enable;
  AdSave.disabled = !enable;
  if(sslCaFlag && enable)
    enableLDAPoverSSL.disabled=false;
}

function enableGroupInfos(enable) {
  AdGroupName.disabled = !enable;
  AdGroupPrivilege.disabled = !enable;
  AdGroupDelete.disabled = !enable;
}


function onAdEnable() {
  enableAd = true;
  EnableLdSwitch.checked=false;
  EnableNoneSwitch.checked=false;
  if(sslCaFlag)
    enableLDAPoverSSL.disabled=false;
  enableLd=false;
  enableNone=false;

  document.getElementById("ADGroupTable").style.display = "";
  document.getElementById("ad_gf_header_span").textContent = lang.LANG_AD_GF_CAPTION;
  document.getElementById("ad_gf_header_span").style.display = "";
  
  AdUserID.value="";
  ServerUrl.value="";
  AdBinDN.value="";
  AdBase.value = "";

  enableConfigurationInfos(EnableAdSwitch.checked);
  enableGroupInfos(EnableAdSwitch.checked);
  if(remoteConfiguration.ActiveDirectory.ServiceEnabled){
    var curPageContent = remoteConfiguration.ActiveDirectory;
    localRoleMapGroupData = curPageContent.RemoteRoleMapping;
    showLDAPConfiguration(curPageContent);
    showRoleMapGroup(curPageContent.RemoteRoleMapping);
  }
  else{
    showRoleMapGroup([]);
  }
  setUrlFixedSSLPrefix();
}

function onLdEnable() {
  enableLd = EnableLdSwitch.checked;
  EnableAdSwitch.checked=false;
  EnableNoneSwitch.checked=false;
  if(sslCaFlag)
    enableLDAPoverSSL.disabled=false;
  enableAd=false;
  enableNone=false;
  document.getElementById("ADGroupTable").style.display = "";
  document.getElementById("ad_gf_header_span").textContent =  lang.LANG_LDAP_GF_CAPTION;
  document.getElementById("ad_gf_header_span").style.display = "";

  AdUserID.value="";
  ServerUrl.value="";
  AdBinDN.value="";
  AdBase.value = "";
  enableConfigurationInfos(enableLd);
  enableGroupInfos(enableLd);
  if(remoteConfiguration.LDAP.ServiceEnabled){
    var curPageContent = remoteConfiguration.LDAP;
    localRoleMapGroupData = curPageContent.RemoteRoleMapping;
    showLDAPConfiguration(curPageContent);
    showRoleMapGroup(curPageContent.RemoteRoleMapping);
  }
  else{
    showRoleMapGroup([]);
  }
  setUrlFixedSSLPrefix();
}


function onNoneEnable() {
  document.getElementById("ADButtonDeleteGroup").style.display = "none";
  document.getElementById("ADGroupTable").style.display = "none";
  document.getElementById("role_group_name").style.display = "none";
  document.getElementById("role_group_priv").style.display = "none";
  document.getElementById("ad_gf_header_span").style.display = "none";
  enableNone = true;
  EnableNoneSwitch.checked=true;
  EnableAdSwitch.checked=false;
  EnableLdSwitch.checked=false;
  enableLDAPoverSSL.checked = false;
  enableLd=false;
  enableAd=false;
  ServerUrl.placeholder="";
  AdUserID.value="";
  ServerUrl.value="";
  AdBinDN.value="";
  AdBase.value = "";
  localRoleMapGroupData = [];
  document.getElementById("IPLABLE").textContent = "";
  enableLDAPoverSSL.disabled = true;
  enableConfigurationInfos(false);
  enableGroupInfos(false);
}


function  setUrlFixedSSLPrefix(){ 
    document.getElementById("IPLABLE").textContent=
      enableLDAPoverSSL.checked ? 'ldaps://':'ldap://';
      document.getElementById("ADIP").style.textIndent = enableLDAPoverSSL.checked ?urlPrefixTextIndents[0]:urlPrefixTextIndents[1];
}

function resetLocalRoleMappingGroup(){
  if(enableAd){
    localRoleMapGroupData = remoteConfiguration.ActiveDirectory.RemoteRoleMapping;
  }
  if(enableLd){
    localRoleMapGroupData = remoteConfiguration.LDAP.RemoteRoleMapping;
  }
  if(enableNone){
    localRoleMapGroupData= [];
  }
  tempLocalRoleMapGroupData = [];
}

function setInfoField(){
  var indentvalue1 = "12px";
  var indentvalue2 = "24px";
  var infoTitle = document.getElementById("infoTitle");
  var infoTr1 = document.getElementById("infoTr1");
  var infoTr2 = document.getElementById("infoTr2");
  var infoTr3 = document.getElementById("infoTr3");
  var infoTr4 = document.getElementById("infoTr4");
  var infoTr5 = document.getElementById("infoTr5");
  var infoTr6 = document.getElementById("infoTr6");
  var infoTr7 = document.getElementById("infoTr7");
  infoTitle.innerText = lang.LANG_AD_LDAP_INFO_CAPTION;
  infoTr1.innerText = lang.LANG_AD_LDAP_INFO_TR1;
  infoTr2.innerText = lang.LANG_AD_LDAP_INFO_TR2;
  infoTr3.innerText = lang.LANG_AD_LDAP_INFO_TR3;
  infoTr4.innerText = lang.LANG_AD_LDAP_INFO_TR4;
  infoTr5.innerText = lang.LANG_AD_LDAP_INFO_TR5;
  infoTr6.innerText = lang.LANG_AD_LDAP_INFO_TR6;
  infoTr7.innerText = lang.LANG_AD_LDAP_INFO_TR7;
  infoTr1.style.textIndent = indentvalue1;
  infoTr2.style.textIndent = indentvalue1;
  infoTr3.style.textIndent = indentvalue2;
  infoTr4.style.textIndent = indentvalue2;
  infoTr5.style.textIndent = indentvalue1;
  infoTr6.style.textIndent = indentvalue2;
  infoTr7.style.textIndent = indentvalue2;
 }

 
//tips for group patch arrary data format
/*# operation of group data configuration
Delete:\
Entry deleted will be set as null in the Original position. \
ADD:\
The new entry is pushed at the end of arrary. RemoteGroup and LocalRole are reversed. \
MODIFY:\
Modifying the existing entries consists of the following two steps: 
1. deleting the original entry
2. adding new entry

## add a new group item
```
  "{"LDAP":{"RemoteRoleMapping":
                                  [
                                  {"LocalRole":"Administrator","RemoteGroup":"ewsuser1"},
                                  {"LocalRole":"Administrator","RemoteGroup":"ldapuser1"},
                                  {"LocalRole":"Administrator","RemoteGroup":"ewsuser"},
                                  {"LocalRole":"Administrator","RemoteGroup":"ewsuser1"},
                                  {"RemoteGroup":"ldapuser3","LocalRole":"Administrator"} 
                                  ]
  }}"
```
## delete a existing group item
```
"{"LDAP":{"RemoteRoleMapping":
                                [
                                {"LocalRole":"Administrator","RemoteGroup":"ewsuser"},
                                {"LocalRole":"Administrator","RemoteGroup":"ewsuser1"},
                                {"LocalRole":"Administrator","RemoteGroup":"ewsuser1"},
                                {"LocalRole":"Administrator","RemoteGroup":"ldapuser1"},
                                null
                                ]
}}"
```
```
"{"LDAP":{"RemoteRoleMapping":
                                [
                                {"LocalRole":"Administrator","RemoteGroup":"ewsuser1"},
                                null,
                                {"LocalRole":"Administrator","RemoteGroup":"ewsuser"},
                                {"LocalRole":"Administrator","RemoteGroup":"ewsuser1"}
                                ]
}}"
```
## modify a existed group item
```
"{"LDAP":{"RemoteRoleMapping":
                                [
                                {"LocalRole":"Administrator","RemoteGroup":"ewsuser"},
                                null,{"LocalRole":"Administrator","RemoteGroup":"ewsuser1"},
                                {"LocalRole":"Administrator","RemoteGroup":"ewsuser1"},
                                {"LocalRole":"Administrator","RemoteGroup":"ldapuser1"},
                                {"RemoteGroup":"ldapuser4","LocalRole":"Administrator"}
                                ]
}}"
```
*/
