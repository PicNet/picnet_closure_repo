;
goog.provide('pn.ui.grid.pipe.TotalsHandler');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 * @param {Element} parent The parent Grid element container.
 */
pn.ui.grid.pipe.TotalsHandler = function(parent) {
  pn.ass(parent);

  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.grid.pipe.TotalsHandler');

  /**
   * @private
   * @type {Element}
   */
  this.parent_ = parent;

  /**
   * @private
   * @type {Array.<!pn.ui.grid.ColumnCtx>}
   */
  this.totalColumns_ = null;
  /**
   * @private
   * @type {Element}
   */
  this.totalsLegend_ = null;
};
goog.inherits(pn.ui.grid.pipe.TotalsHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.TotalsHandler.prototype.preRender = function() {
  this.totalColumns_ = this.cctxs.pnfilter(
      function(cctx) { return !!cctx.spec.total; });
  if (!this.totalColumns_.length) { return; }

  this.totalsLegend_ = goog.dom.createDom('div', 'totals-legend');
  goog.dom.appendChild(this.parent_, this.totalsLegend_);
};


/** @override */
pn.ui.grid.pipe.TotalsHandler.prototype.postRender = function() {
  this.updateTotals_();
};


/** @override */
pn.ui.grid.pipe.TotalsHandler.prototype.onCustomEvent = function(eventType) {
  if (eventType === 'row-count-changed') { this.updateTotals_(); }
};


/** @private */
pn.ui.grid.pipe.TotalsHandler.prototype.updateTotals_ = function() {
  if (!this.totalColumns_ || !this.totalColumns_.length) return;

  var items = this.view.getItems();
  var total = items.pnreduce(function(acc, item) {
    this.totalColumns_.pnforEach(function(cctx1) {
      if (acc[cctx1.id] === undefined) acc[cctx1.id] = 0;
      var itemVal = item[cctx1.id];
      if (itemVal) acc[cctx1.id] += itemVal;
    }, this);
    return acc;
  }, {}, this);
  var html = [];
  for (var field in total) {
    var cctx = this.totalColumns_.pnfind(
        function(cctx1) { return cctx1.id === field; });
    var val;
    var ctor = pn.data.TypeRegister.fromName(cctx.entitySpec.type);
    var entity = new ctor(total);
    var renderer = cctx.getColumnRenderer();
    if (renderer) { val = renderer(cctx, entity); }
    else { val = parseInt(total[field], 10); }
    html.push('Total ' + cctx.spec.name + ': ' + val || '0');
  }
  this.totalsLegend_.innerHTML = '<ul><li>' +
      html.join('</li><li>') + '</li>';
};

