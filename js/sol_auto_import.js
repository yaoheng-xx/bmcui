
var open_KVM_new_windown;
var windowInterval;
function open_SOL_window() {
    document.getElementById("closeSolWindow")
        .addEventListener("click", CloseSolWindow);
    var term = new Terminal();
    var terminal = document.getElementById('sol_window');
    term.open(terminal);
    var hostname = window.location.host;
    var token = getCSRFToken();
    var host = 'wss://' + hostname + '/console0';
    const attachAddon = new AttachAddon.AttachAddon(new WebSocket(host, [token]), { bidirectional: true });
    term.loadAddon(attachAddon);
    var SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)'
    };
    term.setOption('theme', SOL_THEME);
}
function checkLaunchSolBtn() {
    open_KVM_new_windown = document.getElementById("openSOLNewWindow");
    open_KVM_new_windown.disabled = false;
    window.onbeforeunload = function () {
        open_KVM_new_windown.disabled = false;
    };
    open_KVM_new_windown.addEventListener("click", launchSOL);
    if (getUrlParam("openNewWindowVariable") == 1) {
        open_KVM_new_windown.show();
        document.getElementById("closeSolWindow").hide();
    }
    else {
        window.onbeforeunload = function () {
            if (window.rfb != null) {
                window.rfb.disconnect();
            }
        }
        open_KVM_new_windown.disabled = false;
        document.getElementById("sol_title").show();
    }
}
function CloseSolWindow() {
    window.close();
}
checkLaunchSolBtn();
open_SOL_window();

function launchSOL() {
    var win;
    var strpath = geturlPath() + "page/sol_new_window.html";
    var is_chrome = navigator.userAgent.toLowerCase();
    open_KVM_new_windown.disabled = true;
    is_chrome = (is_chrome.indexOf("chrome") != -1);
    if (is_chrome) {
        win = window.open(strpath, 'HTML5 SOL', "toolbar=no, resizable=no,width=500, height=500, left=450, top=270");
        win.moveTo(0, 0);
        win.resizeTo(screen.availWidth, (screen.availHeight / 100) * 95);
    } else {
        win = window.open(strpath, 'HTML5 SOL', " fullscreen=yes, toolbar=no, resizable=yes, scrollbars=no"); //fullscreen will work in IE and FF
    }
    window.solWindow = win;
    open_KVM_new_windown.disabled = true;
    clearInterval(windowInterval);
    checkPopUpWindowOpen();
}
function checkPopUpWindowOpen() {
    windowInterval = setInterval(function () {
        if (window.solWindow.name != '') {
            open_KVM_new_windown.disabled = true;
        } else {
            open_KVM_new_windown.disabled = false;
            clearInterval(windowInterval);
        }
    }, 1000);
}