"use strict";
/* Server Health sensor reading page  */
var autoRefreshObj;
var autoSec;
var beforeSort = true;
var buttonChassisIntrusionObj;
var buttonRefreshObj;
var buttonThresholdObj;
var defaultSec = 60;
var gCount = 0;
var gIdx = 0;
var gridHtable;
var gridTable;
var lang;
var maxSensorTableColumn = 11;
var maxSensorTableRow = 255;
var pickform;
var refreshReading;
var selectedSensorType = 0;
var sensorCategoryObj;
var sensorChartPage = '/page/servh_sensor_reading.html'
var sensorInfo = new Array();
var sensorNumberTableColumn = 11;
var sensorRecordNum = 0;
var sensorTableArray = new Array();
var sensorTableExtraInfoObj;
var sensorTypeObj;
var sortColumn = 0;
var sortReverse = true;
var sTypeTableColumn = maxSensorTableColumn - 1;
var thresholdFlag = 0;
var timeoutID = undefined;
var timeoutSetting = 0;
window.addEventListener('load', pageInit);
if (parent.lang) { lang = parent.lang; }
function pageInit() {
  refreshReading = document.getElementById("RefreshReading");
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/servh_sensor_hlp.html";
  outputString();
  pickform = document.getElementById('pickform');
  sensorCategoryObj = document.getElementById("SensorCategory");
  sensorCategoryObj.onchange = function() {
    selectedSensorType = sensorCategoryObj.value;
    reloadSensorTbl();
  };
  buttonRefreshObj = document.getElementById("btn_Refresh");
  buttonRefreshObj.value = lang.LANG_SENSOR_REFRESH;
  buttonRefreshObj.onclick = function() { getSensors(); };
  buttonThresholdObj = document.getElementById("btn_ShowThreshold");
  buttonThresholdObj.value = lang.LANG_SENSOR_SHOWTHRESHOLD;
  buttonThresholdObj.onclick = function() {
    if (thresholdFlag == 0) {
      thresholdFlag = 1;
      gridTableInit(1);
      reloadSensorTbl();
      buttonThresholdObj.value = lang.LANG_SENSOR_HIDETHRESHOLD;
    } else {
      thresholdFlag = 0;
      gridTableInit(0);
      reloadSensorTbl();
      buttonThresholdObj.value = lang.LANG_SENSOR_SHOWTHRESHOLD;
    }
  };
  buttonChassisIntrusionObj = document.getElementById('btn_ChassisIntrusion');
  buttonChassisIntrusionObj.setAttribute("value", lang.LANG_SENSOR_CHASSISINTR);
  buttonChassisIntrusionObj.style.visibility = 'hidden';
  buttonChassisIntrusionObj.onclick = function() {};
  sensorTableExtraInfoObj = document.getElementById("HtmlSensorTableInfo");
  autoRefreshObj = document.getElementById("autorefresh");
  if (browser_ie) {
    autoRefreshObj.add(new Option('5', 5), 0);
    autoRefreshObj.add(new Option('10', 10), 1);
    autoRefreshObj.add(new Option('15', 15), 2);
    autoRefreshObj.add(new Option('30', 30), 3);
    autoRefreshObj.add(new Option('60', 60), 4);
    autoRefreshObj.add(new Option('150', 150), 5);
    autoRefreshObj.add(new Option('300', 300), 6);
    autoRefreshObj.add(new Option(lang.LANG_SENSOR_NEVER, 255), 7);
  } else {
    autoRefreshObj.add(new Option('5', 5), null);
    autoRefreshObj.add(new Option('10', 10), null);
    autoRefreshObj.add(new Option('15', 15), null);
    autoRefreshObj.add(new Option('30', 30), null);
    autoRefreshObj.add(new Option('60', 60), null);
    autoRefreshObj.add(new Option('150', 150), null);
    autoRefreshObj.add(new Option('300', 300), null);
    autoRefreshObj.add(new Option(lang.LANG_SENSOR_NEVER, 255), null);
  }
  autoSec = ReadCookie("AutoRefreshSecSensor");
  if (!autoSec) {
    CreateCookie("AutoRefreshSecSensor", defaultSec);
    autoSec = defaultSec;
  }
  autoRefreshObj.value = autoSec;
  refreshReading.textContent =
      lang.LANG_SENSOR_REFRESH_MESSAGE.replace("{number}", autoSec);
  autoRefreshObj.onchange = function() {
    autoSec = autoRefreshObj.value;
    CreateCookie("AutoRefreshSecSensor", autoSec);
    resetAutoTimer();
  };
  // check user Privilege
  CheckUserPrivilege(privilegeCallBack);
}
function outputString() {
  document.getElementById("sensor_caption_div").textContent =
      lang.LANG_SENSOR_CAPTION;
  document.getElementById("sensor_type_td").textContent =
      lang.LANG_SENSOR_SNRTYPE;
  document.getElementById("sensor_refsec_td").textContent =
      lang.LANG_SENSOR_REFSEC;
}
function sensorTableArrayInit() {
  for (var i = 0; i < maxSensorTableRow; i++)
    sensorTableArray[i] = new Array(maxSensorTableColumn + 1);
  for (var i = 0; i < maxSensorTableRow; i++)
    for (var j = 0; j < (maxSensorTableColumn + 1); j++)
      sensorTableArray[i][j] = "N/A";
}
function reloadSensorTbl() {
  var sensorCount = 0;
  var j = 0;
  var sensorData = [];
  gridTable.empty();
  for (var j = 0; j < sensorRecordNum; j++) {
    if ((sensorTableArray[j][sTypeTableColumn] == sensorCategoryObj.value) ||
        (sensorCategoryObj.value == 0) ||
        (sensorCategoryObj.value == 0xc0 &&
         sensorTableArray[j][sTypeTableColumn] >= 0xc0 &&
         sensorTableArray[j][sTypeTableColumn] <= 0xff)) {
      if (thresholdFlag == 1) {
        sensorData.push([
          j + 1, sensorTableArray[j][9], sensorTableArray[j][0],
          sensorTableArray[j][1], sensorTableArray[j][2],
          sensorTableArray[j][3], sensorTableArray[j][4],
          sensorTableArray[j][5], sensorTableArray[j][6],
          sensorTableArray[j][7], sensorTableArray[j][8]
        ]);
      } else {
        sensorData.push([
          j + 1, sensorTableArray[j][9], sensorTableArray[j][0],
          sensorTableArray[j][1], sensorTableArray[j][2]
        ]);
      }
      sensorCount++;
    }
  }
  gridTable.show(sensorData);
  if (sortColumn > 0 && sortColumn < 11) {
    beforeSort = sortReverse;
    gridTable.sortOnColumn(sortColumn);
    if (sortReverse != beforeSort) {
      gridTable.sortOnColumn(sortColumn);
    }
  }
  sensorTableExtraInfoObj.textContent =
      lang.LANG_SENSOR_SNRNUMBER + sensorCount + lang.LANG_SENSOR_SNRUNIT;
}
function gridTableInit(extraInfo) {
  // Grid table Init
  if (gridHtable != null)
    gridHtable.empty(1);
  if (gridTable != null)
    gridTable.empty(1);
  var sensorHeader = document.getElementById("HtmlSensorHeader");
  var sensorTable = document.getElementById("HtmlSensorTable");
  gridHtable = GetTableElement();
  gridTable = GetTableElement();
  SetRowSelectEnable(1);
  if (extraInfo == 1) {
    var sensorsTblTitle = [
      [ "Healthy", "1px", "left" ], [ "Name", "10%", "center", "245px" ],
      [ "Status", "15%", "center", "100px" ],
      [ "Reading", "15%", "left", "150px" ], [ "Low NR", "10%", "center" ],
      [ "Low CT", "10%", "center" ], [ "Low NC", "10%", "center" ],
      [ "High NC", "10%", "center" ], [ "High CT", "10%", "center" ],
      [ "High NR", "10%", "center" ]
    ];
    // replace table header content with string table
    sensorsTblTitle[0][0] = lang.LANG_SENSOR_TABLE_HEADTITLE0;
    sensorsTblTitle[1][0] = lang.LANG_SENSOR_TABLE_HEADTITLE1;
    sensorsTblTitle[2][0] = lang.LANG_SENSOR_TABLE_HEADTITLE2;
    sensorsTblTitle[3][0] = lang.LANG_SENSOR_TABLE_HEADTITLE3;
    sensorsTblTitle[4][0] = lang.LANG_SENSOR_TABLE_HEADTITLE4;
    sensorsTblTitle[5][0] = lang.LANG_SENSOR_TABLE_HEADTITLE5;
    sensorsTblTitle[6][0] = lang.LANG_SENSOR_TABLE_HEADTITLE6;
    sensorsTblTitle[7][0] = lang.LANG_SENSOR_TABLE_HEADTITLE7;
    sensorsTblTitle[8][0] = lang.LANG_SENSOR_TABLE_HEADTITLE8;
    sensorsTblTitle[9][0] = lang.LANG_SENSOR_TABLE_HEADTITLE9;
  } else {
    var sensorsTblTitle = [
      [ "Healthy", "1px", "left" ], [ "Name", "20%", "center" ],
      [ "Status", "50%", "center" ], [ "Reading", "30%", "left" ]
    ];
    // replace table header content with string table
    sensorsTblTitle[0][0] = lang.LANG_SENSOR_TABLE_HEADTITLE0;
    sensorsTblTitle[1][0] = lang.LANG_SENSOR_TABLE_HEADTITLE1;
    sensorsTblTitle[2][0] = lang.LANG_SENSOR_TABLE_HEADTITLE2;
    sensorsTblTitle[3][0] = lang.LANG_SENSOR_TABLE_HEADTITLE3;
  }
  gridHtable.setColumns(sensorsTblTitle);
  gridTable.setColumns(sensorsTblTitle);
  gridHtable.init_header('GridTable', sensorHeader);
  gridTable.init_body('GridTable', sensorTable);
  sensorTable.onclick = showSensorChart;
}
function showSensorChart() {
  var selectedSensorName = GetSelectedRowCellInnerHTML(1);
  var sensorDetail = "";
  var parameters = "";
  for (var i = 0; i < sensorInfo.length; i++) {
    if (sensorInfo[i].name == selectedSensorName) {
      sensorDetail = sensorInfo[i].name + "-" + sensorInfo[i].SensorType + ":" +
                     sensorInfo[i].org_name + "@" +
                     sensorInfo[i].sensorHistoryLink;
      parameters = "?sensorDetail=" + sensorDetail;
      break;
    }
  }
  location.href = sensorChartPage + parameters;
}
function privilegeCallBack(privilege) {
  if (privilege == '02' || privilege == '03' || privilege == '04') {
    thresholdFlag = 0;
    gridTableInit(0);
    getSensors();
  } else {
    location.href = SubMainPage;
    return;
  }
}
//For Sensor APIs
function showSensorCategory(sensorRecNum, selectSensorType) {
  var sensorType;
  var i;
  var j;
  var index = 0;
  if (0xC0 <= selectSensorType && selectSensorType <= 0xFF) {
    selectSensorType = 0xC0;
  }
  if (sensorCategoryObj.length == 0) {
    sensorCategoryObj.add(new Option(lang.LANG_SENSOR_SNRTYPE0, 0),
                          browser_ie ? index++ : null);
  } else {
    index = 1;
  }
  while (sensorCategoryObj.options[1]) {
    sensorCategoryObj.options.remove(1);
  }
  for (var i = 0; i < sensorRecNum; i++) {
    sensorType = sensorTableArray[i][sTypeTableColumn];
    if (0xC0 <= sensorType && sensorType <= 0xFF) {
      sensorType = 0xC0;
    }
    j = 1;
    while (sensorCategoryObj.options[j] &&
           sensorCategoryObj.options[j].value != sensorType) {
      j += 1;
    }
    if (j < sensorCategoryObj.length)
      continue;
    var option = new Option(sensorType);
    sensorCategoryObj.add(option, browser_ie ? index : null);
    if (selectSensorType == sensorType) {
      sensorCategoryObj.selectedIndex = index;
    }
    index += 1;
  }
}
function cleanAutoTimer() {
  if (timeoutID != undefined) {
    clearTimeout(timeoutID);
    timeoutID = undefined;
  }
}
function resetAutoTimer() {
  if (autoSec != 255 && timeoutSetting == 0) {
    cleanAutoTimer();
    timeoutID = setTimeout(getSensors, autoSec * 1000);
    refreshReading.textContent =
        lang.LANG_SENSOR_REFRESH_MESSAGE.replace("{number}", autoSec);
  } else {
    cleanAutoTimer();
    refreshReading.textContent = lang.LANG_SENSOR_REFRESH_ERROR;
  }
}
function disableButtons(disabled) {
  buttonChassisIntrusionObj.disabled = disabled;
  sensorCategoryObj.disabled = disabled;
  buttonRefreshObj.disabled = disabled;
  buttonThresholdObj.disabled = disabled;
  autoRefreshObj.disabled = disabled;
}
function onGetSensorTimeout() {
  Loading(true, lang.LANG_COMMON_REQUEST_TIMEOUT);
  resetAutoTimer();
}
function getSensors() {
  gIdx = 0;
  Loading(true);
  cleanAutoTimer();
  disableButtons(true);
  var ajax_url = '/redfish/v1/Chassis';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    timeout : 30000,
    ontimeout : onGetSensorTimeout,
    onSuccess : function(response) {
      var data = JSON.parse(response.responseText);
      var membersData = data.Members;
      for (var i = 0; i < membersData.length; i++) {
        getSensorUrlDetailsFromMembersData(membersData[i]["@odata.id"]);
      }
    },
  });
}
function getSensorUrlDetailsFromMembersData(url) {
  var ajax_req = new Ajax.Request(url, {
    method : 'GET',
    timeout : 30000,
    ontimeout : onGetSensorTimeout,
    onSuccess : function(response) {
      var mData = JSON.parse(response.responseText);
      if (mData.hasOwnProperty('Sensors')) {
        var url = mData.Sensors["@odata.id"];
        getAvailableData(url);
      }
      if (mData.hasOwnProperty("Thermal")) {
        var tUrl = mData.Thermal["@odata.id"];
        getAvailableData(tUrl);
      }
      if (mData.hasOwnProperty("Power")) {
        var pUrl = mData.Power["@odata.id"];
        getAvailableData(pUrl);
      }
    }
  });
}
function getAvailableData(url) {
  new Ajax.Request(url, {
    method : 'GET',
    timeout : 30000,
    ontimeout : onGetSensorTimeout,
    onSuccess : getSensorDetailsURL
  });
}
function getSensorDetailsURL(response) {
  sensorRecordNum = 0;
  sensorTableArrayInit();
  var data = JSON.parse(response.responseText);
  if (data.hasOwnProperty("Voltages")) {
    gCount += data.Voltages.length;
    var volSensorArr = data.Voltages;
    for (var i = 0; i < volSensorArr.length; i++) {
      if((volSensorArr[i].Name.indexOf("PSU") != -1) &&
        (volSensorArr[i]["@odata.id"].indexOf("_Baseboard") == -1)){
          gCount --;
          continue;
        }
        handleServerSensorsResponse(volSensorArr[i], "Voltages");
    }
  }
  if (data.hasOwnProperty("Temperatures")) {
    gCount += data.Temperatures.length;
    var tempratureSensorArr = data.Temperatures;
    for (var i = 0; i < tempratureSensorArr.length; i++) {
      if((tempratureSensorArr[i].Name.indexOf("PSU") != -1) &&
        (tempratureSensorArr[i]["@odata.id"].indexOf("_Baseboard") == -1)){
          gCount --;
          continue;
        }
        handleServerSensorsResponse(tempratureSensorArr[i], "Temperatures");
    }
  }
  if (data.hasOwnProperty("Fans")) {
    gCount += data.Fans.length;
    var fanSensorArr = data.Fans;
    for (var i = 0; i < fanSensorArr.length; i++) {
      if((fanSensorArr[i].Name.indexOf("PSU") != -1) &&
        (fanSensorArr[i]["@odata.id"].indexOf("_Baseboard") == -1)){
          gCount --;
          continue;
        }
        handleServerSensorsResponse(fanSensorArr[i], "Fan");
    }
  }
  if (data.hasOwnProperty("Members")) {
    var sensorUrlArr = data.Members;
    if (sensorUrlArr.length > 0) {
      gCount += data.Members.length;
      for (var i = 0; i < sensorUrlArr.length; i++) {
        if((sensorUrlArr[i]["@odata.id"].indexOf("PSU") != -1) &&
          (sensorUrlArr[i]["@odata.id"].indexOf("_Baseboard")) == -1){
            gCount --;
            continue;
          }
          getSensorDetails(sensorUrlArr[i]["@odata.id"]);
      }
    }
  }
}
function getSensorDetails(url) {
  var ajax_req = new Ajax.Request(url, {
    method : 'GET',
    timeout : 30000,
    ontimeout : onGetSensorTimeout,
    onSuccess : function(data) {
      var sData = JSON.parse(data.responseText);
        handleServerSensorsResponse(sData, "System");
    }
  });
}
function getSensorStatus(reading) {
  var severityText = '';
  if (reading.Health == "OK") {
    severityText = 'normal';
  }
  if (reading.Health == "Warning") {
    severityText = 'warning';
  }
  if (reading.Health == "Critical") {
    severityText = 'critical';
  }
  if (reading.Health == "Unknown") {
    severityText = lang.LANG_SENSOR_STATUS_NOT_AVAILABLE;
  }
  return {severityText : severityText};
}
function check_data(data, val, units) {
  if (data.hasOwnProperty(val) && (data[val] || data[val] == 0)) {
    if (units) {
      return data[val] + units;
    } else {
      return data[val];
    }
  } else {
    return "NA";
  }
}
function handleServerSensorsResponse(data, type) {
  sensorInfo[gIdx] = data;
  sensorInfo[gIdx]["name"] = data.Name;
  sensorInfo[gIdx]["org_name"] = data["@odata.id"];
  sensorInfo[gIdx]["Available"] = data.Status.State == "Enabled" ? true : false;
  sensorInfo[gIdx]["Health"] = data.Status.Health;
  sensorInfo[gIdx]["sensorHistoryLink"] = "";
  if (data.hasOwnProperty('RelatedItem')) {
    if (data.RelatedItem.length) {
      for (var i = 0; i < data.RelatedItem.length; i++) {
        if (data.RelatedItem[i]['@odata.id'].indexOf('SensorHistory') != -1) {
          sensorInfo[gIdx]["sensorHistoryLink"] =
              data.RelatedItem[i]["@odata.id"];
        }
      }
    }
  }
  if (type == "Voltages") {
    sensorInfo[gIdx]["Value"] = check_data(data, "ReadingVolts", " Volts");
  }
  if (type == "Temperatures") {
    sensorInfo[gIdx]["Value"] = check_data(data, "ReadingCelsius", " °C");
  }
  if (type == "Fan") {
    if (data.Status.State == "Absent") {
        sensorInfo[gIdx]["Health"] = lang.LANG_SENSOR_HEALTH_UNKNOWN;
        sensorInfo[gIdx]["Value"] = lang.LANG_SENSOR_READING_NA;
    }
    else {
        sensorInfo[gIdx]["Value"] =
            check_data(data, "Reading", " " + data.ReadingUnits);
    }
  }
  if (type == 'System') {
    var sVal = data.hasOwnProperty("ReadingUnits")
                   ? data.Reading + " " + data.ReadingUnits
                   : data.Reading;
    sensorInfo[gIdx]["Value"] = sVal ? sVal : 'NA';
    sensorInfo[gIdx]["SensorType"] =
        data.ReadingType == "Percent" ? "utilization" : data.ReadingType;
  }
  if (type != 'System') {
    sensorInfo[gIdx]["SensorType"] = type;
    sensorInfo[gIdx]["WarningHigh"] =
        check_data(data, "UpperThresholdNonCritical");
    sensorInfo[gIdx]["CriticalHigh"] =
        check_data(data, "UpperThresholdCritical");
    sensorInfo[gIdx]["CriticalLow"] =
        check_data(data, "LowerThresholdCritical");
    sensorInfo[gIdx]["WarningLow"] =
        check_data(data, "LowerThresholdNonCritical");
  }
  if (data.hasOwnProperty('Thresholds')) {
    if (data.Thresholds.hasOwnProperty('UpperCritical')) {
      sensorInfo[gIdx]["CriticalHigh"] =
          check_data(data.Thresholds.UpperCritical, "Reading");
    }
    if (data.Thresholds.hasOwnProperty('UpperCaution')) {
      sensorInfo[gIdx]["WarningHigh"] =
          check_data(data.Thresholds.UpperCaution, "Reading");
    }
    if (data.Thresholds.hasOwnProperty('LowerCritical')) {
      sensorInfo[gIdx]["CriticalLow"] =
          check_data(data.Thresholds.LowerCritical, "Reading");
    }
    if (data.Thresholds.hasOwnProperty('LowerCaution')) {
      sensorInfo[gIdx]["WarningLow"] =
          check_data(data.Thresholds.LowerCaution, "Reading");
    }
  }
  gIdx++;
  gCount--;
  if (gCount == 0) {
    handleServerSensorsResp(sensorInfo);
  }
}
function handleServerSensorsResp() {
  disableButtons(false);
  Loading(false);
  sensorRecordNum = 0;
  sensorTableArrayInit();
  if (sensorInfo.length > 0) {
    sensorRecordNum = 0;
    sensorTableArrayInit();
    // threshold sensors
    for (var i = 0; i < sensorInfo.length; i++) {
      if (sensorInfo[i].Available == 0x01 || sensorInfo[i].Available == false) {
        var Idx;
        var sensorType = sensorInfo[i].SensorType;
        var sensorName = sensorInfo[i].name;
        let sensorNumber = i;
        for (var j = 0, Idx = 0; j < maxSensorTableRow; j++) {
          if (sensorTableArray[j][0] == "N/A") {
            Idx = j;
            break;
          }
        }
        sensorTableArray[Idx][0] = sensorName;
        sensorTableArray[Idx][sTypeTableColumn] = sensorType;
        sensorTableArray[Idx][sensorNumberTableColumn] = sensorNumber;
        sensorRecordNum++;
        procThreshlodSensor(sensorInfo, Idx, i);
      }
    }
    showSensorCategory(sensorRecordNum, selectedSensorType);
    if (!sensorRecordNum) {
      cleanAutoTimer();
      alert(lang.LANG_SENSOR_NOSNRSTR,
            {onClose : function() { resetAutoTimer(); }});
      sensorTableExtraInfoObj.textContent = lang.LANG_SENSOR_SNRNUMBER +
                                            (sensorRecordNum) +
                                            lang.LANG_SENSOR_SNRUNIT;
      if (thresholdFlag == 0)
        gridTableInit(0);
      else
        gridTableInit(1);
      return;
    }
    // sync buttonThresholdObj
    if (thresholdFlag == 0) {
      thresholdFlag = 0;
      buttonThresholdObj.value = lang.LANG_SENSOR_SHOWTHRESHOLD;
    } else {
      thresholdFlag = 1;
      buttonThresholdObj.value = lang.LANG_SENSOR_HIDETHRESHOLD;
    }
    reloadSensorTbl();
    resetAutoTimer();
  }
}
function procThreshlodSensor(node, Idx, i) {
  var severity = getSensorStatus(node[i]);
  var colorNode;
  switch (severity.severityText) {
  case "critical":
    colorNode = "red";
    break;
  case "warning":
    colorNode = "yellow";
    break;
  case "normal":
    colorNode = "green";
    break;
  default:
    colorNode = "white";
    break;
  }
  if (node[i].Value == null) {
    sensorTableArray[Idx][1] = severity.severityText.charAt(0).toUpperCase() +
                               severity.severityText.slice(1);
    sensorTableArray[Idx][2] = node[i].Value;
    sensorTableArray[Idx][9] = "bgcolor=white";
    return;
  } else {
    sensorTableArray[Idx][1] = severity.severityText.charAt(0).toUpperCase() +
                               severity.severityText.slice(1);
    sensorTableArray[Idx][2] = node[i].Value;
    sensorTableArray[Idx][9] = "bgcolor=" + colorNode;
  }
  if (typeof (sensorTableArray) == 'object') {
    sensorTableArray[Idx][3] = "N/A";
    if (typeof node[i].CriticalLow == "number") {
      sensorTableArray[Idx][4] = node[i].CriticalLow;
    } else {
      sensorTableArray[Idx][4] = "N/A";
    }
    if (typeof node[i].WarningLow == "number") {
      sensorTableArray[Idx][5] = node[i].WarningLow;
    } else {
      sensorTableArray[Idx][5] = "N/A";
    }
    if (typeof node[i].WarningHigh == "number") {
      sensorTableArray[Idx][6] = node[i].WarningHigh;
    } else {
      sensorTableArray[Idx][6] = "N/A";
    }
    if (typeof node[i].CriticalHigh == "number") {
      sensorTableArray[Idx][7] = node[i].CriticalHigh;
    } else {
      sensorTableArray[Idx][7] = "N/A";
    }
    sensorTableArray[Idx][8] = "N/A";
  }
}
function ProcDiscreteSensor(node, Idx, i, ERTYPE) {
  var sensorType = node[i].type_number;
  var sensorReading = node[i].raw_reading;
  var humanReading = node[i].reading;
  var option = parseInt("c0", 16);
  var unitType = node[i].unit;
  var statusNode = "";
  var colorNode = "";
  if (node[i].sensor_state == 1) {
    statusNode = "Normal";
    colorNode = "green";
  } else if (node[i].sensor_state != 1 && node[i].accessible !== 0xD5 &&
             node[i].discrete_state == 0) {
    statusNode = "Normal";
    colorNode = "red";
  } else {
    statusNode = "Not Available";
    colorNode = "white";
  }
  if (sensorReading != null && parseInt(sensorReading) > 0) {
    sensorReading = sensorReading.substr(0, 2);
  }
  let kcsMode;
  if (humanReading != null && parseInt(sensorReading) > 0) {
    kcsMode = humanReading.substr(2, 2);
    humanReading = "0x" + humanReading.substr(4, 2) + humanReading.substr(2, 2);
  }
  // Ignore on reading
  if (!(option & 0x40)) {
    sensorTableArray[Idx][2] = lang.LANG_SENSOR_READING_NA;
    sensorTableArray[Idx][9] = "bgcolor=white";
    return;
  }
  if ((0x02 <= ERTYPE && ERTYPE <= 0x0C) || ERTYPE == 0x6F ||
      (0x70 <= ERTYPE && ERTYPE <= 0x7F)) {
    if (sensorReading == null) {
      sensorTableArray[Idx][1] = lang.LANG_SENSOR_STATUS_NOT_AVAILABLE;
      sensorTableArray[Idx][2] = lang.LANG_SENSOR_READING_NA;
      sensorTableArray[Idx][9] = "bgcolor=white";
      return;
    }
    sensorTableArray[Idx][1] = statusNode.replace(/\n/g, '<br>');
    sensorTableArray[Idx][2] = humanReading;
    sensorTableArray[Idx][9] = "bgcolor=" + colorNode;
    /* chassis */
    if (sensorType == "05") {
      if (sensorReading == "00") {
        buttonChassisIntrusionObj.style.visibility = 'hidden';
      } else {
        buttonChassisIntrusionObj.disabled = false;
      }
    }
  } else {
    sensorTableArray[Idx][1] = lang.LANG_SENSOR_STATUS_NOT_SUPPORTED;
    sensorTableArray[Idx][9] = "bgcolor=white";
  }
  // fix for set status as normal and set dicrete sensor reading as hexadecimal
  // values.
  statusNode = "Normal";
  colorNode = "green";
  humanReading = "0x" + (humanReading).toString(16);
  sensorTableArray[Idx][1] = statusNode.replace(/\n/g, '<br>');
  sensorTableArray[Idx][2] = humanReading;
  sensorTableArray[Idx][9] = "bgcolor=" + colorNode;
}
