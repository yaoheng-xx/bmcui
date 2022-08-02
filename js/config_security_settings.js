/* Configuration -- Security Settings  */

var SMASHsshPrevious= false;
var SOLsshPrevious= false;
var HTTPservicePrevious= false;
var RMCPservicePrevious= false;

var HTTPsPORTPrevious= '';

var FAILEDTIMESPrevious= '';
var LOCKOUTIMEPrevious= '';

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_security_hlp.html";
    var SMASHsshService = document.getElementById("SMASHsshService");
    var SOLsshService = document.getElementById("SOLsshService");
    var httpService = document.getElementById("httpService");
    var rmcpService = document.getElementById("rmcpService");

    var saveBtn = document.getElementById("saveBtn");
    saveBtn.setAttribute("value", lang.CONF_LOGIN_STR_SAVE);
    saveBtn.onclick= btnSaved;

    var failedAttempts = document.getElementById("failedAttempts");
    failedAttempts.addEventListener("keypress", validateNumeric);
    failedAttempts.addEventListener("keydown", validateNumeric);

    var lockoutTime = document.getElementById("lockoutTime");
    lockoutTime.addEventListener("keypress", validateNumeric);
    lockoutTime.addEventListener("keydown", validateNumeric);

    var httpsPort = document.getElementById("httpsPort");
    httpsPort.addEventListener("keypress", validateNumeric);
    httpsPort.addEventListener("keydown", validateNumeric);

    OutputString();
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("title_div").textContent = lang.CONF_LOGIN_PAGE_TITLE;
    document.getElementById("attemp_legen").textContent = lang.CONF_LEGEND_LOGIN_ATTEMPT;
    document.getElementById("failed_attempts_lbl").textContent = lang.CONF_LOGIN_STR_FAILED_ATTEMPTS;
    document.getElementById("lockout_time_lbl").textContent = lang.CONF_LOGIN_STR_LOCKOUT_TIME;
    document.getElementById("port_setting_legend").textContent = lang.CONF_LEGEND_PORT_SETTING;
    document.getElementById("https_port_lbl").textContent = lang.CONF_LOGIN_STR_HTTP_SEC_PORT;
    document.getElementById("network_services_legend").textContent = lang.CONF_LEGEND_NETWORK_SERVICES;
    document.getElementById("smash_service_lbl").textContent = lang.CONF_LOGIN_STR_SMASH_SSH_SERVICE;
    document.getElementById("login_enable_lbl").textContent = lang.CONF_LOGIN_STR_ENABLE;
    document.getElementById("sol_service_lbl").textContent = lang.CONF_LOGIN_STR_SOL_SSH_SERVICE;
    document.getElementById("login2_enable_lbl").textContent = lang.CONF_LOGIN_STR_ENABLE;
    document.getElementById("http_service_lbl").textContent = lang.CONF_LOGIN_STR_HTTP_SERVICE;
    document.getElementById("login3_enable_lbl").textContent = lang.CONF_LOGIN_STR_ENABLE;
    document.getElementById("rmcp_service_lbl").textContent = lang.CONF_LOGIN_STR_RMCP_SERVICE;
    document.getElementById("login4_enable_lbl").textContent = lang.CONF_LOGIN_STR_ENABLE;
}

function PrivilegeCallBack(Privilege)
{
        if (Privilege == '04')
        {
            getUserBlockout();
            getServicesStatus();
            getwebPortNo();
        }
        else if (Privilege == '03')
        {
            getUserBlockout();
            getServicesStatus();
            getwebPortNo();
            saveBtn.disabled= true;
        }
        else
        {
            location.href = SubMainPage;
            saveBtn.disabled= true;
        }
}

onload = function() {
	document.title = lang.CONF_LOGIN_STR_TITLE;
}
function btnSaved(){
        var cmdSended = 0;
        if(FAILEDTIMESPrevious != failedAttempts.value || LOCKOUTIMEPrevious != lockoutTime.value){
                if(parseInt(failedAttempts.value) <= 255 && parseInt(lockoutTime.value) <= 65535){
                        setUserBlockout();
                        cmdSended = 1;
                }
                else{
                        if(parseInt(failedAttempts.value) > 255){
                           alert(lang.CONF_LOGIN_STR_FAILED_ATTEMPTS_WARN);
                           return;
                        }
                        if(parseInt(lockoutTime.value) > 65535){
                           alert(lang.CONF_LOGIN_STR_LOCKOUT_TIME_WARN);
                        }
                        return;
                }
        }
        if(HTTPsPORTPrevious != httpsPort.value){
                if(parseInt(httpsPort.value) != 0 &&
                   parseInt(httpsPort.value) <= 65535)
                {
                    UtilsConfirm(lang.CONF_LOGIN_PORT_WARN, {
                        onOk: function() {
                            setwebPortNo();
                            cmdSended = 1;
                        }
                    });
                } else {
                        alert(lang.LANG_CONF_PORTERR_WARNING);
                }
        }
	else{
                getwebPortNo();
        }
        if(cmdSended ||
           SMASHsshService.checked!= SMASHsshPrevious ||
           SOLsshService.checked!= SOLsshPrevious ||
           httpService.checked!= HTTPservicePrevious ||
           rmcpService.checked!= RMCPservicePrevious
           )
        {
	   setHttpServices();
         }
}

function setHttpServices() {}

function checkserviceResult(originalRequest){}

function sendData(url, pars, ajax_data, methodtype, callback){}

function getServicesStatus(){}

function servicesStateResult(originalRequest){
	Loading(false);
	if(originalRequest.readyState== 4&& originalRequest.status== 200){
		var response= originalRequest.responseText.replace(/^\s+|\s+$/g, "");
		var xmldoc= GetResponseXML(response);
		if(xmldoc== null){
			SessionTimeout();
			return;
		}

            //check session & privilege result
            if(CheckInvalidResult(xmldoc) < 0) {
                return;
            }

            var IPMIRoot = xmldoc.documentElement;//point to IPMI

           	var networkService=IPMIRoot.getElementsByTagName('NETWORK_SERVICE');
           	var getStatus = networkService[0].getElementsByTagName('GET_STATUS');
		var smashSSHservice = getStatus[0].getAttribute('SMASH_SSH_SERVICE');
           	var solSSHservice = getStatus[0].getAttribute('SOL_SSH_SERVICE');
           	var httpservice = getStatus[0].getAttribute('HTTP_SERVICE');
           	var rmcpservice = getStatus[0].getAttribute('RMCP_SERVICE');

		if(smashSSHservice != '0')
			SMASHsshPrevious= SMASHsshService.checked= true;
		else
			SMASHsshPrevious= SMASHsshService.checked= false;
		if(solSSHservice != '0')
        		SOLsshPrevious= SOLsshService.checked= true;
		else
			SOLsshPrevious= SOLsshService.checked= false;
		if(httpservice != '0')
        		HTTPservicePrevious= httpService.checked= true;
		else
			HTTPservicePrevious= httpService.checked= false;
		if(rmcpservice != '0')
        		RMCPservicePrevious= rmcpService.checked= true;
		else
			RMCPservicePrevious= rmcpService.checked= false;
	}
	else{
		location.href = "/page/config_security_settings.html";
	}
}

function webPortNoStatus(originalRequest){
	Loading(false);
        if(originalRequest.readyState== 4&& originalRequest.status== 200){
                var response= originalRequest.responseText.replace(/^\s+|\s+$/g, "");
                var xmldoc= GetResponseXML(response);
                if(xmldoc== null){
                        SessionTimeout();
                        return;
                }
                var IPMIRoot=xmldoc.documentElement;
		//check session & privilege
                if (CheckInvalidResult(xmldoc) < 0) {
                    return;
                }
                var webPort=IPMIRoot.getElementsByTagName('GET_HTTP_PORT');
                var portInfo = webPort[0].getElementsByTagName('PORT_INFO');
                var httpsPortNo = portInfo[0].getAttribute('HTTPS_PORT');
		HTTPsPORTPrevious= httpsPort.value= httpsPortNo;
	}
}

function isRestart(){
	if(HTTPsPORTPrevious == httpsPort.value){
		return 0;
	}
	else
		return 1;
}

