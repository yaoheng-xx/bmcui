"use strict";
var currentPwrStatus;
var powerEvent;
var powerctrlInfo;
var initTimeOut;
var Keyboard = null;
var commonKeyboardOptions = null;
var keyboard = null;
var keyboardControlPad = null;
var keyboardArrows = null;
var open_KVM_new_windown;
var windowInterval;
var lang;

var keyMapping = {
    "{escape}": "XK_Escape",
    "{backspace}": "XK_BackSpace",
    "{tab}": "XK_Tab",
    "{capslock}": "XK_Caps_Lock",
    "{enter}": "XK_KP_Enter",
    "{numpadenter}": "XK_KP_Enter",
    "{shiftleft}": "XK_Shift_L",
    "{shiftright}": "XK_Shift_R",
    "{controlleft}": "XK_Control_L",
    "{altleft}": "XK_Alt_L",
    "{metaleft}": "XK_Meta_L",
    "{space}": "XK_space",
    "{metaright}": "XK_Meta_R",
    "{altright}": "XK_Alt_R",

    "{f1}": "XK_F1",
    "{f2}": "XK_F2",
    "{f3}": "XK_F3",
    "{f4}": "XK_F4",
    "{f5}": "XK_F5",
    "{f6}": "XK_F6",
    "{f7}": "XK_F7",
    "{f8}": "XK_F8",
    "{f9}": "XK_F9",
    "{f10}": "XK_F10",
    "{f11}": "XK_F11",
    "{f12}": "XK_F12",

    "1": "XK_1",
    "2": "XK_2",
    "3": "XK_3",
    "4": "XK_4",
    "5": "XK_5",
    "6": "XK_6",
    "7": "XK_7",
    "8": "XK_8",
    "9": "XK_9",
    "0": "XK_0",

    "-": "XK_minus",
    "=": "XK_equal",
    "`": "XK_grave",
    "~": "XK_asciitilde",
    "!": "XK_exclamdown",
    "@": "XK_at",
    "#": "XK_numbersign",
    "$": "XK_dollar",
    "%": "XK_percent",
    "^": "XK_asciicircum",
    "&": "XK_ampersand",
    "*": "XK_asterisk",
    "(": "",
    ")": "",
    "_": "XK_underscore",
    "+": "XK_plus",
    "{": "XK_braceleft",
    "}": "XK_braceright",
    "|": "XK_bar",
    ":": "XK_colon",
    "\"": "XK_guillemotleft",
    "<": "XK_less",
    ">": "XK_greater",
    "?": "XK_question",
    ";": "XK_semicolon",
    "[": "XK_bracketleft",
    "]": "XK_bracketright",
    "\\": "XK_backslash",
    ",": "XK_comma",
    ".": "XK_periodcentered",
    "/": "XK_slash",

    "q": "XK_q",
    "w": "XK_w",
    "e": "XK_e",
    "r": "XK_r",
    "t": "XK_t",
    "y": "XK_y",
    "u": "XK_u",
    "i": "XK_i",
    "o": "XK_o",
    "p": "XK_p",
    "a": "XK_a",
    "s": "XK_s",
    "d": "XK_d",
    "f": "XK_f",
    "g": "XK_g",
    "h": "XK_h",
    "j": "XK_j",
    "k": "XK_k",
    "l": "XK_l",
    "z": "XK_z",
    "x": "XK_x",
    "c": "XK_c",
    "v": "XK_v",
    "b": "XK_b",
    "n": "XK_n",
    "m": "XK_m",

    "Q": "XK_Q",
    "W": "XK_W",
    "E": "XK_E",
    "R": "XK_R",
    "T": "XK_T",
    "Y": "XK_Y",
    "U": "XK_U",
    "I": "XK_I",
    "O": "XK_O",
    "P": "XK_P",
    "A": "XK_A",
    "S": "XK_S",
    "D": "XK_D",
    "F": "XK_F",
    "G": "XK_G",
    "H": "XK_H",
    "J": "XK_J",
    "K": "XK_K",
    "L": "XK_L",
    "Z": "XK_Z",
    "X": "XK_X",
    "C": "XK_C",
    "V": "XK_V",
    "B": "XK_B",
    "N": "XK_N",
    "M": "XK_M",

    "\u00EC": "XK_igrave",
    "\u00E8": "XK_egrave",
    "\u00F2": "XK_ograve",
    "\u00E0": "XK_agrave",
    "\u00F9": "XK_ugrave",
    "\u00A3": "XK_sterling",
    "\u00E9": "XK_eacute",
    "\u00E7": "XK_ccedilla",
    "\u00B0": "XK_degree",
    "\u00A7": "XK_section",
    "\u00a8": "XK_diaeresis",
    "\u00b4": "XK_acute",
    "\u00b1": "XK_plusminus",
    "\u0060": "XK_grave",
    "\u00B2": "XK_twosuperior",
    "\u00B5": "XK_mu",
    "\u00DF": "XK_ssharp",
    "\u00FC": "XK_udiaeresis",
    "\u00F6": "XK_odiaeresis",
    "\u00E4": "XK_adiaeresis",
    "\u00DC": "XK_Udiaeresis",
    "\u00D6": "XK_Odiaeresis",
    "\u00C4": "XK_Adiaeresis",
    "\u007c": "XK_bar",
    "\u00bf": "XK_questiondown",
    "\u00f1": "XK_ntilde",
    "\u007b": "XK_braceleft",
    "\u007d": "XK_braceright",
    "\u00a1": "XK_exclamdown",
    "\u00d1": "XK_Ntilde",
    "\u005b": "XK_bracketleft",
    "\u005d": "XK_bracketright",
    "\u2018": "XK_apostrophe",
    "\u0301": "XK_acute",
    "\u0308": "0x0308",
    "\u0451": "0x0451",
    "\u0439": "0x0439",
    "\u0446": "0x0446",
    "\u0443": "0x0443",
    "\u043a": "0x043A",
    "\u0435": "0x0435",
    "\u043d": "0x043D",
    "\u0433": "0x0433",
    "\u0448": "0x0448",
    "\u0449": "0x0449",
    "\u0437": "0x0437",
    "\u0445": "0x0445",
    "\u044a": "0x044A",
    "\u0444": "0x0444",
    "\u044b": "0x044B",
    "\u0432": "0x0432",
    "\u0430": "0x0430",
    "\u043f": "0x043F",
    "\u0440": "0x0440",
    "\u043e": "0x043E",
    "\u043b": "0x043B",
    "\u0434": "0x0434",
    "\u0436": "0x0436",
    "\u044d": "0x044D",
    "\u044f": "0x044F",
    "\u0447": "0x0447",
    "\u0441": "0x0441",
    "\u043c": "0x043C",
    "\u0438": "0x0438",
    "\u0442": "0x0442",
    "\u044c": "0x044C",
    "\u0431": "0x0431",
    "\u044e": "0x044E",
    "\u0401": "0x0401",
    "\u2116": "0x2116",
    "\u0419": "0x0419",
    "\u0426": "0x0426",
    "\u0423": "0x0423",
    "\u041a": "0x041A",
    "\u0415": "0x0415",
    "\u041d": "0x041D",
    "\u0413": "0x0413",
    "\u0428": "0x0428",
    "\u0429": "0x0429",
    "\u0417": "0x0417",
    "\u0425": "0x0425",
    "\u042a": "0x042A",
    "\u0424": "0x0424",
    "\u042b": "0x042B",
    "\u0412": "0x0412",
    "\u0410": "0x0410",
    "\u041f": "0x041F",
    "\u0420": "0x0420",
    "\u041e": "0x041E",
    "\u041b": "0x041B",
    "\u0414": "0x0414",
    "\u0416": "0x0416",
    "\u042d": "0x042D",
    "\u042f": "0x042F",
    "\u0427": "0x0427",
    "\u0421": "0x0421",
    "\u041c": "0x041C",
    "\u0418": "0x0418",
    "\u0422": "0x0422",
    "\u042c": "0x042C",
    "\u0411": "0x0411",
    "\u042e": "0x042E"
}

import RFB from './novnc/core/rfb.js';
import KEY from './novnc/core/input/keysym.js';

document.getElementById("_SoftKeyboardLayout").style.display = "none";

function open_KVM_windw() {
    if (window.rfb != null) {
        window.rfb.disconnect();
    }
    document.getElementById("_SoftKeyboardLayout").style.display = "none";
    var target = document.getElementById('kvm_window');
    var host = window.location.host;
    var token = getCSRFToken();
    window.rfb = new RFB(target, 'wss://' + host + '/kvm/0', { 'wsProtocols': [token] });
    window.onload = function () {
        document.getElementById("_SoftKeyboardLayout").style.display = "none";
    };
    if (window.rfb != null && window.rfb != undefined) {
        document.getElementById("_SoftKeyboardLayout").style.display = "none";
        document.getElementById("select_language")
            .addEventListener("change", SelectedLanguage);
        document.getElementById("power_control")
            .addEventListener("change", powerControlChanges);
    }
    getPwrStatus();
}

function init_actions() {
    document.getElementById("_SoftKeyboardLayout").style.display = "none";
    var bios_force_enter = document.getElementById("forceEnterBIOS");
    bios_force_enter.addEventListener("click", sendBIOS_Force_enter);
    open_KVM_new_windown = document.getElementById("openKVMNewWindow");
    open_KVM_new_windown.addEventListener("click", launchKVM_Window);
    document.getElementById("send_macro")
        .addEventListener("change", SendSelectedMacro);
    if (getUrlParam("openNewWindowVariable") == 1) {
        open_KVM_new_windown.show();
    }
    else {
        window.onbeforeunload = function () {
            if (window.rfb != null) {
                window.rfb.disconnect();
            }
        }
        document.getElementById("kvm_title").show();
    }
}

function launchKVM_Window() {
    var win;
    var strpath = geturlPath() + "page/man_ikvm_new_window.html";
    var is_chrome = navigator.userAgent.toLowerCase();
    open_KVM_new_windown.disabled = true;
    is_chrome = (is_chrome.indexOf("chrome") != -1);
    if (is_chrome) {
        win = window.open(
            strpath, 'Kvm Window',
            'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1125,height=900');
    } else {
        win = window.open(
            strpath, 'H5Viewer',
            "directories=no,titlebar=no,fullscreen=yes,status=no,location=no,toolbar=no,resizable=yes,scrollbars=no"); // fullscreen will work in IE and FF
    }
    window.kvmWindow = win;
    window.onbeforeunload = function () {
        if (window.rfb != null) {
            window.rfb.disconnect();
        }
        open_KVM_new_windown.disabled = false;
    }
    checkPopUpWindowOpen();
}

function checkPopUpWindowOpen() {
    windowInterval = setInterval(function () {
        if (window.kvmWindow.name != '') {
            open_KVM_new_windown.disabled = true;
        } else {
            open_KVM_new_windown.disabled = false;
            clearInterval(windowInterval);
        }
    }, 1000);
}

function sendBIOS_Force_enter() {
    var ajax_url = '/redfish/v1/Systems/system';
    var ajax_req = new Ajax.Request(ajax_url, {
        method: 'PATCH',
        contentType: "application/json",
        timeout: g_CGIRequestTimeout,
        ontimeout: onCGIRequestTimeout,
        parameters: JSON.stringify({
            "Boot": {
                "BootSourceOverrideTarget": "BiosSetup",
                "BootSourceOverrideEnabled": "Once"
            }
        }),
        onFailure: function (response) {
            alert("Unable to Set BIOS Setup Boot Mode.", { title: "Error!" });
        },
        onSuccess: responseForceEnterBIOS_Status
    });
}

function responseForceEnterBIOS_Status(response) {
    if (response.readyState == 4 && response.status == 204) {
        do_host_reboot();
    }
}

function do_host_reboot() {

    var ajax_url = '/redfish/v1/Systems/system/Actions/ComputerSystem.Reset';
    var ajax_req = new Ajax.Request(ajax_url, {
        method: 'POST',
        contentType: "application/json",
        parameters: JSON.stringify({ "ResetType": "ForceRestart" }),
        timeout: g_CGIRequestTimeout,
        ontimeout: onCGIRequestTimeout,
        onFailure: function (
            response) { alert("Reboot Failed.", { title: "Error!" }); },
        onSuccess: responseHostRebootStatus
    });
}

function responseHostRebootStatus(response) {
    if (response.readyState == 4 && response.status == 200) {
        alert(
            '"Force-Enter BIOS Setup has been pressed, Host is rebooting.\n It will take some time to boot into BIOS Setup.',
            { title: "Success!" });
    }
}

function SendSelectedMacro() {
    var selector = document.getElementById("send_macro");
    var index = 0;
    var macro_value = '';

    if (selector != null) {
        index = selector.selectedIndex;
        macro_value = selector.options[index].value;
    }
    if (macro_value != '' && macro_value != null) {
        switch (macro_value) {
            case 'altTab':
                altTab();
                break;
            case 'CtrlAltDelete':
                CtrlAltDelete();
                break;
            case 'AltSpace':
                AltSpace();
                break;
            case 'AltEsc':
                AltEsc();
                break;
            case 'AltEnter':
                AltEnter();
                break;
            case 'Print':
                Print();
                break;
            case 'AltF4':
                AltF4();
                break;
            case 'CtrlEsc':
                CtrlEsc();
                break;
            case 'CtrlTab':
                CtrlTab();
                break;
            default:
                break;
        }
    }
    selector.selectedIndex = 0;
}

function altTab() {
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", true);
    window.rfb.sendKey(KEY.XK_Tab, "Tab", true);
    window.rfb.sendKey(KEY.XK_Tab, "Tab", false);
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", false);
}
function CtrlAltDelete() { window.rfb.sendCtrlAltDel(); }
function AltSpace() {
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", true);
    window.rfb.sendKey(KEY.XK_space, "Space", true);
    window.rfb.sendKey(KEY.XK_space, "Space", false);
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", false);
}
function AltEsc() {
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", true);
    window.rfb.sendKey(KEY.XK_Escape, "Escape", true);
    window.rfb.sendKey(KEY.XK_Escape, "Escape", false);
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", false);
}
function AltEnter() {
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", true);
    window.rfb.sendKey(KEY.XK_Return, "Return", true);
    window.rfb.sendKey(KEY.XK_Return, "Return", false);
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", false);
}
function Print() {
    window.rfb.sendKey(KEY.XK_Print, "Print", true);
    window.rfb.sendKey(KEY.XK_Print, "Print", false);
}
function AltF4() {
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", true);
    window.rfb.sendKey(KEY.XK_F4, "F4", true);
    window.rfb.sendKey(KEY.XK_F4, "F4", false);
    window.rfb.sendKey(KEY.XK_Alt_L, "AltLeft", false);
}
function CtrlEsc() {
    window.rfb.sendKey(KEY.XK_Control_L, "ControlLeft", true);
    window.rfb.sendKey(KEY.XK_Escape, "Escape", true);
    window.rfb.sendKey(KEY.XK_Escape, "Escape", false);
    window.rfb.sendKey(KEY.XK_Control_L, "ControlLeft", false);
}
function CtrlTab() {
    window.rfb.sendKey(KEY.XK_Control_L, "ControlLeft", true);
    window.rfb.sendKey(KEY.XK_Tab, "Tab", true);
    window.rfb.sendKey(KEY.XK_Tab, "Tab", false);
    window.rfb.sendKey(KEY.XK_Control_L, "ControlLeft", false);
}

function SelectedLanguage() {
    var selector = document.getElementById("select_language");
    var index = 0;
    var language_value = '';

    if (selector != null) {
        index = selector.selectedIndex;
        language_value = selector.options[index].value;
    }
    if (language_value) {
        document.getElementById("_SoftKeyboardLayout").style.display = null;
        var displayObj = {
            display: {
                "{escape}": "Esc",
                "{tab}": "Tab",
                "{backspace}": "backspace",
                "{enter}": "Enter",
                "{capslock}": "Caps Lock",
                "{shiftleft}": "shift",
                "{shiftright}": "shift",
                "{controlleft}": "Fn",
                "{controlright}": "ctrl",
                "{altleft}": "alt",
                "{altright}": "alt",
                "{metaleft}": "ctrl",
                "{metaright}": "ctrl"
            }
        };
        switch (language_value) {
            case 'english':
                var layoutObj = {
                    layout: {
                        default: [
                            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
                            "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
                            "{tab} q w e r t y u i o p [ ] \\",
                            "{capslock} a s d f g h j k l ; ' {enter}",
                            "{shiftleft} z x c v b n m , . / {shiftright}",
                            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright}"
                        ],
                        shift: [
                            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
                            "~ ! @ # $ % ^ & * ( ) _ + {backspace}",
                            "{tab} Q W E R T Y U I O P { } |",
                            '{capslock} A S D F G H J K L : " {enter}',
                            "{shiftleft} Z X C V B N M < > ? {shiftright}",
                            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright}"
                        ]
                    }
                };
                renderSoftKeyboard(layoutObj, displayObj);
                break;
            case 'italian':
                var layoutObj = {
                    layout: {
                        default: [
                            "\\ 1 2 3 4 5 6 7 8 9 0 ' \u00EC {bksp}",
                            "{tab} q w e r t y u i o p \u00E8 +",
                            "{lock} a s d f g h j k l \u00F2 \u00E0 \u00F9 {enter}",
                            "{shift} < z x c v b n m , . - {shift}",
                            ".com @ {space}",
                        ],
                        shift: [
                            '| ! " \u00A3 $ % & / ( ) = ? ^ {bksp}',
                            "{tab} Q W E R T Y U I O P \u00E9 *",
                            "{lock} A S D F G H J K L \u00E7 \u00B0 \u00A7 {enter}",
                            "{shift} > Z X C V B N M ; : _ {shift}",
                            ".com @ {space}",
                        ],
                    }
                };
                renderSoftKeyboard(layoutObj, displayObj);
                break;
            case 'dutch':
                var layoutObj = {
                    layout: {
                        default: [
                            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
                            "@ 1 2 3 4 5 6 7 8 9 0 / \u00b0 {backspace}",
                            "{tab} q w e r t y u i o p \u00a8 * <",
                            "{capslock} a s d f g h j k l + \u00b4 {enter}",
                            "{shiftleft} ] z x c v b n m , . - {shiftright}",
                            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright}"
                        ],
                        shift: [
                            "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
                            "\u00a7 ! ” # $ % & _ ( ) \u2018 ? ~ {backspace}",
                            "{tab} Q W E R T Y U I O P ^ | >",
                            '{capslock} A S D F G H J K L \u00b1 \u0060 {enter}',
                            "{shiftleft} [ Z X C V B N M ; : = {shiftright}",
                            "{controlleft} {altleft} {metaleft} {space} {metaright} {altright}"
                        ]
                    }
                };
                renderSoftKeyboard(layoutObj, displayObj);
                break;
            case 'french':
                var layoutObj = {
                    layout: {
                        default: [
                            "` 1 2 3 4 5 6 7 8 9 0 \u00B0 + {bksp}",
                            "{tab} a z e r t y u i o p ^ $",
                            "{lock} q s d f g h j k l m \u00F9 * {enter}",
                            "{shift} < w x c v b n , ; : ! {shift}",
                            ".com @ {space}",
                        ],
                        shift: [
                            "\u00B2 & \u00E9 \" ' ( - \u00E8 _ \u00E7 \u00E0 ) = {bksp}",
                            "{tab} A Z E R T Y U I O P \u00A8 \u00A3",
                            "{lock} Q S D F G H J K L M % \u00B5 {enter}",
                            "{shift} > W X C V B N ? . / \u00A7 {shift}",
                            ".com @ {space}",
                        ],
                    }
                };
                renderSoftKeyboard(layoutObj, displayObj);
                break;
            case 'german':
                var layoutObj = {
                    layout: {
                        default: [
                            "^ 1 2 3 4 5 6 7 8 9 0 \u00DF \u00B4 {bksp}",
                            "{tab} q w e r t z u i o p \u00FC +",
                            "{lock} a s d f g h j k l \u00F6 \u00E4 # {enter}",
                            "{shift} < y x c v b n m , . - {shift}",
                            ".com @ {space}",
                        ],
                        shift: [
                            '\u00B0 ! " \u00A7 $ % & / ( ) = ? ` {bksp}',
                            "{tab} Q W E R T Z U I O P \u00DC *",
                            "{lock} A S D F G H J K L \u00D6 \u00C4 ' {enter}",
                            "{shift} > Y X C V B N M ; : _ {shift}",
                            ".com @ {space}",
                        ],
                    }
                };
                renderSoftKeyboard(layoutObj, displayObj);
                break;
            case 'russian':
                var layoutObj = {
                    layout: {
                        default: [
                            "\u0451 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                            "{tab} \u0439 \u0446 \u0443 \u043a \u0435 \u043d \u0433 \u0448 \u0449 \u0437 \u0445 \u044a \\",
                            "{lock} \u0444 \u044b \u0432 \u0430 \u043f \u0440 \u043e \u043b \u0434 \u0436 \u044d {enter}",
                            "{shift} / \u044f \u0447 \u0441 \u043c \u0438 \u0442 \u044c \u0431 \u044e . {shift}",
                            ".com @ {space}",
                        ],
                        shift: [
                            '\u0401 ! " \u2116 ; % : ? * ( ) _ + {bksp}',
                            "{tab} \u0419 \u0426 \u0423 \u041a \u0415 \u041d \u0413 \u0428 \u0429 \u0417 \u0425 \u042a /",
                            "{lock} \u0424 \u042b \u0412 \u0410 \u041f \u0420 \u041e \u041b \u0414 \u0416 \u042d {enter}",
                            "{shift} | \u042f \u0427 \u0421 \u041c \u0418 \u0422 \u042c \u0411 \u042e , {shift}",
                            ".com @ {space}",
                        ],
                    }
                };
                renderSoftKeyboard(layoutObj, displayObj);
                break;
            case 'spanish':
                var layoutObj = {
                    layout: {
                        default: [
                            "\u007c 1 2 3 4 5 6 7 8 9 0 ' \u00bf {bksp}",
                            "{tab} q w e r t y u i o p \u0301 +",
                            "{lock} a s d f g h j k l \u00f1 \u007b \u007d {enter}",
                            "{shift} < z x c v b n m , . - {shift}",
                            ".com @ {space}",
                        ],
                        shift: [
                            '\u00b0 ! " # $ % & / ( ) = ? \u00a1 {bksp}',
                            "{tab} Q W E R T Y U I O P \u0308 *",
                            "{lock} A S D F G H J K L \u00d1 \u005b \u005d {enter}",
                            "{shift} > Z X C V B N M ; : _ {shift}",
                            ".com @ {space}",
                        ],
                    }
                };
                renderSoftKeyboard(layoutObj, displayObj);
                break;
            default:
                document.getElementById("_SoftKeyboardLayout").style.display = "none";
        }
    }
}

function renderSoftKeyboard(layoutData, displayData) {
    if (keyboard) {
        keyboard.destroy();
    }
    if (keyboardControlPad) {
        keyboardControlPad.destroy();
    }
    if (keyboardArrows) {
        keyboardArrows.destroy();
    }

    Keyboard = window.SimpleKeyboard.default;
    commonKeyboardOptions = {
        onKeyPress: function (button) { KeyPadOnKeyPress(button); },
        theme: "simple-keyboard hg-theme-default hg-layout-default",
        physicalKeyboardHighlight: false,
        syncInstanceInputs: true,
        mergeDisplay: true,
        debug: false
    };

    // Render Main Keyboard
    keyboard =
        new Keyboard(".simple-keyboard-main",
            { ...commonKeyboardOptions, ...layoutData, ...displayData });

    // Render Keyboard controls
    keyboardControlPad = new Keyboard(".simple-keyboard-control", {
        ...commonKeyboardOptions,
        layout: {
            default: [
                "{prtscr} {scrolllock} {pause}", "{insert} {home} {pageup}",
                "{delete} {end} {pagedown}"
            ]
        }
    });

    // Render Keyboard arrow buttons
    keyboardArrows = new Keyboard(".simple-keyboard-arrows", {
        ...commonKeyboardOptions,
        layout: { default: ["{arrowup}", "{arrowleft} {arrowdown} {arrowright}"] }
    });

    function KeyPadOnKeyPress(button) {
        var keyID = keyMapping[button];
        var keyvalue = button;
        if (button === "{shift}" || button === "{shiftleft}" ||
            button === "{shiftright}") {
            handleShift(keyID, keyvalue);
        } else if (button === "{capslock}" || button === "{lock}") {
            window.rfb.sendKey(KEY[keyID], keyvalue, true);
            window.rfb.sendKey(KEY[keyID], keyvalue, false);
        } else {
            window.rfb.sendKey(KEY[keyID], keyvalue, true);
            window.rfb.sendKey(KEY[keyID], keyvalue, false);
        }
    }

    function handleShift(keyID, keyvalue) {
        let currentLayout = keyboard.options.layoutName;
        let shiftToggle = currentLayout === "default" ? "shift" : "default";
        if (shiftToggle == "shift") {
            window.rfb.sendKey(KEY[keyID], keyvalue, true);
        } else {
            window.rfb.sendKey(KEY[keyID], keyvalue, true);
            window.rfb.sendKey(KEY[keyID], keyvalue, false);
        }
        keyboard.setOptions({ layoutName: shiftToggle });
    }
}

function getPwrStatus() {
    var ajax_url = '/redfish/v1/Systems/system';
    var ajax_req = new Ajax.Request(ajax_url, {
        method: 'GET',
        onSuccess: getPwrStatusHandler,
        onFailure: function () { alert(lang.CONF_LOGIN_STR_WEB_TIMEOUT); }
    });
}

function getPwrStatusHandler(arg) {
    if (arg.readyState == 4 && arg.status == 200) {
        powerctrlInfo = JSON.parse(arg.responseText);
        currentPwrStatus = powerctrlInfo.PowerState == "Off" ? 0 : 1;
        if (currentPwrStatus == 0) // power status if off
        {
            document.getElementById("power_on").removeAttribute("disabled");
            document.getElementById("power_off").setAttribute("disabled", "disabled");
            document.getElementById("software_shutdown")
                .setAttribute("disabled", "disabled");
            document.getElementById("power_reset")
                .setAttribute("disabled", "disabled");
        } else // power status is on
        {
            document.getElementById("power_on").setAttribute("disabled", "disabled");
            document.getElementById("power_off").removeAttribute("disabled");
            document.getElementById("software_shutdown").removeAttribute("disabled");
            document.getElementById("power_reset").removeAttribute("disabled");
        }
    }
}
function powerControlChanges() {
    var selector = document.getElementById("power_control");
    var index = 0;
    var data = {};
    var ajaxUrl = '/redfish/v1/Systems/system/Actions/ComputerSystem.Reset';
    index = selector.selectedIndex;
    powerEvent = selector.options[index].value;
    if (selector != null && powerEvent != "Power Control") {
        switch (powerEvent) {
            case "power_off":
                // Power Off Server - Immediate
                data = { "ResetType": "ForceOff" };
                break;
            case "power_on":
                // Power On Server
                data = { "ResetType": "On" };
                break;
            case "power_reset":
                // Reset Server
                data = { "ResetType": "ForceRestart" };
                break;
            case "software_shutdown":
                // Software Shutdown
                data = { "ResetType": "GracefulShutdown" };
                break;
        }
        var ajax_req = new Ajax.Request(ajaxUrl, {
            method: 'POST',
            contentType: "application/json",
            parameters: JSON.stringify(data),
            onSuccess: doPwrActionHandler,
            onFailure: function () { alert("Power Operation Failed"); }
        });
    }
}
function doPwrActionHandler(arg) {
    if (arg.readyState == 4 && arg.status == 200) {
        if (powerEvent == "power_reset") {
            initTimeOut = 20000;
        } else if (powerEvent == "power_off") {
            initTimeOut = 30000;
        } else {
            initTimeOut = 10000;
        }
        setTimeout(getPwrStatus, initTimeOut);
        return;
    }
}
open_KVM_windw();
init_actions();
