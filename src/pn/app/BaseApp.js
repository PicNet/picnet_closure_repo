;
goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.pubsub.PubSub');
goog.require('pn.app.AppConfig');
goog.require('pn.app.EventBus');
goog.require('pn.app.Router');
goog.require('pn.app.schema.Schema');
goog.require('pn.log');
goog.require('pn.ui.MessagePanel');
goog.require('pn.ui.UiSpecsRegister');
goog.require('pn.ui.ViewMgr');

goog.provide('pn.app.BaseApp');



/**
 * This is the main starting point to any pn.app application. Extend this class
 * and implement the following methods:
 *
 * getRoutes: Returns a name/callback map that respond to the browser '#' hash
 *   changes and allows for bookmarking and proper history management.
 *
 * getUiSpecs: Returns a set of types that implement pn.ui.UiSpec.  These are
 *   specs that leverage the pn.ui package.
 *
 * getAppEventHandlers: Returns a name/callback map that respond to
 *   pn.app.ctx.pub calls.  These events/callbacks are not bookmarkable.
 *
 * disposeInternal: Dispose any created entity here.  Ensure you call
 *   superClass_.disposeInternal.
 *
 * When the application is ready to begin just call the this.initialise method
 *   passing in a pn.app.schema.Schema object describing the data structure.
 *
 * If any of the default settings need to be changed just change the appropriate
 *   setting in pn.app.ctx.cfg.
 *
 * @constructor
 * @param {pn.app.AppConfig=} opt_cfg The configuration options for the
 *    application. If this is not specified then the default AppConfig is used.
 * @extends {goog.Disposable}
 */
pn.app.BaseApp = function(opt_cfg) {
  goog.Disposable.call(this);

  // Create a globally accessible handle to the application context
  pn.app.ctx = this;

  /**
   * @protected
   * @type {goog.debug.Logger}
   */
  this.log = pn.log.getLogger('pn.app.BaseApp');
  this.log.info('Creating Application');

  /** @type {pn.ui.UiSpecsRegister} */
  this.specs = null;

  /** @type {!pn.app.Router} */
  this.router = new pn.app.Router();

  /** @type {!pn.app.AppConfig} */
  this.cfg = opt_cfg || new pn.app.AppConfig();

  /** @type {pn.app.schema.Schema} */
  this.schema = null;

  /**
   * @protected
   * @type {!pn.ui.ViewMgr}
   */
  this.view = new pn.ui.ViewMgr(pn.dom.getElement(this.cfg.viewContainerId));

  /**
   * @protected
   * @type {!pn.ui.MessagePanel}
   */
  this.msg = new pn.ui.MessagePanel(pn.dom.getElement(this.cfg.messagePanelId));

  /**
   * @private
   * @type {!pn.app.EventBus}
   */
  this.bus_ = new pn.app.EventBus(this.cfg.useAsyncEventBus);

  // Convenience delegates.  Now you can publish by - pn.app.ctx.pub('event');
  this.pub = goog.bind(this.bus_.pub, this.bus_);

  goog.events.listen(window, 'unload', goog.bind(this.dispose, this));
};
goog.inherits(pn.app.BaseApp, goog.Disposable);


/**
 * A globally accisble handle to the application context.
 * @type {pn.app.BaseApp}
 */
pn.app.ctx = null;


/**
 * Start the application by calling the first route.  Also sets the system
 * schema to add default validation.
 * @param {!Array} schema The schema describing the system database.
 *  This is used to provide default validation.
 */
pn.app.BaseApp.prototype.initialise = function(schema) {
  goog.asserts.assert(schema);

  this.schema = new pn.app.schema.Schema(schema);

  this.specs = new pn.ui.UiSpecsRegister(this.getUiSpecs());

  var eventBusEvents = this.getDefaultAppEventHandlers_();
  goog.object.extend(eventBusEvents, this.getAppEventHandlers());
  for (var event in eventBusEvents) {
    this.bus_.sub(event, eventBusEvents[event]);
  }
  this.router.initialise(this.getRoutes());
  var navevent = pn.app.Router.EventType.NAVIGATING;
  goog.events.listen(this.router, navevent, this.acceptDirty_, false, this);
};


/**
 * @private
 * @return {!Object} The default/generic event handlers.
 */
pn.app.BaseApp.prototype.getDefaultAppEventHandlers_ = function() {
  var evs = {},
      ae = pn.app.AppEvents;
  evs[ae.CLEAR_MESSAGE] = goog.bind(this.msg.clearMessage, this.msg);
  evs[ae.SHOW_MESSAGE] = goog.bind(this.msg.showMessage, this.msg);
  evs[ae.SHOW_MESSAGES] = goog.bind(this.msg.showMessages, this.msg);
  evs[ae.SHOW_ERROR] = goog.bind(this.msg.showError, this.msg);
  evs[ae.SHOW_ERRORS] = goog.bind(this.msg.showErrors, this.msg);
  evs[ae.ENTITY_VALIDATION_ERROR] = goog.bind(this.msg.showErrors, this.msg);
  return evs;
};


/**
 * A template method used to get all required UiSpecs.  This method should
 *    return an object map (id/ctor pair) with types such as:
 *    {
 *      'Type1': pn.application.specs.Spec1,
 *      'Type1': pn.application.specs.Spec2
 *    {
 *
 * @return {!Object.<!function(new:pn.ui.UiSpec)>} The routes for this
 *    application. The first route is considered the default route.
 */
pn.app.BaseApp.prototype.getUiSpecs = goog.abstractMethod;


/**
 * A template method used to get all required routes.  This method should
 *    return a routes map in the format:
 *    {
 *      'route-name1': callback1,
 *      'route-name2': callback2
 *    }
 * The first route is considered the default route.
 *
 * To navigate to a rounte simple call
 *    pn.app.ctx.router.navigate('path/including/args')
 *
 * @return {!Object.<!Function>} The routes for this application. The first
 *    route is considered the default route.
 */
pn.app.BaseApp.prototype.getRoutes = goog.abstractMethod;


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
 * @private
 * @return {boolean} Wether happy to loose unsaved data (or not dirty).
 */
pn.app.BaseApp.prototype.acceptDirty_ = function() {
  if (!this.view.isDirty()) return true;
  return window.confirm('Any unsaved changes will be lost, continue?');
};


/** @inheritDoc */
pn.app.BaseApp.prototype.disposeInternal = function() {
  pn.app.BaseApp.superClass_.disposeInternal.call(this);

  this.log.info('Disposing Application');

  var navevent = pn.app.Router.EventType.NAVIGATING;
  goog.events.unlisten(this.router, navevent, this.acceptDirty_, false, this);

  goog.dispose(this.log);
  goog.dispose(this.router);
  goog.dispose(this.specs);
  goog.dispose(this.bus_);
  goog.dispose(this.cfg);
  goog.dispose(this.schema);
  goog.dispose(this.view);
  goog.dispose(this.msg);

  delete pn.app.ctx;
  delete this.log;
  delete this.router;
  delete this.specs;
  delete this.bus_;
  delete this.cfg;
  delete this.schema;
  delete this.view;
  delete this.msg;
};
