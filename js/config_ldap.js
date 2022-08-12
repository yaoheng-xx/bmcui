var LDAP_SSL_Enable = false;
var LDAP_SSL_Port = 0;
var ldap_group = "";
var LDurlRdirect = 0;
var LDRemoteRoleMapping_array = [];
var LDRowData = [];
var LDselected_row = '';
var LDAPpage = "/page/config_ldap.html";
var sslLdapFlag;
var LDsslCaFlag;
window.addEventListener('load', LDPageInit);
if (parent.lang) { lang = parent.lang; }

function LDPageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_ldap_hlp.html";
    document.getElementById("LDButtonSave").value = lang.LANG_CONFIG_LDAP_SAVE;
    document.getElementById("LDButtonDeleteGroup").value = "Delete";
    EnableLDAPSwitch = document.getElementById("SwitchLDAP");
    EnableLDAPSwitch.addEventListener("click", onLDAPEnable);
    LDIP = document.getElementById("LDAPIP");
    enableLDAPoverSSL = document.getElementById("LDenableSSL");
    LDBinPW = document.getElementById("LDAPBINDPW");
    LDBinDN = document.getElementById("LDAPBINDWN");
    LDBase = document.getElementById("LDAPBASE");
    LDUserID = document.getElementById("LDAPUSERID");
    LDGroupName = document.getElementById("LDGROUPNAME");
    LDGroupPrivilege = document.getElementById("LDGROUPPRIVILEGE");
    LDGroupDelete = document.getElementById("LDButtonDeleteGroup");
    LDGroupDelete.addEventListener("click", deleteLDAPGroup);
    LDSave = document.getElementById("LDButtonSave");
    LDSave.addEventListener("click", function(){
        if(EnableLDAPSwitch.checked){
            validateLDAPform();
        }else{
            saveLDAPconfig();
        }
    });
    LDOutputString();
    initCheckInputListener("LDAPIP", lang.LANG_CONFIG_LDAP_IP,
                           INPUT_FIELD.HOSTNAMEANDIPV4);
    CheckUserPrivilege(LDPrivilegeCallBack);
}

function LDOutputString() {
    document.getElementById("caption_div").textContent = lang.LANG_CONFIG_LDAP_CAPTION;
    document.getElementById("ldap_en_span").textContent = lang.LANG_CONFIG_LDAP_EN;
    document.getElementById("ldap_ip_span").textContent = lang.LANG_CONFIG_LDAP_IP;
    document.getElementById("ldap_pwd_span").textContent = lang.LANG_CONFIG_LDAP_PWD;
    document.getElementById("ldap_dn_span").textContent = lang.LANG_CONFIG_LDAP_DN;
    document.getElementById("ldap_sb_span").textContent = lang.LANG_CONFIG_LDAP_SB;
    document.getElementById("ldap_userid_span").textContent =
        lang.LANG_CONFIG_LDAP_USERID_ATTR;
    document.getElementById("ldap_groupname_span").textContent = lang.LANG_CONFIG_LDAP_GROUP_NAME;
    document.getElementById("ldap_groupprivilege_span").textContent = lang.LANG_CONFIG_LDAP_GROUP_PRIVILEGE;
    document.getElementById("LDssl_enable").textContent =
        lang.LANG_CONFIG_LDAP_SSL;
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
}

function onClickLDAPGroupList(privilege) {
  if (privilege == '03' || privilege == '02') {
    enableLDAPGroupInfos(false);
  } else {
    enableLDAPGroupInfos(EnableLDAPSwitch.checked);
  }
  document.getElementById("LDButtonDeleteGroup").style.display = "";
  LDselected_row = GetSelectedRowCellInnerHTML(0);
  if (LDselected_row == "~") {
    LDGroupName.value = '';
    LDGroupPrivilege.value = '';
    document.getElementById("LDButtonDeleteGroup").style.display = "none";
  } else {
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

function LDPrivilegeCallBack(Privilege)
{
    if(Privilege == '04') {
      LDgetCertificateInfo();
      requestReadLDAPInfo();
    } else if (Privilege == '03' || Privilege == '02') {
      LDdisablefunc();
      requestReadLDAPInfo();
    } else {
      location.href = SubMainPage;
      return;
    }
}

function LDdisablefunc(){
    LDIP.disabled = true;
    LDBinPW.disabled = true;
    LDBinDN.disabled = true;
    LDBase.disabled = true;
    LDGroupName.disabled = true;
    LDGroupPrivilege.disabled = true;
    LDSave.disabled = true;
    EnableLDAPSwitch.disabled = true;
}
function LDgetCertificateInfo() {
  Loading(true);
  var ajaxUrl = '/redfish/v1/CertificateService/CertificateLocations';
  var ajaxReq = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    onSuccess : LDGETCertificateURL,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFIG_SSL_CERTIFICATE_GET_FAILED);
    },
  });
}
function LDGETCertificateURL(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var response = JSON.parse(arg.responseText);
    var certificate_array = response.Links.Certificates;
    if (certificate_array.length == 0) {
      Loading(false);
      document.getElementById("ldapValidDate").textContent = "--";
      document.getElementById("CAvalidDate").textContent = "--";
      sslLdapFlag = false;
      LDsslCaFlag = false;
    }
    for (var i = 0; i < certificate_array.length; i++) {
      console.log(certificate_array[i]["@odata.id"]);
      LDGetSSLReading(certificate_array[i]["@odata.id"]);
    }
  }
}
function LDGetSSLReading(url) {
  if (url.indexOf("/LDAP/") != -1) {
    LDupdateCertificateValidInfo(url, "ldapValidDate");
    sslLdapFlag = true;
  }
  if (url.indexOf("/Truststore/") != -1) {
    LDupdateCertificateValidInfo(url, "CAvalidDate");
    LDsslCaFlag = true;
  }
  Loading(false);
}
function LDupdateCertificateValidInfo(url, id) {
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
function requestReadLDAPInfo()
{
    Loading(true);
    var ajax_url = '/redfish/v1/AccountService';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: responseLDAPInfo,
        onFailure: function(response){
            Loading(false);
            HandleFailureStatus(response, lang.LANG_CONFIG_LDAP_GET_FAILED, LDdisablefunc);
        }
    });
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

function validateLDAPform() {
    var bool_validation = true;
    var error_msg_dtring = "";
    if((!(/^(((cn=)|(uid=))[a-z]{1}[\w\-\.]{2,63},?)+$/i.test(LDBinDN.value.split(",")[0])) || !(/^(((cn=)|(uid=)|(ou=)|(dc=)|(o=))[a-z]{0}[\w\-\.]{1,63},?)+$/i.test(LDBinDN.value)) || LDBinDN.value.length > 63 || LDBinDN.value.length < 4)){
        error_msg_dtring += "Bind DN\n";
        bool_validation = false;
    }
    if( !(/^[^ ]+$/.test(LDBinPW.value)) ){
        error_msg_dtring += "Password\n";
        bool_validation = false;
    }
    if( !(/^(((cn=)|(uid=)|(ou=)|(dc=)|(o=))[a-z]{0}[\w\-\.]{1,63},?)+$/i).test(LDBase.value) 
        && !(LDBase.value.length >= 4 && LDBase.value.length <= 64)
    ){
        error_msg_dtring += "Search Base\n";
        bool_validation = false;
    }
    if (LDGroupName.value == '' && LDselected_row != '') {
      error_msg_dtring += "Group Name\n";
      bool_validation = false;
    }
    if (LDGroupPrivilege.value == '' && LDselected_row != '') {
      error_msg_dtring += "Group Privilege\n";
      bool_validation = false;
    }
    if(!bool_validation){
        alert("Invalid Inputs are given to \nthe following fields.\n "+ error_msg_dtring, {type: "pre"});
        error_msg_dtring = "";
    }else{
        error_msg_dtring = "";
        saveLDAPconfig();
    }
}

/*
function LDcertificateValidation(fileField, errorMessage) {
    if (!fileField.files.length) {
        alert(lang.LANG_THERMAL_UPLOAD_FILE);
        return false;
    } else {
        var allowedFiles = ['pem'];
        var fileUpload = fileField.files[0];
        var regex = new RegExp('^.*.(' + allowedFiles.join('|') + ')$');
            if (regex.test(fileUpload.name)) {
                return true;
            }else if (!regex.test(fileUpload.name)) {
                alert(errorMessage);
                return false;
            } 
    }
}

function LDsaveresult(originalRequest)
{
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
        alert(lang.LANG_CONFIG_LDAP_SUCCSAVE, {title: lang.LANG_GENERAL_SUCCESS});
      requestReadLDAPInfo();
    }
    else {
       alert(lang.LANG_COMMON_UNSAVE);
    }
}


function response_Create_LDAP_Group(originalRequest){
    f (originalRequest.readyState == 4 && originalRequest.status == 200) {
        alert(lang.LANG_CONFIG_LDAP_SUCCSAVE, {title: lang.LANG_GENERAL_SUCCESS});
      requestReadLDAPInfo();
    }
    else {
       alert(lang.LANG_COMMON_UNSAVE);
    } 
  }

*/
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





function enableLDAPInfos(enable) {
    LDIP.disabled = !enable;
    LDBinPW.disabled = !enable;
    LDBinDN.disabled = !enable;
    LDBase.disabled = !enable;
    LDUserID.disabled = !enable;
    LDcheckSSL(enable);
}

function enableLDAPGroupInfos(enable){
    LDGroupName.disabled = !enable;
    LDGroupPrivilege.disabled = !enable;
    LDGroupDelete.disabled = !enable;
}

function onLDAPEnable() {
    enableLDAPInfos(EnableLDAPSwitch.checked);
    enableLDAPGroupInfos(EnableLDAPSwitch.checked);
}

function LDcheckSSL(ldapStatus) {
  if (LDsslCaFlag && sslLdapFlag) {
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
