/** Node manager setting **/

    var PolicyTableArray = new Array();
    var GridTable;
    //var mSelfTest = false;
    var mWritePolicyID = null;
    var mWritePolicyDomain = null;
    var suspendTimerData;
    var mItem_Count = 0;
    var old_suspendTimerData;
    var maxPowerLimit = 0;
    var minPowerLimit = 0;
    //NM Domain ID
    const Memory_subsystem = "2";
    const HW_Protection    = "3";

function formatTimeStr(value) {
    var str = "";
    str = value;
    if(value < 10 && value >= 0) {
        str = "0" + value;
    }
    return str;
}

function createScheduleTimeItem(timer_idx) {
    var temp;
    var id;
    var time_opt_h;
    var time_opt_m;
    var temp_opt;
    var interval = 0;
    var td = document.createElement("td");
    td.setAttribute("class", "labelhead");
    td.setAttribute("align", "center");

    temp = document.createTextNode(lang.LANG_MISC_NM_CONFIG_STARTTIME);
    td.appendChild(temp);
    temp = document.createElement("br");
    td.appendChild(temp);
    time_opt_h = document.createElement("select");
    id = "_nm_timer" + timer_idx + "_start_h";
    time_opt_h.setAttribute("id", id);
    //console.log("id:" + id);
    for(interval = 0; interval < 24; interval++) {
        temp_opt = document.createElement("option");
        temp_opt.setAttribute("value", interval);
        temp = document.createTextNode(formatTimeStr(interval));
        temp_opt.appendChild(temp);
        time_opt_h.appendChild(temp_opt);
    }
    td.appendChild(time_opt_h);
    temp = document.createTextNode(":");
    td.appendChild(temp);
    time_opt_h = document.createElement("select");
    id = "_nm_timer" + timer_idx + "_start_m";
    time_opt_h.setAttribute("id", id);
    //console.log("id:" + id);
    for(interval = 0; interval < 60; interval += 6) {
        temp_opt = document.createElement("option");
        temp_opt.setAttribute("value", interval);
        temp = document.createTextNode(formatTimeStr(interval));
        temp_opt.appendChild(temp);
        time_opt_h.appendChild(temp_opt);
    }
    td.appendChild(time_opt_h);
    temp = document.createElement("br");
    td.appendChild(temp);

    temp = document.createTextNode(lang.LANG_MISC_NM_CONFIG_ENDTIME);
    td.appendChild(temp);
    temp = document.createElement("br");
    td.appendChild(temp);
    time_opt_h = document.createElement("select");
    id = "_nm_timer" + timer_idx + "_end_h";
    time_opt_h.setAttribute("id", id);
    //console.log("id:" + id);
    for(interval = 0; interval <= 24; interval++) {
        temp_opt = document.createElement("option");
        temp_opt.setAttribute("value", interval);
        temp = document.createTextNode(formatTimeStr(interval));
        temp_opt.appendChild(temp);
        time_opt_h.appendChild(temp_opt);
    }
    td.appendChild(time_opt_h);
    temp = document.createTextNode(":");
    td.appendChild(temp);
    time_opt_h = document.createElement("select");
    id = "_nm_timer" + timer_idx + "_end_m";
    time_opt_h.setAttribute("id", id);
    //console.log("id:" + id);
    for(interval = 0; interval < 60; interval += 6) {
        temp_opt = document.createElement("option");
        temp_opt.setAttribute("value", interval);
        temp = document.createTextNode(formatTimeStr(interval));
        temp_opt.appendChild(temp);
        time_opt_h.appendChild(temp_opt);
    }
    td.appendChild(time_opt_h);
    temp = document.createElement("br");
    td.appendChild(temp);
    return td;
}

function createScheduleWeekdayItem(timer_idx, days, text) {
    var temp;
    var id = "";
    var td = document.createElement("td");
    td.setAttribute("class", "labelhead");
    td.setAttribute("align", "left");
    temp = document.createElement("input");
    id = "_nm_timer" + timer_idx + "_weekday" + days;
    //console.log("id:" + id);
    temp.setAttribute("id", id);
    temp.setAttribute("type", "checkbox");
    td.appendChild(temp);
    temp = document.createTextNode(text);
    td.appendChild(temp);
    return td;
}

function createScheduleColumn(timer_index, text) {
    var table = null;
    var row = null;
    var td = null;
    var temp = null;

    table = document.createElement("table");
    table.setAttribute("width", "100%");
    row = document.createElement("tr");
    td = document.createElement("td");
    td.setAttribute("class", "labelhead");
    td.setAttribute("align", "center");
    temp = document.createElement("input");
    //console.log("id:" + "_nm_toggle_timer" + timer_index);
    temp.setAttribute("id", "_nm_toggle_timer" + timer_index);
    temp.setAttribute("type", "checkbox");
    td.appendChild(temp);
    temp = document.createTextNode(text);
    td.appendChild(temp);
    row.appendChild(td);
    table.appendChild(row);

    row = document.createElement("tr");
    td = createScheduleWeekdayItem(timer_index, 1, lang.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY1);
    row.appendChild(td);
    table.appendChild(row);

    row = document.createElement("tr");
    td = createScheduleWeekdayItem(timer_index, 2, lang.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY2);
    row.appendChild(td);
    table.appendChild(row);

    row = document.createElement("tr");
    td = createScheduleWeekdayItem(timer_index, 3, lang.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY3);
    row.appendChild(td);
    table.appendChild(row);

    row = document.createElement("tr");
    td = createScheduleWeekdayItem(timer_index, 4, lang.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY4);
    row.appendChild(td);
    table.appendChild(row);

    row = document.createElement("tr");
    td = createScheduleWeekdayItem(timer_index, 5, lang.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY5);
    row.appendChild(td);
    table.appendChild(row);

    row = document.createElement("tr");
    td = createScheduleWeekdayItem(timer_index, 6, lang.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY6);
    row.appendChild(td);
    table.appendChild(row);

    row = document.createElement("tr");
    td = createScheduleWeekdayItem(timer_index, 7, lang.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY7);
    row.appendChild(td);
    table.appendChild(row);

    row = document.createElement("tr");
    td = createScheduleTimeItem(timer_index);
    row.appendChild(td);
    table.appendChild(row);
    return table;
}

function createScheduleTable() {
    var root = document.getElementById("ScheduleTable");
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }

    var table = document.createElement("table");
    var row = document.createElement("tr");
    var td = document.createElement("td");
    var sub_table = null;

    table.setAttribute("id", "NmPwrTimerTable");
    table.setAttribute("border", "1");
    table.setAttribute("cellpadding", "0");
    table.setAttribute("cellspacing", "0");

    sub_table = createScheduleColumn(1, lang.LANG_MISC_NM_CONFIG_TIMERS_1);
    td.appendChild(sub_table);
    row.appendChild(td);

    td = document.createElement("td");
    sub_table = createScheduleColumn(2, lang.LANG_MISC_NM_CONFIG_TIMERS_2);
    td.appendChild(sub_table);
    row.appendChild(td);

    td = document.createElement("td");
    sub_table = createScheduleColumn(3, lang.LANG_MISC_NM_CONFIG_TIMERS_3);
    td.appendChild(sub_table);
    row.appendChild(td);

    td = document.createElement("td");
    sub_table = createScheduleColumn(4, lang.LANG_MISC_NM_CONFIG_TIMERS_4);
    td.appendChild(sub_table);
    row.appendChild(td);

    td = document.createElement("td");
    sub_table = createScheduleColumn(5, lang.LANG_MISC_NM_CONFIG_TIMERS_5);
    td.appendChild(sub_table);
    row.appendChild(td);

    table.appendChild(row);
    root.appendChild(table);
}

function showScheduleTable(show) {
    var table = document.getElementById("ScheduleTable");
    if(show) {
        table.style.display = 'block';
    }
    else {
        table.style.display = 'none';
    }
}
function readPolicyWeekdayMask(timer_id, weekdays) {
    //[6] – Repeat suspend period every Sunday.
    //[5] – Repeat suspend period every Saturday.
    //[4] – Repeat suspend period every Friday.
    //[3] – Repeat suspend period every Thursday.
    //[2] – Repeat suspend period every Wednesday.
    //[1] – Repeat suspend period every Tuesday.
    //[0] – Repeat suspend period every Monday.
    var obj_id = "_nm_toggle_timer" + timer_id;
    var enable = document.getElementById(obj_id).checked;
    var day_checked;
    var result = 0;

    if(enable == true) {
        obj_id = "_nm_timer" + timer_id + "_weekday" + weekdays;
        day_checked = document.getElementById(obj_id).checked;
        if(day_checked == true) {
            result = (0x01 << (weekdays - 1));
        }
    }
    return result;
}

//Start time from 0~239 (defined by intel spec.)
function getStartTimeOffset(timer_id) {
    var obj;
    var result = 0;
    var hour = 0;
    var minute = 0;
    var id = "_nm_timer" + timer_id + "_start_h";
    hour = document.getElementById(id).value;
    id = "_nm_timer" + timer_id + "_start_m";
    minute = document.getElementById(id).value;
    result = parseInt(hour * 60) + parseInt(minute);
    result /= 6;
    return result;
}

//End time from 1~240 (defined by intel spec.)
function getEndTimeOffset(timer_id) {
    var obj;
    var result = 0;
    var hour = 0;
    var minute = 0;
    var id = "_nm_timer" + timer_id + "_end_h";
    hour = document.getElementById(id).value;
    id = "_nm_timer" + timer_id + "_end_m";
    minute = document.getElementById(id).value;
    result = parseInt(hour * 60) + parseInt(minute);
    result /= 6;
    result += 1;
    return result;
}

function enableAllFunctions(enable) {
    var temp = null;
    var toggle = false;
    if(enable == true) {
        toggle = false;
    }
    else {
        toggle = true;
    }
    temp = document.getElementById("HtmlPolicyTable");
    temp.disabled = toggle;
    temp = document.getElementById("_nm_policy_number");
    temp.disabled = toggle;
    temp = document.getElementById("_nm_enable");
    temp.disabled = toggle;
    temp = document.getElementById("_nm_shutdown");
    temp.disabled = toggle;
    temp = document.getElementById("_nm_logevent");
    temp.disabled = toggle;
    temp = document.getElementById("_nm_power_limit");
    temp.disabled = toggle;
    temp = document.getElementById("_optTimersEnable");
    temp.disabled = toggle;
    temp = document.getElementById("_optTimersDisable");
    temp.disabled = toggle;
    temp = document.getElementById("btn_modify");
    temp.disabled = toggle;
    temp = document.getElementById("btn_del");
    temp.disabled = toggle;
    temp = document.getElementById("btn_cancel");
    temp.disabled = toggle;
}

function responsePolicyTable(originalRequest) {
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
        var content = JSON.parse(originalRequest.responseText);
        var RowData = [];
        var n_data = [];
        var idx = 0;
        var domainsData = content.Domains;
        for (var i = 0; i < domainsData.length; i++) {
          if (domainsData[i].Id == "entirePlatform") {
            maxPowerLimit = domainsData[i].Max;
            minPowerLimit = domainsData[i].Min;
          }
        }
        if (content.hasOwnProperty("Policies")) {
          n_data = content.Policies;
        }
        if (n_data.length) {
          for (var i = 0; i < n_data.length; i++) {
            PolicyTableArray[idx] = [];
            PolicyTableArray[idx][0] = n_data[i].Id;
            PolicyTableArray[idx][1] = n_data[i].NumofTimer;
            PolicyTableArray[idx][2] = n_data[i].Enabled;
            var limitException = n_data[i].LimitException;
            PolicyTableArray[idx][3] =
                (limitException == 1 || limitException == 3) ? 1 : 0;
            PolicyTableArray[idx][4] =
                (limitException == 2 || limitException == 3) ? 1 : 0;
            PolicyTableArray[idx][5] = n_data[i].Limit;
            PolicyTableArray[idx][6] = n_data[i].SuspendPeriods;
            idx++;
          }
        }
        PolicyTableArray.sort(sort_nm_id);
        idx = 0;
        while(idx < PolicyTableArray.length) {
          if ((PolicyTableArray[idx][0] == '0' &&
               PolicyTableArray[idx][4] == HW_Protection) ||
              (PolicyTableArray[idx][0] == '1' &&
               PolicyTableArray[idx][4] == Memory_subsystem)) {
            PolicyTableArray[idx][0] += '*';
          }
          RowData.push([
            idx, PolicyTableArray[idx][0], PolicyTableArray[idx][1],
            PolicyTableArray[idx][2], PolicyTableArray[idx][3],
            PolicyTableArray[idx][4], PolicyTableArray[idx][5],
            PolicyTableArray[idx][6]
          ]);
          idx++;
        }
        GridTable.empty();
        GridTable.show(RowData);
        var objTableInfo = document.getElementById("HtmlPolicyTableInfo");
        if (objTableInfo != null) {
          objTableInfo.textContent = lang.LANG_MISC_NM_CONFIG_EXTRATBLINFO +
                                     (PolicyTableArray.length) +
                                     lang.LANG_MISC_NM_CONFIG_POLICYUNIT;
        }
        Loading(false);
    }
}

function sort_nm_id(a, b)
{
    return a[0] - b[0];
}

function updateScheduleInfo(timer_id, start, end, weekdays) {
    var id;
    var node;
    var idx;
    var mask;
    var maskCheck;
    var hour;
    var minute;

    id = "_nm_toggle_timer" + timer_id;
    //console.log("timer id:" + timer_id + " id:" + id + " weekdays:" + weekdays);
    node = document.getElementById(id);
    node.checked = true;

    for(idx = 0; idx < 7; idx++) {
        mask = (0x01 << idx);
        maskCheck = (parseInt(weekdays) & mask);
        if(maskCheck > 0) {
            //console.log("checked weekdays " + idx + " mask:" + mask + " result:" + maskCheck);
            id = "_nm_timer" + timer_id + "_weekday" + (idx + 1);
            node = document.getElementById(id);
            node.checked = true;
        }
    }

    hour = parseInt(parseInt(start) / 10);
    id = "_nm_timer" + timer_id + "_start_h";
    node = document.getElementById(id);
    node.value = hour;

    minute = parseInt(parseInt(start) % 10) * 6;
    id = "_nm_timer" + timer_id + "_start_m";
    node = document.getElementById(id);
    node.value = minute;

    hour = parseInt(parseInt(end) / 10);
    id = "_nm_timer" + timer_id + "_end_h";
    node = document.getElementById(id);
    node.value = hour;

    minute = parseInt(parseInt(end) % 10) * 6;
    id = "_nm_timer" + timer_id + "_end_m";
    node = document.getElementById(id);
    node.value = minute;
    enableSuspendTimer(timer_id);
}

function responseWritePolicySchedule(originalRequest) {
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc = GetResponseXML(response);
        if (xmldoc == null) {
            //SessionTimeout();
            return;
        }
        //check session & privilege.
        if (CheckInvalidResult(xmldoc) < 0) {
            return;
        }
        var result = GetXMLNodeValue(xmldoc, "RESULT");
        if(result == "OK") {
           requestPolicyInfo();
           alert(lang.LANG_MISC_NM_UPDATE_SUCCESS, {title: lang.LANG_GENERAL_SUCCESS});
        }
        else {
           alert(lang.LANG_MISC_NM_UPDATE_FAIL);
        }
    }
}

function responsePolicyScheduleTable(index) {
    old_suspendTimerData = PolicyTableArray[index][6].length;
    var suspendTimer = PolicyTableArray[index][6];
    var idx = 0;
    var i = 0;
    // var root = xmldoc.documentElement;
    var schedules = suspendTimer;
    var node;
    var timer_id;
    var nm_start;
    var nm_end;
    var nm_weekdays;

    while(idx < schedules.length){
        i++;
        timer_id = i;
        nm_start = schedules[idx];//node.getAttribute("NM_SUSPEND_START");
        nm_end = schedules[idx+1];//node.getAttribute("NM_SUSPEND_END");
        nm_weekdays = schedules[idx+2];//node.getAttribute("NM_SUSPEND_DAYS");
        idx = idx+3;        
        updateScheduleInfo(timer_id, nm_start, nm_end, nm_weekdays);
    }
}

function responseCompleteDel(originalRequest) {
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
      var response = originalRequest.responseText;
      if (response == null) {
        SessionTimeout();
        return;
        }
        var result = originalRequest.statusText;
        if(result == "OK") {
           document.getElementById("btn_del").disabled = true;
           disableTimer();
           alert(lang.LANG_MISC_NM_UPDATE_SUCCESS, {
             title : lang.LANG_GENERAL_SUCCESS,
             onClose : function() { location.reload(); }
           });
        }
        else {
           alert(lang.LANG_MISC_NM_DELETE_FAIL);
        }
    }
}

function responseCompleteWrite() {
  Loading(false);
  alert(lang.LANG_MISC_NM_UPDATE_SUCCESS, {
    title : lang.LANG_GENERAL_SUCCESS,
    onClose : function() { location.reload(); }
  });
}

function loadPolicyRecord(index) {
    var temp = null;
    disableSuspendTimer();
    if (PolicyTableArray.length > index && index >= 0) {
        temp = document.getElementById("_nm_policy_number");
        temp.value = parseInt(PolicyTableArray[index][0]);

        temp = document.getElementById("_nm_enable");
        if(PolicyTableArray[index][2] == "1") {
            temp.checked = true;
        }
        else {
            temp.checked = false;
        }

        temp = document.getElementById("_nm_shutdown");
        if(PolicyTableArray[index][3] == "1") {
            temp.checked = true;
        }
        else {
            temp.checked = false;
        }

        temp = document.getElementById("_nm_logevent");
        if(PolicyTableArray[index][4] == "1") {
            temp.checked = true;
        }
        else {
            temp.checked = false;
        }

        temp = document.getElementById("_nm_power_limit");
        temp.value = PolicyTableArray[index][5];

        if (parseInt(PolicyTableArray[index][1]) > 0) {
            temp = document.getElementById("_optTimersEnable");
            temp.checked = true;
            var policy_id = parseInt(GetSelectedRowCellInnerHTML(0));
            responsePolicyScheduleTable(index);
            showScheduleTable(true);
        }
        else {
            temp = document.getElementById("_optTimersDisable");
            temp.checked = true;
            showScheduleTable(false);
            old_suspendTimerData = 0;
        }
    }
}

function requestPolicyInfo() {
    Loading(true);
    var ajax_url = '/redfish/v1/NmService';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: responsePolicyTable,
        onFailure: function(){
            Loading(false);
            alert("Error in Getting NM Configurations!!");
        }
    });
}

function requestDeletePolicy(policy_id, domain) {
    UtilsConfirm(lang.LANG_MISC_NM_CONFIG_DEL, {
        onOk: function() {
            Loading(true);
            policy_id = parseInt(GetSelectedRowCellInnerHTML(0), 10);
            var ajax_url =
                '/redfish/v1/NmService/Actions/NmService.DeleteNmPolicy/';
            var data = JSON.stringify({"PolicyId" : policy_id});
            var ajax_req = new Ajax.Request(ajax_url, {
              method : 'POST',
              contentType : "application/json",
              parameters : data,
              timeout : g_CGIRequestTimeout,
              ontimeout : onCGIRequestTimeout,
              onSuccess : responseCompleteDel,
              onFailure : function() {
                Loading(false);
                alert("Error in Deleting NM Policy!!");
              }
            });
        }
    });
}

function requestWritePolicyInfo(policy_id, domain, isEnable, isShutdown, isLogEvent, power_limit, config_action) {
  var ajax_url = '/redfish/v1/NmService/Actions/NmService.ConfigNmPolicy';
  mWritePolicyID = policy_id;
  mWritePolicyDomain = domain;
  var arr_data = [];
  var alert_and_shutdown = 0;
  if (isShutdown == 1) {
    alert_and_shutdown = 1;
  }
  if (isLogEvent == 1) {
    alert_and_shutdown = 2;
  }
  if (isShutdown == 1 && isLogEvent == 1) {
    alert_and_shutdown = 3;
  }
  if (isShutdown != 1 && isLogEvent != 1) {
    alert_and_shutdown = 0;
  }

  var timer = updateTimer(mWritePolicyID, mWritePolicyDomain);
  for (var i = 0; i < timer.length; i++) {
    arr_data.push(timer[i]);
  }
  NumofTimer = timer.length / 3;
  PolicyId = policy_id.toString(); //(1 to 16);
  Enabled = (isEnable == 1) ? true : false;
  Limit = power_limit; //(in watts);
  var ajax_param = {
    "PolicyId" : PolicyId,
    "Enabled" : Enabled,
    "Limit" : power_limit,
    "LimitException" : alert_and_shutdown,
    "NumofTimer" : NumofTimer,
    "SuspendPeriods" : arr_data
  }

  var data = JSON.stringify(ajax_param);
  Loading(true);
  var ajax_req = new Ajax.Request(
      ajax_url, {
        method : 'POST',
        contentType : "application/json",
        parameters : data,
        timeout : g_CGIRequestTimeout,
        ontimeout : onCGIRequestTimeout,
        onSuccess : responseCompleteWrite,
        onFailure : function() {
          Loading(false);
          alert("Error in Configuring NM Policy!!");
        }
      } // register callback function
  );
}

function updateTimer(policy_id, domain){
    mWritePolicyID = policy_id;
    mWritePolicyDomain = domain;
    mItem_Count = 0;
    var timer_num = 0, weekday_num = 0;
    suspendTimerData = new Array();
    var timerID = 0
    var optEnabler = document.getElementById("_optTimersEnable");
    if (optEnabler.checked == true) {
        for (timer_num = 0; timer_num < 5; timer_num++) {
            var timer_days = 0;
            if (document.getElementById("_nm_toggle_timer" + (timer_num +1)).checked) {
                var timer_start = (parseInt(document.getElementById("_nm_timer" + (timer_num +1) + "_start_h").value) * 60 +
                                parseInt(document.getElementById("_nm_timer" + (timer_num +1) + "_start_m").value)) / 6;
                var timer_end   = (parseInt(document.getElementById("_nm_timer" + (timer_num +1) + "_end_h").value) * 60 +
                                parseInt(document.getElementById("_nm_timer" + (timer_num +1) + "_end_m").value)) / 6;
                if ((timer_end == 0) || (timer_end < timer_start)) {
                    alert(lang.LANG_MISC_NM_CONFIG_ERR3);
                    return;
                }
                for (weekday_num = 7; weekday_num > 0; weekday_num--) {
                    timer_days <<= 1;
                    if (document.getElementById("_nm_timer" + (timer_num +1) + "_weekday" + (weekday_num)).checked) {
                        timer_days += 1;
                    }
                }
                suspendTimerData.push(timer_start);
                suspendTimerData.push(timer_end);
                suspendTimerData.push(parseInt(timer_days));
                mItem_Count++;
            }
        }
    }
    return suspendTimerData;
}

function toggleSuspendTimer(timer_id) {
    var i = 0;
    if (document.getElementById("_nm_toggle_timer" + timer_id).checked) {
        for (i = 1; i<= 7; i++) {
             document.getElementById("_nm_timer" + timer_id +"_weekday" + i).disabled = false;
        }
        document.getElementById("_nm_timer" + timer_id + "_start_h").disabled = false;
        document.getElementById("_nm_timer" + timer_id + "_start_m").disabled = false;
        document.getElementById("_nm_timer" + timer_id + "_end_h").disabled = false;
        document.getElementById("_nm_timer" + timer_id + "_end_m").disabled = false;
    } else {
        for (i = 1; i<= 7; i++) {
             document.getElementById("_nm_timer" + timer_id +"_weekday" + i).disabled = true;
        }
        document.getElementById("_nm_timer" + timer_id + "_start_h").disabled = true;
        document.getElementById("_nm_timer" + timer_id + "_start_m").disabled = true;
        document.getElementById("_nm_timer" + timer_id + "_end_h").disabled = true;
        document.getElementById("_nm_timer" + timer_id + "_end_m").disabled = true;
    }
}

function disableSuspendTimer() {
    var i, j;
    for (i = 1; i<= 5; i++) {
         document.getElementById("_nm_toggle_timer" + i).checked = false;
         for (j = 1; j<= 7; j++) {
              document.getElementById("_nm_timer" + i +"_weekday" + j).disabled = true;
              document.getElementById("_nm_timer" + i +"_weekday" + j).checked = false;
         }
         document.getElementById("_nm_timer" + i + "_start_h").disabled = true;
         document.getElementById("_nm_timer" + i + "_start_m").disabled = true;
         document.getElementById("_nm_timer" + i + "_end_h").disabled = true;
         document.getElementById("_nm_timer" + i + "_end_m").disabled = true;
         document.getElementById("_nm_timer" + i + "_start_h").checked = false;
         document.getElementById("_nm_timer" + i + "_start_m").checked = false;
         document.getElementById("_nm_timer" + i + "_end_h").checked = false;
         document.getElementById("_nm_timer" + i + "_end_m").checked = false;
         document.getElementById("_nm_timer" + i + "_start_h").value = 0;
         document.getElementById("_nm_timer" + i + "_start_m").value = 0;
         document.getElementById("_nm_timer" + i + "_end_h").value = 0;
         document.getElementById("_nm_timer" + i + "_end_m").value = 0;
    }
}

function enableSuspendTimer(timer_id) {
    var j;
    for (j = 1; j<= 7; j++) {
         document.getElementById("_nm_timer" + timer_id +"_weekday" + j).disabled = false;
    }
    document.getElementById("_nm_timer" + timer_id + "_start_h").disabled = false;
    document.getElementById("_nm_timer" + timer_id + "_start_m").disabled = false;
    document.getElementById("_nm_timer" + timer_id + "_end_h").disabled = false;
    document.getElementById("_nm_timer" + timer_id + "_end_m").disabled = false;
}
