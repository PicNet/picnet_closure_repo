
goog.provide('pn.ui.MobViewMgr');

goog.require('goog.dom');
goog.require('pn.ui.AbstractViewMgr');



/**
 * @constructor
 * @extends {pn.ui.AbstractViewMgr}
 */
pn.ui.MobViewMgr = function() {
  pn.ui.AbstractViewMgr.call(this);
};
goog.inherits(pn.ui.MobViewMgr, pn.ui.AbstractViewMgr);


/** @override */
pn.ui.MobViewMgr.prototype.showComponent = function(component) {
  pn.assStr(component);
  var id = /** @type {string} */ (component);
  this.clearExistingState();
  this.current = pn.dom.get(id);
  pn.dom.show(this.current, true);
};


/** @override */
pn.ui.MobViewMgr.prototype.clearExistingState = function() {
  if (!this.current) return;
  var el = /** @type {!Element} */ (this.current);
  pn.dom.show(el, false);
};
