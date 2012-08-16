;
goog.provide('pn.ui.grid.pipe.GridHandler');

goog.require('goog.events.EventHandler');



/**
 * @constructor
 * @extends {goog.events.EventHandler}
 * @param {Slick.Grid} slick The reference to the slick grid being shown.
 * @param {pn.ui.grid.DataView} view The data view being shown.
 * @param {pn.ui.grid.Config} cfg The grid configuration being used.
 */
pn.ui.grid.pipe.GridHandler = function(slick, view, cfg) {
  goog.events.EventHandler.call(this);

  /**
   * @protected
   * @type {Slick.Grid}
   */
  this.slick = slick;

  /**
   * @protected
   * @type {pn.ui.grid.DataView}
   */
  this.view = view;

  /**
   * @protected
   * @type {pn.ui.grid.Config}
   */
  this.cfg = cfg;

  /** @type {pn.ui.grid.pipe.HandlerPipeline} */
  this.pipeline = null;
};
goog.inherits(pn.ui.grid.pipe.GridHandler, goog.events.EventHandler);


/**
 * Initialise your handler here.  At this stage all fields (slick, view, cfg
 *    and pipeline are available to your.
 */
pn.ui.grid.pipe.GridHandler.prototype.init = goog.abstractMethod;


/**
 * Override if any events need to be registerd on the grid or data view.
 */
pn.ui.grid.pipe.GridHandler.prototype.registerEvents = function() {};


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
