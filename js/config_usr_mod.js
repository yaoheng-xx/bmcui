/*global variable*/

"use strict";
var usr_id;
var isUID1;
var mCurrentUser = "";
var usrPage = "/page/config_usr.html";
var usr_priv;
var usr_enable;
var sysPasswordMode = "Disabled";
var totaluserCount = 0;
var modify_btn;
var cancel_btn;
var isChangePWD;
var usr_name;
var usr_pwd;
var usr_pwd_check;
var usr_priv;
var usr_enable;
window.addEventListener('load', PageInit);
var lang;
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src = "../help/" + lang_setting + "/config_usr_mod_hlp.html";

    modify_btn = document.getElementById("btn_modify");
    cancel_btn = document.getElementById("btn_cancel");
    modify_btn.value = lang.LANG_CONFUSER_MOD_MODIFY;
    cancel_btn.value = lang.LANG_CONFUSER_MOD_CANCEL;

    isChangePWD = document.getElementById("checkbox_changepwd");
    usr_name = document.getElementById("text_name");
    usr_pwd = document.getElementById("password_pwd");
    usr_pwd_check = document.getElementById("password_pwd_check");
    
    usr_priv = document.getElementById("select_priv");
    usr_enable = document.getElementById("select_enable");
    usr_pwd.disabled = true;
    usr_pwd_check.disabled = true;

    usr_id = GetVars("usr_id");
    usr_name.disabled = false;
    if(usr_id == 1)
    {
        usr_name.disabled = true;
        isUID1 = 1;
    }
    
    OutputString();
    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
    get_modify_queryUserList(usr_id, getUserList);
}

function OutputString() {
    document.getElementById("mod_caption_div").textContent = lang.LANG_CONFUSER_MOD_CAPTION;
    document.getElementById("mod_name_lbl").textContent = lang.LANG_CONFUSER_MOD_NAME;
    document.getElementById("change_pwd_lbl").textContent = lang.LANG_CONFUSER_MOD_CHANGE_PWD;
    document.getElementById("mod_pwd_lbl").textContent = lang.LANG_CONFUSER_MOD_PWD;
    document.getElementById("conf_pwd_lbl").textContent = lang.LANG_CONFUSER_MOD_CONF_PWD;
    document.getElementById("mod_priv_lbl").textContent = lang.LANG_CONFUSER_MOD_PRIV;
    document.getElementById("user_enable_lbl").textContent = lang.LANG_CONFUSER_MOD_USER_ENABLE;

    var select_priv_obj = document.getElementById("select_priv");
    if(select_priv_obj != null) {
        for(var priv_level = 4; priv_level >= 0; priv_level--) {
          if (priv_level == 1) {
            continue;
          }
            var option = document.createElement("option");
            option.value = priv_level == 2
                               ? "ReadOnly"
                               : lang["LANG_USER_PRIVILEG_" + priv_level];
            option.text = lang["LANG_USER_PRIVILEG_" + priv_level];
            if (priv_level == 0) {
              option.value = "NoAccess";
              option.text = lang.LANG_USER_PRIVILEG_F;
            }
            select_priv_obj.appendChild(option);
        }
    }

    var select_enable_obj = document.getElementById("select_enable");
    if(select_enable_obj != null) {
        for(var enable_idx = 0; enable_idx <= 2; enable_idx++) {
            var option_en = document.createElement("option");
            if(enable_idx == 0) {
                option_en.value = enable_idx.toString();
                option_en.id = "id_usr_disable";
                option_en.text = lang.LANG_CONFISER_COMMON_DISABLE;
            } else if(enable_idx == 1) {
                option_en.value = enable_idx.toString();
                option_en.id = "id_usr_enable";
                option_en.text = lang.LANG_CONFISER_COMMON_ENABLE;
            } else if(enable_idx == 2) {
                option_en.value = enable_idx.toString();
                option_en.id = "id_usr_nochange";
                option_en.text = lang.LANG_CONFISER_COMMON_UNCHANGED;
            }
            select_enable_obj.appendChild(option_en);
        }
    }
    select_enable_obj.selectedIndex = 2;//set default to unchanged
}

function passwordStatus(response) {
  Loading(false);
  if (response.readyState == 4 && response.status == 200) {
    var text = JSON.parse(response.responseText);
    if (text == null) {
      SessionTimeout();
      return;
    } else {
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
        modify_btn.onclick = PreModifyUser;
        cancel_btn.onclick = function() { location.href = usrPage; };
        queryPasswordMode();
    } else {
        add_btn.disabled = true;
        modify_btn.disabled = true;
    }
}

function fillUI()
{
    var name;

    name = usr_name.value;
    mCurrentUser = name;
    if(name != null) {
        var temp = name.replace(/ /g, "");
        if(temp.length < 1) {
            usr_name.value = "";
        }
    }

    isChangePWD.onclick = function() {
        usr_pwd.disabled = !(this.checked);
        usr_pwd_check.disabled = !(this.checked);
    }
}

var allUserNameAry = [];
function getUserList(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
        var user = JSON.parse(arg.responseText);
        //for(i = 0; i < user.length; i++)
        var no_change_elem = document.getElementById("select_enable");
        
            if (user != null) {
                // usr_name.value = (usr_id == 1) ? "anonymous" : user[i].name;
                usr_name.value = user.UserName;
                // usr_priv.value = (userPrivilegeID[user.RoleId]) ? userPrivilegeID[user.RoleId] : 15 ;
                usr_priv.value = user.RoleId;
                if(user.Enabled){
                    no_change_elem.value = "1";
                }else{
                    no_change_elem.value = "0";
                }
            }
            // allUserNameAry.push(user.UserName);
            fillUI();
    }
}

function CheckDuplicatedUserName(username) {
    var checkedUserName = username;
    var result = false;
    for (var i = 0; i < channelUserCount; i++) {
      if (checkedUserName.localeCompare(allUserNameAry.pop(i)) == 0) {
        result = true;
        break;
      }
    }
    return result;
}

function PreModifyUser()
{
    //queryUserList(getUserList);
    if (isChangePWD.checked)
    {
        if ( usr_pwd.value!= usr_pwd_check.value)
        {
            alert(lang.LANG_CONFUSER_COMMON_ERR2);
            return;
        }
        // Front End validation will check printable characters only for
        // passwords
        if (CheckPassword(usr_pwd.value, "Disabled", usr_name.value) == false) {
          alert(lang.LANG_CONFUSER_ADD_ERR3);
          return;
        }
        if (Check_Password_with_username(usr_pwd.value, usr_name.value) == false)
        {
            alert(lang.LANG_CONFUSER_ADD_ERR3);
            return;
        }
    } else {
        usr_pwd.value = "";
        usr_pwd_check.value = "";
    }

    if ( !CheckUserName(usr_name.value) )
    {
        return;
    }

    Loading(true);

    if(mCurrentUser != usr_name.value && CheckDuplicatedUserName(usr_name.value)) {
        Loading(false);
        alert(lang.LANG_CONFUSR_EXIST);
    }
    else {
        var enable_value = true;
        usr_enable.value == "0" ? enable_value = false : enable_value = true;
        writeUserInfo(Trim(usr_name.value), usr_priv.value, usr_pwd.value, enable_value, usr_id, responseWriteUserInfo);
    }
}

function responseWriteUserInfo(arg) {
    if (arg.readyState == 4 && arg.status == 200) {
        alert(lang.LANG_CONFUSER_MOD_SUCC, {title: lang.LANG_GENERAL_SUCCESS, onClose: function() {location.href = usrPage;}});
    }
}
