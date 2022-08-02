/*Miscelilaneous power telemetry page*/

var GridTable;
var DevID = [];
var DevTYPE = [];
var REG_Content = new Array();
var REG_count= 16;
var totalItem= 0;
var index_value = 0;
var prev_index = 0;
var btnModifyPolicy;
var btnCancelPolicy;
const Max_limit = 65536;
var TableTitles = [["Key Value", "25%", "center"],
                   ["Bios Variable Descripton", "25%", "center"],
                   ["Value", "25%", "center"],
                   ["SavedValue", "25%", "center"],
                  ];

var Bios_Variables =  new Array();
var Bios_Variables_only_val =  new Array();
var  Bios_Variables_val = new Array();
var  Bios_Variables_set = new Array();
var  Bios_Variable_depex = new Array();
var  Bios_Variable_Newdepex = new Array();
var  Bios_Variable_saved = new Array();
var  Bios_Var_val_only = new Array();
var  Bios_Var_name = new Array();
var idx = 0;
var  Bios_Variable_pending = new Array();
var  Bios_Variable_pending_display = 0;
var  Bios_Variable_modified = 0;




var page_bios_type_name_mapping_table = {
    //bios_config_nic_config:                     "NIC Configuration",
    /*bios_config_pci_config:                     "PCI Configuration",
    bios_config_serial_port_config:             "Serial Port Configuration",
    bios_config_upi_config:                     "UPI Configuration",
    bios_config_io_config:                      "Integrated IO Configuration",
    bios_config_memory_config:                  "Memory Configuration",
    bios_config_pwr_n_perform_config:           "Power n Performance",
    bios_config_processor_config:               "Processor Configuration",
    bios_config_mass_storage_ctrl_config:       "Mass Storage Controller Configuration",
    bios_config_sys_acoustic_perform_config:    "System Acoustic and Performance Configuration",*/
    //bios_config_sys_event_log:                  "0x2d",//"System Event Log",
    bios_config_hw_val_test:                    "0x3",//Advanced
    bios_config_fpga_config:                    "0x37",//socket configuration
    bios_config_icc_spread_spec_config:         "0x18c",//platform
    bios_config_security:                       "0x14",//security
    //bios_config_usb_config:                     "USB Configuration",
    bios_config_server_management:              "0x2c",//"Server Management",
    bios_config_advanced_boot_options:          "0x22",//Advanced Boot options
    //bios_config_main:                           "0x2",
};

var query_bios_type;
var bios_config_login = "";

var clickedPageID="";


// newly added code starts
var pageIDs=[];
var parentIDs =[];
var finalPageIds = [];

Resources = {
   
    "Members": [
        {"type":"Config","name":""},
        // {"type":"Layout","name":"/bios/SetupData.xml"}
        {"type":"Layout","name":"/api/config/SetupData"}
    ]
}

AttributeRegistry = {} ;
CurrentAttributes = {} ;
FutureAttributes = {} ;
var SelfUrl = "" ;
Config = null ;

var BMCADDRESS = "/redfish/v1/Registries/" ;

Delta = {
            "Attributes":{
                
            }
        }

var Bios_set_up_data=[];

var Bios_Register_Attribute_Json_Data = []; 
var Bios_Attribute_Data=[];



window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit(){
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/bios_config_oob_hlp.html";
    Bios_var_type = document.getElementById("Bios_var_type");
    Bios_var_value = document.getElementById("Bios_var_value");
    HtmlRegTable = document.getElementById("HtmlRegTable");

    BiosTableInit();
    var name;
    var page=localStorage.getItem("pageClick");//getParamValue('page_click');

    switch(page) {
        //case 'bios_config_nic_config':                  name = lang.LANG_BIOS_CONFIGURATION_NIC_CONFIG_TITLE;
        //                                                break;
        /*case 'bios_config_pci_config':                  name =  lang.LANG_BIOS_CONFIGURATION_PCI_CONFIG_TITLE;
                                                        break;
        case 'bios_config_serial_port_config':          name = lang.LANG_BIOS_CONFIGURATION_SERIAL_PORT_CONFIG_TITLE;
                                                        break;
        case 'bios_config_upi_config':                  name = lang.LANG_BIOS_CONFIGURATION_UPI_CONFIG_TITLE;
                                                        break;
        case 'bios_config_io_config':                   name = lang.LANG_BIOS_CONFIGURATION_INTEGRATED_IO_CONFIG_TITLE;
                                                        break;
        case 'bios_config_memory_config':               name = lang.LANG_BIOS_CONFIGURATION_MEMORY_CONFIG_TITLE;
                                                        break;
        case 'bios_config_pwr_n_perform_config':        name = lang.LANG_BIOS_CONFIGURATION_PWR_N_PERFORM_TITLE;
                                                        break;
        case 'bios_config_processor_config':            name = lang.LANG_BIOS_CONFIGURATION_PROCESSOR_CONFIG_TITLE;
                                                        break;
        case 'bios_config_mass_storage_ctrl_config':    name = lang.LANG_BIOS_CONFIGURATION_MASS_STORAGE_CTRL_CONFIG_TITLE;
                                                        break;
        case 'bios_config_sys_acoustic_perform_config': name = lang.LANG_BIOS_CONFIGURATION_SYS_ACOUSTIC_PERFORM_CONFIG_TITLE;
                                                        break;*/
        //case 'bios_config_sys_event_log':               name = lang.LANG_BIOS_CONFIGURATION_SYS_EVENT_LOG_TITLE;
                                                        //break;
        case 'bios_config_hw_val_test':                 name = lang.LANG_BIOS_CONFIG_SUBMENU_BIOS_ADVANCED_CONFIG;
                                                       break;
        case 'bios_config_fpga_config':                 name = lang.LANG_BIOS_CONFIG_SUBMENU_BIOS_SOCKET_CONFIG;
                                                        break;
        case 'bios_config_icc_spread_spec_config':      name = lang.LANG_BIOS_CONFIG_SUBMENU_BIOS_PLATFORM_CONFIG;
                                                        break;
        case 'bios_config_security':                    name = lang.LANG_BIOS_CONFIGURATION_SECURITY_TITLE;
                                                        break;
        /*case 'bios_config_usb_config':                  name = lang.LANG_BIOS_CONFIGURATION_USB_CONFIG_TITLE;
                                                        break;*/
        case 'bios_config_server_management':           name = lang.LANG_BIOS_CONFIGURATION_SERVER_MANAGEMENT_TITLE;
                                                        break;
        case 'bios_config_advanced_boot_options':       name = lang.LANG_BIOS_CONFIGURATION_ADVANCED_BOOT_OPTIONS_TITLE;
                                                        break;
        //case 'bios_config_main':                        name = lang.LANG_BIOS_CONFIGURATION_MAIN_TITLE;
         //                                               break;
        default                                :        name = lang.LANG_BIOS_CONFIGURATION_PCI_CONFIG_TITLE;
                                                        page = 'bios_config_pci_config';
                                                        break;
    }

    query_bios_type = page_bios_type_name_mapping_table[page];
    clickedPageID=query_bios_type;
    console.log(query_bios_type);
    GLOBAL_REDFISH_DATA= window.sessionStorage.redfish_data;

    document.getElementById("caption_div").textContent = name;
    document.getElementById("bios_var_lbl").textContent = lang.LANG_BIOS_CFG_BIOS_VAR_SELECT;
    document.getElementById("bios_value_lbl").textContent = lang.LANG_BIOS_CFG_BIOS_VAR_VALUE;

    //check user Privilege
    CheckUserPrivilege(PrivilegeCallBack);

    Bios_var_type.onchange= takeRegContent;
    Bios_var_value.onchange= takeVarContent;

    btnModifyPolicy = document.getElementById("btn_modify");
    btnModifyPolicy.setAttribute("value",lang.LANG_BIOS_CONFIGURATION_BTNSAV);
    btnCancelPolicy = document.getElementById("btn_cancel");
    btnCancelPolicy.setAttribute("value",lang.LANG_BIOS_CONFIGURATION_BTNCANCEL);

    HtmlRegBiosTable=document.getElementById("HtmlRegTable").getElementsByTagName("table")[0];


    btnModifyPolicy.onclick = function() {
        setBiosvarables();

    }

    btnCancelPolicy.onclick = function() {
        //cancel
        location.reload();
    }
}


function ParseBios_OOB_Capbilities(originalRequest)
{
    Loading(false);

    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
         var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
         var xmldoc=GetResponseXML(response);
         if(xmldoc == null)
         {
            SessionTimeout();
            alert(lang.LANG_BIOS_CFG_OFF_NOTE);
            return;
         }
         //check session & privilege.
        if (CheckInvalidResult(xmldoc) < 0) {
            return;
         }
         var IPMIRoot = xmldoc.documentElement;
         var OOB_INFO = IPMIRoot.getElementsByTagName('OOB_INFO');
         var ENABLE_STATE  = OOB_INFO[0].getElementsByTagName('OOB_ENABLE_STATE');
         var bios_config_enable_value = ENABLE_STATE[0].getAttribute("BIOS_CONFIG_ENABLE");
         if(bios_config_enable_value == 'No'){
             alert(lang.LANG_CONFIG_BIOS_OOB_CFG_NO_SUPPORT);
             return ;
         }
         getsavedBiosvariables();
         getBiosvariables();
   }
}

function CheckBios_OOB_Capabilities() {}


function getParamValue(paramName)
{
    var url = window.location.search.substring(1);//get rid of "?" in querystring
    var qArray = url.split('&');//get key-value pairs
    for(var i = 0; i < qArray.length; i++)
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName)
            return pArr[1]; //return value
    }
}



function BiosTableInit()
{
    GridTable = GetTableElement();
    //replace table header content with string table
    TableTitles[0][0] = lang.LANG_BIOS_CFG_KEY_VALUE;
    TableTitles[1][0] = lang.LANG_BIOS_CFG_BIOS_VAR_DESC;
    TableTitles[2][0] = lang.LANG_BIOS_CFG_VALUE;
    TableTitles[3][0] = lang.LANG_BIOS_CFG_SAVED_VALUE;

    GridTable.setColumns(TableTitles);
    GridTable.init('GridTable', HtmlRegTable);

}
function PrivilegeCallBack(Privilege)
{
    //full access
    if (Privilege == '04' || Privilege == '03')
    {
        let KCSMode = ReadCookie("KCSMode");
        if (KCSMode == "allow_all") {
           //CheckBios_OOB_Capabilities();
           Loading(true);
           getSystemInstanceURL();
        } else {
           alert(lang.CONF_KCS_BIOS_WARNING_NO_SUPPORT);
        }
    }
    else
    {
        //no access
        location.href = SubMainPage;
        return;
    }
}

function getBiosvariables() {}

function setBiosvarables()
{
    Loading(true);
   
        CHANGED = false;
        var tableNode=document.getElementById("BodyRows");
        
        Delta.Attributes={};
        
        for(var i=0;i<Bios_Attribute_Data.length;i++){
        
            if(Bios_Attribute_Data[i]== undefined) continue;
            if(Bios_Attribute_Data[i][1].Value.length==0) continue;

            var current_value=(CurrentAttributes[Bios_Attribute_Data[i][2].AttributeName]==null)?"Unknown":CurrentAttributes[Bios_Attribute_Data[i][2].AttributeName];
            if(current_value !=true && current_value!=false)
            current_value=current_value.toString().substring(Bios_Register_Attribute_Json_Data[i][0].AttributeName.length, current_value.length);


            if(HtmlRegBiosTable.rows[i+1].cells[2].innerText 
                != HtmlRegBiosTable.rows[i+1].cells[3].innerText){

            //if(HtmlRegBiosTable.rows[i+1].cells[2].innerText 
              //  != current_value.toString()){
    
            var DKEYS = Object.keys(Delta.Attributes);
                var att=Bios_Attribute_Data[i][2].AttributeName;
                var txt=HtmlRegBiosTable.rows[i+1].cells[3].innerText;
                if(HtmlRegBiosTable.rows[i+1].cells[2].innerText.replace(/\s/g, '')== "true" ||
                    HtmlRegBiosTable.rows[i+1].cells[2].innerText.replace(/\s/g, '')=="false")
                {   var temp=(HtmlRegBiosTable.rows[i+1].cells[2].innerText.replace(/\s/g, '')=="true")?true:false;
                    Delta.Attributes[Bios_Attribute_Data[i][2].AttributeName] =temp;    
                } else {
                    Delta.Attributes[Bios_Attribute_Data[i][2].AttributeName] =Bios_Attribute_Data[i][2].AttributeName+HtmlRegBiosTable.rows[i+1].cells[2].innerText.replace(/[&\/\\\-#, +()$~%.'":*?_<>{}]/g, '');
                }
                CHANGED = true ;
            } else {
                    console.log("inside not matching else value");
                    Loading(false);
            }
                
        }   
            
             var content = JSON.stringify(Delta, null, 2);
              var params = content;
                

              if(CHANGED==true){

                UtilsConfirm("Are you sure to perform this operation?", {
                    onOk: function() {
                        //invoke save call here

            var url = SelfUrl +"/Bios/Settings" ;
            var xmlhttp = new XMLHttpRequest();

            //console.log("inside save " +url);
            
            xmlhttp.open("PATCH", url, true);
            xmlhttp.setRequestHeader("If-Match","*") ;
            xmlhttp.setRequestHeader("Content-Type","application/json") ;
            xmlhttp.setRequestHeader ("Authorization", "Basic " + GLOBAL_REDFISH_DATA);
            xmlhttp.onreadystatechange = function(){
                
                if ((xmlhttp.readyState==4) && (xmlhttp.status==200 || xmlhttp.status==204)){
                    CHANGED = false ;
                    var message="Data Saved Successfully  "+lang.LANG_BIOS_CFG_BIOS_NOTE;
                     alert(message, {onClose: function() {
                        location.reload();
                    }});                    
                }
                else if ((xmlhttp.readyState==4) &&(xmlhttp.status!=200) && (xmlhttp.status != 201)){
                    var responsetext = JSON.parse(xmlhttp.responseText);
                    alert(responsetext.error.message);
                    CHANGED = false ;
                    Loading(false);
                }
            }
            xmlhttp.send(params) ;
                    },
                    onCancel: function(){
                        Loading(false);
                    }
                });
            }
}



function setvarBiosvarables(originalRequest)
{

    document.getElementById("note_div").textContent = lang.LANG_BIOS_CFG_BIOS_NOTE;
    Bios_Variables[prev_index][2] = Bios_Variables_set[4];
    Loading(false);

    Bios_Variable_saved[idx]= Bios_Variables_set[0];
    idx++;
    Bios_Variable_saved[idx]= Bios_Variables_set[2];
    idx++;
    Bios_Variable_saved[idx]= Bios_Variables_set[3];
    idx++;

    showRegContent();

}

function showBiosvariables(originalRequest)
{
    Loading(false);
    var RowData = [];
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc=GetResponseXML(response);
        if(xmldoc == null)
        {
            SessionTimeout();
            alert(lang.LANG_BIOS_CFG_OFF_NOTE);
            return;
        }
        //check session & privilege.
        if (CheckInvalidResult(xmldoc) < 0) {
            return;
        }
        var result = GetXMLNodeValue(xmldoc, "RESULT");
        if (result == "FAIL") {
            alert(lang.LANG_MISC_POWER_TELEMETRY_ERR1);
            return;
        }
        var IPMIRoot= xmldoc.documentElement;//point to IPMI
        var BiosSetup= IPMIRoot.getElementsByTagName('BIOS_SETUP');
        var biosvariable= BiosSetup[0].getElementsByTagName('BIOS_SETUP_VAR');
        totalItem= biosvariable.length;

        var Enforce = biosvariable[0].getAttribute('ENFORCE');
        if(Number(Enforce) == 1)
        {
            location.href = bios_config_login;
        }


        var k = 0;
        for (var j=0; j< totalItem; j++){
            Bios_Variables[j] =  new Array();
            Bios_Variables_only_val[j] = new Array();
            Bios_Variables[j][0]  = biosvariable[j].getAttribute('REG_IDX'+ j); // offset
            Bios_Variables[j][1]  = biosvariable[j].getAttribute('REG_IDX'+ j+'_DESC'); // value
            Bios_Variables[j][2]  = biosvariable[j].getAttribute('REG_IDX'+ j+'_VAL'); // value
            Bios_Variables_only_val[j][2]  = biosvariable[j].getAttribute('REG_IDX'+ j+'_VAL'); // value
            Bios_Var_val_only[j] = Bios_Variables[j][2].slice(3, 4);
           // Bios_Variable_depex[j] = biosvariable[j].getAttribute('DEPEX'+ j);
             Bios_Variable_depex[j] = "TRUE"; // Work around to fix HSD 1506934430 and 2103623988, untill depex feature is implemented ( which is in progress ).
            Bios_Var_name[j] = biosvariable[j].getAttribute('REG_IDX'+ j+'_NAME');
            Bios_Variable_Newdepex[j] = biosvariable[j].getAttribute('DEPEX_ANS');
            console.log(Bios_Variable_Newdepex[j]);

            for(var m=0; m<2 ;m++){
                var index  =  Bios_Variables[j][0].search(" ");
                if(index < 2){
                    Bios_Variables[j][0] = Bios_Variables[j][0].replace(" ","");
                }
            }

            if(biosvariable[j].getAttribute('REG_IDX'+ j+'_TYPE') == "oneof"){
                for (var i=3; i< (3 + Max_limit); i++){
                    Bios_Variables_val[k] = biosvariable[j].getAttribute('REG_IDX'+ k+'_OPTVAL');
                    if(Bios_Variables_val[k]==""){
                        k++;
                        break;
                    }
                    else{
                        if(Number(Bios_Variables[j][2]) == Number(biosvariable[j].getAttribute('REG_IDX'+ k+'_OPTVAL')))
                            Bios_Variables[j][2]  = biosvariable[j].getAttribute('REG_IDX'+ k+'_OPTVAL') + ' (' + biosvariable[j].getAttribute('REG_IDX'+ k+'_OPTTEXT') + ')';
                        Bios_Variables[j][i]  = biosvariable[j].getAttribute('REG_IDX'+ k+'_OPTVAL') + ' (' + biosvariable[j].getAttribute('REG_IDX'+ k+'_OPTTEXT') + ')'; // value

                        Bios_Variables_only_val[j][i]  = biosvariable[j].getAttribute('REG_IDX'+ k+'_OPTVAL'); // value
                        k++;
                    }
                }
            }else if(biosvariable[j].getAttribute('REG_IDX'+ j+'_TYPE') == "numeric"){
                var Maximum = Number(biosvariable[j].getAttribute('REG_IDX'+ j+'_MAXIMUM'));
                var step = Number(biosvariable[j].getAttribute('REG_IDX'+ j+'_STEP'));
                if (Maximum >= Max_limit)
                    Maximum = Max_limit;
                if (step<1)
                    step=1;
                for (var i=3; i<= (3 + (Number(Maximum) - Number(biosvariable[j].getAttribute('REG_IDX'+ j+'_MINIMUM'))) / step); i++){
                    Bios_Variables[j][i]  = "0x" + (((i - 3) * step) + Number(biosvariable[j].getAttribute('REG_IDX'+ j+'_MINIMUM'))).toString(16); // value
                    Bios_Variables_only_val[j][i]  = "0x" + (((i - 3) * step) + Number(biosvariable[j].getAttribute('REG_IDX'+ j+'_MINIMUM'))).toString(16); // value

                }
            }else{
                for (var i=3; i< (3 + 2); i++){
                    Bios_Variables[j][i]  = "0x" + (i - 3).toString(16);
                    Bios_Variables_only_val[j][i]  = "0x" + (i - 3).toString(16);
                }
            }
        }

        var tmp_count = 0;
        for (var i=0; i< totalItem; i++){
            var optind = 0;
            if((Bios_Variable_Newdepex[i] == "Suppressed") || (Bios_Variable_Newdepex[i] == "Disabled")) {
              continue;
            }
            if(tmp_count == 0)
                tmp_count = i;
            if((Bios_Variable_Newdepex[0] == "Active") || (Bios_Variable_Newdepex[0] == "Grayed Out")) {
              tmp_count = 0;
            }
            Bios_var_type.add(new Option(Bios_Variables[i][0],i),
                              window.ActiveXObject ? optind++ : null);
        }

        if (!((Bios_Variable_Newdepex[tmp_count] == "Suppressed") ||
              (Bios_Variable_Newdepex[tmp_count] == "Disabled")
             ))
        {
            var j=0;
            for(var i=2; i<= 2+ Max_limit; i++) {
                var optind = 0;

                if(Bios_Variables[0][i] === undefined){
                    break;
                }

                if(Bios_Variable_Newdepex[tmp_count] == "Grayed Out") {
                    Bios_var_value.disabled = true;
                } else {
                    Bios_var_value.disabled = false;
                }

                Bios_var_value.add(new Option(Bios_Variables[tmp_count][i], j),
                                   window.ActiveXObject ? optind++ : null);

                if ((Number(Bios_Variables[tmp_count][2]) == Number(Bios_Variables[tmp_count][i+1])) ||
                    (Bios_Variables[tmp_count][2] == Bios_Variables[tmp_count][i+1]))
                {
                    i++;
                }
                j++;
            }
        }

        var count= 1;
        for(var j=0; j< totalItem; j++) {
            Bios_Variable_modified = 0;
            for(var i=0; i<=Max_limit; i++) {
                if(Bios_Variable_pending[i*2] != undefined){
                    if(Bios_Variables[j][0] == Bios_Variable_pending[i*2]){
                        Bios_Variable_pending_display = Bios_Variable_pending[(i*2)+1];
                        Bios_Variable_modified = 1;
                    }
                }
                else {
                    if(Bios_Variable_modified === 0)
                        Bios_Variable_pending_display = Bios_Variables[j][2];
                    break;
                }
            }
            if((Bios_Variable_Newdepex[j] == "Suppressed") || (Bios_Variable_Newdepex[j] == "Disabled")) {
              continue;
            }
            RowData.push([count,
                       Bios_Variables[j][0],
                       Bios_Variables[j][1],
                       Bios_Variables[j][2],
                       Bios_Variable_pending_display
                       ]);
        }
        GridTable.empty();
        GridTable.show(RowData);
    }
}

function updateVarContent(){
    Loading(false);
    var RowData = [];

    var n=0;
    var l =0;
    var count= 1;
    for (var i=0; i< totalItem; i++){
        if(i == prev_index){
            var j=0;
            for (var k=0; k< Max_limit; k++){
                if((Number(Bios_Variables[i][k+3]) == Number(Bios_Variables[i][2])) || (Bios_Variables[i][k+3] == Bios_Variables[i][2])){
                    l = k;
                    break;
                }
            }
            if((Bios_var_value.selectedIndex) >=(l+1))
                j++;
            if((Bios_Variable_Newdepex[i] == "Suppressed") || (Bios_Variable_Newdepex[i] == "Disabled")) {
                prev_index++;
                continue;
            }
            RowData.push([count,
                        Bios_Variables[i][0],
                        Bios_Variables[i][1],
                        Bios_Variables[i][Bios_var_value.selectedIndex+2+j],
                        Bios_Variables[i][Bios_var_value.selectedIndex+2+j]
                        ]);
            for (var n=0;n<3;n++)
            {
                Bios_Variables_set[n] = Bios_Variables[i][n];
                if(n==2)
                    Bios_Variables_set[n] = Bios_Variables_only_val[i][Bios_var_value.selectedIndex+2+j];
            }
            Bios_Variables_set[3] = Bios_Variables_set[2].slice(2, 3);
            Bios_Variables_set[4] = Bios_Variables[i][Bios_var_value.selectedIndex+2+j];
            Bios_Variables_set[5] = Bios_Var_name[i];
        }
        else{
            Bios_Variable_modified = 0;
            for (var j=0; j<=Max_limit; j++){
                if(Bios_Variable_pending[j*2] != undefined){
                    if(Bios_Variables[i][0] == Bios_Variable_pending[j*2]){
                        Bios_Variable_pending_display = Bios_Variable_pending[(j*2)+1];
                        Bios_Variable_modified = 1;
                    }
                }
                else {
                    if(Bios_Variable_modified === 0)
                        Bios_Variable_pending_display = Bios_Variables[i][2];
                    break;
                }
            }
            if((Bios_Variable_Newdepex[i] == "Suppressed") || (Bios_Variable_Newdepex[i] == "Disabled")) {
                continue;
            }
            RowData.push([count,
                        Bios_Variables[i][0],
                        Bios_Variables[i][1],
                        Bios_Variables[i][2],
                        Bios_Variable_pending_display
                        ]);
        }
    }

    GridTable.empty();
    GridTable.show(RowData);
}


function showRegContent(){
    Loading(false);

    for (var i=0; i<=Max_limit; i++){
        var optind = 0;
        if(Bios_Variables[prev_index][i+2]===undefined){
            break;
        }
        Bios_var_value.remove(new Option(Bios_Variables[prev_index][i+2],i),window.ActiveXObject?optind++:null);
    }

    var countType = 0;
    var j=0;
    var dependancy = 0;
    for (var i=0; i<totalItem; i++){
        if((Bios_Variable_Newdepex[i] == "Suppressed") || (Bios_Variable_Newdepex[i] == "Disabled")) {
            countType++;
            continue;
        }
        if((Bios_var_type.selectedIndex+countType) == i){
            if(Bios_Variable_depex[i] != "TRUE"){
                for(var n=0;n<(totalItem*3);n = n+3){
                    if((Bios_Variable_depex[i].search(Bios_Variable_saved[n]) != -1) && (Bios_Variable_saved[n] != undefined  )){
                        if(Bios_Variable_depex[i].search(Bios_Variable_saved[n+2]) == -1){
                            dependancy = 2;
                            break;
                        }else {
                            dependancy = 1;
                            break;
                        }
                    }
                }
                for(var n=0;n<totalItem;n++){
                    if(dependancy == 0 ){
                        if(Bios_Variable_depex[i].search(Bios_Variables[n][0]) != -1){
                            if(Bios_Variable_depex[i].search(Bios_Var_val_only[n]) == -1){
                                dependancy = 2;
                                break;
                            }
                        }
                    }
                }
            }
            if((Bios_Variable_depex[i] == "TRUE") || (dependancy == 2)){
                prev_index = i;
                for (var k=2; k<=(2+Max_limit); k++){
                    var optind = 0;
                    if(Bios_Variables[i][k]===undefined){
                        break;
                    }
                    else {
                        if(Bios_Variable_Newdepex[i] == "Grayed Out") {
                            Bios_var_value.disabled = true;
                        } else {
                            Bios_var_value.disabled = false;
                        }
                        Bios_var_value.add(new Option(Bios_Variables[i][k],j),window.ActiveXObject?optind++:null);
                        if((Number(Bios_Variables[i][2]) == Number(Bios_Variables[i][k+1])) || (Bios_Variables[i][2] == Bios_Variables[i][k+1])){
                            k++;
                        }
                        j++;
                   }
                }
                break;
            } else {
                alert("Please Check Dependancy :" + Bios_Variable_depex[i]);
            }
        }
    }

}

function getsavedBiosvariables() {}

function showsavedBiosvariables(originalRequest)
{
    Loading(false);
    var RowData = [];
    if (originalRequest.readyState == 4 && originalRequest.status == 200)
    {
        var response = originalRequest.responseText.replace(/^\s+|\s+$/g,"");
        var xmldoc=GetResponseXML(response);
        if(xmldoc == null)
        {
            SessionTimeout();
            alert(lang.LANG_BIOS_CFG_OFF_NOTE);
            return;
        }
        //check session & privilege.
        if (CheckInvalidResult(xmldoc) < 0) {
            return;
        }
        var result = GetXMLNodeValue(xmldoc, "RESULT");
        if (result == "FAIL") {
            alert(lang.LANG_MISC_POWER_TELEMETRY_ERR1);
            return;
        }
        var IPMIRoot= xmldoc.documentElement;//point to IPMI
        var BiosSetup= IPMIRoot.getElementsByTagName('BIOS_SETUP_SAVE');
        var biosvariable= BiosSetup[0].getElementsByTagName('BIOS_SETUP_VAR_SAVE');
        totalItem= biosvariable.length;

        for (var j=0; j< totalItem; j++){
            Bios_Variable_pending[j]  = biosvariable[j].getAttribute('REG_IDX'+ j); // offset

        }

    }
}
//start my code
function readsetupdataxml(){
    var CSRFTOKEN = getCSRFToken();
    var xmlhttp = new XMLHttpRequest();
    // xmlhttp.open("get", "/bios/SetupData.xml", true);
    xmlhttp.open("get", "/api/config/SetupData", true);
    xmlhttp.setRequestHeader("X-CSRFTOKEN", CSRFTOKEN);
    xmlhttp.setRequestHeader("Content-Type","text/xml");
    xmlhttp.setRequestHeader("Accept","text/xml");
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            storesetupdataxml(this);
        }
    };
    xmlhttp.send(null);
}
        
function storesetupdataxml(xmlhttp){
    var xmlDoc = xmlhttp.responseXML.documentElement;
    removeWhitespace(xmlDoc);
    var pageId=clickedPageID; 
    Bios_set_up_data=[];
    finalPageIds=[];
    pageIDs=[];
    parentIDs=[];

    finalPageIds.push(pageId.toLowerCase());
    var rowData = xmlDoc.getElementsByTagName("Page");
    
    if(rowData.length){
        for(var i=0;i<rowData.length;i++){
                pageIDs.push(rowData[i].attributes.PageID.value.toLowerCase());
                parentIDs.push(rowData[i].attributes.PageParentID.value.toLowerCase());
        }
        //console.log("pageIDs", pageIDs);
        //console.log("parentIDs", parentIDs);
        if(finalPageIds.length > 0){
            getFinalPageIDs();
            for(i=0;i<finalPageIds.length;i++){
                getAttributeName(rowData, finalPageIds[i]);
            }
            //console.log("Bios_set_up_data", Bios_set_up_data);
        }
    }
    GetBIOSAttributeJsonValues();
}

function GetBIOSAttributeJsonValues(){
    Bios_Register_Attribute_Json_Data=[];
    Bios_Attribute_Data=[];
    var s=0;

        var text =AttributeRegistry;
        for(var j=0;j<Bios_set_up_data.length;j++){
            if(text.RegistryEntries== null) continue;
            for(var k=0;k<text.RegistryEntries.Attributes.length;k++){
                if(text.RegistryEntries.Attributes[k].AttributeName=="") continue;
                if(Bios_set_up_data[j]==text.RegistryEntries.Attributes[k].AttributeName && (text.RegistryEntries.Attributes[k].Type=="Enumeration" || text.RegistryEntries.Attributes[k].Type=="Boolean")){
                    Bios_Register_Attribute_Json_Data[s]=new Array();
                    Bios_Attribute_Data[s]=new Array();
                    
                    var value;
                    var valueArray=[];
                    //console.log(text.RegistryEntries.Attributes[k].Type);
                    if(text.RegistryEntries.Attributes[k].Type=="Enumeration"){
                    if(text.RegistryEntries.Attributes[k].Value==undefined) continue;
                    for(var l=0;l<text.RegistryEntries.Attributes[k].Value.length;l++){
                        valueArray.push({ValueDisplayName:text.RegistryEntries.Attributes[k].Value[l].ValueDisplayName},{ValueName:text.RegistryEntries.Attributes[k].Value[l].ValueName});
                        
                    }
                    }else if(text.RegistryEntries.Attributes[k].Type=="Boolean"){
                       valueArray.push({ValueDisplayName:"true"},{ValueName:"true"});
                       valueArray.push({ValueDisplayName:"false"},{ValueName:"false"});
                    }else {
                        console.log("another type");
                    }

                Bios_Attribute_Data[s].push({DisplayName:text.RegistryEntries.Attributes[k].DisplayName},{Value:valueArray},{AttributeName:text.RegistryEntries.Attributes[k].AttributeName});
                Bios_Register_Attribute_Json_Data[s].push({AttributeName:text.RegistryEntries.Attributes[k].AttributeName},{DisplayName:text.RegistryEntries.Attributes[k].DisplayName},{HelpText:text.RegistryEntries.Attributes[k].HelpText},{UefiNamespaceId:text.RegistryEntries.Attributes[k].UefiNamespaceId},{ReadOnly:text.RegistryEntries.Attributes[k].ReadOnly},{ResetRequired:text.RegistryEntries.Attributes[k].ResetRequired},{Type:text.RegistryEntries.Attributes[k].Type},{Value:valueArray},{DefaultValue:text.RegistryEntries.Attributes[k].DefaultValue});
                    s++;
                }
            }
        }

    getSavedFutureValues();
}

    function getSavedFutureValues(){
        FutureAttributes=[];
        var url = SelfUrl +"/Bios/Settings";
         var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("get", url, true);
        xmlhttp.setRequestHeader("Authorization", "Basic " + GLOBAL_REDFISH_DATA);
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var res =JSON.parse(xmlhttp.response);                    
                FutureAttributes=res.Attributes;
            }
            buildTable();
        };
        xmlhttp.send(null);
    }

        function buildTable(){
            var theTable = HtmlRegBiosTable;
            var newRow, newCell, i;
            var tableNode=theTable.getElementsByTagName('tbody')[0];
            console.log ("Number of rows: " + Bios_Register_Attribute_Json_Data.length);
            var k=0;
            var RowData = [];

            for (i=0; i<Bios_Register_Attribute_Json_Data.length; i++) {
                if(Bios_Register_Attribute_Json_Data[i]==undefined) continue;
                var saved_value="";
                //console.log(FutureAttributes);
                if(FutureAttributes != null) {
                    saved_value=(FutureAttributes[Bios_Register_Attribute_Json_Data[i][0].AttributeName]==null)?"":FutureAttributes[Bios_Register_Attribute_Json_Data[i][0].AttributeName];
                    if(saved_value !=true && saved_value!=false)
                    saved_value=saved_value.toString().substring(Bios_Register_Attribute_Json_Data[i][0].AttributeName.length, saved_value.length);
                 }

                var current_value=(CurrentAttributes[Bios_Register_Attribute_Json_Data[i][0].AttributeName]==null)?"":CurrentAttributes[Bios_Register_Attribute_Json_Data[i][0].AttributeName];
                if(current_value !=true && current_value!=false)
                current_value=current_value.toString().substring(Bios_Register_Attribute_Json_Data[i][0].AttributeName.length, current_value.length);

                //console.log("saved_value" +saved_value);

                //console.log("current_value" +current_value);
                if(saved_value.toString()=="") {
                    saved_value=current_value;
                } else {
                    current_value=saved_value;
                }

                RowData.push([i,
                    Bios_Register_Attribute_Json_Data[i][1].DisplayName.trim(),
                    Bios_Register_Attribute_Json_Data[i][2].HelpText,
                    current_value,
                    saved_value
                ]);
                
                k++;
            }   

            GridTable.empty();
            GridTable.show(RowData);
                
            for (i=0; i<Bios_Register_Attribute_Json_Data.length; i++) {
                    var row=HtmlRegBiosTable.rows[i+1];
                    if(Bios_Register_Attribute_Json_Data[i]==undefined) continue;
                    row.setAttribute("attribute_name",Bios_Register_Attribute_Json_Data[i][0].AttributeName);
            }
            
            removeOptions(Bios_var_type);
            removeOptions(Bios_var_value);
            binddropdownwithKeyValues();
            Loading(false);
        }

        function removeOptions(obj){
            var select1 = obj;
                var length = select1.options.length;
                for (var l = length-1; l >= 0; l--) {
                  select1.options[l] = null;
                }
        }

        function binddropdownwithKeyValues(){
           
        if(HtmlRegBiosTable.rows.length==0) return;
        for(var i=1;i<HtmlRegBiosTable.rows.length;i++){
            var option = document.createElement("option");
            option.text = HtmlRegBiosTable.rows[i].cells[0].innerText;
            option.value=i;
            Bios_var_type.add(option);
            var option1 = document.createElement("option");
            option1.text = HtmlRegBiosTable.rows[i].cells[2].innerText;
          }
          if(Bios_var_type.value=="") return;
          var sele= Bios_var_type.options[Bios_var_type.selectedIndex].text;
          
          for (i=0; i<Bios_Attribute_Data.length; i++) {
            
            if(Bios_Attribute_Data[i]== undefined) continue;
            
            if(sele.trim()==Bios_Attribute_Data[i][0].DisplayName.trim()){
                var val= Bios_Attribute_Data[i][1].Value;
                
                for(var k=0;k<Bios_Attribute_Data[i][1].Value.length;k=k+2){
                    var option2 = document.createElement("option");
                    option2.text =Bios_Attribute_Data[i][1].Value[k].ValueDisplayName;
                    Bios_var_value.add(option2);
                }
            }
          }


           var row_index=Bios_var_type.options[Bios_var_type.selectedIndex].value;
                //console.log("row_index"+row_index);
                var tbl_text=HtmlRegBiosTable.rows[row_index].cells[3].innerText;
                selectDropdownValue(Bios_var_value,tbl_text);
        }

        function takeRegContent(obj){
            var select_obj=obj;
            var sl=Bios_var_type;
            var sele= Bios_var_type.options[Bios_var_type.selectedIndex].text;
         
         for (i=0; i<Bios_Attribute_Data.length; i++) {
            if(Bios_Attribute_Data[i]== undefined) continue;      
            if(sele.trim()==Bios_Attribute_Data[i][0].DisplayName.trim()){
                removeOptions(Bios_var_value);
                
                var val= Bios_Attribute_Data[i][1].Value;
                for(var k=0;k<Bios_Attribute_Data[i][1].Value.length;k=k+2){
                    var option2 = document.createElement("option");
                    option2.text =Bios_Attribute_Data[i][1].Value[k].ValueDisplayName;
                    Bios_var_value.add(option2);
                }
            }

          }

          var row_index=Bios_var_type.options[Bios_var_type.selectedIndex].value;
                //console.log("row_index"+row_index);
          var tbl_text=HtmlRegBiosTable.rows[row_index].cells[3].innerText;

          selectDropdownValue(Bios_var_value,tbl_text);

        
        }
        function takeVarContent(){
        //console.log("inside takeVarContent");
        //update table
        var sele= Bios_var_type.options[Bios_var_type.selectedIndex].value;
        HtmlRegBiosTable.rows[sele].cells[2].innerText=Bios_var_value.options[Bios_var_value.selectedIndex].text;
        //HtmlRegBiosTable.rows[sele].cells[3].innerText=Bios_var_value.options[Bios_var_value.selectedIndex].text;
        
        
        }

        function selectDropdownValue(obj,tbl_text){
             var dd = obj;
                for (var i = 0; i < dd.options.length; i++) {
                    if (dd.options[i].text === tbl_text) {
                        dd.selectedIndex = i;
                        break;
                    }
                }
        }

    function getSystemInstanceURL(){
    var url = "/redfish/v1/Systems" ;
    var xmlhttp = createHttpRequest();
    xmlhttp.onreadystatechange = function(){

        if (xmlhttp.readyState==4 && (xmlhttp.status==200 || xmlhttp.status==201) ){
            var res = xmlhttp.responseText;
            var Obj = JSON.parse(res);

            SelfUrl = Obj.Members[0]["@odata.id"];
            getRemoteBiosResources();
        }
        else if (xmlhttp.readyState==4 && xmlhttp.status!=200 && xmlhttp.status!=201){
            var responsetext = JSON.parse(xmlhttp.responseText);
            alert(responsetext.error.message) ;
        }
    }
    xmlhttp.open("GET", url, true) ;
    xmlhttp.setRequestHeader ("Authorization", "Basic " + GLOBAL_REDFISH_DATA);
    xmlhttp.send() ;
}


function urlPath() {
                var protocol = location.protocol;
                var hostname = location.hostname;
                var port = location.port;
                //Urlpath should have port number too
                return (port != "") ? (protocol + "//" + hostname + ":" + port + "/") : (protocol + "//" + hostname);
            }

getRemoteBiosResources = function(){

    if(typeof Resources === "object" ){
        
        if(typeof Resources === "object" && typeof Resources.Members != undefined && Resources.Members.length > 0){
            var Members = Resources.Members ;
            var CSRFTOKEN = getCSRFToken();
            for(var i=0; i< Members.length; i++){

                if(Members[i].type == "Application")
                    continue ;

                var url = "" ;
                                
                if(Members[i].type == "Config"){
                    var url =  window.location.href  ;
                    url =urlPath(); //url.substring(0, url.lastIndexOf("/"));

                    if(url.toLowerCase().indexOf("bios")> -1){
                        url = url.substring(0, url.lastIndexOf("/")) ;
                    }
                    url += SelfUrl + "/Bios" ;
                }
                url += Members[i].name ;

                //console.log("url final urlPath" +url);
                
                var xmlhttpReq = createHttpRequest();
                xmlhttpReq.open("GET", url, true) ;
                xmlhttpReq.setRequestHeader("Authorization", "Basic " + GLOBAL_REDFISH_DATA);
                xmlhttpReq.setRequestHeader("Content-Type","text/xml");
                xmlhttpReq.setRequestHeader("Accept","text/xml");
                xmlhttpReq.setRequestHeader("X-CSRFTOKEN", CSRFTOKEN);
                xmlhttpReq.resourceType = Members[i].type ;
                xmlhttpReq.onreadystatechange = processResource ;
                xmlhttpReq.send() ;
            }//end-for
        }//end-if
    }//end-if
};

processResource = function(){
    
    var xmlhttp = this ;
    
    //console.log("inside processResource xmlhttp.readyState: "+xmlhttp.readyState +"   xmlhttp.status: "+xmlhttp.status);
    
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
        var res = xmlhttp.responseText ;
        
        switch(xmlhttp.resourceType) {
            case "AttributeRegistry" :
                AttributeRegistry = JSON.parse(res);
                break ;
            case "Layout"   : 
                SetupData = res; 
                break ;
            case "Config"   : 
                Config = JSON.parse(res);
                CurrentAttributes=Config.Attributes;
                var url = BMCADDRESS + Config.AttributeRegistry+".json" ;
                //console.log("BMCADDRESS url"+url);
                var xmlhttpReq = createHttpRequest();
                xmlhttpReq.resourceType = "AttributeRegistry"  ;
                xmlhttpReq.onreadystatechange = processResource ;
                xmlhttpReq.open("GET", url, true) ;
                xmlhttpReq.setRequestHeader("Authorization", "Basic " + GLOBAL_REDFISH_DATA);
                xmlhttpReq.send() ;
                break ;    
                
            default:
        };
        
        // Check that all resources are loaded...
        if((typeof SetupData == 'string') && (Config !== null) && (AttributeRegistry !== null)){
            readsetupdataxml();
        }
    }//end-if xmlhttp.readyState
    else if (xmlhttp.readyState==4 && xmlhttp.status==404){
        var responsetext = JSON.parse(xmlhttp.responseText);
        alert(lang.LANG_BIOS_CFG_OFF_NOTE);
        //alert(responsetext.error.message) ;
    }

};

function createHttpRequest(){
    var xmlhttp = null ;
    
    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest() ;
    }else  {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP") ;
    }   
    
    return xmlhttp ;
}

function removeWhitespace(xml) {
            var loopIndex;
            for (loopIndex = 0; loopIndex < xml.childNodes.length; loopIndex++)
            {
                var currentNode = xml.childNodes[loopIndex];
                if (currentNode.nodeType == 1)
                {
                    removeWhitespace(currentNode);
                }
                if (!(/\S/.test(currentNode.nodeValue)) && (currentNode.nodeType == 3))
                {
                    xml.removeChild(xml.childNodes[loopIndex--]);
                }
            }
        }

        //newly addes code starts
        function getFinalPageIDs(){
            for(i=0;i<finalPageIds.length;i++){
                for(j=0;j<pageIDs.length;j++){
                    if(parentIDs[j] != finalPageIds[i]){
                        continue;
                    }else{
                        if(!finalPageIds.includes(pageIDs[j])){
                            finalPageIds.push(pageIDs[j]);      
                        }
                    }
                }
            }
        }

        function getAttributeName(rowData, getAttrPageID){
            for(var i=0;i<rowData.length;i++){
                var attr= rowData[i].attributes.PageID.value.toLowerCase();
                if(getAttrPageID!=attr){
                    continue;
                }else{
                    for(j=0; j<rowData[i].childNodes.length; j++){
                        if(rowData[i].childNodes[j].attributes == null) {
                            continue;
                        }
                        var attribute_name= rowData[i].childNodes[j].attributes.AttributeName.value;
                        //console.log("fch" +fch);
                        if(attribute_name != ""){
                          if(!Bios_set_up_data.includes(attribute_name)) {
                                Bios_set_up_data.push(attribute_name);
                          }
                        }
                    }
                }
            }
        }
        //newly addes code ends
