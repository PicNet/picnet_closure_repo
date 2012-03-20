;
goog.provide('pn.ui.grid.Column');

goog.require('pn.Utils');
goog.require('pn.ui.BaseField');



/**
 * @constructor
 * @extends {pn.ui.BaseField}
 *
 * @param {string} id The id of this column.
 * @param {string=} opt_name The optional name/caption of this column.
 */
pn.ui.grid.Column = function(id, opt_name) {
  goog.asserts.assert(id);

  pn.ui.BaseField.call(this, id, opt_name);

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
  /** @type {null|function(
      !Object,!Object.<!Array>,*,!pn.ui.grid.Column):string} */
  this.renderer = null;
  /** @type {boolean} */
  this.total = false;
};
goog.inherits(pn.ui.grid.Column, pn.ui.BaseField);


/**
 * @param {function(number,number,Object,Object,Object):string}
 *    formatter The formatter to use for this column.
 * @return {pn.ui.grid.Column} A SlickGrid compative object even when in
 *    COMPILE mode.
 */
pn.ui.grid.Column.prototype.toSlick = function(formatter) {
  var col = /** @type {pn.ui.grid.Column} */ (goog.object.clone(this));
  goog.object.extend(col, {
    'id': this.id,
    'dataColumn': this.dataProperty,
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
    'source': this.displayPath
  });
  return col;
};
