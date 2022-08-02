var cbxLogObj;
var btnSetLogObj,btnExportLogObj, logViewConsoleObj;
var logOffset;
var download_file_name;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }
function PageInit()
{
    var key = "offset_sol";
    if(ReadCookie(key) == null) {
        logOffset = 0;
    } else {
        logOffset = parseInt(ReadCookie(key));
    }
    //alert(logOffset);

    document.getElementById("setSOLconfBtn").addEventListener("click", doSaveSOLLogCfg);
    document.getElementById("exportSOLLogBtn").addEventListener("click", genDebugLog);

    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/servd_sol_log_hlp.html";

    cbxLogObj = document.getElementById("sollogcbx");
    logViewConsoleObj = document.getElementById("sollogConsole");

    btnSetLogObj = document.getElementById("setSOLconfBtn");
    btnSetLogObj.value = lang.LANG_CONFIG_SOL_SAMASH_SAVEBTN;

    btnExportLogObj = document.getElementById("exportSOLLogBtn");
    btnExportLogObj.value = lang.LANG_SERVD_SOL_LOG_SAVE_BTN;

    OutputString();
    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
    getSolLogCfg();
}

function OutputString() {
    document.getElementById("sol_log_div").textContent = lang.LANG_SERVER_DIAGNOSTICS_SUBMENU_SOL_LOG;
    document.getElementById("enable_log_legend").textContent = lang.LANG_SERVER_DIAG_SOL_ENABLE_LOG;
    document.getElementById("enable_log_lbl").textContent = lang.LANG_SERVER_DIAG_SOL_ENABLE_LOG;
    document.getElementById("caption_legend").textContent = lang.LANG_SERVER_DIAG_SOL_LOG_VIEW_DUMP_CAPTION;
    document.getElementById("log_view_legend").textContent = lang.LANG_SERVER_DIAG_SOL_LOG_VIEW;
}

function PrivilegeCallBack(Privilege)
{
    if( Privilege == '03' || Privilege == '04' ) {
        cbxLogObj.disabled = false;
        btnExportLogObj.disabled = false;
    } else if( Privilege == '02') {
        alert(lang.LANG_COMMON_NOPRIVI);
        location.href = SubMainPage;
    } else {
        location.href = SubMainPage;
        return;
    }
    return;
}

function GetSolLogHandler(originalRequest) {
    Loading(false);
    if (originalRequest != null && originalRequest.readyState == 4 && originalRequest.status == 200){
        var response = JSON.parse(originalRequest.responseText);
        if(response == null)
        {
            SessionTimeout();
            return;
        }
        if(originalRequest.statusText !='OK') {
            return;
        } else {
            if(response.status != null) {
                var enable = response.status;
                if( enable == '1') {
                    cbxLogObj.checked = true;
                } else if( enable == '0') {
                    cbxLogObj.checked = false;
                }
                // We will always allow view and export of SOL log, even if not enabled
                logViewConsoleObj.disabled = false;
                btnExportLogObj.disabled = false;
                getSolLogView();
            } else {
                alert(lang.LANG_SERVD_SOL_LOG_GET_FAIL);
                return;
            }
        }
    }
}

function getSolLogCfg() {}

function drawConsole(tableName, dumplog) {
    var table=document.getElementById(tableName);

    var html = ansi_up.ansi_to_text(dumplog);
    table.textContent = html;
}

function GetSolLogViewHandler(originalRequest) {
    Loading(false);
    if (originalRequest != null && originalRequest.readyState == 4 && originalRequest.status == 200){
        var response = JSON.parse(originalRequest.responseText);
        if(response == null)
        {
            SessionTimeout();
            return;
        }
        if(originalRequest.statusText == 'OK') {
            //clear all the table rows
            var table=document.getElementById("sol_table_body");
            for(var i = table.rows.length; i > 0; i--) {
                table.deleteRow(i);
            }

            if(response.length == 0){
                btnExportLogObj.disabled = true;
            }else{
                for(var i=0; i < response.length;i++){
                    var row = document.createElement('tr');
                    var snum_col = document.createElement('td');
                    var sfile_col = document.createElement('td');
                    var sinfo_col = document.createElement('td');
                    // var sdownload_col = document.createElement('td');
                    snum_col.append(response[i].id);
                    sfile_col.append(response[i].file_name);
                    sinfo_col.append(response[i].file_info);

                    row.append(snum_col);
                    row.append(sfile_col);
                    row.append(sinfo_col);

                    document.getElementById("sol_table_body").append(row);
                    download_file_name = response[i].file_name;
                }
            }
        } else {
            alert(lang.LANG_SERVD_SOL_LOG_DUMP_GET_FAIL);
            return;
        }
    }
}
function getSolLogView() {}

function SetSolLogHandler(originalRequest) {
    if (originalRequest != null && originalRequest.readyState == 4 && originalRequest.status == 200){
        var response = JSON.parse(originalRequest.responseText);
        if(response == null)
        {
            SessionTimeout();
            return;
        }
            if(originalRequest.statusText != 'OK') { //fail
                alert(lang.LANG_SERVD_SOL_LOG_SET_FAIL);
                return;
            } else { //success
                alert(lang.LANG_SERVD_SOL_LOG_SET_GOOD, {title: lang.LANG_GENERAL_SUCCESS});
                getSolLogCfg();
            }
        // }
    }
}
function SetSOLConfig() {}

function doSaveSOLLogCfg() {
    SetSOLConfig();
}

function doExportSOLLog() {
    // alert('this is sample test!!');
    btnExportLogObj.disabled = true;
    genDebugLog();
}

function genDebugLog(){
    Loading(true);
    if(download_file_name != null && download_file_name != undefined){
        window.open('/archive/'+download_file_name);
    }else{
        alert("Error in saving SOL Log due to the empty sol log list!!");
    }
    Loading(false);
}

function genDebugLogHandler(originalRequest){
    Loading(true);
    if(originalRequest.readyState == 4 && originalRequest.status == 200){
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g, "");
        var xmldoc = GetResponseXML(response);
        if(xmldoc == null){
            SessionTimeout();
            return;
        }

        var IPMIRoot = xmldoc.documentElement;
        var result = IPMIRoot.getElementsByTagName("RESULT")[0].childNodes[0].nodeValue;
        if(result == 'FAIL') {
            alert(lang.LANG_SERVD_SOL_LOG_DUMP_SAVE_FAIL);
            return;
        } else {
            saveSOLLog();
            Loading(false);
        }

    }
}

function saveSOLLog(){}
