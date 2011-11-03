;
goog.provide('pn.ui.grid.Column');

goog.require('pn.ui.SpecDisplayItem');



/**
 * @constructor
 * @extends {pn.ui.SpecDisplayItem}
 *
 * @param {string} id The id of this column.
 * @param {string} name The name/caption of this column.
 */
pn.ui.grid.Column = function(id, name) {
  goog.asserts.assert(id);
  goog.asserts.assert(name);

  pn.ui.SpecDisplayItem.apply(this, arguments);

  /** @type {boolean} */
  this.resizable = true;
  /** @type {boolean} */
  this.sortable = true;
  /** @type {number} */
  this.minWidth = 0;
  /** @type {number} */
  this.width = 100;
  /** @type {boolean} */
  this.rerenderOnResize = false;
  /** @type {string} */
  this.headerCssClass = '';
  /** @type {string} */
  this.behavior = '';
  /** @type {boolean} */
  this.isParentFormatter = false;
  /** @type {null|function(number,number,Object,Object,Object):string} */
  this.formatter = null;
};
goog.inherits(pn.ui.grid.Column, pn.ui.SpecDisplayItem);


/**
 * @param {function(number,number,Object,Object,Object):string}
 *    formatter The formatter to use for this column.
 * @return {Object} A SlickGrid compative object even when in COMPILE mode.
 */
pn.ui.grid.Column.prototype.toSlick = function(formatter) {
  return {
    'id': this.id,
    'dataColumn': this.dataColumn,
    'field': this.id,
    'name': this.name,
    'resizable': this.resizable,
    'sortable': this.sortable,
    'minWidth': this.minWidth,
    'width': this.width,
    'rerenderOnResize': this.rerenderOnResize,
    'headerCssClass': this.headerCssClass,
    'behavior': this.behavior,
    'formatter': formatter,
    source: this.source
  };
};


/**
 * @param {number} row The row index.
 * @param {number} cell The cell index in the specified row.
 * @param {Date} value The date value displayed in the cell.
 * @param {Object} columnDef The column specifications, i.e.
 *    Column.toSlick result.
 * @param {Object} dataContext The data item displayed in this row.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.Column.dateRenderer =
    function(row, cell, value, columnDef, dataContext) {
  if (value && value.getFullYear() <= 1970) { value = null; }
  return value ? pn.rcdb.Global.dateFormat.format(value) : '';
};


/**
 * @param {number} row The row index.
 * @param {number} cell The cell index in the specified row.
 * @param {boolean} value The date value displayed in the cell.
 * @param {Object} columnDef The column specifications, i.e.
 *    Column.toSlick result.
 * @param {Object} dataContext The data item displayed in this row.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.Column.yesNoBoolRenderer =
    function(row, cell, value, columnDef, dataContext) {
  return value === true ? 'Y' : 'N';
};
