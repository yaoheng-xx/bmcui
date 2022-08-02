var solPortObj;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PrivilegeCallBack(Privilege)
{
    if(Privilege == '04')
    {
        //full access
        document.getElementById("saveSolBtn").disabled = false;
        document.getElementById("saveSSHBtn").disabled = false;
    }
    else if(Privilege == '03' || Privilege == '02')
    {
        //read only
        //alert(lang.LANG_MOUSE_NOPRIV);
        document.getElementById("saveSolBtn").disabled = true;
        document.getElementById("saveSSHBtn").disabled = true;
    }
    else
    {
        //no access
        location.href = SubMainPage;
        return;
    }
}

function OutputString() {
    document.getElementById("caption_div").textContent = lang.LANG_CONFIG_SUBMENU_SOL;
    document.getElementById("title_legend").textContent = lang.LANG_CONFIG_SOL_TITLE;
    document.getElementById("desc_legend").textContent = lang.LANG_CONFIG_SOL_DESC;
    document.getElementById("enableSOL_lbl").textContent = lang.LANG_CONFIG_SOL_ENABLE;
    document.getElementById("port_title_legend").textContent = lang.LANG_CONFIG_SOL_SSH_PORT_TITLE;
    document.getElementById("sol_ssh_span").textContent = lang.LANG_CONFIG_SOL_SSH;
    document.getElementById("sol_port_lbl").textContent = lang.LANG_CONFIG_SOL_PORT;
}

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_solsmash_hlp.html";
    document.title = lang.LANG_MOUSE_TITLE;
    document.getElementById("saveSolBtn").value = lang.LANG_CONFIG_SOL_SAMASH_SAVEBTN;
    document.getElementById("saveSSHBtn").value = lang.LANG_CONFIG_SOL_SAMASH_SAVEBTN;
    solPortObj = document.getElementById("solsshport");

    document.getElementById("saveSolBtn").addEventListener("click", SetSOLConfig);
    document.getElementById("saveSSHBtn").addEventListener("click", doSaveSSHPort);

    obj = document.getElementById("solsshport");
    obj.addEventListener("keypress", validateNumeric);
    obj.addEventListener("keydown", validateNumeric);

    OutputString();
    GetPort();
    CheckUserPrivilege(PrivilegeCallBack);
}

function GetPortHandler(originalRequest){
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200){
        var response = JSON.parse(originalRequest.responseText);
        if(response == null)
        {
            SessionTimeout();
            return;
        }
        var result = originalRequest.statusText;
        if (result != "OK") {
            alert(lang.LANG_NULLXML_SESSION_TIMEOUT);
        }
        if (response.hasOwnProperty("Oem")) {
          var SOLData = response.Oem.OpenBmc;
          solPortObj.value = SOLData.SOL.Port;
          document.getElementById("_enableSOL").checked =
              SOLData.SOL.ProtocolEnabled;
        } else {
          solPortObj.value = "";
          document.getElementById("_enableSOL").checked = false;
        }
    }
}

function GetPort() {
    Loading(true);
    var ajax_url = '/redfish/v1/Managers/bmc/NetworkProtocol';
    var ajax_req = new Ajax.Request(ajax_url,{   
        method: 'GET',
        contentType: "application/json",
        onSuccess: GetPortHandler,
        onFailure: function(){
            Loading(false);
        }
    });
}

function SetSOLConfigHandler(response) {
    Loading(false);
    if (response.readyState == 4 && response.status == 204) {
      var statusText = response.statusText;
      if (statusText == "OK") {
        alert(lang.LANG_SOL_CONFIG_SET_SUCCESS);
        GetPort();
      } else {
        alert(lang.LANG_SOL_CONFIG_SET_FAIL);
      }
    }
}

function SetSOLConfig() {
    Loading(true);
    var SOLsshService = document.getElementById("_enableSOL").checked;
    var ajax_url = "/redfish/v1/Managers/bmc/NetworkProtocol";
    var data = {
      "Oem" : {"OpenBmc" : {"SOL" : {"ProtocolEnabled" : SOLsshService}}}
    };
    var object = JSON.stringify(data);
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'PATCH',
      contentType : "application/json",
      parameters : object,
      onSuccess : SetSOLConfigHandler,
      onFailure : function() {
        Loading(false);
        alert(lang.LANG_SOL_CONFIG_SET_FAIL);
      }
    });
}

function SetPortHandler(originalRequest) {
  if (originalRequest != null && originalRequest.readyState == 4 &&
      originalRequest.status == 204) {
    Loading(false);
    var response = JSON.parse(originalRequest.responseText);
    if (response == null) {
      SessionTimeout();
      return;
    }
    if (originalRequest.statusText == 'OK') {
      alert(lang.LANG_CONIFG_SOL_GOOD);
    } else {
      alert(lang.LANG_CONIFG_SOL_FAIL);
    }
    document.getElementById("saveSSHBtn").disabled = false;
    GetPort();
  }
}

function SetPort() {
    Loading(true);
    var ajax_url = "/redfish/v1/Managers/bmc/NetworkProtocol";
    var data = {
      "Oem" : {
        "OpenBmc" : {
          "SOL" : {
            "Port" : parseInt(solPortObj.value, 10),
          }
        }
      }
    };
    var object = JSON.stringify(data);
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'PATCH',
      contentType : "application/json",
      parameters : object,
      onSuccess : SetPortHandler,
      onFailure : function() {
        Loading(false);
        alert("Failed to set SOL SSH port!!");
        GetPort();
      }
    });
}

function doSaveSSHPort()
{
    if(solPortObj.value.length == 0 || !(/^\d+$/.test(solPortObj.value)) || parseInt(solPortObj.value) == 0 || solPortObj.value > 65535) {
        alert(lang.LANG_CONIFG_SOLPORT_INPUT_INVALID);
        return;
    } else {
        document.getElementById("saveSSHBtn").disabled = true;
        UtilsConfirm(lang.CONF_SERVICE_PORT_WARN, {
            onOk: SetPort,
            onClose: function() {
                document.getElementById("saveSSHBtn").disabled = false;
            }
        });
    }
}
