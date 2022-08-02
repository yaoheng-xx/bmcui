"use strict";
var lang;
var lang_setting;
window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit() {
    "use strict";
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting +
        "/vm_html5_hlp.html";
    document.getElementById("caption_div").textContent = lang.LANG_VM_HTML5_CAPTION;
    document.getElementById("launch").textContent = lang.LANG_VM_HTML5_LAUNCH;
    var vmhtml5BtnObj = document.getElementById("launchVmHtml5");
    vmhtml5BtnObj.value = lang.LANG_VM_HTML5_BUTTON;
    vmhtml5BtnObj.disabled = true;
    CheckUserPrivilege(PrivilegeCallBack);
}

function SwlCallBack(swl_status)
{
    var vmhtml5BtnObj = document.getElementById("launchVmHtml5");
    if (swl_status != "ACTIVATED") {
        vmhtml5BtnObj.disabled = true;
        $("#add_desc_div").text(lang.LANG_VM_WEBISO_UPLOAD_LICENSE_ERR);
        $('#vmedia_noconfig_msg').show();
        alert(lang.LANG_SYS_INFO_SOFT_LICENSE_INACTIVATED);
    }
    else
    {
        $('#vmedia_noconfig_msg').hide();
        vmhtml5BtnObj.show();
        vmhtml5BtnObj.disabled = false;
    }
}

function PrivilegeCallBack(Privilege)
{
    "use strict";
    var vmhtml5BtnObj = document.getElementById("launchVmHtml5");
    if(Privilege == '04')
    {
        getSwlStatus(SwlCallBack);
        vmhtml5BtnObj.onclick=function() {
            window.open(geturlPath() +"page/man_vm_html5.html",
              'VM_HTML5', 'menubar=yes,toolbar=no,scrollbars=yes,resizable=yes,channelmode=no,height=380,width=670');
        };
    }
    else
    {
        location.href = SubMainPage;
    }
    return;
}
