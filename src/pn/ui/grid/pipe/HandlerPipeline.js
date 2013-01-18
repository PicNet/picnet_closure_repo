;
goog.provide('pn.ui.grid.pipe.HandlerPipeline');

goog.require('goog.events.Event');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pn.ui.grid.pipe.HandlerPipeline = function() {
  goog.events.EventTarget.call(this);
  /**
   * @private
   * @type {!Array.<!pn.ui.grid.pipe.GridHandler>}
   */
  this.handlers_ = [];
};
goog.inherits(pn.ui.grid.pipe.HandlerPipeline, goog.events.EventTarget);


/**
 * @param {!pn.ui.grid.pipe.GridHandler} handler The handler to add to the end
 *    of the pipeline.
 */
pn.ui.grid.pipe.HandlerPipeline.prototype.add = function(handler) {
  pn.ass(handler);

  this.registerDisposable(handler);

  this.handlers_.push(handler);
};


/**
 * Initialises all the handlers in this pipeline. This method should only
 *    ever be called once.
 * @param {Slick.Grid} slick The reference to the slick grid being shown.
 * @param {pn.ui.grid.DataView} view The data view being shown.
 * @param {pn.ui.grid.Config} cfg The grid configuration being used.
 * @param {!Array.<!pn.ui.grid.ColumnCtx>} cctxs The column contexts being
 *    displayed.
 * @param {pn.ui.grid.Interceptor} interceptor The grid interceptor.
 */
pn.ui.grid.pipe.HandlerPipeline.prototype.setMembers =
    function(slick, view, cfg, cctxs, interceptor) {
  this.handlers_.pnforEach(function(h) {
    h.setMembers(slick, view, cfg, cctxs, this, interceptor);
  }, this);
};


/**
 * Called before the grid and dataview have their display data
 * @param {boolean} isEmpty Wether the grid is empty.  By default the handlers
 *    are not initialised if the grid is empty.
 */
pn.ui.grid.pipe.HandlerPipeline.prototype.preRender = function(isEmpty) {
  this.handlers_.pnforEach(
      function(h) { if (!isEmpty || h.requiredOnEmptyGrid) h.preRender(); });
};


/**
 * Called after the grid and dataview have their data
 * @param {boolean} isEmpty Wether the grid is empty.  By default the handlers
 *    are not initialised if the grid is empty.
 */
pn.ui.grid.pipe.HandlerPipeline.prototype.postRender = function(isEmpty) {
  this.handlers_.pnforEach(
      function(h) { if (!isEmpty || h.requiredOnEmptyGrid) h.postRender(); });
};


/**
 * @param {string} eventType The type of event to fire.
 * @param {*=} opt_data  The optional data object to pass to the event
 *    handlers.
 */
pn.ui.grid.pipe.HandlerPipeline.prototype.fireCustomEvent =
    function(eventType, opt_data) {
  pn.ass(eventType);

  this.handlers_.pnforEach(function(h) {
    h.onCustomEvent(eventType, opt_data);
  });
};


/**
 * @param {goog.events.Event} event The event to push up to the grid for
 *    impersonation.
 */
pn.ui.grid.pipe.HandlerPipeline.prototype.raiseGridEvent = function(event) {
  var et = pn.ui.grid.pipe.HandlerPipeline.EventType.PIPELINE_EVENT;
  var e = new goog.events.Event(et, this);
  e.innerEvent = event;
  this.dispatchEvent(e);
};


/** @enum {string} */
pn.ui.grid.pipe.HandlerPipeline.EventType = {
  PIPELINE_EVENT: 'pipeline-event'
};
