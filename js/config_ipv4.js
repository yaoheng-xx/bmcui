"use strict";
/** Configuration IPv4 Setting **/
var availablemask = 0;
var btnSave;
var global_nic_numble = 0;
var global_primary_nic = 0;
var hostname = '';
var init_flag;
var interfaceValue = {};
var ipv4InfoResponse = {};
var lang_setting;
var lang;
var network_data = {};
var nochange_flag = false;
var oldInterface = {};
var selectedChannel = '';
var selectedInterface = {};
var selectedIPv4Objindex = 0;
var selectedObjindex = 0;
var totalNIC = 0;
var cfgIPv4Page = "/page/config_ipv4.html";

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/configure_IPv4_network_hlp.html";

    var item = document.getElementById("_optStatic");
    item.onchange = onStaticIPChanged;
    item = document.getElementById("_optDHCP");
    item.onchange = onStaticIPChanged;
    init_flag = true;
    OutputString();

    document.getElementById("_lanChannel").addEventListener("change", onChannelChange);
    document.getElementById("_save").value = lang.LANG_CONF_NETWORK_SAVE;

    //check input format
    initCheckInputListener("_hostname", lang.LANG_CONF_NETWORK_HOSTNAME, INPUT_FIELD.HOSTNAME);
    initCheckInputListener("_ipAddress", lang.LANG_CONF_NETWORK_IP_ADDR, INPUT_FIELD.IPV4);
    initCheckInputListener("_subnetMask", lang.LANG_CONF_NETWORK_MASK, INPUT_FIELD.IPV4);
    initCheckInputListener("_gateway", lang.LANG_CONF_NETWORK_GATEWAY, INPUT_FIELD.IPV4);
    initCheckInputListener("_primaryDNS", lang.LANG_CONF_NETWORK_DNS_PRIMARY, INPUT_FIELD.IPV4);
    initCheckInputListener("_secondDNS", lang.LANG_CONF_NETWORK_DNS_SECONDARY, INPUT_FIELD.IPV4);

    CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString()
{
    document.getElementById("caption_div").textContent = lang.LANG_CONF_NETWORK_IPV4_SETTING;
    document.getElementById("hostname_lbl").textContent = lang.LANG_CONF_NETWORK_HOSTNAME;
    document.getElementById("network_lbl").textContent = lang.LANG_CONF_NETWORK_INTERFACE;
    document.getElementById("mac_addr_lbl").textContent = lang.LANG_CONF_NETWORK_MAC_ADDRESS;
    document.getElementById("ipmi_channel_lbl").textContent =
        lang.LANG_CONF_NETWORK_IPMI_CHANNEL;
    document.getElementById("nic_desc_lbl").textContent = lang.LANG_CONF_NETWORK_NIC_DESCRIPTION;
    document.getElementById("link_status_lbl").textContent = lang.LANG_CONF_NETWORK_LINK_STATUS;
    document.getElementById("ip_addr_lbl").textContent = lang.LANG_CONF_NETWORK_IP_ADDR;
    document.getElementById("mask_lbl").textContent = lang.LANG_CONF_NETWORK_MASK;
    document.getElementById("gateway_lbl").textContent = lang.LANG_CONF_NETWORK_GATEWAY;
    document.getElementById("dns_pri_lbl").textContent = lang.LANG_CONF_NETWORK_DNS_PRIMARY;
    document.getElementById("dns_sec_lbl").textContent = lang.LANG_CONF_NETWORK_DNS_SECONDARY;
    document.getElementById("optDHCP_lbl").textContent = lang.LANG_CONF_NETWORK_DHCP_EXP;
    document.getElementById("optStatic_lbl").textContent = lang.LANG_CONF_NETWORK_STATIC_EXP;
}

function PrivilegeCallBack(privilege)
{
    var Item;
    Item = document.getElementById("_macAddress");
    Item.disabled = false;

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

function onStaticIPChanged()
{
    var item = document.getElementById("_optStatic");
    if(item.checked == true) {
        enableIPEditor(true);
        enableHostname(true);
    } else {
        enableIPEditor(false);
        enableHostname(true);
    }
}

function clear_input_fields(){
    document.getElementById("_ipAddress").value = "";
    document.getElementById("_subnetMask").value = "";
    document.getElementById("_gateway").value = "";
    document.getElementById("_primaryDNS").value = "";
    document.getElementById("_secondDNS").value = "";
}

function enableHostname(enable) {
    var disabled = !enable;
    if (network_data[selectedObjindex].interfaceIname.indexOf("eth2") != -1) {
      disabled = true;
    }
    var hostname = document.getElementById("_hostname");
    hostname.disabled = disabled;
}

function enableIPEditor(enable) {
    var itemdhcp = document.getElementById("_optDHCP");
    if(itemdhcp.checked){
        var disabled = true;
    }else{
        var disabled = !enable;
    }
    var item = document.getElementById("_ipAddress");

    item.disabled = disabled;
    item = document.getElementById("_subnetMask");
    item.disabled = disabled;
    item = document.getElementById("_gateway");
    item.disabled = disabled;
    if (network_data[selectedObjindex].interfaceIname.indexOf("eth2") == -1) {
      item = document.getElementById("_primaryDNS");
      item.disabled = disabled;
      item = document.getElementById("_secondDNS");
      item.disabled = disabled;
    }
}

function enableRadio(enable) {
    var disabled = !enable;
    var item = document.getElementById("_optDHCP");

    item.disabled = disabled;
    item = document.getElementById("_optStatic");
    item.disabled = disabled;
}

function parseNetworkData(content) {

    var data = {
      interface_ids: [],
      interfaces: {},
      ip_addresses: {ipv4: [], ipv6: []},
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
            ipv4: {ids: [], values: []},
            ipv6: {ids: [], values: []}
          };
          data.interfaces[interfaceId].MACAddress =
              content.data[key].MACAddress;
        data.interfaces[interfaceId].LinkUp = content.data[key].LinkUp;
          data.interfaces[interfaceId].DomainName =
              content.data[key].DomainName.join(' ');
          data.interfaces[interfaceId].Nameservers =
              content.data[key].Nameservers;
          data.interfaces[interfaceId].DHCPEnabled =
              content.data[key].DHCPEnabled;
          if(interfaceId.indexOf("_") > -1){
            data.interfaces[interfaceId].Id = content.data[key].Id;
            data.interfaces[interfaceId].VlanPriority = content.data[key].VlanPriority;
          }
        }
      } else if (
          key.match(
              /network\/eth\d+(_\d+)?\/ipv[4|6]\/[a-z0-9]+$/ig)) {
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
    var i = 0;
    network_data = [];
    for (i = 0; i < channelInfo["Members@odata.count"]; i++) {
      var url = channelInfo.Members[i]["@odata.id"];
      var interfaceId = url.split('/').pop();

      var ajax_url = url;
      var ajax_req = new Ajax.Request(ajax_url, {
        method : 'GET',
        asynchronous : false,
        contentType : "application/json",
        onComplete : readNICInfo,
        onFailure: function() {
          alert(lan.LANG_CONF_NETWORK_UPDATE_FAIL);
        }
      });
    }
    updateChannelList(network_data);
    updateNICConfiguration(0);
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
      network_data[global_primary_nic] = [];
      network_data[global_primary_nic]["interfaceIname"] = interfaceID;
      network_data[global_primary_nic]["interfaceEnabled"] =
          channelconfig.InterfaceEnabled;
      network_data[global_primary_nic]["HostName"] = channelconfig.HostName;
      hostname = channelconfig.HostName;

      network_data[global_primary_nic]["LinkUp"] =
          channelconfig.LinkStatus == 'LinkUp' ? true : false;
      network_data[global_primary_nic]["DomainName"] = channelconfig.DomainName;
      network_data[global_primary_nic]["MACAddress"] = channelconfig.MACAddress;
      network_data[global_primary_nic]["ChannelNumber"] =
          channelconfig.Oem.Intel.ChannelNumber || "N/A";
      network_data[global_primary_nic]["NicDescription"] =
          channelconfig.Oem.Intel.NicDescription;
      network_data[global_primary_nic]["DHCPEnabled"] =
          channelconfig.DHCPv4.DHCPEnabled;
      network_data[global_primary_nic]["Nameservers"] =
          channelconfig.NameServers;
      if (channelconfig.IPv4Addresses.length > 0) {
        network_data[global_primary_nic]["defaultgateway"] =
            channelconfig.IPv4Addresses[0].Gateway;
        network_data[global_primary_nic]["ipv4"] = channelconfig.IPv4Addresses;
      } else {
        network_data[global_primary_nic]["defaultgateway"] = "0.0.0.0";
        network_data[global_primary_nic]["ipv4"] = [
          {Address : '', AddressOrigin : '', Gateway : '', SubnetMask : ''}
        ];
      }
      global_primary_nic++;
    }
  }
}

function updateConfig(response) {
    Loading(false);
    if (response.readyState == 4 &&
        (response.status == 200 || response.status == 204)) {
      alert(lang.LANG_CONF_NETWORK_UPDATE_SUCCESS, {
        title : lang.LANG_GENERAL_SUCCESS,
        onClose : function() { location.href = cfgIPv4Page; }
      });
    }
}

function updateChannelList(root) {
    var numChannels;
    var channel_id;

    numChannels = root.length;
    totalNIC = numChannels;
    var idx = 0;

    var selector = document.getElementById("_lanChannel");
    if (selector != null) {
        for(idx = (selector.options.length - 1); idx >= 0; idx--) {
            selector.remove(idx);
        }

        for (idx = 0; idx < numChannels; idx++) {
          channel_id = root[idx].interfaceIname.replace('_', '.');
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
  var enable_lan;
  selectedInterface = network_data[channel_id].interfaceIname;
  selectedObjindex = channel_id;

  interfaceValue = network_data[channel_id];
  var Nameservers = network_data[channel_id].Nameservers;
  ipv4InfoResponse = network_data[channel_id].ipv4;

  if (ipv4InfoResponse.length > 0) {
    for (var idx = 0; idx < ipv4InfoResponse.length; idx++) {
      if (selectedInterface.indexOf("eth2") != -1) {
        selectedIPv4Objindex = idx;

        item = document.getElementById("_hostname");
        enableHostname(true);
        item.value = network_data[channel_id].HostName;

        item = document.getElementById("_macAddress");
        item.textContent = network_data[channel_id].MACAddress;

        item = document.getElementById("ipmi_channel");
        item.textContent = network_data[channel_id].ChannelNumber;

        item = document.getElementById("nic_Description");
        item.textContent = network_data[channel_id].NicDescription;

        attr = network_data[channel_id].LinkUp;
        item = document.getElementById("link_status");
        if (!attr) {
          item.textContent = lang.LANG_CONF_NETWORK_LINK_DOWN;
        } else {
          item.textContent = lang.LANG_CONF_NETWORK_LINK_UP;
        }

        var itemdhcp = document.getElementById("_optDHCP");
        itemdhcp.disabled = true;
        var itemstatic = document.getElementById("_optStatic");
        itemstatic.checked = true;
        if (network_data[channel_id].DHCPEnabled) {
          itemdhcp.checked = true;
          onStaticIPChanged();
        } else {
          itemstatic.checked = true;
          onStaticIPChanged();
        }

        item = document.getElementById("_ipAddress");
        item.value = ipv4InfoResponse[idx].Address;

        item = document.getElementById("_subnetMask");
        item.value = ipv4InfoResponse[idx].SubnetMask;

        item = document.getElementById("_gateway");
        item.value = ipv4InfoResponse[idx].Gateway;
        item.disabled = true;

        var itemprimaryDNS = document.getElementById("_primaryDNS");
        itemprimaryDNS.disabled = true;

        var itemsecondDNS = document.getElementById("_secondDNS");
        itemsecondDNS.disabled = true;

        if (Nameservers.length > 0) {
          for (var i = 0; i < Nameservers.length; i++) {
            if (CheckIP(Nameservers[i])) {
              itemprimaryDNS.value = itemprimaryDNS.value == ''
                                         ? Nameservers[i]
                                         : itemprimaryDNS.value;
              itemsecondDNS.value = itemprimaryDNS.value == Nameservers[i]
                                        ? itemsecondDNS.value
                                        : Nameservers[i];
            }
          }
        }

        btnSave = document.getElementById("_save");
        btnSave.onclick = saveConfiguration;

        break;
      } else if (ipv4InfoResponse[idx].AddressOrigin.indexOf("LinkLocal") ==
                 -1) {

        selectedIPv4Objindex = idx;

        item = document.getElementById("_hostname");
        item.value = network_data[channel_id].HostName;

        item = document.getElementById("_macAddress");
        item.disabled = true;
        item.value = network_data[channel_id].MACAddress;
        item.textContent = network_data[channel_id].MACAddress;

        item = document.getElementById("ipmi_channel");
        item.textContent = network_data[channel_id].ChannelNumber;

        item = document.getElementById("nic_Description");
        item.textContent = network_data[channel_id].NicDescription;

        attr = network_data[channel_id].LinkUp;
        item = document.getElementById("link_status");
        if (!attr) {
          item.textContent = lang.LANG_CONF_NETWORK_LINK_DOWN;
        } else {
          item.textContent = lang.LANG_CONF_NETWORK_LINK_UP;
        }

        itemdhcp = document.getElementById("_optDHCP");
        itemstatic = document.getElementById("_optStatic");
        if (network_data[channel_id].DHCPEnabled) {
          itemdhcp.checked = true;
          onStaticIPChanged();
        } else {
          itemstatic.checked = true;
          onStaticIPChanged();
        }

        item = document.getElementById("_ipAddress");
        item.value = ipv4InfoResponse[idx].Address;

        item = document.getElementById("_subnetMask");
        item.value = ipv4InfoResponse[idx].SubnetMask;

        item = document.getElementById("_gateway");
        item.value = ipv4InfoResponse[idx].Gateway;

        if (Nameservers.length > 0) {
          var DNSitem1 = document.getElementById("_primaryDNS");
          var DNSitem2 = document.getElementById("_secondDNS");
          for (var i = 0; i < Nameservers.length; i++) {
            if (CheckIP(Nameservers[i])) {
              DNSitem1.value =
                  DNSitem1.value == '' ? Nameservers[i] : DNSitem1.value;
              DNSitem2.value = DNSitem1.value == Nameservers[i]
                                   ? DNSitem2.value
                                   : Nameservers[i];
            }
          }
        }

        btnSave = document.getElementById("_save");
        btnSave.onclick = saveConfiguration;

        break;
      } else {
        continue;
      }
    }
    }else{
        item = document.getElementById("ipmi_channel");
        item.textContent = network_data[channel_id].ChannelNumber;

        item = document.getElementById("nic_Description");
        item.textContent = network_data[channel_id].NicDescription;

        attr = network_data[channel_id].LinkUp;
        item = document.getElementById("link_status");
        if (!attr) {
          item.textContent = lang.LANG_CONF_NETWORK_LINK_DOWN;
        } else {
          item.textContent = lang.LANG_CONF_NETWORK_LINK_UP;
        }
        document.getElementById("link_status").textContent = "DOWN";
        document.getElementById("nic_Description").textContent = "-";
        document.getElementById("_hostname").disabled = false;
        document.getElementById("_macAddress").disabled = true;
        document.getElementById("_macAddress").textContent =
            network_data[channel_id].MACAddress;
        document.getElementById("_optDHCP").disabled = true;
        document.getElementById("_optStatic").disabled = true;
        document.getElementById("_ipAddress").disabled = true;
        document.getElementById("_subnetMask").disabled = true;
        document.getElementById("_gateway").disabled = true;
        document.getElementById("_primaryDNS").disabled = true;
        document.getElementById("_secondDNS").disabled = true;

        btnSave = document.getElementById("_save");
        btnSave.onclick = saveConfiguration;
    }
}

function updateHostName(value){
  var ajax_url =
      "/redfish/v1/Managers/bmc/EthernetInterfaces/" + selectedInterface;
  var obj = {};
  obj.HostName = value;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : JSON.stringify(obj),
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(data) { Loading(false); },
    onFailure : function(error) {
      Loading(false);
      alert("Error in saving Hostname!!");
    }
  });
}

function change_DHCP_to_Static(){
  var ajax_url =
      "/redfish/v1/Managers/bmc/EthernetInterfaces/" + selectedInterface;
  var obj = {};
  var IPv4StaticAddressesObj = [];
  var IPv4StaticAddress = {};
  var ip_item = document.getElementById("_ipAddress").value;
  var subnet_mask_item = document.getElementById("_subnetMask").value;
  var gateway_item = document.getElementById("_gateway").value;
  IPv4StaticAddress.Address = ip_item;
  IPv4StaticAddress.SubnetMask = subnet_mask_item;
  IPv4StaticAddress.Gateway =
      selectedInterface.indexOf("eth2") != -1 ? '0.0.0.0' : gateway_item;
  IPv4StaticAddressesObj[0] = IPv4StaticAddress;
  obj.IPv4StaticAddresses = IPv4StaticAddressesObj;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : JSON.stringify(obj),
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onComplete : updateConfig,
    onFailure : function(error) {
      Loading(false);
      alert(lang.LANG_CONF_NETWORK_UPDATE_FAIL)
    }
  });
}

function deleteIP(id) {
  var ajax_url =
      "/redfish/v1/Managers/bmc/EthernetInterfaces/" + selectedInterface;
  var obj = {};
  var IPv4StaticAddressesObj = [];
  var IPv4StaticAddress = {};
  IPv4StaticAddressesObj[0] = IPv4StaticAddress;
  obj.IPv4StaticAddresses = IPv4StaticAddressesObj;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : JSON.stringify(obj),
    onComplete : updateConfig,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout
  });
}

function change_Static_to_DHCP(){
  var ajax_url =
      "/redfish/v1/Managers/bmc/EthernetInterfaces/" + selectedInterface;
  var DHCPv4obj = {};
  DHCPv4obj.DHCPEnabled = true;
  var obj = {};
  obj.DHCPv4 = DHCPv4obj;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'PATCH',
    contentType : "application/json",
    parameters : JSON.stringify(obj),
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onComplete : updateConfig,
    onFailure : function(error) { console.log('error call', error); }
  });
}

function change_static_to_Static() { change_DHCP_to_Static(); }

function saveConfiguration()
{

    UtilsConfirm(lang.LANG_CONF_NETWORK_WARNING2, {
    onOk: function() {
            Loading(true);
            var item;
            item = document.getElementById("_hostname");
            var item_dhcp = document.getElementById("_optDHCP");
            var item_static = document.getElementById("_optStatic");
            var ip_value = document.getElementById("_ipAddress").value;
            var subnet_mask_value = document.getElementById("_subnetMask").value;
            var gateway_value = document.getElementById("_gateway").value;

            if(item.value != hostname){
                updateHostName(item.value);
            }
            if(item_dhcp.checked){
              if (!network_data[selectedObjindex].DHCPEnabled) {
                change_Static_to_DHCP();
              }
            }
            if(item_static.checked){
                if(!CheckIP(ip_value)){
                    alert(lang.LANG_CONFIG_NETWORK_ERR_INVALID_IP);
                }else{
                  if (network_data[selectedObjindex].DHCPEnabled) {
                    change_DHCP_to_Static();
                  } else if (ipv4InfoResponse[0].Address != ip_value ||
                             ipv4InfoResponse[0].PrefixLength !=
                                 subnet_mask_value ||
                             ipv4InfoResponse[0].Gateway != gateway_value) {
                    change_static_to_Static();
                  }
                }
            }
        }
    });
}

function checkDnsChanged(formData){
  var ipv4obj = ipv4InfoResponse[selectedIPv4Objindex];
  if (formData.host_name != ipv4obj.hostname ||
      formData.dns_manual != ipv4obj.dns_manual ||
      formData.dns_server1 != ipv4obj.dns_server1 ||
      formData.dns_server2 != ipv4obj.dns_server2) {
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
        selectedChannel = channel_id;
    }
    if(channel_id != '' && channel_id != null) {
        updateNICConfiguration(channel_id);
    }
}

function requestReadConfig(){
  var ajax_url = '/redfish/v1/Managers/bmc/EthernetInterfaces/';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    contentType : "application/json",
    onComplete : readNICConfig,
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout
  });
}
