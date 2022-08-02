"use strict";
/* configuration firmware update page */
(function($) {

var activefwfile = null;
var err_finsh = false;
var FileBrowse;
var g_SWASMKeyOemActionUrl  = "Actions/Oem/Intel.Oem.AdvancedSystemManagementKey";
var g_SwASMKeyUrl  = "AdvancedSystemManagementKey/";
var g_SwInventoryUrl = "/redfish/v1/UpdateService/SoftwareInventory/";
var lang;
var last_state = null;
var uploadBtn;

$( document ).ready(function() { $.PageInit(); });
if (parent.lang) { lang = parent.lang; }
$.PageInit = function() {
    "use strict";
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/config_software_licensing_hlp.html";

    document.title = lang.LANG_CONFIG_SUBMENU_SOFT_LICENSE;
    $("#uploadBtn").attr("value", lang.LANG_COMMON_BTN_UPLOAD).click(SWL_UploadBtn);
    $("#FileBrowse")
            .click(function(e) { $(this).attr("value", null); })
            .change(function () { checkfile(); });
    $("#swlready").hide();

    var swlchk = document.getElementById("swlChkStatus");
    var swlupd = document.getElementById("swlUpdStatus");
    var swlprg = document.getElementById("swlprogram");

    swlprg.style.marginTop = "-10px"
    swlchk.style.lineHeight = "2";
    swlupd.style.lineHeight = "2";

    UploadEnable(true);
    OutputString();
    CheckUserPrivilege(PrivilegeCallBack);
}

function UploadEnable(enable) {
    "use strict";
    var dropzone = document.documentElement;
    var curstatus = $("#swlUpdStatus");
    if (enable) {
        $("#FileBrowse").val(null);
        dropzone.ondragover = dropzone.ondragenter = function(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        dropzone.ondrop = function(e) {
            e.stopPropagation();
            e.preventDefault();

            var filesArray = e.dataTransfer.files;
            if (filesArray.length > 1)
                return false;
            uploadkey(g_SwASMKeyUrl + g_SWASMKeyOemActionUrl);
        }
        curstatus.hide();
    } else {
        dropzone.ondrop = dropzone.ondragover = dropzone.ondragenter = function(e) {}
        curstatus.show();
    }
}

function OutputString() {
    "use strict";
    document.getElementById("submenu_div").textContent = lang.LANG_CONFIG_SOFT_LICENSE_CAPTION;
    document.getElementById("desc_p").textContent = lang.LANG_CONFIG_SOFT_LICENSE_DESC;
    document.getElementById("submenu_legend").textContent = lang.LANG_CONFIG_SOFT_LICENSE_UPLOAD_INFO;
    document.getElementById("license_process_legend").textContent = lang.LANG_CONFIG_SOFT_LICENSE_PROC;
    document.getElementById("upload_time_span").textContent = lang.LANG_CONFIG_SOFT_LICENSE_TIME;
    document.getElementById("drop_file").textContent = lang.LANG_CONFIG_SOFT_LICENSE_FILE;
    document.getElementById("swlupload-label").textContent = lang.LANG_CONFIG_SOFT_LICENSE_ACTIVE1;
    document.getElementById("swlauthenticate-label").textContent = lang.LANG_CONFIG_SOFT_LICENSE_ACTIVE2;
    document.getElementById("feature3-label").textContent = lang.LANG_CONFIG_SOFT_LICENSE_ACTIVE3;
    document.getElementById("swlprogram-label").textContent = lang.LANG_CONFIG_SOFT_LICENSE_PROGRAM;
    document.getElementById("swlprogram-value").textContent = lang.LANG_CONFIG_SOFT_LICENSE_PENDING;
    document.getElementById("swlparse-label").textContent = lang.LANG_CONFIG_SOFT_LICENSE_PARSE;
    document.getElementById("swlparse-value").textContent = lang.LANG_CONFIG_SOFT_LICENSE_PENDING;
    document.getElementById("swlready-label").textContent = lang.LANG_CONFIG_SOFT_LICENSE_READY;
}

function PrivilegeCallBack(Privilege){
    "use strict";
    //full access
    uploadBtn = $("#uploadBtn");
    FileBrowse = $("#FileBrowse");
    if(Privilege == '04')
    {
        uploadBtn.prop("disabled", true);
        FileBrowse.prop("disabled", false);
        getSwlInfo();
    }
    //only view
    else if(Privilege == '03' || Privilege == '02')
    {
        uploadBtn.prop("disabled", true);
        FileBrowse.prop("disabled", true);
        getSwlInfo();
    }
    //no access
    else
    {
        location.href = SubMainPage;
        uploadBtn.prop("disabled", true);
        FileBrowse.prop("disabled", true);
    }
}

function PrivilegeCallBackFileReady(Privilege) {
    "use strict";
    //full access
    if(Privilege == '04')
    {
        uploadBtn.prop("disabled", false);
        FileBrowse.prop("disabled", false);
    }
    else
    {
        uploadBtn.prop("disabled", true);
        FileBrowse.prop("disabled", true);
        FileBrowse.attr("value", null);
    }
}

function getSwlInfo()
{
    // Get call function
    Loading(true);
    SoftwareLicensingReadingResult();
}

function getPlatformName(swl_status) {
    var ajax_url = '/redfish/v1/Chassis';
    var CSRFTOKEN = getCSRFToken();
    jQuery.ajax({
      url : ajax_url,
      headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
      type : "GET",
      dataType : "json",
      contentType : false,
      processData : false,
      cache : false,
      success : function(response, status, xhr) {
        for (var i = 0; i < response.Members.length; i++) {
          var url = response.Members[i]["@odata.id"];
          if (url.indexOf("_Baseboard") != -1) {
            var board = url.substring(url.lastIndexOf("/"));
            if (swl_status == "ACTIVATED") {
              $("#swlupload-value").text(lang.LANG_CONFIG_SOFT_LICENSE_ACTIVED);
              $("#swlauthenticate-value")
                  .text(lang.LANG_CONFIG_SOFT_LICENSE_ACTIVED);
              $("#feature3-value").text(lang.LANG_CONFIG_SOFT_LICENSE_ACTIVED);
            } else {
              $("#swlupload-value")
                  .text(lang.LANG_CONFIG_SOFT_LICENSE_UNACTIVE);
              $("#swlauthenticate-value")
                  .text(lang.LANG_CONFIG_SOFT_LICENSE_UNACTIVE);
              $("#feature3-value").text(lang.LANG_CONFIG_SOFT_LICENSE_UNACTIVE);
            }
            if (board.includes("FCP")) {
              $("#feature3").show();
              break;
            }
          }
        }
      },
      error : function(data) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          Loading(false);
          alert(lang.LANG_CONFIG_SOFT_LICENSE_FAIL);
        }
      }
    })
}

function showFeatureInfo(swl_status)
{
    getPlatformName(swl_status);
}

function SoftwareLicensingReadingResult(arg)
{
    // Handle get call response
    var CSRFTOKEN = getCSRFToken();
    jQuery.ajax({
      url : g_SwInventoryUrl + g_SwASMKeyUrl,
      headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
      type : "GET",
      dataType : "json",
      contentType : false,
      processData : false,
      cache : false,
      success : function(data, status, xhr) {
        var swl_updtime = data['Oem']['SoftwareInventory']['LastUpdateTime'];
        var swl_status = data['Oem']['SoftwareInventory']['LicenseStatus'];
        if (swl_updtime) {
          $('#lastSwlTS').text(swl_updtime);
        } else {
          $('#lastSwlTS').text("...");
        }
        Loading(false);
        showFeatureInfo(swl_status);
      },
      error : function(data, status, xhr) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          Loading(false);
          alert(lang.LANG_CONFIG_SOFT_LICENSE_FAIL);
        }
      }
    });
}

function uploadkey(fileUploadUrl){
    uploadBtn.prop("disabled", true);
    var CSRFTOKEN = getCSRFToken();

    var data = new FormData();
    data.append('', document.getElementById("FileBrowse").files[0]);

    // console.log(data);
    Loading(true);
    jQuery.ajax({
      url : g_SwInventoryUrl + fileUploadUrl,
      headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
      type : "POST",
      contentType : false,
      processData : false,
      cache : false,
      data : data,
      timeout : g_CGIRequestTimeout,
      ontimeout : onCGIRequestTimeout,
      success : function(data, status, xhr) {
        var res = {};
        res.data = data;
        res.data = status;
        res.xhr = xhr;
        GetTaskStatus(data);
        CheckUploadOk(g_SwASMKeyUrl);
      },
      error : function(data) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          Loading(false);
          uploadBtn.prop("disabled", false);
          alert(lang.LANG_CONFIG_SOFT_LICENSE_FAIL);
        }
      }
    });
}

function GetTaskStatus(member_data)
{
    var CSRFTOKEN = getCSRFToken();
    var ajax_url = member_data['@odata.id'];

    jQuery.ajax({
      url : ajax_url,
      headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
      type : "GET",
      dataType : "json",
      success : function(data, status, xhr) {
        var res = {};
        res.data = data;
        res.data = status;
        res.xhr = xhr;
        document.getElementById("swlupload-value").textContent =
            lang.LANG_CONFIG_SOFT_LICENSE_DONE;
      },
      error : function(data) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          Loading(false);
          alert(lang.LANG_CONFIG_SOFT_LICENSE_FAIL);
        }
      }
    });
}

function CheckUploadOk(urlCheck){
    "use strict";

    var CSRFTOKEN = getCSRFToken();
    jQuery.ajax({
      url : g_SwInventoryUrl + urlCheck,
      headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
      type : "GET",
      dataType : "json",
      contentType : false,
      processData : false,
      cache : false,
      success : function(data, status, xhr) {
        var res = {};
        res.data = data;
        res.data = status;
        res.xhr = xhr;
        var swl_updtime = data['Oem']['SoftwareInventory']['LastUpdateTime'];
        var swl_status = data['Oem']['SoftwareInventory']['LicenseStatus'];
        var swl_updState = data['Oem']['SoftwareInventory']['UpdateState'];
        if (swl_updtime) {
          $('#lastSwlTS').text(swl_updtime);
        } else {
          $('#lastSwlTS').text("...");
        }
        Loading(false);
        uploadBtn.prop("disabled", false);

        $("#feature3").hide();
        if (swl_status == "ACTIVATED") {
          $("#swlupload-value").text(lang.LANG_CONFIG_SOFT_LICENSE_DONE);
          $("#swlauthenticate-value").text(lang.LANG_CONFIG_SOFT_LICENSE_DONE);
          alert(lang.LANG_CONFIG_SOFT_LICENSE_SUCC);
        } else {
          $("#swlupload-value").text(lang.LANG_CONFIG_SOFT_LICENSE_ERR);
          $("#swlauthenticate-value").text(lang.LANG_CONFIG_SOFT_LICENSE_ERR);
          alert(lang.LANG_CONFIG_SOFT_LICENSE_FAIL);
        }
        setTimeout(function() {
          location.href = "/page/config_software_licensing.html";
        }, 3000);
      },
      error : function(data) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          Loading(false);
          alert(lang.LANG_CONFIG_SOFT_LICENSE_FAIL);
        }
      }
    });
}

function getSwlTypeHandler(originalRequest)
{
    "use strict";
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200){
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xml_obj=GetResponseXML(response);
        if(xml_obj == null)
        {
            SessionTimeout();
            return;
        }
        //check session & privilege result
        if(CheckInvalidResult(xml_obj) < 0) {
            return;
        }

        var swl_status = GetXMLNodeValue(xml_obj, "SWL_STATUS");
        showFeatureInfo(swl_status);
    }
}

function SWL_UploadBtn(){
    "use strict";
    var FileExist = checkfile();
    if(FileExist == -1){
       return;
    }

    uploadBtn.prop("disabled", true);
    FileBrowse.prop("disabled", true);
    $("#feature3").hide();
    $("#swlupload-label").text(lang.LANG_CONFIG_SOFT_LICENSE_UPLOAD);
    $("#swlupload-value").text("...");
    $("#swlauthenticate-label").text(lang.LANG_CONFIG_SOFT_LICENSE_AUTHENTICATE);
    $("#swlauthenticate-value").text(lang.LANG_CONFIG_SOFT_LICENSE_PENDING);

    Loading(true);
    uploadkey(g_SwASMKeyUrl + g_SWASMKeyOemActionUrl);
}
function LoadFileStart() {
    "use strict";
    UploadEnable(false);
}

function reset_file_upload() {
    "use strict";
    $('#FileBrowse').val(null);
    $("#uploadBtn").prop("disabled", true);
}

function checkfile(){
    "use strict";
    var input_file = FileBrowse.val();
    var file;
    if(input_file.length == 0)
    {
        return -1;
    }
    if (!window.FileReader)
    {
        // If browser does not support FileReader, just bypass fw size check.
        alert(lang.LANG_CONFIG_FWUPD_WARNING_NO_SUPPORT);
        return -1;
    }
    var files = FileBrowse.prop("files");
    if (!files)
    {
        alert(lang.LANG_CONFIG_FWUPD_WARNING_BROWSER);
        return -1;
    }
    else if (!files[0])
    {
        return -1;
    }

    CheckUserPrivilege(PrivilegeCallBackFileReady);
    if (FileBrowse.val() == null)
        return -1;
    file = files[0];

    var validExts = new Array(".v2c");
    var fileExt = file.name;
    fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
    if (validExts.indexOf(fileExt) < 0) {
        reset_file_upload();
        alert(lang.LANG_CONFIG_SOFT_LICENSE_WARNING_SELECT1);
        return -1;
    }

    if (file.size > (1*1024)) {
        reset_file_upload();
        alert(lang.LANG_CONFIG_SOFT_LICENSE_WARNING_SELECT2);
        return -1;
    }
    return file;
}

})(jQuery);
