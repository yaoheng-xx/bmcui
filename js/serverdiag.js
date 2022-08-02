window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    document.getElementById("caption").textContent = lang.LANG_TOPMENU_SERVER_DIAGNOSTICS;
    document.getElementById("desc").textContent = lang.LANG_SERVER_DIAGNOSTICS_DESC;
    document.getElementById("submtitle").textContent = lang.LANG_SERVER_DIAGNOSTICS_SUBMENU_POST_CODES;
    document.getElementById("submdesc").textContent = lang.LANG_SERVER_DIAGNOSTICS_POST_CODES_DESC;
    //document.getElementById("submpwr").textContent = lang.LANG_REMOTE_PWR_CTRL;
    //document.getElementById("submpwrdesc").textContent = lang.LANG_REMOTE_PWR_CTRL_DESC;
}
