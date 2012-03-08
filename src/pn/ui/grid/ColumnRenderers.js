;
goog.provide('pn.ui.grid.ColumnRenderers');

goog.require('goog.string');

goog.require('pn.ui.SpecDisplayItem');


/**
 * @param {number} row The row index.
 * @param {number} cell The cell index in the specified row.
 * @param {Date|number} value The date value displayed in the cell.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.dateRenderer = function(row, cell, value) {
  if (value && goog.isNumber(value)) value = new Date(value);
  if (value && value.getFullYear() <= 1970) { value = null; }
  return value ? pn.Utils.dateFormat.format(/** @type {Date} */ (value)) : '';
};


/**
 * @param {number} row The row index.
 * @param {number} cell The cell index in the specified row.
 * @param {number} value The cents in this monetary value.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.centsRenderer = function(row, cell, value) {
  goog.asserts.assert(goog.isNumber(value));
  var dollars = Math.floor(value / 100);
  var cents = Math.floor(value % 100);
  return '$' + dollars + '.' + goog.string.padNumber(cents, 2);
};
