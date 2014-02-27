goog.provide('pn.Kernel');

goog.require('goog.Disposable');
goog.require('goog.labs.Promise');
goog.require('pn.app.EventBus');
goog.require('pn.app.Router');
goog.require('pn.data.Storage');
goog.require('pn.data.Storage.Type');
goog.require('pn.log');
goog.require('pn.ui.GlobalGestureHandler');
goog.require('pn.ui.LoadingPnl');
goog.require('pn.ui.MessagePanel');



/**
 * The dependency tree for the application.  Each service should be registered
 *    here and all classes should request their own dependencies from this
 *    globally accessible object when require.  It is important that most
 *    of the access to these services be synchronous.  Async code here
 *    causes huge callbacks pain throughout the system.  The constructur
 *    is a good place to initialise all the services that are async for later
 *    sync access.
 *
 * @constructor
 * @extends {goog.Disposable}
 * @param {string} appPath The application path for server requests.
 */
pn.Kernel = function(appPath) {
  if (pn.Kernel.initialised_) throw new Error('Kernel already initialised.');
  pn.Kernel.initialised_ = true;
  pn.Kernel.instance = this;

  pn.assStr(appPath);

  goog.Disposable.call(this);

  /** @protected @const @type {string} */
  this.appPath = appPath;

  /** @protected @const @type {!Object} */
  this.registered = {};

  /**
   * Router must be initialised straight away to prevent History from
   *    killing the page.
   * @protected @const @type {!pn.app.Router}
   */
  this.registered['router'] = new pn.app.Router();

  // Initialise the director so all pages and dialogs are hidden
  this.customcontrols();

  // Initialise the director so all pages and dialogs are hidden
  this.director();
};
goog.inherits(pn.Kernel, goog.Disposable);


/** @type {pn.Kernel} */
pn.Kernel.instance = null;


/** @private @type {boolean} */
pn.Kernel.initialised_ = false;


/**
 */
pn.Kernel.prototype.init = goog.abstractMethod;


/**
 * @return {!boolean} whether has initialised the instance
 */
pn.Kernel.initialised = function() {
  return pn.Kernel.initialised_;
};


/**
 * set the initialised_ to false
 */
pn.Kernel.reset = function() {

  pn.log.log('Reseting Kernel!!!');
  pn.Kernel.initialised_ = false;
};


/**
 * @param {string} id The id of this storage.
 * @param {!function(!pn.data.Storage):undefined} cb The callback that takes
 *    a storage backed by web-sql.
 */
pn.Kernel.prototype.dbStorage = function(id, cb) {
  pn.assStr(id);
  pn.assFun(cb);

  var type = pn.data.Storage.Type.websql;
  this['dbstorage-' + id] = new pn.data.Storage(id, cb, type);
};


/** @return {!pn.app.Router} The navigation router. */
pn.Kernel.prototype.router = function() {
  pn.assInst(this.registered['router'], pn.app.Router);
  return this.registered['router'];
};


/** @return {!pn.ui.MessagePanel} The messages panel. */
pn.Kernel.prototype.message = function() {
  return this.registered['message'] || (this.registered['message'] =
      new pn.ui.MessagePanel(pn.dom.get('common-message-panel')));
};


/**
 */
pn.Kernel.prototype.loading = goog.abstractMethod;


/** @return {!pn.ui.GlobalGestureHandler} The global gestures handler. */
pn.Kernel.prototype.gestures = function() {

  return this.registered['gestures'] || (this.registered['gestures'] =
      new pn.ui.GlobalGestureHandler(
          /** @type {!Element} */ (document.body)));
};


/**
 */
pn.Kernel.prototype.auth = goog.abstractMethod;


/**
 * @param {string} id The id of this storage.
 * @return {!pn.data.Storage} A storage backed by localStorage.
 */
pn.Kernel.prototype.localStorage = function(id) {
  pn.assStr(id);

  var ls = new pn.data.Storage(id,
      goog.nullFunction, pn.data.Storage.Type.localStorage);
  return this.registered['localStorage-' + id] = ls;
};


/**
 */
pn.Kernel.prototype.online = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.recorder = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.currentUser = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.comms = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.dirty = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.replayer = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.director = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.customcontrols = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.logins = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.domain = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.taskcats = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.taskaging = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.quickprogs = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.assignvalidator = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.tasksFilterer = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.taskListViewModel = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.filterValueStore = goog.abstractMethod;


/**
 */
pn.Kernel.prototype.controller = goog.abstractMethod;


/** @return {!pn.app.EventBus} */
pn.Kernel.prototype.bus = function() {
  return this.registered['bus'] || (this.registered['bus'] =
      new pn.app.EventBus(false));
};


/** @override */
pn.Kernel.prototype.disposeInternal = function() {
  pn.Kernel.superClass_.disposeInternal.call(this);

  goog.object.forEach(this.registered, goog.dispose);

  delete this.registered;
  delete pn.Kernel.instance;
};

