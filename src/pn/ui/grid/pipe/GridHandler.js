;
goog.provide('pn.ui.grid.pipe.GridHandler');

goog.require('goog.events.EventHandler');



/**
 * @constructor
 * @extends {goog.events.EventHandler}
 */
pn.ui.grid.pipe.GridHandler = function() {
  goog.events.EventHandler.call(this);

  /**
   * Be default handlers are not initialised (preRender/postRender) when the
   *    grid is empty. This is because there is actually no grid control and
   *    DataView and most handlers depend on these.  However, if you do need
   *    a handler to be initialised even when no grid is present (like the
   *    CommandsHandler) then set this to true in your child class.
   *
   * @see pn.ui.grid.pipe.CommandsHandler
   * @type {boolean}
   */
  this.requiredOnEmptyGrid = false;

  /**
   * @protected
   * @type {Slick.Grid}
   */
  this.slick = null;

  /**
   * @protected
   * @type {pn.ui.grid.DataView}
   */
  this.view = null;

  /**
   * @protected
   * @type {pn.ui.grid.Config}
   */
  this.cfg = null;

  /**
   * @protected
   * @type {pn.ui.grid.Interceptor}
   */
  this.interceptor = null;


  /**
   * @protected
   * @type {pn.ui.grid.pipe.HandlerPipeline}
   */
  this.pipeline = null;
};
goog.inherits(pn.ui.grid.pipe.GridHandler, goog.events.EventHandler);


/**
 * Initialises all the handlers in this handler.
 * @param {Slick.Grid} slick The reference to the slick grid being shown.
 * @param {pn.ui.grid.DataView} view The data view being shown.
 * @param {pn.ui.grid.Config} cfg The grid configuration being used.
 * @param {!pn.ui.grid.pipe.HandlerPipeline} pipeline A reference to the
 *    pipeline.
 * @param {pn.ui.grid.Interceptor} interceptor The grid interceptor.
 */
pn.ui.grid.pipe.GridHandler.prototype.setMembers =
    function(slick, view, cfg, pipeline, interceptor) {
  this.slick = slick;
  this.view = view;
  this.cfg = cfg;
  this.pipeline = pipeline;
  this.interceptor = interceptor;
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
  pn.ass(this.pipeline, 'Ensure that fireCustomEvent is not ' +
      'called before init is called on the pn.ui.grid.pipe.GridHandler.');

  this.pipeline.fireCustomEvent(eventType, opt_data);
};


/** @override */
pn.ui.grid.pipe.GridHandler.prototype.disposeInternal = function() {
  pn.ui.grid.pipe.GridHandler.superClass_.disposeInternal.call(this);

  delete this.slick;
  delete this.view;
  delete this.cfg;
  delete this.pipeline;
  delete this.interceptor;
};
