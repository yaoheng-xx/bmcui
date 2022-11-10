"use strict";
var preserveMonth;
var preserveDate;
var preserveYear;
var preserveHour;
var preserveMinute;
var preserveSecond;
var preserveUTCTzone;
var preserveNTPEnable;
var timeZoneString;

var CONST_AUTO = 1;
var CONST_MANUAL = 0;
var CONST_FAILURE = 2;
var TIMEZONE_SUPPORT = false; //It used to hold the Timezone localization feature support
var lstUTCTZone;
var txtNTPServer1;
var txtNTPServer2;
var chkNTPEnable;
var divNTPError;
var startYear = 2005;
var endYear = 2038;

var g_time = {
    year: 0,
    month: 0,
    date: 0,
    wday: 0,
    hour: 0,
    mins: 0,
    secs: 0
}

var fMonth = 0;
var fDate = 0;
var fWday = 0;
var fYear = 0;
var fHour = 0;
var fMin = 0;
var fSec = 0;

var NTPCFG;
var DATETIMECFG;
var PrivilegeValue = 0;
var DateandTimeMode = '';

var timezone_array = [
    ["Midway", "GMT-11:00", lang.LANG_TIMEZONE_MIDWAY],
    ["Honolulu", "GMT-10:00", lang.LANG_TIMEZONE_HONOLULU],
    ["Anchorage", "GMT-09:00", lang.LANG_TIMEZONE_ANCHORAGE],
    ["Los Angeles", "GMT-08:00", lang.LANG_TIMEZONE_LOS_ANGELES],
    ["Tijuana", "GMT-08:00", lang.LANG_TIMEZONE_TIJUANA],
    ["Phoenix", "GMT-07:00", lang.LANG_TIMEZONE_PHOENIX],
    ["Chihuahua", "GMT-07:00", lang.LANG_TIMEZONE_CHIHUAHUA],
    ["Denver", "GMT-07:00", lang.LANG_TIMEZONE_DENVER],
    ["Costa Rica", "GMT-06:00", lang.LANG_TIMEZONE_COSTA_RICA],
    ["Chicago", "GMT-06:00", lang.LANG_TIMEZONE_CHICAGO],
    ["Mexico City", "GMT-06:00", lang.LANG_TIMEZONE_MEXICO_CITY],
    ["Regina", "GMT-06:00", lang.LANG_TIMEZONE_REGINA],
    ["Bogota", "GMT-05:00", lang.LANG_TIMEZONE_BOGOTA],
    ["New York", "GMT-05:00", lang.LANG_TIMEZONE_NEW_YORK],
    ["Caracas", "GMT-04:30", lang.LANG_TIMEZONE_CARACAS],
    ["Barbados", "GMT-04:00", lang.LANG_TIMEZONE_BARBADOS],
    ["Halifax", "GMT-04:00", lang.LANG_TIMEZONE_HALIFAX],
    ["Manaus", "GMT-04:00", lang.LANG_TIMEZONE_MANAUS],
    ["St Johns", "GMT-03:30", lang.LANG_TIMEZONE_ST_JOHNS],
    ["Santiago", "GMT-03:00", lang.LANG_TIMEZONE_SANTIAGO],
    ["Recife", "GMT-03:00", lang.LANG_TIMEZONE_RECIFE],
    ["Buenos Aires", "GMT-03:00", lang.LANG_TIMEZONE_BUENOS_AIRES],
    ["Nuuk", "GMT-03:00", lang.LANG_TIMEZONE_NUUK],
    ["Montevideo", "GMT-03:00", lang.LANG_TIMEZONE_MONTEVIDEO],
    ["Sao Paulo", "GMT-02:00", lang.LANG_TIMEZONE_SAO_PAULO],
    ["South Georgia", "GMT-02:00", lang.LANG_TIMEZONE_SOUTH_GEORGIA],
    ["Azores", "GMT-01:00", lang.LANG_TIMEZONE_AZORES],
    ["Cape Verde", "GMT-01:00", lang.LANG_TIMEZONE_CAPE_VERDE],
    ["Casablanca", "GMT+00:00", lang.LANG_TIMEZONE_CASABLANCA],
    ["London", "GMT+00:00", lang.LANG_TIMEZONE_LONDON],
    ["Amsterdam", "GMT+01:00", lang.LANG_TIMEZONE_AMSTERDAM],
    ["Belgrade", "GMT+01:00", lang.LANG_TIMEZONE_BELGRADE],
    ["Brussels", "GMT+01:00", lang.LANG_TIMEZONE_BRUSSELS],
    ["Madrid", "GMT+01:00", lang.LANG_TIMEZONE_MADRID],
    ["Sarajevo", "GMT+01:00", lang.LANG_TIMEZONE_SARAJEVO],
    ["Brazzaville", "GMT+01:00", lang.LANG_TIMEZONE_BRAZZAVILLE],
    ["Windhoek", "GMT+02:00", lang.LANG_TIMEZONE_WINDHOEK],
    ["Amman", "GMT+02:00", lang.LANG_TIMEZONE_AMMAN],
    ["Athens", "GMT+02:00", lang.LANG_TIMEZONE_ATHENS],
    ["Istanbul", "GMT+02:00", lang.LANG_TIMEZONE_ISTANBUL],
    ["Beirut", "GMT+02:00", lang.LANG_TIMEZONE_BEIRUT],
    ["Cairo", "GMT+02:00", lang.LANG_TIMEZONE_CAIRO],
    ["Helsinki", "GMT+02:00", lang.LANG_TIMEZONE_HELSINKI],
    ["Jerusalem", "GMT+02:00", lang.LANG_TIMEZONE_JERUSALEM],
    ["Harare", "GMT+02:00", lang.LANG_TIMEZONE_HARARE],
    ["Minsk", "GMT+03:00", lang.LANG_TIMEZONE_MINSK],
    ["Baghdad", "GMT+03:00", lang.LANG_TIMEZONE_BAGHDAD],
    ["Moscow", "GMT+03:00", lang.LANG_TIMEZONE_MOSCOW],
    ["Kuwait", "GMT+03:00", lang.LANG_TIMEZONE_KUWAIT],
    ["Nairobi", "GMT+03:00", lang.LANG_TIMEZONE_NAIROBI],
    ["Tehran", "GMT+03:30", lang.LANG_TIMEZONE_TEHRAN],
    ["Baku", "GMT+04:00", lang.LANG_TIMEZONE_BAKU],
    ["Tbilisi", "GMT+04:00", lang.LANG_TIMEZONE_TBILISI],
    ["Yerevan", "GMT+04:00", lang.LANG_TIMEZONE_YEREVAN],
    ["Dubai", "GMT+04:00", lang.LANG_TIMEZONE_DUBAI],
    ["Kabul", "GMT+04:30", lang.LANG_TIMEZONE_KABUL],
    ["Karachi", "GMT+05:00", lang.LANG_TIMEZONE_KARACHI],
    ["Oral", "GMT+05:00", lang.LANG_TIMEZONE_ORAL],
    ["Yekaterinburg", "GMT+05:00", lang.LANG_TIMEZONE_YEKATERINBURG],
    ["Kolkata", "GMT+05:30", lang.LANG_TIMEZONE_KOLKATA],
    ["Colombo", "GMT+05:30", lang.LANG_TIMEZONE_COLOMBO],
    ["Kathmandu", "GMT+05:45", lang.LANG_TIMEZONE_KATHMANDU],
    ["Almaty", "GMT+06:00", lang.LANG_TIMEZONE_ALMATY],
    ["Rangoon", "GMT+06:30", lang.LANG_TIMEZONE_RANGOON],
    ["Krasnoyarsk", "GMT+07:00", lang.LANG_TIMEZONE_KRASNOYARSK],
    ["Bangkok", "GMT+07:00", lang.LANG_TIMEZONE_BANGKOK],
    ["Jakarta", "GMT+07:00", lang.LANG_TIMEZONE_JAKARTA],
    ["Shanghai", "GMT+08:00", lang.LANG_TIMEZONE_SHANGHAI],
    ["Hong Kong", "GMT+08:00", lang.LANG_TIMEZONE_HONG_KONG],
    ["Irkutsk", "GMT+08:00", lang.LANG_TIMEZONE_IRKUTSK],
    ["Kuala Lumpur", "GMT+08:00", lang.LANG_TIMEZONE_KUALA_LUMPUR],
    ["Perth", "GMT+08:00", lang.LANG_TIMEZONE_PERTH],
    ["Taipei", "GMT+08:00", lang.LANG_TIMEZONE_TAIPEI],
    ["Seoul", "GMT+09:00", lang.LANG_TIMEZONE_SEOUL],
    ["Tokyo", "GMT+09:00", lang.LANG_TIMEZONE_TOKYO],
    ["Yakutsk", "GMT+09:00", lang.LANG_TIMEZONE_YAKUTSK],
    ["Darwin", "GMT+09:30", lang.LANG_TIMEZONE_DARWIN],
    ["Brisbane", "GMT+10:00", lang.LANG_TIMEZONE_BRISBANE],
    ["Vladivostok", "GMT+10:00", lang.LANG_TIMEZONE_VLADIVOSTOK],
    ["Guam", "GMT+10:00", lang.LANG_TIMEZONE_GUAM],
    ["Magadan", "GMT+10:00", lang.LANG_TIMEZONE_MAGADAN],
    ["Adelaide", "GMT+10:30", lang.LANG_TIMEZONE_ADELAIDE],
    ["Hobart", "GMT+11:00", lang.LANG_TIMEZONE_HOBART],
    ["Sydney", "GMT+11:00", lang.LANG_TIMEZONE_SYDNEY],
    ["Noumea", "GMT+11:00", lang.LANG_TIMEZONE_NOUMEA],
    ["Majuro", "GMT+12:00", lang.LANG_TIMEZONE_MAJURO],
    ["Auckland", "GMT+13:00", lang.LANG_TIMEZONE_AUCKLAND],
    ["Fiji", "GMT+13:00", lang.LANG_TIMEZONE_FIJI],
    ["Tongatapu", "GMT+13:00", lang.LANG_TIMEZONE_TONGATAPU]
];

var month = [lang.LANG_MONTH_JAN, lang.LANG_MONTH_FEB, lang.LANG_MONTH_MAR, lang.LANG_MONTH_APR,
lang.LANG_MONTH_MAY, lang.LANG_MONTH_JUN, lang.LANG_MONTH_JUL, lang.LANG_MONTH_AUG,
lang.LANG_MONTH_SEP, lang.LANG_MONTH_OCT, lang.LANG_MONTH_NOV, lang.LANG_MONTH_DEC
];

var wday = [lang.LANG_DAY_SUN, lang.LANG_DAY_MON, lang.LANG_DAY_TUE, lang.LANG_DAY_WED,
lang.LANG_DAY_THU, lang.LANG_DAY_FRI, lang.LANG_DAY_SAT
];

window.addEventListener('load', PageInit);
var lang;
var btnSave;
var btnRefresh;
var g_origTZOffset;

if (parent.lang) { lang = parent.lang; }

function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src = "../help/" + lang_setting + "/configure_ntp_hlp.html";
    TIMEZONE_SUPPORT = true; //checkProjectCfg("TIMEZONE_SUPPORT");

    fWday = document.getElementById("wdd_field");
    fMonth = document.getElementById("mon_field");
    fDate = document.getElementById("dd_field");
    fYear = document.getElementById("yy_field");
    fHour = document.getElementById("hh_field");
    fMin = document.getElementById("min_field");
    fSec = document.getElementById("ss_field");

    fHour.style.color = "#00AAFF";
    fHour.style.fontSize = "46px";
    fHour.style.fontWeight = "bold";
    fMin.style.color = "#00AAFF";
    fMin.style.fontSize = "46px";
    fMin.style.fontWeight = "bold";
    fSec.style.color = "#00AAFF";
    fSec.style.fontSize = "46px";
    fSec.style.fontWeight = "bold";
    fWday.style.color = "#00AAFF";
    fWday.style.fontSize = "18px";
    fWday.style.fontWeight = "bold";
    fMonth.style.color = "#00AAFF";
    fMonth.style.fontSize = "18px";
    fMonth.style.fontWeight = "bold";
    fDate.style.color = "#00AAFF";
    fDate.style.fontSize = "18px";
    fDate.style.fontWeight = "bold";
    fYear.style.color = "#00AAFF";
    fYear.style.fontSize = "18px";
    fYear.style.fontWeight = "bold";

    lstUTCTZone = document.getElementById("_lstUTCTZone");
    txtNTPServer1 = document.getElementById("_txtNTPServer1");
    txtNTPServer2 = document.getElementById("_txtNTPServer2");
    chkNTPEnable = document.getElementById("_chkNTPEnable");
    divNTPError = document.getElementById("_divNTPError");


    divNTPError.innerHTML = "";

    btnSave = document.getElementById("_btnSave");
    btnSave.value = lang.CFG_NTP_SAVE;
    btnRefresh = document.getElementById("_btnRefresh");
    btnRefresh.value = lang.CFG_NTP_REFRESH;
    OutputString();

    CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(Privilege) {
    PrivilegeValue = Privilege;
    if (PrivilegeValue == 4) {
        chkNTPEnable.disabled = false;
        btnSave.disabled = false;
        chkNTPEnable.onclick = enableNTP;
        btnSave.onclick = validateNTPCfg;
    } else {
        disableActions();
    }

    refreshNTPConfig();
    btnRefresh.onclick = refreshNTPConfig;

    if (TIMEZONE_SUPPORT) {
        lstUTCTZone.className = "visibleRow";
    }
}

function refreshNTPConfig() {
    getNTPCfg();
    getNTPServers();
}

function disableActions() {
    chkNTPEnable.disabled = true;
    btnSave.disabled = true;
}

function InsertTimezoneOption(index, timezone, country_name) {
    var option = document.createElement("option");
    option.text = timezone + " | " + country_name;
    option.value = index;
    lstUTCTZone.add(option);
}

function CreateTimezoneTable() {
    for (var i = 0; i < timezone_array.length; i++) {
        InsertTimezoneOption(timezone_array[i][0], timezone_array[i][1], timezone_array[i][2])
    }
    lstUTCTZone.addEventListener("change", onTimezoneChange);
}

function OutputString() {
    document.getElementById("ntp_caption_div").textContent = lang.CFG_NTP_TITLE;
    document.getElementById("ntp_timezone_lbl").textContent = lang.CFG_NTP_TIMEZONE;
    document.getElementById("ntp_primary_lbl").textContent = lang.CFG_NTP_PRIMARY;
    document.getElementById("ntp_secondary_lbl").textContent = lang.CFG_NTP_SECONDARY;
    document.getElementById("ntp_enable_lbl").textContent = lang.CFG_NTP_SYNC_NTP;

    sortTimezoneList(timezone_array);
    CreateTimezoneTable();
}

function getNTPCfg() {
    Loading(true);
    var ajax_url = '/redfish/v1/Managers/bmc';
    var ajax_req = new Ajax.Request(ajax_url, {
        method: 'GET',
        onSuccess: getNTPCfgRes,
        onFailure: function () {
            Loading(false);
            alert(lang.STR_CONF_NTP_GETVAL);
        }
    });
}

function getNTPServers() {
    Loading(true);
    var ajax_url = '/redfish/v1/Managers/bmc/NetworkProtocol';
    var ajax_req = new Ajax.Request(ajax_url, {
        method: 'GET',
        onSuccess: getNTPServerCfgRes,
        onFailure: function () {
            Loading(false);
            alert("No NTP Servers Configured!!");
        }
    });
}

function getNTPServerCfgRes(res) {
    Loading(false);
    if (res.readyState == 4 && res.status == 200) {
        var response = JSON.parse(res.responseText);
        if (response.NTP.ProtocolEnabled) {
            chkNTPEnable.checked = true;
            enableNTP();
        } else {
            chkNTPEnable.checked = false;
            enableNTP();
        }
        txtNTPServer1.value = response.NTP.NTPServers[0]
            ? response.NTP.NTPServers[0]
            : "";
        txtNTPServer2.value = response.NTP.NTPServers[1]
            ? response.NTP.NTPServers[1]
            : "";
    }
}

function FindTimezoneIndex(timezone_array, offset) {
    var index = -1;
    if (timezone_array != null && timezone_array.length > 0) {
        for (var idx = 0; idx < timezone_array.length; idx++) {
            if (timezone_array[idx][1].indexOf(offset) >= 0) {
                index = idx;
                break;
            }
        }
    }
    return index;
}

function AppendTimezoneArray(list, index, timezone, country_name) {
    "use strict";
    var item = [];
    if (list != null) {
        item[0] = index;
        item[1] = timezone;
        item[2] = country_name;
        list.push(item);
    }
}

function getNTPCfgRes(arg) {
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
        NTPCFG = JSON.parse(arg.responseText);
        var bmc_timestamp = new Date(NTPCFG.DateTime);
        var timeZoneString = NTPCFG.DateTimeLocalOffset;
        var index = FindTimezoneIndex(timezone_array, timeZoneString);
        if (index >= 0) {
            document.getElementById('_lstUTCTZone').selectedIndex = index;
        } else {
            //when timezone offset can not found in timezone_array, just create a new timezone and named as "Undefined".
            var timezone_str = timeZoneString;
            AppendTimezoneArray(timezone_array, "unknow", timezone_str, lang.LANG_CONF_DATETIME_UNDEFINED);
            InsertTimezoneOption("unknow", timezone_str, lang.LANG_CONF_DATETIME_UNDEFINED);
            index = FindTimezoneIndex(timezone_array, timeZoneString);
            if (index >= 0) {
                document.getElementById('_lstUTCTZone').selectedIndex = index;
            }
        }
        var parsing = timeZoneString.match(/.{1,1}/g);
        var utcSeconds = parsing[0] + (parseInt((parsing[1] + parsing[2]) * 60) +
            parseInt(parsing[4] + parsing[5]));
        g_origTZOffset = utcSeconds;
        var clientSeconds = (bmc_timestamp.getTime()) + (utcSeconds * 60000)
        var clientDateObject =
            new Date(clientSeconds); // Date object requires milliseconds
        var yearCheck = clientDateObject.getUTCFullYear();

        if ((yearCheck < startYear) || (yearCheck > endYear)) {
            alert(lang.STR_CONF_NTP_DATE_RANGE);
        }

        fHour.innerText = clientDateObject.getUTCHours();
        fMin.innerText = clientDateObject.getUTCMinutes();
        fSec.innerText = clientDateObject.getUTCSeconds();
        fDate.innerText = clientDateObject.getUTCDate();
        fMonth.innerText = clientDateObject.getUTCMonth() + 1;
        fYear.innerText = clientDateObject.getUTCFullYear();
        var gtm = clientDateObject.getUTCFullYear() + "/" + (clientDateObject.getUTCMonth() + 1) + "/" + clientDateObject.getUTCDate();
        var gwday = new Date(gtm);
        g_time.wday = gwday.getDay();
        fWday.innerText = wday[g_time.wday];

        g_time.hour = parseInt(fHour.innerText, 10);
        g_time.mins = parseInt(fMin.innerText, 10);
        g_time.secs = parseInt(fSec.innerText, 10);
        g_time.date = parseInt(fDate.innerText, 10);
        g_time.month = parseInt(fMonth.innerText, 10);
        g_time.year = parseInt(fYear.innerText, 10);
        g_time.wday = parseInt(fWday.innerText, 10);
    }
}

function GetTimezoneOffset(gmt_str) {
    var result = 0;
    if (gmt_str != null && gmt_str.length > 4) {
        var str_timezone_offset = gmt_str.replace("GMT", "");
        if (str_timezone_offset != null && str_timezone_offset.length > 0) {
            var timeoffsets = str_timezone_offset.split(":");
            if (timeoffsets != null && timeoffsets.length > 1) {
                var h_offset = parseInt(timeoffsets[0]);
                var m_offset = parseInt(timeoffsets[1]);
                if (h_offset > 0) {
                    result = parseInt((h_offset * 60) + m_offset);
                } else {
                    result = parseInt((h_offset * 60) - m_offset);
                }
            }
        }
    }
    return result;
}

function DateTimezone(offset) {
    var d = new Date();
    d.setFullYear(g_time.year);
    d.setMonth(g_time.month - 1);
    d.setDate(g_time.date);
    d.setHours(g_time.hour);
    d.setMinutes(g_time.mins);
    d.setSeconds(g_time.secs);

    // get UTC time base on original timezone select(page entry)
    var utc = d.getTime() - (g_origTZOffset * 60000);

    // get time with timezone offset
    var newd = new Date(utc + (60000 * offset));
    return newd;
}

function onTimezoneChange() {
    var selector = document.getElementById("_lstUTCTZone");
    var timezone_offset = timezone_array[selector.selectedIndex][1].substr(3).split(':');
    timezone_offset = GetTimezoneOffset(timezone_array[selector.selectedIndex][1]);
    //console.log(timezone_offset);

    //calcuate time with timezone offset
    var newtime = DateTimezone(timezone_offset);

    //refresh date & time show
    fHour.innerText = newtime.getHours();
    fMin.innerText = newtime.getMinutes();
    fSec.innerText = newtime.getSeconds();
    fDate.innerText = newtime.getDate();
    fMonth.innerText = newtime.getMonth() + 1;
    fYear.innerText = newtime.getFullYear();

    var gtm = newtime.getFullYear() + "/" + (newtime.getMonth() + 1) + "/" + newtime.getDate();
    var gwday = new Date(gtm);
    g_time.wday = gwday.getDay();
    fWday.innerText = wday[g_time.wday];
}

function getPreserveValues() {
    txtNTPServer1.value = NTPCFG.primary_ntp;
    txtNTPServer2.value = NTPCFG.secondary_ntp;
}

function enableNTP() {
    if (PrivilegeValue == 4) {
        var bopt = chkNTPEnable.checked;

        txtNTPServer1.disabled = !bopt;
        txtNTPServer2.disabled = !bopt;
    }
}

function validateNTPCfg() {
    DateandTimeMode = '';
    if (PrivilegeValue == 4) {
        if (!chkNTPEnable.checked) {
            DateandTimeMode = "Manual";
        } else {
            DateandTimeMode = "NTP";
            if ((!eVal.domainname(txtNTPServer1.value, true)) &&
                (!eVal.ip(txtNTPServer1.value, false)) &&
                (!eVal.ipv6(txtNTPServer1.value, false, false))) {
                alert(lang.STR_CONF_NTP_INVALID_PRIMARY_SERVER);
                return;
            }
            if ((!eVal.isblank(txtNTPServer2.value)) &&
                (!eVal.domainname(txtNTPServer2.value, true)) &&
                (!eVal.ip(txtNTPServer2.value, false)) &&
                (!eVal.ipv6(txtNTPServer2.value, false, false))) {
                alert(lang.STR_CONF_NTP_INVALID_SECONDARY_SERVER);
                return;
            }

            if (txtNTPServer1.value == txtNTPServer2.value) {
                alert(lang.STR_CONF_NTP_PRIMARY_SECONDARY_NOT_SAME);
                return;
            }
        }
        btnRefresh.disabled = true;
        btnSave.disabled = true;

        setTimeSyncmethod(DateandTimeMode);
    } else {
        alert(lang.STR_CONF_ADMIN_PRIV);
    }
}

function setTimeSyncmethod(type) {
    UtilsConfirm(lang.STR_CONF_NTP_REDIRECT_CONFIRM, {
        onOk: function () {
            Loading(true);
            var data = type == "NTP"
                ? '{"NTP": {"ProtocolEnabled": true}}'
                : '{"NTP": {"ProtocolEnabled": false}}';
            var ajax_url =
                "/redfish/v1/Managers/bmc/NetworkProtocol";
            var myajax = new Ajax.Request(ajax_url, {
                method: 'PATCH',
                contentType: 'application/json',
                parameters: data,
                onSuccess: setTimeSyncmethodRes,
                onFailure: function () {
                    Loading(false);
                    btnRefresh.disabled = false;
                    btnSave.disabled = false;
                    alert(lang.STR_CONF_NTP_SETVAL);
                }
            });
        },
        onCancel: function () {
            Loading(false);
            refreshNTPConfig();
            btnRefresh.disabled = false;
            btnSave.disabled = false;
        }
    });
}

function setTimeSyncmethodRes(response) {
    Loading(true);
    if (response.readyState == 4 && response.status == 204) {
        if (DateandTimeMode == "NTP") {
            if (Trim(txtNTPServer1.value) == Trim(txtNTPServer2.value)) {
                if (Trim(txtNTPServer1.value) == "" &&
                    Trim(txtNTPServer2.value) == "") {
                    if (ntp_enable.checked == true) {
                        btnRefresh.disabled = false;
                        btnSave.disabled = false;
                        alert(lang.LANG_CONF_DATE_TIME_ERR0);
                        return;
                    }
                } else {
                    btnRefresh.disabled = false;
                    btnSave.disabled = false;
                    alert(lang.LANG_CONF_DATE_TIME_ERR1);
                    return;
                }
            }
            var NTPservers = [];
            NTPservers.push(txtNTPServer1.value);
            if (txtNTPServer2.value) {
                NTPservers.push(txtNTPServer2.value);
            }
            var object = { "NTP": { "NTPServers": NTPservers } };
            var ajax_url = '/redfish/v1/Managers/bmc/NetworkProtocol';
            var myajax = new Ajax.Request(ajax_url, {
                method: 'PATCH',
                contentType: 'application/json',
                parameters: JSON.stringify(object),
                onSuccess: setNTPServersRes,
                onFailure: function () {
                    btnRefresh.disabled = false;
                    btnSave.disabled = false;
                    alert(lang.STR_CONF_NTP_SETVAL);
                }
            });
            var tOut = 500;
            var object = { "DateTimeLocalOffset": timezone_array[lstUTCTZone.selectedIndex][1].substr(3) };
        }

        if (DateandTimeMode == "Manual") {
            var tOut = 4000;
            var object = {
                "DateTimeLocalOffset": timezone_array[lstUTCTZone.selectedIndex][1].substr(3)
            };
        }
        setTimeout(function () { updateTimeZone(object); }, tOut);
    }
}

function compareTimezoneItem(a, b) {
    "use strict";
    var result = parseInt(0);
    if (a != null && b != null) {
        var a_offset_str = a[1].substr(3);
        var b_offset_str = b[1].substr(3);
        var a_offset = 0;
        var b_offset = 0;
        a_offset_str = a_offset_str.replace(":", "");
        b_offset_str = b_offset_str.replace(":", "");
        a_offset = parseInt(a_offset_str);
        b_offset = parseInt(b_offset_str);
        if (a_offset < b_offset) {
            result = parseInt(-1);
        }
        else if (a_offset > b_offset) {
            result = parseInt(1);
        }
    }
    return result;
}

function sortTimezoneList(list) {
    if (list != null && list.length > 0) {
        list.sort(compareTimezoneItem);
    }

    for (var idx = 0; idx < (list.length - 1); idx++) {
        if (compareTimezoneItem(list[idx], list[idx + 1]) == 0) {
            list[idx][0] += "/" + list[idx + 1][0];
            list[idx][2] += "/" + list[idx + 1][2];
            list.splice(idx + 1, 1);
            idx--;
        }
    }
}

function updateTimeZone(object) {
    var ajax_url = '/redfish/v1/Managers/bmc';
    var myajax = new Ajax.Request(ajax_url, {
        method: 'PATCH',
        contentType: 'application/json',
        parameters: JSON.stringify(object),
        onSuccess: setNTPServersRes,
        onFailure: function () {
            Loading(false);
            btnRefresh.disabled = false;
            btnSave.disabled = false;
            alert(lang.STR_CONF_NTP_SETVAL);
        }
    });
}

function setNTPServersRes() {
    btnRefresh.disabled = false;
    btnSave.disabled = false;
    alert(lang.STR_CONF_NTP_SAVE, {
        title: lang.LANG_GENERAL_SUCCESS,
        onClose: function () {
            clearSessionInfo();
            location.href = "/page";
        }
    });
}

/* function validateFormat() {
    var result = false;
    var svr_ip = null;
    var obj = null;
    var usr = null;
    var pwd = null;
    var value = null;

    svr_ip = document.getElementById("_text_smtp_address");
    if(svr_ip != null) {
        if (svr_ip.value) {
            if (!CheckIP6(svr_ip.value)) {
                alert(lang.LANG_CONFALERT_SMTP_SERVERIP + "\n" +
                        lang.LANG_CONFIG_NETWORK_ERR_INVALID_IP +
                        " \"" + obj.value + "\"", {type: "pre"});
                return false;
            }
        }
        obj = document.getElementById("_text_smtp_port");
        if ((obj.value && !svr_ip.value) || (!obj.value && svr_ip.value)) {
            alert(lang.LANG_CONFALERT_SMTP_SERVERIP + "\n" +
                    lang.LANG_CONFALERT_SMTP_SERVERPORT + "\n" +
                    lang.LANG_GENERAL_INTERDEPENDENT_VALUE, {type: "pre"});
            return false;
        } else if (obj.value && !CheckPortNumber(obj.value)) {
            alert(lang.LANG_CONFALERT_SMTP_SERVERPORT + "\n" +
                    lang.LANG_SMTP_INVALID_PORT +
                    " \"" + obj.value + "\"", {type: "pre"});
            return false;
        }

        obj = document.getElementById("_text_sender_address");
        if ((obj.value && !svr_ip.value) || (!obj.value && svr_ip.value)) {
            alert(lang.LANG_CONFALERT_SMTP_SERVERIP + "\n" +
                    lang.LANG_CONFALERT_SENDER_ADDRESS + "\n" +
                    lang.LANG_GENERAL_INTERDEPENDENT_VALUE, {type: "pre"});
            return false;
        } else if (obj.value && !CheckEmail(obj.value)) {
            alert(lang.LANG_CONFALERT_SENDER_ADDRESS + "\n" +
                    lang.LANG_MODALERT_ERRMAIL +
                    " \"" + obj.value + "\"", {type: "pre"});
            return false;
        }

        //smtp authentication
        obj = document.getElementById("_text_smtp_authentication");
        if (obj.checked == true) {
            usr = document.getElementById("_text_sender_user");
            pwd = document.getElementById("_text_sender_password");
            if (!usr.value || !pwd.value) {
                alert(lang.LANG_CONFALERT_SMTP_USER_PWD_REQ);
                return false;
            } else if (!svr_ip.value) {
                alert(lang.LANG_CONFALERT_SMTP_SERVERIP + "\n" +
                        lang.LANG_CONFALERT_SENDER_USER + "\n" +
                        lang.LANG_CONFALERT_SENDER_PASSWORD + "\n" +
                        lang.LANG_GENERAL_INTERDEPENDENT_VALUE, {type: "pre"});
                return false;
            } else if (pwd.value.length > 20) {
                alert(lang.LANG_CONFALERT_SENDER_PASSWORD + "\n" +
                        lang.LANG_CONFUSER_ADD_PWD_TOO_LONG, {type: "pre"});
                return false;
            }
        }

        //smtp protocal
        obj = document.getElementById("_text_auth_method");
        if(obj.value == 1){
            CACertallowedFileFormat = ['pem'];
            certficateallowedFileFormat = ['pem', 'crt'];
            privatekeyallowedFileFormat = ['pem', 'key'];
            var CACertfiletxt = starttlsCACertfiletxt.textContent;
            var certficatefiletxt = starttlscertficatefiletxt.textContent;
            var privatekeyfiletxt = starttlsprivatekeyfiletxt.textContent;
            if(!certificateValidation(starttlsCACertfile, CACertallowedFileFormat, CACertfiletxt, lang.LANG_SMTP_UPLOAD_VALID_CACERT_FILE)){return; }
            if(!certificateValidation(starttlscertficatefile, certficateallowedFileFormat, certficatefiletxt, lang.LANG_SMTP_UPLOAD_VALID_CERT_FILE)){return; }
            if(!certificateValidation(starttlsprivatekeyfile, privatekeyallowedFileFormat, privatekeyfiletxt, lang.LANG_SMTP_UPLOAD_VALID_PRIVATEKEY_FILE)){return; }
        }
    }
    return true;
}

function certificateValidation(fileField, fileFormat, fieldText,  errorMessage) {

    if (!fileField.files.length && fieldText != "") {
        return true;
    }
    else if (!fileField.files.length && fieldText == "") {
        alert(lang.LANG_THERMAL_UPLOAD_FILE);
        return false;
    } else {
        var allowedFiles = fileFormat;//['pem'];
        var fileUpload = fileField.files[0];
        var regex = new RegExp('^.*.(' + allowedFiles.join('|') + ')$');
            if (regex.test(fileUpload.name)) {
                starttlsUploadFlag = true;
                return true;
            }else if (!regex.test(fileUpload.name)) {
                alert(errorMessage);
                return false;
            } 
    }
} */
