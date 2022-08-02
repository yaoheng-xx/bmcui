/*
   global variables
 */

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    // Get multi-language string
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_ad_here_help.html";
    document.title = lang.LANG_AD_ADV_TITLE;
    document.getElementById("saveBtn").value = lang.LANG_AD_ADV_SAVE;
    document.getElementById("cancelBtn").value = lang.LANG_AD_ADV_CANCEL;

    document.getElementById("caption_div").textContent = lang.LANG_AD_ADV_CAPTION;
    document.getElementById("adadv_enable").textContent = lang.LANG_AD_ADV_ENABLE

    document.getElementById("enableAD").addEventListener("click", checkAd);

    obj = document.getElementById("enableSSL");
    obj.textContent = lang.LANG_AD_ADV_SSL;
    obj.addEventListener("click", checkSSL);

    document.getElementById("lanb_adv_port").textContent = lang.LANB_AD_ADV_PORT;
    document.getElementById("userdomain").textContent = lang.LANG_AD_ADV_USERDOMAIN;
    document.getElementById("sp_timeout").textContent = lang.LANG_AD_ADV_TIMEOUT;
    document.getElementById("advsrv1").textContent = lang.LANG_AD_ADV_SRV1;
    document.getElementById("advsrv2").textContent = lang.LANG_AD_ADV_SRV2;
    document.getElementById("advsrv3").textContent = lang.LANG_AD_ADV_SRV3;

    document.getElementById("saveBtn").addEventListener("click", saveAdConfig);
    document.getElementById("cancelBtn").addEventListener("click", cancelAdConfig);

    CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(privilege)
{
    if(privilege == '04')
    {
        //full access
        getAdConfig();
    }
    else if(privilege == '03')
    {
        //read only
        getAdConfig();
        document.getElementById("saveBtn").disabled = true;
        document.getElementById("cancelBtn").disabled = true;
    }
    else
    {
        //no access
        location.href = SubMainPage;
        return;
    }
}

function getAdConfig() {}

function getAdConfigHandler(originalRequest)
{
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc = GetResponseXML(response);

        // check session & privilege
        if(CheckInvalidResult(xmldoc) < 0) {
            return;
        }

        var IPMIRoot = xmldoc.documentElement;
        var ad_info = IPMIRoot.getElementsByTagName("AD_INFO");
        var ad_server = IPMIRoot.getElementsByTagName("AD_SERVER");
        if (ad_info.length > 0){
            if(parseInt(ad_info[0].getAttribute("EN"), 10))
            {
                enableAd();
            }
            else
            {
                disableAd();
            }
            if(parseInt(ad_info[0].getAttribute("EN_SSL"), 10) == 1) {
                document.getElementById("enableSSL").checked = true;
            }
            else {
                document.getElementById("enableSSL").checked = false;
            }
            document.getElementById("ad_port").value = ad_info[0].getAttribute("PORT");
            document.getElementById("userDomain").value = ad_info[0].getAttribute("DN");
            document.getElementById("timeout").value = ad_info[0].getAttribute("TimeOut");
            document.getElementById("adServer1").value = ad_server[0].getAttribute("IP1");
            document.getElementById("adServer2").value = ad_server[0].getAttribute("IP2");
            document.getElementById("adServer3").value = ad_server[0].getAttribute("IP3");
        }
        else {
            alert (lang.LANG_AD_ADV_GET_FAIL);
        }
    }
}

function responseAdConfigHandler(originalRequest)
{
    Loading(false);
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
    var result = GetXMLNodeValue(xmldoc, "RESULT");
    if(result == "OK") {
        alert(lang.LANG_AD_ADV_SET_SUCCUSS, {title: lang.LANG_GENERAL_SUCCESS});
    }
}


function enableAd()
{
    document.getElementById("enableAD").checked = true;
    document.getElementById("enableSSL").disabled = false;
    document.getElementById("ad_port").disabled = false;
    document.getElementById("userDomain").disabled = false;
    document.getElementById("timeout").disabled = false;
    document.getElementById("adServer1").disabled = false;
    document.getElementById("adServer2").disabled = false;
    document.getElementById("adServer3").disabled = false;
}

function disableAd()
{
    document.getElementById("enableAD").checked = false;
    document.getElementById("enableSSL").disabled = true;
    document.getElementById("ad_port").disabled = true;
    document.getElementById("userDomain").disabled = true;
    document.getElementById("timeout").disabled = true;
    document.getElementById("adServer1").disabled = true;
    document.getElementById("adServer2").disabled = true;
    document.getElementById("adServer3").disabled = true;
}

function checkSSL()
{
    if(document.getElementById("enableSSL").checked == true)
        document.getElementById("ad_port").value = '636';
    else
        document.getElementById("ad_port").value = '389';
}

function checkAd()
{
    if (document.getElementById("enableAD").checked == true)
    {
        getLdapConfig();
    }
    else
        disableAd();
}

function getLdapConfig() {}

function getLdapConfigHandler(originalRequest)
{
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        var response = originalRequest.responseText;
        response = response.replace(/^\s+|\s+$/g,"");
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

        enableAd();
    }
}

function saveAdConfig() {}

function saveAdConfigHandler()
{
    Loading(false);
    alert(lang.LANG_AD_ADV_SET_SUCCUSS, {title: lang.LANG_GENERAL_SUCCESS,
        onClose: function() {location.href = cfgAdPage;}});
}

function cancelAdConfig()
{
    location.href = cfgAdPage;
}
