/* Configuration -- SSL Certification setting */
"use strict";
var exists_cert=false;
var csr_table = '';
var add_new_cert_table = '';
var replace_table = '';
var savebtn = '';
var privkey = '';
var dataTabObj;
var certVal;
// Update the below JSON Object to set the Generate CSR Key Pair Algorithm
// and Key Bit Length dropdown options
var Key_pair_algo = {
  "EC" : [ "prime256v1", "secp384r1" ],
  "RSA" : [ "2048", "4096", "3072" ]
};

var countries = {
  country : [
    {Name : 'Afghanistan', code : 'AF'},
    {Name : 'Albania', code : 'AL'},
    {Name : 'Algeria', code : 'DZ'},
    {Name : 'American Samoa', code : 'AS'},
    {Name : 'Andorra', code : 'AD'},
    {Name : 'Angola', code : 'AO'},
    {Name : 'Anguilla', code : 'AI'},
    {Name : 'Antarctica', code : 'AQ'},
    {Name : 'Antigua and Barbuda', code : 'AG'},
    {Name : 'Argentina', code : 'AR'},
    {Name : 'Armenia', code : 'AM'},
    {Name : 'Aruba', code : 'AW'},
    {Name : 'Australia', code : 'AU'},
    {Name : 'Austria', code : 'AT'},
    {Name : 'Azerbaijan', code : 'AZ'},
    {Name : 'Bahamas, The', code : 'BS'},
    {Name : 'Bahrain', code : 'BH'},
    {Name : 'Bangladesh', code : 'BD'},
    {Name : 'Barbados', code : 'BB'},
    {Name : 'Belarus', code : 'BY'},
    {Name : 'Belgium', code : 'BE'},
    {Name : 'Belize', code : 'BZ'},
    {Name : 'Benin', code : 'BJ'},
    {Name : 'Bermuda', code : 'BM'},
    {Name : 'Bhutan', code : 'BT'},
    {Name : 'Bolivia', code : 'BO'},
    {Name : 'Bonaire, Sint Eustatius and Saba', code : 'BQ'},
    {Name : 'Bosnia and Herzegovina ', code : 'BA'},
    {Name : 'Bostwana', code : 'BW'},
    {Name : 'Bouvet Island', code : 'BV'},
    {Name : 'Brazil', code : 'BR'},
    {Name : 'British Indian Ocean Territory', code : 'IO'},
    {Name : 'Brunei Darussalam ', code : 'BN'},
    {Name : 'Bulgaria', code : 'BG'},
    {Name : 'Burkina Faso', code : 'BF'},
    {Name : 'Burundi', code : 'BI'},
    {Name : 'Cabo Verde', code : 'CV'},
    {Name : 'Cambodia', code : 'KH'},
    {Name : 'Cameroon', code : 'CM'},
    {Name : 'Canada', code : 'CA'},
    {Name : 'Cayman Islands', code : 'KY'},
    {Name : 'Central African Republic', code : 'CF'},
    {Name : 'Chad', code : 'TD'},
    {Name : 'Chile', code : 'CL'},
    {Name : 'China', code : 'CN'},
    {Name : 'Christmas Island ', code : 'CX'},
    {Name : 'Cocos(Keeling) Islands', code : 'CC'},
    {Name : 'Columbia', code : 'CO'},
    {Name : 'Comoros', code : 'KM'},
    {Name : 'Congo, The Democratic Republic of the', code : 'CD'},
    {Name : 'Congo', code : 'CG'},
    {Name : 'Cook Islands', code : 'CK'},
    {Name : 'Costa Rica', code : 'CR'},
    {Name : 'Croatia', code : 'HR'},
    {Name : 'Cuba', code : 'CU'},
    {Name : 'Curaçao', code : 'CW'},
    {Name : 'Cyprus', code : 'CY'},
    {Name : 'Czechia', code : 'CZ'},
    {Name : 'Côte d\'Ivoire', code : 'CI'},
    {Name : 'Denmark', code : 'DK'},
    {Name : 'Djibouti', code : 'DJ'},
    {Name : 'Dominica', code : 'DM'},
    {Name : 'Dominican Republic', code : 'DO'},
    {Name : 'Ecuador', code : 'EC'},
    {Name : 'Egypt', code : 'EG'},
    {Name : 'El Salvador', code : 'SV'},
    {Name : 'Equatorial Guinea ', code : 'GQ'},
    {Name : 'Eritrea', code : 'ER'},
    {Name : 'Estonia', code : 'EE'},
    {Name : 'Eswatini', code : 'SZ'},
    {Name : 'Ethiopia', code : 'ET'},
    {Name : 'Falkland Islands (Malvinas)', code : 'FK'},
    {Name : 'Faroe Islands', code : 'FO'},
    {Name : 'Fiji', code : 'FJ'},
    {Name : 'Finland', code : 'FI'},
    {Name : 'France', code : 'FR'},
    {Name : 'French Guiana', code : 'GF'},
    {Name : 'French Polynesia', code : 'PF'},
    {Name : 'French Southern Territories', code : 'TF'},
    {Name : 'Gabon', code : 'GA'},
    {Name : 'Gambia, The', code : 'GM'},
    {Name : 'Georgia', code : 'GE'},
    {Name : 'Germany', code : 'DE'},
    {Name : 'Ghana', code : 'GH'},
    {Name : 'Gibraltar', code : 'GI'},
    {Name : 'Greece', code : 'GR'},
    {Name : 'Greenland', code : 'GL'},
    {Name : 'Grenada', code : 'GD'},
    {Name : 'Guadeloupe', code : 'GP'},
    {Name : 'Guam', code : 'GU'},
    {Name : 'Guatemala', code : 'GT'},
    {Name : 'Guernsey', code : 'GG'},
    {Name : 'Guinea', code : 'GN'},
    {Name : 'Guinea-Bissau', code : 'GW'},
    {Name : 'Guyana', code : 'GY'},
    {Name : 'Haiti', code : 'HT'},
    {Name : 'Heard Island and McDonald Islands', code : 'HM'},
    {Name : 'Holy See', code : 'VA'},
    {Name : 'Honduras', code : 'HN'},
    {Name : 'Hong Kong', code : 'HK'},
    {Name : 'Hungary', code : 'HU'},
    {Name : 'Iceland', code : 'IS'},
    {Name : 'India', code : 'IN'},
    {Name : 'Indonesia', code : 'ID'},
    {Name : 'Iran, Islamic Republic of', code : 'IR'},
    {Name : 'Iraq', code : 'IQ'},
    {Name : 'Ireland', code : 'IE'},
    {Name : 'Isle of Man', code : 'IM'},
    {Name : 'Israel', code : 'IL'},
    {Name : 'Italy', code : 'IT'},
    {Name : 'Jamaica', code : 'JM'},
    {Name : 'Japan', code : 'JP'},
    {Name : 'Jersey', code : 'JE'},
    {Name : 'Jordan', code : 'JO'},
    {Name : 'Kazakhstan', code : 'KZ'},
    {Name : 'Kenya', code : 'KE'},
    {Name : 'Kiribati', code : 'KI'},
    {Name : 'Korea, Republic of', code : 'KR'},
    {Name : 'Korea, Democratic People\'s Republic of', code : 'KP'},
    {Name : 'Kuwait', code : 'KW'},
    {Name : 'Kyrgyzstan', code : 'KG'},
    {Name : 'Lao People\'s Democratic Republic', code : 'LA'},
    {Name : 'Latvia', code : 'LV'},
    {Name : 'Lebanon', code : 'LB'},
    {Name : 'Lesotho', code : 'LS'},
    {Name : 'Liberia', code : 'LR'},
    {Name : 'Libya', code : 'LY'},
    {Name : 'Liechtenstein', code : 'LI'},
    {Name : 'Lithuania', code : 'LT'},
    {Name : 'Luxembourg', code : 'LU'},
    {Name : 'Macao', code : 'MO'},
    {Name : 'Macedonia, The Former Yugoslav Republic of', code : 'MK'},
    {Name : 'Madagascar', code : 'MG'},
    {Name : 'Malawi', code : 'MW'},
    {Name : 'Malaysia', code : 'MY'},
    {Name : 'Maldives', code : 'MV'},
    {Name : 'Mali', code : 'ML'},
    {Name : 'Malta', code : 'MT'},
    {Name : 'Marshall Islands', code : 'MH'},
    {Name : 'Martinique', code : 'MQ'},
    {Name : 'Mauritania', code : 'MR'},
    {Name : 'Mauritius', code : 'MU'},
    {Name : 'Mayotte', code : 'YT'},
    {Name : 'Mexico', code : 'MX'},
    {Name : 'Micronesia, Federated States of', code : 'FM'},
    {Name : 'Moldova, Republic of', code : 'MD'},
    {Name : 'Monaco', code : 'MC'},
    {Name : 'Mongolia', code : 'MN'},
    {Name : 'Montenegro', code : 'ME'},
    {Name : 'Montserrat', code : 'MS'},
    {Name : 'Morocco', code : 'MA'},
    {Name : 'Mozambique', code : 'MZ'},
    {Name : 'Myanmar', code : 'MM'},
    {Name : 'Namibia', code : 'NA'},
    {Name : 'Nauru', code : 'NR'},
    {Name : 'Nepal', code : 'NP'},
    {Name : 'Netherlands', code : 'NL'},
    {Name : 'New Caledonia', code : 'NC'},
    {Name : 'New Zealand', code : 'NZ'},
    {Name : 'Nicaragua', code : 'NI'},
    {Name : 'Niger', code : 'NE'},
    {Name : 'Nigeria', code : 'NG'},
    {Name : 'Niue', code : 'NU'},
    {Name : 'Norfolk Island', code : 'NF'},
    {Name : 'Northern Mariana Islands', code : 'MP'},
    {Name : 'Norway', code : 'NO'},
    {Name : 'Oman', code : 'OM'},
    {Name : 'Pakistan', code : 'PK'},
    {Name : 'Palau', code : 'PW'},
    {Name : 'Palestine', code : 'PS'},
    {Name : 'Panama', code : 'PA'},
    {Name : 'Papua New Guinea', code : 'PG'},
    {Name : 'Paraguay', code : 'PY'},
    {Name : 'Peru', code : 'PE'},
    {Name : 'Philippines', code : 'PH'},
    {Name : 'Pitcairn', code : 'PN'},
    {Name : 'Poland', code : 'PL'},
    {Name : 'Portugal', code : 'PT'},
    {Name : 'Puerto Rico', code : 'PR'},
    {Name : 'Qatar', code : 'QA'},
    {Name : 'Romania', code : 'RO'},
    {Name : 'Russian Federation', code : 'RU'},
    {Name : 'Rwanda', code : 'RW'},
    {Name : 'Réunion', code : 'RE'},
    {Name : 'Saint Barthélemy', code : 'BL'},
    {Name : 'Saint Helena, Ascension and Tristan da Cunha', code : 'SH'},
    {Name : 'Saint Kitts and Nevis ', code : 'KN'},
    {Name : 'Saint Lucia', code : 'LC'},
    {Name : 'Saint Martin', code : 'MF'},
    {Name : 'Saint Pierre and Miquelon', code : 'PM'},
    {Name : 'Saint Vincent and the Grenadines', code : 'VC'},
    {Name : 'Samoa', code : 'WS'},
    {Name : 'San Marino ', code : 'SM'},
    {Name : 'Sao Tome and Principe', code : 'ST'},
    {Name : 'Saudi Arabia', code : 'SA'},
    {Name : 'Senegal', code : 'SN'},
    {Name : 'Serbia', code : 'RS'},
    {Name : 'Seychelles', code : 'SC'},
    {Name : 'Sierra Leone', code : 'SL'},
    {Name : 'Singapore', code : 'SG'},
    {Name : 'Sint Maarten', code : 'SX'},
    {Name : 'Slovakia', code : 'SK'},
    {Name : 'Slovenia', code : 'SI'},
    {Name : 'Solomon Islands', code : 'SB'},
    {Name : 'Somalia', code : 'SO'},
    {Name : 'South Africa ', code : 'ZA'},
    {Name : 'South Georgia and the South Sandwich Islands', code : 'GS'},
    {Name : 'South Sudan', code : 'SS'},
    {Name : 'Spain', code : 'ES'},
    {Name : 'Sri Lanka', code : 'LK'},
    {Name : 'Sudan', code : 'SD'},
    {Name : 'Suriname', code : 'SR'},
    {Name : 'Svalbard and Jan Mayen', code : 'SJ'},
    {Name : 'Sweden', code : 'SE'},
    {Name : 'Switzerland', code : 'CH'},
    {Name : 'Syrian Arab Republic', code : 'SY'},
    {Name : 'Taiwan', code : 'TW'},
    {Name : 'Tajikistan', code : 'TJ'},
    {Name : 'Tanzania, United Republic of', code : 'TZ'},
    {Name : 'Thailand', code : 'TH'},
    {Name : 'Timor-Leste', code : 'TL'},
    {Name : 'Togo', code : 'TG'},
    {Name : 'Tokelau', code : 'TK'},
    {Name : 'Tonga', code : 'TO'},
    {Name : 'Trinidad and Tobago', code : 'TT'},
    {Name : 'Tunisia', code : 'TN'},
    {Name : 'Turkey', code : 'TR'},
    {Name : 'Turkmenistan', code : 'TM'},
    {Name : 'Turks and Caicos Islands', code : 'TC'},
    {Name : 'Tuvalu', code : 'TV'},
    {Name : 'Uganda', code : 'UG'},
    {Name : 'Ukraine', code : 'UA'},
    {Name : 'United Arab Emirates', code : 'AE'},
    {Name : 'United Kingdom', code : 'GB'},
    {Name : 'United States Minor Outlying Islands', code : 'UM'},
    {Name : 'United States of America', code : 'US'},
    {Name : 'Uruguay', code : 'UY'},
    {Name : 'Uzbekistan', code : 'UZ'},
    {Name : 'Vanuatu', code : 'VU'},
    {Name : 'Venezuela', code : 'VE'},
    {Name : 'Viet Nam', code : 'VN'},
    {Name : 'Virgin Islands, British', code : 'VG'},
    {Name : 'Virgin Islands, U.S', code : 'VI'},
    {Name : 'Wallis and Futuna', code : 'WF'},
    {Name : 'Western Sahara', code : 'EH'},
    {Name : 'Yemen', code : 'YE'},
    {Name : 'Zambia', code : 'ZM'},
    {Name : 'Zimbabwe', code : 'ZW'},
    {Name : 'Åland Islands', code : 'AX'}
  ]
}

window.addEventListener('load', PageInit);
var lang = '';
if (parent.lang) { lang = parent.lang; }

function PageInit()
{
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/upload_ssl_certificate_hlp.html";
    document.getElementById("ButtonAddNewCert").value =
        lang.CONFIG_ADD_NEW_CERTIFICATE;
    document.getElementById("ButtonGenerateCSR").value =
        lang.CONFIG_GENEERATE_CSR;
    savebtn = document.getElementById("save_btn");
    savebtn.addEventListener("click", clickSave);
    privkey=document.getElementById("privkey_file");
    privkey.setAttribute('NAME', '/tmp/key.pem');
    document.getElementById("ButtonAddNewCert")
        .addEventListener("click", btnAddNewCert);
    document.getElementById("ButtonGenerateCSR")
        .addEventListener("click", btnGenerateCSR);
    document.getElementById("key_pair_algo")
        .addEventListener("change", setKeyBitLength);
    add_new_cert_table = document.getElementById("add_new_cert_table");
    csr_table = document.getElementById("csr_table");
    replace_table = document.getElementById("replace_cert_table");
    add_new_cert_table.style.display = "none";
    csr_table.style.display = "none";
    replace_table.style.display = "none";
    savebtn.style.display = "none";
    var optionsAsString = '';
    for (var i = 0; i < countries.country.length; i++) {
      optionsAsString += "<option value='" + countries.country[i].code + "'>" +
                         countries.country[i].Name + "</option>";
    }
    document.getElementById('country').innerHTML = optionsAsString;
    OutputString();
    CheckUserPrivilege(PrivilegeCallBack);
}

function setKeypairAlgo_data() {
  var kpaselect = document.getElementById("key_pair_algo");
  var length = kpaselect.options.length;
  for (var i = length - 1; i >= 0; i--) {
    kpaselect.options[i] = null;
  }
  var option_string = "";
  for (var key in Key_pair_algo) {
    option_string += "<option>" + key + "</option>"
  }
  document.getElementById('key_pair_algo').innerHTML = option_string;
  setKeyBitLength();
}

function setKeyBitLength() {
  var selected_algo = document.getElementById("key_pair_algo").value;
  var optionsAsString = '';
  for (var key in Key_pair_algo) {
    if (key == selected_algo) {
      for (var itm of Key_pair_algo[key]) {
        optionsAsString += "<option value=" + itm + ">" + itm + "</option>";
      }
    }
  }
  var select = document.getElementById("key_bit_len");
  var length = select.options.length;
  for (var i = length - 1; i >= 0; i--) {
    select.options[i] = null;
  }
  document.getElementById('key_bit_len').innerHTML = optionsAsString;
}

function initSSLDetailTab() {
  var myColumns = [
    [ "Certificate", "30%", "center" ], [ "Issued By", "10%", "center" ],
    [ "Issued to", "10%", "center" ], [ "Valid from", "15%", "center" ],
    [ "Valid untill", "15%", "center" ], [ "Replace", "10%", "center" ],
    [ "Delete", "10%", "center" ]
  ];
  myColumns[0][0] = lang.LANG_CONFIG_SSL_CERTIFICATE__TITLE0;
  myColumns[1][0] = lang.LANG_CONFIG_SSL_ISSUED_BY__TITLE1;
  myColumns[2][0] = lang.LANG_CONFIG_SSL_ISSUED_TO__TITLE2;
  myColumns[3][0] = lang.LANG_CONFIG_SSL_VALID_FROM__TITLE3;
  myColumns[4][0] = lang.LANG_CONFIG_SSL_VALID_UNTIL__TITLE4;
  myColumns[5][0] = lang.LANG_CONFIG_SSL_REPLACE__TITLE5;
  myColumns[6][0] = lang.LANG_CONFIG_SSL_DELETE__TITLE6;
  dataTabObj = GetTableElement();
  dataTabObj.setColumns(myColumns);
  dataTabObj.init('dataTabObj', ssl_detail_table, "100px");
}

function OutputString() {
  document.getElementById("ssl_caption_div").textContent =
      lang.LANG_CONFIG_SSL_CAPTION;
  document.getElementById("ssl_certificate_type").textContent =
      lang.LANG_GENERATE_CSR_CERTIFICATE_TYPE;
  document.getElementById("ssl_country").textContent =
      lang.LANG_GENERATE_CSR_COUNTRY;
  document.getElementById("ssl_state").textContent =
      lang.LANG_GENERATE_CSR_STATE;
  document.getElementById("ssl_city").textContent = lang.LANG_GENERATE_CSR_CITY;
  document.getElementById("ssl_company_name").textContent =
      lang.LANG_GENERATE_CSR_COMPANY_NAME;
  document.getElementById("ssl_company_unit").textContent =
      lang.LANG_GENERATE_CSR_COMPANY_UNIT;
  document.getElementById("ssl_common_name").textContent =
      lang.LANG_GENERATE_CSR_COMMON_NAME;
  document.getElementById("ssl_challenge_password").textContent =
      lang.LANG_GENERATE_CSR_CHALLENGE_PASSWORD;
  document.getElementById("ssl_contact_person").textContent =
      lang.LANG_GENERATE_CSR_CONTACT_PERSON;
  document.getElementById("ssl_email_address").textContent =
      lang.LANG_GENERATE_CSR_EMAIL_ADDRESS;
  document.getElementById("ssl_alternate_name").textContent =
      lang.LANG_GENERATE_CSR_ALTERNATE_NAME;
  document.getElementById("private_key").textContent =
      lang.LANG_GENERATE_CSR_PRIVATE_NAME;
  document.getElementById("ssl_key_pair_algo").textContent =
      lang.LANG_GENERATE_CSR_KEY_PAIR_ALGORITHM;
  document.getElementById("ssl_key_bit_algo").textContent =
      lang.LANG_GENERATE_CSR_KEY_BIT_LENGTH;
  document.getElementById("div_mount_type").textContent = lang.LANG_CERT_TYPE;
  document.getElementById("div_user").textContent = lang.LANG_CHOOSE_CERT;
}

function PrivilegeCallBack(Privilege)
{
    if (Privilege == '04') {
      initSSLDetailTab();
      SSLReading();
    } else {
      location.href = SubMainPage;
    }
}
function btnAddNewCert() {
  if (add_new_cert_table.style.display == "none") {
    add_new_cert_table.style.display = "block";
    savebtn.style.display = "block";
    csr_table.style.display = "none";
    replace_table.style.display = "none";
    savebtn.value = "Upload";
  } else {
    add_new_cert_table.style.display = "none";
    csr_table.style.display = "none";
    replace_table.style.display = "none";
    savebtn.style.display = "none";
  }
}
function btnGenerateCSR() {
  if (csr_table.style.display == "none") {
    csr_table.style.display = "block";
    savebtn.style.display = "block";
    replace_table.style.display = "none";
    savebtn.value = "Generate";
    add_new_cert_table.style.display = "none";
    setKeypairAlgo_data();
  } else {
    csr_table.style.display = "none";
    add_new_cert_table.style.display = "none";
    replace_table.style.display = "none";
    savebtn.style.display = "none";
  }
}
function btnReplaceCert(cert_val) {
  certVal = cert_val;
  if (replace_table.style.display == "none") {
    replace_table.style.display = "block";
    savebtn.style.display = "block";
    add_new_cert_table.style.display = "none";
    csr_table.style.display = "none";
    savebtn.value = "Replace";
  } else {
    replace_table.style.display = "none";
    add_new_cert_table.style.display = "none";
    csr_table.style.display = "none";
    savebtn.style.display = "none";
  }
}
function clickSave() {
  if (save_btn.value == "Upload") {
    var selected_cert_type = document.getElementsByName('new_cert');
    var new_cert = "";
    for (var i = 0; i < selected_cert_type.length; i++) {
      if (selected_cert_type[i].checked) {
        new_cert = selected_cert_type[i].value;
      }
    }
    if (new_cert == "") {
      alert(lang.LANG_CONFIG_SSL_SELECT_CERT_ERR);
      return;
    }
    if (new_cert == 'https') {
      uploadkey('/redfish/v1/Managers/bmc/NetworkProtocol/HTTPS/Certificates');
    }
    if (new_cert == 'ldap') {
      uploadkey('/redfish/v1/AccountService/LDAP/Certificates');
    }
    if (new_cert == 'ca') {
      uploadkey('/redfish/v1/Managers/bmc/Truststore/Certificates');
    }
  }
  if (save_btn.value == "Generate") {
    GenerateCSR();
  }
  if (save_btn.value == "Replace") {
    replaceCertificate();
  }
}
function DownloadCSR(string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' +
                                   encodeURIComponent(string));
  element.setAttribute('download', "csrCode.txt");
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  alert(lang.LANG_CONFIG_SSL_CERT_GENERATE_SUCCESS);
  Loading(false);
}

function GenerateCSR() {
  Loading(true);
  var selected_cert = document.getElementById("cert_type").value;
  var cert_collection = {};
  if (selected_cert == "HTTPS Certificate") {
    cert_collection["@odata.id"] =
        "/redfish/v1/Managers/bmc/NetworkProtocol/HTTPS/Certificates/";
  }
  if (selected_cert == "LDAP Certificate") {
    cert_collection["@odata.id"] =
        "/redfish/v1/AccountService/LDAP/Certificates/";
  }
  var obj = {};
  obj.CertificateCollection = cert_collection;
  obj.CommonName = document.getElementById("common_name").value;
  obj.ContactPerson = document.getElementById("contact_person").value;
  obj.City = document.getElementById("city").value;
  obj.AlternativeNames = [ document.getElementById("altr_name").value ];
  obj.ChallengePassword = document.getElementById("challenge_pass").value;
  obj.Email = document.getElementById("email_adrs").value;
  obj.Country = document.getElementById("country").value;
  obj.Organization = document.getElementById("company_name").value;
  obj.OrganizationalUnit = document.getElementById("company_unit").value;
  obj.KeyCurveId = document.getElementById("key_bit_len").value;
  obj.KeyPairAlgorithm = document.getElementById("key_pair_algo").value;
  obj.State = document.getElementById("cert_state").value;
  Loading(true);
  var ajax_url =
      '/redfish/v1/CertificateService/Actions/CertificateService.GenerateCSR';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'POST',
    parameters : JSON.stringify(obj),
    onSuccess : function(response) {DownloadCSR(response.responseJSON.CSRString); },
    onFailure : function() {
      Loading(false);
      alert(lang.LANG_CONFIG_SSL_CERT_GENERATE_ERR);
    },
  });
}
function SSLReading()
{
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
  if (url.indexOf("/LDAP/") != -1) {
    document.getElementById("ldap").style.display = "none";
    document.getElementById("label_ldap").style.display = "none";
  }

  if (url.indexOf("/HTTPS/") != -1) {
    document.getElementById("http").style.display = "none";
    document.getElementById("label_https").style.display = "none";
  }

  var ajax_url = url;
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onSuccess : SSLReadingResult,
    onFailure : function() {
      Loading(false);
    },
  });
}

function SSLReadingResult(arg)
{
    Loading(false);
    if (arg.readyState == 4 && arg.status == 200) {
        var sslinfo = JSON.parse(arg.responseText);
        var validform =
            sslinfo.ValidNotBefore; // sslstatus[0].getAttribute("VALID_FROM");
        var validuntil =
            sslinfo.ValidNotAfter; // sslstatus[0].getAttribute("VALID_UNTIL");
        var getcertURL = sslinfo['@odata.id'];
        var crtflag = 1;//parseInt(sslstatus[0].getAttribute("CERT_EXIST"),10);
        var validformstatus=lang.LANG_CONFIG_SSL_NOAVAILBALE;
        var validuntilstatus=lang.LANG_CONFIG_SSL_NOAVAILBALE;

        var data_arr = [];

        if(crtflag != 0) {
            exists_cert = true;
        }

        if(validform != "Not Available") {
          validformstatus = validform.replace("T", " "); // ToLocale(validform);
        }

        if(validuntil != "Not Available") {
          validuntilstatus =
              validuntil.replace("T", " "); // ToLocale(validuntil);
        }
        var deleteCert = "";
        if (getcertURL.indexOf("/Truststore/") != -1) {
          deleteCert =
              '<input type="image" id="truststore_cert" img src="/images/bin.png" style="width: 15px;" class="killicon" onclick="deleteCertificate(\'' +
              getcertURL + '\')">';
        }
        var replaceCert = "";
        replaceCert =
            '<input type="image" img src="/images/replace.png" style="width: 15px;" class="killicon" onclick="btnReplaceCert(\'' +
            getcertURL + '\')">';
        data_arr.push([
          1, sslinfo.Description, "-", "-", validformstatus, validuntilstatus,
          replaceCert, deleteCert
        ]);

        dataTabObj.show(data_arr);
    }
}

function btnupload()
{
    var sslcrtvaild = new String(sslcrt.value);
    if(sslcrtvaild.length == 0)
    {
        alert(lang.LANG_CONFIG_SSL_SEL_CRTFILE);
        sslcrt.focus();
        return;
    }

    var privkeyvaild = new String(privkey.value);
    if(privkeyvaild.length == 0)
    {
        alert(lang.LANG_CONFIG_SSL_SEL_PRIKEYFILE);
        privkey.focus();
        return;
    }

    if(exists_cert) {
        UtilsConfirm(lang.LANG_CONFIG_SSL_CRTEXIST, {onOk: uploadkey});
    } else {
        uploadkey();
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
function replaceCertificate() {
  var file = document.getElementById("replacekey_file").files[0];
  var reader = new FileReader();
  reader.onloadend = function(e) {
    var data = {};
    data.CertificateString = e.target.result;
    data.CertificateType = "PEM";
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
        if (certVal.indexOf('LDAP') != -1) {
          rAlertMsg = lang.LANG_CONFIG_SSL_LDAP_CERTIFICATE_REPLACE_SUCCESS;
        }
        alert(rAlertMsg, {
          title : lang.LANG_GENERAL_SUCCESS,
          onClose : function() {
            if (certVal.indexOf('LDAP') == -1) {
              goLogout();
              location.href = "/";
            } else {
              location.reload();
            }
          }
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
  reader.readAsBinaryString(file);
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
      if (file_url.indexOf('LDAP') != -1) {
        alertMsg = lang.LANG_CONFIG_SSL_LDAP_CERTIFICATE_UPLOAD_SUCCESS;
      }
      alert(alertMsg, {
        title : lang.LANG_GENERAL_SUCCESS,
        onClose : function() {
          if (file_url.indexOf('LDAP') == -1) {
            goLogout();
            location.href = "/";
          } else {
            location.reload();
          }
        }
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
