;
goog.provide('pn.ui.grid.pipe.SortingHandler');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');
goog.require('goog.json.EvalJsonProcessor');


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
  var orderCol = !this.cfg.readonly && this.cfg.getCctxs().pnfirstOrNull(
      function(cctx) {
        return cctx.spec instanceof pn.ui.grid.OrderingColumnSpec;
      });
  if (orderCol) { return; }

  this.slick.onSort.subscribe(goog.bind(function(e, args) {
    this.sortBy_(args['sortCol']['id'], args['sortAsc'], false);
  }, this));

  this.setGridInitialSortState_();
};


/** @override */
pn.ui.grid.pipe.SortingHandler.prototype.onCustomEvent = function(ev, opt_d) {
  if (ev === 'sort') { this.sortBy_(opt_d['colid'], opt_d['asc'], false); }
};


/** @private */
pn.ui.grid.pipe.SortingHandler.prototype.setGridInitialSortState_ = function() {
  var state = pn.storage.get(this.storeId_);
  var processor = new goog.json.NativeJsonProcessor();
  var data = state ? processor.parse(state) : {
    'colid': this.cfg.defaultSortColumn,
    'asc': this.cfg.defaultSortAscending
  };
  if (!data || !data['colid']) return;

  this.sortBy_(data['colid'], data['asc'], true);
};


/**
 * @private
 * @param {string} col The column ID to sort.
 * @param {boolean} asc Wether to sort ascending.
 * @param {boolean} updateui Wether to update the grid ui.
 */
pn.ui.grid.pipe.SortingHandler.prototype.sortBy_ =
    function(col, asc, updateui) {
  pn.assStr(col);
  pn.assBool(asc);
  pn.assBool(updateui);

  if (updateui) this.slick.setSortColumn(col, asc);
  this.sortImpl_(col, asc);

  var data = {'colid' : col, 'asc': asc };
  pn.storage.set(this.storeId_, pn.json.serialiseJson(data));
};


/**
 * @private
 * @param {string} col The column being sorted.
 * @param {boolean} asc Wether to sort ascending.
 */
pn.ui.grid.pipe.SortingHandler.prototype.sortImpl_ = function(col, asc) {
  pn.assStr(col);
  pn.assBool(asc);

  var cctx = this.cfg.getCctxs().pnfind(
      function(cctx1) { return cctx1.id === col; });
  pn.assInst(cctx, pn.ui.grid.ColumnCtx);
  var comparer = function(a, b) {
    var x = cctx.getCompareableValue(a);
    var y = cctx.getCompareableValue(b);
    if (goog.isString(x)) {
      return goog.string.caseInsensitiveCompare(
          /** @type {string} */ (x),
          /** @type {string} */ (y));
    } else { return (x === y ? 0 : (x > y ? 1 : -1)); }
  };
  this.view.getDv().sort(comparer, asc);
};
