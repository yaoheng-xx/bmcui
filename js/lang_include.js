"use strict";

if(!top.lang_setting){
    top.lang_setting = ReadCookie("language");
}

document.write("<script type=\"text/javascript\", src = \"/js/lang/" + top.lang_setting + "/lang_str.js\"><\/script>");
