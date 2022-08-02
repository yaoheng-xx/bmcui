"use strict";
//declare all global variables
var webISOpage = "/page/vm_webiso.html";
var isSuperUser = 0;
var isISOmounted = 0;
var devstat = {};
var mLangMap = null;
var image_name_to_redirect = "";
var old_image_config = {};
var that = this;
var Ginfo = {WEBIsoInfo : {}, LocalImageInfo : {}};
var server = {};
var g_VMCGIRequestTimeout = 15000;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }
function PageInit() {
    top.frames.topmenu.document.getElementById("frame_help").src = "../help/" + lang_setting + "/vm_webiso_hlp.html";
    mLangMap = top.frames.topmenu.gLang;
    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}

function UpdateValues(id) {
  that["var_share_host_" + id] = document.getElementById("share_host_" + id);
  that["var_path_arg_" + id] = document.getElementById("path_argument_" + id);
  that["var_user_arg_" + id] = document.getElementById("user_argument_" + id);
  that["var_pwd_arg_" + id] = document.getElementById("pwd_argument_" + id);
  that['var_mount_btn_' + id] = document.getElementById("mount_btn_" + id);
  that['var_unmount_btn_' + id] = document.getElementById("unmount_btn_" + id);
  that['var_refresh_btn_' + id] =
      document.getElementById("refresh_status_btn_" + id);
  that['nfs_mount_btn_' + id] = document.getElementById("mount_nfs_" + id);
  that['cifs_mount_btn_' + id] = document.getElementById("mount_cifs_" + id);
  that['https_mount_btn_' + id] = document.getElementById("mount_https_" + id);

  that['var_mount_btn_' + id].setAttribute("value", lang.LANG_VM_WEBISO_MOUNT);
  that['var_mount_btn_' + id].onclick = function(e) {
    e.preventDefault();
    MountSharedImage(id);
  };

  that['var_unmount_btn_' + id].setAttribute("value",
                                             lang.LANG_VM_FLOPPY_UNMOUNT);
  that['var_unmount_btn_' + id].onclick = function(e) {
    e.preventDefault();
    UnmountTask(id);
  };

  that['var_refresh_btn_' + id].setAttribute("value",
                                             lang.LANG_VM_FLOPPY_REFRESH);
  that['var_refresh_btn_' + id].onclick = function(e) {
    e.preventDefault();
    GetMediaSlots();
  };

  that['nfs_mount_btn_' + id].addEventListener(
      "click", function(e) { chooseMountType('NFS', id); });

  that['cifs_mount_btn_' + id].addEventListener(
      "click", function(e) { chooseMountType('CIFS', id); });

  that['https_mount_btn_' + id].addEventListener(
      "click", function(e) { chooseMountType('HTTPS', id); });

  devstat[id] = $("#dev_stat_" + id);
}

function UpdateValues_VM(vid) {
  that['var_status_text_for_vm_' + vid] =
      document.getElementById("status_text_for_vm_" + vid);
  that['var_start_redir_' + vid] =
      document.getElementById("start_redir_" + vid);
  that['var_stop_redir_' + vid] = document.getElementById("stop_redir_" + vid);
  that['var_start_redir_' + vid].onclick = function(e) {
    e.preventDefault();
    start_image_redirection(vid);
  };
  that['var_stop_redir_' + vid].onclick = function(e) {
    e.preventDefault();
    stop_image_redirection(vid);
  };
  that['var_stop_redir_' + vid].disabled = true;
  that['var_status_text_for_vm_' + vid].textContent = "";
}

function initiateInputListners(id) {
  initCheckInputListener("share_host_" + id, lang.LANG_VM_WEBISO_HOST,
                         INPUT_FIELD.HOSTNAMEANDIPV4);
  initCheckInputListener("path_argument_" + id, lang.LANG_VM_WEBISO_PATH,
                         INPUT_FIELD.PATH);
  initCheckInputListener("user_argument_" + id, lang.LANG_VM_WEBISO_USER,
                         INPUT_FIELD.USERNAME);
  initCheckInputListener("pwd_argument_" + id, lang.LANG_VM_WEBISO_PWD,
                         INPUT_FIELD.PASSWORD);
}

function image_in_mount_status(status, id) {
  that['var_share_host_' + id].disabled = status;
  that['var_path_arg_' + id].disabled = status;
  that['nfs_mount_btn_' + id].disabled = status;
  that['cifs_mount_btn_' + id].disabled = status;
  that['https_mount_btn_' + id].disabled = status;
  that['var_user_arg_' + id].disabled = status;
  that['var_pwd_arg_' + id].disabled = status;
}

function chooseMountType(type, id) {
  if (!type) {
    return;
  }
  that['var_user_arg_' + id].value = "";
  that['var_pwd_arg_' + id].value = "";
}

function disabledUnmount(enabled, id) {
  if (enabled)
    that['var_unmount_btn_' + id].disabled = true;
  else
    that['var_unmount_btn_' + id].disabled = false;
}

function disabledMount(enabled, id) {
  if (enabled)
    that['var_mount_btn_' + id].disabled = true;
  else
    that['var_mount_btn_' + id].disabled = false;
}

function isMountISO(enabled, id) {
  if (enabled) {
    disabledMount(true, id);
    disabledUnmount(false, id);
  } else {
    disabledMount(false, id);
    disabledUnmount(true, id);
  }
}

function OutputString(id) {
  document.getElementById("div_caption").textContent = lang.LANG_VMEDIA_WEB_ISO;
  document.getElementById("div_caption2").textContent =
      lang.LANG_VM_SUBMENU_LOCAL_IMAGE;
  document.getElementById("div_device_" + id).textContent =
      lang.LANG_VM_DEVICE + " " + id;
  document.getElementById("div_host_" + id).textContent =
      lang.LANG_VM_WEBISO_HOST;
  document.getElementById("div_path_" + id).textContent =
      lang.LANG_VM_WEBISO_PATH;
  document.getElementById("div_mount_type_" + id).textContent =
      lang.LANG_VM_WEBISO_MOUNT_TYPE;
  document.getElementById("div_user_" + id).textContent =
      lang.LANG_VM_WEBISO_USER;
  document.getElementById("div_pwd_" + id).textContent =
      lang.LANG_VM_WEBISO_PWD;
  document.getElementById("mount_nfs_lbl_" + id).textContent =
      lang.LANG_MOUNT_TYPE_NFS;
  document.getElementById("mount_cifs_lbl_" + id).textContent =
      lang.LANG_MOUNT_TYPE_CIFS;
  document.getElementById("mount_https_lbl_" + id).textContent =
      lang.LANG_MOUNT_TYPE_HTTPS;
}

function ApplyStyleEditbox(id) {
  // Apply event listener & UI style.
  var element = null;
  if (id != null) {
    element = document.getElementById(id);
    if (element != null) {
      element.className += " editbox_style";
    }
  }
}

function SwlCallBack(swl_status)
{
  document.getElementById("div_caption").textContent =
      lang.LANG_TOPMENU_VIRTUAL_MEDIA;
  if (swl_status == "ACTIVATED") {
    $('#vmedia_noconfig_msg').hide();
    isSuperUser = 1;
    checkRmediaStatus();
    } else {
      Loading(false);
      $("#add_desc_div").text(lang.LANG_VM_WEBISO_UPLOAD_LICENSE_ERR);
      $('#vmedia_noconfig_msg').show();
      alert(lang.LANG_SYS_INFO_SOFT_LICENSE_INACTIVATED);
    }
}

function checkRmediaStatus() {
  Loading(true);
  var ajax_url = "/redfish/v1/Systems/system";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : function(response) {
      if (response.readyState == 4 && response.status == 200) {
        var org_req = JSON.parse(response.responseText);
        var rmediaStatus = org_req.VirtualMediaConfig.ServiceEnabled;
        if (rmediaStatus) {
          GetMediaSlots();
          $('#vmedia_noconfig_msg').hide();
        } else {
          $("#add_desc_div").text(lang.LANG_VM_WEBISO_RMEDIA_ENABLE_ERR);
          $('#vmedia_noconfig_msg').show();
        }
      } else {
        Loading(false);
        alert(lang.CONF_RMEDIA_ERROR_MSG);
      }
    },
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_RMEDIA_ERROR_MSG);
    }
  });
}

function PrivilegeCallBack(Privilege) {
    //full access
    if (Privilege == '04') {
      Loading(true);
      getSwlStatus(SwlCallBack);
    } else {
        location.href = SubMainPage;
        return;
    }
    return;
}

function GetMediaSlots() {
  Loading(true);
  var ajax_url = "/redfish/v1/Managers/bmc/VirtualMedia";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout: onCGIRequestTimeout,
    onSuccess : UpdateInputFields,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_RMEDIA_ERROR_MSG);
      $("#add_desc_div").text(lang.CONF_RMEDIA_NO_SLOT_ERROR_MSG);
      $('#vmedia_noconfig_msg').show();
    }
  });
}

function UpdateInputFields(originalRequest) {
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var response = JSON.parse(originalRequest.responseText);
    $("#for_web_iso").empty();
    $("#vm_table").empty();
    if (response.hasOwnProperty("Members") && response.Members.length) {
      var webinfo = [];
      for (var i = 0; i < response.Members.length; i++) {
        webinfo[i] = response.Members[i]["@odata.id"];
      }
      webinfo.sort();
      for (var i = 0; i < response.Members.length; i++) {
        RenderInputFields(webinfo[i]);
      }
    } else {
      $("#add_desc_div").text(lang.CONF_RMEDIA_NO_SLOT_ERROR_MSG);
      $('#vmedia_noconfig_msg').show();
    }
  } else {
    alert(lang.CONF_RMEDIA_ERROR_MSG);
    $("#add_desc_div").text(lang.CONF_RMEDIA_NO_SLOT_ERROR_MSG);
    $('#vmedia_noconfig_msg').show();
  }
  Loading(false);
}

function RenderInputFields(data) {
  if (data.indexOf("WebISO") != -1) {
    var id = data.split("WebISO").pop();
    $("#for_web_iso").append(GetTableHTML_WEBISO(id));
    UpdateValues(id);
    initiateInputListners(id);
    OutputString(id);
    GetWEBISOInfo(data, id);
  }
  // if (data.indexOf("LocalImage") != -1) {
  //   var vid = data.split("LocalImage").pop();
  //   $("#vm_table").append(GetTableHTML_VM(vid));
  //   $("#vm_table").append("<br/>");
  //   UpdateValues_VM(vid);
  //   GetLocalImageInfo(data, vid);
  // }
}

function GetWEBISOInfo(url, id) {
  Loading(true);
  var ajax_req = new Ajax.Request(url, {
    method : 'GET',
    onSuccess : function(org) {
      if (org.readyState == 4 && org.status == 200) {
        var response = JSON.parse(org.responseText);
        Ginfo.WEBIsoInfo[id] = response;
        GetVMCDROMConfigResp(response, id);
      } else {
        Loading(false);
        alert(lang.CONF_RMEDIA_ERROR_MSG);
        Func_disable(id);
      }
    },
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_RMEDIA_ERROR_MSG);
      Func_disable(id);
    }
  });
  Func_Enable(id);
}

function GetLocalImageInfo(url, vid) {
  Loading(true);
  var ajax_req = new Ajax.Request(url, {
    method : 'GET',
    onSuccess : function(org) {
      if (org.readyState == 4 && org.status == 200) {
        var response = JSON.parse(org.responseText);
        Ginfo.LocalImageInfo[vid] = response;
      } else {
        alert(lang.CONF_RMEDIA_ERROR_MSG);
      }
      Loading(false);
    },
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_RMEDIA_ERROR_MSG);
    }
  });
}

function GetTableHTML_WEBISO(id) {
  var table =
      `<td class="content_session" id="webiso_${id}">` +
      `<div class="widIso">` +
      `<div>` +
      `<table cellspacing="0" cellpadding="3" border="0" width="90%">` +
      `<tr>` +
      `<td align="left" width="45%" class="labelhead">` +
      `<div id="div_device_${id}"></div>` +
      `</td>` +
      `<td align="left"><label id="dev_stat_${
          id}" class="labelhead"></label></td>` +
      `</tr>` +
      `<tr>` +
      `<td><input type="button" class="btnStyle" id="refresh_status_btn_${
          id}" /></td>` +
      `</tr>` +
      `<tr>` +
      `<td colspan="2">` +
      `<hr>` +
      `</td>` +
      `</tr>` +
      `</table>` +
      `<table cellspacing="0" cellpadding="3" border="0" width="90%">` +
      `<tr>` +
      `<td width="30%" class="labelhead">` +
      `<div id="div_host_${id}"></div>` +
      `</td>` +
      `<td><input type="text" id="share_host_${
          id}" maxlength="127" disabled style="width:90%;" /></td>` +
      `</tr>` +
      `<tr>` +
      `<td width="30%" class="labelhead">` +
      `<div id="div_path_${id}"></div>` +
      `</td>` +
      `<td><input type="text" id="path_argument_${
          id}" maxlength="127" disabled style="width:90%;" /></td>` +
      `</tr>` +
      `<tr>` +
      `<td width="30%" class="labelhead">` +
      `<div id="div_mount_type_${id}">Mount Type</div>` +
      `</td>` +
      `<td colspan="2" class="labelhead">` +
      `<input type="radio" name="mount_type_${id}" id="mount_nfs_${
          id}" value="nfs"/>` +
      `<label id="mount_nfs_lbl_${id}"></label>` +
      `<input type="radio" name="mount_type_${id}" id="mount_cifs_${
          id}" value="cifs"/>` +
      `<label id="mount_cifs_lbl_${id}"></label>` +
      `<input type="radio" name="mount_type_${id}" id="mount_https_${
          id}" value="HTTPS" />` +
      `<label id="mount_https_lbl_${id}"></label>` +
      `</td>` +
      `</tr>` +
      `<tr>` +
      `<td width="30%" class="labelhead">` +
      `<div id="div_user_${id}"></div>` +
      `</td>` +
      `<td><input type="text" id="user_argument_${
          id}" maxlength="127" disabled style="width:90%;" /></td>` +
      `</tr>` +
      `<tr>` +
      `<td width="30%" class="labelhead">` +
      `<div id="div_pwd_${id}"></div>` +
      `</td>` +
      `<td><input type="password" id="pwd_argument_${
          id}" maxlength="127" disabled style="width:90%;" /></td>` +
      `</tr>` +
      `</table>` +
      `<div style="margin-top: 10px;">` +
      `<input type="button" class="btnStyle" id="mount_btn_${id}" />` +
      `<input type="button" class="btnStyle" id="unmount_btn_${
          id}" disabled/>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `</td>`;
  return table;
}

function GetTableHTML_VM(vid) {
  var vTable =
      `<tr>` +
      `<td class="bold">` +
      `<span class="labelhead">Select File</span>` +
      `</td>` +
      `<td>` +
      `<input class="file" accept=".ima, .iso, .img" type="file" name="" id="virtual_file_${
          vid}" style="width: 100%;">` +
      `</td>` +
      `<td>` +
      `<input class="file" type="button" name="Start" value="Start" id="start_redir_${
          vid}">` +
      `&nbsp;&nbsp;` +
      `<input class="file" type="button" name="Stop" value="Stop" id="stop_redir_${
          vid}">` +
      `</td>` +
      `<td>` +
      `<span class="status_text" id="status_text_for_vm_${vid}"></span>` +
      `</td>` +
      `</tr>`;
  return vTable;
}

function check_remote_session(){
  Loading(true);
  var ajax_url = "/xyz/openbmc_project/VirtualMedia/rmedia/active_status";
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : remoteSessionResult,
    onFailure : function() {
      Loading(false);
      alert(lang.CONF_RMEDIA_ERROR_MSG);
    }
  });
}

function remoteSessionResult(originalRequest) {
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var response = JSON.parse(originalRequest.responseText);
    if (response.data.Active == 1) {
      document.getElementById("web_iso_table").style.display = 'table';
      document.getElementById("vmedia_noconfig_msg").style.display = 'none';
      Func_Enable();
    } else {
      Func_disable();
      document.getElementById("web_iso_table").style.display = 'none';
      document.getElementById("vmedia_noconfig_msg").style.display = 'table';
    }
  } else {
    alert(lang.CONF_RMEDIA_ERROR_MSG);
  }
  Loading(false);
}

function MountSharedImage(id) {
  var path_str;
  if (Trim(that["var_share_host_" + id].value) == "") {
    alert(lang.LANG_VM_FLOPPY_ERR4);
    return;
  }
  if (Trim(that["var_path_arg_" + id].value) == "") {
    alert(lang.LANG_VM_FLOPPY_ERR5);
    return;
  }
  if (that["var_path_arg_" + id].value.indexOf('\\') != -1) {
    alert(lang.LANG_VM_WEBISO_INVALID_PATH);
    return;
  }
  if (!document.getElementById("mount_cifs_" + id).checked &&
      !document.getElementById("mount_nfs_" + id).checked &&
      !document.getElementById("mount_https_" + id).checked) {
    alert(lang.LANG_VM_WEBISO_INVALID_MOUNT_TYPE);
    return;
  }
  if (document.getElementById("mount_cifs_" + id).checked) {
    if (Trim(that["var_user_arg_" + id].value) == "") {
      alert(lang.LANG_VM_WEBISO_USER_ERR);
      return;
    }
    if (Trim(that["var_pwd_arg_" + id].value) == "") {
      alert(lang.LANG_VM_WEBISO_PASS_ERR);
      return;
    }
  }

  var mount_type = '';
  if (document.getElementById("mount_cifs_" + id).checked) {
    mount_type = 'CIFS';
    path_str =
        that['var_share_host_' + id].value + that['var_path_arg_' + id].value;
  }

  if (document.getElementById("mount_nfs_" + id).checked) {
    mount_type = 'NFS';
    path_str = that['var_share_host_' + id].value + ':' +
               that['var_path_arg_' + id].value;
  }

  if (document.getElementById("mount_https_" + id).checked) {
    mount_type = 'HTTPS';
    path_str =
        that['var_share_host_' + id].value + that['var_path_arg_' + id].value;
  }

  Loading(true);
  var ajax_param = {};
  var ajax_url =
      Ginfo.WEBIsoInfo[id].Actions["#VirtualMedia.InsertMedia"].target;

  ajax_param.Image = path_str;
  ajax_param.WriteProtected = true;
  ajax_param.TransferProtocolType = mount_type;
  ajax_param.UserName = that["var_user_arg_" + id].value;
  ajax_param.Password = that['var_pwd_arg_' + id].value;
  ajax_param.Inserted = true;
  ajax_param.TransferMethod = Ginfo.WEBIsoInfo[id].TransferMethod;

  var data = JSON.stringify(ajax_param);
  that['var_mount_btn_' + id].disabled = true;
  that['var_unmount_btn_' + id].disabled = true;

  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'POST',
    contentType : 'application/json',
    parameters : data,
    timeout : g_VMCGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function() {
      setTimeout(function() {
        GetVMWebisoStatus(id);
      }, 3000);
    },
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_VM_WEBISO_FAIL);
      webISOInsertFailure(id);
    }
  });
}

function webISOInsertFailure(id) {
  disabledMount(false, id);
  disabledUnmount(true, id);
  image_in_mount_status(false, id);
  update_status_msg(false, id);
}

function OnUnmountTaskRsp(originalRequest, id) {
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var response = originalRequest.responseText;
    if (response == null) {
      SessionTimeout();
      return;
    }
    var result = originalRequest.statusText;
    if (result != null) {
      setTimeout(function() {
        Loading(false);
        isMountISO(false, id);
        image_in_mount_status(false, id);
        alert(lang.LANG_VM_WEBISO_UNMOUNT_SUCC, {
          title : lang.LANG_GENERAL_SUCCESS,
          onClose : function() { location.href = webISOpage; }
        });
        update_status_msg(false, id);
      }, 3000);
    } else {
      Loading(false);
      isMountISO(false, id);
      image_in_mount_status(true, id);
      alert(lang.LANG_VM_WEBISO_UNMOUNT_FAIL);
      update_status_msg(true, id);
    }
  } else {
    Loading(false);
    that['var_unmount_btn_' + id].disabled = false;
    alert(lang.LANG_VM_WEBISO_UNMOUNT_FAIL);
  }
}

function UnmountTask(id) {
  Loading(true);
  that['var_mount_btn_' + id].disabled = true;
  that['var_unmount_btn_' + id].disabled = true;
  var ajax_url =
      Ginfo.WEBIsoInfo[id].Actions["#VirtualMedia.EjectMedia"].target;
  var ajax_param = {};
  var ajax_data = JSON.stringify(ajax_param);
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'POST',
    contentType : 'application/json',
    parameters : ajax_data,
    onComplete : function(response) { OnUnmountTaskRsp(response, id); }
  });
}

function GetVMWebisoStatus(id) {
  Loading(true);
  var ajax_url = '/redfish/v1/Managers/bmc/VirtualMedia/WebISO' + id;
  var ajax_req = new Ajax.Request(ajax_url,{
      method: 'GET',
      contentType: 'application/json',
      timeout: g_VMCGIRequestTimeout,
      ontimeout: function() {
        Loading(false);
        alert(lang.LANG_VM_WEBISO_FAIL);
        onCGIRequestTimeout();
      },
      onSuccess: function(originalRequest) {
        parseVMWebisoStatus(originalRequest, id);
      },
      onFailure: function(){
          Loading(false);
          alert(lang.LANG_VM_WEBISO_FAIL);
      }
  });
}

function parseVMWebisoStatus(originalRequest, id) {
  Loading(false);
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var response = JSON.parse(originalRequest.responseText);
    if (response.hasOwnProperty("Inserted")) {
      if (response.Oem.OpenBMC.State == "ActiveState" &&
          response.Inserted == true)
      {
        isMountISO(true, id);
        image_in_mount_status(true, id);
        alert(lang.LANG_VM_WEBISO_MOUNT_SUCC, {
            title: lang.LANG_GENERAL_SUCCESS,
            onClose: function() {
                location.href = webISOpage;
            }
        });
        update_status_msg(true, id);
        return;
      }
      else if (response.Oem.OpenBMC.State == "ReadyState" &&
                response.Inserted == false)
      {
        isMountISO(false, id);
        image_in_mount_status(false, id);
        alert(lang.LANG_VM_WEBISO_MOUNT_FAIL, {
          title : lang.LANG_GENERAL_SUCCESS,
          onClose : function() { location.href = webISOpage; }
        });
        update_status_msg(false, id);
        return;
      }
    }
  } else {
    alert(lang.LANG_VM_WEBISO_FAIL);
    webISOInsertFailure(id);
  }
}

function GetVMCDROMConfigResp(response, id) {
  if (response.Inserted) {
    isMountISO(true, id);
    image_in_mount_status(true, id);
  } else {
    isMountISO(false, id);
    image_in_mount_status(false, id);
  }

  var image_path = "";
  var UserName = "";
  var host = "";
  if (response.UserName != undefined) {
    UserName = response.UserName;
  }
  if (response.Image != undefined) {
    image_path = response.Image;
    image_name_to_redirect = response.ImageName;

    var tmp = response.Image.split('/');
    tmp.splice(0, 3);
    image_path = '/' + tmp.join('/');
    host = response.Image.split('/')[2].replace(":", "");
  }

  if (response != null) {
    that['var_share_host_' + id].value = host;
    that['var_path_arg_' + id].value = image_path;
    that["var_user_arg_" + id].value = UserName;
    that['var_pwd_arg_' + id].value = "";

    if (response.TransferProtocolType == 'NFS') {
      document.getElementById("mount_nfs_" + id).checked = true;
    }
    if (response.TransferProtocolType == 'CIFS') {
      document.getElementById("mount_cifs_" + id).checked = true;
    }
    if (response.TransferProtocolType == 'HTTPS') {
      document.getElementById("mount_https_" + id).checked = true;
    }
    chooseMountType(response.TransferProtocolType, id);
  }
  if (response.Inserted) {
    update_status_msg(1, id);
  } else {
    update_status_msg(false, id);
  }
  Loading(false);
}

function update_status_msg(status, id) {
  if (status) {
    devstat[id].text(lang.LANG_VM_FLOPPY_HAS_DISK);
  } else {
    devstat[id].text(lang.LANG_VM_FLOPPY_NO_DISK);
  }
}

function Func_Enable(id) {
  that['var_share_host_' + id].disabled = false;
  that['var_path_arg_' + id].disabled = false;
  that['var_user_arg_' + id].disabled = false;
  that['var_pwd_arg_' + id].disabled = false;
  that['var_share_host_' + id].focus();
}

function Func_disable(id) {
  that['var_share_host_' + id].disabled = true;
  that['var_path_arg_' + id].disabled = true;
  that['nfs_mount_btn_' + id].disabled = true;
  that['cifs_mount_btn_' + id].disabled = true;
  that['https_mount_btn_' + id].disabled = true;
  that['var_user_arg_' + id].disabled = true;
  that['var_pwd_arg_' + id].disabled = true;
  that['var_mount_btn_' + id].disabled = true;
  that['var_unmount_btn_' + id].disabled = true;
  that['var_refresh_btn_' + id].disabled = true;
}

function start_image_redirection(vid) {
  Loading(true);
  var host = location.host;
  var WebSocketEndPoint =
      Ginfo.LocalImageInfo[vid].Oem.OpenBMC.WebSocketEndpoint;
  var token = getCSRFToken();
  var file = document.getElementById("virtual_file_" + vid).files[0];
  // Allowing file type
  var allowedExtensions = /(\.ima|\.iso|\.img)$/i;
  if (file && allowedExtensions.exec(file.name)) {
    var url = "wss://" + host + WebSocketEndPoint;
    server[vid] = new NBDServer(url, file, vid, token);
    server[vid].start();
    setTimeout(function() { check_redirection_progress(vid); }, 5000);
  } else {
    Loading(false);
    document.getElementById("virtual_file_" + vid).value = "";
    alert(lang.LANG_VM_WEBISO_SELECT_IMAGE_ERR);
  }
}

function stop_image_redirection(vid) {
  Loading(true);
  if (server[vid]) {
    server[vid].stop();
    setTimeout(function() { check_redirection_progress(vid); }, 5000);
  }
}

function check_redirection_progress(vid) {
  if (server[vid]) {
    if (server[vid].state != 1) {
      that['var_start_redir_' + vid].disabled = true;
      that['virtual_file_' + vid].disabled = true;
      that['var_stop_redir_' + vid].disabled = false;
      that['var_status_text_for_vm_' + vid].textContent =
          "Redirection In Progress..";
    } else {
      that['var_start_redir_' + vid].disabled = false;
      that['virtual_file_' + vid].disabled = false;
      that['var_stop_redir_' + vid].disabled = true;
      that['var_status_text_for_vm_' + vid].textContent = "";
    }
  }
  Loading(false);
}
