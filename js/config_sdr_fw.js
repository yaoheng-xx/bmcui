/* configuration sdr page */
"use strict";
var sdrFile = null;
var lang;
var uploadBtn;
var sdrFileBrowse;
var cfgFileBrowse;
var EnableAutoCfgRadio;
var DisableAutoCfgRadio;
var inputControlsMessage;
var curSDR;
var curCFG;
var curTS;
var tagListDesc;
var tagTable;
window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit() {
  inputControlsMessage = document.getElementById("inputControlsMessage");
  var cfgSdrInputControls = document.getElementById("cfgSdrInputControls");
  uploadBtn = document.getElementById("uploadBtn");
  curSDR = document.getElementById("curSDR");
  curCFG = document.getElementById("curCFG");
  curTS = document.getElementById("curTS");
  cfgFileBrowse = document.getElementById("cfgFileBrowse");
  sdrFileBrowse = document.getElementById("sdrFileBrowse");
  tagListDesc = document.getElementById("tagListDesc");
  tagTable = document.getElementById("tagTable");
  EnableAutoCfgRadio = document.getElementById("EnableAutoCfgRadio");
  DisableAutoCfgRadio = document.getElementById("DisableAutoCfgRadio");

  document.title = lang.LANG_CONFIG_SUBMENU_SDR_FW;
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/sdr_config_hlp.html";
  uploadBtn.setAttribute("value", lang.LANG_COMMON_BTN_UPLOAD);
  uploadBtn.onclick = FW_UploadBtn;

  cfgSdrInputControls.style.display = 'block';
  OutputString();
  CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("submenu_sdr_fw_div").textContent = lang.LANG_CONFIG_SUBMENU_SDR_FW;
    document.getElementById("sdrfw_desc_p").textContent = lang.LANG_CONFIG_SDRFW_DESC;
    document.getElementById("sdr_fw_conf_legend").textContent = lang.LANG_CONFIG_SUBMENU_SDR_FW;
    inputControlsMessage.textContent = lang.LANG_CONFIG_SDRFW_DISABLED;
    document.getElementById("sdrfile_td").textContent = lang.LANG_CONFIG_SDRFW_SDRFILE;
    document.getElementById("configfile_td").textContent = lang.LANG_CONFIG_SDRFW_CONFIGFILE;
    document.getElementById("lastupload_td").textContent = lang.LANG_CONFIG_SDRFW_LASTUPLOAD;
    document.getElementById("opt_conf").textContent = lang.LANG_CONFIG_SDRFW_SELFILE_OPT_CONF;
    document.getElementById("opt_file").textContent = lang.LANG_CONFIG_SDRFW_SELFILE_OPT_FILE;
    document.getElementById("proctag_legend").textContent = lang.LANG_CONFIG_SDRFW_LEGENTPROCTAG;
    document.getElementById("enconfig_td").textContent = lang.LANG_CONFIG_SDRFW_ENCONFIG;
    document.getElementById("enable_lbl").textContent = lang.LANG_CONFIG_SDRFW_ENABLE;
    document.getElementById("disable_lbl").textContent = lang.LANG_CONFIG_SDRFW_DISABLE;
}

function PrivilegeCallBack(Privilege) {
  if (Privilege == '04') { // full access
  } else if (Privilege == '03') {
    disableControl(true);
  } else {
    location.href = SubMainPage;
    disableControl(true);
  }
}

function FW_UploadBtn() {
    var FileExist = checkfile();
    if (FileExist == -1) {
        return;
    }

    //New SDR file update will take effect in next login only and will terminate active sessions.
    UtilsConfirm(
        "Are you sure to perform this operation?", {
          onOk : function() {
            uploadBtn.disabled = true;
            var CSRFTOKEN = getCSRFToken();
            var data = sdrFileBrowse.files[0];
            var file_upload_url = "/redfish/v1/Managers/bmc/Oem/Customization";
            Loading(true);
            jQuery.ajax({
              url : file_upload_url,
              headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
              type : "POST",
              contentType : false,
              processData : false,
              dataType : "json",
              cache : false,
              data : data,
              success : function(data, status, xhr) {
                Loading(false);
                uploadBtn.disabled = false;
                alert(lang.LANG_SDR_UPLOAD_SUCCESS,
                      {onClose : function() { location.reload(); }});
              },
              error : function(data) {
                if (data.status == 401) {
                  clearSessionInfo();
                  location.href = "/";
                } else {
                  Loading(false);
                  uploadBtn.disabled = false;
                  alert(lang.LANG_SDR_UPLOAD_FAIL);
                }
              }
            });
          },
          onCancel : function() { Loading(false); }
        });
}

function checkfile() {
    if (!window.FileReader) {
        // If browser does not support FileReader, just bypass fw size check.
        alert(lang.LANG_CONFIG_SDRFW_WARNING_NO_SUPPORT);
        return -1;
    } else {
        if (!sdrFileBrowse) {
            alert(lang.LANG_CONFIG_SDRFW_WARNING_NOT_FIND);
            return -1;
        } else if (!sdrFileBrowse.files) {
            alert(lang.LANG_CONFIG_SDRFW_WARNING_BROWSER);
            return -1;
        } else if (!sdrFileBrowse.files[0]) {
            alert(lang.LANG_CONFIG_SDRFW_WARNING_NO_FILE);
            return -1;
        }
    }

    //var cfgFile_subname = cfgFileBrowse.value.substr(cfgFileBrowse.value.lastIndexOf(".") + 1);
    var sdrFile_subname = sdrFileBrowse.value.substr(sdrFileBrowse.value.lastIndexOf(".") + 1);
    if (sdrFile_subname != "json") {
        alert(lang.LANG_CONFIG_SDRFW_WARNING_SELECT);
        return -1;
    }

    //cfgFile = cfgFileBrowse.files[0];
    sdrFile = sdrFileBrowse.files[0];

    return 0;
}

function disableControl(disabled) {
    uploadBtn.disabled = disabled;
    // parseBtn.disabled = disabled;
    cfgFileBrowse.disabled = disabled;
    sdrFileBrowse.disabled = disabled;
    // sendEnableDisableBtn.disabled = disabled;
    EnableAutoCfgRadio.disabled = disabled;
    DisableAutoCfgRadio.disabled = disabled;
}
