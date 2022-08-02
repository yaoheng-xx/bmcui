"use strict";
var btnSave;
var global_primary_nic = 0;
var init_flag;
var ipv6InfoResponse = {};
var lang_setting;
var lang;
var selectedInterface = {};
var selectedObjindex = 0;
var totalNIC = 0;
var cfgIPv6Page = "/page/config_ipv6.html";

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }
function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_IPv6_network_hlp.html";
    var item = document.getElementById("_optStatic");
        item.onchange = onStaticIPChanged;
        item = document.getElementById("_optDHCP");
        item.onchange = onStaticIPChanged;

        document.getElementById("_lanChannel").addEventListener("change", onChannelChange);

        document.getElementById("_save").value = lang.LANG_CONF_NETWORK_SAVE;

        init_flag = true;
        OutputString();
        //check input format
        initCheckInputListener("_ipAddress", lang.LANG_CONF_NETWORK_IP_ADDR, INPUT_FIELD.IPV6);
        initCheckInputListener("_prefix", lang.LANG_CONF_NETWORK_PREFIX, INPUT_FIELD.IPV6PREFIX_LEN);
        initCheckInputListener("_gateway", lang.LANG_CONF_NETWORK_GATEWAY, INPUT_FIELD.IPV6);
        initCheckInputListener("_primaryDNS", lang.LANG_CONF_NETWORK_DNS_PRIMARY, INPUT_FIELD.IPV6);
        initCheckInputListener("_secondDNS", lang.LANG_CONF_NETWORK_DNS_SECONDARY, INPUT_FIELD.IPV6);
    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
    document.getElementById("caption_div").textContent = lang.LANG_CONF_NETWORK_IPV6_SETTING;
    document.getElementById("network_lbl").textContent = lang.LANG_CONF_NETWORK_INTERFACE;
    document.getElementById("mac_addr_lbl").textContent = lang.LANG_CONF_NETWORK_MAC_ADDRESS;
    document.getElementById("ipmi_channel_lbl").textContent =
        lang.LANG_CONF_NETWORK_IPMI_CHANNEL;
    document.getElementById("nic_desc_lbl").textContent = lang.LANG_CONF_NETWORK_NIC_DESCRIPTION;
    document.getElementById("link_status_lbl").textContent = lang.LANG_CONF_NETWORK_LINK_STATUS;
    document.getElementById("ip_addr_lbl").textContent = lang.LANG_CONF_NETWORK_IP_ADDR;
    document.getElementById("prefix_lbl").textContent = lang.LANG_CONF_NETWORK_PREFIX;
    document.getElementById("gateway_lbl").textContent = lang.LANG_CONF_NETWORK_GATEWAY;
    document.getElementById("dns_pri_lbl").textContent = lang.LANG_CONF_NETWORK_DNS_PRIMARY;
    document.getElementById("dns_sec_lbl").textContent = lang.LANG_CONF_NETWORK_DNS_SECONDARY;
    document.getElementById("optDHCP_lbl").textContent = lang.LANG_CONF_NETWORK_DHCPV6_EXP;
    document.getElementById("optStatic_lbl").textContent = lang.LANG_CONF_NETWORK_STATIC_EXP;
}

function PrivilegeCallBack(privilege)
{
    if (privilege == '04') {
        requestReadConfig("0", "0");
    } else if (privilege == '03') {
      var tmp = document.getElementById("_save");
      tmp.disabled = true;
      requestReadConfig("0", "0");
    } else {
        location.href = SubMainPage;
    }
}

function clear_input_fields(){
    document.getElementById("_ipAddress").value = "";
    document.getElementById("_prefix").value = "";
    document.getElementById("_gateway").value = "";
    document.getElementById("_primaryDNS").value = "";
    document.getElementById("_secondDNS").value = "";
}

function onStaticIPChanged() {
    var item = document.getElementById("_optStatic");
    if (item.checked == true) {
        enableIPEditor(true);
    }
    else {
        enableIPEditor(false);
    }
}

function enableIPEditor(enable) {
    var itemdhcp = document.getElementById("_optDHCP");
    var disabled;
    if(itemdhcp.checked){
      disabled = true;
    }else{
      disabled = !enable;
    }
    var item = document.getElementById("_ipAddress");
    item.disabled = disabled;
    item = document.getElementById("_prefix");
    item.disabled = disabled;
    item = document.getElementById("_gateway");
    item.disabled = disabled;
    item = document.getElementById("_primaryDNS");
    item.disabled = disabled;
    item = document.getElementById("_secondDNS");
    item.disabled = disabled;
}

function enableRadio(enable) {
    var disabled = !enable;
    var item = document.getElementById("_optDHCP");

    item.disabled = disabled;
    item = document.getElementById("_optStatic");
    item.disabled = disabled;
    /*item = document.getElementById("_optDisable");
    item.disabled = disabled;*/
}

function requestReadConfig(channel, nicnum)
{
    Loading(true);
    var ajax_url = '/redfish/v1/Managers/bmc/EthernetInterfaces/';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        contentType: "application/json",
        onSuccess: readNICConfig,
        onFailure: function() {
            Loading(false);
            alert(lang.LANG_CONFIG_IPV6_GET_FAILED);
        }
    });
}

function parseNetworkData(content) {

    var data = {
      interface_ids: [],
      interfaces: {},
      ip_addresses: {ipv6: []},
    };
    var interfaceId = '', keyParts = [], interfaceHash = '',
        interfaceType = '';
    for (var key in content.data) {
      if (key.match(/network\/eth\d+(_\d+)?$/ig)) {
        interfaceId = key.split('/').pop();
        if (data.interface_ids.indexOf(interfaceId) == -1) {
            data.interface_ids.push(interfaceId);
            data.interfaces[interfaceId] = {
                interfaceIname: '',
                LinkUp: '',
                DomainName: '',
                MACAddress: '',
                Nameservers: [],
                DHCPEnabled: 0,
                ipv6: {ids: [], values: []}
            };
            data.interfaces[interfaceId].MACAddress = content.data[key].MACAddress;
            data.interfaces[interfaceId].LinkUp = content.data[key].LinkUp;
            data.interfaces[interfaceId].DomainName = content.data[key].DomainName.join(' ');
            data.interfaces[interfaceId].Nameservers = content.data[key].Nameservers;
        
            var dhcp_check = content.data[key].DHCPEnabled.split(".").pop();
            if(dhcp_check == "v6" || dhcp_check == "both"){
                data.interfaces[interfaceId].DHCPEnabled = true;
            }else{
                data.interfaces[interfaceId].DHCPEnabled = false;
            }
          
        }
      } else if (
          key.match(
              /network\/eth\d+(_\d+)?\/ipv[6]\/[a-z0-9]+$/ig)) {
        keyParts = key.split('/');
        interfaceHash = keyParts.pop();
        interfaceType = keyParts.pop();
        interfaceId = keyParts.pop();

        if (data.interfaces[interfaceId][interfaceType]
                .ids.indexOf(interfaceHash) == -1) {
          data.interfaces[interfaceId][interfaceType]
              .ids.push(interfaceHash);
          data.interfaces[interfaceId][interfaceType]
              .values.push(content.data[key]);
          data.ip_addresses[interfaceType].push(
              content.data[key]['Address']);
        }
      }
    }
    return data;
}

function readNICConfig(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {

    var channelInfo = arg.responseJSON;
    global_primary_nic = 0;
    ipv6InfoResponse = [];
    for (var i = 0; i < channelInfo["Members@odata.count"]; i++) {
      var url = channelInfo.Members[i]["@odata.id"];

      var ajax_url = url;
      var ajax_req = new Ajax.Request(ajax_url, {
        method : 'GET',
        asynchronous : false,
        contentType : "application/json",
        onComplete : readNICInfo,
      });
    }
    updateChannelList(ipv6InfoResponse);
    updateNICConfiguration(0);
  } else {
    Loading(false);
    alert(lang.LANG_CONFIG_IPV6_GET_FAILED);
  }
}

function readNICInfo(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var channelconfig = arg.responseJSON;
    var interfaceID = channelconfig.Id;

    if ((interfaceID.indexOf("eth2") != -1 &&
         channelconfig.InterfaceEnabled == false)) {
      // if eth2 interface disabled then no need to display eth2 in LAN channel
      // list.
      return;
    }
    if (interfaceID.indexOf("eth") != -1) {
      ipv6InfoResponse[global_primary_nic] = [];
      ipv6InfoResponse[global_primary_nic]["interfaceIname"] = interfaceID;
      ipv6InfoResponse[global_primary_nic]["interfaceEnabled"] =
          channelconfig.InterfaceEnabled;
      ipv6InfoResponse[global_primary_nic]["HostName"] = channelconfig.HostName;
      if (channelconfig.IPv4Addresses.length) {
        ipv6InfoResponse[global_primary_nic]["defaultgateway"] =
            channelconfig.IPv4Addresses[0].Gateway;
      } else {
        ipv6InfoResponse[global_primary_nic]["defaultgateway"] = "";
      }
      ipv6InfoResponse[global_primary_nic]["IPv6DefaultGateway"] =
          channelconfig.IPv6DefaultGateway;
      ipv6InfoResponse[global_primary_nic]["LinkUp"] =
          channelconfig.LinkStatus == 'LinkUp' ? true : false;
      ipv6InfoResponse[global_primary_nic]["DomainName"] =
          channelconfig.DomainName;
      ipv6InfoResponse[global_primary_nic]["MACAddress"] =
          channelconfig.MACAddress;
      ipv6InfoResponse[global_primary_nic]["ChannelNumber"] =
          channelconfig.Oem.Intel.ChannelNumber || "N/A";
      ipv6InfoResponse[global_primary_nic]["NicDescription"] =
          channelconfig.Oem.Intel.NicDescription;
      ipv6InfoResponse[global_primary_nic]["DHCPEnabled"] =
          channelconfig.DHCPv6.OperatingMode == "Stateful" ? true : false;
      ipv6InfoResponse[global_primary_nic]["Nameservers"] =
          channelconfig.NameServers;
      ipv6InfoResponse[global_primary_nic]["ipv4"] =
          channelconfig.IPv4Addresses;
      if (channelconfig.IPv6Addresses.length > 0) {
        ipv6InfoResponse[global_primary_nic]["ipv6"] =
            channelconfig.IPv6Addresses;
      } else {
        ipv6InfoResponse[global_primary_nic]["ipv6"] = [ {
          Address : '',
          AddressOrigin : '',
          AddressState : '',
          PrefixLength : ''
        } ];
      }
      global_primary_nic++;
    }
  } else {
    Loading(false);
    alert(lang.LANG_CONFIG_IPV6_GET_FAILED);
  }
}

function updateConfig(response) {
    Loading(false);
    if (response.readyState == 4 && response.status == 200) {
        var status_txt = response.statusText;
        if(status_txt == "OK") {
            alert(lang.LANG_CONF_NETWORK_UPDATE_SUCCESS, 
            {
                title: lang.LANG_GENERAL_SUCCESS,
                onClose: function() {
                    location.href = cfgIPv6Page;
                }
            });
        }
        else if(status_txt == "SESSION_INVALID") {
            ClearInvalidSession();
        }
        else {
            alert(lang.LANG_CONF_NETWORK_UPDATE_FAIL);
        }
        var selector = document.getElementById("_lanChannel");
        var index = 0;
        var channel_id = 0;

        if(selector != null) {
            index = selector.selectedIndex;
            channel_id = selector.options[index].value;
        }

        if(channel_id > 0) {
            requestReadConfig(channel_id, "0");
        }
    }
}

function updateChannelList(root) {
    var numChannels;
    var channel_id;

    numChannels = root.length;
    totalNIC = numChannels;

    var selector = document.getElementById("_lanChannel");
    if (selector != null) {
        for(var idx = (selector.options.length - 1); idx >= 0; idx--) {
            selector.remove(idx);
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

function updateNICConfiguration(channel_id) {
    clear_input_fields();
    var attr;
    var item;
    selectedInterface = ipv6InfoResponse[channel_id].interfaceIname;
    selectedObjindex = channel_id;

    var selected_interface_data = ipv6InfoResponse[channel_id];

    item = document.getElementById("ipmi_channel");
    item.textContent = ipv6InfoResponse[channel_id].ChannelNumber;

    item = document.getElementById("nic_Description");
    item.textContent = ipv6InfoResponse[channel_id].NicDescription;

    attr = ipv6InfoResponse[channel_id].LinkUp;
    item = document.getElementById("link_status");
    if (!attr) {
      item.textContent = lang.LANG_CONF_NETWORK_LINK_DOWN;
    } else {
      item.textContent = lang.LANG_CONF_NETWORK_LINK_UP;
    }

    item = document.getElementById("_macAddress");
    item.textContent = ipv6InfoResponse[channel_id].MACAddress;

    var itemdhcp = document.getElementById("_optDHCP");
    var itemstatic = document.getElementById("_optStatic");
    if (ipv6InfoResponse[channel_id].DHCPEnabled) {
      itemdhcp.checked = true;
      onStaticIPChanged();
    } else {
      itemstatic.checked = true;
      onStaticIPChanged();
    }

    var ipv6Info = ipv6InfoResponse[channel_id].ipv6;

    if (ipv6Info.length != 0) {
      for (var idx = 0; idx < ipv6Info.length; idx++) {
        if (selectedInterface.indexOf("eth2") != -1 &&
            ipv6Info[idx].AddressOrigin != "LinkLocal") {
          item = document.getElementById("_macAddress");
          item.disabled = true;
          item.textContent = ipv6InfoResponse[channel_id].MACAddress;

          itemdhcp = document.getElementById("_optDHCP");
          itemdhcp.disabled = true;
          itemstatic = document.getElementById("_optStatic");
          itemstatic.checked = true;
          if (ipv6InfoResponse[channel_id].DHCPEnabled) {
            itemdhcp.checked = true;
            onStaticIPChanged();
          } else {
            itemstatic.checked = true;
            onStaticIPChanged();
          }

          item = document.getElementById("_ipAddress");
          item.value = ipv6Info[idx].Address;

          item = document.getElementById("_prefix");
          item.value = ipv6Info[idx].PrefixLength;

          item = document.getElementById("_gateway");
          item.value = "";
          item.disabled = true;

          var _pitem = document.getElementById("_primaryDNS");
          _pitem.disabled = true;
          var _sitem = document.getElementById("_secondDNS");
          _sitem.disabled = true;
          if (selected_interface_data.Nameservers.length > 0) {
            for (var i = 0; i < selected_interface_data.Nameservers.length;
                 i++) {
              if (CheckIP6(selected_interface_data.Nameservers[i], true)) {
                _pitem.value = _pitem.value == ''
                                   ? selected_interface_data.Nameservers[i]
                                   : _pitem.value;
                _sitem.value =
                    _pitem.value == selected_interface_data.Nameservers[i]
                        ? _sitem.value
                        : selected_interface_data.Nameservers[i];
              }
            }
          }

          btnSave = document.getElementById("_save");
          btnSave.onclick = saveConfiguration;

          break;
        } else if (ipv6Info[idx].AddressOrigin.indexOf("LinkLocal") == -1) {

          item = document.getElementById("_ipAddress");
          item.value = ipv6Info[idx].Address;

          item = document.getElementById("_prefix");
          item.value = ipv6Info[idx].PrefixLength;

          item = document.getElementById("_gateway");
          item.value = ipv6InfoResponse[channel_id].IPv6DefaultGateway;

          itemdhcp = document.getElementById("_optDHCP");
          itemstatic = document.getElementById("_optStatic");
          itemstatic.checked = true;
          if (ipv6InfoResponse[channel_id].DHCPEnabled) {
            itemdhcp.checked = true;
            onStaticIPChanged();
          } else {
            itemstatic.checked = true;
            onStaticIPChanged();
          }

          var _pitem = document.getElementById("_primaryDNS");
          var _sitem = document.getElementById("_secondDNS");
          if (selected_interface_data.Nameservers.length > 0) {
            for (var i = 0; i < selected_interface_data.Nameservers.length;
                 i++) {
              if (CheckIP6(selected_interface_data.Nameservers[i], true)) {
                _pitem.value = _pitem.value == ''
                                   ? selected_interface_data.Nameservers[i]
                                   : _pitem.value;
                _sitem.value =
                    _pitem.value == selected_interface_data.Nameservers[i]
                        ? _sitem.value
                        : selected_interface_data.Nameservers[i];
              }
            }
          }

          btnSave = document.getElementById("_save");
          btnSave.onclick = saveConfiguration;

          break;
        } else {
          if (selectedInterface.indexOf("eth2") != -1) {
            // Disable the DHCP options for host interface
            document.getElementById("_optDHCP").disabled = true;
            document.getElementById("_gateway").disabled = true;
            document.getElementById("_primaryDNS").disabled = true;
            document.getElementById("_secondDNS").disabled = true;
          } else {
            document.getElementById("_optDHCP").disabled = false;
            document.getElementById("_gateway").disabled = false;
            document.getElementById("_primaryDNS").disabled = false;
            document.getElementById("_secondDNS").disabled = false;
          }
          btnSave = document.getElementById("_save");
          btnSave.onclick = saveConfiguration;
          continue;
        }
      }
    }
}

function change_DHCP_to_Static(ipAddress, netmaskPrefixLength, gateway) {
  var ajax_url =
      "/redfish/v1/Managers/bmc/EthernetInterfaces/" + selectedInterface;
  var obj = {};
  var IPv6StaticAddressesObj = [];
  var IPv6StaticAddress = {};
  var IPv6StaticDefaultGatewaysObj = [];
  var IPv6StaticDefaultGateways = {};

  IPv6StaticAddress.Address = ipAddress;
  IPv6StaticAddress.PrefixLength = parseInt(netmaskPrefixLength);
  IPv6StaticAddressesObj[0] = IPv6StaticAddress;
  obj.IPv6StaticAddresses = IPv6StaticAddressesObj;

  IPv6StaticDefaultGateways.Address = gateway;
  IPv6StaticDefaultGateways.PrefixLength = parseInt(netmaskPrefixLength);
  IPv6StaticDefaultGatewaysObj[0] = IPv6StaticDefaultGateways;
  obj.IPv6StaticDefaultGateways = IPv6StaticDefaultGatewaysObj;

  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : JSON.stringify(obj),
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(data) {
      Loading(false);
      alert(lang.LANG_CONF_NETWORK_UPDATE_SUCCESS, {
        title : lang.LANG_GENERAL_SUCCESS,
        onClose : function() {
          location.href = cfgIPv6Page;
        }
      });
    },
    onFailure : function(error) {
      Loading(false);
      alert(lang.LANG_CONF_NETWORK_UPDATE_FAIL);
    }
  });
}

function change_Static_to_DHCP(){

  var ajax_url =
      "/redfish/v1/Managers/bmc/EthernetInterfaces/" + selectedInterface;
  var DHCPv6obj = {};
  DHCPv6obj.OperatingMode = "Stateful";
  var obj = {};
  obj.DHCPv6 = DHCPv6obj;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : JSON.stringify(obj),
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(data) {
      Loading(false);
      alert(lang.LANG_CONF_NETWORK_UPDATE_SUCCESS, {
        title : lang.LANG_GENERAL_SUCCESS,
        onClose : function() {
          location.href = cfgIPv6Page;
        }
      });
    },
    onFailure : function(error) {
      Loading(false);
      console.log('error call', error);
    }
  });
}

function saveConfiguration() {
  UtilsConfirm(lang.LANG_CONF_NETWORK_WARNING2, {
    onOk : function() {
      Loading(true);
      var item_static = document.getElementById("_optStatic");
      var item_dhcp = document.getElementById("_optDHCP");
      if (item_static.checked) {
        var item_ipv6 = document.getElementById("_ipAddress");
        var item_prefix = document.getElementById("_prefix");
        var item_gateway = document.getElementById("_gateway");
        change_DHCP_to_Static(item_ipv6.value, item_prefix.value,
                              item_gateway.value);
      }
      if (item_dhcp.checked) {
        change_Static_to_DHCP();
      }
    }
  });
}
function checkDnsChanged(formData){
    var ipv6obj = ipv6InfoResponse[selectedObjindex];
    if(formData.dns_manual != ipv6obj.dns_manual || formData.dns_server1 != ipv6obj.dns_server1 || formData.dns_server2 != ipv6obj.dns_server2){
        return 1;
    }else{
        return 0;
    }
}

function onChannelChange() {
    var selector = document.getElementById("_lanChannel");
    var index = 0;
    var channel_id = 0;

    if(selector != null) {
       index = selector.selectedIndex;
       channel_id = selector.options[index].value;
    }
    if(channel_id != '' || channel_id != null) {
        updateNICConfiguration(channel_id);
        selectedObjindex = channel_id;
    }
}
