"use strict";
var ButtonSaveOBJ;
window.addEventListener('load', PageInit);
var lang;
if (parent.lang) { lang = parent.lang; }

function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_thermal_management_hlp.html";
    ButtonSaveOBJ = document.getElementById("btn_save");
    ButtonSaveOBJ.value = lang.LANG_COMMON_BTN_UPLOAD;
    ButtonSaveOBJ.addEventListener("click", onSave);

    OutputString();

    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("thermal_management_div").textContent = lang.LANG_THERMAL_MANAGEMENT;
    document.getElementById("drop_file_for_zone").textContent =
        lang.LANG_THERMAL_MANAGEMENT_FILE;
}

function PrivilegeCallBack(Privilege) {
    //full access
    if(Privilege == '04') {
      document.getElementById('idfile_zone_config').disabled = false;
      ButtonSaveOBJ.disabled = false;
    }
    // only view
    else if (Privilege == '03') {
      document.getElementById('idfile_zone_config').disabled = true;
      ButtonSaveOBJ.disabled = true;
    }
    // no access
    else {
      location.href = SubMainPage;
      return;
    }
}

function onSave() {
    doThermalFileUpload();
}

function doThermalFileUpload() {
  var idfile_zone_config = document.getElementById("idfile_zone_config");
  if (!certificateValidation(idfile_zone_config,
                             lang.LANG_THERMAL_UPLOAD_VALID_ZONE)) {
    return;
  }
    ButtonSaveOBJ.disabled = true;
    var CSRFTOKEN = getCSRFToken();
    var data = idfile_zone_config.files[0];
    var file_upload_url = "/redfish/v1/Managers/bmc/Oem/Customization";

    Loading(true);
    jQuery.ajax({
      url : file_upload_url,
      headers : {
        'X-XSRF-TOKEN' : CSRFTOKEN,
      },
      type : "POST",
      contentType : false,
      processData : false,
      dataType : "json",
      cache : false,
      data : data,
      success : function(data, status, xhr) {
        Loading(false);
        ButtonSaveOBJ.disabled = false;
        alert(lang.LANG_THERMAL_UPLOAD_SUCCESS,
              {onClose : function() { location.reload(); }});
      },
      error : function(data) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          Loading(false);
          ButtonSaveOBJ.disabled = false;
          alert(lang.LANG_THERMAL_UPLOAD_FAIL);
        }
      }
    });
}

function certificateValidation(fileField, errorMessage) {
            if (!fileField.files.length) {
                alert(lang.LANG_THERMAL_UPLOAD_FILE);
                return false;
            } else {
                var allowedFiles = ['json'];
                var fileUpload = fileField.files[0];
                var regex = new RegExp('^.*.(' + allowedFiles.join('|') + ')$');
                    if (regex.test(fileUpload.name)) {
                        return true;
                    }else if (!regex.test(fileUpload.name)) {
                        alert(errorMessage);
                        return false;
                    } 
            }
}
