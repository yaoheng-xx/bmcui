var custom = null;
var $jq = jQuery.noConflict();

var PRIV_ID = top.PRIV_ID; // initial it at UserPrivilegeHandler() @ utils.js
var CSRF_TOKEN = "";
var MENUITEM_ACTIVE = 0;
var MENUITEM_GRAY = 1;
var MENUITEM_INVISIBLE = 2;
var BoardNeedStrorage = false;

window.addEventListener('load', PreloadPageInit);


/* remove unused LoginFast Cookie, used for login only*/
EraseCookie("LoginFast");

if(CSRF_TOKEN == null || CSRF_TOKEN.length < 1) {
    requestNewCSRFToken();
    CreateCookie("Authenticated", "1");
}

function GetBoardInfo() {
  PageInit2();
}

/*
     Initialize and render the MenuBar when its elements are ready
     to be scripted.
*/
function RefreshMenuData(custom_obj){
    custom = custom_obj;
    submenu_obj = [
      {
        id : "sys",
        index : "system",
        label : lang.LANG_TOPMENU_SYSTEM,
        itemdata : [
          {
            text : lang.LANG_SYSTEM_SUBMENU_SYSTEM_INFO,
            onclick : {fn : function() { page_mapping('system', 'sys_info') }},
            index : "sys_info" /*,
grayout: 0*/
          },
          {
            text : lang.LANG_SYSTEM_SUBMENU_FRU_INFO,
            onclick : {fn : function() { page_mapping('system', 'sys_fru') }},
            index : "sys_fru" /*,
grayout: 0*/
          },
          {
            text : lang.LANG_SYSTEM_SUBMENU_CPU_INFO,
            onclick : {fn : function() { page_mapping('system', 'sys_cpu') }},
            index : "sys_cpu" /*,
grayout: 0*/
          },
          {
            text : lang.LANG_SYSTEM_SUBMENU_DIMM_INFO,
            onclick : {fn : function() { page_mapping('system', 'sys_dimm') }},
            index : "sys_dimm" /*,
grayout: 0*/
          },
          {
            text : lang.LANG_SYSTEM_SUBMENU_NIC_INFO,
            onclick : {fn : function() { page_mapping('system', 'sys_nic') }},
            index : "sys_nic" /*,
grayout: 0*/
          },
          {
            text : lang.LANG_SYSTEM_SUBMENU_NVME_INFO,
            onclick :
                {fn : function() { page_mapping('system', 'sys_nvme_info') }},
            index : "sys_nvme_info" /*,
 grayout: 0*/
          },
          {
            text : lang.LANG_SYSTEM_STORAGE_INFO,
            onclick : {
              fn : function() { page_mapping('system', 'sys_storage_info') }
            },
            index : "sys_storage_info" /*, grayout: 0*/
          },
          {
            text : lang.LANG_SYSTEM_SUBMENU_CURRENTUSERS_INFO,
            onclick : {
              fn : function() { page_mapping('system', 'sys_currentusers') }
            },
            index : "sys_currentusers" /*, grayout: 0*/
          }
        ]
      },

      {
        id : "server_health",
        index : "health",
        label : lang.LANG_TOPMENU_SERVER_HEALTH,
        itemdata : [
          {
            text : lang.LANG_SERVER_HEALTH_SUBMENU_SENSOR_READINGS,
            onclick :
                {fn : function() { page_mapping('health', 'servh_sensor') }},
            index : "servh_sensor"
          },
          // { text: "Sensor Live Reading", onclick: {fn:
          // function() {page_mapping('health', 'servh_sensor_reading')}},
          // index: "servh_sensor_reading"},
          {
            text : lang.LANG_SERVER_HEALTH_SUBMENU_EVENT_LOG,
            onclick :
                {fn : function() { page_mapping('health', 'servh_event') }},
            index : "servh_event"
          }
        ]
      },

      {
        id : "config",
        index : "configuration",
        label : lang.LANG_TOPMENU_CONFIGURATION,
        itemdata : [
          {
            text : lang.LANG_CONFIG_SUBMENU_ALERT,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_alert') }
            },
            index : "config_alert"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_ALERT_EMAIL,
            onclick : {
              fn : function() {
                page_mapping('configuration', 'config_alert_email')
              }
            },
            index : "config_alert_email"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_IPV4_NETWORK,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_ipv4') }
            },
            index : "config_ipv4"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_IPV6_NETWORK,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_ipv6') }
            },
            index : "config_ipv6"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_VLAN,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_vlan') }
            },
            index : "config_vlan"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_NTP_CONFIGUTRATION,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_ntp') }
            },
            index : "config_ntp"
          },/*
          {
            text : lang.LANG_CONFIG_SUBMENU_LDAP,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_ldap') }
            },
            index : "config_ldap"
          },*/
          {
            text : lang.LANG_CONFIG_SUBMENU_SOFT_LICENSE,
            onclick : {
              fn : function() {
                page_mapping('configuration', 'config_software_licensing')
              }
            },
            index : "config_software_licensing"
          },
          {
            text : lang.LANG_CONFIG_ACTIVE_DIRECTORY,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_ad') }
            },
            index : "config_ad"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_SSL,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_ssl') }
            },
            index : "config_ssl"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_USER,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_usr') }
            },
            index : "config_usr"
          },
          // { text: lang.LANG_CONFIG_SUBMENU_SECURITY_SETTINGS, onclick: {fn:
          // function() {page_mapping('configuration',
          // 'config_security_settings')}}, index: "config_security_settings"},
          {
            text : lang.LANG_CONFIG_SUBMENU_SECURITY_SETTINGS,
            onclick : {
              fn : function() {
                page_mapping('configuration',
                             'config_no_smash_security_settings')
              }
            },
            index : "config_no_smash_security_settings"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_SDR_FW,
            onclick : {
              fn : function() { page_mapping('configuration', 'config_sdr_fw') }
            },
            index : "config_sdr_fw"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_FWUPD,
            onclick : {
              fn : function() {
                page_mapping('configuration', 'config_fw_update')
              }
            },
            index : "config_fw_update"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_OOB_FWUPD,
            onclick : {
              fn : function() {
                page_mapping('configuration', 'config_oob_fwupdate')
              }
            },
            index : "config_oob_fwupdate"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_CPLD_UPD,
            onclick : {
              fn : function() {
                page_mapping('configuration', 'config_cpld_update')
              }
            },
            index : "config_cpld_update"
          },
          {
            text : lang.LANG_CONFIG_SUBMENU_RSYS_LOG_IP,
            onclick : {
              fn :
                  function() { page_mapping('configuration', 'config_rsys_ip') }
            },
            index : "config_rsys_ip"
          },
          {
            text : lang.LANG_THERMAL_MANAGEMENT,
            onclick : {
              fn : function() {
                page_mapping('configuration', 'config_thermal_management')
              }
            },
            index : "config_thermal_management"
          }
        ]
      },

      {
        id : "remote_control",
        index : "remote",
        label : lang.LANG_TOPMENU_REMOTE_CONTROL,
        itemdata : [
          {
            text : lang.LANG_REMOTE_CNTRL_SUBMENU_CONSOLE_REDIRECTION,
            onclick : {fn : function() { page_mapping('remote', 'man_ikvm') }},
            index : "man_ikvm"
          },
          {
            text : lang.LANG_REMOTE_CNTRL_SUBMENU_POWER_CONTROL,
            onclick : {
              fn : function() { page_mapping('remote', 'server_power_control') }
            },
            index : "server_power_control"
          },
          {
            text : lang.LANG_REMOTE_CNTRL_SUBMENU_LAUNCH_SOL,
            onclick : {fn : function() { page_mapping('remote', 'man_sol') }},
            index : "man_sol"
          },
          {
            text : lang.LANG_REMOTE_CNTRL_SUBMENU_VIRTUAL_FRONT_PANEL,
            onclick :
                {fn : function() { page_mapping('remote', 'v_front_panel') }},
            index : "v_front_panel"
          }
        ]
      },
      {
        id : "virtual_media",
        index : "vmedia",
        label : lang.LANG_TOPMENU_VIRTUAL_MEDIA,
        itemdata : [
          {
            text : lang.LANG_VM_SUBMENU_VM_HTML5,
            onclick : {fn : function() { page_mapping('vmedia', 'vmedia') }},
            index : "vmedia"
          },
          {
            text : lang.LANG_VM_SUBMENU_WEB_ISO,
            onclick : {fn : function() { page_mapping('vmedia', 'vm_webiso') }},
            index : "vm_webiso"
          },
        ]
      },
      {
        id : "server_diag",
        index : "serverdiag",
        label : lang.LANG_TOPMENU_SERVER_DIAGNOSTICS,
        itemdata : [
          {
            text : lang.LANG_SERVER_DIAGNOSTICS_SUBMENU_SYS_DIAGNOSTICS,
            onclick :
                {fn : function() { page_mapping('serverdiag', 'servd_diag') }},
            index : "servd_diag"
          },
          {
            text : lang.LANG_SERVER_DIAGNOSTICS_SUBMENU_POST_CODES,
            onclick : {
              fn : function() { page_mapping('serverdiag', 'servd_postcodes') }
            },
            index : "servd_postcodes"
          },
          {
            text : lang.LANG_SERVER_DIAGNOSTICS_SUBMENU_DEFAULTS,
            onclick : {
              fn : function() {
                page_mapping('serverdiag', 'main_factorydefault')
              }
            },
            index : "main_factorydefault"
          }
        ]
      },
      {
        id : "misc",
        index : "miscellaneous",
        label : lang.LANG_TOPMENU_MISCELLANEOUS,
        itemdata : [
          {
            text : lang.LANG_MISC_SUBMENU_NM_CONFIG,
            onclick : {
              fn :
                  function() { page_mapping('miscellaneous', 'misc_nm_config') }
            },
            index : "misc_nm_config"
          },
          {
            text : lang.LANG_MISC_SUBMENU_POWER_STATISTICS,
            onclick : {
              fn : function() {
                page_mapping('miscellaneous', 'misc_power_statistics')
              }
            },
            index : "misc_power_statistics"
          }
        ]
      }
    ];
    document.getElementById("cr").textContent =  lang.LANG_COMMON_COPYRIGHT;
    document.getElementById("_headerlogouttxt").textContent = lang.LANG_HEADER_LOGOUT;
    document.getElementById("_headerrefreshtxt").textContent = lang.LANG_HEADER_REFRESH;
    document.getElementById("_headerabouttxt").textContent = lang.LANG_HEADER_ABOUT;
    document.getElementById("_headerhelptxt").textContent = lang.LANG_HEADER_HELP;
    document.getElementById("system").textContent = lang.LANG_TOPMENU_SYSTEM;
    document.getElementById("health").textContent = lang.LANG_TOPMENU_SERVER_HEALTH;
    document.getElementById("configuration").textContent = lang.LANG_TOPMENU_CONFIGURATION;
    document.getElementById("remote").textContent = lang.LANG_TOPMENU_REMOTE_CONTROL;
    document.getElementById("vmedia").textContent = lang.LANG_TOPMENU_VIRTUAL_MEDIA;
    document.getElementById("serverdiag").textContent = lang.LANG_TOPMENU_SERVER_DIAGNOSTICS;
    document.getElementById("miscellaneous").textContent = lang.LANG_TOPMENU_MISCELLANEOUS;
    if (BoardNeedStrorage) {
      submenu_obj.push({
        id : "storage",
        index : "storageController",
        label : lang.LANG_TOPMENU_STORAGE,
        itemdata : [
          {
            text : lang.LANG_SYSTEM_STORAGE_ADAPTER_INFO,
            onclick : {
              fn : function() {
                page_mapping('storageController', 'storage_adapter')
              }
            },
            index : "storage_adapter"
          },
          {
            text : lang.LANG_SYSTEM_STORAGE_PHYSICAL_DEVICE_INFO,
            onclick : {
              fn : function() {
                page_mapping('storageController', 'storage_physical')
              }
            },
            index : "storage_physical"
          },
          {
            text : lang.LANG_SYSTEM_STORAGE_LOGICAL_DEVICE_INFO,
            onclick : {
              fn : function() {
                page_mapping('storageController', 'storage_logical')
              }
            },
            index : "storage_logical"
          }
        ]
      });
      document.getElementById("storageController").textContent = lang.LANG_TOPMENU_STORAGE;
    }
}

function RemoveSubmenuCpld()
{
    var itemdata_len;
    var submenu_count = submenu_obj.length;

    for (var i = 0; i < submenu_count; i++) {
        if (submenu_obj[i].index != "configuration")
            continue;
        itemdata_len = submenu_obj[i].itemdata.length;
        for (var j = 0; j < itemdata_len; j++) {
            if (submenu_obj[i].itemdata[j].index == "config_cpld_update") {
                submenu_obj[i].itemdata.splice(j, 1);
                break;
            }
        }
        break;
    }

}

function isMenuCustomDisabled(mainidx, subidx) {
    if (custom && 'menus' in custom) {
    if (mainidx in custom.menus &&
              subidx in custom.menus[mainidx] &&
              'visible' in custom.menus[mainidx][subidx]) {
            visible = custom.menus[mainidx][subidx].visible;
            //console.log('custom menubar: ' + mainidx + ', ' + subidx + ' visible: ' + visible);
            if ('0' == visible) {
                return true;
            }
        }
    }
    return false;
}

function DrawMenuBar(){
    YAHOO.util.Event.onContentReady("productsandservices", function () {

    /*
                    Instantiate a MenuBar:  The first argument passed to the constructor
                    is the id for the Menu element to be created, the second is an
                    object literal of configuration properties.
    */

    var oMenuBar = new YAHOO.widget.MenuBar("productsandservices", {
                                                autosubmenudisplay: true,
                                                hidedelay: 750,
                                                lazyload: true });

    /*
         Define an array of object literals, each containing
         the data necessary to create a submenu.
    */

    var aSubmenuData = submenu_obj;


    /*
         Subscribe to the "beforerender" event, adding a submenu
         to each of the items in the MenuBar instance.
    */
    oMenuBar.subscribe("beforeRender", function ()
    {
        var nSubmenus = aSubmenuData.length;
        var i;

        if (this.getRoot() == this) {
            for (i = 0; i < nSubmenus; i++)
            {
                for (j = 0; j < aSubmenuData[i].itemdata.length; j++) {
                    // removed;
                    if (isMenuCustomDisabled(aSubmenuData[i].index, aSubmenuData[i].itemdata[j].index)) {
                        aSubmenuData[i].itemdata[j].disabled = true;
                    }
                }
                this.getItem(i).cfg.setProperty("submenu", aSubmenuData[i]);
            }
        }
    });

    /*
         Call the "render" method with no arguments since the
         markup for this MenuBar instance is already exists in
         the page.
    */

    oMenuBar.render();

});
}
/*global variable*/
var isHermon = 0;
var isAspeed = 0;
var isPilot3 = 0;
var isUID = 1;
var NMEnable = 0;
var c_mainpage, c_subpage;
var gHelpOpen = false;//INTEL-online

function do_logout()
{
    UtilsConfirm(lang.LANG_GENERAL_LOGOUT, {onOk: goLogout});
}
function do_refresh()
{
    MainFrame.location.reload();
}
function closeHelp()
{
    gHelpOpen=false;
    document.getElementById("td_help").style.display = "none";
}

function openHelp()
{
    document.getElementById("td_help").style.display = "block";
}

function toggleHelp()
{
    gHelpOpen = !gHelpOpen;
    if(gHelpOpen)
    {
        openHelp();
    }else
    {
        closeHelp();
    }
}

function do_change_lan()
{
    if(document.getElementById("lang_select").value == "en")
    {
        CreateCookie("langSetFlag","1");
        CreateCookie("language","English");
        top.lang_setting = "English";
    }else{
        CreateCookie("langSetFlag","1")
        CreateCookie("language","Japanese");
        top.lang_setting = "Japanese";
    }
    parent.frames.topmenu.location.reload();
}

function iframe_onload()
{
    adjustIFramesHeightOnLoad(document.getElementById("frame_main"));
}

function adjustIFramesHeightOnLoad(iframe) {
    var iframeHeight = Math.max(iframe.contentWindow.window.document.documentElement.scrollHeight,
                                iframe.contentWindow.window.document.body.scrollHeight);
    iframeHeight += 20;
    iframe.style.height = iframeHeight;
}

function clearChilds(node)
{
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function page_mapping(mainpage, subpage)
{
    /*main page [doris] test switch page*/
    var page;
    CreateCookie("mainpage", mainpage);
    CreateCookie("subpage", subpage);
    c_mainpage = mainpage;
    c_subpage = subpage;
    if(subpage == 'top'){
        if ( mainpage == 'miscellaneous' && isHermon     == 1)
        {
            page = 'miscellaneous0';
        }
        else if ( mainpage == 'miscellaneous' && isHermon == 0 && NMEnable == 0)
        {
            page = 'miscellaneous1';
        }
        else if (mainpage == 'miscellaneous' && isAspeed == 0 && NMEnable == 1)
        {
                page = 'miscellaneous2';
        }
        else if (mainpage == 'miscellaneous' && isAspeed == 1 && NMEnable == 1 && isUID == 1)
        {
                page = 'miscellaneous4';
        }
        else if (mainpage == 'miscellaneous' && isAspeed == 1 && NMEnable == 1)
        {
                page = 'miscellaneous3';
        }
        else if ( mainpage == 'miscellaneous' && isAspeed == 1)
        {
            page = 'miscellaneous0';
        }
        else
        {
            page = mainpage.toString();
        }
        var str= '/page?url_name=' + page;
        document.getElementById("frame_main").src = str;
    }
    else
    {
      if(subpage == "config_fw_update" || subpage == "v_front_panel" ){
          stopTimer();
      }else{
          startTimer();
      }
      var str= '/page/' + subpage+'.html';
      document.getElementById("frame_main").src = str;
    }

    /*sidebar page*/
    var sidbar_pool = document.getElementById("sidebar");
    /*clear sidebar*/
    while(sidbar_pool.rows.length > 0)
        sidbar_pool.deleteRow(sidbar_pool.rows.length - 1);

    var submenu_count = submenu_obj.length;

    /*tile*/
    var i, j, idx, selected_obj;
    for (idx = 0; idx < submenu_count; idx++)
    {
        selected_obj = document.getElementById(submenu_obj[idx].index);
        if( mainpage == submenu_obj[idx].index ) {
            i = idx;
            selected_obj.style.fontWeight = "bold";
        }
        else {
            selected_obj.style.fontWeight = "";
        }
    }
    var tr = document.getElementById('sidebar').insertRow(-1);
    var td = tr.insertCell(0);
    tr.className = 'submenu_position';
    var submenu_len = submenu_obj[i].itemdata.length;
    var aElement;

    for(j=0; j < submenu_len; j++)
    {
        aElement = document.createElement('a');
        if (submenu_obj[i].itemdata[j].onclick) {
            aElement.onclick = submenu_obj[i].itemdata[j].onclick.fn;
            aElement.href = "#";
        } else {
            aElement.href = submenu_obj[i].itemdata[j].url;
        }
        aElement.textContent = submenu_obj[i].itemdata[j].text;
        div = document.createElement('div');
        div.className = 'submenu_line';
        if (isMenuCustomDisabled(submenu_obj[i].index, submenu_obj[i].itemdata[j].index)) {
            submenu_obj[i].itemdata[j].grayout = MENUITEM_INVISIBLE;
            aElement.className = "submenu_removed"
            div.className += " submenu_removed"
        }
        if(submenu_obj[i].itemdata[j].grayout == MENUITEM_GRAY) {
        } else if(submenu_obj[i].itemdata[j].grayout == MENUITEM_INVISIBLE) {
            aElement.style.color = "gray";
            aElement.href="#";
            aElement.className = "submenu_removed"
            div.className += " submenu_removed"
        }

        if(subpage == submenu_obj[i].itemdata[j].index)
            aElement.className += ' submenu_item_select';
        else
            aElement.className += ' submenu_item';
        td.appendChild(aElement);
        td.appendChild(div);
    }
}

function gray_out_by_priviledge()
{
    PRIVILEGE_LIMIT = PRIV_ID;
    var i, idx;
    var numSubmenuItems;
    var submenu_count = submenu_obj.length;
    let KCSMode = ReadCookie("KCSMode");
    for (idx = 0; idx < submenu_count; idx++)
    {
        //selected_obj = document.getElementById(submenu_obj[idx].index);
        if( submenu_obj[idx].index == "system") {
            numSubmenuItems = submenu_obj[idx].itemdata.length;
            for(i=0; i<numSubmenuItems; i++) {
                if(PRIVILEGE_LIMIT == '03' || PRIVILEGE_LIMIT == '02')
                {
                    if(submenu_obj[idx].itemdata[i].index=="sys_currentusers")
                        submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
                }
            }
        } else if(submenu_obj[idx].index == "configuration") {
            numSubmenuItems = submenu_obj[idx].itemdata.length;
            for(i=0; i<numSubmenuItems; i++) {
              if (submenu_obj[idx].itemdata[i].index == "config_ipv4" ||
                  submenu_obj[idx].itemdata[i].index == "config_ipv6" ||
                  submenu_obj[idx].itemdata[i].index == "config_usr" ||
                  submenu_obj[idx].itemdata[i].index == "config_vlan" ||
                  submenu_obj[idx].itemdata[i].index == "config_alert" ||
                  submenu_obj[idx].itemdata[i].index ==
                      "config_no_smash_security_settings" ||
                  submenu_obj[idx].itemdata[i].index == "config_sdr_fw" ||
                  submenu_obj[idx].itemdata[i].index ==
                      "config_thermal_management") {
                if (PRIVILEGE_LIMIT == '02') { // user
                  submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
                }
                if (PRIVILEGE_LIMIT == '03') { // oper
                  submenu_obj[idx].itemdata[i].grayout = MENUITEM_GRAY;
                }
              } else if (submenu_obj[idx].itemdata[i].index ==
                         "config_fw_update") {
                if (PRIVILEGE_LIMIT == '02' || PRIVILEGE_LIMIT == '03') {
                  submenu_obj[idx].itemdata[i].grayout = MENUITEM_GRAY;
                }
              } else if (submenu_obj[idx].itemdata[i].index == "config_ssl") {
                if (PRIVILEGE_LIMIT == '02' || PRIVILEGE_LIMIT == '03') {
                  submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
                }
              }
            }
        } else if(submenu_obj[idx].index == "remote") {
            numSubmenuItems = submenu_obj[idx].itemdata.length;
            for(i=0; i<numSubmenuItems; i++) {
              if (submenu_obj[idx].itemdata[i].index == "man_sol" ||
                  submenu_obj[idx].itemdata[i].index == "man_ikvm") {
                if (PRIVILEGE_LIMIT == '02' || PRIVILEGE_LIMIT == '03') {
                  submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
                  submenu_obj[idx].itemdata[i].url = "#";
                }
              }
            }
        } else if(submenu_obj[idx].index == "vmedia") {
            numSubmenuItems = submenu_obj[idx].itemdata.length;
            for(i=0; i<numSubmenuItems; i++) {
              if (submenu_obj[idx].itemdata[i].index == "vm_webiso" ||
                  submenu_obj[idx].itemdata[i].index == "vmedia") {
                if (PRIVILEGE_LIMIT == '02' || PRIVILEGE_LIMIT == '03') {
                  submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
                  submenu_obj[idx].itemdata[i].url = "#";
                }
              }
            }
        } else if(submenu_obj[idx].index == "serverdiag") {
            numSubmenuItems = submenu_obj[idx].itemdata.length;
            for(i=0; i<numSubmenuItems; i++) {
                if(submenu_obj[idx].itemdata[i].index=="main_factorydefault") {
                    if(PRIVILEGE_LIMIT == '02' || PRIVILEGE_LIMIT == '03') { //only Administor can view
                        submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
                    }
                } else if(submenu_obj[idx].itemdata[i].index=="servd_postcodes") {
                           if(PRIVILEGE_LIMIT == '02') {
                               submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
                           }
                }
            }
        } else if(submenu_obj[idx].index == "maintenance") {
            numSubmenuItems = submenu_obj[idx].itemdata.length;
            for(i=0; i<numSubmenuItems; i++) {
                if(PRIVILEGE_LIMIT == '02') {
                    submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
                } else if(PRIVILEGE_LIMIT == '03') {
                    submenu_obj[idx].itemdata[i].grayout = MENUITEM_GRAY;
                }
            }
        } else if(submenu_obj[idx].index == "miscellaneous") {
            numSubmenuItems = submenu_obj[idx].itemdata.length;
            for(i=0; i<numSubmenuItems; i++) {
                if (submenu_obj[idx].itemdata[i].index == "misc_nm_config" ||
                    submenu_obj[idx].itemdata[i].index == "misc_power_statistics")
                {
                    if ((PRIVILEGE_LIMIT == '02') || (PRIVILEGE_LIMIT == '03')) {
                        submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
                    }
                }
            }
        } else if (submenu_obj[idx].index == "storageController") {
          numSubmenuItems = submenu_obj[idx].itemdata.length;
          for (i = 0; i < numSubmenuItems; i++) {
            if ((PRIVILEGE_LIMIT == '02') || (PRIVILEGE_LIMIT == '03')) {
              submenu_obj[idx].itemdata[i].grayout = MENUITEM_INVISIBLE;
            }
          }
        }
    }
}

var gIgnoreResetTimer = null;
var gSessionExpiredTimer = null;
var gHeartbeatTimestamp = 0;

function resetIdleTimer() {
    //reset timer
    if(gIgnoreResetTimer == null) {
        gIgnoreResetTimer = setTimeout(clearIdleTimer, 5000);
        //resetSessionExpired();
    }
}

function clearIdleTimer() {
    gIgnoreResetTimer = null;
}


function eventlog(x, y) {
    //$("#result").html("x:" + x + ", y:" + y);
}

jQuery(document).ready(function() {
    jQuery(document).bind("mousemove", function(e){
        resetIdleTimer();
});

jQuery(document).bind("keypress", function(e){
        resetIdleTimer();
    });
});

function onSessionExpired() {
    checkSessionExpired();
}

function launchSessionExpiredTimer() {
    if(gSessionExpiredTimer != null) {
        clearInterval(gSessionExpiredTimer);
        gSessionExpiredTimer = null;
    }
    var expiredTimeout = ReadCookie("gSESSIONTIMEOUT");
    if(expiredTimeout && parseInt(expiredTimeout) < 0) {
        return; // disable timeout check, leave without enable timer to check session
    }
    if(expiredTimeout == null || parseInt(expiredTimeout) < 10000) {
        //default interval of session check timer.
        expiredTimeout = 10000;//10sec
    }
    gSessionExpiredTimer = setInterval(onSessionExpired, expiredTimeout);
}

function lanuchSessionHeartbeatTimer() {
    /********************************************************
    This event listener only for safari,
    There is timer latency issue on Safari when screen blanks,
    so we do not prefereed heartbeat process in Safari.
    we use window/tab close event listener to fix this issue.
    ********************************************************/
    var browser_info = GetBrowserInfo();
    if(browser_info == "safari") {
        initSafariChecker();
    }
    else {
        mHeartbeatTimer.start();  // the first run.
    }
}

function getPlatformName() {
  var ajax_url = '/redfish/v1/Chassis';
  var ajax_req = new Ajax.Request(ajax_url, {
    method : 'GET',
    onComplete : function(res) {
      if (res.readyState == 4 && res.status == 200) {
        var response = JSON.parse(res.responseText);
        for (var i = 0; i < response.Members.length; i++) {
          var url = response.Members[i]["@odata.id"];
          if (url.indexOf("_Baseboard") != -1) {
            var board = url.substring(url.lastIndexOf("/"));
            if (board.includes("FCP")) {
              BoardNeedStrorage = true;
              break;
            }
          }
        }
        loadCustomStrings(RefreshMenuData);
        PageInit();
      }
    },
    onFailure : function() {
      loadCustomStrings(RefreshMenuData);
      PageInit();
    }
  })
}

function KCSModeStatus()
{
  var ajaxUrl = "/redfish/v1/Systems/system";
  var ajaxData = new Ajax.Request(ajaxUrl, {
    method : 'GET',
    onSuccess : readKCSModeStatus,
    onFailure : function() { console.log("Error in Getting System Informations!!"); }
  });
}

function PreloadPageInit() {
    var CSRF_TOKEN1 = ReadCookie("XSRF-TOKEN", true);
    getPlatformName();
}

function PageInit()
{
    checkSessionExpired();
    //launchSessionExpiredTimer();  //fw update launch sessiotimer
    lanuchSessionHeartbeatTimer();
    CreateCookie("KCSMode", "allow_all");
    if (ReadCookie("KCSMode") == null) {
        KCSModeStatus();
    }
    document.getElementById("td_help").style.display = "none";//default is hidden

    document.getElementById("_headerlogoutlink").addEventListener("click", do_logout);
    document.getElementById("_headerlogoutlink").addEventListener("mouseover",
            function() {
                icon_over('_headerlogoutimg', '../images/logout_over.png');
            });
    document.getElementById("_headerlogoutlink").addEventListener("mouseout",
            function() {
                icon_over('_headerlogoutimg', '../images/logout.png');
            });

    document.getElementById("_headerrefreshlink").addEventListener("click", do_refresh);
    document.getElementById("_headerrefreshlink").addEventListener("mouseover",
            function() {
                icon_over('_headerrefreshimg', '../images/refresh_over.png');
            });
    document.getElementById("_headerrefreshlink").addEventListener("mouseout",
            function() {
                icon_over('_headerrefreshimg', '../images/refresh.png');
            });

    document.getElementById("_headerhelplink").addEventListener("click", toggleHelp);
    document.getElementById("_headerhelplink").addEventListener("mouseover",
            function() {
                icon_over('_headerhelpimg', '../images/help_over.png');
            });
    document.getElementById("_headerhelplink").addEventListener("mouseout",
            function() {
                icon_over('_headerhelpimg', '../images/help.png');
            });

    document.getElementById("_headeraboutlink").addEventListener("click", do_about);
    document.getElementById("_headeraboutlink").addEventListener("mouseover",
            function() {
                icon_over('_headeraboutimg', '../images/about_over.png');
            });
    document.getElementById("_headeraboutlink").addEventListener("mouseout",
            function() {
                icon_over('_headeraboutimg', '../images/about.png');
            });

    document.getElementById("system").addEventListener("click",
            function() {
                page_mapping('system', 'sys_info');
            });

    document.getElementById("health").addEventListener("click",
            function() {
                page_mapping('health', 'servh_sensor');
            });

    document.getElementById("configuration").addEventListener("click",
            function() {
                page_mapping('configuration', 'config_alert');
            });

    document.getElementById("remote").addEventListener("click",
            function() {
                page_mapping('remote', 'man_ikvm');
            });

    document.getElementById("vmedia").addEventListener("click",
            function() {
                page_mapping('vmedia', 'vmedia');
            });

    // document.getElementById("vmedia").addEventListener("click",
    //         function() {
    //             page_mapping('vmedia', 'vm_html5');
    //         });

    document.getElementById("serverdiag").addEventListener("click",
            function() {
                page_mapping('serverdiag', 'servd_diag');
            });

    document.getElementById("miscellaneous").addEventListener("click",
            function() {
                page_mapping('miscellaneous', 'misc_nm_config');
            });
    if (BoardNeedStrorage) {
      document.getElementById("storageController")
        .addEventListener("click", function() {
          page_mapping('storageController', 'storage_adapter');
        });
        document.getElementById("storageController").show();
    }
    GetBoardInfo();

    var nodeObj;
    var nodeImg;
    // LOGOUT
    document.getElementById('_headerlogoutlink').onmouseover = function()
    {
        nodeObj = document.getElementById('_headerlogouttxt');
        nodeObj.className = 'topmenu_text_hover';
        nodeImg = document.getElementById('_headerlogoutimg');
        nodeImg.src = '../images/logout_over.png';
    }
    document.getElementById('_headerlogoutlink').onmouseout = function()
    {
        nodeObj = document.getElementById('_headerlogouttxt');
        nodeObj.className = 'topmenu_text';
        nodeImg = document.getElementById('_headerlogoutimg');
        nodeImg.src = '../images/logout.png';
    }
    // REFRESH
    document.getElementById('_headerrefreshlink').onmouseover = function()
    {
        nodeObj = document.getElementById('_headerrefreshtxt');
        nodeObj.className = 'topmenu_text_hover';
        nodeImg = document.getElementById('_headerrefreshimg');
        nodeImg.src = '../images/refresh_over.png';
    }
    document.getElementById('_headerrefreshlink').onmouseout = function()
    {
        nodeObj = document.getElementById('_headerrefreshtxt');
        nodeObj.className = 'topmenu_text';
        nodeImg = document.getElementById('_headerrefreshimg');
        nodeImg.src = '../images/refresh.png';
    }
    // HELP
    document.getElementById('_headerhelplink').onmouseover = function()
    {
        nodeObj = document.getElementById('_headerhelptxt');
        nodeObj.className = 'topmenu_text_hover';
        nodeImg = document.getElementById('_headerhelpimg');
        nodeImg.src = '../images/help_over.png';
    }
    document.getElementById('_headerhelplink').onmouseout = function()
    {
        nodeObj = document.getElementById('_headerhelptxt');
        nodeObj.className = 'topmenu_text';
        nodeImg = document.getElementById('_headerhelpimg');
        nodeImg.src = '../images/help.png';
    }
    // ABOUT
    document.getElementById('_headeraboutlink').onmouseover = function()
    {
        nodeObj = document.getElementById('_headerabouttxt');
        nodeObj.className = 'topmenu_text_hover';
        nodeImg = document.getElementById('_headeraboutimg');
        nodeImg.src = '../images/about_over.png';
    }
    document.getElementById('_headeraboutlink').onmouseout = function()
    {
        nodeObj = document.getElementById('_headerabouttxt');
        nodeObj.className = 'topmenu_text';
        nodeImg = document.getElementById('_headeraboutimg');
        nodeImg.src = '../images/about.png';
    }
    //gray_out_by_priviledge();
}

function PageInit2(response) {
  gray_out_by_priviledge();
  DrawMenuBar();

  isAspeed = 1;
  NMEnable = 1;

  if(ReadCookie("langSetFlag") == "1") {
      CreateCookie("langSetFlag","0");
      if(ReadCookie("mainpage") == null || ReadCookie("subpage") == null) {
          CreateCookie("mainpage", "system");
          CreateCookie("subpage", "sys_info");
          page_mapping('system', 'sys_info');
      } else {
          page_mapping(ReadCookie("mainpage"), ReadCookie("subpage"));
      }
  } else {
      page_mapping('system', 'sys_info');
  }
  resetIdleTimer();
}

function icon_over(img_name, img_src) {
    var nodeImg = document.getElementById(img_name);
    nodeImg.src = img_src;
}

var mHeartbeatTimer = {
    id: Date.now(),
    timer_delay: g_heartbeat_interval,
    handler:null,
    start: function() {
        // mHeartbeatTimer.handler = setTimeout(mHeartbeatTimer.ontimer, mHeartbeatTimer.timer_delay);
        //console.log("timer-" + mHeartbeatTimer.id + ": start);
    },
    restart: function() {
        //console.log("timer-" + mHeartbeatTimer.id + ": restart");
        mHeartbeatTimer.stop();
        mHeartbeatTimer.start();
    },
    stop: function() {
        // if(mHeartbeatTimer.handler != null) {
        //     //console.log("timer-" + mHeartbeatTimer.id + ": remove");
        //     clearTimeout(mHeartbeatTimer.handler);
        //     mHeartbeatTimer.handler = null;
        // }
    },
    ontimer: function() {
        var host_url = "";
        var data={};
        var ajax_url = '/api/chassis-status';
        var CSRFTOKEN = getCSRFToken();
        
        var object= JSON.stringify(data);
        var myAjax = new Ajax.Request(host_url+ajax_url,
                                      {method: 'get',
                                       contentType: "json",
                                       timeout: 2000,
                                       onSuccess: mHeartbeatTimer.onHeartbeatComplete,
                                        onFailure: {}
                                    }
                                     );
    },
    onHeartbeatComplete: function(originalRequest) {
        var launchNextTimer = true;
        if (originalRequest.readyState == 4 && originalRequest.status == 200){
        } else if (originalRequest.readyState == 4 && originalRequest.status == 401) {
            clearSessionInfo();
            alert(lang.LANG_CONFIG_WEBSESSION_EXPIRED, {onClose: function(){
                location.href = "/page"; //"/";
            }});            
        }
        //set next timer to check heartbeat after this time heartbeat check complete.
        if(launchNextTimer == true) {
            mHeartbeatTimer.restart();
        }
    }
}
