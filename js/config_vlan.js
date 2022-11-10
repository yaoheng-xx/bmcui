"use strict";
var totalNIC = 0;
var vlanInfoResponse = {};
var selectedObjindex = 0;
var interfaceindex = 0;
var vlanindex = 0;
var global_vlan = 0;
var vlanURL = '';
var lang;
var lang_setting;
var GridTable;
var cfgVlanPage = "/page/config_vlan.html";

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }
function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_vlan_hlp.html";

    document.getElementById("_lanChannel").addEventListener("change", onChannelChange);
    document.getElementById("_save").addEventListener("click", saveVLANCfg);

    OutputString();

    //check input format
    initCheckInputListener("_vlanID", lang.LANG_CONF_NETWORK_VLAN_ID, INPUT_FIELD.VLANID);

    CheckUserPrivilege(PrivilegeCallBack);
    VLANListTableInit();
}

function OutputString()
{
    document.getElementById("vlan_setting_div").textContent = lang.LANG_CONF_NETWORK_VLAN_SETTING;
    document.getElementById("lan_channel_lbl").textContent = lang.LANG_CONF_NETWORK_VLAN_PHYSICAL_INTERFACE;
    document.getElementById("vlan_id_lbl").textContent = lang.LANG_CONF_NETWORK_VLAN_ID;
    document.getElementById("_save").value = lang.LANG_CONF_NETWORK_VLAN_LAN_ADD;
    document.getElementById("vlan_list_header_lbl").textContent =
        lang.LANG_CONF_NETWORK_MULTI_VLAN_HEADER;
}

function VLANListTableInit() {
  var TableTitles = [
    [ lang.LANG_CONF_NETWORK_VLAN_INTERFACE, "50%", "center" ],
    [ lang.LANG_CONF_NETWORK_VLAN_ID, "50%", "center" ],
    [ "<img>", "50%", "center" ],
  ];
  var VLANListTable = document.getElementById("VLANListTable");
  removeChilds(VLANListTable); // clear list content.
  SetRowSelectEnable(1);
  GridTable = GetTableElement();
  GridTable.setColumns(TableTitles);
  GridTable.init('GridTable', VLANListTable, "100px");
  VLANListTable.onclick = onClickVLANList;
}

function onClickVLANList() {
  var selected_row = GetSelectedRowCellInnerHTML(1);
  vlanURL = "";
  if (selected_row == "~") {
    document.getElementById("_vlanID").value = "";
  } else {
    var vlanInfo = vlanInfoResponse[selectedObjindex];
    for (var i = 0; i < vlanInfo.length; i++) {
      if (vlanInfo[i].VLANId == selected_row) {
        vlanindex = i;
        vlanURL = vlanInfo[i].vlanurl;
        document.getElementById("_vlanID").value = vlanInfo[i].VLANId;
      }
    }
  }
}

function PrivilegeCallBack(privilege)
{
    if (privilege == '04') {
        requestVLANInfo(0);
    } else if (privilege == '03') {
      var tmp = document.getElementById("_save");
      tmp.disabled = true;
      requestVLANInfo(0);
    } else {
        location.href = SubMainPage;
    }
}

function updateVLANInfo(channel_id) {
  var vlanInfo = vlanInfoResponse[channel_id];
  var RowData = [];
  if (vlanInfo.length == 0) {
    RowData.push([ 1, "~", "~", "~" ]);
  } else {
    for (var i = 0; i < vlanInfo.length; i++) {
      var virtualInterface = 'eth' + channel_id + '_' + vlanInfo[i].VLANId;
      var deleteVLANId =
          '<input type="image" img src="/images/bin.png" style="width: 15px;" class="killicon" onclick="deleteVLANId(' +
          vlanInfo[i].VLANId + ')">';
      RowData.push([ i, virtualInterface, vlanInfo[i].VLANId, deleteVLANId ]);
    }
  }
  GridTable.empty();
  GridTable.show(RowData);
}

function responseVLANInfo(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var channelInfo = arg.responseJSON;
      interfaceindex = 0;
      vlanindex = 0;
      vlanInfoResponse = [];
      for (var i = 0; i < channelInfo["Members@odata.count"]; i++) {
        var url = channelInfo.Members[i]["@odata.id"];
        var interfaceId = url.split('/').pop();

        if (interfaceId.indexOf("eth2") != -1 ||
            interfaceId.indexOf("_") != -1) {
          // eth2 interface no need to display eth2 in LAN channel list for
          // VLAN.
          // ethx_xxx no need to display list for VLAN.
          continue;
        }

        if (interfaceId.indexOf("eth") != -1) {
          var ajax_url = url;
          var ajax_req = new Ajax.Request(ajax_url, {
            method : 'GET',
            asynchronous : false,
            contentType : "application/json",
            onComplete : readVLANInfo,
            onFailure: function() {
              Loading(false);
              alert(lang.LANG_CONF_VLAN_GET_FAILED);
            }
          });
          interfaceindex++;
        }
      }
      updateChannelList(vlanInfoResponse);
      updateVLANInfo(0);
    }
}

function readVLANInfo(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var channelconfig = arg.responseJSON;
    var interfaceID = channelconfig.Id;
    vlanInfoResponse[interfaceindex] = [];
    vlanInfoResponse[interfaceindex]["interfaceIname"] = interfaceID;
    vlanindex = 0;

    var url = channelconfig.VLANs['@odata.id'];
    var ajax_url = url;
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'GET',
      asynchronous : false,
      contentType : "application/json",
      onComplete : readVLANIndexinfo,
      onFailure: function() {
        Loading(false);
        alert(lang.LANG_CONF_VLAN_GET_FAILED);
      }
    });
  }
}

function readVLANIndexinfo(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var channelconfig = arg.responseJSON;
    global_vlan = 0;
    if (channelconfig["Members@odata.count"] > 0) {
      for (var j = 0; j < channelconfig["Members@odata.count"]; j++) {
        vlanInfoResponse[interfaceindex][global_vlan] = [];
        var url = channelconfig.Members[j]["@odata.id"];
        vlanInfoResponse[interfaceindex][global_vlan]["vlanurl"] = url;
        var interfaceId = url.split('/').pop();

        var ajax_url = url;
        var ajax_req = new Ajax.Request(ajax_url, {
          method : 'GET',
          asynchronous : false,
          contentType : "application/json",
          onComplete : readVLANDatainfo,
          onFailure: function() {
            Loading(false);
            alert(lang.LANG_CONF_VLAN_GET_FAILED);
          }
        });
        global_vlan++;
      }
    }
  }
}

function readVLANDatainfo(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var channelconfig = arg.responseJSON;
    vlanInfoResponse[interfaceindex][global_vlan]["VLANId"] =
        channelconfig.VLANId;
    vlanInfoResponse[interfaceindex][global_vlan]["VLANEnable"] =
        channelconfig.VLANEnable;
  }
}

function responseSaveVLANCfg(arg) {
  if (arg.readyState == 4 && (arg.status == 200 || arg.status == 201)) {
    alert(lang.LANG_CONF_NETWORK_UPDATE_SUCCESS, {
      title : lang.LANG_GENERAL_SUCCESS,
      onClose : function() {
        location.href = cfgVlanPage;
      }
    });
  }
}

function requestVLANInfo(channel) {
    Loading(true);
    var ajax_url = '/redfish/v1/Managers/bmc/EthernetInterfaces/';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: responseVLANInfo,
        timeout: g_CGIRequestTimeout,
        ontimeout: onCGIRequestTimeout,
        onFailure: function() {
            Loading(false);
            alert(lang.LANG_CONF_VLAN_GET_FAILED);
        }
    });
}

function saveVLANCfg() {
  UtilsConfirm(lang.LANG_CONF_NETWORK_WARNING2, {
    onOk: function() {
      var selector = document.getElementById("_lanChannel");

      var vid = "0";
      var objTemp = document.getElementById("_vlanID");
      vid = objTemp.value;

      if (vid == '' || parseInt(vid) <= 0 || parseInt(vid) >= 4095) {
          alert(lang.LANG_CONF_NETWORK_ERR3);
          return;
      }
      var nic_interface;
      if (selector != null) {
        var index = selector.selectedIndex;
        nic_interface = vlanInfoResponse[index].interfaceIname;
      }

      var url = vlanURL;
      var method = "PATCH";
      if (url == "") {
        method = "POST";
        url = "/redfish/v1/Managers/bmc/EthernetInterfaces/" + nic_interface +
              "/VLANs/";
      }
      Loading(true);
      var obj = {};
      var ajax_url = url;
      obj.VLANId = parseInt(vid);
      obj.VLANEnable = true;
      var object = JSON.stringify(obj);
      var ajax_req = new Ajax.Request(ajax_url, {
        method : method,
        contentType : "application/json",
        parameters : object,
        onSuccess : responseSaveVLANCfg,
        onFailure : handle_vlan_error
      });
    }
  });
}

function deleteVLANId(arg) {
  UtilsConfirm(lang.LANG_CONF_NETWORK_WARNING2, {
    onOk: function() {
      var selector = document.getElementById("_lanChannel");
      var nic_interface;
      if (selector != null) {
        var index = selector.selectedIndex;
        nic_interface = vlanInfoResponse[index].interfaceIname;
      }
      var ajax_url = "/redfish/v1/Managers/bmc/EthernetInterfaces/"  + nic_interface +
                      "/VLANs/" + nic_interface + "_" + arg;
      var ajax_req = new Ajax.Request(ajax_url, {
        method : 'DELETE',
        contentType : "application/json",
        onComplete : function () {
          alert(lang.LANG_CONF_NETWORK_VLAN_DELETE_SUCCESS, {
            title : lang.LANG_GENERAL_SUCCESS,
            onClose : function() {
              location.href = cfgVlanPage;
            }
          });
        },
        onFailure : handle_vlan_error,
        timeout : g_CGIRequestTimeout,
        ontimeout : onCGIRequestTimeout
      });
    }
  });
}

function handle_vlan_error() {
    Loading(false);
    alert(lang.LANG_CONF_NETWORK_UPDATE_FAIL);
    var selector = document.getElementById("_lanChannel");
    var index = 0;
    var channel_id = 0;

    if (selector != null) {
        index = selector.selectedIndex;
        channel_id = selector.options[index].value;
    }
    if (channel_id > 0) {
        requestVLANInfo(channel_id);
    }
}

function updateChannelList(root) {

    var numChannels;
    var channel_id;
    numChannels = root.length;
    totalNIC = numChannels;
    
    var selector = document.getElementById("_lanChannel");
    if (selector != null) {
      for (var i = (selector.options.length - 1); i >= 0; i--) {
        selector.remove(i);
      }

      for (var idx = 0; idx < numChannels; idx++) {
        channel_id = root[idx].interfaceIname;
        var option = document.createElement("option");
        option.text = channel_id;
        option.value = idx;
        selector.add(option);
      }
    }

    if (selector != null) {
      var index = selector.selectedIndex;
      var request_channel_id = selector.options[index].value;
      selectedObjindex = 0;
    }
}

function onChannelChange() {
    var selector = document.getElementById("_lanChannel");
    var index = 0;
    var channel_id = 0;

    if (selector != null) {
        index = selector.selectedIndex;
        channel_id = selector.options[index].value;
        selectedObjindex = channel_id;
    }

    if (channel_id != null || channel_id != '') {
        updateVLANInfo(channel_id);
    }
}
