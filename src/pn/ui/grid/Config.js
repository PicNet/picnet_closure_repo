;
goog.provide('pn.ui.grid.Config');



/**
 * @constructor
 * @param {string} type The entity types of this grid.
 */
pn.ui.grid.Config = function(type) {
  /** @type {string} */
  this.type = type;
  /** @type {boolean} */
  this.allowAdd = true;
  /** @type {boolean} */
  this.enableColumnReorder = false;
  /** @type {boolean} */
  this.forceFitColumns = true;
  /** @type {boolean} */
  this.multiSelect = false;
  /** @type {boolean} */
  this.editable = true;
  /** @type {boolean} */
  this.checkboxRowSelect = false;
};


/**
 * @return {Object} A SlickGrid compative object even when in COMPILE mode.
 */
pn.ui.grid.Config.prototype.toSlick = function() {
  return {
    'enableColumnReorder': this.enableColumnReorder,
    'forceFitColumns': this.forceFitColumns,
    'multiSelect': this.multiSelect,
    'editable': this.editable
  };
};
