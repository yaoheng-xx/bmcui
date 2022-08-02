/*
  global variables
*/
var cfgAdPage = "/page/config_ad.html";

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/config_mod_rolegroup_help.html";
    // Get multi-language string
    document.title = lang.LANG_MODAD_CAPTION;
    document.getElementById("modBtn").value = lang.LANG_MODAD_MODIFY;
    document.getElementById("modBtn").addEventListener("click", modGroupCfg);
    document.getElementById("cancelBtn").value = lang.LANG_MODAD_CANCEL;
    document.getElementById("cancelBtn").addEventListener("click", cancelGroupCfg);
    document.getElementById("caption").textContent = lang.LANG_MODAD_CAPTION;
    document.getElementById("adname").textContent = lang.LANG_MODAD_NAME;
    document.getElementById("adDomainNameLabel").textContent =
        lang.LANG_MODAD_DOMAIN;
    document.getElementById("priv").textContent = lang.LANG_MODAD_PRIV;
    document.getElementById("opt4").text = lang.LANG_ADDAD_ADMINISTRATOR;
    document.getElementById("opt3").text = lang.LANG_ADDAD_OPERATOR;
    document.getElementById("opt2").text = lang.LANG_ADDAD_USER;
    CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(privilege)
{
    if(privilege == '04')
    {
        //full access
        fill_group_data();
        
    }
    else if(privilege == '03')
    {
        //read only
        fill_group_data();
        document.getElementById("modBtn").disabled = true;
        document.getElementById("cancelBtn").disabled = true;
        document.getElementById("adGroupName").disabled = true;
        document.getElementById("adDomainName").disabled = true;
    }
    else
    {
        //no access
        alert(lang.LANG_COMMON_NOPRIVI, {onClose: function() {location.href = cfgAdPage;}});
    }
}

function fill_group_data(){
    Loading(true);
    var ajax_url = "/redfish/v1/AccountService";
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'GET',
      contentType : "application/json",
      onSuccess : handleGroupLists,
      onFailure : function(response) {
        Loading(false);
        HandleFailureStatus(response, lang.LANG_AD_ADV_GET_FAIL, disablefunc);
      }
    });
}

function handleGroupLists(originalRequest){
    Loading(false);
    var group_index = GetVars("groupindex");
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        var response = JSON.parse(originalRequest.responseText);
        var active_directory_data = response.ActiveDirectory;
        RemoteRoleMapping_array = active_directory_data.RemoteRoleMapping;
        if(response == null)
        {
            SessionTimeout();
            return;
        }
        for (var i = 0; i < RemoteRoleMapping_array.length; i++) {
          if (RemoteRoleMapping_array[i].RemoteGroup == group_index) {
            document.getElementById("adGroupName").value =
                RemoteRoleMapping_array[i].RemoteGroup;
            document.getElementById("adDomainName").value =
                RemoteRoleMapping_array[i].Oem.OpenBMC.RemoteDomain;
            document.getElementById("adGroupPriv").value =
                RemoteRoleMapping_array[i].LocalRole;
          }
        }
    }else{
      alert(lang.LANG_CONFIG_ACTIVE_DIRECTORY_MOD_GRP);
    }
}

function modGroupCfg()
{
    // check adGroupName field
    if(Trim(document.getElementById("adGroupName").value).length == 0){
        alert(lang.LANG_AD_CHK_DOMAIN);
        return;
    }
    else if (!CheckSpeficChar(document.getElementById("adGroupName").value))
    {
        alert(lang.LANG_AD_ERR_INPUT);
        return;
    }
    if (Trim(document.getElementById("adDomainName").value).length == 0) {
      alert(lang.LANG_AD_CHK_DOMAIN_NAME);
      return;
    } else if (!CheckADDomainName(
                   document.getElementById("adDomainName").value)) {
      alert(lang.LANG_AD_DOMAIN_NAME_INVALID_ALERT);
      return;
    }
    var group_index = GetVars("groupindex");
    var group_name = Trim(document.getElementById("adGroupName").value);
    var adDomainName = Trim(document.getElementById("adDomainName").value);
    var group_privilege = document.getElementById("adGroupPriv").value;
    Loading(true);
    for (var i = 0; i < RemoteRoleMapping_array.length; i++) {
      delete RemoteRoleMapping_array[i].Oem.OpenBMC["@odata.type"];
      if (RemoteRoleMapping_array[i].RemoteGroup == group_index) {
        RemoteRoleMapping_array[i].RemoteGroup = group_name;
        RemoteRoleMapping_array[i].Oem.OpenBMC.RemoteDomain = adDomainName;
        RemoteRoleMapping_array[i].LocalRole = group_privilege;
      }
    }
    var ajax_param = {
      "ActiveDirectory" : {"RemoteRoleMapping" : RemoteRoleMapping_array}
    };
    var ajax_url = "/redfish/v1/AccountService";
    var object = JSON.stringify(ajax_param);
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'PATCH',
      contentType : 'application/json',
      parameters : object,
      onSuccess : modGroupCfgHandler,
      onFailure : function() { alert(lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED); }
    });
}

function modGroupCfgHandler(originalRequest)
{
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        var response = JSON.parse(originalRequest.responseText);
        if(response == null)
            return;
        alert(lang.LANG_MODAD_MOD_SUCCESS, {title: lang.LANG_GENERAL_SUCCESS,
            onClose: function() {location.href = cfgAdPage;}});
    }
    else{
        alert(lang.LANG_ADDAD_MOD_UNCOMPLETE);
    }
}

function cancelGroupCfg()
{
    location.href = cfgAdPage;
}
