var btnModifyPolicy;
var page_click;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function setPasswd() {}

function passwddone(originalRequest)
{
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        page_click = localStorage.getItem("pageClick");
        location.href = bios_config_oob + '&' + 'page_click=' + page_click;
    }
}

function checkEnt(e)
{
    var key = window.event ? e.keyCode : e.which;
    if(key == 13)
    {
        setPasswd();
    }
}

function PageInit()
{
    OutputString();
    btnModifyPolicy = document.getElementById("loginbtn");
    btnModifyPolicy.onclick = function() {
        setPasswd();
    }
    document.getElementById("password_pwd").addEventListener("keydown", checkEnt);
}

function OutputString() {

    document.getElementById("password_td").textContent = lang.LANG_BIOS_LOGIN_PASSWORD;
}
