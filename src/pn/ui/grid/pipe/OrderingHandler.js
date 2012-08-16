;
goog.provide('pn.ui.grid.pipe.OrderingHandler');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 */
pn.ui.grid.pipe.OrderingHandler = function() {
  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {pn.ui.grid.RowOrdering}
   */
  this.rowOrdering_ = null;
};
goog.inherits(pn.ui.grid.pipe.OrderingHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.OrderingHandler.prototype.init = function() {
  var orderCol = !this.cfg.readonly &&
      goog.array.find(this.cctxs, function(cctx) {
        return cctx.spec instanceof pn.ui.grid.OrderingColumnSpec; });
  if (!orderCol) return; // Not an odering grid

  this.rowOrdering_ = new pn.ui.grid.RowOrdering(this.slick);
  this.registerDisposable(this.rowOrdering_);
  this.rowOrdering_.init();

  this.listen(this.rowOrdering_, pn.app.AppEvents.LIST_ORDERED, function(e) {
    var entityType = this.cctxs[0].spec.entitySpec.type;
    pn.app.ctx.pub(e.type, entityType, e.ids);
  });

  this.fireCustomEvent('sort', {
    'colid': orderCol.spec.dataProperty,
    'asc': true
  });
};
