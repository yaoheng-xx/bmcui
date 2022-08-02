/************************   CHECK JRE VERSION part  *************
    var ikvmBtnObj;
    var appver;
    var OStype;
    var Platform;
    var JREVersion;
    var Useragent;
    var JREcheck;

    CheckOSandJre();

function CheckOSandJre()
{
    Platform = navigator.platform;
    Appver = navigator.appVersion;
    Useragent=navigator.userAgent;
    JREVersion= deployJava.getJREs();                // detect Client JREversion
    JREcheck= deployJava.versionCheck("1.6.0_14+");  // check  Client JREversion

    alert(Useragent);
    // check OS is windows
    if(Appver.match("Windows") != null)
    {
        if(Appver.match("Windows NT 5.0") != null)
            OStype = "Windows Server 2000";
        else if(Appver.match("Windows NT 5.1") != null)
            OStype = "Windows XP";
        else if(Appver.match("Windows NT 5.2") != null)
            OStype = "Windows Server 2003";
        else if(Appver.match("Windows NT 6.0") != null)
            OStype = "Windows Vista/Windows Server 2008";
        else if(Appver.match("Windows NT 6.1") != null)
            OStype = "Windows 7/Windows Server 2008 R2";
        else if(Appver.match("Windows NT 6.2") != null)
            OStype = "Windows 8/Windows Server 2012";
        else
            OStype = " unknown Windows Version";
    }

    // check OS is Linux
    else if(Useragent.match("Linux") !=null)
    {
        // Linux distrio table
        if(Useragent.match("Arch"))
            OStype = "Arch";
        else if(Useragent.match("CentOS"))
            OStype = "CentOS";
        else if(Useragent.match("Debian"))
            OStype = "Debian";
        else if(Useragent.match("Fedora"))
            OStype = "Fedora";
        else if(Useragent.match("Gentoo"))
            OStype = "Gentoo";
        else if(Useragent.match("Kanotix"))
            OStype = "Kanotix";
        else if(Useragent.match("Mandriva"))
            OStype = "Mandriva";
        else if(Useragent.match("Mint"))
            OStype = "Mint";
        else if(Useragent.match("SUSE"))
            OStype = "SuSE/OpenSuSE";
        else if(Useragent.match("Red Hat"))
            OStype = "RedHat";
        else if(Useragent.match("Ubuntu"))
            OStype = "Ubuntu";
        else if(Useragent.match("ubuntu"))
            OStype = "Ubuntu";
        else
            OStype = "Unknown Linux distro";

    }
    //check os is MacOS
    else if (Platform.match("Mac") !=null)
        OStype = "MacOS"
    //check os is Unix
    else if(Useragent.match("Unix") !=null)
        OStype = "Unix";


    if((OStype =="CentOS") && (!JREcheck))
    {
        alert(lang.LANG_MAN_IKVM_UPDATE_JRE);
    }
}
*************** end ***********************/
