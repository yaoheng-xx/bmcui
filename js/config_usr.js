/*
   global variables
*/
"use strict";
var dataTabObj;
var aryusername = new Array();
var aryUserAccess = new Array();
var aryUserEnable = new Array();
var usrPage = "/page/config_usr.html";
var usrAddPage = "/page/config_usr_add.html";
var usrModPage = "/page/config_usr_mod.html";
var g_actions_disabled_by_priv = false;
var add_user;
var modify_user;
var del_user;
var user_list;
var user_list_info;
window.addEventListener('load', PageInit);
var lang;
if (parent.lang) { lang = parent.lang; }
function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src = "../help/" + lang_setting + "/config_usr_hlp.html";
    add_user = document.getElementById("btn_add");
    modify_user = document.getElementById("btn_modify");
    del_user = document.getElementById("btn_del");
    user_list = document.getElementById("div_user_list");
    user_list_info = document.getElementById("text_user_list_info");
    add_user.value = lang.LANG_CONFUSR_ADD;
    modify_user.value = lang.LANG_CONFUSR_MOD;
    del_user.value = lang.LANG_CONFUSR_DEL;
    document.getElementById("caption_div").textContent = lang.LANG_CONFUSER_CAPTION;
    initUsrTab();
    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}

function initUsrTab()
{
    var myColumns = [
        ["User ID", "25%", "center"],
        ["User Name", "25%", "center"],
        ["User Status", "25%", "center"],
        ["Network Privilege", "25%", "center"]
    ];
    //replace table header content with string table
    myColumns[0][0] = lang.LANG_CONFUSER_TITLE_USERID;
    myColumns[1][0] = lang.LANG_CONFUSER_TITLE_USERNAME;
    myColumns[2][0] = lang.LANG_CONFUSER_TITLE_USERSTATUS;
    myColumns[3][0] = lang.LANG_CONFUSER_TITLE_USERNETPRIV;
    var userListTable = document.getElementById("div_user_list");
    removeChilds(userListTable);//clear list content.
    SetRowSelectEnable(1);
    dataTabObj = GetTableElement();
    dataTabObj.setColumns(myColumns);

    dataTabObj.init('dataTabObj',user_list);
    user_list.onclick = onClickUserList;
}

function PrivilegeCallBack(privilege)
{
    if(privilege == '04')
    {
        add_user.onclick = addUsr;
        modify_user.onclick = modifyUsr;
        del_user.onclick = delUsr;
        queryUserList(updateUserList);
        g_actions_disabled_by_priv = false;
    }
    else if(privilege == '03')
    {
        g_actions_disabled_by_priv = true;
        add_user.disabled = g_actions_disabled_by_priv;
        del_user.disabled = g_actions_disabled_by_priv;
        modify_user.disabled = g_actions_disabled_by_priv;
        queryUserList(updateUserList);
        //alert(lang.LANG_COMMON_CANNOT_MODIFY);
    }
    else
    {
        location.href = SubMainPage;
        return;
    }
}

function onClickUserList() {
    if(GetSelectedRow() != null) {
        var sel_index = parseInt(GetSelectedRowCellInnerHTML(0));
        var currentUID = ReadCookie("currentUID");
        var username = '~';
        if (sel_index) {
          username = GetSelectedRowCellInnerHTML(1);
        }
        if (username == currentUID || username == 'root') {
          del_user.disabled = true;
          modify_user.disabled = true;
        } else {
          del_user.disabled = g_actions_disabled_by_priv;
          modify_user.disabled = g_actions_disabled_by_priv;
        }

        if (CheckEmptyUserName(username) == false || username == 'root') {
          add_user.disabled = true;
        } else {
          add_user.disabled = g_actions_disabled_by_priv;
        }
    }
}

function addUsr()
{
    if(GetSelectedRow() == null){
        alert(lang.LANG_CONFUSR_ERR1);
    }
    else {
      var sel_index = parseInt(GetSelectedRowCellInnerHTML(0));
      var sel_name = GetSelectedRowCellInnerHTML(1);
      if (CheckEmptyUserName(sel_name) == false || sel_index == 1) {
        add_user.disabled = true;
        } else {
          add_user.disabled = g_actions_disabled_by_priv;
          var parameters = "?usr_id=" + sel_name;
          location.href = usrAddPage + parameters;
        }
    }
}

function checkUnconfiguredUserName(username) {
    var result = false;
    if(username != null && username.length > 0) {
        if(username == "~") {
            result = true;
        }
    }
    return result;
}

function modifyUsr()
{
    if(GetSelectedRow() == null){
        alert(lang.LANG_CONFUSR_ERR4);
    } else {
      var sel_name = GetSelectedRowCellInnerHTML(1);
      var parameters;
      if (checkUnconfiguredUserName(sel_name) == false) {
        parameters = "?usr_id=" + sel_name;
        location.href = usrModPage + parameters;
        } else {
          UtilsConfirm(lang.LANG_COMMON_ADD_USER, {
            onOk : function() {
              parameters = "?usr_id=" + sel_name;
              location.href = usrAddPage + parameters;
            }
          });
        }
    }
}

function delUsr()
{
    var UID = 0;
    if(GetSelectedRow() == null){
        alert(lang.LANG_CONFUSR_ERR5);
    }
    else {
      var delUID = parseInt(GetSelectedRowCellInnerHTML(0));
      var sel_index = parseInt(GetSelectedRowCellInnerHTML(0));
      if ((sel_index == null || sel_index == undefined)) {
        alert(lang.LANG_CONFUSR_ERR7);
        }
        else {
          var username = GetSelectedRowCellInnerHTML(1);
          var sel_name;
          if (username == "~" || CheckEmptyUserName(username) == true) {
            alert(lang.LANG_CONFUSR_ERR7);
            }
            else {
                var currentUID = ReadCookie("currentUID");
                sel_name = GetSelectedRowCellInnerHTML(1);
                if(sel_name == currentUID) {
                    alert(lang.LANG_CONFUSR_ERR9);
                }
                else {
                    UtilsConfirm(lang.LANG_CONFUSR_ERR8, {
                        onOk: function() {
                            Loading(true);
                            sel_name = GetSelectedRowCellInnerHTML(1);
                            requestDelUser(sel_name, delUserIsDone);
                        }
                    });
                }
            }
        }
    }
}

function delUserIsDone(arg)
{
    Loading(false);
    if (arg != null) {
      alert(lang.LANG_COMMON_DEL_USER, {
        title : lang.LANG_GENERAL_SUCCESS,
        onClose : function() { location.href = usrPage; }
      });
    }
}

function updateUserList(arg)
{
    Loading(false);
    // if (arg.xhr.readyState == 4 && arg.xhr.status == 200) {
    if(arg != null){
        var user = arg;

        totaluserCount = user.length;

        var usergroup = groupBy(user, function (i) { return i.channel; });
        var result = Object.keys(usergroup).map(function (key) {
            return [usergroup[key]]; 
        }); 

        channelCount = result.length;
        channelUserCount = result[0][0].length;

        var configed_users = 0;

        for (var i = 0; i < channelUserCount; i++) {
          if (user[i]) {
            aryusername[i] = user[i].UserName; // user[i].getAttribute("NAME");
            configed_users++;
          }
          aryUserEnable[i] = user[i].Enabled; // user[i].getAttribute("STATUS");
          aryUserAccess[i] = (userPrivilegeID[user[i].RoleId])
                                 ? userPrivilegeID[user[i].RoleId]
                                 : 15; // user[i].getAttribute("USER_ACCESS");
        }
        var myData = [];
        var user_enable;
        var user_access;
        for (var i = 0; i < channelUserCount; i++) {
          var user_name = aryusername[i];
          if (user_name == "~") {
            user_enable = "~";
            user_access = "~";
          } else {
            if (aryUserEnable[i] == "0") {
              user_enable = lang.LANG_CONFUSER_STATUS_DISABLE;
            } else {
              user_enable = lang.LANG_CONFUSER_STATUS_ENABLE;
            }

            user_access = GetPrivilegeStr(aryUserAccess[i]);
          }
          myData.push(
              [ i + 1, user[i].Id, user_name, user_enable, user_access ]);
        }
        dataTabObj.show(myData);

        user_list_info.textContent = lang.LANG_CONFUSR_COUNT + (configed_users-1) + lang.LANG_COMMON_SPACE;
    }
}

function GetPrivilegeStr(priv)
{
    return lang["LANG_USER_PRIVILEG_" + IntegerToHexString(priv)];
}

function geneXML(user_cnt, uid, name, privilege, status, password) {
    var result = "";
    return result;
}
