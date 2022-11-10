"use strict";
if (window != top)
    top.location.href = "/";//location.href;

window.addEventListener('load', PageInit);

var redfish_data="";


/* If user already login and open a new web page, use this to redirect
   it to the main page before check. It will check there if the
   session is invalid. */
var loginFast = 1;
var cookieAttmptCnt =  ReadCookie("LoginFast");
var userid_val = "";
if(cookieAttmptCnt)
    loginFast = parseInt(cookieAttmptCnt);

if(ReadCookie("Authenticated") && loginFast) {
    // fast login mode: when already authenticated.
    CreateCookie("LoginFast", 0); // if fast login failed next time use slow login
    top.location.href = "/page/mainmenu.html";
}
else {
    EraseCookie("LoginFast");
}

EraseCookie("currentUID");

function checkform()
{
    form1.encodedpwd.value = btoa(form1.pwd.value);
    if(ReadCookie("Authenticated") && loginFast) {
        // fast login mode: when already authenticated.
        CreateCookie("LoginFast", 0); // if fast login failed next time use slow login
        top.location.href = "/page/mainmenu.html";
    }
    else {
        if(Trim(form1.name.value) == "")
        {
            alert(lang_preauth.LANGPA_LOGIN_INVALID_USERNAME);
            form1.name.focus();
            return;
        }
        if(Trim(form1.pwd.value) == "")
        {
            alert(lang_preauth.LANGPA_LOGIN_INVALID_PASSWORD);
            form1.pwd.focus();
            return;
        }
        var host_url = "";
        userid_val = form1.name.value;
        var login_data={};
        var ajax_url = "/login";
        var object = [];
        object.push(form1.name.value);
        object.push(form1.pwd.value);
        login_data.data = object;
        document.getElementById("loginbtn").disabled = true;
        $.ajax({
            url: host_url+ajax_url,
            type: "POST",
            dataType: "json",
            data: JSON.stringify(login_data),
            contentType: "application/json; charset=UTF-8",
            success: function(data, status, xhr) {
                var res = {};
                res.data = data;
                res.data = status;
                res.xhr = xhr;
                loginRes(res);
            },
            error: function(data, status, xhr) {
                document.getElementById("loginbtn").disabled = false;
                alert(lang_preauth.LANGPA_LOGIN_SESSION_INVALID);
            }
        });
    }
    return;
}



function loginRes(arg) {
    var CSRF_TOKEN = ReadCookie("XSRF-TOKEN", true);
    var user_get = JSON.parse(arg.xhr.responseText);
    var user_name = user_get.data.split("'")[1];


    if (arg.xhr.readyState == 4 && arg.xhr.status == 200) {
      var res = JSON.parse(arg.xhr.responseText);
      if (res.ok == 33) {
        //         document.getElementById("loginbtn").disabled = false;
        //         alert(lang_preauth.LANGPA_COMMON_SESSION_BLOCKOUT);
        }else{
            sessionStorage.clear();
            localStorage.clear();
            CreateCookie("currentUID", user_name);

            // Verifying No Access Privilege
            var CurrentUID = ReadCookie("currentUID");
            CSRF_TOKEN = ReadCookie("XSRF-TOKEN", true);
            var ajax_url = '/redfish/v1/AccountService/Actions/Oem/AccountService.GetCurrentUserRole';
            if (!CurrentUID) {
                clearSessionInfo();
                location.href = "/page/login.html";
                return;
            }
            var data = { "Oem": { "OpenBMC": { "LoginUser": CurrentUID } } };
            $.ajax({
                url: ajax_url,
                headers: {
                    'X-XSRF-TOKEN': CSRF_TOKEN
                },
                type: "POST",
                dataType: "json",
                data: JSON.stringify(data),
                contentType: "application/json; charset=UTF-8",
                success: function (data, status, xhr) {
                    location.href = "/page/mainmenu.html";
                },
                error: function (data, status, xhr) {
                    document.getElementById("loginbtn").disabled = false;
                    alert(lang_preauth.LANGPA_LOGIN_SESSION_INVALID);
                    return;
                }
            });
        }
    }
}

function checkEnt(e)
{
    var key = window.event ? e.keyCode : e.which;
    if(key == 13)
    {
        checkform();
    }
}
function PageInit()
{
    document.getElementById("language_choice").addEventListener("change", language_Change);
    document.getElementById("loginbtn").addEventListener("click", checkform);
    document.getElementById("username").addEventListener("keydown", checkEnt);
    document.getElementById("userpwd").addEventListener("keydown", checkEnt);

    //return;
    lang_setting = ReadCookie("language");
    if(lang_setting=='English') {
        document.getElementById("language_choice").value = "en";
    } else {
        //document.getElementById("language_choice").value = "jp";
        document.getElementById("language_choice").value = "cn";
    }
    document.getElementById("loginbtn").value = lang_preauth.LANGPA_LOGIN_LOGIN;
    OutputString();

    var available_sessions = ReadCookie("AVAILABLE_SESSION");
    EraseCookie("AVAILABLE_SESSION");
    if(available_sessions != null) {
        var avail_sess = 0;
        try {
            avail_sess = parseInt(available_sessions);
        }
        catch (Error) {
        }
        if(avail_sess < 1) {
            alert(lang_preauth.LANGPA_COMMON_SESSION_OVERNUM);
        }
    }
}

function OutputString() {
    document.getElementById("login_prompt_td").textContent = lang_preauth.LANGPA_LOGIN_PROMPT;
    document.getElementById("username_td").textContent = lang_preauth.LANGPA_LOGIN_USERNAME;
    document.getElementById("password_td").textContent = lang_preauth.LANGPA_LOGIN_PASSWORD;
    document.getElementById("language_td").textContent = lang_preauth.LANGPA_LOGIN_LANGUAGE;
}
function language_Change()
{
    if(document.getElementById("language_choice").value == "en")
    {
        CreateCookie("langSetFlag","0");
        CreateCookie("language","English");
        lang_setting = "English";
    }else{
        CreateCookie("langSetFlag","1");
        //CreateCookie("language","Japanese");
        //lang_setting = "Japanese";
        CreateCookie("language","Chinese");
        lang_setting = "S_Chinese";
    }

    location.reload();
}
