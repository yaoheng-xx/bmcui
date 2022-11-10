/* Configuration -- SSL Certification setting */
"use strict";
var keyform;
var keyuntil;
var sslcrt;
var btn = "";
var datakey = {};
var exists_cert = false;
var add_new_cert_table = '';
var savebtn = '';
var privkey = '';
var dataTabObj;

window.addEventListener('load', PageInit);
var lang = '';
if (parent.lang) {
  lang = parent.lang;
}

function PageInit() {
  top.frames.topmenu.document.getElementById("frame_help").src =
      "../help/" + lang_setting + "/upload_ssl_certificate_hlp.html";

  // Server certificate upload btn.
  btn = document.getElementById("ButtonUpload");
  btn.value = lang.LANG_CONFIG_SSL_UPLOAD;
  btn.addEventListener("click", clickUploadServer);

  keyform = document.getElementById("validfrom");
  keyuntil = document.getElementById("validuntil");
  sslcrt = document.getElementById("sslcrt_file");
  sslcrt.setAttribute('NAME', '/tmp/cert.pem');
  privkey = document.getElementById("privkey_file");
  privkey.setAttribute('NAME', '/tmp/key.pem');

  OutputString();

  document.getElementById("ButtonAddNewCert").value =
      lang.CONFIG_ADD_NEW_CERTIFICATE;
  document.getElementById("ButtonAddNewCert")
      .addEventListener("click", btnAddNewCert);
  savebtn = document.getElementById("save_btn");
  savebtn.addEventListener("click", clickUploadCA);
  add_new_cert_table = document.getElementById("add_new_cert_table");
  add_new_cert_table.style.display = "none";
  savebtn.style.display = "none";
  CheckUserPrivilege(PrivilegeCallBack);
}

function OutputString() {
  "use strict";
  document.getElementById("ssl_caption_div_server").textContent =
      lang.LANG_CONFIG_SSL_CAPTION_SERVER;
  document.getElementById("ssl_caption_div_ca").textContent =
      lang.LANG_CONFIG_SSL_CAPTION_CA;
  document.getElementById("ssl_form_span").textContent =
      lang.LANG_CONFIG_SSL_FORM;
  document.getElementById("validfrom").textContent = lang.LANG_CONFIG_SSL_NONE;
  document.getElementById("ssl_until_span").textContent =
      lang.LANG_CONFIG_SSL_UNTIL;
  document.getElementById("validuntil").textContent = lang.LANG_CONFIG_SSL_NONE;
  document.getElementById("newsslcert_span").textContent =
      lang.LANG_CONFIG_SSL_NEWSSLCERT;
  document.getElementById("newprikey_span").textContent =
      lang.LANG_CONFIG_SSL_NEWPRIKEY;
}

function initSSLDetailTab() {
  var myColumns = [
    [ "Certificate", "30%", "center" ], [ "Issued By", "10%", "center" ],
    [ "Issued to", "10%", "center" ], [ "Valid from", "15%", "center" ],
    [ "Valid untill", "15%", "center" ], [ "Delete", "10%", "center" ]
  ];
  myColumns[0][0] = lang.LANG_CONFIG_SSL_CERTIFICATE__TITLE0;
  myColumns[1][0] = lang.LANG_CONFIG_SSL_ISSUED_BY__TITLE1;
  myColumns[2][0] = lang.LANG_CONFIG_SSL_ISSUED_TO__TITLE2;
  myColumns[3][0] = lang.LANG_CONFIG_SSL_VALID_FROM__TITLE3;
  myColumns[4][0] = lang.LANG_CONFIG_SSL_VALID_UNTIL__TITLE4;
  myColumns[5][0] = lang.LANG_CONFIG_SSL_DELETE__TITLE6;
  dataTabObj = GetTableElement();
  dataTabObj.setColumns(myColumns);
  dataTabObj.init('dataTabObj', ssl_detail_table, "100px");
}
function PrivilegeCallBack(Privilege) {
  if (Privilege == '04') {
    initSSLDetailTab();
    SSLReading();
  } else {
    location.href = SubMainPage;
  }
}
function SSLReading() {
  Loading(true);
  var ajax_url = '/redfish/v1/CertificateService/CertificateLocations';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : GETCertificateURL,
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFIG_SSL_CERTIFICATE_GET_FAILED);
    },
  });
}

function GETCertificateURL(arg) {
  if (arg.readyState == 4 && arg.status == 200) {
    var response = JSON.parse(arg.responseText);
    var certificate_array = response.Links.Certificates;
    if (certificate_array.length == 0) {
      Loading(false);
    }
    for (var i = 0; i < certificate_array.length; i++) {
      console.log(certificate_array[i]["@odata.id"]);
      GetSSLReading(certificate_array[i]["@odata.id"]);
    }
  }
}

function GetSSLReading(url) {
  Loading(true);
  var ajax_url = url;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : SSLReadingResult,
    onFailure : function() { Loading(false); },
  });
}

function SSLReadingResult(arg) {
  Loading(false);
  if (arg.readyState == 4 && arg.status == 200) {
    var sslinfo = JSON.parse(arg.responseText);
    var issuedBy = sslinfo.Issuer.CommonName;
    var issuedFrom = sslinfo.Subject.CommonName;
    var validform = sslinfo.ValidNotBefore;
    var validuntil = sslinfo.ValidNotAfter;
    var getcertURL = sslinfo['@odata.id'];
    var issuedbystatus = lang.LANG_CONFIG_SSL_NOAVAILBALE;
    var issuedfromstatus = lang.LANG_CONFIG_SSL_NOAVAILBALE;
    var validformstatus = lang.LANG_CONFIG_SSL_NOAVAILBALE;
    var validuntilstatus = lang.LANG_CONFIG_SSL_NOAVAILBALE;

    var data_arr = [];

    if (issuedBy != "Not Avaliable") {
      issuedbystatus = issuedBy.replace("T", " ");
    }
    if (issuedFrom != "Not Avaliable") {
      issuedfromstatus = issuedFrom.replace("T", " ");
    }

    if (validform != "Not Available") {
      validformstatus = validform.replace("T", " ");
    }

    if (validuntil != "Not Available") {
      validuntilstatus = validuntil.replace("T", " ");
    }
    var deleteCert = "";
    if (getcertURL.indexOf("/Truststore/") != -1) {
      deleteCert =
          '<input type="image" id="truststore_cert" img src="/images/bin.png" style="width: 15px;" class="killicon" onclick="deleteCertificate(\'' +
          getcertURL + '\')">';
    }
    if (getcertURL.indexOf("/Truststore/") != -1) {
      data_arr.push([
        1, sslinfo.Description, issuedbystatus, issuedfromstatus,
        validformstatus, validuntilstatus, deleteCert
      ]);
    }
    dataTabObj.show(data_arr);

    // server certificate
    if (getcertURL.indexOf("/HTTPS/") != -1) {
      exists_cert = true;
      keyform.textContent = validformstatus;
      keyuntil.textContent = validuntilstatus;
    }
  }
}

function deleteCertificate(certURL) {
  var CSRFTOKEN = getCSRFToken();
  var ajaxUrl = certURL;

  var ajax_req = new Ajax.Request(ajaxUrl, {
    method : 'DELETE',
    contentType : 'application/json',
    onComplete : function(data, status, xhr) {
      var res = {};
      res.data = data;
      res.data = status;
      res.xhr = xhr;
      if (data.status == 204) {
        alert(lang.LANG_CONFIG_SSL_CERTIFICATE_DELETE_SUCCESS, {
          title : lang.LANG_GENERAL_SUCCESS,
          onClose : function() { location.href = "/page/config_ssl.html"; }
        });
      } else {
        alert(lang.LANG_CONFIG_SSL_CERTIFICATE_DELETE_FAILED);
      }
    },
    error : function(
        data, status,
        xhr) { alert(lang.LANG_CONFIG_SSL_CERTIFICATE_DELETE_FAILED); }
  });
}

function clickUploadServer() {
  "use strict";

  sslcrt = document.getElementById("sslcrt_file");
  var sslcrtfile = sslcrt.files;
  if (sslcrtfile.length == 0) {
    alert(lang.LANG_CONFIG_SSL_SEL_CRTFILE);
    sslcrt.focus();
    return;
  }

  privkey = document.getElementById("privkey_file_server");
  var privkeyfile = privkey.files;
  if (privkeyfile.length == 0) {
    alert(lang.LANG_CONFIG_SSL_SEL_PRIKEYFILE);
    privkey.focus();
    return;
  }

  if (exists_cert) {
    UtilsConfirm(lang.LANG_CONFIG_SSL_CRTEXIST, {onOk : replaceCertificate});
  } else {
    replaceCertificate();
  }
}

function handleFiles(files) {
  if (files.length) {
    let file = files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
      console.log(e.target.result);
      datakey.certificateString = e.target.result;
    };
    reader.readAsBinaryString(file);
  }
}

function replaceCertificate() {
  var sslcrtfile = document.getElementById("sslcrt_file").files[0];
  var reader = new FileReader();
  reader.onloadend = function(e) {
    var data = {};
    data.CertificateString = datakey.certificateString + "\n" + e.target.result;
    console.log(data.CertificateString);
    data.CertificateType = "PEM";
    var certVal =
        "/redfish/v1/Managers/bmc/NetworkProtocol/HTTPS/Certificates/1";
    data.CertificateUri = {'@odata.id' : certVal};
    var ajax_url =
        "/redfish/v1/CertificateService/Actions/CertificateService.ReplaceCertificate";
    var ajax_data = JSON.stringify(data);
    var CSRFTOKEN = getCSRFToken();
    jQuery.ajax({
      url : ajax_url,
      headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
      type : "POST",
      contentType : 'application/json',
      processData : false,
      dataType : "json",
      cache : false,
      data : ajax_data,
      success : function(data, status, xhr) {
        var res = {};
        res.data = data;
        res.data = status;
        res.xhr = xhr;
        clearSessionInfo();
        Loading(false);
        var rAlertMsg = lang.LANG_CONFIG_SSL_CERTIFICATE_REPLACE_SUCCESS;
        alert(rAlertMsg, {
          title : lang.LANG_GENERAL_SUCCESS,
          onClose : function() { location.reload(); }
        });
      },
      error : function(data) {
        if (data.status == 401) {
          clearSessionInfo();
          location.href = "/";
        } else {
          Loading(false);
          alert(lang.LANG_CONFIG_SSL_CERTIFICATE_UPLOAD_FAILED);
        }
      }
    });
  };
  reader.readAsBinaryString(sslcrtfile);
}

function btnAddNewCert() {
  if (add_new_cert_table.style.display == "none") {
    add_new_cert_table.style.display = "block";
    savebtn.style.display = "block";
    savebtn.value = lang.LANG_GENERATE_CA_UPLOAD;
  } else {
    add_new_cert_table.style.display = "none";
    savebtn.style.display = "none";
  }
}

function clickUploadCA() {
  if (savebtn.value == lang.LANG_GENERATE_CA_UPLOAD) {
    uploadkey('/redfish/v1/Managers/bmc/Truststore/Certificates');
  }
}

function uploadkey(file_url) {
  var CSRFTOKEN = getCSRFToken();
  var data = document.getElementById("privkey_file").files[0];

  Loading(true);
  jQuery.ajax({
    url : file_url,
    headers : {'X-XSRF-TOKEN' : CSRFTOKEN},
    type : "POST",
    contentType : false,
    processData : false,
    dataType : "json",
    cache : false,
    data : data,
    success : function(data, status, xhr) {
      var res = {};
      res.data = data;
      res.data = status;
      res.xhr = xhr;
      clearSessionInfo();
      Loading(false);
      var alertMsg = lang.LANG_CONFIG_SSL_CERTIFICATE_UPLOAD_SUCCESS;
      alert(alertMsg, {
        title : lang.LANG_GENERAL_SUCCESS,
        onClose : function() { location.reload(); }
      });
    },
    error : function(data) {
      if (data.status == 401) {
        clearSessionInfo();
        location.href = "/";
      } else {
        Loading(false);
        alert(lang.LANG_CONFIG_SSL_CERTIFICATE_UPLOAD_FAILED);
      }
    }
  });
}
