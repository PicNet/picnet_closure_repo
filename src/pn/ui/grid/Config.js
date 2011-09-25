;
goog.provide('pn.ui.grid.Config');



/**
 * @constructor
 */
pn.ui.grid.Config = function() {
  /** @type {boolean} */
  this.enableColumnReorder = false;
  /** @type {boolean} */
  this.forceFitColumns = true;
  /** @type {boolean} */
  this.multiSelect = false;
  /** @type {boolean} */
  this.editable = true;
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
