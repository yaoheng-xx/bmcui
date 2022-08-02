/*
   global variables
*/
// Mouse mode: 1 - Absolute, 2 - Relative
var mouseMode = 0;
var channelCounter = 0;
var smash_ssh_port = 2;//ref http://wiki.insyde.com/
var solPortObj;
var portSetType;

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
    document.getElementById("lanch_lbl").textContent = lang.LANG_CONFIG_SOL_LANCH;
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

    document.getElementById("_lanChannel").addEventListener("change", onChannelChange);
    document.getElementById("saveSolBtn").addEventListener("click", SetSOLConfig);
    document.getElementById("saveSSHBtn").addEventListener("click", doSaveSSHPort);

    obj = document.getElementById("solsshport");
    obj.addEventListener("keypress", validateNumeric);
    obj.addEventListener("keydown", validateNumeric);

    OutputString();
    GetSOLConfig(1);
    GetPort();
    CheckUserPrivilege(PrivilegeCallBack);
}

function updateSOLInfo(root) {
    if(root != null) {
        var numChannels = root.getElementsByTagName("TOTAL_NUMBER")[0].getAttribute("LAN");
        var selector = document.getElementById("_lanChannel");
        var nic_interface = root.getElementsByTagName("LAN_IF")[0].getAttribute("INTERFACE");
        var chnlsAvail = parseInt(root.getElementsByTagName("CHANNELS")[0].getAttribute("AVAIL_MASK"));
        if(selector != null) {
            for(idx = (selector.options.length - 1); idx >= 0; idx--) {
                selector.remove(idx);
            }
            for(idx = 0; idx < numChannels; idx++) {
                var option = document.createElement("option");
                option.text = lang.LANG_CONF_LAN_CHANNEL_OPT_PREFIX + (idx + 1);
                option.value = "channel_" + idx;
                option.disabled = !(isNaN(chnlsAvail) || chnlsAvail & (1 << idx));
                selector.add(option);
            }
            selector.selectedIndex = (nic_interface - 1);
        }

        var enable = root.getElementsByTagName("SOL")[0].getAttribute("ENABLE");
        var objEnable = document.getElementById("_enableSOL");
        if(enable == "1") {
            objEnable.checked = true;
        } else {
            objEnable.checked = false;
        }
        if(nic_interface == 3)
            document.getElementById("enableSOL_lbl").textContent = lang.LANG_CONFIG_SOL_ENABLE_FOR_DEDICATE;
        else
            document.getElementById("enableSOL_lbl").textContent = lang.LANG_CONFIG_SOL_ENABLE;
    }
}

function SetPortHandler(originalRequest) {
    if (originalRequest != null && originalRequest.readyState == 4 && originalRequest.status == 200){
        Loading(false);
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xml_obj=GetResponseXML(response);
        if(xml_obj == null)
        {
            SessionTimeout();
            return;
        }

        // check session & privilege
        if(CheckInvalidResult(xml_obj) < 0) {
            return;
        }

        var IPMIRoot = xml_obj.documentElement;

        var setPort = IPMIRoot.getElementsByTagName("SET_NS_PORT");
        var cmdRtn, port;
        if(setPort != null) {
            port = setPort[0].getElementsByTagName("PORT");
            if(port != null) {
                cmdRtn = port[0].getAttribute("COMP_CODE");
                if(cmdRtn == '0') {
                    alert(lang.LANG_CONIFG_SOL_GOOD);
                } else {
                    alert(lang.LANG_CONIFG_SOL_FAIL);
                }
                document.getElementById("saveSSHBtn").disabled = false;
            }
        }
    }
}

function onChannelChange() {
    var selector = document.getElementById("_lanChannel");
    var index = 0;
    if(selector != null) {
        index = selector.selectedIndex + 1;//channel index was 1 base.
    }
    if(index > 0) {
        GetSOLConfig(index);
    }
}
