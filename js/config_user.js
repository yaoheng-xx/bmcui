/* Configuration -- SSL Certification setting */
"use strict";
var userPrivilegeID = {};
var user_data_arr = [];
userPrivilegeID["callback"] = 1;
userPrivilegeID["ReadOnly"] = 2;
userPrivilegeID["Operator"] = 3;
userPrivilegeID["Administrator"] = 4;

var userPrivilegeName = {};
userPrivilegeName = ['callback', 'ReadOnly', 'Operator', 'Administrator'];

var totaluserCount = 0;
var channelCount = 0;
var channelUserCount = 0;

function groupBy(array, cb) {
    var groups = Object.create(null);
    array.forEach(function (o) {
        var key = cb(o);
        groups[key] = groups[key] || [];
        groups[key].push(o);
    });
    return groups;
}

function writeUserInfo(name, priv, password, enable, usr_to_update, callback)
{
    var data={};

    name != '' ? data.UserName = name : '';
    priv != '' ? data.RoleId = priv : '';
    password != '' ? data.Password = password : '';
    enable == 'add' ? data.Enabled = true : data.Enabled = enable;

    var object= JSON.stringify(data);
    var ajax_url;
    if(usr_to_update == ''){
      ajax_url = '/redfish/v1/AccountService/Accounts';
      var ajax_req = new Ajax.Request(ajax_url, {
        method : 'POST',
        contentType : "application/json",
        parameters : object,
        onSuccess : function(response) { callback(response); },
        onFailure : function(error) { displayUserAddActionError(error); }
      });
    }else{
      ajax_url = '/redfish/v1/AccountService/Accounts/' + usr_to_update;
      var ajax_req = new Ajax.Request(ajax_url, {
        method : 'PATCH',
        contentType : "application/json",
        parameters : object,
        onSuccess : function(response) { callback(response); },
        onFailure : function(error) { displayUserAddActionError(error); }
      });
    }
}
function displayUserAddActionError(error) {
  Loading(false);
  var eText = JSON.parse(error.responseText);
  var passCheck = false;
  for (var i in eText) {
    if (i.indexOf('Password') != -1) {
      passCheck = true;
      alert(lang.LANG_CONFUSER_ADD_ERR3);
    };
  }
  if (!passCheck) {
    alert(lang.LANG_CONF_MODIFY_ADD_USER_FAILED);
  }
}
function requestDelUser(username, callback) {

    var ajax_url = '/redfish/v1/AccountService/Accounts/'+username

    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'DELETE',
        contentType: "application/json",
        onSuccess: function(response){
            callback(response);
        },
        onFailure: function(error){
            Loading(false);
            alert('Error in Deleting User!!');
        }
    });
}

function get_the_availble_user_paths(callback) {
    var CSRFTOKEN = getCSRFToken();
    var ajax_url = '/redfish/v1/AccountService/Accounts';

    jQuery.ajax({
      url : ajax_url,
      headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
      type : "GET",
      dataType : "json",
      success : function(data, status, xhr) {
        var res = {};
        res.data = data;
        res.data = status;
        res.xhr = xhr;
        get_user_data(data.Members, callback);
      },
      error : function(data) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          Loading(false);
          alert(lang.LANG_CONF_GET_USER_FAILED);
        }
      }
    });
}

function get_user_data(member_data, callback){

    var CSRFTOKEN = getCSRFToken();
    var user_path_count = member_data.length;
    user_data_arr = [];
    for(var i=0; i< member_data.length; i++){
        var usr_path = member_data[i]['@odata.id'];
        var ajax_url = usr_path;

        jQuery.ajax({
          url : ajax_url,
          headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
          type : "GET",
          dataType : "json",
          success : function(data, status, xhr) {
            var res = {};
            res.data = data;
            res.data = status;
            res.xhr = xhr;
            user_data_arr.push(data);
          },
          error : function(data) {
            if (data.status == 401) {
              clearSessionInfo();
              location.href = "/";
            } else {
              Loading(false);
              alert(lang.LANG_CONF_GET_USER_FAILED);
            }
          }
        });
    }

    var tmp_interval = setInterval(function(){
        if(user_data_arr.length == user_path_count){
            clearInterval(tmp_interval);
            user_data_arr.push(
                {"Id" : "~", "UserName" : "~", "Enabled" : "", "RoleId" : ""});
            callback(user_data_arr);
        }
    },1000);
}

function queryUserList(callback) {
    get_the_availble_user_paths(callback);
}

function get_modify_queryUserList(user_to_get, callback){
    Loading(true);
    var ajax_url = '/redfish/v1/AccountService/Accounts/'+user_to_get;
    var ajax_req = new Ajax.Request(ajax_url,{
        method: 'GET',
        contentType: "application/json",
        onSuccess: function(response){
            callback(response);
        },
        timeout: g_CGIRequestTimeout,
        ontimeout: onCGIRequestTimeout,
        onFailure: function() {
            Loading(false);
            alert("Error Getting User Information!!");
        }
    });
}

function CheckEmptyUserName(username) {
	var result = false;
	if(username != null && username.length > 0) {
		if(username == "~") {
			result = true;
		}
	}
	return result;
}

