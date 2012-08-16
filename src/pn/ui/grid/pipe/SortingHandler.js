;
goog.provide('pn.ui.grid.pipe.SortingHandler');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 * @param {Slick.Grid} slick The reference to the slick grid being shown.
 * @param {pn.ui.grid.DataView} view The data view being shown.
 * @param {pn.ui.grid.Config} cfg The grid configuration being used.
 * @param {string} gridId The unique grid id for the current grid.
 * @param {!Array.<!pn.ui.grid.ColumnCtx>} cctxs The column contexts being
 *    displayed.
 */
pn.ui.grid.pipe.SortingHandler =
    function(slick, view, cfg, gridId, cctxs) {
  pn.ui.grid.pipe.GridHandler.call(this, slick, view, cfg);

  /**
   * @private
   * @type {string}
   */
  this.gridId_ = gridId;

  /**
   * @private
   * @type {!Array.<!pn.ui.grid.ColumnCtx>}
   */
  this.cctxs_ = cctxs;
};
goog.inherits(pn.ui.grid.pipe.SortingHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.SortingHandler.prototype.init = function() {
  var hasOrderColumn = !this.cfg.readonly &&
      goog.array.findIndex(this.cctxs_, function(cctx) {
        return cctx.spec instanceof pn.ui.grid.OrderingColumnSpec;
      }) >= 0;
  // No sorting on orderable grids
  if (hasOrderColumn) return;

  this.slick.onSort.subscribe(goog.bind(function(e, args) {
    this.sortBy_({'colid': args['sortCol']['id'], 'asc': args['sortAsc'] });
  }, this));

  this.setGridInitialSortState_();
};


/** @override */
pn.ui.grid.pipe.SortingHandler.prototype.onCustomEvent =
    function(eventType, opt_data) {
  if (eventType === 'sort') {
    this.sortBy_(/** @type {!Object} */ (opt_data));
  }
};


/** @private */
pn.ui.grid.pipe.SortingHandler.prototype.setGridInitialSortState_ = function() {
  var state = pn.storage.get(this.gridId_ + '_sort');
  var data = state ? goog.json.unsafeParse(state) : {
    'colid': this.cfg.defaultSortColumn,
    'asc': this.cfg.defaultSortAscending
  };
  if (!data || !data['colid']) return;
  this.sortBy_(data, true);
};


/**
 * @private
 * @param {!Object} sortData The sorting properties.
 * @param {boolean=} opt_updateUi Wether to update the UI.
 */
pn.ui.grid.pipe.SortingHandler.prototype.sortBy_ =
    function(sortData, opt_updateUi) {
  goog.asserts.assert(sortData);

  var col = sortData['colid'];
  var asc = sortData['asc'];

  if (!!opt_updateUi) this.slick.setSortColumn(col, asc);
  this.sortImpl_(col, asc);

  pn.storage.set(this.gridId_ + '_sort', pn.json.serialiseJson(sortData));
};


/**
 * @private
 * @param {string} col The column being sorted.
 * @param {boolean} asc Wether to sort ascending.
 */
pn.ui.grid.pipe.SortingHandler.prototype.sortImpl_ = function(col, asc) {
  var cctx = goog.array.find(this.cctxs_,
      function(cctx1) { return cctx1.id === col; });

  this.view.sort(function(a, b) {
    var x = cctx.getEntityValue(a);
    var y = cctx.getEntityValue(b);
    return (x === y ? 0 : (x > y ? 1 : -1));
  }, asc);
};
