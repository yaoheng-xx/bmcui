"use strict";
var lang;
var lang_setting;
window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

var ikvmBtnObj;

function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src =
                "../help/" + lang_setting + "/launch_redirection_hlp.html";
    document.getElementById("caption_div").textContent = lang.LANG_MAN_IKVM_CAPTION;
    ikvmBtnObj = document.getElementById("launchikvm");
    ikvmBtnObj.value = lang.LANG_MAN_IKVM_LAUNCH_IKVM;
    ikvmBtnObj.disabled = true;
    ikvmBtnObj.addEventListener("click", launchKVM_Window);

    document.getElementById("desc").textContent = lang.LANG_MAN_IKVM_HTML5_DESC;

    CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(Privilege) {
    if (Privilege == '04') {
        ikvmBtnObj.disabled = false;
    } else {
        location.href = SubMainPage;
        alert(lang.LANG_MAN_IKVM_NOPRIVI);
        return;
    }
    return;
}

function launchKVM_Window() {
    var strpath = geturlPath() +
        "page/man_ikvm_new_window.html?openNewWindowVariable=1";
    var iframe = document.getElementById("ikvm_frame");
    if (iframe.src != "about:blank") {
        ikvmBtnObj.value = lang.LANG_MAN_IKVM_LAUNCH_IKVM;
        iframe.src = "about:blank";
    }
    else {
        iframe.src = strpath;
        ikvmBtnObj.value = lang.LANG_MAN_IKVM_STOP_IKVM;
    }
}

