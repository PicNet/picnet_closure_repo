;
goog.provide('pn.ui.grid.Column');

goog.require('pn.Utils');
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
  /** @type {null|function(
      !Object,!Object.<!Array>,*,!pn.ui.grid.Column):string} */
  this.renderer = null;
  /** @type {boolean} */
  this.total = false;
};
goog.inherits(pn.ui.grid.Column, pn.ui.SpecDisplayItem);


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
  });
  return col;
};
