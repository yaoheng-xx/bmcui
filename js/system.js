window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    document.getElementById("caption").textContent = lang.LANG_SYSTEM_CAPTION;
    document.getElementById("desc").textContent = lang.LANG_SYSTEM_DESC;
    document.getElementById("sysinfo").textContent = lang.LANG_SYSTEM_SYS_INFO_TITLE;
    document.getElementById("sysinfo_desc").textContent = lang.LANG_SYSTEM_SYS_INFO_DESC;
    document.getElementById("sysfru").textContent = lang.LANG_SYSTEM_FRU_TITLE;
    document.getElementById("sysfru_desc").textContent = lang.LANG_SYSTEM_FRU_DESC;
    document.getElementById("syscpu").textContent = lang.LANG_SYSTEM_CPU_INFO_TITLE;
    document.getElementById("syscpu_desc").textContent = lang.LANG_SYSTEM_CPU_INFO_DESC;
    document.getElementById("sysdimm").textContent = lang.LANG_SYSTEM_DIMM_INFO_TITLE;
    document.getElementById("sysdimm_desc").textContent = lang.LANG_SYSTEM_DIMM_INFO_DESC;
    document.getElementById("sysusers").textContent = lang.LANG_SYSTEM_CURRENTUSERS_INFO_TITLE;
    document.getElementById("sysusers_desc").textContent = lang.LANG_SYSTEM_CURRENT_USERS_DESC;

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
