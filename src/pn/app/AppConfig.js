
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
   * If true all client data is kept upto date live with the server. That is,
   *    when any data change is done on the server that change is reflected
   *    live on the client.
   * @type {boolean}
   */
  this.serverSync = true;

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
};
goog.inherits(pn.app.AppConfig, goog.Disposable);
