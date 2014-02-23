;
goog.provide('pn.mob.BaseMobileApp');

goog.require('pn.app.BaseApp');



/**
 * @constructor
 * @extends {pn.app.BaseApp}
 * @param {!Element} el The main container element used for the dom generation.
 * @param {Object=} opt_cfg The configuration options for the
 *    application. These options will be extended on top of the default
 *    pn.app.AppConfig options.
 */
pn.mob.BaseMobileApp = function(el, opt_cfg) {
  pn.app.BaseApp.call(this, opt_cfg);

  /** @type {!Element} */
  this.el = el;
};
goog.inherits(pn.mob.BaseMobileApp, pn.app.BaseApp);
