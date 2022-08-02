/** Node Manager configuration setting **/

var MaxPolicyTableRows = 16;
var MaxPolicyTableColumns = 6;

var btnModifyPolicy;
var btnDeletePolicy;
var btnCancelPolicy;

SetRowSelectEnable(1);
var CurrentPowerReading = 0;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function GridTableInit(){
    //Grid table Init
    var TableTitles = [
        ["Policy ID", "15%", "center"],
        ["Timers", "15%", "center"],
        ["Enable", "15%", "center"],
        ["Shutdown", "15%", "center"],
        ["Alert", "15%", "center"],
        ["Power Limit (Watt)", "25%", "center"]
    ];
    // replace table header content with string table
    TableTitles[0][0] = lang.LANG_MISC_NM_COLUMN_TITLE0;
    TableTitles[1][0] = lang.LANG_MISC_NM_COLUMN_TITLE1;
    TableTitles[2][0] = lang.LANG_MISC_NM_COLUMN_TITLE2;
    TableTitles[3][0] = lang.LANG_MISC_NM_COLUMN_TITLE3;
    TableTitles[4][0] = lang.LANG_MISC_NM_COLUMN_TITLE4;
    TableTitles[5][0] = lang.LANG_MISC_NM_COLUMN_TITLE5;
    var objPolicyTable = document.getElementById("HtmlPolicyTable");
    GridTable = GetTableElement();
    GridTable.setColumns(TableTitles);
    GridTable.init('GridTable', objPolicyTable, "120px");
    GridTable.registeSelectedCallback(onPolicySelected);
}
function PageInit(){
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/misc_nm_config_hlp.html";

    GridTableInit();
    createScheduleTable();

    var objDisableTimer = document.getElementById("_optTimersDisable");
    objDisableTimer.checked = true;
    showScheduleTable(false);
    OutputString();
    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);

    btnModifyPolicy = document.getElementById("btn_modify");
    btnModifyPolicy.setAttribute("value",lang.LANG_MISC_NM_CONFIG_BTNSAV);
    btnDeletePolicy = document.getElementById("btn_del");
    btnDeletePolicy.setAttribute("value",lang.LANG_MISC_NM_CONFIG_BTNDEL);
    btnCancelPolicy = document.getElementById("btn_cancel");
    btnCancelPolicy.setAttribute("value",lang.LANG_MISC_NM_CONFIG_BTNCANCEL);
    chkTimer1 = document.getElementById("_nm_toggle_timer1");
    chkTimer2 = document.getElementById("_nm_toggle_timer2");
    chkTimer3 = document.getElementById("_nm_toggle_timer3");
    chkTimer4 = document.getElementById("_nm_toggle_timer4");
    chkTimer5 = document.getElementById("_nm_toggle_timer5");

    chkTimer1.onclick = function () {toggleSuspendTimer("1");}
    chkTimer2.onclick = function () {toggleSuspendTimer("2");}
    chkTimer3.onclick = function () {toggleSuspendTimer("3");}
    chkTimer4.onclick = function () {toggleSuspendTimer("4");}
    chkTimer5.onclick = function () {toggleSuspendTimer("5");}
    disableSuspendTimer();

    nmPolicyNum = document.getElementById("_nm_policy_number");
    nmPolicyNum.addEventListener("keypress", validateNumeric);
    nmPolicyNum.addEventListener("keydown", validateNumeric);

    nmPwrlimit = document.getElementById("_nm_power_limit");
    nmPwrlimit.addEventListener("keypress", validateNumeric);
    nmPwrlimit.addEventListener("keydown", validateNumeric);

    document.getElementById("_optTimersEnable").addEventListener("click", enableTimer);
    document.getElementById("_optTimersDisable").addEventListener("click", disableTimer);

    del_user = document.getElementById("btn_del");
    del_user.disabled = true;

    btnModifyPolicy.onclick = function() {
        if (parseInt(document.getElementById("_nm_policy_number").value) > 255) {
            alert(lang.LANG_MISC_NM_CONFIG_ERR1);
            return;
        }
        if (parseInt(document.getElementById("_nm_power_limit").value) >
                maxPowerLimit ||
            parseInt(document.getElementById("_nm_power_limit").value) <
                minPowerLimit) {
          alert(lang.LANG_MISC_NM_CONFIG_ERR4 + " (Valid Range: " +
                minPowerLimit + " to " + maxPowerLimit + ")");
          return;
        }
        if (GetSelectedRow() == null) {
            writePolicy();
            //alert(lang.LANG_MISC_NM_CONFIG_SELECTENTRY);
        }
        else {
            modifyPolicy();
        }
    }
    btnDeletePolicy.onclick = function() {
        if(GetSelectedRow() == null) {
            alert(lang.LANG_MISC_NM_CONFIG_SELECTENTRY);
        }
        else {
            var policy_id = parseInt(GetSelectedRowCellInnerHTML(0));
            requestDeletePolicy(policy_id, "0");
        }
    }

    btnCancelPolicy.onclick = function() {
        //cancel
        location.reload();
    }
}
function OutputString() {
    document.getElementById("caption_div").textContent = lang.LANG_MISC_NM_CONFIG_CAPTION;
    document.getElementById("desc_div").textContent = lang.LANG_MISC_NM_CONFIG_EDIT_DESC;
    document.getElementById("policy_num_lbl").textContent = lang.LANG_MISC_NM_CONFIG_POLICY_NUM;
    document.getElementById("enable_lbl").textContent = lang.LANG_CONFPEF_ENABLE;
    document.getElementById("shutdown_lbl").textContent = lang.LANG_MISC_NM_CONFIG_SHUTDOWN;
    document.getElementById("event_lbl").textContent = lang.LANG_MISC_NM_CONFIG_LOG_EVENT;
    document.getElementById("powerlimit_lbl").textContent = lang.LANG_MODPOLICIES_POWERLIMIT;
    document.getElementById("timers_lbl").textContent = lang.LANG_MISC_NM_CONFIG_USE_SUSPEND_TIMERS;
    document.getElementById("yes_lbl").textContent = lang.LANG_MISC_NM_CONFIG_USE_TIMERS_YES;
    document.getElementById("no_lbl").textContent = lang.LANG_MISC_NM_CONFIG_USE_TIMERS_NO;
}

function PrivilegeCallBack(Privilege)
{
    if (Privilege == '04') {
        //            requestNMSelfTest();
        requestPolicyInfo();
    } else {
        enableAllFunctions(false);
        location.href = SubMainPage;
        return;
    }
}

function writePolicy() {
    var isEnable = "";
    var isShutdown = "";
    var isLogEvent = "";
    var policy_id = parseInt(document.getElementById("_nm_policy_number").value);
    if(document.getElementById("_nm_enable").checked)
        isEnable = "1";
    else
        isEnable = "0";
    if(document.getElementById("_nm_shutdown").checked)
        isShutdown = "1";
    else
        isShutdown = "0";
    if(document.getElementById("_nm_logevent").checked)
        isLogEvent = "1";
    else
        isLogEvent = "0";
    var power_limit = document.getElementById("_nm_power_limit").value;
    var config_action = "1";
    requestWritePolicyInfo(policy_id, "0", parseInt(isEnable), parseInt(isShutdown), parseInt(isLogEvent), parseInt(power_limit), parseInt(config_action));
}
function modifyPolicy() {
    //var policy_id = parseInt(GetSelectedRowCellInnerHTML(0));
    var isEnable = "";
    var isShutdown = "";
    var isLogEvent = "";
    var policy_id = parseInt(document.getElementById("_nm_policy_number").value);
    if(document.getElementById("_nm_enable").checked)
        isEnable = "1";
    else
        isEnable = "0";
    if(document.getElementById("_nm_shutdown").checked)
        isShutdown = "1";
    else
        isShutdown = "0";
    if(document.getElementById("_nm_logevent").checked)
        isLogEvent = "1";
    else
        isLogEvent = "0";
    var power_limit = document.getElementById("_nm_power_limit").value;
    var config_action = "1";
    requestWritePolicyInfo(policy_id, "0", parseInt(isEnable), parseInt(isShutdown), parseInt(isLogEvent), parseInt(power_limit), parseInt(config_action));
}

function enableTimer() {
    document.getElementById("_optTimersEnable").checked = true;
    document.getElementById("_optTimersDisable").checked = false;
    showScheduleTable(true);
}

function disableTimer() {
    document.getElementById("_optTimersEnable").checked = false;
    document.getElementById("_optTimersDisable").checked = true;
    showScheduleTable(false);
}

function onPolicySelected() {
    btnDeletePolicy.disabled = false;
    var sel_index = parseInt(GetSelectedRowIndex());
    loadPolicyRecord(sel_index - 1);
}
