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
if (parent.lang) { lang = parent.lang; }

var keyMappingForArrowKeys = {
  "{arrowup}" : "XK_Up",
  "{arrowleft}" : "XK_Left",
  "{arrowdown}" : "XK_Down",
  "{arrowright}" : "XK_Right"
};

var scanCodeLayoutObj = {
  layout : {
    default : [
      "{XK_Escape} {XK_F1} {XK_F2} {XK_F3} {XK_F4} {XK_F5} {XK_F6} {XK_F7} {XK_F8} {XK_F9} {XK_F10} {XK_F11} {XK_F12}",
      "{XK_grave} {XK_1} {XK_2} {XK_3} {XK_4} {XK_5} {XK_6} {XK_7} {XK_8} {XK_9} {XK_0} {XK_minus} {XK_equal} {XK_BackSpace}",
      "{XK_Tab} {XK_q} {XK_w} {XK_e} {XK_r} {XK_t} {XK_y} {XK_u} {XK_i} {XK_o} {XK_p} {XK_bracketleft} {XK_bracketright} {XK_backslash}",
      "{XK_Caps_Lock} {XK_a} {XK_s} {XK_d} {XK_f} {XK_g} {XK_h} {XK_j} {XK_k} {XK_l} {XK_semicolon} {XK_apostrophe} {XK_KP_Enter}",
      "{XK_Shift_L} {XK_z} {XK_x} {XK_c} {XK_v} {XK_b} {XK_n} {XK_m} {XK_comma} {XK_dot} {XK_slash} {XK_Shift_R}",
      "{XK_Control_L} {XK_Alt_L} {XK_Meta_L} {space} {XK_Meta_R} {XK_Alt_R}"
    ],
    shift : [
      "{XK_Escape} {XK_F1} {XK_F2} {XK_F3} {XK_F4} {XK_F5} {XK_F6} {XK_F7} {XK_F8} {XK_F9} {XK_F10} {XK_F11} {XK_F12}",
      "{XK_asciitilde} {XK_exclam} {XK_at} {XK_numbersign} {XK_dollar} {XK_percent} {XK_asciicircum} {XK_ampersand} {XK_asterisk} {XK_left_bracket} {XK_right_bracket} {XK_underscore} {XK_plus} {XK_BackSpace}",
      "{XK_Tab} {XK_Q} {XK_W} {XK_E} {XK_R} {XK_T} {XK_Y} {XK_U} {XK_I} {XK_O} {XK_P} {XK_braceleft} {XK_braceright} {XK_bar}",
      '{XK_Caps_Lock} {XK_A} {XK_S} {XK_D} {XK_F} {XK_G} {XK_H} {XK_J} {XK_K} {XK_L} {XK_colon} {XK_quotedbl} {XK_KP_Enter}',
      "{XK_Shift_L} {XK_Z} {XK_X} {XK_C} {XK_V} {XK_B} {XK_N} {XK_M} {XK_less} {XK_greater} {XK_question} {XK_Shift_R}",
      "{XK_Control_L} {XK_Alt_L} {XK_Meta_L} {space} {XK_Meta_R} {XK_Alt_R}"
    ],
    caps : [
      "{XK_Escape} {XK_F1} {XK_F2} {XK_F3} {XK_F4} {XK_F5} {XK_F6} {XK_F7} {XK_F8} {XK_F9} {XK_F10} {XK_F11} {XK_F12}",
      "{XK_grave_caps} {XK_1} {XK_2_caps} {XK_3} {XK_4} {XK_5} {XK_6} {XK_7_caps} {XK_8} {XK_9_caps} {XK_0_caps} {XK_minus_caps} {XK_equal_caps} {XK_BackSpace}",
      "{XK_Tab} {XK_Q} {XK_W} {XK_E} {XK_R} {XK_T} {XK_Y} {XK_U} {XK_I} {XK_O} {XK_P} {XK_bracketleft_caps} {XK_bracketright} {XK_backslash_caps}",
      "{XK_Caps_Lock} {XK_A} {XK_S} {XK_D} {XK_F} {XK_G} {XK_H} {XK_J} {XK_K} {XK_L} {XK_semicolon_caps} {XK_apostrophe_caps} {XK_KP_Enter}",
      "{XK_Shift_L} {XK_Z} {XK_X} {XK_C} {XK_V} {XK_B} {XK_N} {XK_M_caps} {XK_comma} {XK_dot} {XK_slash} {XK_Shift_R}",
      "{XK_Control_L} {XK_Alt_L} {XK_Meta_L} {space} {XK_Meta_R} {XK_Alt_R}"
    ]
  }
};

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
    bios_force_enter.textContent = lang.LANG_IKVM_POWERCONTROL_FORCE_ENTER_BIOS;
    bios_force_enter.addEventListener("click", sendBIOS_Force_enter);
    open_KVM_new_windown = document.getElementById("openKVMNewWindow");
    open_KVM_new_windown.textContent = lang.LANG_IKVM_HTML5_NEW_WINDOW;
    open_KVM_new_windown.addEventListener("click", launchKVM_Window);
    document.getElementById("send_macro")
        .addEventListener("change", SendSelectedMacro);
    document.getElementById("send_macro")
        .options[0].text = lang.LANG_IKVM_HTML5_KEYBOARD_KEYBOARD_MACRO;
    var keyboardSelect = document.getElementById("select_language");
    keyboardSelect.options[0].text = lang.LANG_IKVM_HTML5_KEYBOARD_BUTTION;
    keyboardSelect.options["english"].text = lang.LANG_IKVM_HTML5_KEYBOARD_ENGLISH;
    // keyboardSelect.options["dutch"].text = lang.LANG_IKVM_HTML5_KEYBOARD_DUTCH;
    // keyboardSelect.options["french"].text = lang.LANG_IKVM_HTML5_KEYBOARD_FRENCH;
    // keyboardSelect.options["german"].text = lang.LANG_IKVM_HTML5_KEYBOARD_GERMAN;
    // keyboardSelect.options["italian"].text = lang.LANG_IKVM_HTML5_KEYBOARD_ITALIAN;
    // keyboardSelect.options["russian"].text = lang.LANG_IKVM_HTML5_KEYBOARD_RUSSIAN;
    // keyboardSelect.options["spanish"].text = lang.LANG_IKVM_HTML5_KEYBOARD_SPANISH;

    var powerCtl = document.getElementById("power_control");
    powerCtl.options[0].text = lang.LANG_IKVM_HTML5_POWERCONTROL;
    powerCtl.options["power_on"].text = lang.LANG_IKVM_HTML5_POWERCONTROL_ON;
    powerCtl.options["power_off"].text = lang.LANG_IKVM_HTML5_POWERCONTROL_OFF;
    powerCtl.options["software_shutdown"].text = lang.LANG_IKVM_HTML5_POWERCONTROL_SHUTDOWN;
    powerCtl.options["power_reset"].text = lang.LANG_IKVM_HTML5_POWERCONTROL_RESET;

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
            alert(lang.LANG_IKVM_POWERCONTROL_FORCE_ENTER_BIOS_ERROR,
                { title: lang.LANG_GENERAL_ERROR });
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
        onFailure: function (response) {
            alert(lang.LANG_IKVM_POWERCONTROL_REBOOT_FAILED,
                { title: lang.LANG_GENERAL_ERROR }); },
        onSuccess: responseHostRebootStatus
    });
}

function responseHostRebootStatus(response) {
    if (response.readyState == 4 && response.status == 200) {
        alert(lang.LANG_IKVM_POWERCONTROL_FORCE_ENTER_BIOS_INFO,
            { title: lang.LANG_GENERAL_SUCCESS });
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
      switch (language_value) {
      case 'english':
        var displayObjEnglish = {
          display : {
            // First Row - Function Keys and Esc
            // ------------------------------------------------------------
            // //
            "{XK_Escape}" : "Esc",
            "{XK_F1}" : "F1",
            "{XK_F2}" : "F2",
            "{XK_F3}" : "F3",
            "{XK_F4}" : "F4",
            "{XK_F5}" : "F5",
            "{XK_F6}" : "F6",
            "{XK_F7}" : "F7",
            "{XK_F8}" : "F8",
            "{XK_F9}" : "F9",
            "{XK_F10}" : "F10",
            "{XK_F11}" : "F11",
            "{XK_F12}" : "F12",
            // ------------------------------------------------------------
            // //
            // Second Row - Numbers, Backspace and Special Characters
            "{XK_grave}" : "`",
            "{XK_1}" : "1",
            "{XK_2}" : "2",
            "{XK_3}" : "3",
            "{XK_4}" : "4",
            "{XK_5}" : "5",
            "{XK_6}" : "6",
            "{XK_7}" : "7",
            "{XK_8}" : "8",
            "{XK_9}" : "9",
            "{XK_0}" : "0",
            "{XK_minus}" : "-",
            "{XK_equal}" : "=",
            "{XK_BackSpace}" : "Backspace",
            // ------------------------------------------------------------
            // //
            // Third Row - Qwerty, Tab and special Characters
            "{XK_Tab}" : "Tab",
            "{XK_q}" : "q",
            "{XK_w}" : "w",
            "{XK_e}" : "e",
            "{XK_r}" : "r",
            "{XK_t}" : "t",
            "{XK_y}" : "y",
            "{XK_u}" : "u",
            "{XK_i}" : "i",
            "{XK_o}" : "o",
            "{XK_p}" : "p",
            "{XK_bracketleft}" : "[",
            "{XK_bracketright}" : "]",
            "{XK_backslash}" : "\\",
            // ------------------------------------------------------------
            // //
            // Fourth Row - Caps Lock, asdf, enter and special characters
            "{XK_Caps_Lock}" : "Caps Lock",
            "{XK_a}" : "a",
            "{XK_s}" : "s",
            "{XK_d}" : "d",
            "{XK_f}" : "f",
            "{XK_g}" : "g",
            "{XK_h}" : "h",
            "{XK_j}" : "j",
            "{XK_k}" : "k",
            "{XK_l}" : "l",
            "{XK_semicolon}" : ";",
            "{XK_apostrophe}" : "'",
            "{XK_KP_Enter}" : "Enter",
            // ------------------------------------------------------------
            // //
            // Fifth Row - Shift, zxcv and special characters
            "{XK_Shift_L}" : "Shift",
            "{XK_z}" : "z",
            "{XK_x}" : "x",
            "{XK_c}" : "c",
            "{XK_v}" : "v",
            "{XK_b}" : "b",
            "{XK_n}" : "n",
            "{XK_m}" : "m",
            "{XK_comma}" : ",",
            "{XK_dot}" : ".",
            "{XK_slash}" : "/",
            "{XK_Shift_R}" : "Shift",
            // ------------------------------------------------------------
            // //
            // Last Row - Space and Control
            "{XK_Control_L}" : "Ctrl",
            "{XK_Alt_L}" : "Alt",
            "{XK_Meta_L}" : "Ctrl",
            "{XK_space}" : "Space",
            "{XK_Meta_R}" : "Ctrl",
            "{XK_Alt_R}" : "Alt",
            // ------------------------------------------------------------
            // //
            // ------------------------------------------------------------
            // //
            // With Shift hold - First
            "{XK_asciitilde}" : "~",
            "{XK_exclam}" : "!",
            "{XK_at}" : "@",
            "{XK_numbersign}" : "#",
            "{XK_dollar}" : "$",
            "{XK_percent}" : "%",
            "{XK_asciicircum}" : "^",
            "{XK_ampersand}" : "&",
            "{XK_asterisk}" : "*",
            "{XK_left_bracket}" : "(",
            "{XK_right_bracket}" : ")",
            "{XK_underscore}" : "_",
            "{XK_plus}" : "+",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Second
            "{XK_Q}" : "Q",
            "{XK_W}" : "W",
            "{XK_E}" : "E",
            "{XK_R}" : "R",
            "{XK_T}" : "T",
            "{XK_Y}" : "Y",
            "{XK_U}" : "U",
            "{XK_I}" : "I",
            "{XK_O}" : "O",
            "{XK_P}" : "P",
            "{XK_braceleft}" : "{",
            "{XK_braceright}" : "}",
            "{XK_bar}" : "|",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Third
            "{XK_A}" : "A",
            "{XK_S}" : "S",
            "{XK_D}" : "D",
            "{XK_F}" : "F",
            "{XK_G}" : "G",
            "{XK_H}" : "H",
            "{XK_J}" : "J",
            "{XK_K}" : "K",
            "{XK_L}" : "L",
            "{XK_colon}" : ":",
            "{XK_quotedbl}" : '"',
            // ------------------------------------------------------------
            // //
            // With Shift hold - Fourth
            "{XK_Z}" : "Z",
            "{XK_X}" : "X",
            "{XK_C}" : "C",
            "{XK_V}" : "V",
            "{XK_B}" : "B",
            "{XK_N}" : "N",
            "{XK_M}" : "M",
            "{XK_less}" : "<",
            "{XK_greater}" : ">",
            "{XK_question}" : "?",

            "{XK_semicolon_caps}" : ';',
            "{XK_apostrophe_caps}" : "'",
            "{XK_2_caps}" : "2",
            "{XK_7_caps}" : "7",
            "{XK_9_caps}" : "9",
            "{XK_0_caps}" : "0",
            "{XK_M_caps}" : "M",
            "{XK_bracketleft_caps}" : "[",
            "{XK_minus_caps}" : "-",
            "{XK_equal_caps}" : '=',
            "{XK_backslash_caps}" : "\\",
            "{XK_grave_caps}" : "`"
          }
        };
        renderSoftKeyboard(scanCodeLayoutObj, displayObjEnglish);
        break;
      /*
      case 'italian':
        var displayObjItalian = {
          display : {
            // First Row - Function Keys and Esc
            // ------------------------------------------------------------
            // //
            "{XK_Escape}" : "Esc",
            "{XK_F1}" : "F1",
            "{XK_F2}" : "F2",
            "{XK_F3}" : "F3",
            "{XK_F4}" : "F4",
            "{XK_F5}" : "F5",
            "{XK_F6}" : "F6",
            "{XK_F7}" : "F7",
            "{XK_F8}" : "F8",
            "{XK_F9}" : "F9",
            "{XK_F10}" : "F10",
            "{XK_F11}" : "F11",
            "{XK_F12}" : "F12",
            // ------------------------------------------------------------
            // //
            // Second Row
            "{XK_grave}" : "\\",
            "{XK_1}" : "1",
            "{XK_2}" : "2",
            "{XK_3}" : "3",
            "{XK_4}" : "4",
            "{XK_5}" : "5",
            "{XK_6}" : "6",
            "{XK_7}" : "7",
            "{XK_8}" : "8",
            "{XK_9}" : "9",
            "{XK_0}" : "0",
            "{XK_minus}" : "'",
            "{XK_equal}" : "\u00EC",
            "{XK_BackSpace}" : "Backspace",
            // ------------------------------------------------------------
            // //
            // Third Row
            "{XK_Tab}" : "Tab",
            "{XK_q}" : "q",
            "{XK_w}" : "w",
            "{XK_e}" : "e",
            "{XK_r}" : "r",
            "{XK_t}" : "t",
            "{XK_y}" : "y",
            "{XK_u}" : "u",
            "{XK_i}" : "i",
            "{XK_o}" : "o",
            "{XK_p}" : "p",
            "{XK_bracketleft}" : "\u00E8",
            "{XK_bracketright}" : "+",
            "{XK_backslash}" : "\u00F9",
            // ------------------------------------------------------------
            // //
            // Fourth Row
            "{XK_Caps_Lock}" : "Caps Lock",
            "{XK_a}" : "a",
            "{XK_s}" : "s",
            "{XK_d}" : "d",
            "{XK_f}" : "f",
            "{XK_g}" : "g",
            "{XK_h}" : "h",
            "{XK_j}" : "j",
            "{XK_k}" : "k",
            "{XK_l}" : "l",
            "{XK_semicolon}" : "\u00F2",
            "{XK_apostrophe}" : "\u00E0",
            "{XK_KP_Enter}" : "Enter",
            // ------------------------------------------------------------
            // //
            // Fifth Row
            "{XK_Shift_L}" : "Shift",
            "{XK_z}" : "z",
            "{XK_x}" : "x",
            "{XK_c}" : "c",
            "{XK_v}" : "v",
            "{XK_b}" : "b",
            "{XK_n}" : "n",
            "{XK_m}" : "m",
            "{XK_comma}" : ",",
            "{XK_dot}" : ".",
            "{XK_slash}" : "-",
            "{XK_Shift_R}" : "Shift",
            // ------------------------------------------------------------
            // //
            // Last Row - Space and Control
            "{XK_Control_L}" : "Ctrl",
            "{XK_Alt_L}" : "Alt",
            "{XK_Meta_L}" : "Ctrl",
            "{XK_space}" : "Space",
            "{XK_Meta_R}" : "Ctrl",
            "{XK_Alt_R}" : "Alt",
            // ------------------------------------------------------------
            // //
            // ------------------------------------------------------------
            // //
            // With Shift hold - First
            "{XK_asciitilde}" : "|",
            "{XK_exclam}" : "!",
            "{XK_at}" : '"',
            "{XK_numbersign}" : "\u00A3",
            "{XK_dollar}" : "$",
            "{XK_percent}" : "%",
            "{XK_asciicircum}" : "&",
            "{XK_ampersand}" : "/",
            "{XK_asterisk}" : "(",
            "{XK_left_bracket}" : ")",
            "{XK_right_bracket}" : "=",
            "{XK_underscore}" : "?",
            "{XK_plus}" : "^",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Second
            "{XK_Q}" : "Q",
            "{XK_W}" : "W",
            "{XK_E}" : "E",
            "{XK_R}" : "R",
            "{XK_T}" : "T",
            "{XK_Y}" : "Y",
            "{XK_U}" : "U",
            "{XK_I}" : "I",
            "{XK_O}" : "O",
            "{XK_P}" : "P",
            "{XK_braceleft}" : "\u00E9",
            "{XK_braceright}" : "*",
            "{XK_bar}" : "\u00A7",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Third
            "{XK_A}" : "A",
            "{XK_S}" : "S",
            "{XK_D}" : "D",
            "{XK_F}" : "F",
            "{XK_G}" : "G",
            "{XK_H}" : "H",
            "{XK_J}" : "J",
            "{XK_K}" : "K",
            "{XK_L}" : "L",
            "{XK_colon}" : "\u00E7",
            "{XK_quotedbl}" : "\u00B0",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Fourth
            "{XK_Z}" : "Z",
            "{XK_X}" : "X",
            "{XK_C}" : "C",
            "{XK_V}" : "V",
            "{XK_B}" : "B",
            "{XK_N}" : "N",
            "{XK_M}" : "M",
            "{XK_less}" : ";",
            "{XK_greater}" : ":",
            "{XK_question}" : "_",

            "{XK_semicolon_caps}" : 'Ò',
            "{XK_apostrophe_caps}" : "À",
            "{XK_2_caps}" : "2",
            "{XK_7_caps}" : "7",
            "{XK_9_caps}" : "9",
            "{XK_0_caps}" : "0",
            "{XK_M_caps}" : "M",
            "{XK_bracketleft_caps}" : "È",
            "{XK_minus_caps}" : "'",
            "{XK_equal_caps}" : '\u00CC',
            "{XK_backslash_caps}" : "\u00D9",
            "{XK_grave_caps}" : "\\"
          }
        };
        renderSoftKeyboard(scanCodeLayoutObj, displayObjItalian);
        break;
      case 'dutch':
        var displayObjDutch = {
          display : {
            // First Row - Function Keys and Esc
            // ------------------------------------------------------------
            // //
            "{XK_Escape}" : "Esc",
            "{XK_F1}" : "F1",
            "{XK_F2}" : "F2",
            "{XK_F3}" : "F3",
            "{XK_F4}" : "F4",
            "{XK_F5}" : "F5",
            "{XK_F6}" : "F6",
            "{XK_F7}" : "F7",
            "{XK_F8}" : "F8",
            "{XK_F9}" : "F9",
            "{XK_F10}" : "F10",
            "{XK_F11}" : "F11",
            "{XK_F12}" : "F12",
            // ------------------------------------------------------------
            // //
            // Second Row
            "{XK_grave}" : "@",
            "{XK_1}" : "1",
            "{XK_2}" : '2',
            "{XK_3}" : "3",
            "{XK_4}" : "4",
            "{XK_5}" : "5",
            "{XK_6}" : "6",
            "{XK_7}" : "7",
            "{XK_8}" : "8",
            "{XK_9}" : "9",
            "{XK_0}" : "0",
            "{XK_minus}" : "/",
            "{XK_equal}" : "°",
            "{XK_BackSpace}" : "Backspace",
            // ------------------------------------------------------------
            // //
            // Third Row
            "{XK_Tab}" : "Tab",
            "{XK_q}" : "q",
            "{XK_w}" : "w",
            "{XK_e}" : "e",
            "{XK_r}" : "r",
            "{XK_t}" : "t",
            "{XK_y}" : "y",
            "{XK_u}" : "u",
            "{XK_i}" : "i",
            "{XK_o}" : "o",
            "{XK_p}" : "p",
            "{XK_bracketleft}" : '¨',
            "{XK_bracketright}" : "*",
            "{XK_backslash}" : "<",
            // ------------------------------------------------------------
            // //
            // Fourth Row
            "{XK_Caps_Lock}" : "Caps Lock",
            "{XK_a}" : "a",
            "{XK_s}" : "s",
            "{XK_d}" : "d",
            "{XK_f}" : "f",
            "{XK_g}" : "g",
            "{XK_h}" : "h",
            "{XK_j}" : "j",
            "{XK_k}" : "k",
            "{XK_l}" : "l",
            "{XK_semicolon}" : "+",
            "{XK_apostrophe}" : "`",
            "{XK_KP_Enter}" : "Enter",
            // ------------------------------------------------------------
            // //
            // Fifth Row
            "{XK_Shift_L}" : "Shift",
            "{XK_z}" : "z",
            "{XK_x}" : "x",
            "{XK_c}" : "c",
            "{XK_v}" : "v",
            "{XK_b}" : "b",
            "{XK_n}" : "n",
            "{XK_m}" : "m",
            "{XK_comma}" : ",",
            "{XK_dot}" : ".",
            "{XK_slash}" : "-",
            "{XK_Shift_R}" : "Shift",
            // ------------------------------------------------------------
            // //
            // Last Row - Space and Control
            "{XK_Control_L}" : "Ctrl",
            "{XK_Alt_L}" : "Alt",
            "{XK_Meta_L}" : "Ctrl",
            "{XK_space}" : "Space",
            "{XK_Meta_R}" : "Ctrl",
            "{XK_Alt_R}" : "Alt",
            // ------------------------------------------------------------
            // //
            // ------------------------------------------------------------
            // //
            // With Shift hold - First
            "{XK_asciitilde}" : "§",
            "{XK_exclam}" : "!",
            "{XK_at}" : '"',
            "{XK_numbersign}" : "#",
            "{XK_dollar}" : "$",
            "{XK_percent}" : "%",
            "{XK_asciicircum}" : "&",
            "{XK_ampersand}" : "_",
            "{XK_asterisk}" : "(",
            "{XK_left_bracket}" : ")",
            "{XK_right_bracket}" : "'",
            "{XK_underscore}" : "?",
            "{XK_plus}" : "~",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Second
            "{XK_Q}" : "Q",
            "{XK_W}" : "W",
            "{XK_E}" : "E",
            "{XK_R}" : "R",
            "{XK_T}" : "T",
            "{XK_Y}" : "Y",
            "{XK_U}" : "U",
            "{XK_I}" : "I",
            "{XK_O}" : "O",
            "{XK_P}" : "P",
            "{XK_braceleft}" : "^",
            "{XK_braceright}" : "|",
            "{XK_bar}" : ">",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Third
            "{XK_A}" : "A",
            "{XK_S}" : "S",
            "{XK_D}" : "D",
            "{XK_F}" : "F",
            "{XK_G}" : "G",
            "{XK_H}" : "H",
            "{XK_J}" : "J",
            "{XK_K}" : "K",
            "{XK_L}" : "L",
            "{XK_colon}" : "±",
            "{XK_quotedbl}" : '`',
            // ------------------------------------------------------------
            // //
            // With Shift hold - Fourth
            "{XK_Z}" : "Z",
            "{XK_X}" : "X",
            "{XK_C}" : "C",
            "{XK_V}" : "V",
            "{XK_B}" : "B",
            "{XK_N}" : "N",
            "{XK_M}" : "M",
            "{XK_less}" : ";",
            "{XK_greater}" : ":",
            "{XK_question}" : "=",
            "{XK_semicolon_caps}" : '+',
            "{XK_apostrophe_caps}" : '\u00B4',
            "{XK_2_caps}" : "2",
            "{XK_7_caps}" : "7",
            "{XK_9_caps}" : "9",
            "{XK_0_caps}" : "0",
            "{XK_M_caps}" : "M",
            "{XK_bracketleft_caps}" : "¨",
            "{XK_minus_caps}" : "/",
            "{XK_equal_caps}" : '°',
            "{XK_backslash_caps}" : "<",
            "{XK_grave_caps}" : "@"
          }
        };
        renderSoftKeyboard(scanCodeLayoutObj, displayObjDutch);
        break;
      case 'french':
        var displayObjFrench = {
          display : {
            // First Row - Function Keys and Esc
            // ------------------------------------------------------------
            // //
            "{XK_Escape}" : "Esc",
            "{XK_F1}" : "F1",
            "{XK_F2}" : "F2",
            "{XK_F3}" : "F3",
            "{XK_F4}" : "F4",
            "{XK_F5}" : "F5",
            "{XK_F6}" : "F6",
            "{XK_F7}" : "F7",
            "{XK_F8}" : "F8",
            "{XK_F9}" : "F9",
            "{XK_F10}" : "F10",
            "{XK_F11}" : "F11",
            "{XK_F12}" : "F12",
            // ------------------------------------------------------------
            // //
            // Second Row
            "{XK_grave}" : "\u00B2",
            "{XK_1}" : "&",
            "{XK_2}" : "\u00E9",
            "{XK_3}" : '"',
            "{XK_4}" : "'",
            "{XK_5}" : "(",
            "{XK_6}" : "-",
            "{XK_7}" : "\u00E8",
            "{XK_8}" : "_",
            "{XK_9}" : "\u00E7",
            "{XK_0}" : "\u00E0",
            "{XK_minus}" : ")",
            "{XK_equal}" : "=",
            "{XK_BackSpace}" : "Backspace",
            // ------------------------------------------------------------
            // //
            // Third Row
            "{XK_Tab}" : "Tab",
            "{XK_q}" : "a",
            "{XK_w}" : "z",
            "{XK_e}" : "e",
            "{XK_r}" : "r",
            "{XK_t}" : "t",
            "{XK_y}" : "y",
            "{XK_u}" : "u",
            "{XK_i}" : "i",
            "{XK_o}" : "o",
            "{XK_p}" : "p",
            "{XK_bracketleft}" : "^",
            "{XK_bracketright}" : "$",
            "{XK_backslash}" : "*",
            // ------------------------------------------------------------
            // //
            // Fourth Row
            "{XK_Caps_Lock}" : "Caps Lock",
            "{XK_a}" : "q",
            "{XK_s}" : "s",
            "{XK_d}" : "d",
            "{XK_f}" : "f",
            "{XK_g}" : "g",
            "{XK_h}" : "h",
            "{XK_j}" : "j",
            "{XK_k}" : "k",
            "{XK_l}" : "\u006C",
            "{XK_semicolon}" : "m",
            "{XK_apostrophe}" : "\u00F9",
            "{XK_KP_Enter}" : "Enter",
            // ------------------------------------------------------------
            // //
            // Fifth Row
            "{XK_Shift_L}" : "Shift",
            "{XK_z}" : "w",
            "{XK_x}" : "x",
            "{XK_c}" : "c",
            "{XK_v}" : "v",
            "{XK_b}" : "b",
            "{XK_n}" : "n",
            "{XK_m}" : ",",
            "{XK_comma}" : ";",
            "{XK_dot}" : ":",
            "{XK_slash}" : "!",
            "{XK_Shift_R}" : "Shift",
            // ------------------------------------------------------------
            // //
            // Last Row - Space and Control
            "{XK_Control_L}" : "Ctrl",
            "{XK_Alt_L}" : "Alt",
            "{XK_Meta_L}" : "Ctrl",
            "{XK_space}" : "Space",
            "{XK_Meta_R}" : "Ctrl",
            "{XK_Alt_R}" : "Alt",
            // ------------------------------------------------------------
            // //
            // ------------------------------------------------------------
            // //
            // With Shift hold - First
            "{XK_asciitilde}" : "~",
            "{XK_exclam}" : "1",
            "{XK_at}" : "2",
            "{XK_numbersign}" : "3",
            "{XK_dollar}" : "4",
            "{XK_percent}" : "5",
            "{XK_asciicircum}" : "6",
            "{XK_ampersand}" : "7",
            "{XK_asterisk}" : "8",
            "{XK_left_bracket}" : "9",
            "{XK_right_bracket}" : "0",
            "{XK_underscore}" : "\u00B0",
            "{XK_plus}" : "+",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Second
            "{XK_Q}" : "A",
            "{XK_W}" : "Z",
            "{XK_E}" : "E",
            "{XK_R}" : "R",
            "{XK_T}" : "T",
            "{XK_Y}" : "Y",
            "{XK_U}" : "U",
            "{XK_I}" : "I",
            "{XK_O}" : "O",
            "{XK_P}" : "P",
            "{XK_braceleft}" : '¨',
            "{XK_braceright}" : "\u00A3",
            "{XK_bar}" : "\u00B5",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Third
            "{XK_A}" : "Q",
            "{XK_S}" : "S",
            "{XK_D}" : "D",
            "{XK_F}" : "F",
            "{XK_G}" : "G",
            "{XK_H}" : "H",
            "{XK_J}" : "J",
            "{XK_K}" : "K",
            "{XK_L}" : "L",
            "{XK_colon}" : "M",
            "{XK_quotedbl}" : '%',
            "{XK_semicolon_caps}" : 'M',
            "{XK_apostrophe_caps}" : 'Ù',
            "{XK_2_caps}" : "É",
            "{XK_7_caps}" : "È",
            "{XK_9_caps}" : "Ç",
            "{XK_0_caps}" : "À",
            "{XK_M_caps}" : ",",
            "{XK_bracketleft_caps}" : "^",
            "{XK_minus_caps}" : ")",
            "{XK_equal_caps}" : "=",
            "{XK_backslash_caps}" : "*",
            "{XK_grave_caps}" : "\u00B2",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Fourth
            "{XK_Z}" : "W",
            "{XK_X}" : "X",
            "{XK_C}" : "C",
            "{XK_V}" : "V",
            "{XK_B}" : "B",
            "{XK_N}" : "N",
            "{XK_M}" : "?",
            "{XK_less}" : ".",
            "{XK_greater}" : "/",
            "{XK_question}" : "\u00A7",
          }
        };
        renderSoftKeyboard(scanCodeLayoutObj, displayObjFrench);
        break;
      case 'german':
        var displayObjGerman = {
          display : {
            // First Row - Function Keys and Esc
            // ------------------------------------------------------------
            // //
            "{XK_Escape}" : "Esc",
            "{XK_F1}" : "F1",
            "{XK_F2}" : "F2",
            "{XK_F3}" : "F3",
            "{XK_F4}" : "F4",
            "{XK_F5}" : "F5",
            "{XK_F6}" : "F6",
            "{XK_F7}" : "F7",
            "{XK_F8}" : "F8",
            "{XK_F9}" : "F9",
            "{XK_F10}" : "F10",
            "{XK_F11}" : "F11",
            "{XK_F12}" : "F12",
            // ------------------------------------------------------------
            // //
            // Second Row
            "{XK_grave}" : "^",
            "{XK_1}" : "1",
            "{XK_2}" : "2",
            "{XK_3}" : "3",
            "{XK_4}" : "4",
            "{XK_5}" : "5",
            "{XK_6}" : "6",
            "{XK_7}" : "7",
            "{XK_8}" : "8",
            "{XK_9}" : "9",
            "{XK_0}" : "0",
            "{XK_minus}" : "ß",
            "{XK_equal}" : "\u00B4",
            "{XK_BackSpace}" : "Backspace",
            // ------------------------------------------------------------
            // //
            // Third Row
            "{XK_Tab}" : "Tab",
            "{XK_q}" : "q",
            "{XK_w}" : "w",
            "{XK_e}" : "e",
            "{XK_r}" : "r",
            "{XK_t}" : "t",
            "{XK_y}" : "z",
            "{XK_u}" : "u",
            "{XK_i}" : "i",
            "{XK_o}" : "o",
            "{XK_p}" : "p",
            "{XK_bracketleft}" : "\u00FC",
            "{XK_bracketright}" : "+",
            "{XK_backslash}" : "#",
            // ------------------------------------------------------------
            // //
            // Fourth Row
            "{XK_Caps_Lock}" : "Caps Lock",
            "{XK_a}" : "a",
            "{XK_s}" : "s",
            "{XK_d}" : "d",
            "{XK_f}" : "f",
            "{XK_g}" : "g",
            "{XK_h}" : "h",
            "{XK_j}" : "j",
            "{XK_k}" : "k",
            "{XK_l}" : "l",
            "{XK_semicolon}" : "\u00F6",
            "{XK_apostrophe}" : "\u00E4",
            "{XK_KP_Enter}" : "Enter",
            // ------------------------------------------------------------
            // //
            // Fifth Row
            "{XK_Shift_L}" : "Shift",
            "{XK_z}" : "y",
            "{XK_x}" : "x",
            "{XK_c}" : "c",
            "{XK_v}" : "v",
            "{XK_b}" : "b",
            "{XK_n}" : "n",
            "{XK_m}" : "m",
            "{XK_comma}" : ",",
            "{XK_dot}" : ".",
            "{XK_slash}" : "-",
            "{XK_Shift_R}" : "Shift",
            // ------------------------------------------------------------
            // //
            // Last Row - Space and Control
            "{XK_Control_L}" : "Ctrl",
            "{XK_Alt_L}" : "Alt",
            "{XK_Meta_L}" : "Ctrl",
            "{XK_space}" : "Space",
            "{XK_Meta_R}" : "Ctrl",
            "{XK_Alt_R}" : "Alt",
            // ------------------------------------------------------------
            // //
            // ------------------------------------------------------------
            // //
            // With Shift hold - First
            "{XK_asciitilde}" : "\u00B0",
            "{XK_exclam}" : "!",
            "{XK_at}" : '"',
            "{XK_numbersign}" : "\u00A7",
            "{XK_dollar}" : "$",
            "{XK_percent}" : "%",
            "{XK_asciicircum}" : "&",
            "{XK_ampersand}" : "/",
            "{XK_asterisk}" : "(",
            "{XK_left_bracket}" : ")",
            "{XK_right_bracket}" : "=",
            "{XK_underscore}" : "?",
            "{XK_plus}" : "`",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Second
            "{XK_Q}" : "Q",
            "{XK_W}" : "W",
            "{XK_E}" : "E",
            "{XK_R}" : "R",
            "{XK_T}" : "T",
            "{XK_Y}" : "Z",
            "{XK_U}" : "U",
            "{XK_I}" : "I",
            "{XK_O}" : "O",
            "{XK_P}" : "P",
            "{XK_braceleft}" : "\u00DC",
            "{XK_braceright}" : "*",
            "{XK_bar}" : "'",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Third
            "{XK_A}" : "A",
            "{XK_S}" : "S",
            "{XK_D}" : "D",
            "{XK_F}" : "F",
            "{XK_G}" : "G",
            "{XK_H}" : "H",
            "{XK_J}" : "J",
            "{XK_K}" : "K",
            "{XK_L}" : "L",
            "{XK_colon}" : "\u00D6",
            "{XK_quotedbl}" : '\u00C4',
            "{XK_semicolon_caps}" : 'Ö',
            "{XK_apostrophe_caps}" : 'Ä',
            "{XK_2_caps}" : "2",
            "{XK_7_caps}" : "7",
            "{XK_9_caps}" : "9",
            "{XK_0_caps}" : "0",
            "{XK_M_caps}" : "M",
            "{XK_bracketleft_caps}" : "Ü",
            "{XK_minus_caps}" : "ẞ",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Fourth
            "{XK_Z}" : "Y",
            "{XK_X}" : "X",
            "{XK_C}" : "C",
            "{XK_V}" : "V",
            "{XK_B}" : "B",
            "{XK_N}" : "N",
            "{XK_M}" : "M",
            "{XK_less}" : ";",
            "{XK_greater}" : ":",
            "{XK_question}" : "_",
            "{XK_equal_caps}" : "\u00B4",
            "{XK_backslash_caps}" : "#",
            "{XK_grave_caps}" : "\u005E",
          }
        };
        renderSoftKeyboard(scanCodeLayoutObj, displayObjGerman);
        break;
      case 'russian':
        var displayObjRussian = {
          display : {
            // First Row - Function Keys and Esc
            // ------------------------------------------------------------
            // //
            "{XK_Escape}" : "Esc",
            "{XK_F1}" : "F1",
            "{XK_F2}" : "F2",
            "{XK_F3}" : "F3",
            "{XK_F4}" : "F4",
            "{XK_F5}" : "F5",
            "{XK_F6}" : "F6",
            "{XK_F7}" : "F7",
            "{XK_F8}" : "F8",
            "{XK_F9}" : "F9",
            "{XK_F10}" : "F10",
            "{XK_F11}" : "F11",
            "{XK_F12}" : "F12",
            // ------------------------------------------------------------
            // //
            // Second Row
            "{XK_grave}" : "\u0451",
            "{XK_1}" : "1",
            "{XK_2}" : "2",
            "{XK_3}" : "3",
            "{XK_4}" : "4",
            "{XK_5}" : "5",
            "{XK_6}" : "6",
            "{XK_7}" : "7",
            "{XK_8}" : "8",
            "{XK_9}" : "9",
            "{XK_0}" : "0",
            "{XK_minus}" : "-",
            "{XK_equal}" : "=",
            "{XK_BackSpace}" : "Backspace",
            // ------------------------------------------------------------
            // //
            // Third Row
            "{XK_Tab}" : "Tab",
            "{XK_q}" : "\u0439",
            "{XK_w}" : "\u0446",
            "{XK_e}" : "\u0443",
            "{XK_r}" : "\u043a",
            "{XK_t}" : "\u0435",
            "{XK_y}" : "\u043d",
            "{XK_u}" : "\u0433",
            "{XK_i}" : "\u0448",
            "{XK_o}" : "\u0449",
            "{XK_p}" : "\u0437",
            "{XK_bracketleft}" : "\u0445",
            "{XK_bracketright}" : "\u044a",
            "{XK_backslash}" : "\\",
            // ------------------------------------------------------------
            // //
            // Fourth Row
            "{XK_Caps_Lock}" : "Caps Lock",
            "{XK_a}" : "\u0444",
            "{XK_s}" : "\u044b",
            "{XK_d}" : "\u0432",
            "{XK_f}" : "\u0430",
            "{XK_g}" : "\u043f",
            "{XK_h}" : "\u0440",
            "{XK_j}" : "\u043e",
            "{XK_k}" : "\u043b",
            "{XK_l}" : "\u0434",
            "{XK_semicolon}" : "\u0436",
            "{XK_apostrophe}" : "\u044d",
            "{XK_KP_Enter}" : "Enter",
            // ------------------------------------------------------------
            // //
            // Fifth Row
            "{XK_Shift_L}" : "Shift",
            "{XK_z}" : "\u044f",
            "{XK_x}" : "\u0447",
            "{XK_c}" : "\u0441",
            "{XK_v}" : "\u043c",
            "{XK_b}" : "\u0438",
            "{XK_n}" : "\u0442",
            "{XK_m}" : "\u044c",
            "{XK_comma}" : "\u0431",
            "{XK_dot}" : "\u044e",
            "{XK_slash}" : ".",
            "{XK_Shift_R}" : "Shift",
            // ------------------------------------------------------------
            // //
            // Last Row - Space and Control
            "{XK_Control_L}" : "Ctrl",
            "{XK_Alt_L}" : "Alt",
            "{XK_Meta_L}" : "Ctrl",
            "{XK_space}" : "Space",
            "{XK_Meta_R}" : "Ctrl",
            "{XK_Alt_R}" : "Alt",
            // ------------------------------------------------------------
            // //
            // ------------------------------------------------------------
            // //
            // With Shift hold - First
            "{XK_asciitilde}" : "\u0401",
            "{XK_exclam}" : "!",
            "{XK_at}" : '"',
            "{XK_numbersign}" : "\u2116",
            "{XK_dollar}" : ";",
            "{XK_percent}" : "%",
            "{XK_asciicircum}" : ":",
            "{XK_ampersand}" : "?",
            "{XK_asterisk}" : "*",
            "{XK_left_bracket}" : "(",
            "{XK_right_bracket}" : ")",
            "{XK_underscore}" : "_",
            "{XK_plus}" : "+",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Second
            "{XK_Q}" : "\u0419",
            "{XK_W}" : "\u0426",
            "{XK_E}" : "\u0423",
            "{XK_R}" : "\u041a",
            "{XK_T}" : "\u0415",
            "{XK_Y}" : "\u041d",
            "{XK_U}" : "\u0413",
            "{XK_I}" : "\u0428",
            "{XK_O}" : "\u0429",
            "{XK_P}" : "\u0417",
            "{XK_braceleft}" : "\u0425",
            "{XK_braceright}" : "\u042a",
            "{XK_bar}" : "/",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Third
            "{XK_A}" : "\u0424",
            "{XK_S}" : "\u042b",
            "{XK_D}" : "\u0412",
            "{XK_F}" : "\u0410",
            "{XK_G}" : "\u041f",
            "{XK_H}" : "\u0420",
            "{XK_J}" : "\u041e",
            "{XK_K}" : "\u041b",
            "{XK_L}" : "\u0414",
            "{XK_colon}" : "\u0416",
            "{XK_quotedbl}" : "\u042d",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Fourth
            "{XK_Z}" : "\u042f",
            "{XK_X}" : "\u0427",
            "{XK_C}" : "\u0421",
            "{XK_V}" : "\u041c",
            "{XK_B}" : "\u0418",
            "{XK_N}" : "\u0422",
            "{XK_M}" : "\u042c",
            "{XK_less}" : "\u0411",
            "{XK_greater}" : "\u042e",
            "{XK_question}" : ",",
            "{XK_semicolon_caps}" : '\u0416',
            "{XK_apostrophe_caps}" : "\u042D",
            "{XK_2_caps}" : "2",
            "{XK_7_caps}" : "7",
            "{XK_9_caps}" : "9",
            "{XK_0_caps}" : "0",
            "{XK_M_caps}" : "\u042c",
            "{XK_bracketleft_caps}" : "X",
            "{XK_minus_caps}" : "-",
            "{XK_grave_caps}" : "\u0401",
            "{XK_equal_caps}" : "=",
            "{XK_backslash_caps}" : "\\",
          }
        };
        renderSoftKeyboard(scanCodeLayoutObj, displayObjRussian);
        break;
      case 'spanish':
        var displayObjSpanish = {
          display : {
            // First Row - Function Keys and Esc
            // ------------------------------------------------------------
            // //
            "{XK_Escape}" : "Esc",
            "{XK_F1}" : "F1",
            "{XK_F2}" : "F2",
            "{XK_F3}" : "F3",
            "{XK_F4}" : "F4",
            "{XK_F5}" : "F5",
            "{XK_F6}" : "F6",
            "{XK_F7}" : "F7",
            "{XK_F8}" : "F8",
            "{XK_F9}" : "F9",
            "{XK_F10}" : "F10",
            "{XK_F11}" : "F11",
            "{XK_F12}" : "F12",
            // ------------------------------------------------------------
            // //
            // Second Row
            "{XK_grave}" : "\u00BA",
            "{XK_1}" : "1",
            "{XK_2}" : "2",
            "{XK_3}" : "3",
            "{XK_4}" : "4",
            "{XK_5}" : "5",
            "{XK_6}" : "6",
            "{XK_7}" : "7",
            "{XK_8}" : "8",
            "{XK_9}" : "9",
            "{XK_0}" : "0",
            "{XK_minus}" : "'",
            "{XK_equal}" : "\u00A1",
            "{XK_BackSpace}" : "Backspace",
            // ------------------------------------------------------------
            // //
            // Third Row
            "{XK_Tab}" : "Tab",
            "{XK_q}" : "q",
            "{XK_w}" : "w",
            "{XK_e}" : "e",
            "{XK_r}" : "r",
            "{XK_t}" : "t",
            "{XK_y}" : "y",
            "{XK_u}" : "u",
            "{XK_i}" : "i",
            "{XK_o}" : "o",
            "{XK_p}" : "p",
            "{XK_bracketleft}" : "`",
            "{XK_bracketright}" : "+",
            "{XK_backslash}" : "\u00E7",
            // ------------------------------------------------------------
            // //
            // Fourth Row
            "{XK_Caps_Lock}" : "Caps Lock",
            "{XK_a}" : "a",
            "{XK_s}" : "s",
            "{XK_d}" : "d",
            "{XK_f}" : "f",
            "{XK_g}" : "g",
            "{XK_h}" : "h",
            "{XK_j}" : "j",
            "{XK_k}" : "k",
            "{XK_l}" : "l",
            "{XK_semicolon}" : "\u00F1",
            "{XK_apostrophe}" : "\u00B4",
            "{XK_KP_Enter}" : "Enter",
            // ------------------------------------------------------------
            // //
            // Fifth Row
            "{XK_Shift_L}" : "Shift",
            "{XK_z}" : "z",
            "{XK_x}" : "x",
            "{XK_c}" : "c",
            "{XK_v}" : "v",
            "{XK_b}" : "b",
            "{XK_n}" : "n",
            "{XK_m}" : "m",
            "{XK_comma}" : ",",
            "{XK_dot}" : ".",
            "{XK_slash}" : "-",
            "{XK_Shift_R}" : "Shift",
            // ------------------------------------------------------------
            // //
            // Last Row - Space and Control
            "{XK_Control_L}" : "Ctrl",
            "{XK_Alt_L}" : "Alt",
            "{XK_Meta_L}" : "Ctrl",
            "{XK_space}" : "Space",
            "{XK_Meta_R}" : "Ctrl",
            "{XK_Alt_R}" : "Alt",
            // ------------------------------------------------------------
            // //
            // ------------------------------------------------------------
            // //
            // With Shift hold - First
            "{XK_asciitilde}" : "\u00AA",
            "{XK_exclam}" : "!",
            "{XK_at}" : '"',
            "{XK_numbersign}" : ".",
            "{XK_dollar}" : "$",
            "{XK_percent}" : "%",
            "{XK_asciicircum}" : "&",
            "{XK_ampersand}" : "/",
            "{XK_asterisk}" : "(",
            "{XK_left_bracket}" : ")",
            "{XK_right_bracket}" : "=",
            "{XK_underscore}" : "?",
            "{XK_plus}" : "\u00BF",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Second
            "{XK_Q}" : "Q",
            "{XK_W}" : "W",
            "{XK_E}" : "E",
            "{XK_R}" : "R",
            "{XK_T}" : "T",
            "{XK_Y}" : "Y",
            "{XK_U}" : "U",
            "{XK_I}" : "I",
            "{XK_O}" : "O",
            "{XK_P}" : "P",
            "{XK_braceleft}" : "^",
            "{XK_braceright}" : "*",
            "{XK_bar}" : "\u00C7",
            // ------------------------------------------------------------
            // //
            // With Shift hold - Third
            "{XK_A}" : "A",
            "{XK_S}" : "S",
            "{XK_D}" : "D",
            "{XK_F}" : "F",
            "{XK_G}" : "G",
            "{XK_H}" : "H",
            "{XK_J}" : "J",
            "{XK_K}" : "K",
            "{XK_L}" : "L",
            "{XK_colon}" : "\u00D1",
            "{XK_quotedbl}" : '\u00A8',
            // ------------------------------------------------------------
            // //
            // With Shift hold - Fourth
            "{XK_Z}" : "Z",
            "{XK_X}" : "X",
            "{XK_C}" : "C",
            "{XK_V}" : "V",
            "{XK_B}" : "B",
            "{XK_N}" : "N",
            "{XK_M}" : "M",
            "{XK_less}" : ";",
            "{XK_greater}" : ":",
            "{XK_question}" : "_",
            "{XK_semicolon_caps}" : 'Ñ',
            "{XK_apostrophe_caps}" : "\u00B4",
            "{XK_2_caps}" : "2",
            "{XK_7_caps}" : "7",
            "{XK_9_caps}" : "9",
            "{XK_0_caps}" : "0",
            "{XK_M_caps}" : "M",
            "{XK_bracketleft_caps}" : "\u0060",
            "{XK_minus_caps}" : "'",
            "{XK_backslash_caps}" : "\u00C7",
            "{XK_grave_caps}" : "\u00BA",
            "{XK_equal_caps}" : "\u00A1",
          }
        };
        renderSoftKeyboard(scanCodeLayoutObj, displayObjSpanish);
        break;
        */
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
      onKeyPress : function(button) { KeyPadOnKeyPress(button); },
      theme : "simple-keyboard hg-theme-default hg-layout-default",
      physicalKeyboardHighlight : false,
      syncInstanceInputs : true,
      mergeDisplay : true,
      debug : false
    };

    // Render Main Keyboard
    keyboard =
        new Keyboard(".simple-keyboard-main",
            { ...commonKeyboardOptions, ...layoutData, ...displayData });

    // Render Keyboard controls
    var controlLayout = {
      layout : {
        default : [
          "{XK_Print} {XK_Scroll_Lock} {XK_Pause}",
          "{XK_Insert} {XK_Home} {XK_Page_Up}",
          "{XK_Delete} {XK_End} {XK_Page_Down}"
        ]
      }
    };
    var controlDisplayData = {
      display : {
        "{XK_Print}" : "Print",
        "{XK_Scroll_Lock}" : "Scroll Lock",
        "{XK_Pause}" : "Pause",
        "{XK_Insert}" : "Insert",
        "{XK_Home}" : "Home",
        "{XK_Page_Up}" : "PgUp",
        "{XK_Delete}" : "Delete",
        "{XK_End}" : "End",
        "{XK_Page_Down}" : "PgDn"
      }
    };
    keyboardControlPad = new Keyboard(
        ".simple-keyboard-control",
        {...commonKeyboardOptions, ...controlLayout, ...controlDisplayData});

    // Render Keyboard arrow buttons
    keyboardArrows = new Keyboard(".simple-keyboard-arrows", {
        ...commonKeyboardOptions,
        layout: { default: ["{arrowup}", "{arrowleft} {arrowdown} {arrowright}"] }
    });

    function KeyPadOnKeyPress(button) {
      var keyID = button.replace('{', '').replace('}', '');

      if (button == '{space}') {
        keyID = 'XK_space';
      }
      if (button == '{XK_dot}') {
        keyID = 'XK_greater';
      }
      if (button == '{XK_left_bracket}') {
        keyID = 'XK_9';
      }
      if (button == '{XK_right_bracket}') {
        keyID = 'XK_0';
      }

      if (button.indexOf('_caps') != -1) {
        keyID = button.split('_caps')[0].replace('{', '');
      }

      if (button.indexOf('arrow') != -1) {
        keyID = keyMappingForArrowKeys[button];
      }

        var keyvalue = button;
        if (button === "{XK_Shift_L}" || button === "{XK_Shift_R}") {
          handleShift(keyID, keyvalue);
        } else if (button === "{XK_Caps_Lock}") {
          handleCaps(keyID, keyvalue);
        } else {
          window.rfb.sendKey(KEY[keyID], keyvalue, true);
          window.rfb.sendKey(KEY[keyID], keyvalue, false);
        }
    }

    function handleCaps(keyID, keyValue) {
      let currentLayout = keyboard.options.layoutName;
      let capsToggle = currentLayout == 'caps' ? "default" : "caps";
      if (capsToggle) {
        window.rfb.sendKey(KEY[keyID], keyValue, true);
        window.rfb.sendKey(KEY[keyID], keyValue, false);
        keyboard.setOptions({layoutName : capsToggle});
      }
      if (capsToggle == 'caps') {
        keyboard.getButtonElement('{XK_Caps_Lock}').style.backgroundColor =
            'grey';
      } else {
        keyboard.getButtonElement('{XK_Caps_Lock}').style.backgroundColor = '';
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
        if (shiftToggle == 'shift') {
          keyboard.getButtonElement('{XK_Shift_L}').style.backgroundColor =
              'grey';
          keyboard.getButtonElement('{XK_Shift_R}').style.backgroundColor =
              'grey';
        } else {
          keyboard.getButtonElement('{XK_Shift_L}').style.backgroundColor = '';
          keyboard.getButtonElement('{XK_Shift_R}').style.backgroundColor = '';
        }
    }
}

function getPwrStatus() {
    var ajax_url = '/redfish/v1/Systems/system';
    var ajax_req = new Ajax.Request(ajax_url, {
        method: 'GET',
        onSuccess: getPwrStatusHandler,
        onFailure: function () {
            document.getElementById("power_control").selectedIndex = 0;
            alert(lang.CONF_LOGIN_STR_WEB_TIMEOUT);
        }
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
            document.getElementById("forceEnterBIOS").disabled = true;
        } else // power status is on
        {
            document.getElementById("power_on").setAttribute("disabled", "disabled");
            document.getElementById("power_off").removeAttribute("disabled");
            document.getElementById("software_shutdown").removeAttribute("disabled");
            document.getElementById("power_reset").removeAttribute("disabled");
            document.getElementById("forceEnterBIOS").disabled = false;
        }
    }
    document.getElementById("power_control").selectedIndex = 0;
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
            onFailure: function () {
                document.getElementById("power_control").selectedIndex = 0;
                alert("Power Operation Failed");
            }
        });
    }
}
function doPwrActionHandler(arg) {
    if (arg.readyState == 4 && arg.status == 200) {
        if (powerEvent == "power_reset") {
            initTimeOut = 20000;
        } else if (powerEvent == "power_off") {
            initTimeOut = 15000;
        } else {
            initTimeOut = 10000;
        }
        setTimeout(getPwrStatus, initTimeOut);
        return;
    }
    document.getElementById("power_control").selectedIndex = 0;
}
open_KVM_windw();
init_actions();
