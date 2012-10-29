;
goog.provide('pn.web.BaseWebApp');

goog.require('pn.ui.KeyShortcutMgr');
goog.require('pn.ui.LoadingPnl');
goog.require('pn.ui.MessagePanel');
goog.require('pn.ui.UiSpec');
goog.require('pn.ui.UiSpecsRegister');
goog.require('pn.ui.ViewMgr');



/**
 * @constructor
 * @extends {pn.web.BaseWebApp}
 * @param {Object=} opt_cfg The configuration options for the
 *    application. These options will be extended on top of the default
 *    pn.app.AppConfig options.
 */
pn.web.BaseWebApp = function(opt_cfg) {
  pn.web.BaseWebApp.call(opt_cfg);

  /** @type {pn.ui.UiSpecsRegister} */
  this.specs = null;

  /** @type {!pn.ui.ViewMgr} */
  this.view = new pn.ui.ViewMgr(pn.dom.get(this.cfg.viewContainerId));
  this.registerDisposable(this.view);

  /** @type {!pn.ui.MessagePanel} */
  this.msg = new pn.ui.MessagePanel(pn.dom.get(this.cfg.messagePanelId));
  this.registerDisposable(this.msg);


  /** @type {!pn.ui.LoadingPnl} */
  this.loading = new pn.ui.LoadingPnl(pn.dom.get(this.cfg.loadPnlId));
  this.registerDisposable(this.loading);

  /** @type {!pn.ui.KeyShortcutMgr} */
  this.keys = new pn.ui.KeyShortcutMgr();
  this.registerDisposable(this.keys);
};
goog.inherits(pn.web.BaseWebApp, pn.web.BaseWebApp);


/** @override. */
pn.web.BaseWebApp.prototype.getDefaultAppEventHandlers = function() {
  var evs = goog.base(this, 'getDefaultAppEventHandlers'),
      ae = pn.app.AppEvents;

  // Message
  evs[ae.CLEAR_MESSAGE] = this.msg.clearMessage.pnbind(this.msg);
  evs[ae.SHOW_MESSAGE] = this.msg.showMessage.pnbind(this.msg);
  evs[ae.SHOW_MESSAGES] = this.msg.showMessages.pnbind(this.msg);
  evs[ae.SHOW_ERROR] = this.msg.showError.pnbind(this.msg);
  evs[ae.SHOW_ERRORS] = this.msg.showErrors.pnbind(this.msg);
  evs[ae.ENTITY_VALIDATION_ERROR] = this.msg.showErrors.pnbind(this.msg);

  return evs;
};


/** @override. */
pn.web.BaseWebApp.prototype.init = function() {
  this.specs = new pn.ui.UiSpecsRegister(this.getUiSpecs());
  this.registerDisposable(this.specs);

  var sset = pn.data.Server.EventType,
      lp = this.loading;
  goog.events.listen(this.data, sset.LOADING, lp.increment, false, lp);
  goog.events.listen(this.data, sset.LOADED, lp.decrement, false, lp);

  goog.base(this, 'init');
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


/** @override */
pn.app.BaseApp.prototype.acceptDirty = function() {
  if (!this.view.isDirty()) return true;
  return window.confirm('Any unsaved changes will be lost, continue?');
};


/** @override */
pn.app.BaseApp.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  var sset = pn.data.Server.EventType,
      lp = this.loading;
  goog.events.unlisten(this.data, sset.LOADING, lp.increment, false, lp);
  goog.events.unlisten(this.data, sset.LOADED, lp.decrement, false, lp);
};
