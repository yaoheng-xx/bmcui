/** general_table.js **/

var generaltable_idx = 0;

//------------------------------------------------------------
//the variables which is used by outside function
//to operate the general_table.
//------------------------------------------------------------
var mRowSelected = null;
var mRowSelectable = 0;
var mRowSelectedCallbackFunc = null;


var GTC = new GTCfactory();

function GTCfactory()
{
    GTCfactory.prototype.getElement = function(elementName,docu)
    {
        var object = null;
        if (docu == null)
            docu = document;

        if (elementName == 'table') {
            object = new general_table(docu);
        } else {
            // others not supported.
            object = null;
        }
        return object;
    }
}

function checkType(obj, type) {
    var result = false;
    if(typeof(obj) == 'undefined') {
        result = false;
    }
    else if(obj.constructor.toString().indexOf(type) == -1) {
        result = false;
    }
    else {
        result = true;
    }
    return result;
}

function IsNumber(str) {
    if (str.length == 0 || str == null || str == undefined) return false;

    //  check for valid number string.
    var validChars = "0123456789.,";
    var tmp;
    var res = true;

    // check if chars number.
    for (i = 0; i < str.length && res == true; i++) {
        tmp = str.charAt(i);
        if (validChars.indexOf(tmp) == -1 && tmp != ' ') {
            res = false; // not number chars.
            break;
        }
    }
    return res;
}

function compareNumeric(x,y) {
    x = Number(x);
    y = Number(y);

    if (x < y) {
        return -1;
    } else if (x > y) {
        return 1;
    }

    return 0;
}

function compareString(str1,str2) {
    var n = str1.localeCompare(str2);
    return n;
}

function findTag(obj, tag) {
    var result = false;
    if(obj != null && tag != null) {
        var tmp = obj.toString();
        if(tmp != null) {
            if(tmp.search(tag) != -1) {
                result = true;
            }
        }
    }
    return result;
}

function setColorText(obj, colorType) {
    if(colorType == 'green') {
        obj.textContent = lang.LANG_SENSOR_HEALTH_OK;
    }
    else if(colorType == 'yellow') {
        obj.textContent = lang.LANG_SENSOR_HEALTH_WARNING;
    }
    else if(colorType == 'red') {
        obj.textContent = lang.LANG_SENSOR_HEALTH_CRITICAL;
    }
}

function general_table(doc)
{
    var td            = null;
    var DEFAULT_USER  = [];
    this.name         = 'generaltable_' + generaltable_idx++;
    this.columns      = new Array();
    this.data         = new Array();
    this.doc          = doc;
    this.sortCol      = null;
    this.descending   = [];
    this.tdClassName   = [];

    DEFAULT_USER.push("anonymous");
    DEFAULT_USER.push("root");

    function row_remove(key) {
    }

    function isSystemAccount(row) {
        var result = false;
        if(row != null && row.cells.length > 1) {
            var cell = row.cells[1];
            for(var idx = 0; idx < DEFAULT_USER.length; idx++) {
                if(cell.innerHTML == DEFAULT_USER[idx]) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }

    function row_append(row) {
        row.shift();
        var objTR = this.docObj.createElement("TR");
        this.tbodyObj.appendChild(objTR);
        objTR.style.height = '19px';
        objTR.className = 'normal';

        objTR.onclick = function() {
            if(mRowSelectable) {
                if(mRowSelected!= null) {
                    mRowSelected.className = 'normal';
                }
                mRowSelected = objTR;
                objTR.className = 'selected';
                objTR.focus();
            }

            if(typeof del_user != 'undefined') {
                if(isSystemAccount(mRowSelected) == true) {
                    //system account, don't allow to delete.
                    del_user.disabled = true;
                }
                else {
                    del_user.disabled = false;
                }
            }
            if(mRowSelectedCallbackFunc != null) {
                mRowSelectedCallbackFunc();
            }
        }

        for (var idx = 0; idx <  this.columns.length; idx++) {
            td = objTR.insertCell(idx);
            td.style.textAlign = this.alignArray[idx];
            td.style.paddingRight = '1em';
            td.style.paddingLeft = '1em';
            if(idx < this.tdClassName.length)
                td.className = this.tdClassName[idx];
            if(findTag(row[idx], "bgcolor") == true) {
                if(row[idx].substring(8) != 'white') {
                    if (row[idx].substring(8) == 'wholeOrange') {
                        objTR.style.background = 'orange';
                    } else {
                        td.style.background = row[idx].substring(8);
                    }
                    setColorText(td, row[idx].substring(8));
                }
                else {
                    td.textContent = lang.LANG_SENSOR_HEALTH_UNKNOWN;
                }
            }
            else {
                td.innerHTML = row[idx];
            }
        }
    }

    function getSortFunc() {
        var exampleData = this.data[0][this.sortCol];
        if (IsNumber(exampleData)) {
            return compareNumeric;
        }
        else {
            return compareString;
        }
     }

    this.row_append = row_append;
    this.row_remove = row_remove;
    this.getSortFunc = getSortFunc;
    this.mRowSelected = mRowSelected;
}

general_table.prototype.setTdClassName = function(classNameArray) {
    this.tdClassName = classNameArray;
}

general_table.prototype.empty = function(deleteHead) {
    if(deleteHead) {
        //delete header.
        while(this.tableObj.header.cells.length) {
            this.tableObj.header.deleteCell(this.tableObj.header.cells.length - 1);
        }
    }
    while(this.tableObj.rows.length > 1) {
        this.tableObj.deleteRow(this.tableObj.rows.length - 1);
    }

    this.data = null;
}

general_table.prototype.addRow = function(row) {

    if (checkType(row, "Array")) {
        var vals = new Array(row.length);
        for(var idx = 0; idx < row.length; idx++) {
            vals[idx] = row[idx];
        }
        this.row_append(vals);
    }
}

general_table.prototype.registeSelectedCallback = function(callback) {
    mRowSelectedCallbackFunc = callback;
}

general_table.prototype.init_header = function(mName, table, table_height, param)
{
    if(table_height == null || table_height.length < 3) {
        table_height = "initial";
    }
    this.init(mName, table, table_height, param);
}

general_table.prototype.init_body = function(mName, table, table_height, param)
{
    this.init(mName, table, table_height, param);
    this.theadObj.style.visibility = 'hidden';
    this.theadObj.style.display = 'table-footer-group'; // only show body
}

general_table.prototype.init = function(mName, table, table_height, param)
{
    this.docObj = this.doc;
    this.alignArray = Array(this.columns.length);

    if(table_height == null || table_height.length < 3) {
        table_height = "315px";
    }

    var tdObj = Array(this.columns.length);
    this.tableObj = this.docObj.createElement("TABLE");
    if(param && param.tableId)
        this.tableObj.id = param.tableId;

    cellspacing = this.docObj.createAttribute('cellspacing');
    cellspacing.nodeValue = 0;
    cellpadding = this.docObj.createAttribute('cellpadding');
    cellpadding.nodeValue = 0;
    this.tableObj.setAttributeNode(cellspacing);
    this.tableObj.setAttributeNode(cellpadding);

    this.tableObj.className = 'listgrid';
    this.tableObj.style.width = "100%";
    this.tbodyObj = this.docObj.createElement("TBODY");
    this.tableObj.appendChild(this.tbodyObj);

    table.style.height = table_height;
    table.style.overflowX = 'hidden';
    table.style.overflowY = 'auto';

    var header = this.theadObj = this.tableObj.createTHead();
    this.tableObj.header = header.insertRow(0);
    this.tableObj.header.className='head';

    for(var j=0; j < this.columns.length; j++){
        var str = this.columns[j][0];
        this.alignArray[j] = this.columns[j][2];

        tdObj[j] = this.docObj.createElement("TH");
        if(param && param.noSort)
            tdObj[j].innerHTML = "&nbsp; " + str;
        else if(str.toString().search(/(img)/) == -1)
            tdObj[j].innerHTML = "&nbsp; "+ str + " &nbsp; <img src='../images/sort.gif'/>" ;
        else //this is a image file in the table
            tdObj[j].innerHTML = "&nbsp; " + str.substring(5);

        tdObj[j].style.textAlign = this.alignArray[j];
        tdObj[j].style.width = this.columns[j][1];
        if(this.columns[j][3]) // css style: min-width
            tdObj[j].style.minWidth = this.columns[j][3];
        if(param && param.thClassName)
            tdObj[j].className = param.thClassName;
        else
            tdObj[j].className = 'head';
        tdObj[j].style.whiteSpace = 'nowrap';

        if(!param || !param.noSort) {
            tdObj[j].onmouseover = function() {
                this.style.backgroundColor = '#A8B8DA';
                this.style.cursor = 'pointer';
            }

            tdObj[j].onmouseout = function() {
                this.style.backgroundColor= '#83AFD3';
            }
        }

        if((!param || !param.noSort) && str.toString().search(/(img)/) == -1){// cannot sort image files
            genTableObj = this;
            tdObj[j].sortcol = j+1;
            tdObj[j].onclick = function() {
                genTableObj.sortOnColumn(this.sortcol);
            };
        }

        this.tableObj.header.appendChild(tdObj[j]);
    }

    table.appendChild(this.tableObj);
}

general_table.prototype.removeRow = function(key) {
    if (checkType(key, "String")) {
         this.row_remove(key);
    }
    else if (checkType(key, "Array")) {
        for ( j=0; j<key.length ; j++) {
            this.row_remove(key[j])
        }
    }
}

// TBD: function need rename
general_table.prototype.setColumns = function(coltitle) {
    this.columns = coltitle;
    for(var idx=0; idx < this.columns.length; idx++) {
        this.descending[idx+1] = false;
    }
}

// TBD: function need rename
general_table.prototype.show = function (valuesArray) {

    if (this.data  == null) {
        this.data = new Array();
    }

    for (var idx=0; idx<valuesArray.length; idx++) {
        this.data[idx] = valuesArray[idx];
    }

    for (var idx=0; idx<valuesArray.length; idx++) {
        this.addRow(valuesArray[idx]);
    }

}


general_table.prototype.toString = function() {
}

general_table.prototype.sortOnColumn = function(col)
{
    if(this.data.length == 0) {
        return;
    }

    this.descending[col] = !this.descending[col];

    SortReverse = this.descending[col];
    SortColumn = col;
    this.sortCol = col;
    var sortFunc = this.getSortFunc();

    var valuesArray = new Array();

    for (var idx=0; idx<this.data.length; idx++) {
        valuesArray.push(this.data[idx][this.sortCol]);
    }
    valuesArray.sort(sortFunc);

    if (this.descending[col] == true) {
        valuesArray.reverse();
    }

    var tmpCacheArray = [];

    for (var idx=0; idx<valuesArray.length; idx++) {
        for (var jdx=0; jdx<valuesArray.length; jdx++) {
            if (this.data[jdx][this.sortCol] == valuesArray[idx]) {
                tmpCacheArray[idx]=[];
                for(var kdx=0; kdx < this.columns.length; kdx++) {
                    tmpCacheArray[idx][kdx+1] = this.data[jdx][kdx+1];
                }
                this.data[jdx][this.sortCol] = '';
                break;
            }
        }
    }

    this.empty();

    this.data = new Array();
    for (var idx=0; idx<tmpCacheArray.length; idx++) {
        this.data.push(tmpCacheArray[idx]);
    }

    this.show(this.data);
}

