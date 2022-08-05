<tr>
<td></td>
<td colspan="2" class="labelhead">
    <input type="radio" name="optNW" id="_optDHCP" />
        <label id="optDHCP_lbl"></label>
    <br>
    <input type="radio" name="optNW" id="_optStatic" />
        <label id="optStatic_lbl"></label>
    <br>
    <!--<input type="radio" name="optNW" id="_optDisable" />
        <label id="optDisable_lbl"></label>-->
</td>
</tr>


function onStaticIPChanged()
{
    var item = document.getElementById("_optStatic");
    if(item.checked == true) {
        enableIPEditor(true);
        enableHostname(true);
    } else {
        enableIPEditor(false);
        enableHostname(true);
    }
}


function enableHostname(enable) {
    var disabled = !enable;
    if (network_data[selectedObjindex].interfaceIname.indexOf("eth2") != -1) {
      disabled = true;
    }
    var hostname = document.getElementById("_hostname");
    hostname.disabled = disabled;
}

function enableIPEditor(enable) {
    var itemdhcp = document.getElementById("_optDHCP");
    if(itemdhcp.checked){
        var disabled = true;
    }else{
        var disabled = !enable;
    }
    var item = document.getElementById("_ipAddress");

    item.disabled = disabled;
    item = document.getElementById("_subnetMask");
    item.disabled = disabled;
    item = document.getElementById("_gateway");
    item.disabled = disabled;
    if (network_data[selectedObjindex].interfaceIname.indexOf("eth2") == -1) {
      item = document.getElementById("_primaryDNS");
      item.disabled = disabled;
      item = document.getElementById("_secondDNS");
      item.disabled = disabled;
    }
}

function enableRadio(enable) {
    var disabled = !enable;
    var item = document.getElementById("_optDHCP");

    item.disabled = disabled;
    item = document.getElementById("_optStatic");
    item.disabled = disabled;
}