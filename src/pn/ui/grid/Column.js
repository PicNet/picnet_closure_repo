;
goog.provide('pn.ui.grid.Column');



/**
 * @constructor
 * @param {string} id The id of this column.
 * @param {string} name The name/caption of this column.
 */
pn.ui.grid.Column = function(id, name) {
  goog.asserts.assert(id);
  goog.asserts.assert(name);

  /** @type {string} */
  this.id = id;
  /** @type {string} */
  this.name = name;
  /** @type {boolean} */
  this.resizable = true;
  /** @type {boolean} */
  this.sortable = true;
  /** @type {number} */
  this.minWidth = 100;
  /** @type {boolean} */
  this.rerenderOnResize = false;
  /** @type {string} */
  this.headerCssClass = '';
  /** @type {string} */
  this.behavior = '';
  /** @type {null|function(number,number,Object,Object,Object,string):string} */
  this.formatter = null;
  /** @type {string} */
  this.source = '';
  /** @type {string} */
  this.sourceField = '';
};


/**
 * @param {function(number,number,Object,Object,Object,string):string}
 *    formatter The formatter to use for this column.
 * @return {Object} A SlickGrid compative object even when in COMPILE mode.
 */
pn.ui.grid.Column.prototype.toSlick = function(formatter) {
  return {
    'id': this.id,
    'field': this.id,
    'name': this.name,
    'resizable': this.resizable,
    'sortable': this.sortable,
    'minWidth': this.minWidth,
    'rerenderOnResize': this.rerenderOnResize,
    'headerCssClass': this.headerCssClass,
    'behavior': this.behavior,
    'formatter': formatter,
    source: this.source,
    sourceField: this.sourceField
  };
};
