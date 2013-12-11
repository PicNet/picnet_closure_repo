;
goog.provide('pn.web.BaseWebApp');

goog.require('goog.Uri');
goog.require('pn.app.BaseApp');
goog.require('pn.web.WebAppConfig');
goog.require('pn.data.DataDownloader');
goog.require('pn.data.Server');
goog.require('pn.data.Server.EventType');
goog.require('pn.ui.KeyShortcutMgr');
goog.require('pn.ui.WebViewMgr');
goog.require('pn.web.WebAppEvents');



/**
 * @constructor
 * @extends {pn.app.BaseApp}
 * @param {Object=} opt_cfg The configuration options for the
 *    application. These options will be extended on top of the default
 *    pn.app.AppConfig options.
 */
pn.web.BaseWebApp = function(opt_cfg) {
  this.cfg = new pn.web.WebAppConfig(opt_cfg);
  this.registerDisposable(this.cfg);

  pn.app.BaseApp.call(this);

  /** @type {!pn.ui.KeyShortcutMgr} */
  this.keys = new pn.ui.KeyShortcutMgr();
  this.registerDisposable(this.keys);  

  /**
   * @private
   * @type {boolean}
   */
  this.impersonationEnabled_ = false;
};
goog.inherits(pn.web.BaseWebApp, pn.app.BaseApp);

/** @override */
pn.web.BaseWebApp.prototype.createViewManager = function() {
  pn.assInst(this.cfg, pn.web.WebAppConfig);

  return new pn.ui.WebViewMgr(pn.dom.get(this.cfg.viewContainerId));
};

/** @override. */
pn.web.BaseWebApp.prototype.getDefaultAppEventHandlers = function() {
  // TODO: We should have a WebAppEvents enumeration
  var evs = goog.base(this, 'getDefaultAppEventHandlers'),
      ae = pn.web.WebAppEvents;

  // Message  
  evs[ae.DALOG_SHOWN] = this.keys.disable.pnbind(this.keys);
  evs[ae.DALOG_HIDDEN] = this.keys.enable.pnbind(this.keys);
  evs[ae.LIST_EXPORT] = this.listExport_.pnbind(this);
  evs[ae.LIST_ORDERED] = this.orderEntities_.pnbind(this);

  return evs;
};


/** @override. */
pn.web.BaseWebApp.prototype.init = function() {
  if (this.cfg.enableImpersonation) { this.enableAjaxImpersonisation_(); }  

  goog.base(this, 'init');
};


/**
 * Impersonation Hack.  Makes all ajax requests impersonate the specified user.
 * @private
 * @suppress {visibility}
 */
pn.web.BaseWebApp.prototype.enableAjaxImpersonisation_ = function() {
  this.impersonationEnabled_ = true;
  var origajax = this.data.server.ajax_.pnbind(this.data.server);
  var impersonate = this.impersonatee();

  this.data.server.ajax_ = function() {
    if (impersonate) arguments[0] += '?impersonate=' + impersonate;
    origajax.apply(null, arguments);
  };
};


/**
 * @protected
 * @return {string} The user name of the person being impersonated.
 */
pn.web.BaseWebApp.prototype.impersonatee = function() {
  if (!this.impersonationEnabled_) return '';
  var qd = new goog.Uri(document.location.href).getQueryData();
  if (!qd.containsKey('impersonate')) return '';
  return qd.getValues('impersonate')[0];
};


/**
 * @protected
 * @param {boolean=} opt_cancelImpersonate Wether to cancel impersonation.
 *    Defaults to false.
 */
pn.web.BaseWebApp.prototype.gohome = function(opt_cancelImpersonate) {
  var uri = this.cfg.appPath;
  var imp = opt_cancelImpersonate === true ? '' : this.impersonatee();
  if (imp) uri += '?impersonate=' + imp;
  document.location.href = uri;
};


/**
 * @param {string} username The username of the user to impersonate if
 *    impersonation is enabled.
 */
pn.web.BaseWebApp.prototype.impersonate = function(username) {
  pn.assStr(username);
  if (!username || username === '0') return;

  if (!this.impersonationEnabled_)
    throw new Error('Impersonation is not enabled');

  window.localStorage.clear();
  var uri = pn.app.ctx.cfg.appPath + '/?impersonate=' +
      username.replace(/ /g, '%20');
  document.location.href = uri;
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
pn.web.BaseWebApp.prototype.listExport_ = function(type, format, data) {
  pn.assStr(type);
  pn.assStr(format);
  pn.assArr(data);
  pn.ass(format !== '0');

  var ed = {'exportType': format, 'exportData': pn.json.serialiseJson(data)};
  var uri = this.cfg.touri('ExportData', 'ExportData');
  pn.data.DataDownloader.send(uri, ed);
};


/**
 * @private
 * @param {string} type The type of the entity to order.
 * @param {!Array.<number>} ids The list of IDs in correct order.
 * @param {function():undefined=} opt_cb The optional callback.
 */
pn.web.BaseWebApp.prototype.orderEntities_ = function(type, ids, opt_cb) {
  pn.assStr(type);
  pn.assArr(ids);

  var data = { 'type': type, 'ids': ids },
      cb = opt_cb || goog.nullFunction,
      uri = this.cfg.touri('GridOrdering', 'OrderGrid');
  this.data.ajax(uri, data, cb);
};