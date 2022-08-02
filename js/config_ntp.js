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
var lstMonth;
var lstDate;
var lstYear;
var txtHour;
var txtMinute;
var txtSecond;
var lstUTCTZone;
var lblHour;
var txtNTPServer1;
var txtNTPServer2;
var chkNTPEnable;
var divNTPError;
var startYear = 2005;
var endYear = 2038;

var NTPCFG;
var DATETIMECFG;
var PrivilegeValue = 0;
var DateandTimeMode = '';
var setSeconds_for_manual=0;

window.addEventListener('load', PageInit);
var lang;
var btnSave;
var btnRefresh;
var btnReset;
if (parent.lang) { lang = parent.lang; }

function PageInit() {
	top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_ntp_hlp.html";
	TIMEZONE_SUPPORT = true; //checkProjectCfg("TIMEZONE_SUPPORT");

	lstMonth = document.getElementById("_lstMonth");
	lstDate = document.getElementById("_lstDate");
	lstYear = document.getElementById("_lstYear");
	txtHour = document.getElementById("_txtHour");
	txtMinute = document.getElementById("_txtMinute");
	txtSecond = document.getElementById("_txtSecond");
	lstUTCTZone = document.getElementById("_lstUTCTZone");
	lblHour = document.getElementById("_lblHour");
	txtNTPServer1 = document.getElementById("_txtNTPServer1");
	txtNTPServer2 = document.getElementById("_txtNTPServer2");
	chkNTPEnable = document.getElementById("_chkNTPEnable");
	divNTPError = document.getElementById("_divNTPError");


	divNTPError.innerHTML = "";

    btnSave = document.getElementById("_btnSave");
    btnSave.value = lang.CFG_NTP_SAVE;
	btnRefresh = document.getElementById("_btnRefresh");
    btnRefresh.value = lang.CFG_NTP_REFRESH;
	btnReset = document.getElementById("_btnReset");
    btnReset.value = lang.CFG_NTP_RESET;
    OutputString();
	CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(Privilege)
{
	PrivilegeValue = Privilege;
	if(PrivilegeValue == 4) {
          chkNTPEnable.disabled = false;
          btnSave.disabled = false;
          btnReset.disabled = false;
          chkNTPEnable.onclick = enableNTP;
          btnSave.onclick = validateNTPCfg;
          btnReset.onclick = reloadNTPCfg;
	} else {
		disableActions();
	}
	
	initControls();
        getNTPServers();
        getNTPCfg();
	btnRefresh.onclick = refreshNTPCfg;
	
	if (TIMEZONE_SUPPORT) {
		lstUTCTZone.className = "visibleRow";
	} else {
		lblHour.className = "visibleRow";
	}
}

function disableActions() {
  chkNTPEnable.disabled = true;
  btnSave.disabled = true;
  btnReset.disabled = true;
}

function initControls() {
	var month =	["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];

	var utcOffsetValue = [ "-12:00", "-11:30","-11:00", "-10:30","-10:00", "-09:30", "-09:00", "-08:30",
		"-08:00", "-07:30", "-07:00", "-06:30", "-06:00", "-05:30", "-05:00", "-04:30",
		"-04:00", "-03:30", "-03:00", "-02:30", "-02:00", "-01:30", "-01:00","-00:30",
		"+/-0",
		"+00:30", "+01:00", "+01:30", "+02:00", "+02:30", "+03:00", "+03:30", "+04:00",
		"+04:30", "+05:00", "+05:30", "+05:45", "+06:00", "+06:30", "+07:00", "+07:30", 
		"+08:00", "+08:30", "+09:00", "+09:30", "+10:00", "+10:30", "+11:00", "+11:30", 
		"+12:00", "+12:45"];

	var optind =0;
	for (var dat=1; dat<=31; dat++) {
		lstDate.add(new Option(dat,dat), optind++);
	}

	optind = 0;
	for (var mon=0; mon<12; mon++) {
		lstMonth.add(new Option(month[mon], mon), optind++);
	}

	optind = 0;
	for (var year = startYear; year<=endYear; year++) {
		lstYear.add(new Option(year, year), optind++);
	}
}

function OutputString() {
	document.getElementById("ntp_caption_div").textContent = lang.CFG_NTP_TITLE;
	document.getElementById("ntp_date_lbl").textContent = lang.CFG_NTP_DATE;
	document.getElementById("ntp_time_lbl").textContent = lang.CFG_NTP_TIME;
	document.getElementById("ntp_timeExpand_lbl").textContent = lang.CFG_NTP_HH_MM_SS;
	document.getElementById("ntp_timezone_lbl").textContent = lang.CFG_NTP_TIMEZONE;
	document.getElementById("ntp_primary_lbl").textContent = lang.CFG_NTP_PRIMARY;
	document.getElementById("ntp_secondary_lbl").textContent = lang.CFG_NTP_SECONDARY;
	document.getElementById("ntp_enable_lbl").textContent = lang.CFG_NTP_SYNC_NTP;
}

function getNTPCfg() {
    Loading(true);
    var ajax_url = '/redfish/v1/Managers/bmc';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: getNTPCfgRes,
        onFailure: function() {
			Loading(false);
			alert(lang.STR_CONF_NTP_GETVAL);
        }
    });
}

function getNTPServers(){
    Loading(true);
    var ajax_url = '/redfish/v1/Managers/bmc/NetworkProtocol';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: getNTPServerCfgRes,
        onFailure: function() {
			Loading(false);
			alert("No NTP Servers Configured!!");
        }
    });
}

function getNTPServerCfgRes(res){
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
                if (response.NTP.NTPServers.length) {
                  txtNTPServer1.value = response.NTP.NTPServers[0];
                  txtNTPServer2.value = response.NTP.NTPServers[1]
                                            ? response.NTP.NTPServers[1]
                                            : "";
                }
        }
}

function getNTPCfgRes(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    NTPCFG = JSON.parse(arg.responseText);
    var bmc_timestamp = new Date(NTPCFG.DateTime);
    timeZoneString = NTPCFG.DateTimeLocalOffset;
    document.getElementById('_lstUTCTZone').value = timeZoneString;
    var parsing = timeZoneString.match(/.{1,1}/g);
    var utcSeconds = parsing[0] + (parseInt((parsing[1] + parsing[2]) * 60) +
                                   parseInt(parsing[4] + parsing[5]));
    var clientSeconds = (bmc_timestamp.getTime()) + (utcSeconds * 60000)
    var clientDateObject =
        new Date(clientSeconds); // Date object requires milliseconds
    var yearCheck = clientDateObject.getUTCFullYear();

    if ((yearCheck < startYear) || (yearCheck > endYear)) {
      alert(lang.STR_CONF_NTP_DATE_RANGE);
    } else {
      lstMonth.value = clientDateObject.getUTCMonth();
      lstDate.value = clientDateObject.getUTCDate();
      lstYear.value = yearCheck;

      var disp_hours = clientDateObject.getUTCHours();
      var disp_mins = clientDateObject.getUTCMinutes();
      var disp_secs = clientDateObject.getUTCSeconds();

      if ((!isNaN(disp_hours)) && (!isNaN(disp_mins)) && (!isNaN(disp_secs))) {
        txtHour.value = ((disp_hours < 10) ? "0" : "") + disp_hours;
        txtMinute.value = ((disp_mins < 10) ? "0" : "") + disp_mins;
        txtSecond.value = ((disp_secs < 10) ? "0" : "") + disp_secs;
      }
    }
    // Preserving the values
    preserveMonth = lstMonth.value;
    preserveDate = lstDate.value;
    preserveYear = lstYear.value;
    preserveHour = txtHour.value;
    preserveMinute = txtMinute.value;
    preserveSecond = txtSecond.value;
    preserveUTCTzone = lstUTCTZone.value;
  }
}

function getPreserveValues() {
	lstMonth.value = preserveMonth;
	lstDate.value = preserveDate;
	lstYear.value = preserveYear;
	txtHour.value =preserveHour;
	txtMinute.value = preserveMinute;
	txtSecond.value = preserveSecond;
        chkNTPEnable.checked = preserveNTPEnable;
        txtNTPServer1.value = NTPCFG.primary_ntp;
	txtNTPServer2.value = NTPCFG.secondary_ntp;
}

function reloadNTPCfg() {
	getPreserveValues();
	enableNTP();
	getNTPCfg()
}

function refreshNTPCfg() {
	if (preserveNTPEnable == chkNTPEnable.checked) {
		if (chkNTPEnable.checked) {	//Check whether any changes made to NTP configuration
			if ((NTPCFG.primary_ntp == txtNTPServer1.value) && 
				(NTPCFG.secondary_ntp == txtNTPServer2.value) && 
				(preserveUTCTzone == lstUTCTZone.value)) {
				//getDateTime();
				getNTPCfg();
			} else {
				if (confirm(lang.STR_CONF_NTP_CONFIRM)){
					validateNTPCfg();
				} else {
					reloadNTPCfg();
				}
			}
		} else {		//Check whether any changes made to Date and Time configuration
			if ((preserveMonth == lstMonth.value) && (preserveDate == lstDate.value)
				&& (preserveYear == lstYear.value) && (preserveHour == txtHour.value)
				&& (preserveMinute == txtMinute.value) && (preserveSecond == txtSecond.value)
				&& (preserveUTCTzone == lstUTCTZone.value)) {
					//getDateTime();
					getNTPCfg();
			} else {
				if (confirm(lang.STR_CONF_NTP_CONFIRM)){
					validateNTPCfg();
				} else {
					reloadNTPCfg();
				}
			}
		}
	} else {
		if (confirm(lang.STR_CONF_NTP_CONFIRM)) {
			validateNTPCfg();
		} else {
			reloadNTPCfg();
		}
	}
}

function reloadNTPCfg() {
	getPreserveValues();
	enableNTP();
	// getDateTime();
}

function enableNTP() {
	if (PrivilegeValue == 4) {
		var bopt = chkNTPEnable.checked;
		lstMonth.disabled = bopt;
		lstDate.disabled = bopt;
		lstYear.disabled = bopt;
		txtHour.disabled = bopt;
		txtMinute.disabled = bopt;
		txtSecond.disabled = bopt;

		txtNTPServer1.disabled = !bopt;
		txtNTPServer2.disabled = !bopt;
	}
}

function validateNTPCfg() {
	var setSeconds = 0;		//If NTP is enabled, then we should not save Date/Time Configuration
	DateandTimeMode = '';
	if (PrivilegeValue == 4) {
		if(!eVal.isnumstr(txtHour.value, 0, 23)) {
			alert(lang.STR_CONF_NTP_INVALID_HOUR);
			txtHour.focus();
			return;
		}
		if(!eVal.isnumstr(txtMinute.value, 0, 59)) {
			alert(lang.STR_CONF_NTP_INVALID_MINS);
			txtMinute.focus();
			return;
		}
		if(!eVal.isnumstr(txtSecond.value, 0, 59)) {
			alert(lang.STR_CONF_NTP_INVALID_SECS);
			txtSecond.focus();
			return;
		}

		if ((lstMonth.value) == 1) {
			if((lstYear.value)%4 == 0) {
				if((lstDate.value) > 29) {
					alert(lang.STR_CONF_NTP_INVALID_DATE + lang.STR_CONF_NTP_INVALID_LEAP);
					return;
				}
			} else {
				if((lstDate.value) > 28) {
					alert(lang.STR_CONF_NTP_INVALID_DATE + lang.STR_CONF_NTP_INVALID_FEB);
					return;
				}
			}
		} else if (((lstMonth.value) == 3)  || ((lstMonth.value) == 5) || 
			((lstMonth.value) == 8) || ((lstMonth.value) == 10)) {
				if ((lstDate.value) > 30)
				{
					alert(lang.STR_CONF_NTP_INVALID_DATE + lang.STR_CONF_NTP_INVALID_MONTH);
					return;
				}
		}
		if ((lstMonth.value == 0) && (lstDate.value >= 19) && (lstYear.value == endYear)) {		//Check upto 18th January 2038 (Year 2038 Problem)
			alert(lang.STR_CONF_NTP_INVALID_DATE + lang.STR_HELP_INFO);
			return;
		}
		var setDateObject = Date.UTC(lstYear.value, lstMonth.value, lstDate.value, 
			parseInt(txtHour.value, 10),
			parseInt(txtMinute.value, 10),
			parseInt(txtSecond.value, 10));
		setSeconds = (setDateObject/1000);	//To milliseconds to seconds
		if (setSeconds > Math.pow(2,31)) {		//Check for Year 2038 Problem exact value
			alert(lang.STR_CONF_NTP_INVALID_DATE + lang.STR_HELP_INFO);
			return;
		}
		if (!chkNTPEnable.checked) {
			DateandTimeMode = "Manual";
		} else {
			DateandTimeMode = "NTP";
			if ((!eVal.domainname(txtNTPServer1.value,true)) && 
				(!eVal.ip(txtNTPServer1.value,false)) && 
				(!eVal.ipv6(txtNTPServer1.value, false, false))) {
					alert(lang.STR_CONF_NTP_INVALID_PRIMARY_SERVER);
					return;
			}
			if ((!eVal.isblank(txtNTPServer2.value)) &&
				(!eVal.domainname(txtNTPServer2.value,true)) && 
				(!eVal.ip(txtNTPServer2.value,false)) && 
				(!eVal.ipv6(txtNTPServer2.value, false, false))) {
					alert(lang.STR_CONF_NTP_INVALID_SECONDARY_SERVER);
					return;
			}

            if(txtNTPServer1.value==txtNTPServer2.value){
                alert(lang.STR_CONF_NTP_PRIMARY_SECONDARY_NOT_SAME);
                return;
            }
		}
		btnRefresh.disabled = true;
		btnSave.disabled = true;
		// Get the time zone info with DST values
		// Use this TZ info and convert to date time 
		// to GMT time equivalent unix time 
		var dst_tz = 0;
		var zone = moment.tz.zone(lstUTCTZone.value);
		setSeconds_for_manual = setSeconds;
		setTimeSyncmethod(DateandTimeMode);
		// setDateTime(setSeconds + dst_tz);
		//setDateTime(setSeconds);
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
                          method : 'PATCH',
                          contentType : 'application/json',
                          parameters : data,
                          onSuccess : setTimeSyncmethodRes,
                          onFailure : function() {
                            Loading(false);
                            btnRefresh.disabled = false;
                            btnSave.disabled = false;
                            alert(lang.STR_CONF_NTP_SETVAL);
                          }
                        });
		}
	});
}

function setTimeSyncmethodRes(response){
  Loading(true);
  if (response.readyState == 4 && response.status == 204) {
    if (DateandTimeMode == "NTP") {
      var NTPservers = [];
      NTPservers.push(txtNTPServer1.value);
      if (txtNTPServer2.value) {
        NTPservers.push(txtNTPServer2.value);
      }
      var object = {"NTP" : {"NTPServers" : NTPservers}};
      var ajax_url = '/redfish/v1/Managers/bmc/NetworkProtocol';
      var myajax = new Ajax.Request(ajax_url, {
        method : 'PATCH',
        contentType : 'application/json',
        parameters : JSON.stringify(object),
        onSuccess : setNTPServersRes,
        onFailure : function() {
          btnRefresh.disabled = false;
          btnSave.disabled = false;
          alert(lang.STR_CONF_NTP_SETVAL);
        }
      });
      var tOut = 500;
      var object = {"DateTimeLocalOffset" : lstUTCTZone.value};
    }

    if (DateandTimeMode == "Manual") {
      var tOut = 4000;
      var date_string = new Date(setSeconds_for_manual * 1000).toISOString();
      var object = {
        "DateTime" : date_string,
        "DateTimeLocalOffset" : lstUTCTZone.value
      };
    }
    setTimeout(function() { updateTimeZone(object); }, tOut);
  }
}

function updateTimeZone(object) {
  var ajax_url = '/redfish/v1/Managers/bmc';
  var myajax = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : 'application/json',
    parameters : JSON.stringify(object),
    onSuccess : setNTPServersRes,
    onFailure : function() {
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
    title : lang.LANG_GENERAL_SUCCESS,
    onClose : function() {
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
