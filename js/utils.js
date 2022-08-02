var PRIVILEGE_LIMIT;
var gSessionTimeout = null;
var SubMainPage = "/page/privilege_alert.html";
var gCSRFCallbackFunc = null;
var gSessionCheckPendingCount = 0;
var gSessionResetPendingCount = 0;
var g_heartbeat_interval = 1000 * 10; // 10 sec
var g_callback = null;
var license_error_code = 15003;
var g_CGIRequestTimeout = 30000;// set request timeout in 30 sec default.

var browser_ie = (((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0))?true:false);
var session_timeout_reason = 0;

document.writeln('<script src="../js/prototype.js"></script>');
document.writeln('<script src="../js/utils_preauth.js"></script>');

if (!lang && parent.lang) {
  var lang = parent.lang;
}

// use this function to substitute native confirm
function UtilsConfirm(msg, params) {
    UtilsConfirmInternal(msg, lang.LANG_COMMON_OK, lang.LANG_COMMON_CANCEL, params);
};

// use this function to substitute native confirm
function UtilsConfirmInternal(msg, textOK, textCancel, params) {
    var myid = global_dynamic_id++;
    var mydialog = document.createElement("div");
    mydialog.setAttribute("id", "dynamic_dialog" + myid);
    mydialog.title = params && params.title ? params.title : lang.LANG_COMMON_CONFIRM;
    mydialog.textContent = msg;
    document.body.appendChild(mydialog);

    jQuery("#dynamic_dialog" + myid).dialog({
        autoOpen: false,
        modal: true, // other items on the page will be disabled
        show: { effect: "fold", duration: 600 },
        hide: { effect: "fold", duration: 600 },
        close: function( event, ui ) {
            if(params && params.onClose) params.onClose(params.onCloseParams);
            jQuery("#dynamic_dialog" + myid).dialog("destroy");
            mydialog.parentNode.removeChild(mydialog);
        },
        buttons:[
            {
                text: textCancel,
                click: function() {
                    if(params && params.onCancel) params.onCancel(params.onCancelParams);
                    jQuery("#dynamic_dialog" + myid).dialog("close");
                }
            },
            {
                text: textOK,
                click: function() {
                    if(params && params.onOk) params.onOk(params.onOkParams);
                    jQuery("#dynamic_dialog" + myid).dialog("close");
                }
            }
        ],
    });
    jQuery("#dynamic_dialog" + myid).dialog("open");
};


/*handle all XML document API due to  browser compatibility */
function GetResponseXML(response)
{
    if(response.length == 0 ||
      (response.charAt(0) == '<' &&
      (response.charAt(1) == 'H' || response.charAt(1) =='h') &&
      (response.charAt(2) == 'T' || response.charAt(2) == 't') &&
      (response.charAt(3) == 'M' || response.charAt(3) == 'm') &&
      (response.charAt(4) == 'L' || response.charAt(4) == 'l') &&
      response.charAt(5) == '>'))
    {
        //session_timeout_reason = 1;
        //SessionTimeout();
        return;
    }
    if (window.ActiveXObject){ //ie
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async="false";
        xmlDoc.loadXML(response);
    }
    else if (window.XMLHttpRequest) {//Firefox or Safari
        parser=new DOMParser();
        xmlDoc=parser.parseFromString(response,"text/xml");
    }

    if(xmlDoc.childNodes[0].nodeName == 'HTML' ||
       xmlDoc.childNodes[0].nodeName == 'html')
    {
        session_timeout_reason = 1;
        xmlDoc = null;
    }
    return xmlDoc;
}

function onPrivilegeFailedClose()
{
    location.href = location;
}

function validateNumeric(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    var keyCode = parseInt(key);
    //Keycode -> 8:backspace; 9:tab; 37:Left arrow; 39:Right arrow; 46:Delete
    //keycode (96~105) numeric-key-pad.
    if(keyCode == 8 || keyCode == 9 || keyCode == 37 || keyCode == 39 || keyCode == 46 ||
       (keyCode >= 96 && keyCode <= 105)) {
        //console.log("keyCode:" + keyCode);
        return;
    }

    key = String.fromCharCode( key );
    var regex = /[0-9]|\.\s/;
    if( !regex.test(key) ) {
        theEvent.returnValue = false;
        if(theEvent.preventDefault) theEvent.preventDefault();
    }
}

function ValidateSessResp(originalRequest)
{
    if (originalRequest.readyState == 4 && originalRequest.status == 200){
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc = GetResponseXML(response);
        if(xmldoc == null)
        {
            SessionTimeout();
            return;
        }
        var IPMI=xmldoc.documentElement;//point to IPMI
        SESSION=IPMI.getElementsByTagName('SESSION');//point to SENSOR_INFO
        STATE = SESSION[0].getElementsByTagName('STATE');
        var state = parseInt(STATE[0].getAttribute("CODE"), 10);
        if(state == 0) {
            SessionTimeout();
        }
    }
}

/*Lauch Java application*/
function GetJNLPRequest (ButtonObj, Flag)
{
    // check if current JRE version is greater than 1.6.0
    // 0910-2015: heck method nerver verifyed, ignore it.
    /*if (deployJava.versionCheck('1.6.0_10+') == false) {
        userInput = confirm("You need the latest Java(TM) Runtime Environment. Would you like to update now?");
        if (userInput == true) {
            // Set deployJava.returnPage to make sure user comes back to
            // your web site after installing the JRE
            deployJava.returnPage = location.href;
            // install latest JRE or redirect user to another page to get JRE from.
            deployJava.installLatestJRE();
        }
    }*/

    var host_url = location.host;
    var host_addr = location.hostname;


    if (Flag == 0)
    {
        var JnlpURL = window.location.protocol+"//" + host_url + "/jnlp"
                        + "&url_type=jwsk" + "&lang_setting=" + lang_setting
                        + "&host_addr=" + host_addr;
    }
    else
    {
        var JnlpURL = window.location.protocol+"//" + host_url + "/jnlp"
                        + "&url_type=jwss"+ "&lang_setting=" + lang_setting
                        + "&host_addr=" + host_addr;
    }

    ButtonObj.disabled=false;
    ButtonObj.onclick=function()
    {
        deployJava.launch(JnlpURL);
    }
}

/*show loading string on web*/
function Loading(enable, text) {
    var showText = "";

    document.getElementById("loading").setAttribute("class", "LoadingStyle");
    if(enable) {
        if(text == null || text.length < 1) {
            document.getElementById("loading").textContent = 'L O A D I N G ...';
        } else {
            document.getElementById("loading").textContent = text;
        }
    }
    else {
        document.getElementById("loading").textContent = "";
    }
}
/*show wait.gif */
function showWait(enable, text)
{
    var img = document.createElement('IMG');

    if ( (text==undefined)||(text=="") ) {
        text= "";
    }
    if(enable) {
        img.setAttribute('height', 10);
        img.setAttribute('src', '../images/wait.gif');
        img.setAttribute('id', 'waitimg');
        img.style.position = 'relative';
        img.style.top = '1px';
        document.getElementById("wait").textContent = text + "&nbsp";
        document.getElementById("wait").appendChild(img);
    } else {
        var d_img = document.getElementById("waitimg");
        document.getElementById("wait").removeChild(d_img);

        // Removing all children from an element
        /*var element = document.getElementById("wait");
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }*/
    }
}

function onCGIRequestTimeout() {
    Loading(true, lang.LANG_COMMON_REQUEST_TIMEOUT);
}

function CheckWord(txt) //the txt only exists letter and number.
{
    re = /\W/;
    if (re.test(txt))
        return false;
    else
        return true;
}
/*Check the path for virtual media webpage */
function CheckPath(txt)
{
    var path = txt;
    var filter = /^\\[a-zA-Z0-9_\$\.\- ]+\\([a-zA-Z0-9_\$\.\- ]+\\*)+(\.[iI][sS][oO]){1}$/;

    if(filter.test(path))
        return true;
    else

        return false;
}
/*check domain name*/
function CheckDomainName(e)
{
    var filter =  /^(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;
    var v = new String(e);

    if ( v.match( (filter) ) )
    {
        return true;
    }
    delete v;

    return false;
}
/*check E-mail address*/
function CheckEMAIL(e)
{
    var filter =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;
    var v = new String(e);

    if ( v.match( (filter) ) )
    {
        return true;
    }
    delete v;

    return false;
}
function shouldContainUpperCase(val) {
  if (/([A-Z])/g.test(val)) {
    return true;
  }
  return false;
}
function shouldContainLowerCase(val) {
  if (/([a-z])/g.test(val)) {
    return true;
  }
  return false;
}
function shouldContainNumber(val) {
  if (/[0-9]/g.test(val)) {
    return true;
  }
  return false;
}
function shouldNotContainSpace(val) {
  if (!(/\s/.test(val))) {
    return true;
  }
  return false;
}
function shouldContainSpecialCharacter(val) {
  if (/([!@#\$%\^\&*\)\(\]\[\}\{+=.,?:;_-])/g.test(val)) {
    return true;
  }
  return false;
}
function checkPasswordLength(val, len) {
  if (val.length >= len) {
    return true;
  }
  return false;
}
function checkUserNameInPassword(pwd, uName) {
  var passwordValue = pwd.toLocaleLowerCase();
  var userNameValue = uName.toLocaleLowerCase();
  if (passwordValue.indexOf(userNameValue) == -1) {
    return true;
  }
  return false;
}
function checkUserNameInPasswordReverse(pwd, uName) {
  var passwordValue = pwd.toLocaleLowerCase();
  var userNameValue = uName.toLocaleLowerCase();
  var reverseUsernameValue = userNameValue.split("").reverse().join("");
  if (passwordValue.indexOf(reverseUsernameValue) == -1) {
    return true;
  }
  return false;
}
function shouldNotContainContinuousThree(val) {
  if (!(/([a-zA-Z0-9])\1\1+|(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)+/ig
            .test(val))) {
    return true;
  }
  return false;
}
/*check the user password*/
function CheckPassword(pw, mode, usrName) {
  if (mode == "Disabled") {
    // Space at the beginning is not allowed.
    if (/^(?=.*[\w\d]).+/.test(pw) && pw.charAt(0) != ' ') {
      return true;
    }
    return false;
  }
  if (mode == "Low") {
    if (
        shouldContainUpperCase(pw) &&        // should contain upper case
        shouldContainLowerCase(pw) &&        // should contain lower case
        shouldContainNumber(pw) &&           // should contain number
        shouldNotContainSpace(pw) &&         // should not contain space
        shouldContainSpecialCharacter(pw) && // should contain special character
        checkPasswordLength(pw, 6) &&        // minium of 6 characters
        checkUserNameInPassword(pw, usrName) && // check user name in password
        checkUserNameInPasswordReverse(pw,
                                       usrName) // check user name in reverse
    ) {
      return true;
    }
    return false;
  }
  if (mode == "Medium") {
    if (shouldContainUpperCase(pw) && shouldContainLowerCase(pw) &&
        shouldContainNumber(pw) &&
        ( // should contain special character or space
            !shouldNotContainSpace(pw) || shouldContainSpecialCharacter(pw)) &&
        checkPasswordLength(pw, 8) && checkUserNameInPassword(pw, usrName) &&
        checkUserNameInPasswordReverse(pw, usrName)) {
      return true;
    }
    return false;
  }
  if (mode == "High") {
    if (shouldContainUpperCase(pw) && // should contain upper case
        shouldContainLowerCase(pw) && // should contain lower case
        shouldContainNumber(pw) &&    // should contain number
        shouldNotContainSpace(pw) &&  // should not contain space
        shouldNotContainContinuousThree(
            pw) && // should not contains continuous digits longer than 3
                   // characters - should not contains continuous alphabets
                   // longer than 3 characters
        shouldContainSpecialCharacter(pw) && // should contain special character
        checkPasswordLength(pw, 8) && // should contain minium of 8 characters
        checkUserNameInPassword(pw, usrName) &&
        checkUserNameInPasswordReverse(pw, usrName)) {
      return true;
    }
    return false;
  }
}

function Check_Password_with_username(pwd, usrname){
    var uname_reverse = usrname.split("").reverse().join("");
    if(pwd == usrname){
        return false;
    }
    if(pwd == uname_reverse){
        return false;
    }
}
function islower(ch) {
    if( (ch >= "a") && (ch <= "z") )
        return true;
    else
        return false;
}
function isupper(ch) {
    if( (ch >= "A") && (ch <= "Z") )
        return true;
    else
        return false;
}
function isalphachk(ch) {
    if( islower(ch) || isupper(ch) )
        return true;
    else
        return false;
}
function isnumchk(ch) {
    if( (ch >= "0") && (ch <= "9") )
        return true;
    else
        return false;
}
function isspecialchk(ch) {
    if( ch == "_" )
        return true;
    else
        return false;
}
function firstcharvalid(ch) {
    if( isalphachk(ch) || isnumchk(ch) || isspecialchk(ch) )
        return true;
    else
        return false;
}
/*check the user name*/
function CheckUserName(name)
{
    if( name.length < 1 )
    {
        alert(lang.LANG_CONFUSER_ADD_ERR1);
        return false;
    }
    if( name.length > 64 )
    {
        alert(lang.LANG_CONFUSER_ADD_USR_TOO_LONG);
        return false;
    }
    if( !firstcharvalid(name.charAt(0)) )
    {
        alert(lang.LANG_CONFUSER_NAME_RULE_INFO);
        return false;
    }
    var name1 = new String(name);
    var SpeficCharFilter = /([^a-zA-Z0-9_\-\.])/;
    if( name1.match(SpeficCharFilter) )
    {
        alert(lang.LANG_CONFUSER_NAME_RULE_INFO);
        return false;
    }
    else
    {
        return true;
    }
}
/*check illegal char*/
function CheckSpeficChar(str)
{
    var str1 = new String(str);
    var SpeficCharFilter = /([,;&"<>\\=$#*!@~`%^])/;
    if( str1.match(SpeficCharFilter) )
    {
        return false;
    }
    else
    {
        return true;
    }
}
/*check ad domain name char*/
function CheckADDomainName(str) {
  var str1 = new String(str);
  var domainRegx =
      /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))|(^\s*((?=.{1,255}$)(?=.*[A-Za-z]._*)[0-9A-Za-z](?:(?:[0-9A-Za-z_]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z_](?:(?:[0-9A-Za-z_]|\b-){0,61}[0-9A-Za-z_])?)*)\s*$)/;
  if (domainRegx.test(str1)) {
    return true;
  } else {
    return false;
  }
}
/*check number*/
function CheckNumber(n)
{
    return typeof n == 'number' && isFinite(n);
}
/*check if IP address is legal*/
function CheckIP(ipAddr)
{
    var addr = (new String(ipAddr)).split(".");
    if(addr.length != 4)
    {
        return false;
    }
    for( var i=0; i<4 ;i++)
    {
        if( isNaN(addr[i]) || addr[i]=="" || addr[i] < 0 || addr[i] > 255 ||addr[i].length>3)
        {
            return false;
        }
    }

    delete addr;
    return true;
}
/* Check if number is valid port number */
function CheckPortNumber(port)
{
    var n = +port;
    return port === n.toString() && n >= 1 && n <= 65535
}

/*check if e-mail address is legal*/
function CheckEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
function substr_count(string, substring)
{
    var cnt = 0, offset = -1;

    string += '';
    substring += '';

    while ((offset = string.indexOf(substring, offset+1)) != -1)
        cnt++;

    return cnt;
}
function CheckIP6(ipAddr, ipv6Alone)
{
    if (ipAddr.length < 3)
        return (ipAddr == '::' || ipAddr == "" || ipAddr == 0);

    // Check if part is in IPv4 format
    if (ipAddr.indexOf('.') > 0 && !ipv6Alone)
    {
        // accept straight IPv4
        if (CheckIP(ipAddr))
            return true;

        lastcolon = ipAddr.lastIndexOf(':');
        if (!(lastcolon && CheckIP(ipAddr.substr(lastcolon + 1))))
            return false;

        // replace IPv4 part with dummy
        ipAddr = ipAddr.substr(0, lastcolon) + ':0:0';
    }

    // check uncompressed
    if (ipAddr.indexOf('::') < 0)
    {
        var match = ipAddr.match(/^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/i);
        return (match != null);
    }

    // check colon-count for compressed format
    if (substr_count(ipAddr, ':') < 8)
    {
        var match = ipAddr.match(/^(?::|(?:[a-fA-F0-9]{1,4}:)+):(?:(?:[a-fA-F0-9]{1,4}:)*[a-fA-F0-9]{1,4})?$/i);
        return (match != null);
    }

    return false;
}
/*check the file ext name*/
function CheckExtName(str, lookfor)
{
    var strlen = str.length;
    var lookforlen = lookfor.length;

    var lookforptr = lookforlen;
    while( lookforptr > 0 )
    {
            if( str.charAt(strlen-lookforptr) != lookfor.charAt(lookforlen-lookforptr) )
                    return false;
            lookforptr--;
    }
    return true;
}

/*for event log */
function GetSubString(str,start,end)
{
    var ori = str;
    var res =0x00;
    for(var i=start;i>=end;i--)
        res = res | (1 << i);
    return (ori & res);
}
/* for user page*/
function GetVars(str)
{
    url=location.search.substring(1);
    var parameterList=url.split("&");
    for (var i=0;i<parameterList.length;i++)
    {
         parameter=parameterList[i].split("=");
         if (parameter[0] == str)
            return (decodeURIComponent(parameter[1]));
    }
}

function ToLocale(str)
{
    var newstr = str.substring(0,7)+str.substring(15)+str.substring(6,16);
    var CardDate = new Date(newstr + " GMT");
    return ( CardDate.toLocaleString() );

}

//for every page used
function CheckUserPrivilege(Callbackfunc)
{
    PRIVILEGE_LIMIT = top.frames.topmenu.PRIV_ID;
    if(PRIVILEGE_LIMIT != null) {
        Callbackfunc(PRIVILEGE_LIMIT);
    } else {
        Callbackfunc(null);
    }
}

//check User Privilege only for mainmenu page.
function CheckUserPrivilegeX(Callbackfunc) {
    var CurrentUID = ReadCookie("currentUID");
    var CSRF_TOKEN = ReadCookie("XSRF-TOKEN", true);
    if (!CurrentUID) {
        clearSessionInfo();
        location.href = "/page/login.html";
        return;
    }
    var userPrivilege = sessionStorage.getItem('privilege_id');
    if (userPrivilege) {
        if (userPrivilege == "Administrator") {
            CreateCookie("PRIVILEGE", "4");
        } else if (userPrivilege == "Operator") {
            CreateCookie("PRIVILEGE", "3");
        } else if (userPrivilege == "ReadOnly") {
            CreateCookie("PRIVILEGE", "2");
        } else if (userPrivilege == "NoAccess") {
            CreateCookie("PRIVILEGE", "0");
        }
        update_Priv_ID(Callbackfunc);
    } else {
        var ajax_url = '/redfish/v1/AccountService/Actions/Oem/AccountService.GetCurrentUserRole';
        var data = { "Oem": { "OpenBMC": { "LoginUser": CurrentUID } } };
        var object = JSON.stringify(data);
        var ajax_req = new Ajax.Request(ajax_url, {
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-XSRF-TOKEN': CSRF_TOKEN },
            parameters: object,
            onSuccess: function (originalRequest) {
                if (originalRequest.readyState == 4 && originalRequest.status == 200) {
                    var response = JSON.parse(originalRequest.responseText);
                    var userPrivilege = response.Role;
                    if (userPrivilege == "Administrator") {
                        CreateCookie("PRIVILEGE", "4");
                    } else if (userPrivilege == "Operator") {
                        CreateCookie("PRIVILEGE", "3");
                    } else if (userPrivilege == "ReadOnly") {
                        CreateCookie("PRIVILEGE", "2");
                    } else if (userPrivilege == "NoAccess") {
                        CreateCookie("PRIVILEGE", "0");
                    }
                    update_Priv_ID(Callbackfunc);
                }
            },
            onFailure: function (originalRequest) {
                CreateCookie("PRIVILEGE", "0");
                console.error("originalRequest", originalRequest);
            }
        });
    }
}

function update_Priv_ID(Callbackfunc){
    var Privilege = ReadCookie("PRIVILEGE");
    if(Privilege == '4') {
        Privilege = '04';
    } else if(Privilege == '3') {
        Privilege = '03';
    } else if(Privilege == '2') {
        Privilege = '02';
    } else if(Privilege == '1' || Privilege == '15') {
        location.href = "/preauth/page/url_redirect_login3.html";
        return;
    }
    CreateCookie("PRIVILEGE", Privilege);
    PRIVILEGE_LIMIT = Privilege;
    top.PRIV_ID = Privilege;
    if(typeof top.frames.topmenu != 'undefined'){
        top.frames.topmenu.PRIV_ID = Privilege;
    }
    if (typeof (Callbackfunc) == 'function' )
    {
        Callbackfunc(Privilege);
    }
}

function checkBmcSecurityControlModeWarning(warningString) {
  let showString = typeof warningString == 'string' ? warningString : ' ';
  let KcsMode = ReadCookie("KCSMode");
  let kcsSecWarning = document.getElementById("kcs_segment_state");

  if (kcsSecWarning != null) {
    kcsSecWarning.textContent = showString;
    if (KcsMode == "allow_all") {
      kcsSecWarning.style.visibility = "visible";
    } else {
      kcsSecWarning.style.visibility = "hidden";
    }
  }
}

function readKCSModeStatus(response)
{
    if (response.readyState == 4 && response.status == 200) {
        var orgReq = JSON.parse(response.responseText);
        var kcsData = orgReq.Oem.OpenBmc;
        if (kcsData.hasOwnProperty("KcsPolicyControlMode")) {
            if (kcsData.KcsPolicyControlMode.Value == "Provisioning") {
                updateKCSStateList("ALLOW_ALL");
            } else if (kcsData.KcsPolicyControlMode.Value == "ProvisionedHostAllowlist") {
                updateKCSStateList("RESTRICTED");
            } else if (kcsData.KcsPolicyControlMode.Value == "ProvisionedHostDisabled") {
                updateKCSStateList("DENY_ALL");
            } else {
                updateKCSStateList("DENY_ALL");
            }
        }
    }
}

function updateKCSStateList(root)
{
    if (root != null) {
        switch (root) {
          case "ALLOW_ALL":
            CreateCookie("KCSMode", "allow_all");
            break;
          case "RESTRICTED":
            CreateCookie("KCSMode", "restricted");
            break;
          case "DENY_ALL":
            CreateCookie("KCSMode", "deny_all");
            break;
          default:
            CreateCookie("KCSMode", "deny_all");
        }
    }
    Check_bmc_security_control_mode_warning(lang.CONF_KCS_BANNER);
}

/* Request to generate a new CSRF Token for init */
function requestNewCSRFToken(callback_func)
{
    top.frames.topmenu.CSRF_TOKEN = ReadCookie("XSRF-TOKEN");
    top.frames.topmenu.PRIV_ID = ReadCookie("PRIVILEGE");

}

function onNewCSRFTokenComplete(originalRequest)
{
    if (originalRequest.readyState != 4 || originalRequest.status != 200) {
        SessionTimeout();
        alert(lang.LANG_LOGIN_SESSION_NO_PRIV, {onClose: function() {
            location.href = "/";
        }});
    } else {
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        //console.log(">>>> onNewCSRFTokenComplete():" + response);
        var xmldoc = GetResponseXML(response);
        if(xmldoc == null) {
            SessionTimeout();
            return;
        }

        var result = GetXMLNodeValue(xmldoc, "RESULT");
        if(result == "OK") {
            var token = GetXMLNodeValue(xmldoc, "TOKEN");
            top.frames.topmenu.CSRF_TOKEN = token;
        }
        if(gCSRFCallbackFunc != null) {
            gCSRFCallbackFunc();
        }
        gCSRFCallbackFunc = null;
    }
}

/* Request to check CSRF Token valid/invalid/update */
function checkCSRFTokenValid(response)
{
    var ret = false;
    var xmldoc = GetResponseXML(response);
    if(xmldoc == null) {
        SessionTimeout();
        return;
    }

    var result = GetXMLNodeValue(xmldoc, "RESULT");
    if(result == "OK") {
        var token = GetXMLNodeValue(xmldoc, "TOKEN");
        if(token != NULL && token.lenght > 0) {
            top.frames.topmenu.CSRF_TOKEN = token;
        }
        ret = true;
    }
    return ret;
}

function responseClearInvalidSession(response)
{
    if (response.readyState == 4 && response.status == 200) {
        alert(lang.LANG_LOGOUT_SESSION_INVALID, {onClose: function() {
            location.href = "/";
        }});
    }
}

function dumpXMLDocString(xmldoc)
{
    var result = "";
    if(xmldoc != null) {
        result = (new XMLSerializer()).serializeToString(xmldoc);
    }
    return result;
}

//Sensor API
function ToSigned(Num, signedbitB)
{

    if(signedbitB > 0)
    {

        /* positive */
        if( ( Num%(0x01<<signedbitB)/(0x01<<(signedbitB-1)) ) < 1 )
        {
            return Num%(0x01<<signedbitB-1);
        }
        /* negative */
        else
        {
            var temp = (Num%(0x01<<signedbitB-1)) ^ ((0x01<<signedbitB-1)-1);
            return (-1-temp);
        }

    }

    else
    {
        return Num;
    }

}


function SensorFunc(raw_data, m, b, rb)
{
    var sensor_data;

    var M_raw, M_data;
    var B_raw, B_data;
    var Km_raw, Km_data;
    var Kb_raw, Kb_data;


    /* change sequense of lsb and msb into 10b char */
    M_raw = ((parseInt(m,16)&0xC0) << 2) + ( parseInt(m,16) >> 8);
    B_raw = ((parseInt(b,16)&0xC0) << 2) + ( parseInt(b,16) >> 8);


    Km_raw = parseInt(rb,16) >> 4;
    Kb_raw = (parseInt(rb,16) & 0x0F);

    M_data = ToSigned(M_raw, 10);
    B_data = ToSigned(B_raw, 10);
    Km_data = ToSigned(Km_raw, 4);
    Kb_data = ToSigned(Kb_raw, 4);

    sensor_data = (M_data*parseInt(raw_data, 16) + B_data*Math.pow(10, Kb_data)) * Math.pow(10,Km_data);

    return sensor_data;

}
function ShowDiscStateAPI( Sensor_Type, sensor_d )
{
    var State_String = "";
    /*
    sensor_d is the sensor reading value
    We convert sensor_d to sensor specific offset and show its corresponding event string.
    */
    ShowDiscStateAPI.SensorHealth = "bgcolor=red";
    if( Sensor_Type == "05" )
    {
        if(sensor_d == 0){
            State_String += 'OK';
            ShowDiscStateAPI.SensorHealth = "bgcolor=green";
        }
        if(parseInt((sensor_d/1), 10) % 2)
            State_String += 'General Chassis Intrusion. ';
        if(parseInt((sensor_d/2), 10) % 2)
            State_String += 'Drive Bay intrusion. ';
        if(parseInt((sensor_d/4), 10) % 2)
            State_String += 'I/O Card area intrusion. ';
        if(parseInt((sensor_d/8), 10) % 2)
            State_String += 'Prosessor area intrusion. ';
        if(parseInt((sensor_d/16), 10) % 2)
            State_String += 'LAN Leash Lost. ';
        if(parseInt((sensor_d/32), 10) % 2)
            State_String += 'Unauthorized dock. ';
        if(parseInt((sensor_d/64), 10) % 2)
            State_String += 'Fan area intrusion. ';

        return State_String;
    }
    else if( Sensor_Type == "07" )
    {

        if(parseInt(sensor_d, 10)==0)
        {
            State_String += 'Normal Status';
            ShowDiscStateAPI.SensorHealth = "bgcolor=green";
        }
        else
        {
            State_String += 'Abnormal Status';
        }

        return State_String;
    }
    else if( Sensor_Type == "08" )
    {
        if(parseInt((sensor_d/1), 10) % 2){
            State_String += 'Presence detected. ';
            ShowDiscStateAPI.SensorHealth = "bgcolor=green";
        }
        if(parseInt((sensor_d/2), 10) % 2)
            State_String += 'Power Supply Failure detected. ';
        if(parseInt((sensor_d/4), 10) % 2)
            State_String += 'Predictive Failure. ';
        if(parseInt((sensor_d/8), 10) % 2)
            State_String += 'Power Supply input lost (AC/DC). ';
        if(parseInt((sensor_d/16), 10) % 2)
            State_String += 'Power Supply input lost or out-of-range. ';
        if(parseInt((sensor_d/32), 10) % 2)
            State_String += 'Power Supply input out-of-range, but present. ';
        if(parseInt((sensor_d/64), 10) % 2)
            State_String += 'Configuration error. ';

        return State_String;
    }
    else if( Sensor_Type == "10" )
    {
        if(sensor_d == 0)
        {
            State_String += 'Normal';
            //State_String += lang.LANG_SENSOR_STATUS_NORMAL;
            ShowDiscStateAPI.SensorHealth = "bgcolor=green";
        }

        if(parseInt((sensor_d/1), 10) % 2)
        {
            State_String += 'Correctable Memory Error Logging Disable';
            ShowDiscStateAPI.SensorHealth = "bgcolor=white";
        }

        if(parseInt((sensor_d/2), 10) % 2)
        {
            State_String += 'Event \'type\' Logging Disable';
            ShowDiscStateAPI.SensorHealth = "bgcolor=white";
        }

        if(parseInt((sensor_d/4), 10) % 2)
        {
            State_String += 'Log Area Reset/Cleared';
            ShowDiscStateAPI.SensorHealth = "bgcolor=green";
        }

        if(parseInt((sensor_d/8), 10) % 2)
        {
            State_String += 'All Event Logging Disabled';
            ShowDiscStateAPI.SensorHealth = "bgcolor=white";
        }

        if(parseInt((sensor_d/16), 10) % 2)
        {
            State_String += 'SEL Full';
        }

        if(parseInt((sensor_d/32), 10) % 2)
        {
            State_String += 'SEL Almost Full';
            ShowDiscStateAPI.SensorHealth = "bgcolor=yellow";
        }

        return State_String;
    }
    else if( Sensor_Type == "c0" )
    {
        if(parseInt((sensor_d/1), 10) % 2){
            State_String += 'Low';
            ShowDiscStateAPI.SensorHealth = "bgcolor=green";
        }
        else if(parseInt((sensor_d/2), 10) % 2){
            State_String += 'Medium';
            ShowDiscStateAPI.SensorHealth = "bgcolor=yellow";
        }
        else if(parseInt((sensor_d/4), 10) % 2)
            State_String += 'High';
        else if(parseInt((sensor_d/16), 10) % 2)
            State_String += 'Over Heat';
        else if(parseInt((sensor_d/128), 10) % 2){
            State_String += 'Uninstall';
            ShowDiscStateAPI.SensorHealth = "bgcolor=white";
        }
        else
            State_String += 'Not Present!';

        return State_String;
    }
    else if( Sensor_Type == "c2" )
    {
        if(sensor_d == 0){
            State_String += 'OK';
            ShowDiscStateAPI.SensorHealth = "bgcolor=green";
        }
        if(parseInt((sensor_d/1), 10) % 2)
            State_String += 'None of The Above Fault';
        if(parseInt((sensor_d/2), 10) % 2)
            State_String += 'CML Fault';
        if(parseInt((sensor_d/4), 10) % 2)
            State_String += 'Over Temperature Fault';
        if(parseInt((sensor_d/8), 10) % 2)
            State_String += 'Under Voltage Fault';
        if(parseInt((sensor_d/16), 10) % 2)
            State_String += 'Over Current Fault';
        if(parseInt((sensor_d/32), 10) % 2)
            State_String += 'Over Ovltage Fault';
        if(parseInt((sensor_d/64), 10) % 2)
            State_String += 'PS On/Off';
        if(parseInt((sensor_d/128), 10) % 2)
            State_String += 'Device Busy';
        return State_String;
    }
}
//Convert integer to hex string
function IntegerToHexString(Num)
{
    var Value = String.fromCharCode(Num);
    var Value1 = Value.charCodeAt(0);
    return  Value1.toString(16).toUpperCase();
}//process sensor function
function SensorFormula(node,Idx,SensorTableArray,i)
{
        var SensorType = node[i].type_number;//node.getAttribute("STYPE");
        var RawReading = node[i].raw_reading;//node.getAttribute("RAW_READING");
        var Option = parseInt("c0", 16);
        var UnitType = node[i].unit;//parseInt(node.getAttribute("UNIT"), 16);  
        var Status = "";//node.getAttribute("STATUS");     
        
        var Unit;
        
        var UNR, UC, UNC, LNC, LC, LNR;
        //var SensorReadingObj = node.getAttribute("READING");
        //var RawReading = SensorReadingObj.substr(0, 2);        
        //var SFormula = node.getAttribute("L");
        //var UnitType1 = parseInt(node.getAttribute("UNIT1"), 16);
        //var AnalogDataFormat = UnitType1 >> 6;
        //var ReadingDataFormat;

        //attribute 'STATUS' identical webui 'Status' field
        /*if(node.accessible === 0xD5){
            Status = "Disabled";
        }else if(node.discrete_state !== 0 && node.accessible !== 0xD5){
            Status = "Discrete";
        }*/
        if(node[i].sensor_state == 1){
            Status = "Normal";
        }else if(node[i].sensor_state != 1 && node[i].accessible !== 0xD5 && node[i].discrete_state == 0){
            //Status = "Normal";
            if((node[i].reading > node[i].lower_critical_threshold && node[i].reading < node[i].lower_non_critical_threshold) 
                || (node[i].reading > node[i].higher_non_critical_threshold && node[i].reading < node[i].higher_critical_threshold) ){
                    Status = "Warning";
                    ColorNode = "yellow";
            }else{
                Status = "Critical";
            }
        }else{
            Status = "Not Available";
        }        

        SensorFormula.Status = Status;

        SensorFormula.NeedCompare = 0;



        switch(UnitType)
        {
            case 0x00://add new type 00
                Unit = lang.LANG_SENSOR_UNIT00;
                break;
            case 0x01:
                Unit = lang.LANG_SENSOR_UNIT01;
                break;
            case 0x02:
                Unit = lang.LANG_SENSOR_UNIT02;
                break;
            case 0x03:
                Unit = lang.LANG_SENSOR_UNIT03;
                break;
            case 0x04:
                Unit = lang.LANG_SENSOR_UNIT04;
                break;
            case 0x05:
                Unit = lang.LANG_SENSOR_UNIT05;
                break;
            case 0x06:
                Unit = lang.LANG_SENSOR_UNIT06;
                break;
            case 0x07:
                Unit = lang.LANG_SENSOR_UNIT07;
                break;
            case 0x11:
                Unit = lang.LANG_SENSOR_UNIT11;
                break;
            case 0x12:
                Unit = lang.LANG_SENSOR_UNIT12;
                break;
            case 0x13:
                Unit = lang.LANG_SENSOR_UNIT13;
                break;
            default:
                Unit = UnitType;
                break;
        }
        SensorFormula.Unit = Unit;
        // 2's complement
        /*if(AnalogDataFormat == 0x02 )
        {
            ReadingDataFormat = ToSigned(parseInt(RawReading, 16), 8).toString(16);
            UNR =  ToSigned(parseInt(node.getAttribute("UNR"), 16), 8).toString(16);
            UC =   ToSigned(parseInt(node.getAttribute("UC"), 16), 8).toString(16);
            UNC =  ToSigned(parseInt(node.getAttribute("UNC"), 16), 8).toString(16);
            LNC =  ToSigned(parseInt(node.getAttribute("LNC"), 16), 8).toString(16);
            LC =   ToSigned(parseInt(node.getAttribute("LC"), 16), 8).toString(16);
            LNR =  ToSigned(parseInt(node.getAttribute("LNR"), 16), 8).toString(16);
        }
        else
        {
            ReadingDataFormat = RawReading;*/
            UNR = ((!isNaN(node[i].higher_non_recoverable_threshold)) && ((node[i].higher_non_recoverable_threshold) % 1 !== 0)) ? parseFloat(node[i].higher_non_recoverable_threshold).toFixed(2) : node[i].higher_non_recoverable_threshold;//node[Idx].higher_non_recoverable_threshold;//lower_non_recoverable_thresholdnode.getAttribute("UNR");
            UC = ((!isNaN(node[i].higher_critical_threshold)) && ((node[i].higher_critical_threshold) % 1 !== 0)) ? parseFloat(node[i].higher_critical_threshold).toFixed(2) : node[i].higher_critical_threshold;//node[Idx].higher_critical_threshold;//node.getAttribute("UC");
            UNC = ((!isNaN(node[i].higher_non_critical_threshold)) && ((node[i].higher_non_critical_threshold) % 1 !== 0)) ? parseFloat(node[i].higher_non_critical_threshold).toFixed(2) : node[i].higher_non_critical_threshold;//node[Idx].higher_non_critical_threshold;//node.getAttribute("UNC");
            LNC = ((!isNaN(node[i].lower_non_critical_threshold)) && ((node[i].lower_non_critical_threshold) % 1 !== 0)) ? parseFloat(node[i].lower_non_critical_threshold).toFixed(2) : node[i].lower_non_critical_threshold;//node[Idx].lower_non_critical_threshold;//node.getAttribute("LNC");
            LC = ((!isNaN(node[i].lower_critical_threshold)) && ((node[i].lower_critical_threshold) % 1 !== 0)) ? parseFloat(node[i].lower_critical_threshold).toFixed(2) : node[i].lower_critical_threshold;//node[Idx].lower_critical_threshold;//node.getAttribute("LC");
            LNR = ((!isNaN(node[i].lower_non_recoverable_threshold)) && ((node[i].lower_non_recoverable_threshold) % 1 !== 0)) ? parseFloat(node[i].lower_non_recoverable_threshold).toFixed(2) : node[i].lower_non_recoverable_threshold;//node[Idx].lower_non_recoverable_threshold;//node.getAttribute("LNR");
        //}
        //var AfterFuncSensorReading = parseFloat( SensorFunc(ReadingDataFormat, node.getAttribute("M"), node.getAttribute("B"), node.getAttribute("RB")), 10)
        //var AfterFuncSensorUNR = parseFloat( SensorFunc(UNR, node.getAttribute("M"), node.getAttribute("B"), node.getAttribute("RB")), 10);
        //var AfterFuncSensorUC  = parseFloat( SensorFunc(UC, node.getAttribute("M"), node.getAttribute("B"), node.getAttribute("RB")), 10) ;
        //var AfterFuncSensorUNC = parseFloat( SensorFunc(UNC, node.getAttribute("M"), node.getAttribute("B"), node.getAttribute("RB")), 10);
        //var AfterFuncSensorLNC = parseFloat( SensorFunc(LNC, node.getAttribute("M"), node.getAttribute("B"), node.getAttribute("RB")), 10);
        //var AfterFuncSensorLC  = parseFloat( SensorFunc(LC, node.getAttribute("M"), node.getAttribute("B"), node.getAttribute("RB")), 10) ;
        //var AfterFuncSensorLNR = parseFloat( SensorFunc(LNR, node.getAttribute("M"), node.getAttribute("B"), node.getAttribute("RB")), 10);

        // Ignore on reading
        if(!(Option & 0x40))
        {
            if ( typeof(SensorTableArray) == 'object' )
            {
                //SensorTableArray[Idx][1] = "Not Readable";
                SensorTableArray[Idx][1] = lang.LANG_SENSOR_STATUS_NOT_AVAILABLE;
                SensorTableArray[Idx][2] = lang.LANG_SENSOR_READING_NA;
                SensorTableArray[Idx][9] = "bgcolor=white";
            }
        }
        else
        {
            //if(SFormula == "00")
            //{
                var SFunction = function(val)
                {
                    return parseInt( val*100, 10)/100;
                }
                if(RawReading == /*'0'*/ '00' && Option != 0x00 && SensorType == '04')
                {
                    var SensorReading = 0;
                    if ( typeof(SensorTableArray) == 'object' )
                        SensorTableArray[Idx][2] = "0 " + Unit;
                    SensorFormula.NeedCompare = 1;
                    SensorFormula.SensorReading = SensorReading;
                }
                //else if((node.getAttribute("READING") == '      ') || (RawReading == /*'0'*/ '00'))
                else if(RawReading == null)
                {
                    if ( typeof(SensorTableArray) == 'object' ){

                        //SensorTableArray[Idx][1] = "Not Readable";
                        SensorTableArray[Idx][1] = lang.LANG_SENSOR_STATUS_NOT_AVAILABLE;
                        SensorTableArray[Idx][2] = lang.LANG_SENSOR_READING_NA;
                    }
                }
                /*  linear_reading  */
                else
                {
                    //var SensorReading = parseInt( AfterFuncSensorReading*100, 10)/100;
                    var SensorReading = ((!isNaN(node[i].reading)) && ((node[i].reading) % 1 !== 0)) ? parseFloat(node[i].reading).toFixed(2) : node[i].reading;//node[Idx].reading;//node.getAttribute("HUMAN_READING");
                    if ( typeof(SensorTableArray) == 'object' )
                        SensorTableArray[Idx][2] = SensorReading + " " + Unit;
                    SensorFormula.NeedCompare = 1;
                    SensorFormula.SensorReading = SensorReading;
                }
            //}
            // linear function = 1/x
            /*else if(SFormula == "07")
            {
                var SFunction = function(val)
                {
                     return parseInt(100/val, 10)/100;
                }

                if(RawReading == '00' && Option != 0x00 && SensorType == '04')
                {
                    SensorFormula.SensorReading = 0;
                    if ( typeof(SensorTableArray) == 'object' )
                        SensorTableArray[Idx][2] = "0 " + Unit;
                    SensorFormula.NeedCompare = 1;
                }
                else if((node.getAttribute("READING") == '      ') || (RawReading == 'ff') || (RawReading == '00'))
                {
                    if ( typeof(SensorTableArray) == 'object' )
                        SensorTableArray[Idx][2] = "Not Present!";
                }
                //  linear_reading
                else
                {
                    var SensorReading = parseInt( 100/AfterFuncSensorReading, 10)/100;
                    if ( typeof(SensorTableArray) == 'object' )
                        SensorTableArray[Idx][2] = SensorReading + " " + Unit;
                    SensorFormula.NeedCompare = 1;
                    SensorFormula.SensorReading = SensorReading;
                }
            }
            // linear function = sqr(x)
            else if(SFormula == "08")
            {
                var SFunction = function(val)
                {
                     return parseInt(parseFloat( Math.pow(val,2), 10) * 100, 10) / 100;
                }

                if(RawReading == '00' && Option != 0x00 && SensorType == '04')
                {
                    SensorFormula.SensorReading = 0;
                    if ( typeof(SensorTableArray) == 'object' )
                        SensorTableArray[Idx][2] = "0 " + Unit;
                    SensorFormula.NeedCompare = 1;
                }
                else if((node.getAttribute("READING") == '      ') || (RawReading == 'ff') || (RawReading == '00'))
                {
                    if ( typeof(SensorTableArray) == 'object' )
                        SensorTableArray[Idx][2] = "Not Present!";
                }
                //  linear_reading
                else
                {
                    var SensorReading = parseInt(parseFloat( Math.pow(AfterFuncSensorReading,2), 10) * 100, 10) / 100;
                    if ( typeof(SensorTableArray) == 'object' )
                        SensorTableArray[Idx][2] = SensorReading + " " + Unit;
                    SensorFormula.SensorReading = SensorReading;
                    SensorFormula.NeedCompare = 1;
                }
            }*/
            SensorFormula.SensorUNR = UNR; //SFunction( AfterFuncSensorUNR);
            SensorFormula.SensorUC  = UC; //SFunction( AfterFuncSensorUC);
            SensorFormula.SensorUNC = UNC; //SFunction( AfterFuncSensorUNC);
            SensorFormula.SensorLNC = LNC; //SFunction( AfterFuncSensorLNC);
            SensorFormula.SensorLC  = LC; //SFunction( AfterFuncSensorLC);
            SensorFormula.SensorLNR = LNR; //SFunction( AfterFuncSensorLNR);
            if ( typeof(SensorTableArray) == 'object' )
            {
                SensorTableArray[Idx][8] = SensorFormula.SensorUNR;
                SensorTableArray[Idx][7] = SensorFormula.SensorUC;
                SensorTableArray[Idx][6] = SensorFormula.SensorUNC;
                SensorTableArray[Idx][5] = SensorFormula.SensorLNC;
                SensorTableArray[Idx][4] = SensorFormula.SensorLC;
                SensorTableArray[Idx][3] = SensorFormula.SensorLNR;
            }
        }
}
function isIpv6Addr(ip)
{
    /*
        For an IPv6 address "2001:240:629::6".
        On IE and Firefox, when open the URI, window.location.hostname will return "2001:240:629::6".
        But Safari and Chrome returns "[2001:240:629::6]".
    */

    if ( ip.match(/^\[.*\]$/) != null )
        return true;

    return ( ip.indexOf(':') >= 2 )
}

function resetSessionExpired() {
    var auth = ReadCookie("Authenticated");
    if(auth != null && parseInt(auth) == 1) {
        g_callback = "onSessionExpiredReset";
        requestSessionExpired(true, onSessionExpiredReset);
    }
}

function checkSessionExpired() {
    g_callback = "onSessionExpiredCheck";
    requestSessionExpired(false, onSessionExpiredCheck);
}

//Get session timeout expired,
//    if exipired > 0, go reset timeout.
function requestSessionExpired(reset_expired, callback)
{
    browser_is = GetBrowserInfo();
    if(browser_is == "IE") {
        if(g_callback == "onSessionExpiredCheck") {
            if(gSessionCheckPendingCount < 1) {
                gSessionCheckPendingCount = 1;
                allowRequest = true;
            }
        }
        else if(g_callback == "onSessionExpiredReset") {
            if(gSessionResetPendingCount < 1) {
                gSessionResetPendingCount = 1;
                allowRequest = true;
            }
        }
    }
    else {
        if(callback.name == "onSessionExpiredCheck") {
            if(gSessionCheckPendingCount < 1) {
                gSessionCheckPendingCount = 1;
                allowRequest = true;
            }
        }
        else if(callback.name == "onSessionExpiredReset") {
            if(gSessionResetPendingCount < 1) {
                gSessionResetPendingCount = 1;
                allowRequest = true;
            }
        }
    }
    if(allowRequest == true) {
    }
}

function onSessionExpiredReset(originalRequest) {
    if (originalRequest.readyState == 4 && originalRequest.status == 200){
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc = GetResponseXML(response);
        if(xmldoc == null) {
           return;
        }

        var IPMI = xmldoc.documentElement;//point to IPMI
        CreateCookie("SESSIONTIMEOUT", GetXMLNodeValue(xmldoc, "TOUTTIME"));

        var expire = parseInt(GetXMLNodeValue(xmldoc, "EXPIRE"), 10);
        if(expire < 0) {
            gSessionTimeout = -1; // disable session timeout
        } else {
            gSessionTimeout = expire * 1000 + 4000;
        }
        CreateCookie("gSESSIONTIMEOUT", gSessionTimeout);
        //launchSessionExpiredTimer(); //fw update launch sessiotimer
        gSessionResetPendingCount = 0;
    }
}


function onSessionExpiredCheck(originalRequest) {
        var result = "OK";
        if(result == "SESSION_INVALID") {
            //When session timeout, server will go logout procedure,
            // then session id will be invalid on client side, so do not call logout
            // just call login directly.
            clearSessionInfo();
            alert(lang.LANG_CONFIG_WEBSESSION_EXPIRED, {onClose: function(){
                location.href = "/";
            }});
        }
        else {
            //session alive, keep continue.
            //var expire = parseInt(GetXMLNodeValue(xmldoc, "EXPIRE"), 10);
            var expire = 1800;
            if(expire < 0) {
                gSessionTimeout = -1; // disable session timeout
            } else {
                gSessionTimeout = expire * 1000 + 4000;
            }
            CreateCookie("gSESSIONTIMEOUT", gSessionTimeout);
        }
        gSessionCheckPendingCount = 0;
    //}
}

function resetHeartbeat()
{
    //console.log("resetHeartbeat in " + g_UtilsTimestamp);
    top.frames.topmenu.mHeartbeatTimer.restart();
}

/********************************************************
This event listener only for safari,
There is timer latency issue on Safari when screen blanks,
so we do not prefereed heartbeat process in Safari.
we use window/tab close event listener to fix this issue.
********************************************************/
function initSafariChecker() {
    var CountKey = "SESSION_COUNT";
    var count = ReadCookie(CountKey);
    if(count == null) {
        CreateCookie(CountKey, "0");
        count = 0;
    }
    else {
        count = parseInt(count);
        count += 1;
        CreateCookie(CountKey, count);
    }

    window.onbeforeunload = function (event) {
        var count = null;
        var CountKey = "SESSION_COUNT";
        count = ReadCookie(CountKey);
        if(count != null) {
            count = parseInt(count);
            count = count - 1;
            if(count >= 0) {
                CreateCookie(CountKey, "" + count);
            }
            else {
                EraseCookie(CountKey);
                count = null;
            }
        }
        if(count == null) {
            goLogout();
        }
    };
}

function clearSafariSessionCounter() {
    EraseCookie("SESSION_COUNT");
}

//--- for auto logout
function removeChilds(node) {
    while (node != null && node.firstChild != null) {
        node.removeChild(node.firstChild);
    }
}

function GeneGenericRequestXML() {}

function GetXMLNodeValue(xml, tag) {
    var result = null;
    if(xml != null && tag != null) {
        var root = xml.documentElement;
        if(root != null) {
            var nodes = root.getElementsByTagName(tag);
            if(nodes != null && nodes.length > 0) {
                var node = nodes[0].firstChild;
                if(node != null) {
                    result = node.nodeValue;
                }
            }
        }
    }
    return result;
}

function ClearInvalidSession(){}

function PageLogoutNoPriv()
{
    goLogout();
}

function getCSRFToken()
{
    // var token = "";
    // if(top.frames.topmenu && top.frames.topmenu.CSRF_TOKEN)
    //     token = top.frames.topmenu.CSRF_TOKEN;
    var token = ReadCookie("XSRF-TOKEN", true);
    // var token = sessionStorage.garc;
    return token;
}

function updateToken(xml_root_node)
{
    if(xml_root_node != null) {
        var token = xml_root_node.getElementsByTagName("TOKEN");
        if(token != null && token.length > 0) {
            var node = token[0].firstChild;
            if(node != null) {
                result = node.nodeValue;
                if(node.nodeValue != null && node.nodeValue.length > 0) {
                    top.frames.topmenu.CSRF_TOKEN = node.nodeValue;
                }
            }
        }
    }
}

function onLogout(originalRequest) {
    if (originalRequest.readyState == 4 && originalRequest.status == 200){
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc = GetResponseXML(response);
        clearSessionInfo();
        location.href = "/";
    }
}

function displayTime() {
    var str = "";

    var currentTime = new Date()
    var hours = currentTime.getHours()
    var minutes = currentTime.getMinutes()
    var seconds = currentTime.getSeconds()

    if (minutes < 10) {
        minutes = "0" + minutes
    }
    if (seconds < 10) {
        seconds = "0" + seconds
    }
    str += hours + ":" + minutes + ":" + seconds + " ";
    if(hours > 11){
        str += "PM"
    } else {
        str += "AM"
    }
    return str;
}

//erase cookie about session info
function clearSessionInfo() {
    clearSafariSessionCounter();
    EraseCookie("Authenticated");
    EraseCookie("SESSIONTIMEOUT");
    EraseCookie("gSESSIONTIMEOUT");
    EraseCookie("KCSMode");
    EraseCookie("mainpage");
    EraseCookie("subpage");
    EraseCookie("SESSION", true);
    EraseCookie("XSRF-TOKEN", true);
    sessionStorage.clear();
    localStorage.clear();

    // clean timer
    if(typeof top.frames.topmenu != 'undefined') {
        top.frames.topmenu.mHeartbeatTimer.stop();
    }
    if(typeof top.frames.topmenu != 'undefined' &&
       top.frames.topmenu.gSessionExpiredTimer) {
        clearInterval(top.frames.topmenu.gSessionExpiredTimer);
        top.frames.topmenu.gSessionExpiredTimer = null;
    }
}

function stopTimer() {
    if(typeof top.frames.topmenu != 'undefined') {
        top.frames.topmenu.mHeartbeatTimer.stop();
    }
}

function startTimer(){
    top.frames.topmenu.mHeartbeatTimer.start();
}

function readCSRFToken(xmldoc)
{
    var ret = null;
    if(xmldoc != null) {
        var token = GetXMLNodeValue(xmldoc, "TOKEN");
        if(token != null && token.length > 0) {
            ret = token;
        }
    }
    return ret;
}

function CheckInvalidResult(xmldoc) {
    var result = GetXMLNodeValue(xmldoc, "RESULT");
    var token = "";
    if (result == "CGI_BUSY") {
        alert("Server is busy");
        return -1;
    }

    if (result == "SESSION_INVALID") {
        ClearInvalidSession();
        clearSessionInfo();
        return -1;
    }
    if (result == "PRIVILEGE_INVALID") {
        alert(lang.LANG_COMMON_CANNOT_MODIFY, {onClose: onPrivilegeFailedClose});
        return -1;
    }
    if (result == "TOKEN_INVALID") {
        //alert(lang.LANG_COMMON_AUTH_FAIL_MSG);
        goLogout();
        return -1;
    }

    token = readCSRFToken(xmldoc);
    if(token != null && token.length > 0) {
        top.frames.topmenu.CSRF_TOKEN = token;
    }
    return 0;
}

// Load custom strings
function loadCustomStrings(callback) {
    var custom_obj;
    try {
        var url = '../res/customize.json';
        var myAjax = new Ajax.Request(
            url, {asynchronous: false, method: 'get', onSuccess: function(transport) {
                custom_obj;
                try {
                    custom_obj = transport.responseText.evalJSON(true);
                    if ('strings' in custom_obj) {
                        for (var key in custom_obj.strings) {
                            if (key in lang) {
                                lang[key] = custom_obj.strings[key][lang_setting];
                                //console.log(key + ": " + lang[key]);
                            } else {
                                console.log('Invalid key in customization ' + url + ': ' + key);
                            }
                        }
                    }

                } catch (e2) {
                    console.log("Cannot read/parse customizied strings " + url + ": " + e2);
                }
                callback(custom_obj);
            }
        });
    } catch (e) {
        console.log("Cannot read/parse customizied strings");
        console.log(e);
    }
}

function GetRMMKeyStatus(Callbackfunc) {
    Callbackfunc("ON");
}

function getSwlStatus(Callbackfunc)
{
    var g_SwInventoryUrl = "/redfish/v1/UpdateService/SoftwareInventory/";
    var g_SwASMKeyUrl  = "AdvancedSystemManagementKey/";
    var CSRFTOKEN = getCSRFToken();
    jQuery.ajax({
      url : g_SwInventoryUrl + g_SwASMKeyUrl,
      headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
      type : "GET",
      dataType : "json",
      contentType : false,
      processData : false,
      cache : false,
      success : getSwlStatusHandler,
      error : function(data, status, xhr) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          Loading(false);
          alert(lang.LANG_CONFIG_SOFT_LICENSE_FAIL);
        }
      }
    });

    function getSwlStatusHandler(originalRequest)
    {
        var swl_status = originalRequest['Oem']['SoftwareInventory']['LicenseStatus'];

        if (typeof (Callbackfunc) == 'function' ) {
            Callbackfunc(swl_status);
        }
    }
}

function GetBrowserInfo() {
    var result = "";
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    if(isIE) {
        result = "IE";
    }
    else {
        result = "NonIE";
        var ua = navigator.userAgent.toLowerCase(); 
        if (ua.indexOf('safari') != -1) { 
            if (ua.indexOf('chrome') > -1) {
                result = "chrome";
            } else {
                result = "safari";
            }
        }
    }
    return result;
}

function geturlPath() {
    var protocol = location.protocol;
    var hostname = location.hostname;
    var port = location.port;
    //Urlpath should have port number too
    return (port != "") ? (protocol + "//" + hostname + ":" + port + "/") : (protocol + "//" + hostname + "/");
}


function getUrlParam(key)
{
    let search = window.location.search.substring(1);

    let urlp = new URLSearchParams(search);

    return urlp.get(key);
};

function getByValue(arr, key, value) {
    // get the object from array
    for (var i=0; i<=arr.length; i++) {
      if (arr[i][key] == value) return arr[i];
    }
}

function getUTCSeconds (utcoffset_str)
{
	var utc_split;
	var utc_hr = 0, utc_min=0;
	var utc_sec = 0;

	if (-1 == utcoffset_str.indexOf("+/-0"))
	{
		utc_split = utcoffset_str.split(":");					//utc_offset data format is hh:mm
		utc_hr = parseInt(utc_split[0],10);
		utc_min = parseInt(utc_split[1]);
	}
	else
	{
		return (utc_sec);
	}

	if (utc_hr < 0)
	{
		utc_sec = ((utc_hr * 60) - utc_min) * 60;	//converting hours to minutes, then to seconds.
	}
	else if (utc_hr > 0)
	{
		utc_sec = ((utc_hr * 60) + utc_min) * 60;
	}
	else
	{
		if(utc_split[0]=="+00")
			utc_sec=(utc_min * 60);
		else
			utc_sec=(utc_min * 60 * (-1));
	}
	return (utc_sec);
}

function getUTCString(utcInSeconds)
{
	var utcString = "";
	var utcMinutes = 0;
	if (utcInSeconds == 0)
	{
		utcString = "+/-0";
	}
	else
	{
		utcMinutes = utcInSeconds/60;
		if (utcMinutes > 0)		//Its positive value
		{
			utcString += parseInt(utcMinutes/60) < 10 ? "+0": "+";
		}
		else if (utcMinutes < 0)
		{
			utcString += parseInt(Math.abs(utcMinutes/60)) < 10 ? "-0": "-";
		}
		utcString += parseInt(Math.abs(utcMinutes/60));		//To get UTC Hours
		utcString += parseInt(Math.abs(utcMinutes%60)) < 10 ? ":0": ":";
		utcString += parseInt(Math.abs(utcMinutes%60));		//To get UTC seconds
	}
	return utcString;
}

function getUTCOffset (fnptrRes)
{
	xmit.get({url:"/rpc/getdatetime.asp", onrcv:getUTCOffsetRes, status:''});

	function getUTCOffsetRes(arg)
	{
		var utc_offset_data = 0;
		if (arg.HAPI_STATUS != 0)
		{
			errstr = eLang.getString('common','STR_CONF_DATE_TIME_GETVAL');
			errstr += (eLang.getString('common','STR_IPMI_ERROR')+GET_ERROR_CODE(arg.HAPI_STATUS));
			alert (errstr);
		}
		else
		{
			utc_offset_data = WEBVAR_JSONVAR_GETDATETIME.WEBVAR_STRUCTNAME_GETDATETIME[0].UTCMINUTES;
		}

		if(fnptrRes != undefined)
			fnptrRes (utc_offset_data);
	}
}

function HandleFailureStatus(response, err_msg, callback) {
    var req_data = JSON.parse(response.responseText);
    if(req_data.code == license_error_code){
        if(callback != null){ callback(); }
        alert("The License key is not present or the License key is invalid!!");
    }else{
        alert(err_msg);
    }
}

function GetCPUInfoByID(prop) {    
    return function(a, b) {
        if(a[prop] > b[prop]) { return 1; }
        else 
        if(a[prop] < b[prop]) { return -1;}    
        return 0;    
    }
}

function removefromArray(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function getTimeStamp(timeInSeconds)
{
	var evtTimeStamp = "";
	var eventDate = new Date(timeInSeconds * 1000);

	var evtMonth=eventDate.getUTCMonth() + 1;
	evtMonth =((evtMonth < 10)?"0":"") + evtMonth;
	var evtDate = eventDate.getUTCDate();
	evtDate=((evtDate < 10)?"0":"") + evtDate;
	evtTimeStamp = evtMonth+'/'+evtDate+'/'+eventDate.getUTCFullYear();

	var evtHours =eventDate.getUTCHours();
	evtHours =((evtHours < 10)?"0":"") + evtHours;
	var evtMins = eventDate.getUTCMinutes();
	evtMins =((evtMins < 10)?"0":"") + evtMins;
	var evtSecs = eventDate.getUTCSeconds();
	evtSecs =((evtSecs < 10)?"0":"") + evtSecs;
	evtTimeStamp += '  '+evtHours+':'+evtMins+':'+evtSecs;
	return (evtTimeStamp);
}

function getTimeFormat(unixTimeStamp) { // unixTimeStamp to HH:MM:SS format
  var dateFormat = getTimeStamp(unixTimeStamp);
  var HHMMSS = dateFormat.split(" ")
  return HHMMSS[2];
}

function primitiveToHours(timestamp) { // convert yyyy-mm-ddthh:mm:ss+00:00 to HH:MM:SS
    var timeOnly = timestamp.split('T')[1];
    var time = timeOnly.split(':')
    var hh = time[0];
    var mm = time[1];
    var secondsWithOffset = time[2];
    var ss = secondsWithOffset.split('+');
    var hh_mm_ss = hh + ":" + mm + ":" + ss[0];
    return hh_mm_ss;
}

var _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof global === 'object' && global.global === global ? global : void 0;

function z_click(node) {
    try {
        node.dispatchEvent(new MouseEvent('click'));
    } catch (e) {
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
        node.dispatchEvent(evt);
    }
}

var saveAs = _global.saveAs || 
( // probably in some web worker
    typeof window !== 'object' || window !== _global ? function saveAs() {}
    /* noop */
    // Use download attribute first if possible (#193 Lumia mobile)
    : 'download' in HTMLAnchorElement.prototype ? function saveAs(blob, name, opts) {
        var URL = _global.URL || _global.webkitURL;
        var a = document.createElement('a');
        name = name || blob.name || 'download';
        a.download = name;
        a.rel = 'noopener'; // tabnabbing
        // TODO: detect chrome extensions & packaged apps
        // a.target = '_blank'

        if (typeof blob === 'string') {
            // Support regular links
            a.href = blob;

            if (a.origin !== location.origin) {
                corsEnabled(a.href) ? download(blob, name, opts) : z_click(a, a.target = '_blank');
            } else {
                z_click(a);
            }
        } else {
            // Support blobs
            a.href = URL.createObjectURL(blob);
            setTimeout(function () {
                URL.revokeObjectURL(a.href);
            }, 4E4); // 40s

            setTimeout(function () {
                z_click(a);
            }, 0);
        }
    } // Use msSaveOrOpenBlob as a second approach
    : 'msSaveOrOpenBlob' in navigator ? function saveAs(blob, name, opts) {
        name = name || blob.name || 'download';

        if (typeof blob === 'string') {
            if (corsEnabled(blob)) {
                download(blob, name, opts);
            } else {
                var a = document.createElement('a');
                a.href = blob;
                a.target = '_blank';
                setTimeout(function () {
                    z_click(a);
                });
            }
        } else {
            navigator.msSaveOrOpenBlob(bom(blob, opts), name);
        }
    } // Fallback to using FileReader and a popup
    : function saveAs(blob, name, opts, popup) {
        // Open a popup immediately do go around popup blocker
        // Mostly only available on user interaction and the fileReader is async so...
        popup = popup || open('', '_blank');

        if (popup) {
            popup.document.title = popup.document.body.innerText = 'downloading...';
        }

        if (typeof blob === 'string') return download(blob, name, opts);
        var force = blob.type === 'application/octet-stream';

        var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;

        var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

        if ((isChromeIOS || force && isSafari) && typeof FileReader !== 'undefined') {
            // Safari doesn't allow downloading of blob URLs
            var reader = new FileReader();

            reader.onloadend = function () {
                var url = reader.result;
                url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
                if (popup) popup.location.href = url;else location = url;
                popup = null; // reverse-tabnabbing #460
            };

            reader.readAsDataURL(blob);
        } else {
            var URL = _global.URL || _global.webkitURL;
            var url = URL.createObjectURL(blob);
            if (popup) popup.location = url;else location.href = url;
            popup = null; // reverse-tabnabbing #460

            setTimeout(function () {
                URL.revokeObjectURL(url);
            }, 4E4); // 40s
        }
    }
);
_global.saveAs = saveAs.saveAs = saveAs;

if (typeof module !== 'undefined') {
    module.exports = saveAs;
}
