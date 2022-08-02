window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit() {
    document.getElementById("cap_div").textContent = lang.LANG_REMOTE_CAPTION;
    document.getElementById("desc_div").textContent = lang.LANG_REMOTE_DESC;
    document.getElementById("redir_span").textContent = lang.LANG_REMOTE_CONSOL_REDIRECT;
    document.getElementById("redir_desc_spn").textContent = lang.LANG_REMOTE_CONSOL_REDIRECT_DESC;
    document.getElementById("pwr_ctrl_spn").textContent = lang.LANG_REMOTE_PWR_CTRL;
    document.getElementById("pwr_ctrl_desc_spn").textContent = lang.LANG_REMOTE_PWR_CTRL_DESC;
}
