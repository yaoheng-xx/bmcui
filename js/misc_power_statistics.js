/*Miscellaneous power statistics page*/

var GridTable;
var GridTable2;
var GridTable3;
//WKP use AP CPU, if the platform is WKP, there are shared fans and PDB.
var isAPCPU = 0;
var RowData = [];
var RowData2 = [];
var RowData3 = [];
var gCount = 0;
var totalWatt = 0;
var TableTitles = [
  [ "Subsystem", "20%", "center" ], [ "Current", "10%", "center" ],
  [ "Average", "10%", "center" ], [ "Maximum", "10%", "center" ],
  [ "Minimum", "10%", "center" ], [ "Timestamp", "20%", "center" ],
  [ "Period", "20%", "center" ]
];
//replace table header content with string table
TableTitles[0][0] = lang.LANG_MISC_POWER_COLUMN_TITLE0;
TableTitles[1][0] = lang.LANG_MISC_POWER_COLUMN_TITLE1_CPC;
TableTitles[2][0] = lang.LANG_MISC_POWER_COLUMN_TITLE2;
TableTitles[3][0] = lang.LANG_MISC_POWER_COLUMN_TITLE3;
TableTitles[4][0] = lang.LANG_MISC_POWER_COLUMN_TITLE4;
TableTitles[5][0] = lang.LANG_MISC_POWER_COLUMN_TITLE5;
TableTitles[6][0] = lang.LANG_MISC_POWER_COLUMN_TITLE6;

//This table is used to display component power.
var Table2Titles =
    [ [ "ComponentPower", "50%", "center" ], [ "Current", "50%", "center" ] ];
//replace table header content with string table
Table2Titles[0][0] = lang.LANG_MISC_COMPONENT_POWER;
Table2Titles[1][0] = lang.LANG_MISC_POWER_COLUMN_TITLE1;

//This table is used to display PIN.
var Table3Titles = [
  [ "PowerSupplyInput", "50%", "center" ],
  [ "CurrentPowerConsumption", "50%", "center" ]
];
//replace table header content with string table
Table3Titles[0][0] = lang.LANG_MISC_POWER_SUPPLY_INPUT;
Table3Titles[1][0] = lang.LANG_MISC_POWER_COLUMN_TITLE1_CPC;

var PowerCurReading = new Array(9);

window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit(){
    //check if the platfrom is WKP.
    //getCPUType();

    PowerTableInit();
    document.getElementById("caption_div").textContent = lang.LANG_MISC_POWER_STATISTICS;
    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);
}

function pageInit2(originalRequest)
{

    if(originalRequest.readyState == 4 && originalRequest.status == 200) {
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc=GetResponseXML(response);
        if (xmldoc != null) {
            var cputType = GetXMLNodeValue(xmldoc, "CPU_TYPE");
            if (cputType == "1") {
                isAPCPU = 1;
            }
        }
        PowerTableInit();
        document.getElementById("caption_div").textContent = lang.LANG_MISC_POWER_STATISTICS;
        //check user Privilege
        CheckUserPrivilege(PrivilegeCallBack);
    }

}

function PowerTableInit(){
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/misc_power_statistics_hlp.html";
    PowerTable = document.getElementById("HtmlPowerTable");
    GridTable = GetTableElement();
    GridTable.setColumns(TableTitles);
    GridTable.init('GridTable', PowerTable, "120px", {noSort : true});
    PowerTable3 = document.getElementById("HtmlPowerTable3");
    GridTable3 = GetTableElement();
    GridTable3.setColumns(Table3Titles);
    GridTable3.init('GridTable3', PowerTable3, "120px", {noSort : true});
    PowerTable3.style.width = "50%";

    if (isAPCPU) {
        PowerTable2 = document.getElementById("HtmlPowerTable2");
        GridTable2 = GetTableElement();
        GridTable2.setColumns(Table2Titles);
        GridTable2.init('GridTable2', PowerTable2, "150px");
        PowerTable2.style.width = "50%";
    }
}

function PrivilegeCallBack(Privilege)
{
    //full access
    if (Privilege == '04') {
      GetPowerConsumption();
      getComponentPwr();
    } else {
        //no access
        location.href = SubMainPage;
        return;
    }
}

function GetPowerConsumption()
{
    Loading(true);
    var ajax_url = '/redfish/v1/NmService';
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        onSuccess: ShowPowerConsumption,
        onFailure: function(){
            Loading(false);
            alert("Error in Getting Power Statics!!");
        }
    });
}
function ShowPowerConsumption(originalRequest)
{
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
      var content = JSON.parse(originalRequest.responseText);
      var i = 0;

      if (content.hasOwnProperty("Domains")) {
        var PStatic_Data = content.Domains;
        for (i = 0; i < PStatic_Data.length; i++) {
          if (PStatic_Data[i].hasOwnProperty("Power")) {
            var id = PStatic_Data[i]["@odata.id"].split('/').pop();
            var t_date = PStatic_Data[i].Power[4] * 1000;
            var offset_date = (new Date().getTimezoneOffset() * 60) * 1000;
            var date_to_show = t_date + offset_date;
            var time_stamp =
                new Date(date_to_show).toString().split(" ").splice(0, 5);
            RowData.push([
              id, PStatic_Data[i].Id.replace(/([A-Z])/g, ' $1').trim(),
              PStatic_Data[i].Power[0], PStatic_Data[i].Power[3],
              PStatic_Data[i].Power[1], PStatic_Data[i].Power[2], time_stamp,
              secondsToString(parseInt(PStatic_Data[i].Power[5]))
            ]);

            GridTable.empty();
            GridTable.show(RowData);
          }
        }
      }
    }
}

function displayTimestamp(timestamp){
	var selDateObj = new Date(timestamp*1000).toString().split(" ").splice(0, 5);
var time = selDateObj.slice(0, -2).join(" ") +" "+ selDateObj[4] +" "+ selDateObj[3];//Base64.decode(SEL[i].getAttribute(prop));
return time;
}

function secondsToString(seconds){
    var numdays = Math.floor(seconds / 86400);
    var numhours = Math.floor((seconds % 86400) / 3600);
    var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
    var numseconds = ((seconds % 86400) % 3600) % 60;
    if(numdays != 0)
        return numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
    else if(numhours != 0)
        return numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
    else if(numminutes != 0)
        return numminutes + " minutes " + numseconds + " seconds";
    else
        return numseconds + " seconds";
}

function getComponentPwr() {
  Loading(true);
  GridTable3.empty();
  var ajax_url = '/redfish/v1/Chassis';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : function(response) {
      if (response.readyState == 4 && response.status == 200) {
        var org = JSON.parse(response.responseText);
        var URL_data = org.Members;
        gCount = URL_data.length;
        for (var i = 0; i < URL_data.length; i++) {
          if (URL_data[i].hasOwnProperty("@odata.id") &&
              URL_data[i]["@odata.id"].indexOf("_Baseboard") != -1) {
            getComponentPwr_data(URL_data[i]["@odata.id"]);
          } else {
            gCount--;
          }
        }
      }
    },
    onFailure : function() {
      Loading(false);
      alert("Error in Getting Power Components!!");
    }
  });
}
function getComponentPwr_data(url) {
  var ajax_req = new Ajax.Request(url, {
    method : 'GET',
    onSuccess : function(res) {
      var response = JSON.parse(res.responseText);
      if (response.hasOwnProperty("Power")) {
        var PowerDataURL = response.Power["@odata.id"];
        new Ajax.Request(PowerDataURL, {
          method : 'GET',
          onSuccess : showComponentPwr,
          onFailure : function() { gCount--; }
        });
      } else {
        gCount--;
      }
    },
    onFailure : function() {
      Loading(false);
      alert("Error in Getting Power Components!!");
    }
  });
}
function showComponentPwr(originalRequest)
{
    Loading(false);
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
      var response = JSON.parse(originalRequest.responseText);
      if (response == null) {
        SessionTimeout();
        return;
      }
      if (response.hasOwnProperty("PowerSupplies")) {
        var power_supply_data = response.PowerSupplies;
        for (var i = 0; i < power_supply_data.length; i++) {
          var id = power_supply_data[i]["@odata.id"].split("/").pop();
          RowData3.push([
            id, power_supply_data[i].Name, power_supply_data[i].PowerInputWatts
          ]);
          totalWatt += power_supply_data[i].PowerInputWatts;
        }
      }
      gCount--;
      if (gCount == 0) {
        var totalWattId = RowData3.length;
        RowData3.push([ totalWattId + 1, "Total Input Power", totalWatt ]);
        GridTable3.show(RowData3);
      }
    }
}
