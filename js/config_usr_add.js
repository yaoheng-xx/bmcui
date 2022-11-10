/*global variable*/

"use strict";
var usrPage = "/page/config_usr.html";
var sysPasswordMode = "Disabled";
var add_btn;
var cancel_btn;
var usr_name;
var usr_pwd;
var usr_pwd_check;
var usr_priv;
window.addEventListener('load', PageInit);
var lang;
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src = "../help/" + lang_setting + "/config_usr_add_hlp.html";
    add_btn = document.getElementById("btn_add");
    cancel_btn = document.getElementById("btn_cancel");
    add_btn.value = lang.LANG_CONFUSER_ADD_ADD;
    cancel_btn.value = lang.LANG_CONFUSER_ADD_CANCEL;
    usr_name = document.getElementById("text_name");
    usr_pwd = document.getElementById("password_pwd");
    usr_pwd_check = document.getElementById("password_pwd_check");
    usr_priv = document.getElementById("select_priv");
    queryUserList(getUserList);
    OutputString();
    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("caption_div").textContent = lang.LANG_CONFUSER_ADD_CAPTION;
    document.getElementById("add_desc_div").textContent = lang.LANG_CONFUSER_ADD_DESC;
    document.getElementById("add_name_lbl").textContent = lang.LANG_CONFUSER_ADD_NAME;
    document.getElementById("add_pwd_lbl").textContent = lang.LANG_CONFUSER_ADD_PWD;
    document.getElementById("add_conf_pwd_lbl").textContent = lang.LANG_CONFUSER_ADD_CONF_PWD;
    document.getElementById("add_priv_lbl").textContent = lang.LANG_CONFUSER_ADD_PRIV;

    var select_priv_obj = document.getElementById("select_priv");
    if(select_priv_obj != null) {
        for(var priv_level = 4; priv_level >= 0; priv_level--) {
            if (priv_level == 1) {
                continue;
            }
            var option = document.createElement("option");
            option.text = lang["LANG_USER_PRIVILEG_" + priv_level];
            if (priv_level == 3) {
                option.value = "Operator";
            } else if (priv_level == 2) {
                option.value = "ReadOnly";
            } else if (priv_level == 4) {
                option.value = "Administrator";
            } else if (priv_level == 0) {
                option.value = "NoAccess";
                option.text = lang.LANG_USER_PRIVILEG_F;
            }
            select_priv_obj.appendChild(option);
        }
    }
}

function passwordStatus(response)
{
    Loading(false);
    if (response.readyState == 4 && response.status == 200) {
        var text = JSON.parse(response.responseText);
        if(text == null)
        {
            SessionTimeout();
            return;
        }else{
          sysPasswordMode = text.Oem.OpenBMC.PasswordPolicyComplexity == ""
                                ? "Disabled"
                                : text.Oem.OpenBMC.PasswordPolicyComplexity;
        }
    } else {
           location.href = usrPage;
    }
}

function queryPasswordMode()
{
	Loading(true);
    var ajaxUrl = "/redfish/v1/AccountService";
    var ajaxReq = new Ajax.Request(ajaxUrl, {
        method : 'GET',
        onSuccess : passwordStatus,
        onFailure : function() {
        Loading(false);
        alert("Error in Getting password mode!!");
        }
    });
}

function PrivilegeCallBack(privilege)
{
    if(privilege == '04')
    {
        add_btn.onclick = PreAddUser;
        cancel_btn.onclick = function() { location.href = usrPage; };
        queryPasswordMode();
    }
    else
    {
        add_btn.disabled = true;
        cancel_btn.disabled = true;
    }
}

function PreAddUser()
{
    queryUserList(getUserList);
    if ( !CheckUserName(usr_name.value) )
    {
        return;
    }
    if (usr_pwd.value != usr_pwd_check.value)
    {
        alert(lang.LANG_CONFUSER_COMMON_ERR2);
        return;
    }
    // Front End validation will check printable characters only for passwords
    if (CheckPassword(usr_pwd.value, "Disabled", usr_name.value) == false) {
      alert(lang.LANG_CONFUSER_ADD_ERR3);
      return;
    }

    if (Check_Password_with_username(usr_pwd.value, usr_name.value) == false)
    {
        alert(lang.LANG_CONFUSER_ADD_ERR3);
        return;
    }

    Loading(true);
    addUser();
}

var allUserNameAry = [];
function getUserList(arg)
{
    Loading(false);
    if (arg != null) {
        var user = arg;
        totaluserCount = user.length;

        var usergroup = groupBy(user, function (i) { return i.channel; });
        var result = Object.keys(usergroup).map(function (key) {
            return [usergroup[key]]; 
        }); 

        channelCount = result.length;
        channelUserCount = result[0][0].length;

        for (var i = 0; i < channelUserCount; i++) {
          allUserNameAry.push(user[i].UserName);
        }
    }
}

function CheckDuplicatedUserName(username) {
    var checkedUserName = username;
    var result = false;
    for (var i = 0; i < channelUserCount; i++) {
      // alert(allUserNameAry.pop(i));
      if (checkedUserName.localeCompare(allUserNameAry.pop(i)) == 0) {
        // alert('true');
        result = true;
        break;
      }
    }
    return result;
}

function addUser()
{
  var u_name = Trim(usr_name.value);
  var u_pwd = usr_pwd.value;
  var usr_priv = document.getElementById("select_priv");

  if (CheckDuplicatedUserName(u_name)) {
    alert(lang.LANG_CONFUSR_EXIST);
    } else { //---1230-15       
        writeUserInfo(u_name, usr_priv.value, u_pwd, 'add', '', addUserIsDone);
    }
}

function addUserIsDone(arg)
{
    if (arg != null) {
        Loading(false);
        alert(lang.LANG_CONFUSER_ADD_SUCC, {title: lang.LANG_GENERAL_SUCCESS,
            onClose: function() {location.href = usrPage;}});
    }
}
