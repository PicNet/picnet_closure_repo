;
goog.provide('pn.ui.grid.ColumnRenderers');

goog.require('pn.ui.SpecDisplayItem');


/**
 * @param {number} row The row index.
 * @param {number} cell The cell index in the specified row.
 * @param {Date} value The date value displayed in the cell.
 * @param {Object} columnDef The column specifications, i.e.
 *    ColumnRenderers.toSlick result.
 * @param {Object} dataContext The data item displayed in this row.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.dateRenderer =
    function(row, cell, value, columnDef, dataContext) {
  if (value && value.getFullYear() <= 1970) { value = null; }
  return value ? pn.Utils.dateFormat.format(value) : '';
};
