;
goog.provide('pn.ui.grid.pipe.ColWidthsHandler');

goog.require('goog.events.Event');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 * @param {string} gridId The unique grid id for the current grid.
 */
pn.ui.grid.pipe.ColWidthsHandler = function(gridId) {
  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {string}
   */
  this.storeId_ = gridId + '_widths';
};
goog.inherits(pn.ui.grid.pipe.ColWidthsHandler,
    pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.ColWidthsHandler.prototype.preRender = function() {
  var state = window.localStorage.getItem(this.storeId_);
  if (!state) return;

  var widths = goog.json.unsafeParse(state);
  this.slick.getColumns().pnforEach(function(col, idx) {
    col.width = widths[idx];
  });
};


/** @override */
pn.ui.grid.pipe.ColWidthsHandler.prototype.onCustomEvent = function(et) {
  if (et === 'resize') { this.saveGridWidths_(); }
};


/** @private */
pn.ui.grid.pipe.ColWidthsHandler.prototype.saveGridWidths_ = function() {
  var columns = this.slick.getColumns();
  var data = columns.pnmap(function(c) { return c['width']; });
  window.localStorage.setItem(this.storeId_, pn.json.serialiseJson(data));
};
