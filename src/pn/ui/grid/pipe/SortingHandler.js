;
goog.provide('pn.ui.grid.pipe.SortingHandler');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 * @param {string} gridId The unique grid id for the current grid.
 */
pn.ui.grid.pipe.SortingHandler = function(gridId) {
  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {string}
   */
  this.storeId_ = gridId + '_sort';
};
goog.inherits(pn.ui.grid.pipe.SortingHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.SortingHandler.prototype.postRender = function() {
  var hasOrderColumn = !this.cfg.readonly &&
      this.cctxs.pnfindIndex(function(cctx) {
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
pn.ui.grid.pipe.SortingHandler.prototype.onCustomEvent = function(ev, opt_d) {
  if (ev === 'sort') { this.sortBy_(/** @type {!Object} */ (opt_d)); }
};


/** @private */
pn.ui.grid.pipe.SortingHandler.prototype.setGridInitialSortState_ = function() {
  var state = pn.storage.get(this.storeId_);
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
  pn.ass(sortData);

  var col = sortData['colid'];
  var asc = sortData['asc'];

  if (!!opt_updateUi) this.slick.setSortColumn(col, asc);
  this.sortImpl_(col, asc);

  pn.storage.set(this.storeId_, pn.json.serialiseJson(sortData));
};


/**
 * @private
 * @param {string} col The column being sorted.
 * @param {boolean} asc Wether to sort ascending.
 */
pn.ui.grid.pipe.SortingHandler.prototype.sortImpl_ = function(col, asc) {
  var cctx = this.cctxs.pnfind(
      function(cctx1) { return cctx1.id === col; });

  this.view.sort(function(a, b) {
    var x = cctx.getCompareableValue(a);
    var y = cctx.getCompareableValue(b);
    return x - y;
  }, asc);
};
