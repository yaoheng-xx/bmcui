"use strict";
window.addEventListener('load', PageInit);
if (parent.lang) { var lang = parent.lang; }

function PageInit()
{
    document.getElementById("alert_info_p").textContent = lang.LANG_STR_USER_PRIVILEGE;
}
