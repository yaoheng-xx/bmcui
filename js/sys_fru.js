"use strict";
/* System Components page */

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

var Chassis_count = 0;
var ChassisDevice = [];
var devName;
var elementName;
var fru_count = 0;
var HSBP_count = 0;
var HSBPDevice = [];
var lang_setting;
var lang;
var Misc_count = 0;
var MiscDevice = [];
var PSU_count = 0;
var PSU_ready = 0;
var PSUDevice = [];
var Riser_count = 0;
var RiserDevice = [];
var total_length = 0;

function PageInit(){
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/sys_fru_info_hlp.html";
    document.getElementById("fru_title_div").textContent = lang.LANG_FRU_TITLE;
    var Chassis = document.getElementById("Chassis");
    var Chassis0 = document.getElementById("Chassis0");
    var Chassis1 = document.getElementById("Chassis1");
    var Chassis2 = document.getElementById("Chassis2");
    var Chassis3 = document.getElementById("Chassis3");
    var Chassis4 = document.getElementById("Chassis4");
    var Chassis5 = document.getElementById("Chassis5");
    var Chassis6 = document.getElementById("Chassis6");
    var Chassis7 = document.getElementById("Chassis7");
    var PSU = document.getElementById("PSU");
    var PSU0 = document.getElementById("PSU0");
    var PSU1 = document.getElementById("PSU1");
    var PSU2 = document.getElementById("PSU2");
    var PSU3 = document.getElementById("PSU3");
    var Riser = document.getElementById("Riser");
    var Riser0 = document.getElementById("Riser0");
    var Riser1 = document.getElementById("Riser1");
    var Riser2 = document.getElementById("Riser2");
    var Riser3 = document.getElementById("Riser3");
    var Riser4 = document.getElementById("Riser4");
    var Riser5 = document.getElementById("Riser5");
    var Riser6 = document.getElementById("Riser6");
    var Riser7 = document.getElementById("Riser7");
    var Riser8 = document.getElementById("Riser8");
    var Riser9 = document.getElementById("Riser9");
    var Riser10 = document.getElementById("Riser10");
    var Riser11 = document.getElementById("Riser11");
    var HSBP = document.getElementById("HSBP");
    var HSBP0 = document.getElementById("HSBP0");
    var HSBP1 = document.getElementById("HSBP1");
    var HSBP2 = document.getElementById("HSBP2");
    var HSBP3 = document.getElementById("HSBP3");
    var HSBP4 = document.getElementById("HSBP4");
    var HSBP5 = document.getElementById("HSBP5");
    var HSBP6 = document.getElementById("HSBP6");
    var HSBP7 = document.getElementById("HSBP7");
    var HSBP8 = document.getElementById("HSBP8");
    var HSBP9 = document.getElementById("HSBP9");
    var HSBP10 = document.getElementById("HSBP10");
    var HSBP11 = document.getElementById("HSBP11");
    var Misc = document.getElementById("Misc");
    var Misc0 = document.getElementById("Misc0");
    var Misc1 = document.getElementById("Misc1");
    var Misc2 = document.getElementById("Misc2");
    var Misc3 = document.getElementById("Misc3");
    var Misc4 = document.getElementById("Misc4");
    var Misc5 = document.getElementById("Misc5");
    var Misc6 = document.getElementById("Misc6");
    var Misc7 = document.getElementById("Misc7");
    var Misc8 = document.getElementById("Misc8");
    var Misc9 = document.getElementById("Misc9");
    var Misc10 = document.getElementById("Misc10");
    var Misc11 = document.getElementById("Misc11");

    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}

function PrivilegeCallBack(privilege)
{
    if (privilege == '02' || privilege == '03' || privilege == '04')
    {
        getFruDevice();
    }
    else{
        location.href = SubMainPage;
        return;
    }
}

function getFruDevice() {
  Loading(true);
  var ajax_url = '/redfish/v1/Chassis';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : function(response) {
      var data = JSON.parse(response.responseText);
      if (data.hasOwnProperty("Members")) {
        var MemberData = data.Members;
        total_length = MemberData.length;
        PSU_ready = 1;
        if (MemberData.length) {
          for (let i = 0; i < MemberData.length; i++) {
            getFRUInfo(MemberData[i]["@odata.id"]);
          }
          var tmpInterval = setInterval(function() {
            if (total_length == 0 && PSU_ready == 0) {
              clearInterval(tmpInterval);
              displaySysComp();
            }
          }, 500);
        } else {
          Loading(false);
        }
      }
    },
    onFailure : function() {
      Loading(false);
      alert("Error in Getting System Components Information!!");
    }
  });
}

function getFRUInfo(url) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    timeout : g_CGIRequestTimeout,
    ontimeout : onCGIRequestTimeout,
    onSuccess : ReplyFRUInfo,
    onFailure : function() {
      Loading(false);
      total_length--;
      alert("Error in Getting CPU Information!!");
    }
  });
}

function displaySysComp() {
  Loading(false);
  if(Chassis_count > 0){
    document.getElementById("Chassis").innerHTML =
    "<div id=\"chassis_group_title\" class=\"mtitle\"></div>";

    for(let i=0; i<Chassis_count; i++)
    {
        elementName = "Chassis" + i;
        devName = ChassisDevice[i].name;
        setBBInnerHtml(elementName, devName);
        document.getElementById("PartNo_Chassis" + "Chassis" + i).textContent = ChassisDevice[i].ChassisPN;
        document.getElementById("SerialNumber_Chassis" + "Chassis" + i).textContent = ChassisDevice[i].ChassisSN;
        document.getElementById("PartNo_Board" + "Chassis" + i).textContent = ChassisDevice[i].BoardPN;
        document.getElementById("SerialNumber_Board" + "Chassis" + i).textContent = ChassisDevice[i].BoardSN;
        document.getElementById("PartNo_Product" + "Chassis" + i).textContent = ChassisDevice[i].ProductPN;
        document.getElementById("SerialNumber_Product" + "Chassis" + i).textContent = ChassisDevice[i].ProductSN;
        document.getElementById("MfcName_" + "Chassis" + i).textContent = ChassisDevice[i].Manufacturer;
        document.getElementById("Model_" + "Chassis" + i).textContent = ChassisDevice[i].Model;
    }
    document.getElementById("chassis_group_title").textContent = lang.LANG_SYS_COMPONENT_CHASSIS;
  }

  if (PSU_count > 0) {
    document.getElementById("PSU").innerHTML =
    "<div id=\"psu_group_title\" class=\"mtitle\"></div>";

    for(let i=0; i<PSU_count; i++)
    {
        elementName = "PSU" + i;
        devName = PSUDevice[i].name;
        setInnerHtml(elementName, devName);
        document.getElementById("PartNo_" + "PSU" + i).textContent = PSUDevice[i].PartNumber;
        document.getElementById("SerialNumber_" + "PSU" + i).textContent = PSUDevice[i].SerialNumber;
        document.getElementById("MfcName_" + "PSU" + i).textContent = PSUDevice[i].Manufacturer;
        document.getElementById("Model_" + "PSU" + i).textContent = PSUDevice[i].Model;
    }
    document.getElementById("psu_group_title").textContent = lang.LANG_SYS_COMPONENT_PSU;
  }

  if (Riser_count > 0) {
    document.getElementById("Riser").innerHTML =
    "<div id=\"riser_group_title\" class=\"mtitle\"></div>";

    for(let i=0; i<Riser_count; i++)
    {
        elementName = "Riser" + i;
        devName = RiserDevice[i].name;
        setInnerHtml(elementName, devName);
        document.getElementById("PartNo_" + "Riser" + i).textContent = RiserDevice[i].PartNumber;
        document.getElementById("SerialNumber_" + "Riser" + i).textContent = RiserDevice[i].SerialNumber;
        document.getElementById("MfcName_" + "Riser" + i).textContent = RiserDevice[i].Manufacturer;
        document.getElementById("Model_" + "Riser" + i).textContent = RiserDevice[i].Model;
    }
    document.getElementById("riser_group_title").textContent = lang.LANG_SYS_COMPONENT_RISER;
  }

  if (HSBP_count > 0) {
    document.getElementById("HSBP").innerHTML =
    "<div id=\"hsbp_group_title\" class=\"mtitle\"></div>";

    for(let i=0; i<HSBP_count; i++)
    {
        elementName = "HSBP" + i;
        devName = HSBPDevice[i].name;
        setInnerHtml(elementName, devName);
        document.getElementById("PartNo_" + "HSBP" + i).textContent = HSBPDevice[i].PartNumber;
        document.getElementById("SerialNumber_" + "HSBP" + i).textContent = HSBPDevice[i].SerialNumber;
        document.getElementById("MfcName_" + "HSBP" + i).textContent = HSBPDevice[i].Manufacturer;
        document.getElementById("Model_" + "HSBP" + i).textContent = HSBPDevice[i].Model;
    }
    document.getElementById("hsbp_group_title").textContent = lang.LANG_SYS_COMPONENT_HSBP;
  }

  if (Misc_count > 0) {
    document.getElementById("Misc").innerHTML =
    "<div id=\"misc_group_title\" class=\"mtitle\"></div>";

    for(let i=0; i<Misc_count; i++)
    {
        elementName = "Misc" + i;
        devName = MiscDevice[i].name;
        setInnerHtml(elementName, devName);
        document.getElementById("PartNo_" + "Misc" + i).textContent = MiscDevice[i].PartNumber;
        document.getElementById("SerialNumber_" + "Misc" + i).textContent = MiscDevice[i].SerialNumber;
        document.getElementById("MfcName_" + "Misc" + i).textContent = MiscDevice[i].Manufacturer;
        document.getElementById("Model_" + "Misc" + i).textContent = MiscDevice[i].Model;
    }
    document.getElementById("misc_group_title").textContent = lang.LANG_SYS_COMPONENT_MISC;
  }
}

function setBBInnerHtml(elementName, devName) {
  document.getElementById(elementName).innerHTML =
  "<div align=\"left\" id=\"" + elementName + "\" class=\"fru_info\">" +
  "<fieldset class=\"wide_fru group\">" +
  "<legend class=\"legendcaption\">" + devName +
  "</legend>" +
  "<table>" +
  // Chassis PN
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" +
  lang.LANG_SYS_COMPONENT_CHASSIS_NUMBER + "</label></td>" +
  "<td><span id=\"PartNo_Chassis" + elementName  + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Chassis SN
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" + lang.LANG_SYS_COMPONENT_CHASSIS_SERIAL_NUMBER +
  "</label></td>" +
  "<td><span id=\"SerialNumber_Chassis" + elementName + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Board PN
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" +
  lang.LANG_SYS_COMPONENT_BOARD_NUMBER + "</label></td>" +
  "<td><span id=\"PartNo_Board" + elementName  + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Board SN
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" + lang.LANG_SYS_COMPONENT_BOARD_SERIAL_NUMBER +
  "</label></td>" +
  "<td><span id=\"SerialNumber_Board" + elementName + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Product PN
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" +
  lang.LANG_SYS_COMPONENT_PRODUCT_NUMBER + "</label></td>" +
  "<td><span id=\"PartNo_Product" + elementName  + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Product SN
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" + lang.LANG_SYS_COMPONENT_PRODUCT_SERIAL_NUMBER +
  "</label></td>" +
  "<td><span id=\"SerialNumber_Product" + elementName + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Manufacturer
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" + lang.LANG_SYS_COMPONENT_MFC_NAME +
  "</label></td>" +
  "<td><span id=\"MfcName_" + elementName +  "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Model
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" + lang.LANG_SYS_COMPONENT_MODEL +
  "</label></td>" +
  "<td><span id=\"Model_" + elementName + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  "</table>" +
  "</fieldset>" +
  "</div>";
}

function setInnerHtml(elementName, devName) {
  document.getElementById(elementName).innerHTML =
  "<div align=\"left\" id=\"" + elementName + "\" class=\"fru_info\">" +
  "<fieldset class=\"wide_fru group\">" +
  "<legend class=\"legendcaption\">" + devName +
  "</legend>" +
  "<table>" +
  // Product PN
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" +
  lang.LANG_SYS_COMPONENT_NUMBER + "</label></td>" +
  "<td><span id=\"PartNo_" + elementName  + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Product SN
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" + lang.LANG_SYS_COMPONENT_SERIAL_NUMBER +
  "</label></td>" +
  "<td><span id=\"SerialNumber_" + elementName + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Manufacturer
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" + lang.LANG_SYS_COMPONENT_MFC_NAME +
  "</label></td>" +
  "<td><span id=\"MfcName_" + elementName +  "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  // Model
  "<tr><td align=\"right\" class=\"bold\">" +
  "<label class=\"labeltitle\">" + lang.LANG_SYS_COMPONENT_MODEL +
  "</label></td>" +
  "<td><span id=\"Model_" + elementName + "\"" +
  " class=\"labeltext\"></span>" +
  "</td></tr>" +
  "</table>" +
  "</fieldset>" +
  "</div>";
}

function elementBB(name, BoardPN, BoardSN, ChassisPN, ChassisSN, ProductPN, ProductSN,
  Mfc, Model, ChassisType) {
  this.name = name;
  this.BoardPN = BoardPN;
  this.BoardSN = BoardSN;
  this.ChassisPN = ChassisPN;
  this.ChassisSN = ChassisSN;
  this.ProductPN = ProductPN;
  this.ProductSN = ProductSN;
  this.Manufacturer = Mfc;
  this.Model = Model;
  this.ChassisType = ChassisType;
}

function element(name, PartNumber, SerialNumber, Manufacturer, Model, ChassisType) {
  this.name = name;
  this.PartNumber = PartNumber;
  this.SerialNumber = SerialNumber;
  this.Manufacturer = Manufacturer;
  this.Model = Model;
  this.ChassisType = ChassisType;
}

function ReplyFRUInfo(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var res_data = JSON.parse(arg.responseText);
    var chassisPN = 'N/A';
    var chassisSN = 'N/A';
    var BoardPN = 'N/A';
    var BoardSN = 'N/A';
    var ProductPN = 'N/A';
    var ProductSN = 'N/A';
    var device_name = res_data["@odata.id"].split('/').pop();
    if(device_name.includes("Baseboard"))
    {
      if (res_data.hasOwnProperty("Oem")) {
        if (res_data.Oem.hasOwnProperty("FRUUpdatableProperties")) {
          var fruInfo = res_data.Oem.FRUUpdatableProperties;
          if (fruInfo.hasOwnProperty("Board")) {
            BoardPN = fruInfo.Board.BoardPartNumber;
            BoardSN = fruInfo.Board.BoardSerialNumber;
          }
          if (fruInfo.hasOwnProperty("Chassis")) {
            chassisPN = fruInfo.Chassis.ChassisPartNumber;
            chassisSN = fruInfo.Chassis.ChassisSerialNumber;
          }
          if (fruInfo.hasOwnProperty("Product")) {
            ProductPN = fruInfo.Product.ProductPartNumber;
            ProductSN = fruInfo.Product.ProductSerialNumber;
          }
        }
      }

      ChassisDevice.push(new elementBB(device_name, BoardPN, BoardSN, chassisPN, chassisSN,
        ProductPN, ProductSN, res_data.Manufacturer, res_data.Model, res_data.ChassisType));
      Chassis_count++;

      if (res_data.hasOwnProperty("Power")) {
        getPSUInfoURL(res_data.Power["@odata.id"]);
      }
    } else if (device_name.toLowerCase().includes("riser")) {
      RiserDevice.push(new element(device_name, res_data.PartNumber, res_data.SerialNumber,
        res_data.Manufacturer, res_data.Model, res_data.ChassisType));
      Riser_count++;
    } else if (device_name.includes("HSBP")) {
      HSBPDevice.push(new element(device_name, res_data.PartNumber, res_data.SerialNumber,
        res_data.Manufacturer, res_data.Model, res_data.ChassisType));
      HSBP_count++;
    } else if (device_name.includes("Chassis")) {
      //Chassis info is included in Baseboard
    } else if (device_name.toLowerCase().includes("nvme")) {
    } else {
      MiscDevice.push(new element(device_name, res_data.PartNumber, res_data.SerialNumber,
        res_data.Manufacturer, res_data.Model, res_data.ChassisType));
      Misc_count++;
    }
    total_length--;
  }
}

function getPSUInfoURL(url) {
  Loading(true);
  var myAjax = new Ajax.Request(url, {
    method : 'GET',
    onSuccess : function(data) {
      var response = JSON.parse(data.responseText);
      if (response.hasOwnProperty("PowerSupplies")) {
        var PSUData = response.PowerSupplies;
        if (PSUData.length) {
          var PSUType = 'PowerSupply';
          for (var i = 0; i < PSUData.length; i++) {
            PSUDevice.push(new element(PSUData[i].Name, PSUData[i].PartNumber, PSUData[i].SerialNumber,
              PSUData[i].Manufacturer, PSUData[i].Model, PSUType));
            PSU_count++;
          }
        } else {
          Loading(false);
        }
      }
      PSU_ready = 0;
    },
    onFailure : function() {
      Loading(false);
      PSU_ready = 0;
      alert("Error in Getting CPU Information!!");
    }
  });
}
