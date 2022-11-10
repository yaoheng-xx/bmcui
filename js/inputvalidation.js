/* system information page */

"use strict";

var INPUT_FIELD = {
  IPV4FIELD : "checkIPV4FieldFunc",
  MACFIELD : "checkMACFieldFunc",
  IPV4 : "checkIPV4AddressFunc",
  IPV6 : "checkIPV6AddressFunc",
  IPV4ANDIPV6 : "checkIPV6andIPV4AddressFunc",
  IPV6PREFIX_LEN : "checkIPV6PrefixLengthFunc",
  MAC : "checkMACAddressFunc",
  HOSTNAME : "checkHOSTNAMEFunc",
  DOMAINNAME : "checkDOMAINNAMEFunc",
  PATH : "checkPATHFunc",
  PORT : "checkPORTFunc",
  UID : "checkUIDFunc",
  VLANID : "checkVLANIDFunc",
  VLANPRIORITY : "checkVLANPRIORITYFunc",
  USERNAME : "checkUSERNAMEFunc",
  SMTPAUTHUSERNAME : "checkAUTHUSERNAMEFunc",
  PASSWORD : "checkPASSWORDFunc",
  EMAIL : "checkEMAILAddressFunc",
  KEYMACROS : "checkKeyMacrosFunc",
  KEYMACROS_NAME : "checkKeyMacrosNameFunc",
  HOSTNAMEANDIPV4 : "checkHostNameAndIPv4Address"
};

function checkRegexp(regexp, str) {
    var result = false;
    var matched = str.match(regexp);
    if(!matched) {
        result = false;
    }
    else {
        result = true;
    }
    return result;
}

function checkHostNameAndIPv4Address(str) {
  var expression =
      /(^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((?=.{1,255}$)(?=.*[A-Za-z].*)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*)\s*$)/;
  return expression.test(str);
}

//cehck ip field (1~255)
function checkIPV4FieldFunc(str) {
    var result = false;
    var regexp = /^([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
    result = checkRegexp(regexp, str);
    return result;
}

//check mac field (00~ff)
function checkMACFieldFunc(str) {
    var result = false;
    var regexp = "^([0-9A-Fa-f]{2})$";
    result = checkRegexp(regexp, str);
    return result;
}

//check ip address
function checkIPV4AddressFunc(str) {
    var result = false;
    var regexp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
    result = checkRegexp(regexp, str);
    return result;
}

//check ipv6 address
function checkIPV6AddressFunc(str) {
    var result = false;
    var regexp = /^(?:(?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}(?::[0-9a-fA-F]{1,4}){1,1}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|(?:[0-9a-fA-F]{1,4}:){1,1}(?::[0-9a-fA-F]{1,4}){1,6}|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})\.){3,3}(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})\.){3,3}(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2}))$/i
    result = checkRegexp(regexp, str);
    return result;
}

function checkIPV6andIPV4AddressFunc(str) {
    var result = false;
    var regexp = /(^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$)/;

    result = checkRegexp(regexp, str);
    return result;
}

function checkIPV6PrefixLengthFunc(str) {
    var result = false;
    var regexp = /^\d+$/;
    var check = false;
    if(checkRegexp(regexp, str) == true) {
        var port = parseInt(str);
        if(port >= 1 && port <= 128) {
            result = true;
        }
    }
    return result;
}

//check mac address
function checkMACAddressFunc(str) {
    var result = false;
    var regexp = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    result = checkRegexp(regexp, str);
    return result;
}

function checkHOSTNAMEFunc(str) {
    var result = false;
    // var regex = /[a-zA-Z0-9]|\.\s/;
    var regex = /^[\-]*(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
    var check = checkRegexp(regex, str);
    if(check == true && str != null) {
        if(str.length > 1 && str.length < 57) {
            result = true;
        }
    }
    return result;
}

function checkDOMAINNAMEFunc(str) {
    var result = false;
    var regexp = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
    result = checkRegexp(regexp, str);
    return result;
}

function checkPATHFunc(str) {
    if(str.length >= 0 && str.length < 128) {
        return true;
    }
    return false;
}

function checkPORTFunc(str) {
    var result = false;
    var regexp = /^\d+$/;
    var check = false;
    if(checkRegexp(regexp, str) == true) {
        var port = parseInt(str);
        if(port >= 1 && port <= 65535) {
            result = true;
        }
    }

    return result;
}

function checkUIDFunc(str) {
    var result = false;
    return result;
}

function checkVLANIDFunc(str) {
    var result = false;
    var regexp = /^\d+$/;
    var check = false;
    if(checkRegexp(regexp, str) == true) {
        var port = parseInt(str);
        if(port >= 1 && port <= 4094) {
            result = true;
        }
    }
    return result;
}

function checkVLANPRIORITYFunc(str) {
    var result = false;
    var regexp = /^\d+$/;
    var check = false;
    if(checkRegexp(regexp, str) == true) {
        var port = parseInt(str);
        if(port >= 0 && port <= 7) {
            result = true;
        }
    }
    return result;
}

function checkUSERNAMEFunc(str) {
    var result = false;
    var regexp = /^[a-zA-Z\-\_]+$/;
    var check = checkRegexp(regexp, str);
    if(check == true && str != null) {
        if(str.length >= 1 && str.length <= 16) {
            result = true;
        }
    }
    return result;
}

function checkAUTHUSERNAMEFunc(str) {
    var result = false;
    //validate smtp user name rule by RE, allow as name123, name@domain.com
    var regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))(@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})))?$/;
    var check = checkRegexp(regexp, str);

    if(check == true && str != null) {
        if(str.length >= 1 && str.length <= 32) {
            result = true;
        }
    }
    return result;
}

function checkPASSWORDFunc(str) {
    var result = false;
    var regexp = /^[\x00-\x7F]*$/;//ascii only
    var check = checkRegexp(regexp, str);
    if(check == true && str != null) {
        if(str.length >= 0 && str.length <= 20) {
            result = true;
        }
    }
    return result;
}

function checkEMAILAddressFunc(str) {
    var result = false;
    var regexp =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;
    result = checkRegexp(regexp, str);
    return result;
}

function checkNumericFunc(str, min, max) {
    var result = false;
    var regexp = /^\d+$/;
    var check = false;
    if(checkRegexp(regexp, str) == true) {
        var port = parseInt(str);
        if(port >= min && port <= max) {
            result = true;
        }
    }
    return result;
}


function checkInput(obj_id, field_title, type) {
    var result = false;
    if(obj_id != null) {
        var element = document.getElementById(obj_id);
        if(element != null) {
            var origVal = element.defaultValue;
            var value = element.value;
            result = checkInputType(value, type);
            if(result != true) {
                if(value != "") {
                    var err_field = "";
                    if(field_title != null && field_title.length > 0) {
                        err_field = "[" + field_title + "]";
                    }
                    alert(lang.LANG_INPUT_CHECK_ALERT_INFO + "\n" + err_field + ": " + value);
                }
                element.value = origVal;
            }
            else {
                element.defaultValue = value;
            }
        }
    }
    return result;
}

function initCheckInputListener(obj_id, field_title, type) {
    if(obj_id != null) {
        var element = document.getElementById(obj_id);
        if(element != null) {
            var check_title = field_title;
            var check_type = type;
            var check_id = obj_id;
            element.onchange = function () {
                checkInput(check_id, check_title, check_type);
            }
        }
    }
}

function checkInputType(str, funcName) {
  var result = false;
  if (funcName != null) {
    result = window[funcName](str);
  }
  return result;
}

function showAssert(value, assert) {
    if(value != assert) {
        //console.log("checkFail...");
    }
}

function findKey(str){
    var keytable =
        ["Shift", "LShift", "Ctrl", "LCtrl", "Alt", "LAlt", "RAlt", "AltGr", "Win", "LWin", "RWin",
         "Enter", "Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
         "Bksp", "Tab", "CapsLk", "Space", "Ins", "Del", "Home", "End", "PgUp", "PgDn", "Context", 
         "Menu", "Up", "Left", "Down", "Right", "NumLk", "NP_Div", "NP_Mult", "NP_Minus", "NP_Plus",
         "NP_0", "NP_1", "NP_2", "NP_3", "NP_4","NP_5", "NP_6", "NP_7", "NP_8", "NP_9", "NP_Dec", 
         "NP_Enter", "PrtSc", "SysRq", "ScrLk", "Pause", "Break"
        ];

    var found = false;
    for (var i = 0; i < keytable.length && !found; i++) {
        if (keytable[i].toUpperCase() === str.toUpperCase()) {
            found = true;
            break;
        }
    }
    return found;
}

function checkKeyMacrosFunc(str) {
    var result = false;
    var regexp = /^[a-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/i;
    var res = str.split("+");
    if(res != null) {
        result = true;
        for(var idx = 0; idx < res.length; idx++) {
            var key = res[idx].replace(/ /g, "");
            if(key.length > 0) {
                if(findKey(key) == false) {
                    if(checkRegexp(regexp, key) == false || key.length > 1) {
                        //printable character(only allow 1 character)
                        result = false;
                        break;
                    }
                }
            }
            else if(res.length > 1) {
                result = false;
                break;
            }
        }
    }
    return result;
}

function checkKeyMacrosNameFunc(str) {
    var regexp = /^[a-z0-9!#$%&()*+,.:;?@\[\] ^_`{|}~-]*$/i;//without " ' < > / =
    var result = false;
    if(checkRegexp(regexp, str) == true && str.length > 0) {
        //check all white-spaces
        var temp = str.replace(/ /g, "");
        if(temp != null && temp.length > 0) {
            result = true;
        }
    }
    return result;
}
