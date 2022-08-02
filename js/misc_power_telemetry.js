/*Miscellaneous power telemetry page*/

var GridTable;
var DevID = [];
var DevTYPE = [];
var REG_Content = new Array();
var REG_count= 16;
var totalItem= 0;
var TableTitles = [["Register Index", "25%", "center"],
                   ["Register Address", "25%", "left"],
                   ["Energy Counter (MJ)", "25%", "left"],
                   ["Timestamp", "25%", "left"],
                  ];
        
window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit(){
    top.frames.topmenu.document.getElementById("frame_help").src =  "../help/" + lang_setting + "/misc_power_telemetry_hlp.html";
    var telemetry_Dev_type = document.getElementById("telemetry_Dev_type");
    var HtmlRegTable = document.getElementById("HtmlRegTable");

	PowerTableInit();
	document.getElementById("caption_div").textContent = lang.LANG_MISC_POWER_TELEMETRY;
	document.getElementById("type_lbl").textContent = lang.LANG_MISC_POWER_TELEMETRY_DEV_TYPE;
	//check user Privilege          
	CheckUserPrivilege(PrivilegeCallBack);
	telemetry_Dev_type.onchange= takeRegContent;
}

function PowerTableInit(){
	GridTable = GetTableElement();
	//replace table header content with string table
    TableTitles[0][0] = lang.LANG_MISC_POWER_TELEMETRY_REGISTER_INDEX;
    TableTitles[1][0] = lang.LANG_MISC_POWER_TELEMETRY_REGISTER_ADDRESS;
    TableTitles[2][0] = lang.LANG_MISC_POWER_TELEMETRY_ENERGY_COUNTER;
    TableTitles[3][0] = lang.LANG_MISC_POWER_TELEMETRY_TIME_STAMP;
	GridTable.setColumns(TableTitles);
	GridTable.init('GridTable', HtmlRegTable);
}
function PrivilegeCallBack(Privilege)
{
	//full access
        if (Privilege == '04' || Privilege == '03')
        {
            getPowertelemetry();
        }
        else
        {
            //no access
            location.href = SubMainPage;
            return;
        }
}

function getPowertelemetry() {}
function showPowertelemetry(arg)
{
	Loading(false);
	var RowData = [];
        if(arg.xhr.readyState== 4 && arg.xhr.status== 200){
        	var misc_power_telemetry = JSON.parse(arg.xhr.responseText);	
		totalItem= telemetry.length;

		for (var i=0; i< totalItem; i++){
			DevID.push(telemetry[i].power_telemetry_dev_id);
			DevTYPE.push(array.getString('nmpwrtelemetry', '0x0'+ telemetry[i].power_telemetry_dev_type));

			if(browser_ie)
                		telemetry_Dev_type.add(new Option('Device ID:'+ DevID[i] +' - '+DevTYPE[i], (i+1)), i);
        		else
                		telemetry_Dev_type.add(new Option('Device ID:'+ DevID[i] +' - '+DevTYPE[i], (i+1)), null);

			// get REG content
			REG_Content[i]= new Array(REG_count);			
			for (var j=0; j< REG_count; j++){
				if(telemetry[i].register_details[j] != null){
					// REG content [count][REG_ID]= offset, value, timestamp,reg_index
					REG_Content[i][j]= new Array(4);
					var reg_add="0x"+parseInt(telemetry[i].register_details[j].power_telemetry_dev_reg_address).toString(16);
					REG_Content[i][j][0]= reg_add; // offset
					REG_Content[i][j][1]= telemetry[i].register_details[j].power_telemetry_dev_reg_energy_counter; // value
					REG_Content[i][j][2]= displayTimestamp(telemetry[i].register_details[j].power_telemetry_dev_reg_timestamp); // timestamp
					REG_Content[i][j][3]= telemetry[i].register_details[j].power_telemetry_dev_reg_index; // reg_index
				}
			}
		}

        	telemetry_Dev_type.selectedIndex= 0;
		var count= 1;
		for (var j=0; j< REG_count; j++){
			if(REG_Content[0][j] != undefined){
				var num = new Number (REG_Content[0][j][1]);
				num /= 1000000000; //transform milli to mega
				RowData.push([count, 
					REG_Content[0][j][3], //REG ID
					REG_Content[0][j][0], //offset
					num.toFixed(9), // value
					REG_Content[0][j][2] //timestamp
					]);
				count+= 1;
			}
		}
		GridTable.empty();
                GridTable.show(RowData);
	}
}
function displayTimestamp(timestamp)
{
   var selDateObj = new Date(timestamp*1000).toString().split(" ").splice(0, 5);
    var time = selDateObj.slice(0, -2).join(" ") +" "+ selDateObj[4] +" "+ selDateObj[3];//Base64.decode(SEL[i].getAttribute(prop));
    return time;
}

function takeRegContent(){
	Loading(true);
	setTimeout(showRegContent, 500);
}
function showRegContent(){
	Loading(false);
	var count= 1;
	var RowData = [];
	for(var i=0; i< totalItem; i++){
		if(telemetry_Dev_type.selectedIndex == i){
			for (var j=0; j< REG_count; j++){
				if(REG_Content[i][j] != undefined){
					var num = new Number (REG_Content[i][j][1]);
					num /= 1000000000; //transform milli to mega
					RowData.push([count,
						REG_Content[i][j][3],
						REG_Content[i][j][0],
						num.toFixed(9),
						REG_Content[i][j][2],
					]);
					count+= 1;
				}
			}
			break;
		}
	}
	GridTable.empty();
	GridTable.show(RowData);
}
array.getString = function(widget, token)
{
	var optBit = arguments[2];
	if (token== "")
        	return " ";
        else if (widget== "")
        	return "DEVERROR: String class not specified";
        // First look for string group
        if (array[widget+"_type"]!= undefined) {
        	//Optional bit check
                if(optBit!= undefined && array[widget+"_type"][token][optBit]!= undefined) {
                    return array[widget+"_type"][token][optBit];
                }
                else if (optBit!= undefined && array[widget+"_type"][token][optBit]== undefined) {
                    return "Unknown";
                }

                if (array[widget+"_type"][token]!= undefined) {
                    return array[widget+"_type"][token];
                }
        } 
	else {
		if (top.array[widget+"_type"]!= undefined) {
                	//Optional bit check
                    	if(optBit!= undefined && top.array[widget+"_type"][token][optBit]!= undefined)
                        	return top.array[widget+"_type"][token][optBit];

                    	if (top.array[widget+"_type"][token]!= undefined)
                        	return top.array[widget+"_type"][token];
                } 
		else {
                    	if (array.global_str!= undefined) {
                        	//Optional bit check
                        	if(optBit!= undefined && array.global_str[token][optBit]!= undefined)
                            		return array.global_str[token][optBit];

                        	if (array.global_str[token]!= undefined)
                            		return array.global_str[token];
                    	}
                }
	}
	return "DEVERROR: Cannot locate string array."+widget+"_type["+token+"]"+(optBit!= undefined)?"["+optBit+"]":"";
}
