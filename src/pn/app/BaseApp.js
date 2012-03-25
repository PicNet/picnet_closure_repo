;
goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.pubsub.PubSub');
goog.require('pn.app.EventBus');
goog.require('pn.app.Router');
goog.require('pn.log');
goog.require('pn.ui.UiSpecsRegister');

goog.provide('pn.app.BaseApp');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.app.BaseApp = function() {
  goog.Disposable.call(this);

  // Create a globally accessible handle to the application context
  pn.app.ctx = this;

  pn.log.initialise();
  /** @type {goog.debug.Logger} */
  this.log = pn.log.getLogger('pn.app.BaseApp');
  this.log.info('Creating Application');

  /** @type {pn.ui.UiSpecsRegister} */
  this.specs = new pn.ui.UiSpecsRegister(this.getUiSpecs());

  /**
   * @private
   * @const
   * @type {boolean}
   */
  this.asyncPubSub_ = false;

  /**
   * @private
   * @type {!pn.app.EventBus}
   */
  this.bus_ = new pn.app.EventBus(false);

  goog.events.listen(window, 'unload', goog.bind(this.dispose, this));

  var events = this.getAppEventHandlers();
  for (var event in events) { this.bus_.sub(event, events[event]); }

  /** @type {pn.app.Router} */
  this.router = new pn.app.Router(this.getRoutes());
  this.router.initialise(); // Parse and execute the first route

  // Convenience delegates
  pn.app.ctx.pub = goog.bind(this.bus_.pub, this.bus_);
};
goog.inherits(pn.app.BaseApp, goog.Disposable);


/**
 * A globally accisble handle to the application context.
 * @type {pn.app.BaseApp}
 */
pn.app.ctx = null;


/** Start the application */
pn.app.BaseApp.prototype.initialise = function() {
  this.router.initialise();
};


/**
 * A template method used to get all required routes.  This method should
 *    return a routes map in the format:
 *    {
 *      'route-name1': callback1,
 *      'route-name2': callback2
 *    }
 * The first route is considered the default route.
 *
 * @return {!Object.<!Function>} The routes for this application. The first
 *    route is considered the default route.
 */
pn.app.BaseApp.prototype.getRoutes = goog.abstractMethod;


/**
 * A template method used to get all required UiSpecs.  This method should
 *    return an array with types such as:
 *    [
 *      pn.application.specs.Spec1,
 *      pn.application.specs.Spec2
 *    ]
 *
 * @return {!Array.<!function(new:pn.ui.UiSpec)>} The routes for this
 *    application. The first route is considered the default route.
 */
pn.app.BaseApp.prototype.getUiSpecs = goog.abstractMethod;


/**
 * A template method used to get all required event handlers.  These event
 *    handlers will respond to the pn.app.ctx.pub('event-name', args) calls.
 *
 *    The map should be in the following format:
 *    {
 *      'event-name-1': callback1,
 *      'event-name-2': callback2
 *    {
 *
 * @return {!Object.<!Function>} The event handlers for handling
 *    pn.app.ctx.pub('event-name', args) calls.
 */
pn.app.BaseApp.prototype.getAppEventHandlers = goog.abstractMethod;


/** @inheritDoc */
pn.app.BaseApp.prototype.disposeInternal = function() {
  pn.app.BaseApp.superClass_.disposeInternal.call(this);

  this.log.info('Disposing Application');

  goog.dispose(this.log);
  goog.dispose(this.router);
  goog.dispose(this.specs);
  goog.dispose(this.bus_);

  delete pn.app.ctx;
  delete this.log;
  delete this.router;
  delete this.specs;
  delete this.bus_;
};
