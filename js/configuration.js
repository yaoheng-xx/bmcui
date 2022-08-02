window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    document.getElementById("caption").textContent = lang.LANG_CONFIG_CAPTION;
    document.getElementById("desc").textContent = lang.LANG_CONFIG_DESC;
    document.getElementById("confalerts").textContent = lang.LANG_CONFIG_ALERTS;
    document.getElementById("confalerts_desc").textContent = lang.LANG_CONFIG_ALERTS_DESC;
    document.getElementById("confpef").textContent = lang.LANG_CONFIG_PEF;
    document.getElementById("confpef_desc").textContent = lang.LANG_CONFIG_PEF_DESC;
    document.getElementById("dttime").textContent = lang.LANG_CONFIG_DATE_TIME
    document.getElementById("dttime_desc").textContent = lang.LANG_CONFIG_DATE_TIME_DESC;
    document.getElementById("ldap").textContent = lang.LANG_CONFIG_LDAP;
    document.getElementById("ldap_desc").textContent = lang.LANG_CONFIG_LDAP_DESC;
    document.getElementById("ad").textContent = lang.LANG_CONFIG_ACTIVE_DIRECTORY;
    document.getElementById("ad_desc").textContent = lang.LANG_CONFIG_ACTIVE_DIRECTORY_DESC;
    document.getElementById("radius").textContent = lang.LANG_CONFIG_RADIUS;
    document.getElementById("radius_desc").textContent = lang.LANG_CONFIG_RADIUS_DESC;
    document.getElementById("mouse").textContent = lang.LANG_CONFIG_MOUSE_MODE;
    document.getElementById("mouse_desc").textContent = lang.LANG_CONFIG_MOUSE_MODE_DESC;
    document.getElementById("net").textContent = lang.LANG_CONFIG_NETWORK;
    document.getElementById("net_desc").textContent = lang.LANG_CONFIG_NETWORK_DESC;
    document.getElementById("ddns").textContent = lang.LANG_CONFIG_DDNS;
    document.getElementById("ddns_desc").textContent = lang.LANG_CONFIG_DDNS_DESC;
    //document.getElementById("remote").textContent = lang.LANG_CONFIG_REMOTE_SESSION;
    //document.getElementById("remote_desc").textContent = lang.LANG_CONFIG_REMOTE_SESSION_DESC;
    document.getElementById("smtp").textContent = lang.LANG_CONFIG_SMTP;
    document.getElementById("smtp_desc").textContent = lang.LANG_CONFIG_SMTP_DESC;
    document.getElementById("ssl").textContent = lang.LANG_CONFIG_SSL;
    document.getElementById("ssl_desc").textContent = lang.LANG_CONFIG_SSL_DESC;
    document.getElementById("users").textContent = lang.LANG_CONFIG_USERS;
    document.getElementById("users_desc").textContent = lang.LANG_CONFIG_USERS_DESC;
    document.getElementById("ipctrl").textContent = lang.LANG_CONFIG_IPCTRL;
    document.getElementById("ipctrl_desc").textContent = lang.LANG_CONFIG_IPCTRL_DESC;
    document.getElementById("sdrfw").textContent = lang.LANG_CONFIG_SDRFW;
    document.getElementById("sdrfw_desc").textContent = lang.LANG_CONFIG_SDRFW_DESC;

    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(Privilege)
{
    if(Privilege != '04' && Privilege != '03' && Privilege != '02')
    {
        alert(lang.LANG_COMMON_NOPRIVI);
        location.href = "/page/login.html";
    }
}
