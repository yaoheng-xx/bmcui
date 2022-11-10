"use strict";
var currTimestampsAry = new Array();
var prevTimestampsAry = new Array();
var currPOSTAry = new Array();
var prevPOSTAry = new Array();
var RowHilightPersist = new Array();
var CurrentCycleCount = "";
var PreviousCycleCount = "";
var CurrentCycleCount_array = [];
var PreviousCycleCount_array = [];
var postCodeEntriesUrl =
    '/redfish/v1/Systems/system/LogServices/PostCodes/Entries';
var fullPostCodeData = [];

var TIMECOL = 0;
var CODECOL = 1;
var DESCCOL = 2;
var lang;
var lang_setting;
var IE;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/servd_postcodes_hlp.html";

    if(navigator.appName.indexOf('Microsoft')>=0)
        IE = true;
    else
        IE = false;

    var optid = 0;
    // var timeSelect = document.getElementById("timeSelect");
    // timeSelect.add(new Option(lang.LANG_SERVER_DIAG_POST_TIMEFROMSTART,0),IE?optid++:null);
    // timeSelect.add(new Option(lang.LANG_SERVER_DIAG_POST_TIMERELATIVE,1),IE?optid++:null);
    // timeSelect.options.selectedIndex = 0;
    // timeSelect.onchange = setTimeBase;

    RowHilightPersist["currPOSTTable"] = 0;
    RowHilightPersist["prevPOSTTable"] = 0;

    OutputString();
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("title_div").textContent = lang.LANG_SERVER_DIAGNOSTICS_POST_TITLE;
    // document.getElementById("timeheader_lbl").textContent = lang.LANG_SERVER_DIAG_POST_TIMEHEADER;
    document.getElementById("previous_legend").textContent = lang.LANG_SERVER_DIAG_POST_PREVIOUS;
    document.getElementById("current_legend").textContent = lang.LANG_SERVER_DIAG_POST_CURRENT;
}

function PrivilegeCallBack(Privilege)
{
    if(Privilege == '03' || Privilege == '04') //full access
    {
      getBootCycleCount();
    }
    else
    {
        location.href = SubMainPage;
        return;
    }
}

function getBootCycleCount() {
  Loading(true);
  var ajax_url = '/redfish/v1/Systems/system/Bios';

  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    contentType : "application/json",
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : BootCycleCountHandler,
    onFailure : function(res) {
      Loading(false);
      alert(res.responseJSON.error);
      document.getElementById('currPOSTtimeinfo').textContent =
          lang.LANG_SERVER_DIAG_POST_NOT_AVAILABLE;
    }
  }); // register callback function;
}

function BootCycleCountHandler(response) {
  if (response.readyState == 4 && response.status == 200) {
    var org_req = JSON.parse(response.responseText);
    CurrentCycleCount = org_req.Oem.OpenBmc.PostCode.CurrentCycleCount;
    PreviousCycleCount = org_req.Oem.OpenBmc.PostCode.PreviousCycleCount;

    CurrentCycleCount_array = [];
    if (CurrentCycleCount > 0) {
      for (var i = 1; i <= CurrentCycleCount; i++) {
        CurrentCycleCount_array.push("B" + i);
      }
    }

    PreviousCycleCount_array = [];
    var tmp_count = CurrentCycleCount_array.length + 1;
    if (PreviousCycleCount > 0) {
      for (var i = 1; i <= PreviousCycleCount; i++) {
        PreviousCycleCount_array.push("B" + tmp_count);
        tmp_count++;
      }
    }
    getCurrentPOSTCodes();
  }
}

function getCurrentPOSTCodes(url) {
  Loading(true);
  var ajaxUrl = url ? url : postCodeEntriesUrl;
  var ajax_req = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    contentType : "application/json",
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : getFullPostCodeData,
    onFailure : function(res) {
      Loading(false);
      alert(res.responseJSON.error);
      document.getElementById('currPOSTtimeinfo').textContent =
          lang.LANG_SERVER_DIAG_POST_NOT_AVAILABLE;
    }
  }); // register callback function;
}

function getFullPostCodeData(originalRequest) {
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var response = JSON.parse(originalRequest.responseText);
    if (!response.Members.length) {
      handleCurrentPOSTHandler();
    } else {
      for (var i = 0; i < response.Members.length; i++) {
        fullPostCodeData.push(response.Members[i]);
      }
      var lastPostCode = fullPostCodeData[fullPostCodeData.length - 1].Id.split('-')[0];
      var lastCycleCount = lastPostCode.replace(/[^0-9]/ig, '');
      var nextLink = true;
      if (lastCycleCount > CurrentCycleCount + PreviousCycleCount)
        nextLink = false;
      if (response.hasOwnProperty('Members@odata.nextLink') &&
          response['Members@odata.count'] > 1000 && nextLink) {
        getCurrentPOSTCodes(response['Members@odata.nextLink']);
      } else {
        handleCurrentPOSTHandler();
      }
    }
  }
}

function handleCurrentPOSTHandler() {
  if (!fullPostCodeData.length) {
    Loading(false);
    document.getElementById('currPOSTtimeinfo').textContent =
        lang.LANG_SERVER_DIAG_POST_NOT_AVAILABLE;
    return;
  }

  var postCodesNode = fullPostCodeData;
  currTimestampsAry = new Array();
  prevTimestampsAry = new Array();
  currPOSTAry = new Array();
  prevPOSTAry = new Array();

  var curr_len = 0;
  for (var k = CurrentCycleCount_array.length - 1; k >= 0; k--) {
    for (var i = 0; i < postCodesNode.length; i++) {
      var boot_code = postCodesNode[i].Id.split('-')[0];
      if (CurrentCycleCount_array[k].indexOf(boot_code) != -1) {
        currTimestampsAry[i] = postCodesNode[i].Created.replace("T", " ");
        var current_hexString = postCodesNode[i].MessageArgs[2];
        if (current_hexString) {
          currPOSTAry[curr_len] = current_hexString;
        }
        curr_len++;
      }
    }
  }
  if (PreviousCycleCount != 0) {
    var prev_len = 0;
    for (var k = PreviousCycleCount_array.length - 1; k >= 0; k--) {
      for (var i = 0; i < postCodesNode.length; i++) {
        var boot_code = postCodesNode[i].Id.split('-')[0];
        if (PreviousCycleCount_array[k].indexOf(boot_code) != -1) {
          prevTimestampsAry[i] = postCodesNode[i].Created.replace("T", " ");
          var prev_hexString = postCodesNode[i].MessageArgs[2];
          if (prev_hexString) {
            prevPOSTAry[prev_len] = prev_hexString;
          }
          prev_len++;
        }
      }
    }
  }

  drawTables('currPOSTTable', currPOSTAry.length, currPOSTAry);
  drawTables('prevPOSTTable', prevPOSTAry.length, prevPOSTAry);
  Loading(false);
}

function drawTables(tableName, timeCodes, postCodes) {
    var table=document.getElementById(tableName);
    var thisRow;

    table.cellPadding = "0";
    table.cellSpacing = "0";
    if (timeCodes == 0) {
        return;
    }

    if (table.rows.length == 0) {
        var table1HeadRow = table.insertRow(0);
        table1HeadRow.insertCell(TIMECOL).innerHTML = "";
        table1HeadRow.insertCell(CODECOL).innerHTML = lang.LANG_SERVER_DIAG_POST_THEAD_CODE.bold();
        table1HeadRow.cells[CODECOL].colSpan = "2";
        table1HeadRow.cells[TIMECOL].style.textAlign = "right";
        table1HeadRow.cells[CODECOL].style.textAlign = "center";
    }

    // Clear any existing table values, but save the header.
    for(var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    var numRows = timeCodes;

    for (var i = 0; i < numRows; i++) {
      var codeDetails = postCodes[i].split(":");
      thisRow = table.insertRow(-1);
      thisRow.insertCell(TIMECOL);
      thisRow.insertCell(CODECOL).innerHTML =
          codeDetails[0].toLocaleUpperCase().replace('X', 'x').bold();
      thisRow.insertCell(DESCCOL).innerHTML = codeDetails[1];
      thisRow.cells[TIMECOL].style.textAlign = "right";
      thisRow.cells[CODECOL].style.textAlign = "center";
      thisRow.onmouseover = hilightRow;
      thisRow.onmouseout = clearhilightRow;
      thisRow.onclick = function() {
        // Persistence hilighting
        RowHilightPersist[tableName] = RowHilightPersist[tableName] ? 0 : 1;
        if (!RowHilightPersist[tableName])
          rowClearAllHilight(table);
        else
          setPersistRowHilight(table, this, "postcode_persist");
      };

      // Handle the dropdown selector for timebase.
      // switch(timeSelect.options.selectedIndex)
      // {
      //     case 0: // Fall through
      //     default:
      //         {
      //             // Time from start of POST.
      //             // thisRow.cells[TIMECOL].textContent =
      //             mintosec(timeCodes[i]); break;
      //         }
      //     case 1:
      //         {
      //             // Time from last POST event.
      //             if(i>0)
      //             {
      //                 // thisRow.cells[TIMECOL].textContent = "+" +
      //                 mintosec(timeCodes[i] - timeCodes[i-1]);
      //             }
      //             else
      //             {
      //                 // thisRow.cells[TIMECOL].textContent = "+" +
      //                 mintosec(timeCodes[i]);
      //             }
      //         }
      //         break;
      // }
    }
}

function mintosec(inputms) {
    var outputFull = new String();
    var outputMs  = inputms % 1000;
    var outputSec = Math.floor(inputms / 1000) % 60;
    var outputMin = Math.floor(inputms / (60*1000));

    if (outputMs < 10) {
        outputMs = "00" + outputMs.toString(10);
    } else if (outputMs < 100) {
        outputMs = "0" + outputMs.toString(10);
    } else {
        outputMs = outputMs.toString(10);
    }

    if (outputSec < 10) {
        outputSec = "0" + outputSec.toString(10);
    } else {
        outputSec = outputSec.toString(10);
    }

    if (outputMin < 10) {
        outputMin = "0" + outputMin.toString(10);
    } else {
        outputMin = outputMin.toString(10);
    }

    outputFull = outputMin + ":" + outputSec + "." + outputMs;

    return outputFull;
}
function setTimeBase()
{
    RowHilightPersist["currPOSTTable"] = 0;
    RowHilightPersist["prevPOSTTable"] = 0;
    drawTables('currPOSTTable', currTimestampsAry, currPOSTAry);
    drawTables('prevPOSTTable', prevTimestampsAry, prevPOSTAry);
    return;
}

// Should only be called as a table row mouseover.
function hilightRow()
{
    if (RowHilightPersist[this.parentElement.parentElement.id])
    {
        return;
    }

    this.className = "postcode_highlight";
    // Find all rows with the same POST code and hilight them.
    var numRows = this.parentElement.parentElement.rows.length;
    var rowSet = this.parentElement.parentElement.rows;

    for (var i = 0; i < numRows; i++) {
      if (rowSet[i].cells[CODECOL].innerHTML == this.cells[CODECOL].innerHTML) {
        rowSet[i].className = "postcode_highlight";
      }
    }

    return;
}

// Should only be called as a table row mouseout.
function clearhilightRow()
{
    if (RowHilightPersist[this.parentElement.parentElement.id])
        return;

    this.className = "postcode_unhighlight";
    // Find all rows with the same POST code and clear the hilights.
    var numRows = this.parentElement.parentElement.rows.length;
    var rowSet = this.parentElement.parentElement.rows;

    for (var i = 0; i < numRows; i++) {
      if (rowSet[i].cells[CODECOL].innerHTML == this.cells[CODECOL].innerHTML) {
        rowSet[i].className = "postcode_unhighlight";
      }
    }

    return;
}

// Clears hilighting from all rows in the table.
function rowClearAllHilight(tableName)
{
    // Find all rows with the same POST code and hilight them.
    var numRows = tableName.rows.length;
    var rowSet = tableName.rows;

    for (var i = 0; i < numRows; i++) {
      rowSet[i].className = "postcode_unhighlight";
    }

    return;
}

// Sets persistent row hilighting color.
function setPersistRowHilight(tableName, tableRow, className)
{
    tableRow.className = className ? className : "postcode_highlight";
    // Find all rows with the same POST code and hilight them.
    var numRows = tableName.rows.length;//timeCodes.length;
    var rowSet = tableName.rows;

    for (var i = 0; i < numRows; i++) {
      if (rowSet[i].cells[CODECOL].innerHTML ==
          tableRow.cells[CODECOL].innerHTML) {
        rowSet[i].className = className ? className : "postcode_highlight";
      }
    }

    return;
}

//----------------------------------------------------------------//
array.getString = function(widget, token) {
    var optBit = arguments[2];
    if ((token=="") && (token!=0))
        return " ";
    else if (widget=="")
        return "DEVERROR: String class not specified";
    // First look for string group
    if (array[widget+"_str"]!=undefined) {
        //Optional bit check
        if(optBit!=undefined && array[widget+"_str"][token][optBit]!=undefined) {
            return array[widget+"_str"][token][optBit];
        }
        else if (optBit!=undefined && array[widget+"_str"][token][optBit]==undefined) {
            return "Unknown";
        }

        if (array[widget+"_str"][token]!=undefined) {
            return array[widget+"_str"][token];
        } else {
            return DXEArray[widget+"_str"][token];
        }
    } else {
        if (top.array[widget+"_str"]!=undefined) {
            //Optional bit check
            if(optBit!=undefined && top.array[widget+"_str"][token][optBit]!=undefined)
                return top.array[widget+"_str"][token][optBit];

            if (top.array[widget+"_str"][token]!=undefined)
                return top.array[widget+"_str"][token];
        } else {
            if (array.global_str!=undefined) {
                //Optional bit check
                if(optBit!=undefined && array.global_str[token][optBit]!=undefined)
                    return array.global_str[token][optBit];

                if (array.global_str[token]!=undefined)
                    return array.global_str[token];
            }
        }
    }

    return "DEVERROR: Cannot locate string array."+widget+"_str["+token+"]"+(optBit!=undefined)?"["+optBit+"]":"";
}
