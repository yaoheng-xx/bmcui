"use strict";
var ikvmhtml5BtnObj;
var lang;
var lang_setting;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting +
        "/ikvm_html5_hlp.html";
    document.getElementById("caption_div").textContent = lang.LANG_MAN_IKVM_HTML5_CAPTION;
    ikvmhtml5BtnObj = document.getElementById("launchikvmhtml5");
    ikvmhtml5BtnObj.value = lang.LANG_MAN_IKVM_HTML5_LAUNCH_CON;
    ikvmhtml5BtnObj.disabled=true;

    document.getElementById("desc").textContent = lang.LANG_MAN_IKVM_HTML5_DESC;
    CheckUserPrivilege(PrivilegeCallBack);
}

function RMMCallBack(Mode) {
    ikvmhtml5BtnObj.disabled = false;
}

function PrivilegeCallBack(Privilege)
{
    if(Privilege == '04')
    {
        GetRMMKeyStatus(RMMCallBack);
        ikvmhtml5BtnObj.addEventListener("click", launchKVM_Window);
    }
    else
    {
        location.href = SubMainPage;
    }
    return;
}

function launchKVM_Window() {
  var win;
  if (window.rfb != null) {
    window.rfb.disconnect();
  }

    var strpath = geturlPath() +"page/man_ikvm_new_window.html";
    var is_chrome = navigator.userAgent.toLowerCase();
    is_chrome = (is_chrome.indexOf("chrome") != -1);
    if (is_chrome) {
      win = window.open(
          strpath, 'Kvm Window',
          'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1125,height=900');
    } else {
      win = window.open(
          strpath, 'H5Viewer',
          "directories=no,titlebar=no,fullscreen=yes,status=no,location=no,toolbar=no,resizable=yes,scrollbars=no"); // fullscreen will work in IE and FF
    }

    win.onbeforeunload = function(){
        console.log("on before unload", window.rfb);
        if(window.rfb != null){
            window.rfb.disconnect();
        }
    }
}
