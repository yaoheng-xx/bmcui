"use strict";
/* SYSTEM -- CPU Information page */

var cpu_count = 0;
var CPU;
var lang_setting;
var lang;

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit(){
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting +"/sys_cpu_hlp.html";

    var CPU_InfoBox_0 = document.getElementById("CPU_InfoBox_0");
    var CPU_InfoBox_1 = document.getElementById("CPU_InfoBox_1");
    var CPU_InfoBox_2 = document.getElementById("CPU_InfoBox_2");
    var CPU_InfoBox_3 = document.getElementById("CPU_InfoBox_3");

    document.getElementById("cpu_info_title_div").textContent = lang.LANG_SYSTEM_CPU_INFO_TITLE;

    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}
function PrivilegeCallBack(privilege)
{
    if (privilege == '02' || privilege == '03' || privilege == '04') {
      getProcessorInfo();
    }
    else{
        location.href = SubMainPage;
        return;
    }
}
function getProcessorInfo() {
  Loading(true);
  var url = '/redfish/v1/Systems/system';
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(response) {
      var data = JSON.parse(response.responseText);
      if (data.hasOwnProperty("Processors")) {
        getCPUInfoURL(data.Processors["@odata.id"]);
      } else {
        Loading(false);
      }
    },
    onFailure : function() {
      Loading(false);
      alert("Error in Getting CPU Information!!");
    }
  });
}
function getCPUInfoURL(url) {
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : function(data) {
      var response = JSON.parse(data.responseText);
      if (response.hasOwnProperty("Members")) {
        var MemberData = response.Members;
        if (MemberData.length) {
          var cpuinfo = [];
          for (var i = 0; i < MemberData.length; i++) {
            cpuinfo[i] = MemberData[i]["@odata.id"];
          }
          cpuinfo.sort();
          for (var i = 0; i < MemberData.length; i++) {
            getCPUInfo(cpuinfo[i]);
          }
        } else {
          Loading(false);
        }
      }
    },
    onFailure : function() {
      Loading(false);
      alert("Error in Getting CPU Information!!");
    }
  });
}
function getCPUInfo(url) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : ReplyCPUInfo,
    onFailure : function() {
      Loading(false);
      alert("Error in Getting CPU Information!!");
    }
  });
}
function ReplyCPUInfo(arg){
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      var org_req = JSON.parse(arg.responseText);
      document.getElementById("CPU_InfoBox_" + cpu_count).innerHTML =
          "<div align=\"left\" id=\"CPU_" + cpu_count + "\">" +
          "<fieldset class=\"wide group\">" +
          "<legend class=\"legendcaption\">" + lang.LANG_SYSTEM_CPU_INFO_TITLE +
          "</legend>" +
          "<table>" +
          // Socket Designation -> yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" +
          lang.LANG_SYS_CPU_SOCKET_DESIGNATION + "</label></td>" +
          "<td><span id=\"socketNo_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Manufacturer -> yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_MANUFACTURER +
          "</label></td>" +
          "<td><span id=\"manuf_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Version -> version
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_VERSION +
          "</label></td>" +
          "<td><span id=\"version_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Processor Signature -> no
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_PROC_SIGNATURE +
          "</label></td>" +
          "<td><span id=\"procSig_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Processor Type - yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_PROC_TYPE +
          "</label></td>" +
          "<td><span id=\"procType_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Processor Family -> yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_FAMILY +
          "</label></td>" +
          "<td><span id=\"procFamily_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Speed -> yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_CURRENT_SPEED +
          "</label></td>" +
          "<td><span id=\"speed_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Cores - yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_CORES +
          "</label></td>" +
          "<td><span id=\"cores_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Voltage - yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_VOLTAGE +
          "</label></td>" +
          "<td><span id=\"voltage_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Socket Type - no
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_SOCKET_TYPE +
          "</label></td>" +
          "<td><span id=\"socketType_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Status - yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_STATUS +
          "</label></td>" +
          "<td><span id=\"status_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Serial Number - yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_SERIAL_NO +
          "</label></td>" +
          "<td><span id=\"serialNo_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Asset Tag - yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_ASSET_TAG +
          "</label></td>" +
          "<td><span id=\"assetTag_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          // Part Number - yes
          "<tr><td align=\"right\" class=\"bold\">" +
          "<label class=\"labeltitle\">" + lang.LANG_SYS_CPU_PART_NO +
          "</label></td>" +
          "<td><span id=\"partNo_" + cpu_count + "\"" +
          " class=\"labeltext\"></span>" +
          "</td></tr>" +
          "</table>" +
          "</fieldset>" +
          "</div>";
      document.getElementById("socketNo_" + cpu_count).textContent =
          org_req.Socket;
      document.getElementById("manuf_" + cpu_count).textContent =
          org_req.Manufacturer;
      document.getElementById("serialNo_" + cpu_count).textContent =
          org_req.SerialNumber == "" ? "NULL" : org_req.SerialNumber;
      document.getElementById("partNo_" + cpu_count).textContent =
          org_req.PartNumber == "" ? "NULL" : org_req.PartNumber;
      document.getElementById("procFamily_" + cpu_count).textContent =
          org_req.ProcessorId.EffectiveFamily;
      var dis_ghz =
          parseInt(org_req.OperatingSpeedMHz, 10) > 0
              ? (parseInt(org_req.OperatingSpeedMHz, 10) / 1000).toFixed(2)
              : org_req.OperatingSpeedMHz;
      document.getElementById("speed_" + cpu_count).textContent =
          dis_ghz + "GHz";
      document.getElementById("cores_" + cpu_count).textContent =
          org_req.TotalCores;
      document.getElementById("version_" + cpu_count).textContent =
          org_req.Version;
      if (org_req.hasOwnProperty("Oem")) {
        document.getElementById("voltage_" + cpu_count).textContent =
            checkProperty(org_req.Oem, 'Voltage');
      }
      document.getElementById("status_" + cpu_count).textContent =
          org_req.Status.State;
      document.getElementById("socketType_" + cpu_count).textContent =
            checkProperty(org_req.Oem, 'ProcessorUpgrade');
      document.getElementById("procType_" + cpu_count).textContent =
          org_req.ProcessorType;
      if (org_req.hasOwnProperty("Oem")) {
        document.getElementById("assetTag_" + cpu_count).textContent =
            checkProperty(org_req.Oem, 'AssetTag');
      }
      if (org_req.hasOwnProperty("Oem")) {
        var final_str = "";
        final_str =
            checkProperty(org_req.ProcessorId, 'IdentificationRegisters');
        document.getElementById("procSig_" + cpu_count).textContent = final_str;
      }
      cpu_count++;
    }
}

function dec2hex(str) { // .toString(16) only works up to 2^53
  var dec = str.toString().split(''), sum = [], hex = [], i, s
  while (dec.length) {
    s = 1 * dec.shift()
    for (i = 0; s || i < sum.length; i++) {
      s += (sum[i] || 0) * 10
      sum[i] = s % 16
      s = (s - sum[i]) / 16
    }
  }
  while (sum.length) {
    hex.push(sum.pop().toString(16))
  }
  return hex.join('')
}

function checkProperty(data, value) {
  if (data.hasOwnProperty(value)) {
    if (data[value].hasOwnProperty('Value')) {
      var tmp_data = data[value]['Value'] == "" ? "N/A" : data[value]['Value'];
    } else {
      var tmp_data = data[value] == "" ? "N/A" : data[value];
    }
    return tmp_data;
  } else {
    return "N/A";
  }
}

function getSMBIOSInfo(){
    Loading(true);

    var url =
        '/xyz/openbmc_project/inventory/system/chassis/motherboard/enumerate';

    var myAjax = new Ajax.Request(url, {
      method : 'GET',
      timeout : g_CGIRequestTimeout,
      ontimeout : onCGIRequestTimeout,
      onSuccess : ReplySMBIOSInfo,
      onFailure :
          function() { alert("Error in Getting SMBIOS CPU Information!!"); }
    });
}
function ReplySMBIOSInfo(arg){
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
      // var sys_smbios_info = JSON.parse(arg.xhr.responseText);
      var sys_smbios_info = [];

      var org_req = JSON.parse(arg.responseText);
      var data = org_req.data;
      var sys_smbios_info = [];
      for (var i in data) {
        var tmp_String = i.split('/').pop();
        if (tmp_String.indexOf("cpu") != -1 &&
            data[i].Manufacturer != "Not Available") {
          sys_smbios_info.push(data[i]);
        }
      }
      CPU = sys_smbios_info;
      // CPU_COUNT=CPU.processor_info.length;// CPU.length;
      // var count=0;
      // for(var j=0;j<CPU.processor_info.length;j++){
      //     console.log(CPU.processor_info[j].cpu_manufacturer);
      //     if(CPU.processor_info[j].cpu_manufacturer != "Not Available") {
      //         count++;
      //     }
      // }

      // console.log("SMBIOS CPU_COUNT" ,CPU_COUNT);

      var CPU_COUNT = sys_smbios_info.length;

      for (i = 0; i < CPU_COUNT; i++) {

        if (CPU[i].cpu_manufacturer != "Not Available" ||
            CPU[i].cpu_manufacturer != "") {

          /*
          document.getElementById("serialNo_" + i).textContent =
          CPU.processor_info[i].serial_no; document.getElementById("assetTag_" +
          i).textContent =CPU.processor_info[i].asset_tag; //CPU[i].Socket;
          //CPU[i].getAttribute("Asset"); document.getElementById("partNo_" +
          i).textContent = CPU.processor_info[i].part_no; //CPU[i].Socket;
          //CPU[i].getAttribute("Part"); document.getElementById("voltage_" +
          i).textContent =CPU.processor_info[i].voltage; // CPU[i].Socket;
          //CPU[i].getAttribute("Voltage"); document.getElementById("status_" +
          i).textContent = CPU.processor_info[i].status;
          //CPU[i].getAttribute("Status"); document.getElementById("socketType_"
          + i).textContent =CPU.processor_info[i].socket_desig; //CPU[i].Socket;
          //CPU[i].getAttribute("SocketType"); document.getElementById("speed_"
          + i).textContent = CPU.processor_info[i].current_speed;
          //CPU[i].Socket; //CPU[i].getAttribute("Speed");
          document.getElementById("procSig_" + i).textContent ="Unknown"; //
          CPU[i].Socket; //CPU[i].getAttribute("Signature");
          */

          document.getElementById("serialNo_" + i).textContent =
              CPU[i].SerialNumber;
          document.getElementById("assetTag_" + i).textContent =
              "Unknown"; // CPU[i].Socket; //CPU[i].getAttribute("Asset");
          document.getElementById("partNo_" + i).textContent =
              CPU[i].SparePartNumber; // CPU[i].Socket;
                                      // //CPU[i].getAttribute("Part");
          document.getElementById("voltage_" + i).textContent =
              "Unknown"; // CPU[i].Socket; //CPU[i].getAttribute("Voltage");
          document.getElementById("status_" + i).textContent =
              "Unknown"; // CPU[i].getAttribute("Status");
          document.getElementById("socketType_" + i).textContent =
              "Unknown"; // CPU[i].Socket; //CPU[i].getAttribute("SocketType");
          document.getElementById("speed_" + i).textContent =
              "Unknown"; // CPU[i].Socket; //CPU[i].getAttribute("Speed");
          document.getElementById("procSig_" + i).textContent =
              "Unknown"; // CPU[i].Socket; //CPU[i].getAttribute("Signature");
        }
      }
    }
}
