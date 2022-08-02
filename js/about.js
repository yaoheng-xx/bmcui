/* about page dialog */

function do_about()
{

    // Legal notice is a web page, put the contents in the dialog
    var alert_id = "dynamic_dialog" + global_dynamic_id;

    // Create an empty alert dialog
    alert("", {title:lang.LANG_HEADER_ABOUT, dialogClass:'about_msg'});

    // Create an iframe with contents of html page.
    var myframe = document.createElement("iframe");
    myframe.setAttribute("frameborder", "0");
    myframe.setAttribute("src", '/page/about.html');
    myframe.setAttribute("id", "about_frame");
    var alert_node = document.getElementById(alert_id);
    alert_node.innerHTML = "<div id='about_loading'>" + lang.LANG_GENERAL_LOADING + "</div>";
    alert_node.appendChild(myframe);

    jQuery('#about_frame').ready(function() {
        jQuery('#about_frame').load(function() {
            jQuery('#about_loading').css('display', 'none');
        });
    });
}


