;
goog.provide('pn.ui.grid.pipe.EditHandler');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 */
pn.ui.grid.pipe.EditHandler = function() {
  pn.ui.grid.pipe.GridHandler.call(this);
  this.requiredOnEmptyGrid = false;
};
goog.inherits(pn.ui.grid.pipe.EditHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.EditHandler.prototype.postRender = function() {
  this.slick.onCellChange.subscribe(goog.bind(function(e, args) {
    var e2 = new goog.events.Event(pn.web.WebAppEvents.GRID_EDIT_CHANGED, this);
    e2.col = this.cctxs[args['cell']].id;
    e2.entity = args['item'];
    this.pipeline.raiseGridEvent(e2);
  }, this));
};
