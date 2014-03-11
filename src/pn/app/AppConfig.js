
goog.provide('pn.app.AppConfig');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.data.BaseDalCache');



/**
 * Note: The defaultFieldRenderers and the defaultColumnRenderers map a field
 *    schema type property to a renderer.  Since the schema type comes from the
 *    server we need to specify them using strings.
 *
 * @constructor
 * @extends {goog.Disposable}
 * @param {Object=} opt_opts The configuration options for the
 *    application. These options will be extended on top of the default
 *    pn.app.AppConfig options.
 */
pn.app.AppConfig = function(opt_opts) {
  goog.Disposable.call(this);

  /**
   * This is any extension required for mvc controllers on the server.
   * @type {string}
   */
  this.mvcext = '';

  /**
   * This application root path.  All requests should be relative to this.
   * @type {string}
   */
  this.appPath = '/';

  /**
   * This application default facade controller path.  All Facade requests will
   *    go this this controller.
   * @type {string}
   */
  this.facadeUri = '';

  /**
   * The version of the current database.  If this number does not match the
   *    currently client cached db version the local client will be deleted.
   * @type {string}
   */
  this.dbver = '';

  /**
   * This is the type of the DAL type system away DalCache and is just a ctor
   *    that returns a subclass of BaseDalCache which is generated from the
   *    PicNet2.Data generators.
   * @type {null|function(new:pn.data.BaseDalCache,
   *    !Object.<Array.<pn.data.Entity>>)}
   */
  this.dalCacheType = null;

  /** @type {boolean} */
  this.useAsyncEventBus = false;

  /** @type {number} */
  this.memCacheExpireMins = 15;

  if (opt_opts) goog.object.extend(this, opt_opts);
  if (this.appPath.pnendsWith('/'))
    this.appPath = this.appPath.substring(0, this.appPath.length - 1);

  this.facadeUri = this.touri(this.facadeUri);
};
goog.inherits(pn.app.AppConfig, goog.Disposable);


/**
 * @param {string} controller The name of the controller.
 * @param {string=} opt_action The name of the action.
 * @return {string} The complete uri to the controller and action.
 */
pn.app.AppConfig.prototype.touri = function(controller, opt_action) {
  pn.assStr(controller);
  var uri = this.appPath + '/' + controller + this.mvcext;
  if (opt_action) uri += '/' + opt_action;
  return uri;
};


/** @return {!pn.ui.IDefaultRenderer} The default renderer builder. */
pn.app.AppConfig.prototype.defaultRendererCreator = goog.abstractMethod;
