"use strict";
var urlRdirect = 0;
var AdRemoteRoleMapping_array = [];
var LdRemoteRoleMapping_array = [];
var AdRowData = [];
var LdRowData = [];
var selected_row = '';
var AdPage = "/page/config_ad.html";
var LDAPpage = "/page/config_ldap.html";
var sslLdapFlag;
var sslCaFlag;
var EnableAdSwitch;
var EnableLdSwitch;
var EnableNoneSwitch;

var enableAd=true;
var enableLd=true;
var enableNone=true;

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
var AdGroupDelete;
var AdSave;
var LDGridTable;

var accountServiceResponse;

window.addEventListener('load', ADPageInit);
var lang;
if (parent.lang) { lang = parent.lang; }
 

function ADPageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/configure_ad_hlp.html";
  document.getElementById("ADButtonSave").value = lang.LANG_CONFIG_AD_SAVE;
  document.getElementById("ADButtonDeleteGroup").value = "Delete";
  EnableAdSwitch = document.getElementById("AdSwitch");
  EnableLdSwitch = document.getElementById("LdSwitch");
  EnableNoneSwitch = document.getElementById("NoneSwitch");
  enableLDAPoverSSL = document.getElementById("ADenableSSL");

  EnableAdSwitch.addEventListener("click", onAdEnable);
  EnableLdSwitch.addEventListener("click", onLdEnable);
  EnableNoneSwitch.addEventListener("click", onNoneEnable);
  enableLDAPoverSSL.addEventListener("click", onSSLEnable);

  AdIp = document.getElementById("ADIP");
  
  enableAd = true;
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
  document.getElementById("ad_en_span").textContent = "Enable Active Directory";
  document.getElementById("ldap_en_span").textContent = "Enable LDAP";
  document.getElementById("none_en_span").textContent = "Disable";
  document.getElementById("ad_ip_span").textContent = "Server URL";
  document.getElementById("ad_dn_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_BIND_DN;
  document.getElementById("ad_pwd_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_BIND_PASSWORD;
  document.getElementById("ad_sb_span").textContent =
      lang.LANG_CONFIG_AD_SEARCH_BASE;
  document.getElementById("ad_userid_span").textContent =
      lang.LANG_CONFIG_ACTIVE_DIRECTORY_USER_ID;

  document.getElementById("ADssl_enable").textContent = "Active authentication over SSL";//lang.LANG_AD_ADV_SSL;
  document.getElementById("ADcaValid").textContent =
      lang.LANG_AD_SSL_CA_VALID_INFO;
  document.getElementById("ldapValid").textContent =
      lang.LANG_AD_SSL_LDAP_VALID_INFO;
  document.getElementById("ADsslValidInfo").textContent =
      lang.LANG_LDAP_SSL_VALID_INFO;

  document.getElementById("ad_gf_header_span").style.display = "none";
  
  document.getElementById("ADButtonDeleteGroup").style.display = "none";
  document.getElementById("ad_groupname_span").textContent ="Remote Group";
  //lang.LANG_AD_GROUP_NAME;
  document.getElementById("ad_groupprivilege_span").textContent ="Local Privilege";
  //lang.LANG_CONFIG_AD_GROUP_PRIVILEGE;
  document.getElementById("role_group_name").style.display = "none";
  document.getElementById("role_group_priv").style.display = "none";
}

function AdGroupTableInit() {
  var TableTitles = [
    [ "Remote Group", "50%", "center" ],
    [ "Local Privilege", "50%", "center" ],
  ];
  var AdGroupTable = document.getElementById("ADGroupTable");
  LDGridTable = GetTableElement();
  SetRowSelectEnable(1);
  LDGridTable.setColumns(TableTitles);
  LDGridTable.init('LDGridTable', AdGroupTable, "60px");
  AdGroupTable.onclick =function() { CheckUserPrivilege(onClickAdGroupList); }; ;
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


function deleteGroup() {
  var selectedRow = GetSelectedRowCellInnerHTML(0);
  Loading(true);
  if (selectedRow == "~") return;
  if(EnableAdSwitch){
    for (var i = 0; i < AdRemoteRoleMapping_array.length; i++) {
      if (AdRemoteRoleMapping_array[i].RemoteGroup == selectedRow) {
        AdRemoteRoleMapping_array[i] = null;
      }
    }
  }else{
    for (var i = 0; i < LdRemoteRoleMapping_array.length; i++) {
      if (LdRemoteRoleMapping_array[i].RemoteGroup == selectedRow) {
        LdRemoteRoleMapping_array[i] = null;
      }
    }
  }
  var tempPage= EnableAdSwitch.checked?AdPage:LDAPpage;
  var tempFailureAlert=EnableAdSwitch.checked?lang.LANG_CONFIG_AD_GROUP_SAVE_FAILED:lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED;
  var ajax_url = '/redfish/v1/AccountService';
  var ajax_param =EnableAdSwitch?{"ActiveDirectory": {"RemoteRoleMapping" : AdRemoteRoleMapping_array}}:{"LDAP": {"RemoteRoleMapping" : LdRemoteRoleMapping_array}};
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
function disablefunc(){
  /*
  LDIP.disabled = true;
  LDBinPW.disabled = true;
  LDBinDN.disabled = true;
  LDBase.disabled = true;
  LDGroupName.disabled = true;
  LDGroupPrivilege.disabled = true;
  LDSave.disabled = true;
  EnableLDAPSwitch.disabled = true;
  */
}
//查看countservice
function requestReadAdInfo() {
  Loading(true);
  var failureAlert = enableAd?lang.LANG_CONFIG_AD_GET_FAILED:lang.LANG_CONFIG_LDAP_GET_FAILED;
  var ajax_url = '/redfish/v1/AccountService';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : function(response) {
      accountServiceResponse = response;
      if(enableNone) return;
      responseAdInfo(response,enableAd);
    },
    onFailure : function(response) {
      Loading(false);
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
    onSuccess : ADGETCertificateURL,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFIG_SSL_CERTIFICATE_GET_FAILED);
    },
  });
}


function responseAdInfo(arg,isAd) {
  Loading(false);
  if(arg.readyState != 4 || arg.status != 200) return;
  var content = JSON.parse(arg.responseText);
  var ad = {};
  if(isAd){
    ad = content.ActiveDirectory;
  }else{
    ad = content.LDAP;
  }
  var ad_ip = '';
  ad_ip = ad.ServiceAddresses[0];
  if(ad_ip==''){
    if(enableLDAPoverSSL.checked)
    ad_ip="ldaps://";
    else ad_ip="ldap://";
  }

  if (ad.ServiceAddresses[0].indexOf("ldap://") != -1) {
    enableLDAPoverSSL.checked = false;
  }
  if (ad.ServiceAddresses[0].indexOf("ldaps://") != -1) {
    enableLDAPoverSSL.checked = true;
  }

  var ad_bind = ad.Authentication.Username;
  var ad_base = ad.LDAPService.SearchSettings.BaseDistinguishedNames[0];
  var ad_pwd = "";

  AdIp.value = ad_ip;

  AdBinPW.value = ad_pwd;
  AdBinDN.value = ad_bind;
  AdBase.value = ad_base;
  if(AdIp.value!="" && AdBinPW.value!="" )
    AdUserID.value = ad.LDAPService.SearchSettings.UsernameAttribute;


  if(isAd)
  AdRemoteRoleMapping_array = filterData(ad.RemoteRoleMapping);
  else LdRemoteRoleMapping_array = filterData(ad.RemoteRoleMapping);
  var adGroupData = ad.RemoteRoleMapping;
  AdRowData=[];
  if (adGroupData.length == 0) {
    AdRowData.push([ 1, "~", "~"]);
  } else {
    for (var i = 0; i < adGroupData.length; i++) {
      var roleGroupPriv = adGroupData[i].LocalRole == "ReadOnly"
                              ? "User"
                              : adGroupData[i].LocalRole;
      AdRowData.push([
        i, adGroupData[i].RemoteGroup, roleGroupPriv
      ]);
    }
    AdRowData.push([ adGroupData.length + 1, "~", "~"]);
  }
  LDGridTable.empty();
  LDGridTable.show(AdRowData);

}



function responseLDAPInfo(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var content = JSON.parse(arg.responseText);
      var ldap = {};
      ldap = content.LDAP;
      //var ldap_en = (ldap.ServiceEnabled) ? "1" : "0";
      var ldap_ip = '';
      if (ldap.ServiceAddresses[0] != "") {
        ldap_ip = ldap.ServiceAddresses[0].split("://")[1];
        }

        var ad_bind = ldap.Authentication.Username;
        var ad_base = ldap.LDAPService.SearchSettings.BaseDistinguishedNames[0];
        var ad_pwd = "";
        AdUserID.value = ldap.LDAPService.SearchSettings.UsernameAttribute;
        AdIp.value = ldap_ip;
      
        AdBinPW.value = ad_pwd;
        AdBinDN.value = ad_bind;
        AdBase.value = ad_base;
      
        LdRemoteRoleMapping_array = ldap.RemoteRoleMapping;

        var LDAPGroupData = ldap.RemoteRoleMapping;
        LdRowData=[]
        if (LDAPGroupData.length == 0) {
          LdRowData.push([ 1, "~", "~" ]);
        } else {
          for (var i = 0; i < LDAPGroupData.length; i++) {
            var roleGroupPriv = LDAPGroupData[i].LocalRole == "ReadOnly" ? "User" : LDAPGroupData[i].LocalRole;
            LdRowData.push([
              i, LDAPGroupData[i].RemoteGroup, roleGroupPriv
            ]);
          }
          LdRowData.push([ LDAPGroupData.length + 1, "~", "~" ]);
        }

        LDGridTable.empty();
        LDGridTable.show(LdRowData);
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
    if(AdIp.value=='' || !((AdIp.value.indexOf("ldap://")==0) || (AdIp.value.indexOf("ldaps://")==0))) {
      error_msg_dtring += "AdIp\n";
      bool_validation = false;
    }
    var tempVar = AdIp.value.split(":");
    if(tempVar.length>3) {
      error_msg_dtring += "AdIp\n";
      bool_validation = false;
    }
    AdIpValue = tempVar[1].replace("//","");
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
      saveAdconfig();}
}


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
    contentType : "application/json",
    parameters : ajax_data,
    onSuccess : saveAdconfig_Cont,
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response, failureAlert, null);
    }
  });
}



function saveAdconfig_Cont() {

  var sslString = enableLDAPoverSSL.checked ? "ldaps://" : "ldap://";
  var serviceName=enableAd?"ActiveDirectory":"LDAP";
  var failureAlert=enableAd?lang.LANG_CONFIG_AD_SAVE_FAILED: lang.LANG_CONFIG_LDAP_SAVE_FAILED;
  Loading(true);
  var adConfigJson = {
    "ActiveDirectory" : {
      "ServiceEnabled" : true,
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
  var ldConfigJson = {
    "LDAP" : {
      "ServiceEnabled" : true,
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
  var data = enableAd?adConfigJson:ldConfigJson;
  var ajax_url = '/redfish/v1/AccountService';

  var payload = JSON.stringify(data);

  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : payload,
    onSuccess : responseWriteInfo,
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response,failureAlert, null);
    }
  });
}

function responseWriteInfo(arg) {
  Loading(false);
  var successAlert=enableAd?lang.LANG_CONFIG_LDAP_UPDATE_SUCCESS:lang.LANG_CONFIG_LDAP_UPDATE_SUCCESS;
  var temppage=enableAd?AdPage:LDAPpage;
  if(arg.readyState != 4 || arg.status != 200) return;
  var response = JSON.parse(arg.responseText);
  var isLd=response.hasOwnProperty("LDAP");
  var isAd=response.hasOwnProperty("ActiveDirectory");

    if (isAd && response.ActiveDirectory.ServiceEnabled) {
      AdRemoteRoleMapping_array = response.ActiveDirectory.RemoteRoleMapping;
      LdRemoteRoleMapping_array = [];
    } else if(isLd && response.LDAP.ServiceEnabled){
      LdRemoteRoleMapping_array = response.LDAP.RemoteRoleMapping;
      AdRemoteRoleMapping_array = [];
    }else{
      alert("Error:responseWriteInfo");
    }

    Create_Group();
    alert(successAlert, {
      title : lang.LANG_GENERAL_SUCCESS,
      onClose : function() { location.href = temppage; }
    });
    if (urlRdirect == 1) {
      var redirect_url = location.host;
      clearSessionInfo();
      redirect_url = window.location.protocol + "//" + redirect_url;
      setTimeout(function() { top.location.assign(redirect_url); }, 500);
    }
  }


function Create_Group() {
  Loading(true);
  var tempMap=enableAd?AdRemoteRoleMapping_array:LdRemoteRoleMapping_array;
  var failureAlert = enableAd?lang.LANG_CONFIG_AD_GROUP_SAVE_FAILED:lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED;

  if (AdGroupName.value != '' && AdGroupPrivilege.value != '') {
    if (selected_row != "~") {
      for (var i = 0; i < tempMap.length; i++) {
        if (tempMap[i].RemoteGroup == selected_row) {
          tempMap[i] = null;
        }
      }
    }
    tempMap.push({
      "RemoteGroup" : AdGroupName.value,
      "LocalRole" : AdGroupPrivilege.value
    });
    if(enableAd){
      AdRemoteRoleMapping_array = tempMap;
    }else{
      LdRemoteRoleMapping_array = tempMap;
    }
  }
  var ajax_url = '/redfish/v1/AccountService';
  var ajax_param = enableAd?{"ActiveDirectory": {"RemoteRoleMapping" : tempMap}}:{"LDAP": {"RemoteRoleMapping" : tempMap}};
  var object = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : object,
    onSuccess : function(){alert("Create_Group success");},
    onFailure : function() { alert(failureAlert); }
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
  enableLDAPoverSSL.disabled = false;
}


function enableAdInfos(enable) {
  AdIp.disabled = !enable;
  AdBinPW.disabled = !enable;
  AdUserID.disabled = !enable;
  AdBinDN.disabled = !enable;
  AdBase.disabled = !enable;
  AdSave.disabled = !enable;
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


function onAdEnable() {
  enableAd = EnableAdSwitch.checked;

  if(enableAd){
    EnableLdSwitch.checked=false;
    EnableNoneSwitch.checked=false;
    enableLd=false;
    enableNone=false;
  }
  document.getElementById("ADGroupTable").style.display = "";
  document.getElementById("ad_gf_header_span").textContent = " Active Directory Group Configuration";
  document.getElementById("ad_gf_header_span").style.display = "";
  //AdIp.placeholder="ldap://";
  enableAdInfos(EnableAdSwitch.checked);
  enableAdGroupInfos(EnableAdSwitch.checked);
  requestReadAdInfo();
  if(AdBinPW.value=="" && AdUserID.value=="")
    AdUserID.value =  "sAMAccountName";

  if (AdIp.value.indexOf("ldap://") != 0) {
    AdIp.value="ldap://";
  }
}

function onLdEnable() {   
  enableLd = EnableLdSwitch.checked;
  if(enableLd){
    EnableAdSwitch.checked=false;
    EnableNoneSwitch.checked=false;
    enableAd=false;
    enableNone=false;
  }
  document.getElementById("ADGroupTable").style.display = "";
  document.getElementById("ad_gf_header_span").textContent = "LDAP Group Configuration";
  document.getElementById("ad_gf_header_span").style.display = "";
  //AdIp.placeholder="ldap://";

  enableAdInfos(enableLd);
  enableAdGroupInfos(enableLd);
  requestReadAdInfo();
  if(AdBinPW.value=="" && AdUserID.value=="")
    AdUserID.value = "uid";
  if (AdIp.value.indexOf("ldaps://") != 0) {
    AdIp.value="ldaps://";
  }
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
  enableLd=false;
  enableAd=false;
  AdIp.placeholder="";
  AdUserID.value="";
  AdIp.value="";
  enableAdInfos(false);
  enableAdGroupInfos(false);
}

function  onSSLEnable(){
  if(enableLDAPoverSSL.checked && AdIp.value.indexOf("ldaps://") != 0){
     if(AdIp.value.indexOf("ldap://")==0){
      AdIp.value=AdIp.value.replace('ldap://', 'ldaps://'); 
    }else{
      AdIp.value="ldaps://"+AdIp.value;
    }
  }
  if((!enableLDAPoverSSL.checked) && AdIp.value.indexOf("ldap://") != 0){
    if(AdIp.value.indexOf("ldaps://")==0){
      AdIp.value=AdIp.value.replace('ldaps://', 'ldap://');
     }else{
      AdIp.value ="ldap://"+AdIp.value;
     }
    }
}



