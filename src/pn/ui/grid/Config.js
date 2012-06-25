;
goog.provide('pn.ui.grid.Config');

goog.require('pn.ui.grid.ColumnCtx');
goog.require('pn.ui.grid.Interceptor');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Array.<pn.ui.grid.ColumnCtx>} cCtxs The specification of all the
 *    columns to display in this grid.
 * @param {!Array.<pn.ui.grid.Command>} commands All the commands supported by
 *    this grid.
 * @param {function(new:pn.ui.grid.Interceptor, !Object.<!Array.<!Object>>)=}
 *    opt_interceptor An optional interceptor ctor to use to modify the
 *    internal workings of the grid.
 */
pn.ui.grid.Config = function(cCtxs, commands, opt_interceptor) {
  goog.asserts.assert(cCtxs.length > 0);
  goog.asserts.assert(commands);

  goog.Disposable.call(this);

  /** @type {!Array.<pn.ui.grid.ColumnCtx>} */
  this.cCtxs = cCtxs;

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

  /**
   * The Grid control will use pn.app.ctx.pub to publish events if this is true.
   *    Otherwise traditional goog.events.Event will be used.
   * @type {boolean}
   */
  this.publishEventBusEvents = true;

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
goog.inherits(pn.ui.grid.Config, goog.Disposable);


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


/** @return {!Array.<string>} The list of types related to this entity. */
pn.ui.grid.Config.prototype.getRelatedTypes = function() {
  var types = [];
  var addIfType = function(f) {
    if (!f) return;
    var type = pn.data.EntityUtils.getTypeProperty(f);
    if (type !== f) types.push(type);
  };
  goog.array.forEach(this.cCtxs, function(cctx) {
    var additional = cctx.spec.additionalCacheTypes;
    if (additional.length) { types = goog.array.concat(types, additional); }

    if (cctx.spec.displayPath) {
      goog.array.forEach(cctx.spec.displayPath.split('.'), addIfType);
    }
    addIfType(cctx.spec.dataProperty);
  });
  goog.array.removeDuplicates(types);
  return types;
};


/** @inheritDoc */
pn.ui.grid.Config.prototype.disposeInternal = function() {
  pn.ui.grid.Config.superClass_.disposeInternal.call(this);

  goog.array.forEach(this.commands, goog.dispose);

  delete this.commands;
};
