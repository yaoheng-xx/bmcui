"use strict";
var autoRefreshObj;
var chartBarColor = "green";
var gridTable;
var intrVar = null;
var lang;
var logTODisplay = [];
var pollCallInterval = 60000;
var refreshReading;
var selectedType = '';
var sensorCurrentValue = [];
var sensorHistoryTimeStamp = [];
var sensorHistoryUrl;
var sensorInterval;
var sensorLiveTimeStamp = [];
var sensorName = '';
var sensorpage = '/page/servh_sensor.html';
var sensorUrl = '';
var sensorValue = [];
var timeStampValue = [];
var xValues = [];

if (parent.lang) { lang = parent.lang; }
window.addEventListener('load', pageInit);

function pageInit() {
  refreshReading = document.getElementById("RefreshReading");
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/servh_sensor_reading_hlp.html";
  var sensorDetail = GetVars("sensorDetail");
  if (ReadCookie("pollCallInterval") == null) {
    CreateCookie("pollCallInterval", pollCallInterval);
  }
  var sensorDetailArr = sensorDetail.split(':');
  sensorUrl = sensorDetailArr[1];
  sensorUrl = sensorUrl.split('@')
  sensorUrl = sensorUrl[0];
  var typeArr = sensorDetailArr[0].split('-');
  selectedType = typeArr[1];
  sensorName = typeArr[0];

  var sensorHistory = (location.href).split("@")
      sensorHistoryUrl = sensorHistory[1];
  outputString();
  logTableInit();
  requestSensorHistoryAPI(sensorName, sensorHistoryUrl);

  requestSensorEventLogs();
  startInterval();
  var back = document.getElementById("back_to_sensorpage");
  back.textContent = lang.LANG_SENSOR_CAPTION_BACK;
  back.onclick = goBack;
  document.getElementById("idLogs").textContent = lang.LANG_SENSOR_CAPTION_LOGS;

  autoRefreshObj = document.getElementById("sensorHistoryIntervalValue");
  if (browser_ie) {
    autoRefreshObj.add(new Option('5', 5), 1);
    autoRefreshObj.add(new Option('10', 10), 2);
    autoRefreshObj.add(new Option('30', 30), 3);
    autoRefreshObj.add(new Option('60', 60), 4);
  } else {
    autoRefreshObj.add(new Option('5', 5), null);
    autoRefreshObj.add(new Option('10', 10), null);
    autoRefreshObj.add(new Option('30', 30), null);
    autoRefreshObj.add(new Option('60', 60), null);
  }

  autoRefreshObj.onchange = function() {
    sensorValue = [];
    timeStampValue = [];

    var ajax_url = sensorHistoryUrl;
    sensorInterval = parseInt(autoRefreshObj.value);

    if (sensorInterval == 2) {
      pollCallInterval = 2000; // 2 Sec once poll call triggered
    } else if (sensorInterval == 5) {
      pollCallInterval = 5000; // 7 Sec once poll call triggered
    } else if (sensorInterval == 10) {
      pollCallInterval = 10000; // 10 Sec once poll call triggered
    } else if (sensorInterval == 30) {
      pollCallInterval = 30000; // 30 Sec once poll call triggered
    } else {
      pollCallInterval = 60000; // 1 Minute once poll call triggered
    }
    CreateCookie("pollCallInterval", pollCallInterval);
    clearInterval(intrVar);
    startInterval();
    var ajax_param = {"Interval" : sensorInterval};
    var object = JSON.stringify(ajax_param);
    var ajax_req = new Ajax.Request(ajax_url, {
      method : 'PATCH',
      contentType : 'application/json',
      parameters : object,
      onSuccess : function() {
        setTimeout(function() {
          requestSensorHistoryAPI(sensorName, sensorHistoryUrl);
        }, 1000);
      },
      onFailure :
          function() { alert(lang.LANG_SENSOR_HISTORY_INTERVAL_FAILED); }
    });
  };
}
function requestSensorEventLogs() {
  Loading(true);
  var ajaxUrl = '/redfish/v1/Systems/system/LogServices/EventLog/Entries';
  var ajax_req = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    onSuccess : handleSensorEventLogsResponse,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_SENSOR_HISTORY_GET_FAILED);
    },
  });
}
function handleSensorEventLogsResponse(originalRequest) {
  Loading(false);
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var response = JSON.parse(originalRequest.responseText);
    var data = response.Members;
    var len = data.length - 1;
    logTODisplay = [];
    var idx = 1;
    for (var i = 0; i < data.length; i++) {
      if (data[i].MessageArgs[0] == sensorName) {
        var tmp = [];
        tmp[0] = idx;
        tmp[1] = data[i].Id;
        tmp[2] = data[i].Created;
        tmp[3] = selectedType;
        tmp[4] = data[i].Message;
        logTODisplay.push(tmp);
        idx++;
      }
      if (i == len) {
        refreshLogTable();
      }
    }
  }
}
function refreshLogTable() {
  gridTable.empty();
  gridTable.show(logTODisplay);
}
function logTableInit() {
  var tableTitles = [
    // name, width, text-align, min-width
    [ "Event ID", "10%", "left" ], [ "Timestamp", "15%", "left", "105px" ],
    [ "Sensor Type", "10", "left" ], [ "Message", "65%", "left" ]
  ];
  tableTitles[0][0] = lang.LANG_SENSOR_TABLE_HEADTITLE10;
  tableTitles[1][0] = lang.LANG_SENSOR_TABLE_HEADTITLE11;
  tableTitles[2][0] = lang.LANG_SENSOR_TABLE_HEADTITLE12;
  tableTitles[3][0] = lang.LANG_SENSOR_TABLE_HEADTITLE13;
  var logTableHeader = document.getElementById("log_tbl_header");
  var logTablePlace = document.getElementById("log_tbl_place");
  gridTable = GetTableElement();
  gridTable.setColumns(tableTitles);
  gridTable.init_header('GridTable', logTableHeader);
  gridTable.init_body('GridTable', logTablePlace);
}

function requestSensorHistoryAPI(sensorName, sensorHistoryUrl) {
  Loading(true);
  var ajax_req = new Ajax.Request(sensorHistoryUrl, {
    method : 'GET',
    onSuccess : function(res) { renderHistoryChart(res) },
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_SENSOR_HISTORY_GET_FAILED);
    },
  });
}

function renderHistoryChart(res) {
  sensorCurrentValue = [];
  sensorHistoryTimeStamp = [];
  if (res.readyState == 4 && res.status == 200) {
    autoRefreshObj.value = res.responseJSON.Interval;
    var SensorReadings = res.responseJSON.SensorReadings;
    for (var i = 0; i < SensorReadings.length; i++) {
      sensorCurrentValue.push(SensorReadings[i].Value);
      var convertedTime = getTimeFormat(SensorReadings[i].Time);
      sensorHistoryTimeStamp.push(convertedTime);
    }
    requestSensorDetailsAPI(sensorName, sensorUrl);
  }
}

function requestSensorDetailsAPI(sensorName, sensorUrl) {
  Loading(true);
  var ajax_req = new Ajax.Request(sensorUrl, {
    method : 'GET',
    onSuccess : function(res) { handleSensorDetailResponse(res, sensorName); },
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_SENSOR_HISTORY_GET_FAILED);
    },
  });
}
function getSelectedSensorData(response, type, sensorName, readingType) {
  var selectedData = response[type];
  for (var i = 0; i < selectedData.length; i++) {
    if (selectedData[i].Name == sensorName) {
      updateChartValues(selectedData[i][readingType],
                        selectedData[i].Status.Health,
                        selectedData[i].Oem.OpenBmc.DateTime);
    }
  }
}
function updateChartValues(reading, health, timeStamp) {
  var convertedTimeStamp = primitiveToHours(timeStamp);
  sensorHistoryTimeStamp.push(convertedTimeStamp);
  sensorCurrentValue.push(reading);
  chartBarColor = health == "OK" ? "green" : "red";
  renderChart();
}

function handleSensorDetailResponse(originalRequest, sensorName) {
  Loading(false);
  if (originalRequest.readyState == 4 && originalRequest.status == 200) {
    var response = JSON.parse(originalRequest.responseText);
    switch (selectedType) {
    case "Temperatures":
      getSelectedSensorData(response, "Temperatures", sensorName,
                            "ReadingCelsius");
      break;
    case "Voltages":
      getSelectedSensorData(response, "Voltages", sensorName, "ReadingVolts");
      break;
    case "Fan":
      getSelectedSensorData(response, "Fans", sensorName, "Reading");
      break;
    case "Current":
      updateChartValues(response.Reading, response.Status.Health,
                        response.Oem.OpenBmc.DateTime);
      break;
    case "utilization":
      updateChartValues(response.Reading, response.Status.Health,
                        response.Oem.OpenBmc.DateTime);
      break;
    case "System":
      updateChartValues(response.Reading, response.Status.Health,
                        response.Oem.OpenBmc.DateTime);
      break;
    case "Power":
      updateChartValues(response.Reading, response.Status.Health,
                        response.Oem.OpenBmc.DateTime);
      break;
    case "AirFlow":
      updateChartValues(response.Reading, response.Status.Health,
                        response.Oem.OpenBmc.DateTime);
      break;
    default:
      break;
    }
  }
}
function goBack() {
  clearInterval(intrVar);
  intrVar = null;
  location.href = sensorpage;
}
function outputString() {
  document.getElementById("sensor_reading_caption_div").textContent =
      lang.LANG_SENSOR_HISTORY_CAPTION;
  document.getElementById("sensorHistoryIntervalLabel").textContent =
      lang.LANG_SENSOR_HISTORY_INTERVAL;
}

function renderChart() {
  var ctx = document.getElementById('ChartSensorInfo').getContext('2d');
  sensorValue = sensorCurrentValue;
  timeStampValue = sensorHistoryTimeStamp;
  document.getElementById("selected_sensor_name").textContent =
      sensorName.split('_').join(" ");
  var myChart = new Chart(ctx, {
    type : 'line',
    data : {
      labels : timeStampValue,
      datasets : [ {
        data : sensorValue,
        label : sensorName,
        borderColor : chartBarColor,
        borderWidth : 2,
      } ]
    },
    options : {
      events: [],
      scales : {
        xAxes : [ {scaleLabel : {display : true, labelString : lang.LANG_SENSOR_TABLE_HEADTITLE11}} ],
        yAxes : [ {scaleLabel : {display : true, labelString : lang.LANG_SENSOR_TABLE_HEADTITLE14}} ],
      }
    },
  });
  Loading(false);
}
function startInterval() {
  var pollCallIntervalInCookie = ReadCookie("pollCallInterval");
  intrVar = null;
  intrVar = setInterval(function() {
    if (sensorName != '' && sensorUrl != '') {
      requestSensorHistoryAPI(sensorName, sensorHistoryUrl);
      requestSensorEventLogs();
    } else {
      clearInterval(intrVar);
      intrVar = null;
    }
  }, pollCallIntervalInCookie); // Poll call interval Changed based on dropdown
                                // interval value
}
