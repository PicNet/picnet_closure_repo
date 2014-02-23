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
pn.ui.grid.pipe.OrderingHandler.prototype.postRender = function() {
  var col = !this.cfg.readonly && this.cfg.getCctxs().pnfind(function(cctx) {
    return cctx.spec instanceof pn.ui.grid.OrderingColumnSpec;
  });
  if (!col) return; // Not an odering grid

  this.rowOrdering_ = new pn.ui.grid.RowOrdering(this.slick);
  this.registerDisposable(this.rowOrdering_);
  this.rowOrdering_.init();

  this.listen(this.rowOrdering_, pn.web.WebAppEvents.LIST_ORDERED, function(e) {
    var entityType = this.cfg.getCctxs()[0].spec.entitySpec.type;
    pn.app.ctx.pub(e.type, entityType, e.ids);
  });

  this.fireCustomEvent('sort', {
    'colid': col.spec.dataProperty,
    'asc': true
  });
};
