"use strict";
var lang_setting;
var lang;
var solBtnObj;
window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src = "../help/" + lang_setting + "/launch_sol_hlp.html";
    solBtnObj = document.getElementById("solbtn");
    solBtnObj.value = lang.LANG_SOL_LAUNCH;
    solBtnObj.addEventListener('click', launchSOL_Window);
    solBtnObj.disabled = true;
    document.getElementById("caption_div").textContent = lang.LANG_SOL_CAPTION;
    CheckUserPrivilege(PrivilegeCallBack);

}
function PrivilegeCallBack(Privilege) {
    if (Privilege == '04') {
        solBtnObj.disabled = false;
        // GetJNLPRequest(solBtnObj, 1);
    }
    else {
        location.href = SubMainPage;
        solBtnObj.disabled = true;
    }
}

function launchSOL_Window() {
    var strpath = geturlPath() +
        "page/sol_new_window.html?openNewWindowVariable=1";
    var iframe = document.getElementById("sol_frame");
    if (iframe.src != "about:blank") {
        solBtnObj.value = lang.LANG_SOL_LAUNCH;
        iframe.src = "about:blank";
    }
    else {
        iframe.src = strpath;
        solBtnObj.value = lang.LANG_SOL_STOP;
    }
}
