var kvmsPortObj;
var saveKvmBtnObj;
var kvmPortflag;
var kvmPortErrflag = false;
var g_save_disabled_by_priv = false;
/*
var virtual_media_session_obj;
var Previousvirtual_media_session_obj_value;
*/
var change_count = 0;
var msg_string = "";

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_kvm_hlp.html";
    // Get multi-language string
    document.title = lang.LANG_MOUSE_TITLE;
    saveKvmBtnObj = document.getElementById("saveKvmBtn");
    saveKvmBtnObj.value = lang.LANG_MOUSE_SAVE;
    /*
    saveKvmBtnObj.addEventListener("click", doSaveKvm);
    virtual_media_session_obj =
        document.getElementById("virtual_media_timeout");
    */
    kvmsPortObj = document.getElementById("kvm_sport");
    /*
    kvmsPortObj.onchange = checkKvmPort;
    kvmsPortObj.addEventListener("keypress", validateNumeric);
    kvmsPortObj.addEventListener("keydown", validateNumeric);

    */
    OutputString();
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
  document.getElementById("kvm_mouse_caption_div").textContent =
      lang.LANG_CONFIG_KVM_CAPTION;
  document.getElementById("kvm_mouse_sub_caption1_legend").textContent =
      lang.LANG_CONFIG_KVM_MOUSE_SUB_CAPTION1;
  document.getElementById("kvm_desc_p").textContent =
      lang.LANG_CONFIG_KVM_ONLY_DESC;
  document.getElementById("kvm_default_ports_span").textContent =
      lang.LANG_CONFIG_KVM_DEFAULT_PORTS;
  document.getElementById("kvm_sport_span").textContent =
      lang.LANG_CONFIG_KVM_SPORT;
  /*
  document.getElementById("media_timeout_span").textContent =
      lang.LANG_CONFIG_VIRTUAL_MEDIA_TIMEOUT;
  document.getElementById("virtual_media_timeout_span").textContent =
      lang.LANG_CONFIG_VIRTUAL_MEDIA_TIMEOUT_SPAN;
  */
}

function PrivilegeCallBack(Privilege)
{
    if(Privilege == '04')
    {
        //full access
        GetKvmPort();
        // GetVirtualMediaSessionTimeout();
        g_save_disabled_by_priv = false;
        saveKvmBtnObj.disabled = g_save_disabled_by_priv;
    }
    else if(Privilege == '03' || Privilege == '02')
    {
        GetKvmPort();
        // GetVirtualMediaSessionTimeout();
        g_save_disabled_by_priv = true;
        saveKvmBtnObj.disabled = g_save_disabled_by_priv;
    }
    else
    {
        //no access
        location.href = SubMainPage;
        return;
    }
}

function checkKvmPort() {
    //check port nubmer range 0 < x < 65536 and space not allowed
    if ((kvmsPortObj.value.length == 0 || !(/^\d+$/.test(kvmsPortObj.value)) ||
         parseInt(kvmsPortObj.value, 10) == 0 || kvmsPortObj.value > 65535)) {
      alert(lang.LANG_CONFIG_KVM_PORT_FAILURE);
      saveKvmBtnObj.disabled = true;
      kvmPortErrflag = true;
      return;
    }
    kvmPortErrflag = false;
    saveKvmBtnObj.disabled = false;
}

function GetKvmPortHandler(originalRequest)
{
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
      saveKvmBtnObj.disabled = true;
      var response = JSON.parse(originalRequest.responseText);
      if (response == null) {
        SessionTimeout();
        return;
      }
      kvmsPortObj.value = response.KVMIP.Port;
      kvmsPortObj.disabled = true;
    }
}

function GetKvmPort() {
    Loading(true);
    var ajax_url = '/redfish/v1/Managers/bmc/NetworkProtocol';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        timeout: g_CGIRequestTimeout,
        ontimeout: onCGIRequestTimeout,
        onSuccess: GetKvmPortHandler,
        onFailure: function() {
            Loading(false);
            alert(lang.LANG_CONFIG_KVM_PORT_GET_FAILED);
        }
    });//register callback function
}

function checkKVMFirst() {
    Loading(true);
    var url = '/redfish/v1/Managers/bmc/NetworkProtocol';
    var secure_port = parseInt(kvmsPortObj.value, 10);
    var ajax_data = JSON.stringify({"KVMIP" : {"Port" : secure_port}});
    var myAjax = new Ajax.Request(url, {
      method : 'PATCH',
      contentType : 'application/json',
      timeout : g_CGIRequestTimeout,
      ontimeout : onCGIRequestTimeout,
      parameters : ajax_data,
      onSuccess : HandleSuccessStatus,
      onFailure : function() {
        Loading(false);
        alert(lang.LANG_CONFIG_KVM_PORT_FAIL);
      }
    });
}

function HandleSuccessStatus(originalRequest) {
  Loading(false);
  alert("Settings Saved Successfully!", {title : lang.LANG_GENERAL_SUCCESS});
}
