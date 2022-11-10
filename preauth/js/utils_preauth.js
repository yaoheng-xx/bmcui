document.writeln('<script src="../../preauth/js/prototype.js"></script>');
document.writeln('<script src="../../preauth/js/flot/jquery.min.js"></script>');
document.writeln('<link rel="stylesheet" href="../../preauth/css/jquery-ui/jquery-ui.min.css">');
document.writeln('<script src="../../preauth/js/flot/jquery-ui.min.js"></script>');
"use strict";
var lang_setting;

function Trim(str)
{
    return str.replace(/^\s+|\s+$/g,"");
}

lang_setting = ReadCookie("language");
if (lang_setting == null)
{
    CreateCookie("langSetFlag","0");
    CreateCookie("language","English");
    lang_setting = "English";
} else {
    if(lang_setting == "English") {
        lang_setting = "English";
    } else {
        lang_setting = "S_Chinese";
    }
}
document.write("<script type=\"text/javascript\", src = \"/preauth/js/lang/" + lang_setting + "/lang_str.js\"><\/script>");


// save original alert
window.nativeAlert = window.alert;

// used for open many dialog boxes at the same time
var global_dynamic_id = 0;

// replace alert with function{}
window.alert = function(msg, params) {
    var myid = global_dynamic_id++;
    var mydialog = document.createElement("div");
    var myclass = (params && params.dialogClass ? params.dialogClass : 'ui-dialog');
    mydialog.setAttribute("id", "dynamic_dialog" + myid);
    if (params && params.type == "pre") {
        mydialog.style.whiteSpace = "pre";
    }
    mydialog.title = params && params.title ? params.title : lang_preauth.LANGPA_COMMON_CAUTION;
    mydialog.textContent = msg;
    document.body.appendChild(mydialog);

    jQuery("#dynamic_dialog" + myid).dialog({
        autoOpen: false,
        modal: true, // other items on the page will be disabled
        show: { effect: "fold", duration: 600 },
        hide: { effect: "fold", duration: 600 },
        dialogClass: myclass,
        close: function( event, ui ) {
            if(params && params.onClose) params.onClose(params.onCloseParams);
            jQuery("#dynamic_dialog" + myid).dialog("destroy");
            mydialog.parentNode.removeChild(mydialog);
        },
        buttons: {} // init it, don't remove
    });
    jQuery("#dynamic_dialog" + myid).dialog("open");
};

/* Handle  cookies API */
function CreateCookie(name, value)
{
    top.document.cookie = "__Host-"+name+"="+value+"; path=/; secure; SameSite=strict";
}

/* Clear Session Cookie */
function getcookieval(offset)
{
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr == -1)
        endstr = document.cookie.length;
    return unescape(document.cookie.substring(offset, endstr));
}

function ReadCookie(name, csrf_flag) // getcookie(name)
{
    var arg;
    if(csrf_flag){
        arg = name + "=";
    }else{
        arg = "__Host-" + name + "=";
    }
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen)
    {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg)
            return getcookieval(j);
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break;
    }
    return null;
}

function EraseCookie(name, Ecsrf_flag) // deletecookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1); // expire immediately
    var cval = ReadCookie(name);
    if(Ecsrf_flag){
        if(cval != null) document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString() + "; path=/;secure; SameSite=None";
    }else{
        if(cval != null) document.cookie = "__Host-" + name + "=" + cval + "; expires=" + exp.toGMTString() + "; path=/;secure; SameSite=strict";
    }
    return;
}

function onLogout(originalRequest) {
    clearSessionInfo();
    location.href = "/";
}

function goLogout(onCompleteCallback) {
    var CSRFTOKEN = getCSRFToken();
    var ajax_url ='/logout';
    var host_url = '';
    jQuery.ajax({
      url : host_url + ajax_url,
      headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
      type : "POST",
      dataType : "json",
      data : [],
      success : function(data, status, xhr) {
        clearSessionInfo();
        location.href = "/";
      },
      error : function(data, status, xhr) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          alert(lang_preauth.LANGPA_LOGIN_SESSION_INVALID);
        }
      }
    });
}

function onLoginFailedClose()
{
    session_timeout_reason = 0;
    location.href = "/";
}

/*handle seesion timoue API */
function SessionTimeout()
{
    EraseCookie("currentUID");
    EraseCookie("Authenticated");
    if(typeof SessionTimeout.record == 'undefined')
    {
        SessionTimeout.record = 0;
    }

    if(SessionTimeout.record == 0)
    {
        ++SessionTimeout.record;

        /* Add your session timeout reason into switch case */
        switch (session_timeout_reason)
        {
            case 0: /* reason 0: BMC returns a null XML file */
                //alert(lang_preauth.LANGPA_NULLXML_SESSION_TIMEOUT, {onClose: onLoginFailedClose});
                break;
            case 1: /* reason 1: Generic session timeout reason */
                // alert(lang_preauth.LANGPA_COMMON_SESSION_TIMEOUT, {onClose: onLoginFailedClose});
                break;
            case 2: /* reason 2: BMC block-out */
                alert(lang_preauth.LANGPA_COMMON_SESSION_BLOCKOUT, {onClose: onLoginFailedClose});
                break;
            case 3: /* reason 2: BMC block-out */
                alert(lang_preauth.LANGPA_COMMON_SESSION_OVERNUM, {onClose: onLoginFailedClose});
                break;
            case 4: /* reason 4: BMC authentication fail */
                alert(lang_preauth.LANGPA_LOGIN_SESSION_INVALID, {onClose: onLoginFailedClose});
                break;
            case 5: /* reason 5: no privileges to login the web server */
                // logout first to kill the session.
                goLogout(onLoginNoPriv);
                break;
            default:
                //alert(lang_preauth.LANGPA_COMMON_SESSION_TIMEOUT, {onClose: onLoginFailedClose});
                break;
        }
    }
}

function onLoginNoPriv()
{
    alert(lang_preauth.LANGPA_LOGIN_SESSION_NO_PRIV, {onClose: function() {
        onLoginFailedClose();
    }});
}
