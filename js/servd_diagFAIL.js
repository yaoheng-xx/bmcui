/* Server Diagnostics -- System Diagnostics page for download debug log.*/

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit(){
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/servd_diag_hlp.html";
    CheckUserPrivilege(PrivilegeCallBack);

    var runBtn = document.getElementById("runBtn");
    runBtn.setAttribute("value", lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_BTN);
    runBtn.onclick= genDebugLog;//genDebugLog;

    document.getElementById("title_div").textContent = lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_TITLE;
    document.getElementById("interpretion_td").textContent = lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_INTERPRETION;
    document.getElementById("caption").textContent = lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_CAPTION;
    document.getElementById("lastlog").textContent = lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_LASTLOG;

    var lastTime = document.getElementById("lastTime");
    lastTime.textContent = lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_NONETEXT;

    var lastLink = document.getElementById("lastLink");
    document.getElementById("lastLink").textContent = lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_NONETEXT;
    alert(lang.LANG_SERVER_DIAGNOSTICS_SYS_DIAGNOSTICS_ERR);
}

function PrivilegeCallBack(privilege)
{
    if(privilege == '04'|| privilege == '03'){
        //getDiagState();
    }
    else if(privilege == '02') {
        runBtn.disabled= true;
    }
    else{
        runBtn.disabled= true;
        location.href = SubMainPage;
        return;
    }
}

function getDiagState(){}
function replyDiagState(originalRequest){
    Loading(false);
    if(originalRequest.readyState== 4&& originalRequest.status== 200){
        var response= originalRequest.responseText.replace(/^\s+|\s+$/g, "");
        var xmldoc= GetResponseXML(response);
        if(xmldoc== null){
            SessionTimeout();
            return;
        }
        var IPMIRoot= xmldoc.documentElement;
        var debugInfo= IPMIRoot.getElementsByTagName('GET_HTTP_PORT');
        var diagData = debugInfo[0].getElementsByTagName('PORT_INFO');
        var testExist = diagData[0].getAttribute('HTTP_PORT');
        var test_link = diagData[0].getAttribute('HTTP_PORT');
        var test_size = diagData[0].getAttribute('HTTP_PORT');
        if(testExist == 1){
            clearTimeout(diagInitialTimer);
        }else{
            diagInitialTimer = setTimeout(getDiagState,1500);
            return;
        }
        lastTime.textContent = new Date(parseInt(diagData[0].getAttribute('xxxxx')));

        lastLink.href = test_link;
        lastLink.textContent = "System Debug Log (" + test_size + ")";
    }
}

function genDebugLog(){}
function runDebugLog(originalRequest){
    if(originalRequest.readyState== 4&& originalRequest.status== 200){
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xml_obj=GetResponseXML(response);
        if (xml_obj == null) {
            SessionTimeout();
            return;
        }
        //check session & privilege.
        if (CheckInvalidResult(xml_obj) < 0) {
            return;
        }

        var IPMIRoot = xml_obj.documentElement;
        var checkSession = IPMIRoot.getElementsByTagName('RESULT');
        if (checkSession.length != 0){
            var res = IPMIRoot.getElementsByTagName('RESULT')[0].childNodes[0].nodeValue;
            if(res == 'OK'){
                setTimeout(function(){ savedDebugLog(); }, 1000);
            }
            else{// RESULT = FAIL
                alert(lang.LANG_NULLXML_SESSION_TIMEOUT);
            }
        }
        Loading(false);
    }
}

function savedDebugLog(){
    location.href = "/";
}