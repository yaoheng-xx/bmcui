/* Configuration -- SSL Certification setting */
var exists_cert=false;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/upload_ssl_certificate_hlp.html";
    document.getElementById("ButtonUpload").value = lang.LANG_CONFIG_SSL_UPLOAD;
    document.getElementById("ButtonUpload").addEventListener("click", btnupload);

    keyform = document.getElementById("validfrom");
    keyuntil = document.getElementById("validuntil");
    sslcrt = document.getElementById("sslcrt_file");
    privkey = document.getElementById("privkey_file");
    btn = document.getElementById("ButtonUpload");
    sslcrt.setAttribute('NAME', '/tmp/cert.pem');
    privkey.setAttribute('NAME', '/tmp/key.pem');
    OutputString();
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("ssl_caption_div").textContent = lang.LANG_CONFIG_SSL_CAPTION;
    document.getElementById("ssl_form_span").textContent = lang.LANG_CONFIG_SSL_FORM;
    document.getElementById("validfrom").textContent = lang.LANG_CONFIG_SSL_NONE;
    document.getElementById("ssl_until_span").textContent = lang.LANG_CONFIG_SSL_UNTIL;
    document.getElementById("validuntil").textContent = lang.LANG_CONFIG_SSL_NONE;
    document.getElementById("newsslcert_span").textContent = lang.LANG_CONFIG_SSL_NEWSSLCERT;
    document.getElementById("newprikey_span").textContent = lang.LANG_CONFIG_SSL_NEWPRIKEY;
}

function PrivilegeCallBack(Privilege)
{
    if (Privilege == '04') {
        getValidateState();
        SSLReading();
    }
    else if(Privilege == '03') {
        getValidateState();
        SSLReading();
        btn.disabled = true;
        //alert(lang.LANG_CONFIG_SSL_NOPRIVI);
    }
    else {
        location.href = SubMainPage;
        return;
    }
}

function getValidateState(){}

function getValidateResult(originalRequest){
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc=GetResponseXML(response);
        if(xmldoc == null)
        {
            SessionTimeout();
            return;
        }
        //check session & privilege.
        if (CheckInvalidResult(xmldoc) < 0) {
            return;
        }
        var root=xmldoc.documentElement;
        var sslinfo=root.getElementsByTagName('SSL_INFO');
        var validatestate= sslinfo[0].getElementsByTagName('VALIDATE');
        var cert_status = parseInt(validatestate[0].getAttribute("CERT"), 2);
        var key_status = parseInt(validatestate[0].getAttribute("KEY"), 2);

        if(!(cert_status^ key_status)) {
            if(key_status!= 0) {
                SSLReading();
                UtilsConfirm(lang.LANG_CONFIG_SSL_SUCCSAVE, {onOk: WebServerRestart});
            } else {
                alert(lang.LANG_CONFIG_SSL_CRTFAILED);// validate fail.
            }
        }
        else{
            alert(lang.LANG_CONFIG_SSL_CRTFAILED);
        }
    }
}

function WebServerRestart(){}

function WebServerRestartHandler(originalRequest){
    //Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        //alert(originalRequest.responseText);
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc = GetResponseXML(response);
        if(xmldoc == null)
        {
            SessionTimeout();
            return;
        }

        // check session & privilege
        if(CheckInvalidResult(xmldoc) < 0) {
            return;
        }

        goLogout();
    }
}

function SSLReading() {}

function SSLReadingResult(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
        var sslinfo = JSON.parse(arg.responseText);
        var validform = sslinfo.valid_from;//sslstatus[0].getAttribute("VALID_FROM");
        var validuntil = sslinfo.valid_till;//sslstatus[0].getAttribute("VALID_UNTIL");
        var crtflag = 1;//parseInt(sslstatus[0].getAttribute("CERT_EXIST"),10);
        var validformstatus=lang.LANG_CONFIG_SSL_NOAVAILBALE;
        var validuntilstatus=lang.LANG_CONFIG_SSL_NOAVAILBALE;

        if(crtflag != 0) {
            exists_cert = true;
        }

        if(validform != "Not Available") {
            validformstatus = ToLocale(validform);
        }

        if(validuntil != "Not Available") {
            validuntilstatus = ToLocale(validuntil);
        }

        keyform.textContent = validformstatus;
        keyuntil.textContent = validuntilstatus;
    }
}

function btnupload()
{
    var sslcrtvaild = new String(sslcrt.value);
    if(sslcrtvaild.length == 0)
    {
        alert(lang.LANG_CONFIG_SSL_SEL_CRTFILE);
        sslcrt.focus();
        return;
    }

    if( !CheckExtName(sslcrtvaild, ".pem") )
    {
        alert(lang.LANG_CONFIG_SSL_CRTPEM);
        sslcrt.focus();
        return;
    }

    var privkeyvaild = new String(privkey.value);
    if(privkeyvaild.length == 0) {
        alert(lang.LANG_CONFIG_SSL_SEL_PRIKEYFILE);
        privkey.focus();
        return;
    }
    if(!CheckExtName(privkeyvaild, ".pem")) {
         alert(lang.LANG_CONFIG_SSL_PRIKEYPEM);
         privkey.focus();
         return;
    }
    if(exists_cert) {
        UtilsConfirm(lang.LANG_CONFIG_SSL_CRTEXIST, {onOk: uploadkey});
    } else {
        uploadkey();
    }
}

function uploadkey(){}

