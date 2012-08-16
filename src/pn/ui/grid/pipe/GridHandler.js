;
goog.provide('pn.ui.grid.pipe.GridHandler');

goog.require('goog.events.EventHandler');



/**
 * @constructor
 * @extends {goog.events.EventHandler}
 */
pn.ui.grid.pipe.GridHandler = function() {
  goog.events.EventHandler.call(this);

  /** @type {Slick.Grid} */
  this.slick = null;

  /** @type {pn.ui.grid.DataView} */
  this.view = null;

  /** @type {pn.ui.grid.Config} */
  this.cfg = null;

  /** @type {Array.<!pn.ui.grid.ColumnCtx>} */
  this.cctxs = null;

  /** @type {pn.ui.grid.pipe.HandlerPipeline} */
  this.pipeline = null;
};
goog.inherits(pn.ui.grid.pipe.GridHandler, goog.events.EventHandler);


/**
 * Initialises all the handlers in this handler.
 * @param {Slick.Grid} slick The reference to the slick grid being shown.
 * @param {pn.ui.grid.DataView} view The data view being shown.
 * @param {pn.ui.grid.Config} cfg The grid configuration being used.
 * @param {!Array.<!pn.ui.grid.ColumnCtx>} cctxs The column contexts being
 *    displayed.
 * @param {!pn.ui.grid.pipe.HandlerPipeline} pipeline A reference to the
 *    pipeline.
 */
pn.ui.grid.pipe.GridHandler.prototype.setMembers =
    function(slick, view, cfg, cctxs, pipeline) {
  this.slick = slick;
  this.view = view;
  this.cfg = cfg;
  this.cctxs = cctxs;
  this.pipeline = pipeline;
};


/**
 * Override to add functionality to the grid before the grid and dataview have
 *    their data and are rendered on the page.
 */
pn.ui.grid.pipe.GridHandler.prototype.preRender = function() {};


/**
 * Override to add functionality to the grid before the grid and dataview have
 *    their data and are rendered on the page.
 */
pn.ui.grid.pipe.GridHandler.prototype.postRender = function() {};


/**
 * @param {string} eventType The type of event being fired.
 * @param {*=} opt_data  Any optional data object for this event.
 */
pn.ui.grid.pipe.GridHandler.prototype.onCustomEvent =
    function(eventType, opt_data) {};


/**
 * @param {string} eventType The type of event to fired.
 * @param {*=} opt_data  Any optional data object for this event.
 */
pn.ui.grid.pipe.GridHandler.prototype.fireCustomEvent =
    function(eventType, opt_data) {
  goog.asserts.assert(this.pipeline, 'Ensure that fireCustomEvent is not ' +
      'called before init is called on the pn.ui.grid.pipe.GridHandler.');

  this.pipeline.fireCustomEvent(eventType, opt_data);
};
