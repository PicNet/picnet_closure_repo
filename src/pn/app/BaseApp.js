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
 * A globally accisble handle to the application context.
 * @type {pn.app.BaseApp}
 */
pn.app.ctx = null;



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
 * @param {Object=} opt_cfg The configuration options for the
 *    application. These options will be extended on top of the default
 *    pn.app.AppConfig options.
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
  this.registerDisposable(this.router);

  /** @type {!pn.app.AppConfig} */
  this.cfg = new pn.app.AppConfig(opt_cfg);
  this.registerDisposable(this.cfg);

  /** @type {pn.app.schema.Schema} */
  this.schema = null;

  /**
   * @protected
   * @type {!pn.ui.ViewMgr}
   */
  this.view = new pn.ui.ViewMgr(pn.dom.getElement(this.cfg.viewContainerId));
  this.registerDisposable(this.view);

  /**
   * @protected
   * @type {!pn.ui.MessagePanel}
   */
  this.msg = new pn.ui.MessagePanel(pn.dom.getElement(this.cfg.messagePanelId));
  this.registerDisposable(this.msg);

  /**
   * @private
   * @type {!pn.app.EventBus}
   */
  this.bus_ = new pn.app.EventBus(this.cfg.useAsyncEventBus);
  this.registerDisposable(this.bus_);

  // Convenience delegates.  Now you can publish by - pn.app.ctx.pub('event');
  this.pub = goog.bind(this.bus_.pub, this.bus_);

  this.init_();
};
goog.inherits(pn.app.BaseApp, goog.Disposable);

////////////////////////////////////////////////////////////////////////////////
// REQUIRED TEMPLATE METHODS
////////////////////////////////////////////////////////////////////////////////


/**
 * A template method used to load the schema for the entities being handled by
 *    this application. This schema is usually loaded from the server and is
 *    expected in the following format:
 *    [
 *      {
 *        'name': 'EntityName',
 *        'fields': [
 *          { 'name': 'ID', 'type': 'Int64' },
 *          { 'name': 'StringFieldName', 'type': 'String', 'length': 50 },
 *          { 'name': 'IntFieldName', 'type': 'Int32' },
 *          { 'name': 'BoolFieldName', 'type': 'YesNo' },
 *          { 'name': 'DateFieldName', 'type': 'DateTime' }
 *        ]
 *      }
 *    ]
 *
 * @see pn.app.schema
 * @param {function(!Array.<!Object>):undefined} schemaLoaded A callback to
 *    call with the loaded schema which representing the entities for this
 *    application.
 */
pn.app.BaseApp.prototype.loadSchema = goog.abstractMethod;


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

////////////////////////////////////////////////////////////////////////////////
// PRIVATE IMPLEMENTATION DETAILS
////////////////////////////////////////////////////////////////////////////////


/** @private */
pn.app.BaseApp.prototype.init_ = function() {
  goog.events.listen(window, 'unload', goog.bind(this.dispose, this));

  this.specs = new pn.ui.UiSpecsRegister(this.getUiSpecs());
  this.registerDisposable(this.specs);

  var eventBusEvents = this.getDefaultAppEventHandlers_();
  goog.object.extend(eventBusEvents, this.getAppEventHandlers());
  for (var event in eventBusEvents) {
    this.bus_.sub(event, eventBusEvents[event]);
  }

  var navevent = pn.app.Router.EventType.NAVIGATING;
  goog.events.listen(this.router, navevent, this.acceptDirty_, false, this);

  this.loadSchema(goog.bind(this.schemaLoaded_, this));
};


/**
 * @private
 * @param {!Array.<!Object>} schema The loaded schema object.
 */
pn.app.BaseApp.prototype.schemaLoaded_ = function(schema) {
  goog.asserts.assert(schema);

  this.schema = new pn.app.schema.Schema(schema);
  this.registerDisposable(this.schema);

  this.router.initialise(this.getRoutes());
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
};
