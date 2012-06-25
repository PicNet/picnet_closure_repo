;
goog.provide('pn.ui.grid.Config');

goog.require('pn.ui.BaseConfig');
goog.require('pn.ui.grid.Interceptor');



/**
 * @constructor
 * @extends {pn.ui.BaseConfig}
 * @param {!Array.<pn.ui.FieldCtx>} fCtxs The specification of all the
 *    columns to display in this grid.
 * @param {!Array.<pn.ui.grid.Command>} commands All the commands supported by
 *    this grid.
 * @param {function(new:pn.ui.grid.Interceptor, !Object.<!Array.<!Object>>)=}
 *    opt_interceptor An optional interceptor ctor to use to modify the
 *    internal workings of the grid.
 */
pn.ui.grid.Config = function(fCtxs, commands, opt_interceptor) {
  goog.asserts.assert(fCtxs.length > 0);
  goog.asserts.assert(commands);

  pn.ui.BaseConfig.call(this, fCtxs);

  /** @type {!Array.<pn.ui.grid.Command>} */
  this.commands = commands;

  /** @type {boolean} */
  this.readonly = false;

  /** @type {boolean} */
  this.allowEdit = true;

  /** @type {boolean} */
  this.enableQuickFilters = true;

  /** @type {string} */
  this.defaultSortColumn = '';

  /** @type {boolean} */
  this.defaultSortAscending = true;

  /** @type {boolean} */
  this.persistFilters = true;

  /**
   * @type {null|
   *    function(new:pn.ui.grid.Interceptor, !Object.<!Array.<!Object>>)}
   */
  this.interceptor = opt_interceptor || null;

  //////////////////////////////////////////////////////////////////////////////
  // Slick Grid Properties
  //////////////////////////////////////////////////////////////////////////////

  /** @type {boolean} */
  this.enableColumnReorder = false;

  /** @type {boolean} */
  this.forceFitColumns = true;

  /** @type {boolean} */
  this.multiSelect = false;

  /** @type {boolean} */
  this.editable = true;

  /** @type {boolean} */
  this.syncColumnCellResize = true;
};
goog.inherits(pn.ui.grid.Config, pn.ui.BaseConfig);


/**
 * @return {pn.ui.grid.Config} A SlickGrid compative object even when
 *    in COMPILE mode.
 */
pn.ui.grid.Config.prototype.toSlick = function() {
  // Need to copy twice as we need this to also work in compiled mode.
  var cfg = /** @type {pn.ui.grid.Config} */ ({
    'enableColumnReorder': this.enableColumnReorder,
    'forceFitColumns': this.forceFitColumns,
    'multiSelect': this.multiSelect,
    'editable': this.editable,
    'showHeaderRow': this.enableQuickFilters,
    'syncColumnCellResize': this.syncColumnCellResize
  });
  cfg.enableColumnReorder = this.enableColumnReorder;
  cfg.forceFitColumns = this.forceFitColumns;
  cfg.multiSelect = this.multiSelect;
  cfg.editable = this.editable;
  cfg.showHeaderRow = this.enableQuickFilters;
  cfg.syncColumnCellResize = this.syncColumnCellResize;
  return cfg;
};


/** @inheritDoc */
pn.ui.grid.Config.prototype.disposeInternal = function() {
  pn.ui.grid.Config.superClass_.disposeInternal.call(this);

  goog.array.forEach(this.commands, goog.dispose);

  delete this.commands;
};
