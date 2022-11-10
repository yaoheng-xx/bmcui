"use strict";
/* SYSTEM -- DIMM Information page */

var dataTabObj;
var DIMM_COUNT = 0;
var dimm_list_info;
var dimm_list;
var lang_setting;
var lang;
var myData = [];
var totalMemberCount = 0;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src = "../help/" + lang_setting + "/sys_dimm_hlp.html";
    dimm_list = document.getElementById("dimm_list");
    dimm_list_info = document.getElementById("dimm_list_info");
    document.getElementById("dimm_caption_div").textContent = lang.LANG_SYS_DIMM_CAPTION;
    initUsrTab();

    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}
function initUsrTab()
{
    var myColumns = [
                        ["Slot Number", "10%", "center"],
                        ["Size", "10%", "center"],
                        ["Type", "10%", "center"],
                        ["Speed", "10%", "center"],
                        ["Manufacturer", "10%", "center"],
                        ["Asset Tag", "10%", "center"],
                        ["Serial Number", "20%", "center"],
                        ["Part Number", "20%", "left"]
                ];
        //replace table header content with string table
        myColumns[0][0] = lang.LANG_SYS_DIMM_COLUMN_TITLE0;
        myColumns[1][0] = lang.LANG_SYS_DIMM_COLUMN_TITLE1;
        myColumns[2][0] = lang.LANG_SYS_DIMM_COLUMN_TITLE2;
        myColumns[3][0] = lang.LANG_SYS_DIMM_COLUMN_TITLE3;
        myColumns[4][0] = lang.LANG_SYS_DIMM_COLUMN_TITLE4;
        myColumns[5][0] = lang.LANG_SYS_DIMM_COLUMN_TITLE5;
        myColumns[6][0] = lang.LANG_SYS_DIMM_COLUMN_TITLE6;
        myColumns[7][0] = lang.LANG_SYS_DIMM_COLUMN_TITLE7;
        dataTabObj = GetTableElement();
        dataTabObj.setColumns(myColumns);

        dataTabObj.init('dataTabObj',dimm_list);
}
function PrivilegeCallBack(privilege)
{
        if (privilege == '04'|| privilege == '03'|| privilege == '02'){
          getMemoryInfo();
        }
        else{
            location.href = SubMainPage;
            return;
        }
}

function getMemoryInfo() {
  Loading(true);
  var url = '/redfish/v1/Systems/system';
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(response) {
      var data = JSON.parse(response.responseText);
      if (data.hasOwnProperty("Memory")) {
        getDIMMInfoURL(data.Memory["@odata.id"]);
      } else {
        Loading(false);
      }
    },
    onFailure : function() {
      Loading(false);
      alert("Error in Getting DIMM Information!!");
    }
  });
}

function getDIMMInfoURL(url) {
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(data) {
      var response = JSON.parse(data.responseText);
      if (response.hasOwnProperty("Members")) {
        var MemberData = response.Members;
        totalMemberCount = MemberData.length;
        if (MemberData.length) {
          for (var i = 0; i < MemberData.length; i++) {
            getDIMMInfo(MemberData[i]["@odata.id"]);
          }
        } else {
          Loading(false);
        }
      }
    },
    onFailure : function() {
      Loading(false);
      alert("Error in Getting DIMM Information!!");
    }
  });
}

function getDIMMInfo(url) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : ReplyDIMMStatus,
    onFailure : function() {
      alert("Error in Getting DIMM Information!!");
      Loading(false);
      displayDimmData();
    }
  });
}
function MBtoReadble(num) {
  if (typeof (num) != 'number') {
    return "N/A";
  }
  if (num >= 1024) {
    return (num / 1024).toFixed(1) + 'GB';
  } else {
    return num + 'MB';
  }
}

function checkProperty(data, value) {
  if (data.hasOwnProperty(value)) {
    var tmp_data = data[value] == "" ? "N/A" : data[value];
    return tmp_data;
  } else {
    return "N/A";
  }
}

function ReplyDIMMStatus(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var data = JSON.parse(arg.responseText);
      myData.push([
        DIMM_COUNT + 1, data.Location.PartLocation.ServiceLabel,
        MBtoReadble(checkProperty(data, 'CapacityMiB')),
        checkProperty(data, 'MemoryDeviceType'),
        checkProperty(data, 'OperatingSpeedMhz'),
        checkProperty(data, 'Manufacturer'),
        checkProperty(data.Oem.AssetTag, 'Value'),
        checkProperty(data, 'SerialNumber'),
        checkProperty(data, 'PartNumber')
      ]);
      DIMM_COUNT++;
      displayDimmData();
    }
}

function displayDimmData() {
  totalMemberCount--;
  if (totalMemberCount == 0) {
    dataTabObj.show(myData);
    dimm_list_info.textContent =
        lang.LANG_SYS_ASSET_DIMM_CNT + DIMM_COUNT + lang.LANG_COMMON_SPACE;
  }
}
