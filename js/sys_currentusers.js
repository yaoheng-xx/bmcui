"use strict";
/* SYSTEM -- CurrentUser Information page */

var dataTabObj;
var lang_setting;
var lang;
var user_list;
var usrdata = [];

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src = "../help/" + lang_setting + "/sys_current_users_hlp.html";
    user_list = document.getElementById("user_list");

    document.getElementById("user_caption_div").textContent = lang.LANG_SYS_CURRENT_USER_CAPTION;

    initUsrTab();

    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}
function initUsrTab()
{
  var myColumns = [
    [ "User Name", "17%", "center" ], [ "Type", "17%", "center" ],
    [ "KVM In Use", "17%", "center" ],
    [ "vMedia Usable CD/HD", "17%", "center" ],
    [ "IP Address", "32%", "center" ]
  ];
  // replace table header content with string table
  myColumns[0][0] = lang.LANG_SYS_CURRENT_USER_COLUMN_TITLE0;
  myColumns[1][0] = lang.LANG_SYS_CURRENT_USER_COLUMN_TITLE1;
  myColumns[2][0] = lang.LANG_SYS_CURRENT_USER_COLUMN_TITLE2;
  myColumns[3][0] = lang.LANG_SYS_CURRENT_USER_COLUMN_TITLE3;
  myColumns[4][0] = lang.LANG_SYS_CURRENT_USER_COLUMN_TITLE4;
  dataTabObj = GetTableElement();
  dataTabObj.setColumns(myColumns);
  dataTabObj.init('dataTabObj', user_list, 'auto',
                  {tableId : "user_list_table", noSort : true});
}

function PrivilegeCallBack(privilege)
{
    if (privilege == '04') {
        getNumberofSessions();
    } else {
        location.href = SubMainPage;
        return;
    }
}

function getNumberofSessions(){
    Loading(true);
    usrdata = [];
    var ajax_url = '/redfish/v1/SessionService/Sessions';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: handleNumberofSessions,
        timeout: g_CGIRequestTimeout,
        ontimeout: onCGIRequestTimeout,
        onFailure: function() {
            Loading(false);
            alert(lang.LANG_CONF_GET_USER_FAILED);
        }
    });
}

function handleNumberofSessions(originalRequest){
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
        var response = JSON.parse(originalRequest.responseText);
        var data = response.Members;
        for(var i=0; i<data.length; i++){
            getCurUserInfo(data[i]["@odata.id"]);
        }
        var tmp_interval = setInterval(function(){
            if(data.length == usrdata.length){
                clearInterval(tmp_interval);
                getCurUserStatus(usrdata);
            }
        },1000);
    }
}

function getCurUserInfo(url)
{
    Loading(true);
    var ajax_url = url;
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: handleUserInfo,
        timeout: g_CGIRequestTimeout,
        ontimeout: onCGIRequestTimeout,
        onFailure: function() {
            Loading(false);
            alert(lang.LANG_CONF_GET_USER_FAILED);
        }
    });
}

function handleUserInfo(arg){
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
        var response = JSON.parse(arg.responseText);
        var tmpObj = {};
        tmpObj.user_name = response.UserName;
        tmpObj.session_id = response.Id;
        tmpObj.session_type = 1;
        tmpObj.client_ip = response.ClientOriginIPAddress;
        tmpObj.KVM_Activity_Status =
            response.Oem.Intel_WebSession.KvmActive == true ? 1 : 0;
        var localImage1 =
            response.Oem.Intel_WebSession.VmActive[0] == true ? 'Yes' : 'No';
        var localImage2 =
            response.Oem.Intel_WebSession.VmActive[1] == true ? 'Yes' : 'No';
        tmpObj.Media_Activity_Status = localImage1 + ' / ' + localImage2;
        usrdata.push(tmpObj);
    }
}

function getCurUserStatus(arg)
{
    Loading(false);
    if (arg) {
        var web = arg;
        var userData = [];
        var kvmData = [];
        if(web.length) {
          var UserCount = web.length; // web[0].getAttribute("TOTAL_NUMBER");
          for (var i = 0; i < UserCount; i++) {
            var webuser =
                web[i]; // webUserInfo[0].getElementsByTagName("WEB_USER" + i);
            if (webuser) {
              var name =
                  webuser.user_name; // webuser[0].getAttribute("USER_NAME");
              var session_id = webuser.session_id;

              if (webuser.session_type == 1) { // web service
                userData.push({
                  'name' : name,
                  'type' : webuser.session_type == 1 ? 'Web(HTTPS)'
                                                     : 'Web(HTTP)',
                  'kvmCnt' : webuser.KVM_Activity_Status,
                  'vmUse' : webuser.Media_Activity_Status,
                  'ip' : webuser.client_ip,
                  'webid' : webuser.user_caption_div,
                  'viewer_count' : webuser.viewer_count
                });
              } else if (webuser.session_type == 5) { // KVM service
                kvmData.push({
                  'name' : name,
                  'ip' : webuser.client_ip,
                  'VMEnable' : "No",
                  'VideoOnly' : "No",
                  'thread' : session_id,
                  'webid' : webuser.user_id,
                  'viewer_count' : webuser.viewer_count
                });
              }
            }
          }
        }
        var allData = [];
        var dataCnt = 1;
        userData.forEach(function(user) {
            var webCnt = dataCnt++;
            var kvmCnt;
            kvmCnt = user.kvmCnt;
            allData.push([parseInt(webCnt), user.name, user.type, kvmCnt, user.vmUse, user.ip]);
        });
        dataTabObj.show(allData);
    }
}

function initKVMTab(hidden)
{
    var var_testTable = document.getElementById("user_list_table");
    var rows = var_testTable.querySelectorAll('tr');

    for(var i=1; i<rows.length; i++) {
        var cells = rows[i].querySelectorAll('td');
        if(cells[1].innerText.trim().substr(0, 3) == 'KVM' && cells[0].innerText.trim() == '-') {
            if(hidden) {
                rows[i].style.display = "none";
            } else {
                rows[i].style.display = "";
            }
        }
    }
}

function foldKVMTab(row, id)
{
    var var_testTable = document.getElementById("user_list_table");
    var rows = var_testTable.querySelectorAll('tr');
    var tabshow = document.getElementById(id);
    var hidden;
    if(/-/g.test(tabshow.innerText)) { // test if word is '-'
        tabshow.innerText = tabshow.innerText.replace('-', '+'); // replace '-' with '+'
        hidden = true;
    } else {
        tabshow.innerText = tabshow.innerText.replace('+', '-'); // replace '+' with '-'
        hidden = false;
    }

    for(var i=row+1; i<rows.length; i++) {
        var cells = rows[i].querySelectorAll('td');
        if(cells[1].innerText.trim().substr(0, 3) != 'KVM' || cells[0].innerText.trim() != '-') {
            break;
        }
        if(hidden) {
            rows[i].style.display = "none";
        } else {
            rows[i].style.display = "";
        }
    }
}

function setInputDisabled(disabled)
{
    var inputs = document.getElementsByTagName("INPUT");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = disabled;
    }
}
