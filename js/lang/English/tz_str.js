//;*****************************************************************;
//;*****************************************************************;
//;**                                                             **;
//;**     (C) COPYRIGHT American Megatrends Inc. 2008-2009        **;
//;**                     ALL RIGHTS RESERVED                     **;
//;**                                                             **;
//;**  This computer software, including display screens and      **;
//;**  all related materials, are confidential and the            **;
//;**  exclusive property of American Megatrends, Inc.  They      **;
//;**  are available for limited use, but only pursuant to        **;
//;**  a written license agreement distributed with this          **;
//;**  computer software.  This computer software, including      **;
//;**  display screens and all related materials, shall not be    **;
//;**  copied, reproduced, published or distributed, in whole     **;
//;**  or in part, in any medium, by any means, for any           **;
//;**  purpose without the express written consent of American    **;
//;**  Megatrends, Inc.                                           **;
//;**                                                             **;
//;**                                                             **;
//;**                American Megatrends, Inc.                    **;
//;**           5555 Oakbook Parkway, Building 200                **;
//;**     Norcross,  Georgia - 30071, USA. Phone-(770)-246-8600.  **;
//;**                                                             **;
//;*****************************************************************;
//;*****************************************************************;

//-------------------------------------//
// Time zone strings
//-------------------------------------//
"use strict";
var timezone = {};
timezone = {
		"US (Common)" : [
			{value:"America/Puerto_Rico", text: "Puerto Rico (Atlantic)", utc:"-04:00"},
			{value:"America/New_York", text: "New York (Eastern)", utc:"-05:00"},
			{value:"America/Chicago", text: "Chicago (Central)", utc:"-06:00"},
			{value:"America/Denver", text: "Denver (Mountain)", utc:"-07:00"},
			{value:"America/Phoenix", text: "Phoenix (MST)", utc:"-07:00"},
			{value:"America/Los_Angeles", text: "Los Angeles (Pacific)", utc:"-08:00"},
			{value:"America/Anchorage", text: "Anchorage (Alaska)", utc:"-09:00"},
			{value:"Pacific/Honolulu", text: "Honolulu (Hawaii)", utc:"-10:00"}
			],
		"America" : [
			{value:"America/Adak", text: "Adak", utc:"-10:00"},
			{value:"America/Anguilla", text: "Anguilla", utc:"-04:00"},
			{value:"America/Antigua", text: "Antigua", utc:"-04:00"},
			{value:"America/Araguaina", text: "Araguaina", utc:"-03:00"},
			{value:"America/Argentina/Buenos_Aires", text: "Argentina - Buenos Aires", utc:"-03:00"},
			{value:"America/Argentina/Catamarca", text: "Argentina - Catamarca", utc:"-03:00"},
			{value:"America/Argentina/ComodRivadavia", text: "Argentina - ComodRivadavia", utc:"-03:00"},
			{value:"America/Argentina/Cordoba", text: "Argentina - Cordoba", utc:"-03:00"},
			{value:"America/Argentina/Jujuy", text: "Argentina - Jujuy", utc:"-03:00"},
			{value:"America/Argentina/La_Rioja", text: "Argentina - La Rioja", utc:"-03:00"},
			{value:"America/Argentina/Mendoza", text: "Argentina - Mendoza", utc:"-03:00"},
			{value:"America/Argentina/Rio_Gallegos", text: "Argentina - Rio Gallegos", utc:"-03:00"},
			{value:"America/Argentina/Salta", text: "Argentina - Salta", utc:"-03:00"},
			{value:"America/Argentina/San_Juan", text: "Argentina - San_Juan", utc:"-03:00"},
			{value:"America/Argentina/San_Luis", text: "Argentina - San Luis", utc:"-03:00"},
			{value:"America/Argentina/Ushuaia", text: "Argentina - Ushuaia", utc:"-03:00"},
			{value:"America/Aruba", text: "Aruba", utc:"-04:00"},
			{value:"America/Asuncion", text: "Asuncion", utc:"-04:00"},
			{value:"America/Atikokan", text: "Atikokan", utc:"-05:00"},
			{value:"America/Atka", text: "Atka", utc:"-10:00"},
			{value:"America/Bahia", text: "Bahia", utc:"-03:00"},
			{value:"America/Barbados", text: "Barbados", utc:"-04:00"},
			{value:"America/Belem", text: "Belem", utc:"-03:00"},
			{value:"America/Belize", text: "Belize", utc:"-06:00"},
			{value:"America/Blanc-Sablon", text: "Blanc-Sablon", utc:"-04:00"},
			{value:"America/Boa_Vista", text: "Boa_Vista", utc:"-04:00"},
			{value:"America/Bogota", text: "Bogota", utc:"-05:00"},
			{value:"America/Boise", text: "Boise", utc:"-07:00"},
			{value:"America/Buenos_Aires", text: "Buenos Aires", utc:"-03:00"},
			{value:"America/Cambridge_Bay", text: "Cambridge_Bay", utc:"-07:00"},
			{value:"America/Campo_Grande", text: "Campo Grande", utc:"-04:00"},
			{value:"America/Cancun", text: "Cancun", utc:"-06:00"},
			{value:"America/Caracas", text: "Caracas", utc:"-04:30"},
			{value:"America/Catamarca", text: "Catamarca", utc:"-03:00"},
			{value:"America/Cayenne", text: "Cayenne", utc:"-03:00"},
			{value:"America/Cayman", text: "Cayman", utc:"-05:00"},
			{value:"America/Chihuahua", text: "Chihuahua", utc:"-07:00"},
			{value:"America/Coral_Harbour", text: "Coral Harbour", utc:"-05:00"},
			{value:"America/Cordoba", text: "Cordoba", utc:"-03:00"},
			{value:"America/Costa_Rica", text: "Costa Rica", utc:"-06:00"},
			{value:"America/Cuiaba", text: "Cuiaba", utc:"-04:00"},
			{value:"America/Curacao", text: "Curacao", utc:"-04:00"},
			{value:"America/Danmarkshavn", text: "Danmarkshavn", utc:"+00:00"},
			{value:"America/Dawson", text: "Dawson", utc:"-08:00"},
			{value:"America/Dawson_Creek", text: "Dawson Creek", utc:"-07:00"},
			{value:"America/Detroit", text: "Detroit", utc:"-05:00"},
			{value:"America/Dominica", text: "Dominica", utc:"-04:00"},
			{value:"America/Edmonton", text: "Edmonton", utc:"-07:00"},
			{value:"America/Eirunepe", text: "Eirunepe", utc:"-04:00"},
			{value:"America/El_Salvador", text: "El Salvador", utc:"-06:00"},
			{value:"America/Ensenada", text: "Ensenada", utc:"-08:00"},
			{value:"America/Fortaleza", text: "Fortaleza", utc:"-03:00"},
			{value:"America/Fort_Wayne", text: "Fort Wayne", utc:"-05:00"},
			{value:"America/Glace_Bay", text: "Glace Bay", utc:"-04:00"},
			{value:"America/Godthab", text: "Godthab", utc:"-03:00"},
			{value:"America/Goose_Bay", text: "Goose Bay", utc:"-04:00"},
			{value:"America/Grand_Turk", text: "Grand Turk", utc:"-05:00"},
			{value:"America/Grenada", text: "Grenada", utc:"-04:00"},
			{value:"America/Guadeloupe", text: "Guadeloupe", utc:"-04:00"},
			{value:"America/Guatemala", text: "Guatemala", utc:"-06:00"},
			{value:"America/Guayaquil", text: "Guayaquil", utc:"-05:00"},
			{value:"America/Guyana", text: "Guyana", utc:"-04:00"},
			{value:"America/Halifax", text: "Halifax", utc:"-04:00"},
			{value:"America/Havana", text: "Havana", utc:"-05:00"},
			{value:"America/Hermosillo", text: "Hermosillo", utc:"-07:00"},
			{value:"America/Indiana/Indianapolis", text: "Indiana - Indianapolis", utc:"-05:00"},
			{value:"America/Indiana/Knox", text: "Indiana - Knox", utc:"-06:00"},
			{value:"America/Indiana/Marengo", text: "Indiana - Marengo", utc:"-05:00"},
			{value:"America/Indiana/Petersburg", text: "Indiana - Petersburg", utc:"-05:00"},
			{value:"America/Indiana/Tell_City", text: "Indiana - Tell_City", utc:"-06:00"},
			{value:"America/Indiana/Vevay", text: "Indiana - Vevay", utc:"-05:00"},
			{value:"America/Indiana/Vincennes", text: "Indiana - Vincennes", utc:"-05:00"},
			{value:"America/Indiana/Winamac", text: "Indiana - Winamac", utc:"-05:00"},
			{value:"America/Indianapolis", text: "Indianapolis", utc:"-05:00"},
			{value:"America/Inuvik", text: "Inuvik", utc:"-07:00"},
			{value:"America/Iqaluit", text: "Iqaluit", utc:"-05:00"},
			{value:"America/Jamaica", text: "Jamaica", utc:"-05:00"},
			{value:"America/Jujuy", text: "Jujuy", utc:"-03:00"},
			{value:"America/Juneau", text: "Juneau", utc:"-09:00"},
			{value:"America/Kentucky/Louisville", text: "Kentucky - Louisville", utc:"-05:00"},
			{value:"America/Kentucky/Monticello", text: "Kentucky - Monticello", utc:"-05:00"},
			{value:"America/Knox_IN", text: "Knox IN", utc:"-06:00"},
			{value:"America/La_Paz", text: "La Paz", utc:"-04:00"},
			{value:"America/Lima", text: "Lima", utc:"-05:00"},
			{value:"America/Louisville", text: "Louisville", utc:"-05:00"},
			{value:"America/Maceio", text: "Maceio", utc:"-03:00"},
			{value:"America/Managua", text: "Managua", utc:"-06:00"},
			{value:"America/Manaus", text: "Manaus", utc:"-04:00"},
			{value:"America/Marigot", text: "Marigot", utc:"-04:00"},
			{value:"America/Martinique", text: "Martinique", utc:"-04:00"},
			{value:"America/Matamoros", text: "Matamoros", utc:"-06:00"},
			{value:"America/Mazatlan", text: "Mazatlan", utc:"-07:00"},
			{value:"America/Mendoza", text: "Mendoza", utc:"-03:00"},
			{value:"America/Menominee", text: "Menominee", utc:"-06:00"},
			{value:"America/Merida", text: "Merida", utc:"-06:00"},
			{value:"America/Mexico_City", text: "Mexico City", utc:"-06:00"},
			{value:"America/Miquelon", text: "Miquelon", utc:"-03:00"},
			{value:"America/Moncton", text: "Moncton", utc:"-04:00"},
			{value:"America/Monterrey", text: "Monterrey", utc:"-06:00"},
			{value:"America/Montevideo", text: "Montevideo", utc:"-03:00"},
			{value:"America/Montreal", text: "Montreal", utc:"-05:00"},
			{value:"America/Montserrat", text: "Montserrat", utc:"-04:00"},
			{value:"America/Nassau", text: "Nassau", utc:"-05:00"},
			{value:"America/Nipigon", text: "Nipigon", utc:"-05:00"},
			{value:"America/Nome", text: "Nome", utc:"-09:00"},
			{value:"America/Noronha", text: "Noronha", utc:"-02:00"},
			{value:"America/North_Dakota/Center", text: "North Dakota - Center", utc:"-06:00"},
			{value:"America/North_Dakota/New_Salem", text: "North Dakota - New Salem", utc:"-06:00"},
			{value:"America/Ojinaga", text: "Ojinaga", utc:"-07:00"},
			{value:"America/Panama", text: "Panama", utc:"-05:00"},
			{value:"America/Pangnirtung", text: "Pangnirtung", utc:"-05:00"},
			{value:"America/Paramaribo", text: "Paramaribo", utc:"-03:00"},
			{value:"America/Port-au-Prince", text: "Port-au-Prince", utc:"-05:00"},
			{value:"America/Porto_Acre", text: "Porto Acre", utc:"-04:00"},
			{value:"America/Port_of_Spain", text: "Port of Spain", utc:"-04:00"},
			{value:"America/Porto_Velho", text: "Porto Velho", utc:"-04:00"},
			{value:"America/Rainy_River", text: "Rainy River", utc:"-06:00"},
			{value:"America/Rankin_Inlet", text: "Rankin Inlet", utc:"-06:00"},
			{value:"America/Recife", text: "Recife", utc:"-03:00"},
			{value:"America/Regina", text: "Regina", utc:"-06:00"},
			{value:"America/Resolute", text: "Resolute", utc:"-06:00"},
			{value:"America/Rio_Branco", text: "Rio Branco", utc:"-04:00"},
			{value:"America/Rosario", text: "Rosario", utc:"-03:00"},
			{value:"America/Santa_Isabel", text: "Santa Isabel", utc:"-08:00"},
			{value:"America/Santarem", text: "Santarem", utc:"-03:00"},
			{value:"America/Santiago", text: "Santiago", utc:"-04:00"},
			{value:"America/Santo_Domingo", text: "Santo Domingo", utc:"-04:00"},
			{value:"America/Sao_Paulo", text: "Sao Paulo", utc:"-03:00"},
			{value:"America/Scoresbysund", text: "Scoresbysund", utc:"-01:00"},
			{value:"America/Shiprock", text: "Shiprock", utc:"-07:00"},
			{value:"America/St_Barthelemy", text: "St Barthelemy", utc:"-04:00"},
			{value:"America/St_Johns", text: "St Johns", utc:"-03:30"},
			{value:"America/St_Kitts", text: "St Kitts", utc:"-04:00"},
			{value:"America/St_Lucia", text: "St Lucia", utc:"-04:00"},
			{value:"America/St_Thomas", text: "St Thomas", utc:"-04:00"},
			{value:"America/St_Vincent", text: "St Vincent", utc:"-04:00"},
			{value:"America/Swift_Current", text: "Swift Current", utc:"-06:00"},
			{value:"America/Tegucigalpa", text: "Tegucigalpa", utc:"-06:00"},
			{value:"America/Thule", text: "Thule", utc:"-04:00"},
			{value:"America/Thunder_Bay", text: "Thunder Bay", utc:"-05:00"},
			{value:"America/Tijuana", text: "Tijuana", utc:"-08:00"},
			{value:"America/Toronto", text: "Toronto", utc:"-05:00"},
			{value:"America/Tortola", text: "Tortola", utc:"-04:00"},
			{value:"America/Vancouver", text: "Vancouver", utc:"-08:00"},
			{value:"America/Virgin", text: "Virgin", utc:"-04:00"},
			{value:"America/Whitehorse", text: "Whitehorse", utc:"-08:00"},
			{value:"America/Winnipeg", text: "Winnipeg", utc:"-06:00"},
			{value:"America/Yakutat", text: "Yakutat", utc:"-09:00"},
			{value:"America/Yellowknife", text: "Yellowknife", utc:"-07:00"}
			],
		"Europe" : [
			{value:"Europe/Amsterdam", text: "Amsterdam", utc:"+01:00"},
			{value:"Europe/Andorra", text: "Andorra", utc:"+01:00"},
			{value:"Europe/Athens", text: "Athens", utc:"+02:00"},
			{value:"Europe/Belfast", text: "Belfast", utc:"+00:00"},
			{value:"Europe/Belgrade", text: "Belgrade", utc:"+01:00"},
			{value:"Europe/Berlin", text: "Berlin", utc:"+01:00"},
			{value:"Europe/Bratislava", text: "Bratislava", utc:"+01:00"},
			{value:"Europe/Brussels", text: "Brussels", utc:"+01:00"},
			{value:"Europe/Bucharest", text: "Bucharest", utc:"+02:00"},
			{value:"Europe/Budapest", text: "Budapest", utc:"+01:00"},
			{value:"Europe/Chisinau", text: "Chisinau", utc:"+02:00"},
			{value:"Europe/Copenhagen", text: "Copenhagen", utc:"+01:00"},
			{value:"Europe/Dublin", text: "Dublin", utc:"+00:00"},
			{value:"Europe/Gibraltar", text: "Gibraltar", utc:"+01:00"},
			{value:"Europe/Guernsey", text: "Guernsey", utc:"+00:00"},
			{value:"Europe/Helsinki", text: "Helsinki", utc:"+02:00"},
			{value:"Europe/Isle_of_Man", text: "Isle_of_Man", utc:"+00:00"},
			{value:"Europe/Istanbul", text: "Istanbul", utc:"+02:00"},
			{value:"Europe/Jersey", text: "Jersey", utc:"+00:00"},
			{value:"Europe/Kaliningrad", text: "Kaliningrad", utc:"+03:00"},
			{value:"Europe/Kiev", text: "Kiev", utc:"+02:00"},
			{value:"Europe/Lisbon", text: "Lisbon", utc:"+00:00"},
			{value:"Europe/Ljubljana", text: "Ljubljana", utc:"+01:00"},
			{value:"Europe/London", text: "London", utc:"+00:00"},
			{value:"Europe/Luxembourg", text: "Luxembourg", utc:"+01:00"},
			{value:"Europe/Madrid", text: "Madrid", utc:"+01:00"},
			{value:"Europe/Malta", text: "Malta", utc:"+01:00"},
			{value:"Europe/Mariehamn", text: "Mariehamn", utc:"+02:00"},
			{value:"Europe/Minsk", text: "Minsk", utc:"+03:00"},
			{value:"Europe/Monaco", text: "Monaco", utc:"+01:00"},
			{value:"Europe/Moscow", text: "Moscow", utc:"+04:00"},
			{value:"Europe/Nicosia", text: "Nicosia", utc:"+02:00"},
			{value:"Europe/Oslo", text: "Oslo", utc:"+01:00"},
			{value:"Europe/Paris", text: "Paris", utc:"+01:00"},
			{value:"Europe/Podgorica", text: "Podgorica", utc:"+01:00"},
			{value:"Europe/Prague", text: "Prague", utc:"+01:00"},
			{value:"Europe/Riga", text: "Riga", utc:"+02:00"},
			{value:"Europe/Rome", text: "Rome", utc:"+01:00"},
			{value:"Europe/Samara", text: "Samara", utc:"+04:00"},
			{value:"Europe/San_Marino", text: "San Marino", utc:"+01:00"},
			{value:"Europe/Sarajevo", text: "Sarajevo", utc:"+01:00"},
			{value:"Europe/Simferopol", text: "Simferopol", utc:"+02:00"},
			{value:"Europe/Skopje", text: "Skopje", utc:"+01:00"},
			{value:"Europe/Sofia", text: "Sofia", utc:"+02:00"},
			{value:"Europe/Stockholm", text: "Stockholm", utc:"+01:00"},
			{value:"Europe/Tallinn", text: "Tallinn", utc:"+02:00"},
			{value:"Europe/Tirane", text: "Tirane", utc:"+01:00"},
			{value:"Europe/Tiraspol", text: "Tiraspol", utc:"+02:00"},
			{value:"Europe/Uzhgorod", text: "Uzhgorod", utc:"+02:00"},
			{value:"Europe/Vaduz", text: "Vaduz", utc:"+01:00"},
			{value:"Europe/Vatican", text: "Vatican", utc:"+01:00"},
			{value:"Europe/Vienna", text: "Vienna", utc:"+01:00"},
			{value:"Europe/Vilnius", text: "Vilnius", utc:"+02:00"},
			{value:"Europe/Volgograd", text: "Volgograd", utc:"+04:00"},
			{value:"Europe/Warsaw", text: "Warsaw", utc:"+01:00"},
			{value:"Europe/Zagreb", text: "Zagreb", utc:"+01:00"},
			{value:"Europe/Zaporozhye", text: "Zaporozhye", utc:"+02:00"},
			{value:"Europe/Zurich", text: "Zurich", utc:"+01:00"}
			],

		"Asia" : [
			{value:"Asia/Aden", text:"Aden", utc:"+03:00"},
			{value:"Asia/Almaty", text:"Almaty", utc:"+06:00"},
			{value:"Asia/Amman", text:"Amman", utc:"+02:00"},
			{value:"Asia/Anadyr", text:"Anadyr", utc:"+12:00"},
			{value:"Asia/Aqtau", text:"Aqtau", utc:"+05:00"},
			{value:"Asia/Aqtobe", text:"Aqtobe", utc:"+05:00"},
			{value:"Asia/Ashgabat", text:"Ashgabat", utc:"+05:00"},
			{value:"Asia/Ashkhabad", text:"Ashkhabad", utc:"+05:00"},
			{value:"Asia/Baghdad", text:"Baghdad", utc:"+03:00"},
			{value:"Asia/Bahrain", text:"Bahrain", utc:"+03:00"},
			{value:"Asia/Baku", text:"Baku", utc:"+04:00"},
			{value:"Asia/Bangkok", text:"Bangkok", utc:"+07:00"},
			{value:"Asia/Beirut", text:"Beirut", utc:"+02:00"},
			{value:"Asia/Bishkek", text:"Bishkek", utc:"+06:00"},
			{value:"Asia/Brunei", text:"Brunei", utc:"+08:00"},
			{value:"Asia/Calcutta", text:"Calcutta", utc:"+05:30"},
			{value:"Asia/Choibalsan", text:"Choibalsan", utc:"+08:00"},
			{value:"Asia/Chongqing", text:"Chongqing", utc:"+08:00"},
			{value:"Asia/Chungking", text:"Chungking", utc:"+08:00"},
			{value:"Asia/Colombo", text:"Colombo", utc:"+05:30"},
			{value:"Asia/Dacca", text:"Dacca", utc:"+06:00"},
			{value:"Asia/Damascus", text:"Damascus", utc:"+02:00"},
			{value:"Asia/Dhaka", text:"Dhaka", utc:"+06:00"},
			{value:"Asia/Dili", text:"Dili", utc:"+09:00"},
			{value:"Asia/Dubai", text:"Dubai", utc:"+04:00"},
			{value:"Asia/Dushanbe", text:"Dushanbe", utc:"+05:00"},
			{value:"Asia/Gaza", text:"Gaza", utc:"+02:00"},
			{value:"Asia/Harbin", text:"Harbin", utc:"+08:00"},
			{value:"Asia/Ho_Chi_Minh", text:"Ho Chi Minh", utc:"+07:00"},
			{value:"Asia/Hong_Kong", text:"Hong Kong", utc:"+08:00"},
			{value:"Asia/Hovd", text:"Hovd", utc:"+07:00"},
			{value:"Asia/Irkutsk", text:"Irkutsk", utc:"+09:00"},
			{value:"Asia/Istanbul", text:"Istanbul", utc:"+02:00"},
			{value:"Asia/Jakarta", text:"Jakarta", utc:"+07:00"},
			{value:"Asia/Jayapura", text:"Jayapura", utc:"+09:00"},
			{value:"Asia/Jerusalem", text:"Jerusalem", utc:"+02:00"},
			{value:"Asia/Kabul", text:"Kabul", utc:"+04:30"},
			{value:"Asia/Kamchatka", text:"Kamchatka", utc:"+12:00"},
			{value:"Asia/Karachi", text:"Karachi", utc:"+05:00"},
			{value:"Asia/Kashgar", text:"Kashgar", utc:"+08:00"},
			{value:"Asia/Kathmandu", text:"Kathmandu", utc:"+05:45"},
			{value:"Asia/Kolkata", text:"Kolkata", utc:"+05:30"},
			{value:"Asia/Krasnoyarsk", text:"Krasnoyarsk", utc:"+08:00"},
			{value:"Asia/Kuala_Lumpur", text:"Kuala Lumpur", utc:"+08:00"},
			{value:"Asia/Kuching", text:"Kuching", utc:"+08:00"},
			{value:"Asia/Kuwait", text:"Kuwait", utc:"+03:00"},
			{value:"Asia/Macao", text:"Macao", utc:"+08:00"},
			{value:"Asia/Macau", text:"Macau", utc:"+08:00"},
			{value:"Asia/Magadan", text:"Magadan", utc:"+12:00"},
			{value:"Asia/Makassar", text:"Makassar", utc:"+08:00"},
			{value:"Asia/Manila", text:"Manila", utc:"+08:00"},
			{value:"Asia/Muscat", text:"Muscat", utc:"+04:00"},
			{value:"Asia/Nicosia", text:"Nicosia", utc:"+02:00"},
			{value:"Asia/Novokuznetsk", text:"Novokuznetsk", utc:"+07:00"},
			{value:"Asia/Novosibirsk", text:"Novosibirsk", utc:"+07:00"},
			{value:"Asia/Omsk", text:"Omsk", utc:"+07:00"},
			{value:"Asia/Oral", text:"Oral", utc:"+05:00"},
			{value:"Asia/Phnom_Penh", text:"Phnom Penh", utc:"+07:00"},
			{value:"Asia/Pyongyang", text:"Pyongyang", utc:"+09:00"},
			{value:"Asia/Qatar", text:"Qatar", utc:"+03:00"},
			{value:"Asia/Qyzylorda", text:"Qyzylorda", utc:"+06:00"},
			{value:"Asia/Rangoon", text:"Rangoon", utc:"+06:30"},
			{value:"Asia/Riyadh", text:"Riyadh", utc:"+03:00"},
			{value:"Asia/Saigon", text:"Saigon", utc:"+07:00"},
			{value:"Asia/Sakhalin", text:"Sakhalin", utc:"+11:00"},
			{value:"Asia/Samarkand", text:"Samarkand", utc:"+05:00"},
			{value:"Asia/Seoul", text:"Seoul", utc:"+09:00"},
			{value:"Asia/Shanghai", text:"Shanghai", utc:"+08:00"},
			{value:"Asia/Singapore", text:"Singapore", utc:"+08:00"},
			{value:"Asia/Taipei", text:"Taipei", utc:"+08:00"},
			{value:"Asia/Tashkent", text:"Tashkent", utc:"+05:00"},
			{value:"Asia/Tbilisi", text:"Tbilisi", utc:"+04:00"},
			{value:"Asia/Tehran", text:"Tehran", utc:"+03:30"},
			{value:"Asia/Tel_Aviv", text:"Tel Aviv", utc:"+02:00"},
			{value:"Asia/Thimbu", text:"Thimbu", utc:"+06:00"},
			{value:"Asia/Thimphu", text:"Thimphu", utc:"+06:00"},
			{value:"Asia/Tokyo", text:"Tokyo", utc:"+09:00"},
			{value:"Asia/Ujung_Pandang", text:"Ujung Pandang", utc:"+08:00"},
			{value:"Asia/Ulaanbaatar", text:"Ulaanbaatar", utc:"+08:00"},
			{value:"Asia/Ulan_Bator", text:"Ulan Bator", utc:"+08:00"},
			{value:"Asia/Urumqi", text:"Urumqi", utc:"+08:00"},
			{value:"Asia/Vientiane", text:"Vientiane", utc:"+07:00"},
			{value:"Asia/Vladivostok", text:"Vladivostok", utc:"+11:00"},
			{value:"Asia/Yakutsk", text:"Yakutsk", utc:"+10:00"},
			{value:"Asia/Yekaterinburg", text:"Yekaterinburg", utc:"+06:00"},
			{value:"Asia/Yerevan", text:"Yerevan", utc:"+04:00"}
			],
		"Africa" : [
			{value:"Africa/Abidjan", text:"Abidjan", utc:"+00:00"},
			{value:"Africa/Accra", text:"Accra", utc:"+00:00"},
			{value:"Africa/Addis_Ababa", text:"Addis Ababa", utc:"+03:00"},
			{value:"Africa/Algiers", text:"Algiers", utc:"+01:00"},
			{value:"Africa/Asmara", text:"Asmara", utc:"+03:00"},
			{value:"Africa/Asmera", text:"Asmera", utc:"+03:00"},
			{value:"Africa/Bamako", text:"Bamako", utc:"+00:00"},
			{value:"Africa/Bangui", text:"Bangui", utc:"+01:00"},
			{value:"Africa/Banjul", text:"Banjul", utc:"+00:00"},
			{value:"Africa/Bissau", text:"Bissau", utc:"+00:00"},
			{value:"Africa/Blantyre", text:"Blantyre", utc:"+00:00"},
			{value:"Africa/Brazzaville", text:"Brazzaville", utc:"+01:00"},
			{value:"Africa/Bujumbura", text:"Bujumbura", utc:"+02:00"},
			{value:"Africa/Cairo", text:"Cairo", utc:"+02:00"},
			{value:"Africa/Casablanca", text:"Casablanca", utc:"+00:00"},
			{value:"Africa/Ceuta", text:"Ceuta", utc:"+01:00"},
			{value:"Africa/Conakry", text:"Conakry", utc:"+00:00"},
			{value:"Africa/Dakar", text:"Dakar", utc:"+00:00"},
			{value:"Africa/Dar_es_Salaam", text:"Dar es Salaam", utc:"+03:00"},
			{value:"Africa/Djibouti", text:"Djibouti", utc:"+03:00"},
			{value:"Africa/Douala", text:"Douala", utc:"+01:00"},
			{value:"Africa/El_Aaiun", text:"El Aaiun", utc:"+00:00"},
			{value:"Africa/Freetown", text:"Freetown", utc:"+00:00"},
			{value:"Africa/Gaborone", text:"Gaborone", utc:"+02:00"},
			{value:"Africa/Harare", text:"Harare", utc:"+02:00"},
			{value:"Africa/Johannesburg", text:"Johannesburg", utc:"+02:00"},
			{value:"Africa/Kampala", text:"Kampala", utc:"+03:00"},
			{value:"Africa/Khartoum", text:"Khartoum", utc:"+03:00"},
			{value:"Africa/Kigali", text:"Kigali", utc:"+02:00"},
			{value:"Africa/Kinshasa", text:"Kinshasa", utc:"+01:00"},
			{value:"Africa/Lagos", text:"Lagos", utc:"+01:00"},
			{value:"Africa/Libreville", text:"Libreville", utc:"+01:00"},
			{value:"Africa/Lome", text:"Lome", utc:"+00:00"},
			{value:"Africa/Luanda", text:"Luanda", utc:"+01:00"},
			{value:"Africa/Lubumbashi", text:"Lubumbashi", utc:"+02:00"},
			{value:"Africa/Lusaka", text:"Lusaka", utc:"+02:00"},
			{value:"Africa/Malabo", text:"Malabo", utc:"+01:00"},
			{value:"Africa/Maputo", text:"Maputo", utc:"+02:00"},
			{value:"Africa/Maseru", text:"Maseru", utc:"+02:00"},
			{value:"Africa/Mbabane", text:"Mbabane", utc:"+02:00"},
			{value:"Africa/Mogadishu", text:"Mogadishu", utc:"+03:00"},
			{value:"Africa/Monrovia", text:"Monrovia", utc:"+00:00"},
			{value:"Africa/Nairobi", text:"Nairobi", utc:"+03:00"},
			{value:"Africa/Ndjamena", text:"Ndjamena", utc:"+01:00"},
			{value:"Africa/Niamey", text:"Niamey", utc:"+01:00"},
			{value:"Africa/Nouakchott", text:"Nouakchott", utc:"+00:00"},
			{value:"Africa/Ouagadougou", text:"Ouagadougou", utc:"+00:00"},
			{value:"Africa/Porto-Novo", text:"Porto-Novo", utc:"+01:00"},
			{value:"Africa/Sao_Tome", text:"Sao Tome", utc:"+00:00"},
			{value:"Africa/Timbuktu", text:"Timbuktu", utc:"+00:00"},
			{value:"Africa/Tripoli", text:"Tripoli", utc:"+02:00"},
			{value:"Africa/Tunis", text:"Tunis", utc:"+01:00"},
			{value:"Africa/Windhoek", text:"Windhoek", utc:"+01:00"}
			],
		"Australia" : [
			{value:"Australia/ACT", text:"ACT", utc:"+10:00"},
			{value:"Australia/Adelaide", text:"Adelaide", utc:"+09:30"},
			{value:"Australia/Brisbane", text:"Brisbane", utc:"+10:00"},
			{value:"Australia/Broken_Hill", text:"Broken Hill", utc:"+09:30"},
			{value:"Australia/Canberra", text:"Canberra", utc:"+10:00"},
			{value:"Australia/Currie", text:"Currie", utc:"+10:00"},
			{value:"Australia/Darwin", text:"Darwin", utc:"+09:30"},
			{value:"Australia/Eucla", text:"Eucla", utc:"+08.45"},
			{value:"Australia/Hobart", text:"Hobart", utc:"+10:00"},
			{value:"Australia/LHI", text:"LHI", utc:"+10:30"},
			{value:"Australia/Lindeman", text:"Lindeman", utc:"+10:00"},
			{value:"Australia/Lord_Howe", text:"Lord Howe", utc:"+10:30"},
			{value:"Australia/Melbourne", text:"Melbourne", utc:"+10:00"},
			{value:"Australia/North", text:"North", utc:"+09:30"},
			{value:"Australia/NSW", text:"NSW", utc:"+10:00"},
			{value:"Australia/Perth", text:"Perth", utc:"+08:00"},
			{value:"Australia/Queensland", text:"Queensland", utc:"+10:00"},
			{value:"Australia/South", text:"South", utc:"+09:30"},
			{value:"Australia/Sydney", text:"Sydney", utc:"+10:00"},
			{value:"Australia/Tasmania", text:"Tasmania", utc:"+10:00"},
			{value:"Australia/Victoria", text:"Victoria", utc:"+10:00"},
			{value:"Australia/West", text:"West", utc:"+08:00"},
			{value:"Australia/Yancowinna", text:"Yancowinna", utc:"+09:30"}
			],
		"Indian" : [
			{value:"Indian/Antananarivo", text:"Antananarivo", utc:"+03:00"},
			{value:"Indian/Chagos", text:"Chagos", utc:"+06:00"},
			{value:"Indian/Christmas", text:"Christmas", utc:"+07:00"},
			{value:"Indian/Cocos", text:"Cocos", utc:"+06:30"},
			{value:"Indian/Comoro", text:"Comoro", utc:"+03:00"},
			{value:"Indian/Kerguelen", text:"Kerguelen", utc:"+05:00"},
			{value:"Indian/Mahe", text:"Mahe", utc:"+04:00"},
			{value:"Indian/Maldives", text:"Maldives", utc:"+05:00"},
			{value:"Indian/Mauritius", text:"Mauritius", utc:"+04:00"},
			{value:"Indian/Mayotte", text:"Mayotte", utc:"+03:00"},
			{value:"Indian/Reunion", text:"Reunion", utc:"+04:00"}
			],
		"Atlantic" : [
			{value:"Atlantic/Azores", text:"Azores", utc:"-01:00"},
			{value:"Atlantic/Bermuda", text:"Bermuda", utc:"-04:00"},
			{value:"Atlantic/Canary", text:"Canary", utc:"+00:00"},
			{value:"Atlantic/Cape_Verde", text:"Cape Verde", utc:"-01:00"},
			{value:"Atlantic/Faeroe", text:"Faeroe", utc:"+00:00"},
			{value:"Atlantic/Faroe", text:"Faroe", utc:"+00:00"},
			{value:"Atlantic/Jan_Mayen", text:"Jan Mayen", utc:"+01:00"},
			{value:"Atlantic/Madeira", text:"Madeira", utc:"+00:00"},
			{value:"Atlantic/Reykjavik", text:"Reykjavik", utc:"+00:00"},
			{value:"Atlantic/South_Georgia", text:"South Georgia", utc:"-02:00"},
			{value:"Atlantic/Stanley", text:"Stanley", utc:"-03:00"},
			{value:"Atlantic/St_Helena", text:"St Helena", utc:"+00:00"}
			],
		"Pacific" : [
			{value:"Pacific/Apia", text:"Apia", utc:"+13:00"},
			{value:"Pacific/Auckland", text:"Auckland", utc:"+12:00"},
			{value:"Pacific/Chatham", text:"Chatham", utc:"+12:45"},
			{value:"Pacific/Easter", text:"Easter", utc:"-06:00"},
			{value:"Pacific/Efate", text:"Efate", utc:"+11:00"},
			{value:"Pacific/Enderbury", text:"Enderbury", utc:"+13:00"},
			{value:"Pacific/Fakaofo", text:"Fakaofo", utc:"+13:00"},
			{value:"Pacific/Fiji", text:"Fiji", utc:"+12:00"},
			{value:"Pacific/Funafuti", text:"Funafuti", utc:"+12:00"},
			{value:"Pacific/Galapagos", text:"Galapagos", utc:"-06:00"},
			{value:"Pacific/Gambier", text:"Gambier", utc:"-09:00"},
			{value:"Pacific/Guadalcanal", text:"Guadalcanal", utc:"+11:00"},
			{value:"Pacific/Guam", text:"Guam", utc:"+10:00"},
			{value:"Pacific/Johnston", text:"Johnston", utc:"-10:00"},
			{value:"Pacific/Kiritimati", text:"Kiritimati", utc:"+14:00"},
			{value:"Pacific/Kosrae", text:"Kosrae", utc:"+11:00"},
			{value:"Pacific/Kwajalein", text:"Kwajalein", utc:"+12:00"},
			{value:"Pacific/Majuro", text:"Majuro", utc:"+12:00"},
			{value:"Pacific/Marquesas", text:"Marquesas", utc:"-09:30"},
			{value:"Pacific/Midway", text:"Midway", utc:"-11:00"},
			{value:"Pacific/Nauru", text:"Nauru", utc:"+12:00"},
			{value:"Pacific/Niue", text:"Niue", utc:"-11:00"},
			{value:"Pacific/Norfolk", text:"Norfolk", utc:"+11:30"},
			{value:"Pacific/Noumea", text:"Noumea", utc:"+11:00"},
			{value:"Pacific/Pago_Pago", text:"Pago Pago", utc:"-11:00"},
			{value:"Pacific/Palau", text:"Palau", utc:"+09:00"},
			{value:"Pacific/Pitcairn", text:"Pitcairn", utc:"-08:00"},
			{value:"Pacific/Ponape", text:"Ponape", utc:"+11:00"},
			{value:"Pacific/Port_Moresby", text:"Port_Moresby", utc:"+10:00"},
			{value:"Pacific/Rarotonga", text:"Rarotonga", utc:"-10:00"},
			{value:"Pacific/Saipan", text:"Saipan", utc:"+10:00"},
			{value:"Pacific/Samoa", text:"Samoa", utc:"-11:00"},
			{value:"Pacific/Tahiti", text:"Tahiti", utc:"-10:00"},
			{value:"Pacific/Tarawa", text:"Tarawa", utc:"+12:00"},
			{value:"Pacific/Tongatapu", text:"Tongatapu", utc:"+13:00"},
			{value:"Pacific/Truk", text:"Truk", utc:"+10:00"},
			{value:"Pacific/Wake", text:"Wake", utc:"+12:00"},
			{value:"Pacific/Wallis", text:"Wallis", utc:"+12:00"},
			{value:"Pacific/Yap", text:"Yap", utc:"+10:00"}
			],
		"Antarctica" : [
			{value:"Antarctica/Casey", text:"Casey", utc:"+11:00"},
			{value:"Antarctica/Davis", text:"Davis", utc:"+05:00"},
			{value:"Antarctica/DumontDUrville", text:"DumontDUrville", utc:"+10:00"},
			{value:"Antarctica/Macquarie", text:"Macquarie", utc:"+11:00"},
			{value:"Antarctica/Mawson", text:"Mawson", utc:"+05:00"},
			{value:"Antarctica/McMurdo", text:"McMurdo", utc:"+12:00"},
			{value:"Antarctica/Palmer", text:"Palmer", utc:"-04:00"},
			{value:"Antarctica/Rothera", text:"Rothera", utc:"-03:00"},
			{value:"Antarctica/South_Pole", text:"South Pole", utc:"+12:00"},
			{value:"Antarctica/Syowa", text:"Syowa", utc:"+03:00"},
			{value:"Antarctica/Vostok", text:"Vostok", utc:"+06:00"}
			],
		"Arctic" : [
			{value:"Arctic/Longyearbyen", text:"Longyearbyen", utc:"+01:00"}
			]
	};

