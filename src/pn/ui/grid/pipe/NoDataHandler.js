;
goog.provide('pn.ui.grid.pipe.NoDataHandler');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 * @param {Element} noDataElement The element to show when there is no data.
 */
pn.ui.grid.pipe.NoDataHandler = function(noDataElement) {
  pn.ass(noDataElement);

  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {Element}
   */
  this.noDataElement_ = noDataElement;

};
goog.inherits(pn.ui.grid.pipe.NoDataHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.NoDataHandler.prototype.onCustomEvent = function(eventType) {
  if (eventType === 'row-count-changed') {
    pn.dom.show(this.noDataElement_, this.view.getDv().getLength() === 0);
  }
};
