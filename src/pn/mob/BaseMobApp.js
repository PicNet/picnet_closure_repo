;
goog.provide('pn.mob.BaseMobApp');

goog.require('pn.app.BaseApp');
goog.require('pn.ui.MobViewMgr');
goog.require('pn.mob.MobAppConfig');
goog.require('pn.ui.UiSpecsRegister');

/**
 * @constructor
 * @extends {pn.app.BaseApp}
 * @param {Object=} opt_cfg The configuration options for the
 *    application. These options will be extended on top of the default
 *    pn.app.AppConfig options.
 */
pn.mob.BaseMobApp = function(opt_cfg) {
  this.cfg = new pn.mob.MobAppConfig(opt_cfg);
  this.registerDisposable(this.cfg);
  
  pn.app.BaseApp.call(this, opt_cfg);

  /** @type {!pn.ui.MobViewMgr} */
  this.view = new pn.ui.MobViewMgr();
  this.registerDisposable(this.view);  
};
goog.inherits(pn.mob.BaseMobApp, pn.app.BaseApp);


/** @override */
pn.mob.BaseMobApp.prototype.createViewManager = function() {
  pn.assInst(this.cfg, pn.mob.MobAppConfig);

  return new pn.ui.MobViewMgr();
};