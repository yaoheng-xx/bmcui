"use strict";
var $jq = jQuery.noConflict();
jQuery(this).ready(function(){
	jQuery(this).bind("mousemove", function(e){
        jQuery(this).bind("mousemove", function(e){
           	//parent.eventlog(e.pageX,e.pageY);
           	parent.resetIdleTimer();
       	});
       	jQuery(this).bind("keypress", function(e){
       		parent.resetIdleTimer();
   		});
    });
});

