;
goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.pubsub.PubSub');
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
   * @type {goog.pubsub.PubSub}
   */
  this.bus_ = new goog.pubsub.PubSub();  

  goog.events.listen(window, 'unload', goog.bind(this.dispose, this));  

  var events = this.getAppEventHandlers();
  for (var event in events) { this.sub(event, events[event]); }

  /** @type {pn.app.Router} */
  this.router = new pn.app.Router(this.getRoutes());    
  this.router.initialise(); // Parse and execute the first route
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

/**
 * @param {string} topic Topic to publish to.
 * @param {...*} args Arguments that are applied to each subscription function.
 */
pn.app.BaseApp.prototype.pub = function(topic, args) {
  goog.asserts.assert(topic);

  var msg = topic;
  if (args && typeof(args) === 'string' && args.length < 20) msg += ' ' + args;
  this.log.fine(msg);

  var hasSubscribersMsg = '"' + topic + '" has no subscribers.';
  goog.asserts.assert(this.bus_.getCount(topic) > 0, hasSubscribersMsg);
  this.bus_.publish.apply(this.bus_, arguments);
};


/**
 * Use this method to to subscribe to the stream of events.
 *
 * @param {string} topic The topic to subscribe to.
 * @param {Function} callback The callback to call on the publishing
 *    of the specified topic.
 * @param {Object=} opt_handler The optional object to use as the callback
 *    context.
 */
pn.app.BaseApp.prototype.sub = function(topic, callback, opt_handler) {
  var handler = opt_handler || this;
  var args = arguments;
  var cb = function() { callback.apply(handler, args); };
  if (this.asyncPubSub_) {
    this.bus_.subscribe(topic, function() { goog.Timer.callOnce(cb, 0); });    
  } else { 
    this.bus_.subscribe(topic, cb);
  }
};


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
