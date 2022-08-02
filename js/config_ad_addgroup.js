/*
   global variables
*/
var cfgAdPage = "/page/config_ad.html";
var RemoteRoleMapping_array = [];

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/config_ad_rolegroup_help.html";
    // Get multi-language string
    document.title = lang.LANG_ADDAD_CAPTION;
    document.getElementById("addBtn").value = lang.LANG_ADDAD_ADD;
    document.getElementById("cancelBtn").value = lang.LANG_ADDAD_CANCEL;
    document.getElementById("caption").textContent = lang.LANG_ADDAD_CAPTION;
    document.getElementById("adname").textContent = lang.LANG_ADDAD_NAME;
    document.getElementById("adDomainNameLabel").textContent =
        lang.LANG_MODAD_DOMAIN;
    document.getElementById("priv").textContent = lang.LANG_ADDAD_PRIV;
    document.getElementById("opt4").text = lang.LANG_ADDAD_ADMINISTRATOR;
    document.getElementById("opt3").text = lang.LANG_ADDAD_OPERATOR;
    document.getElementById("opt2").text = lang.LANG_ADDAD_USER;
    document.getElementById("addBtn").addEventListener("click", addGroupCfg);
    document.getElementById("cancelBtn").addEventListener("click", cancelGroupCfg);
    CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(privilege)
{
    if(privilege == '04')
    {
        //full access
        getExistingGroupData();
    }
    else if(privilege == '03')
    {
        //read only
        document.getElementById("addBtn").disabled = true;
        document.getElementById("cancelBtn").disabled = true;
        document.getElementById("adGroupName").disabled = true;
        document.getElementById("adDomainName").disabled = true;
    }
    else
    {
        //no access
        location.href = SubMainPage;
        return;
    }
}

function getExistingGroupData() {
  Loading(true);
  var ajax_url = "/redfish/v1/AccountService";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    contentType : "application/json",
    onSuccess : function(originalRequest) {
      Loading(false);
      if (originalRequest.readyState == 4 && originalRequest.status == 200) {
        var response = JSON.parse(originalRequest.responseText);
        var active_directory_data = response.ActiveDirectory;
        RemoteRoleMapping_array = active_directory_data.RemoteRoleMapping;
        if (RemoteRoleMapping_array.length > 0) {
          for (i = 0; i < RemoteRoleMapping_array.length; i++) {
            delete RemoteRoleMapping_array[i].Oem.OpenBMC["@odata.type"];
          }
        }
      }
    },
    onFailure : function(response) {
      Loading(false);
      HandleFailureStatus(response, lang.LANG_AD_ADV_GET_FAIL, disablefunc);
    }
  });
}

function addGroupCfg()
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
    var group_name = Trim(document.getElementById("adGroupName").value);
    var group_privilege = document.getElementById("adGroupPriv").value;
    var group_domain = Trim(document.getElementById("adDomainName").value);
    Loading(true);
    if (group_name && group_privilege) {
      var ajax_url = '/redfish/v1/AccountService';
      RemoteRoleMapping_array.push({
        "RemoteGroup" : group_name,
        "LocalRole" : group_privilege,
        "Oem" : {"OpenBMC" : {"RemoteDomain" : group_domain}}
      });
      ajax_param = {
        "ActiveDirectory" : {"RemoteRoleMapping" : RemoteRoleMapping_array}
      };
      var object = JSON.stringify(ajax_param);
      var ajax_req = new Ajax.Request(ajax_url, {
        method : 'PATCH',
        contentType : 'application/json',
        parameters : object,
        onSuccess : addGroupCfgHandler,
        onFailure :
            function() { alert(lang.LANG_CONFIG_LDAP_GROUP_SAVE_FAILED); }
      });
    }
}

function addGroupCfgHandler(originalRequest)
{
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        var response = JSON.parse(originalRequest.responseText);
        if(response == null)
            return;
        alert(lang.LANG_ADDAD_ADD_SUCCESS, {
          title : lang.LANG_GENERAL_SUCCESS,
          onClose : function() { location.href = cfgAdPage; }
        });
    }
    else{
        alert(lang.LANG_ADDAD_ADD_UNCOMPLETE);
    }
}

function cancelGroupCfg()
{
    location.href = cfgAdPage;
}
