"use strict";
window.addEventListener('load', PageInit);

CheckUserPrivilegeX(PrivilegeCallBack);

function PrivilegeCallBack(Privilege) {
    //CreateCookie("PRIVILEGE_LIMIT",Privilege);
}

function PageInit() {
    //EraseCookie("SESSIONTIMEOUT");
    // get_project_configurations();
}

function get_project_configurations() {
    var ajax_url = "/api/configuration/project";

    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        contentType: "application/json",
        timeout: g_CGIRequestTimeout,
        onSuccess: function(res) {
            window.sessionStorage.setItem('features', res.responseText);
        },
        onFailure: function(){
            alert("Error in Getting feature configurations!!");
        }
    })
}
