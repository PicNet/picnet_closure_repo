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
  this.readonly = false;
  /** @type {boolean} */
  this.allowEdit = true;
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
  /** @type {boolean} */
  this.enableQuickFilters = true;
  /** @type {number} */
  this.width = 0;
  /** @type {string} */
  this.defaultSortColumn = '';
  /** @type {boolean} */
  this.defaultSortAscending = true;
};


/**
 * @return {pn.ui.grid.Config} A SlickGrid compative object even when
 *    in COMPILE mode.
 */
pn.ui.grid.Config.prototype.toSlick = function() {
  var cfg = /** @type {pn.ui.grid.Config} */ (goog.object.clone(this));
  goog.object.extend(cfg, {
    'enableColumnReorder': this.enableColumnReorder,
    'forceFitColumns': this.forceFitColumns,
    'multiSelect': this.multiSelect,
    'editable': this.editable,
    'showHeaderRow': this.enableQuickFilters
  });
  return cfg;
};
