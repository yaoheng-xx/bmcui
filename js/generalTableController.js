"use strict";

document.writeln("<script type='text/javascript' src='../js/general_table.js'></script>");

function GetSelectedRow() {
	return mRowSelected;
}

function GetSelectedRowIndex() {
	var result = 0;
	if(mRowSelected != null) {
		result = mRowSelected.rowIndex;
	}
	return result;
}

function GetSelectedRowCellInnerHTML(cell_idx) {
	var row = GetSelectedRow();
	var result = null;
	if(row != null && row.cells.length > cell_idx) {
		result = row.cells[cell_idx].innerHTML;
	}
	return result;
}

function SetRowSelectEnable(enable) {
	mRowSelectable = enable;
}

function GetTableElement() {
	return GTC.getElement('table',document);
}
