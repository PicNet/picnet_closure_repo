;
goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.pubsub.PubSub');
goog.require('pn.app.AppConfig');
goog.require('pn.app.EventBus');
goog.require('pn.app.Router');
goog.require('pn.data.BaseFacade');
goog.require('pn.data.DataDownloader');
goog.require('pn.data.LazyFacade');
goog.require('pn.log');
goog.require('pn.ui.KeyShortcutMgr');
goog.require('pn.ui.LoadingPnl');
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

  /** @type {!pn.ui.ViewMgr} */
  this.view = new pn.ui.ViewMgr(pn.dom.getElement(this.cfg.viewContainerId));
  this.registerDisposable(this.view);

  /** @type {!pn.ui.MessagePanel} */
  this.msg = new pn.ui.MessagePanel(pn.dom.getElement(this.cfg.messagePanelId));
  this.registerDisposable(this.msg);

  /** @type {!pn.data.BaseFacade} */
  this.data = new pn.data.LazyFacade(this.cfg.facadeControllerPath);
  this.registerDisposable(this.data);

  /** @type {!pn.ui.LoadingPnl} */
  this.loading = new pn.ui.LoadingPnl(pn.dom.getElement(this.cfg.loadPnlId));
  this.registerDisposable(this.loading);

  /** @type {!pn.ui.KeyShortcutMgr} */
  this.keys = new pn.ui.KeyShortcutMgr();
  this.registerDisposable(this.keys);

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

  var sset = pn.data.BaseFacade.EventType;
  goog.events.listen(
      this.data, sset.LOADING, this.loading.increment, false, this.loading);
  goog.events.listen(
      this.data, sset.LOADED, this.loading.decrement, false, this.loading);

  this.specs = new pn.ui.UiSpecsRegister(this.getUiSpecs());
  this.registerDisposable(this.specs);

  var eventBusEvents = this.getDefaultAppEventHandlers_();
  goog.object.extend(eventBusEvents, this.getAppEventHandlers());
  for (var event in eventBusEvents) {
    this.bus_.sub(event, eventBusEvents[event]);
  }

  var navevent = pn.app.Router.EventType.NAVIGATING;
  goog.events.listen(this.router, navevent, this.acceptDirty_, false, this);

  this.router.initialise(this.getRoutes());
};


/**
 * @private
 * @return {!Object} The default/generic event handlers.
 */
pn.app.BaseApp.prototype.getDefaultAppEventHandlers_ = function() {
  var evs = {},
      ae = pn.app.AppEvents,
      bind = goog.bind;
  // Message
  evs[ae.CLEAR_MESSAGE] = bind(this.msg.clearMessage, this.msg);
  evs[ae.SHOW_MESSAGE] = bind(this.msg.showMessage, this.msg);
  evs[ae.SHOW_MESSAGES] = bind(this.msg.showMessages, this.msg);
  evs[ae.SHOW_ERROR] = bind(this.msg.showError, this.msg);
  evs[ae.SHOW_ERRORS] = bind(this.msg.showErrors, this.msg);
  evs[ae.ENTITY_VALIDATION_ERROR] = bind(this.msg.showErrors, this.msg);

  // Data
  evs[ae.QUERY] = bind(this.data.query, this.data);
  evs[ae.LIST_EXPORT] = bind(this.listExport_, this);
  evs[ae.LIST_ORDERED] = bind(this.orderEntities_, this);
  evs[ae.ENTITY_SAVE] = bind(function(type, raw) {
    var ctor = pn.data.TypeRegister.fromName(type);
    var entity = new ctor(raw);
    if (entity.id > 0) {
      this.data.updateEntity(entity);
      this.pub(ae.ENTITY_SAVED, entity);
    } else {
      this.data.createEntity(entity, goog.bind(function(created) {
        this.pub(ae.ENTITY_SAVED, created);
      }, this));
    }
  }, this);
  evs[ae.ENTITY_CLONE] = bind(this.cloneEntity_, this);
  evs[ae.ENTITY_DELETE] = bind(function(type, raw) {
    var ctor = pn.data.TypeRegister.fromName(type);
    this.data.deleteEntity(new ctor(raw));
  }, this);
  evs[ae.ENTITY_CANCEL] = bind(this.router.back, this.router);

  return evs;
};


/**
 * @private
 * @param {string} type The type of the entity being exported.
 *    This is not used in this fuction but must be there as this is a generic
 *    fireing of event that contains type as the first parameter. See
 *    ExportCommand for details.
 * @param {string} format The export format.
 * @param {Array.<Array.<string>>} data The data to export.
 */
pn.app.BaseApp.prototype.listExport_ = function(type, format, data) {
  var ed = {'exportType': format, 'exportData': pn.json.serialiseJson(data)};
  var uri = this.cfg.appPath + 'ExportData/ExportData';
  pn.data.DataDownloader.send(uri, ed);
};


/**
 * @private
 * @param {string} type The type of the entity to order.
 * @param {!Array.<number>} ids The list of IDs in correct order.
 * @param {function():undefined=} opt_cb The optional callback.
 */
pn.app.BaseApp.prototype.orderEntities_ = function(type, ids, opt_cb) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(goog.isArray(ids));

  var data = { type: type, ids: ids };
  var cb = opt_cb || function() {};
  this.data.ajax('History/GetAuditHistory', data, cb);
};


/**
 * @private
 * @param {string} type The type of the entity to save.
 * @param {pn.data.Entity} entity The entity to clone.
 */
pn.app.BaseApp.prototype.cloneEntity_ = function(type, entity) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(entity instanceof pn.data.Entity);

  if (!this.acceptDirty_()) return;

  var data = { 'type': type, 'entityJson': pn.json.serialiseJson(entity) };
  this.data.ajax('CloneEntity/CloneEntity', data, function(cloned) {
    cloned = pn.data.TypeRegister.parseEntity(type, cloned);
    pn.app.ctx.pub(pn.app.AppEvents.ENTITY_CLONED, type, cloned);
  });
};


/**
 * @private
 * @return {boolean} Wether happy to loose unsaved data (or not dirty).
 */
pn.app.BaseApp.prototype.acceptDirty_ = function() {
  if (!this.view.isDirty()) return true;
  return window.confirm('Any unsaved changes will be lost, continue?');
};


/** @override */
pn.app.BaseApp.prototype.disposeInternal = function() {
  pn.app.BaseApp.superClass_.disposeInternal.call(this);

  this.log.info('Disposing Application');

  var navevent = pn.app.Router.EventType.NAVIGATING;
  goog.events.unlisten(this.router, navevent, this.acceptDirty_, false, this);

  var sset = pn.data.BaseFacade.EventType;
  goog.events.listen(
      this.data, sset.LOADING, this.loading.increment, false, this.loading);
  goog.events.listen(
      this.data, sset.LOADED, this.loading.decrement, false, this.loading);
};
