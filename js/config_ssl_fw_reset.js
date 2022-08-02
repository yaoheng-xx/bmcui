window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function getParameter(parameterName) {
    var strQuery = location.search.substring(1);
    var paramName = parameterName + "=";

    if (strQuery.length > 0)
    {
        begin = strQuery.indexOf(paramName);

        if (begin != -1)
        {
            begin += paramName.length;
            end = strQuery.indexOf("&" , begin);
            if ( end == -1 ) end = strQuery.length

                return unescape(strQuery.substring(begin, end));
        }
        return "null";
    }
}

function PageInit()
{
    Loading(true);
    document.getElementById("reset_desc1_span").textContent = lang.LANG_FW_RESET_DESC1;
    document.getElementById("reset_desc2_span").textContent = lang.LANG_FW_RESET_DESC2;
    var url = '/';
    var pars = 'time_stamp='+(new Date());
    var myAjax = new Ajax.Request(
            url,
            {method: 'get', parameters:pars}//reigister callback function
            );

    var PreviousPage = getParameter("prevpage");
    var PortNum = getParameter("port");

    if (isIpv6Addr(location.hostname))
    {
        if ( location.hostname.match(/^\[.*\]$/) != null )
            var aHostName = location.hostname;		//Chrome and Safari
        else
            var aHostName ="["+ location.hostname+"]";	//IE and FireFox
    }
    else
    {
        var aHostName = location.hostname;
    }

    if ( PortNum != "null")
        NewURL = window.location.protocol+"//" + aHostName + ":" + PortNum + "/";
    else
        NewURL = window.location.protocol+"//" + aHostName+ ":" + window.location.port + "/";

    NewString = lang.LANG_FW_RESET_DESC3.replace("NEWURL_PATTERN",NewURL);
    $('reset_string').textContent = NewString;
    if (PreviousPage == "conf_port")
        $('reset_caption').textContent = lang.LANG_CONF_PORT_CAPTION;
    else
        $('reset_caption').textContent = lang.LANG_CONFIG_SSL_CAPTION;
    setTimeout(redirect,60000);
}

function redirect(){
    location.href =  NewURL;
}
