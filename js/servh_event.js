// declare all global variables
"use strict";
var fullContentMembers = [];
window.addEventListener('load', PageInit);
var lang;
if (parent.lang) { lang = parent.lang; }

var requestStatus = {isInProgress: false, isReachTail: false, freeUnit: 0};
var MAXSelBufferSize = 4096;
var MAX_REQUEST_SIZE = 200;
var sel_buf = [];
var selToShow = [];
var SelCapacity = 0;
var SelTotalCount = 0;
var SelTotalCountAll = 0;
var SelToDisplay = "ALL";
var SelDisplayCount = 0;
var currentPage = 0;
var SelMaxPage = 0;
var pageSize = 50;
var totalLogsCount = -1;
var sel_clear_log_btn;
var sel_save_log_btn;
var sel_refresh_btn;
var selPageUp;
var selPageDown;
var selPageTop;
var selPageBottom;
var selCount;
var pageSelCount;
var fullNotice;
var selSelect;
var selSelectSize;
var event_log_page_select;
var severity_infor_chkbox;
var severity_warning_chkbox;
var severity_critical_chkbox;
var GridTable;

function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src = "../help/" + lang_setting + "/servh_event_hlp.html";
    document.title = lang.LANG_EVENT_LOG_TITLE;


    sel_clear_log_btn = document.getElementById("sel_clear_log_btn");
    sel_clear_log_btn.setAttribute("value", lang.LANG_EVENT_CLEARBTN);
    sel_clear_log_btn.onclick = SELClearTaskCheck;

    sel_save_log_btn = document.getElementById("sel_save_log_btn");
    sel_save_log_btn.setAttribute("value", lang.LANG_EVENT_SAVEBTN);
    sel_save_log_btn.onclick = SELsaving;

    sel_refresh_btn = document.getElementById("sel_refresh_btn");
    sel_refresh_btn.setAttribute("value", lang.LANG_EVENT_REFRESHBTN);
    sel_refresh_btn.onclick = SELQueryMainTask;

    selPageUp = document.getElementById("selPageUp");
    selPageUp.setAttribute("value", "<");
    selPageUp.onclick = changePageHandler;

    selPageDown = document.getElementById("selPageDown");
    selPageDown.setAttribute("value", ">");
    selPageDown.onclick = changePageHandler;

    selPageTop = document.getElementById("selPageTop");
    selPageTop.setAttribute("value", "<<");
    selPageTop.onclick = changePageHandler;

    selPageBottom = document.getElementById("selPageBottom");
    selPageBottom.setAttribute("value", ">>");
    selPageBottom.onclick = changePageHandler;

    selCount = document.getElementById("selCount");
    pageSelCount = document.getElementById("pageSelCount");

    fullNotice = document.getElementById("fullNotice");
    selSelect = document.getElementById("selSelect");
    selSelectSize = document.getElementById("selSelectSize");

    event_log_page_select = document.getElementById("event_log_page_select");
    event_log_page_select.textContent = lang.LANG_EVENT_ENTRIES_PER_PAGE;

    severity_infor_chkbox = document.getElementById("severity_infor_chkbox");
    severity_infor_chkbox.onclick = filterSelHandler;
    severity_warning_chkbox = document.getElementById("severity_warning_chkbox");
    severity_warning_chkbox.onclick = filterSelHandler;
    severity_critical_chkbox = document.getElementById("severity_critical_chkbox");
    severity_critical_chkbox.onclick = filterSelHandler;

    OutputString();
    selectSizeInit();

    // check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("event_heading_div").textContent = lang.LANG_EVENT_HEADING;
    document.getElementById("log_severity_type_lbl").textContent = lang.LANG_EVENT_LOG_SEVERITY_TYPE;
    document.getElementById("alert_info_lbl").textContent = lang.LANG_MODALERT_INFO;
    document.getElementById("alert_warn_lbl").textContent = lang.LANG_MODALERT_WARN;
    document.getElementById("alert_critical_lbl").textContent = lang.LANG_MODALERT_CRITICAL;
    document.getElementById("log_selcount_lbl").textContent = lang.LANG_EVENT_LOG_SELCOUNT;
}

function selectSizeInit() {
    var pageSizeOption = [50, 100, 200, 500];

    for (var i = 0; i < pageSizeOption.length; i++) {
        selSelectSize.add(new Option(pageSizeOption[i], pageSizeOption[i]),
            browser_ie ? i : null);
    }

    selSelectSize.selectedIndex = 0;

    selSelectSize.onchange = function() {
        Loading(true);
        button_all_disable();

        currentPage = 0;
        pageSize = selSelectSize.value;
        SelMaxPage = Math.ceil(SelTotalCountAll / pageSize);

        getPartialSEL();
    };
}

function SELQueryMainTask() {
    Loading(true);
    button_all_disable();

    currentPage = 0;
    SelMaxPage = 0;
    sel_buf = [];
    SelDisplayCount = 0;
    SelTotalCount = 0;
    SelTotalCountAll = 0;
    totalLogsCount = -1;

    requestStatus.isInProgress = false;
    requestStatus.isReachTail = false;

    selSelect.textContent = (currentPage + 1) + " / " + (SelMaxPage || 1);

    getPartialSEL(0xFFFF, MAX_REQUEST_SIZE);
    refreshDisplay();
}

function changePageHandler() {
    Loading(true);
    button_all_disable();
    if ('selPageUp' == this.id) {
        currentPage -= 1;
    } else if ('selPageDown' == this.id) {
        currentPage += 1;
    } else if ('selPageTop' == this.id) {
        currentPage = 0;
    } else if ('selPageBottom' == this.id) {
        currentPage = SelMaxPage - 1;
    }
    getPartialSEL();
}

function filterSelHandler() {
    Loading(true);
    button_all_disable();
    currentPage = 0;
    eventLogFilter();
    refreshDisplay();
}


function eventLogFilter() {
    var filtered_log = [];
    var EvtSeverity = "";

    if (severity_infor_chkbox.checked)
        EvtSeverity += "Informational ";
    if (severity_warning_chkbox.checked)
        EvtSeverity += "Warning ";
    if (severity_critical_chkbox.checked)
        EvtSeverity += "Critical";

    if (EvtSeverity) {
      sel_buf.forEach(function(x, i) {
        if (("" == EvtSeverity || EvtSeverity.search(x.SEVERITY) != -1)) {
          filtered_log.push(i);
        }
      });

      SelToDisplay = filtered_log;
      SelDisplayCount = filtered_log.length;
    } else {
      SelToDisplay = "ALL";
      SelDisplayCount = sel_buf.length;
    }

    SelMaxPage = Math.ceil(SelTotalCountAll / pageSize);
    selSelect.textContent = (currentPage + 1) + " / " + (SelMaxPage || 1);
}

function refreshStatisticsDisplay() {
  selCount.textContent = SelTotalCountAll + lang.LANG_EVENT_EVENT_COUNT_STR;
}

function refreshDisplay() {
  selToShow = [];
  var startIndex = 0;

  var severityString = function(severity) {
    switch (severity) {
    case 'Informational':
      return lang.LANG_MODALERT_INFO;
      break;
    case 'Warning':
      return lang.LANG_MODALERT_WARN;
      break;
    case 'Critical':
      return lang.LANG_MODALERT_CRITICAL;
      break;
    default:
      return lang.LANG_EVENT_UNKNOWN;
    }
  };

  selSelect.textContent = (currentPage + 1) + " / " + (SelMaxPage || 1);

  startIndex = currentPage * pageSize;
  if ("ALL" == SelToDisplay) {
    for (var i = 0; i < sel_buf.length; i++) {
      if (i >= sel_buf.length) {
        break;
      }

      selToShow.push(i);
    }
  } else {
      selToShow = SelToDisplay;
  }

    if (requestStatus.isInProgress && selToShow.length < pageSize) {
        setTimeout(refreshDisplay, 1000);

        if (GridTable.data.length == selToShow.length) {
            return;
        }
    }

    selToShow.forEach(function(val, index, arr) {
        arr[index] = [index + 1,
                      sel_buf[val].TIME,
                      severityString(sel_buf[val].SEVERITY),
                      sel_buf[val].DESCR];
    });

    pageSelCount.textContent = lang.LANG_EVENT_LOG_PAGE_SELCOUNT +
        selToShow.length +
        lang.LANG_EVENT_EVENT_COUNT_STR;

    GridTable.empty();
    GridTable.show(selToShow);

    Loading(requestStatus.isInProgress);
    button_all_restore();
}

function getSelTotalCount() {
  Loading(true);
  var ajaxReq = new Ajax.Request(
      '/redfish/v1/Systems/system/LogServices/EventLog/Entries?$skip=0&$top=1',
      {
        method : 'GET',
        onSuccess : function(response) {
          if (response.readyState == 4 && response.status == 200) {
            var content = JSON.parse(response.responseText);
            if (content.hasOwnProperty("Members@odata.count")) {
              totalLogsCount = content["Members@odata.count"];
              getPartialSEL();
            }
          }
        },
        onFailure : function() {
          Loading(false);
          alert(lang.LANG_COMMON_ERROR_MESSAGE);
        }
      });
}

function getSelRecordsToDisplay() {
  requestStatus.isInProgress = true;
  // Getting Selected number of logs to display in the UI
  var numberEntriesToGet = parseInt(selSelectSize.value, 10);
  // Calculate number of logs to skip from the start to display, from the latest
  // logs
  var numberOfEntriesToSkip =
      totalLogsCount - (numberEntriesToGet * (currentPage + 1));
  if (numberOfEntriesToSkip < 0) {
    // If number of entries to skip is negative, then display
    // the remaining logs
    numberEntriesToGet = numberOfEntriesToSkip + numberEntriesToGet;
    numberOfEntriesToSkip = 0;
  }
  if (numberOfEntriesToSkip == 0 && numberEntriesToGet == 0)
    numberEntriesToGet = 1;
  // $top ==> will fetch the mentioned number of data from the skipped index
  // $skip ==> will skip the mentioned number of logs from the starting point
  var ajax_url =
      '/redfish/v1/Systems/system/LogServices/EventLog/Entries?$skip=' +
      numberOfEntriesToSkip + '&$top=' + numberEntriesToGet;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : checkFullSEL,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_COMMON_ERROR_MESSAGE);
    }
  });
}

function getPartialSEL() {
  Loading(true);
  if (totalLogsCount == -1) {
    // Get the total available log count to calculate the
    // number of entries to display and number of entries to
    // skip from the UI
    getSelTotalCount();
  } else {
    // If total log count is already available fetch the needed
    // number of logs to display in the UI
    getSelRecordsToDisplay();
  }
}

function checkFullSEL(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var content = JSON.parse(arg.responseText);
    if (content.hasOwnProperty("Members@odata.count")) {
        SelTotalCountAll = content["Members@odata.count"];
    }
    var contentMembers = content.Members;
    SELQueryResponse(contentMembers);
  }
}

function SELQueryResponse(selContentMembers) {
  Loading(false);
  var SEL = selContentMembers;
  var rspSel = [];
  Array.prototype.clear.apply(sel_buf);
  requestStatus.freeUnit = MAXSelBufferSize - SEL.length;
  SelCapacity = MAXSelBufferSize;

  for (var i = 0; i < SEL.length; i++) {
    var sel_entry = {
      'TIME' : null,
      'DESCR' : null,
      'SEVERITY' : null
    };
    sel_entry.TIME = SEL[i].Created;
    sel_entry.DESCR = SEL[i].Message;

    sel_entry.CONTR =
        SEL[i].EntryType == "Event" ? "System Management Software" : "BMC";

    switch (SEL[i].Severity) {
    case 'OK':
      sel_entry.SEVERITY = 'Informational';
      break;
    case 'Warning':
      sel_entry.SEVERITY = 'Warning';
      break;
    case 'Critical':
      sel_entry.SEVERITY = 'Critical';
      break;
    default:
      sel_entry.SEVERITY = 'Unknown';
    }

    rspSel.unshift(sel_entry);
  }

  if (rspSel.length > 0) {
    if (sel_buf.length == 0 || !requestStatus.isReachTail) {
      SelTotalCount = Array.prototype.push.apply(sel_buf, rspSel);
    } else {
      SelTotalCount = Array.prototype.unshift.apply(sel_buf, rspSel);
    }

    refreshStatisticsDisplay();
    eventLogFilter();
  } else {
    refreshStatisticsDisplay();
    requestStatus.isReachTail = true;
  }
  requestStatus.isReachTail = true;

  if (!requestStatus.isReachTail) {
    var startIndex = sel_buf[SelTotalCount - 1].RECORD_ID - 1;
    if (startIndex == 0) {
      startIndex = 0xFFFE;
    }

    getPartialSEL(startIndex, MAX_REQUEST_SIZE);
  } else if (requestStatus.freeUnit == 0 && SelTotalCount < SelCapacity) {
    var SelCount = SelCapacity - SelTotalCount;
    if (SelCount > MAX_REQUEST_SIZE) {
      SelCount = MAX_REQUEST_SIZE;
    }

    getPartialSEL((sel_buf[0].RECORD_ID - 0 + SelCount) % 0xFFFE, SelCount);
  } else {
    requestStatus.isInProgress = false;
    refreshDisplay();
  }
}

function DownloadSellLog() {
  // Convert JSON Array to string.
  var json = JSON.stringify(fullContentMembers);
  // Convert JSON string to BLOB.
  json = [ json ];
  var blob1 = new Blob(json, {type : "application/json"});
  // Check the Browser.
  var isIE = false || !!document.documentMode;
  if (isIE) {
    window.navigator.msSaveBlob(blob1, "EVENT_LOG.json");
  } else {
    var url = window.URL || window.webkitURL;
    var link = url.createObjectURL(blob1);
    var a = document.createElement("a");
    a.download = "EVENT_LOG.json";
    a.href = link;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  Loading(false);
  button_all_restore();
}

function saveEventLog() {
    Loading(true);
    button_all_disable();
    fullContentMembers = [];
    getAllTheLogs();
}

function getAllTheLogs(ajax_url) {
  if (sel_buf.length < SelTotalCountAll) {
    // If sel_buf is not having all the logs, Fetch Full logs
    Loading(true);
    if (!ajax_url) {
      var ajax_url = '/redfish/v1/Systems/system/LogServices/EventLog/Entries';
    }
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'GET',
      onSuccess : saveSELlogsResponse,
      onFailure : function() {
        Loading(false);
        alert(lang.LANG_COMMON_ERROR_MESSAGE);
      }
    });
  } else {
    // If sel_buf is having all the logs, skip fetch and proceed to download
    // the sel_buf logs
    fullContentMembers = sel_buf;
    DownloadSellLog();
  }
}

function saveSELlogsResponse(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var content = JSON.parse(arg.responseText);
    fullContentMembers = fullContentMembers.concat(content.Members);
    if (content.hasOwnProperty("Members@odata.nextLink")) {
      getAllTheLogs(content["Members@odata.nextLink"]);
    } else {
      DownloadSellLog();
    }
  }
}

function SELsaving() {
    saveEventLog();
}

function SELTableInit() {
    var TableTitles = [
        // name, width, text-align, min-width
        ["Timestamp", "11%", "left", "50px"],
        ["Severity", "8%", "left", "50px"],
        ["Description", "60%", "left"]
    ];
    //replace table header content with string table
    TableTitles[0][0] = lang.LANG_EVENT_TABLE_HEADTITLE1;
    TableTitles[1][0] = lang.LANG_EVENT_TABLE_HEADTITLE4;
    TableTitles[2][0] = lang.LANG_EVENT_TABLE_HEADTITLE6;

    var SELTableHeader = document.getElementById("sel_tbl_header");
    var SELTablePlace = document.getElementById("sel_tbl_place");
    GridTable = GetTableElement();
    GridTable.setColumns(TableTitles);
    GridTable.init_header('GridTable', SELTableHeader);
    GridTable.init_body('GridTable', SELTablePlace);
}

function PrivilegeCallBack(Privilege) {
    //full access
    if (Privilege == '03' || Privilege == '04') {
        SELTableInit();
        SELQueryMainTask();
        sel_save_log_btn.disabledCfg = false;
        sel_clear_log_btn.disabledCfg = false;
        sel_refresh_btn.disabledCfg = false;
    }
    //only view
    else if (Privilege == '02') {
        SELTableInit();
        SELQueryMainTask();
        sel_save_log_btn.disabled = true;
        sel_clear_log_btn.disabled = true;
        sel_refresh_btn.disabled = true;
        sel_save_log_btn.disabledCfg = true;
        sel_clear_log_btn.disabledCfg = true;
        sel_refresh_btn.disabledCfg = true;
    }
    //no access
    else {
        location.href = SubMainPage;
        sel_save_log_btn.disabled = true;
        sel_clear_log_btn.disabled = true;
        sel_refresh_btn.disabled = true;
        sel_save_log_btn.disabledCfg = true;
        sel_clear_log_btn.disabledCfg = true;
        sel_refresh_btn.disabledCfg = true;
        return;
    }
}

function SELClearTaskCheck() {
    UtilsConfirm(lang.LANG_EVENT_CLEAN_PROMPT, { onOk: SELClearTask });
}

function SELClearTask() {
    Loading(true);
    button_all_disable();
    var ajax_url = '/redfish/v1/Systems/system/LogServices/EventLog/Actions/LogService.ClearLog';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'POST',
        onSuccess: resSELClearTask,
        timeout: g_CGIRequestTimeout,
        ontimeout: onCGIRequestTimeout,
        onFailure: function() {
            Loading(false);
            alert(lang.LANG_CONF_SEL_CLEAR_FAILED);
        }
    });
}

function resSELClearTask(arg) {
    Loading(false);
    button_all_restore();

    if (arg.readyState == 4 && arg.status == 200) {
        selSelectSize.selectedIndex = 0;
        severity_infor_chkbox.checked = false;
        severity_warning_chkbox.checked = false;
        severity_critical_chkbox.checked = false;
        // While immediately calling the function to get the logs as empty, So
        // used a 1-sec delay.
        setTimeout(function() {
          totalLogsCount = -1;
          SELQueryMainTask();
        }, 1000);
    }
}

function button_all_disable() {
    sel_save_log_btn.disabled = true;
    sel_refresh_btn.disabled = true;
    sel_clear_log_btn.disabled = true;

    severity_infor_chkbox.disabled = true;
    severity_warning_chkbox.disabled = true;
    severity_critical_chkbox.disabled = true;
    selSelectSize.disabled = true;

    selPageUp.disabled = true;
    selPageTop.disabled = true;
    selPageDown.disabled = true;
    selPageBottom.disabled = true;
}

function button_all_restore() {
    sel_save_log_btn.disabled =
        sel_save_log_btn.disabledCfg || requestStatus.isInProgress;

    sel_refresh_btn.disabled =
        sel_refresh_btn.disabledCfg || requestStatus.isInProgress;

    sel_clear_log_btn.disabled =
        sel_clear_log_btn.disabledCfg || requestStatus.isInProgress;

    severity_infor_chkbox.disabled = false;
    severity_warning_chkbox.disabled = false;
    severity_critical_chkbox.disabled = false;
    selSelectSize.disabled = false;

    selPageUp.disabled =
        selPageTop.disabled = (0 == currentPage);

    selPageDown.disabled =
        selPageBottom.disabled = (currentPage + 1 >= SelMaxPage);
}
