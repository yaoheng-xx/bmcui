var LDAP_SSL_Enable = false;
var LDAP_SSL_Port = 0;
var ldap_group = "";
var urlRdirect = 0;
var RemoteRoleMapping_array = [];
var RowData = [];
var selected_row = '';
var LDAPpage = "/page/config_ldap.html";
var sslLdapFlag;
var sslCaFlag;
window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_ldap_hlp.html";
    document.getElementById("ButtonSave").value = lang.LANG_CONFIG_LDAP_SAVE;
    document.getElementById("ButtonDeleteGroup").value = "Delete";
    EnableLDAPSwitch = document.getElementById("SwitchLDAP");
    EnableLDAPSwitch.addEventListener("click", onLDAPEnable);
    LDIP = document.getElementById("LDAPIP");
    enableLDAPoverSSL = document.getElementById("enableSSL");
    LDBinPW = document.getElementById("LDAPBINDPW");
    LDBinDN = document.getElementById("LDAPBINDWN");
    LDBase = document.getElementById("LDAPBASE");
    LDUserID = document.getElementById("LDAPUSERID");
    LDGroupName = document.getElementById("GROUPNAME");
    LDGroupPrivilege = document.getElementById("GROUPPRIVILEGE");
    LDGroupDelete = document.getElementById("ButtonDeleteGroup");
    LDGroupDelete.addEventListener("click", deleteLDAPGroup);
    LDSave = document.getElementById("ButtonSave");
    LDSave.addEventListener("click", function(){
        if(EnableLDAPSwitch.checked){
            validateLDAPform();
        }else{
            saveLDAPconfig();
        }
    });
    OutputString();
    initCheckInputListener("LDAPIP", lang.LANG_CONFIG_LDAP_IP,
                           INPUT_FIELD.HOSTNAMEANDIPV4);
    CheckUserPrivilege(PrivilegeCallBack);
    LDAPGroupTableInit();
}

function OutputString() {
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
    document.getElementById("ldap_gf_header_span").textContent = lang.LANG_CONFIG_LDAP_GF_TITLE;
    document.getElementById("ssl_enable").textContent =
        lang.LANG_CONFIG_LDAP_SSL;
    document.getElementById("caValid").textContent =
        lang.LANG_AD_SSL_CA_VALID_INFO;
    document.getElementById("ldapValid").textContent =
        lang.LANG_AD_SSL_LDAP_VALID_INFO;
    document.getElementById("sslValidInfo").textContent =
        lang.LANG_LDAP_SSL_VALID_INFO;
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
  document.getElementById("ButtonDeleteGroup").style.display = "none";
  document.getElementById("group_name").style.display = "none";
  document.getElementById("group_priv").style.display = "none";
}

function onClickLDAPGroupList(privilege) {
  if (privilege == '03' || privilege == '02') {
    enableLDAPGroupInfos(false);
  } else {
    enableLDAPGroupInfos(EnableLDAPSwitch.checked);
  }
  document.getElementById("group_name").style.display = "";
  document.getElementById("group_priv").style.display = "";
  document.getElementById("ButtonDeleteGroup").style.display = "";
  selected_row = GetSelectedRowCellInnerHTML(0);
  if (selected_row == "~") {
    LDGroupName.value = '';
    LDGroupPrivilege.value = '';
    document.getElementById("ButtonDeleteGroup").style.display = "none";
  } else {
    document.getElementById("group_name").style.display = "";
    document.getElementById("group_priv").style.display = "";
    document.getElementById("ButtonDeleteGroup").style.display = "";
    for (var i = 0; i < RemoteRoleMapping_array.length; i++) {
      if (RemoteRoleMapping_array[i].RemoteGroup == selected_row) {
        LDGroupName.value = RemoteRoleMapping_array[i].RemoteGroup;
        LDGroupPrivilege.value = RemoteRoleMapping_array[i].LocalRole;
      }
    }
  }
}

function deleteLDAPGroup() {
  selected_row = GetSelectedRowCellInnerHTML(0);
  Loading(true);
  if (selected_row != "~") {
    for (var i = 0; i < RemoteRoleMapping_array.length; i++) {
      if (RemoteRoleMapping_array[i].RemoteGroup == selected_row) {
        RemoteRoleMapping_array[i] = null;
      }
    }
    var ajax_url = '/redfish/v1/AccountService';
    ajax_param = {"LDAP" : {"RemoteRoleMapping" : RemoteRoleMapping_array}};
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

function PrivilegeCallBack(Privilege)
{
    if(Privilege == '04') {
      getCertificateInfo();
      requestReadLDAPInfo();
    } else if (Privilege == '03' || Privilege == '02') {
      disablefunc();
      requestReadLDAPInfo();
    } else {
      location.href = SubMainPage;
      return;
    }
}

function disablefunc(){
    LDIP.disabled = true;
    LDBinPW.disabled = true;
    LDBinDN.disabled = true;
    LDBase.disabled = true;
    LDGroupName.disabled = true;
    LDGroupPrivilege.disabled = true;
    LDSave.disabled = true;
    EnableLDAPSwitch.disabled = true;
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
      console.log(certificate_array[i]["@odata.id"]);
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
function requestReadLDAPInfo()
{
    Loading(true);
    var ajax_url = '/redfish/v1/AccountService';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: responseLDAPInfo,
        onFailure: function(response){
            Loading(false);
            HandleFailureStatus(response, lang.LANG_CONFIG_LDAP_GET_FAILED, disablefunc);
        }
    });
}

function responseWriteLDAPInfo(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var response = JSON.parse(arg.responseText);
      if (response.LDAP.ServiceEnabled) {
        RemoteRoleMapping_array = response.LDAP.RemoteRoleMapping;
      } else {
        RemoteRoleMapping_array = [];
      }
      Create_LDAP_Group();
      alert(lang.LANG_CONFIG_LDAP_UPDATE_SUCCESS, {
        title : lang.LANG_GENERAL_SUCCESS,
        onClose : function() { location.href = LDAPpage; }
      });
      if (urlRdirect == 1) {
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
        RemoteRoleMapping_array = ldap.RemoteRoleMapping;
        if(ldap_en == "1") {
            EnableLDAPSwitch.checked = true;
        } else {
          EnableLDAPSwitch.checked = false;
        }
        var LDAPGroupData = ldap.RemoteRoleMapping;
        if (LDAPGroupData.length == 0) {
          RowData.push([ 1, "~", "~" ]);
        } else {
          for (var i = 0; i < LDAPGroupData.length; i++) {
            var roleGroupPriv = LDAPGroupData[i].LocalRole == "ReadOnly" ? "User" : LDAPGroupData[i].LocalRole;
            RowData.push([
              i, LDAPGroupData[i].RemoteGroup, roleGroupPriv
            ]);
          }
          RowData.push([ LDAPGroupData.length + 1, "~", "~" ]);
        }
        GridTable.empty();
        GridTable.show(RowData);
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
    if (LDGroupName.value == '' && selected_row != '') {
      error_msg_dtring += "Group Name\n";
      bool_validation = false;
    }
    if (LDGroupPrivilege.value == '' && selected_row != '') {
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

function certificateValidation(fileField, errorMessage) {
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
      if (selected_row != "~") {
        for (var i = 0; i < RemoteRoleMapping_array.length; i++) {
          if (RemoteRoleMapping_array[i].RemoteGroup == selected_row) {
            RemoteRoleMapping_array[i] = null;
          }
        }
      }
      RemoteRoleMapping_array.push({
        "RemoteGroup" : LDGroupName.value,
        "LocalRole" : LDGroupPrivilege.value
      });
    }
    var ajax_url = '/redfish/v1/AccountService';
    ajax_param = {"LDAP" : {"RemoteRoleMapping" : RemoteRoleMapping_array}};
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

function response_Create_LDAP_Group(originalRequest){
    /*f (originalRequest.readyState == 4 && originalRequest.status == 200) {
        alert(lang.LANG_CONFIG_LDAP_SUCCSAVE, {title: lang.LANG_GENERAL_SUCCESS});
      requestReadLDAPInfo();
    }
    else {
       alert(lang.LANG_COMMON_UNSAVE);
    }*/
}

function saveresult(originalRequest)
{
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
        alert(lang.LANG_CONFIG_LDAP_SUCCSAVE, {title: lang.LANG_GENERAL_SUCCESS});
      requestReadLDAPInfo();
    }
    else {
       alert(lang.LANG_COMMON_UNSAVE);
    }
}

function enableLDAPInfos(enable) {
    LDIP.disabled = !enable;
    LDBinPW.disabled = !enable;
    LDBinDN.disabled = !enable;
    LDBase.disabled = !enable;
    LDUserID.disabled = !enable;
    checkSSL(enable);
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
