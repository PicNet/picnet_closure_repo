
goog.provide('pn.ui.WebViewMgr');

goog.require('goog.dom');
goog.require('pn.ui.AbstractViewMgr');



/**
 * @constructor
 * @extends {pn.ui.AbstractViewMgr}
 * @param {!Element} parent The main view parent.
 */
pn.ui.WebViewMgr = function(parent) {
  pn.assInst(parent, HTMLElement);

  pn.ui.AbstractViewMgr.call(this);

  /**
   * @private
   * @type {!Element}
   */
  this.parent_ = parent;
};
goog.inherits(pn.ui.WebViewMgr, pn.ui.AbstractViewMgr);


/** @override */
pn.ui.WebViewMgr.prototype.showComponent = function(component) {
  pn.assObj(component);

  this.clearExistingState();
  this.current = component;
  if (this.current.canDecorate &&
      this.current.canDecorate(this.parent_)) {
    this.current.decorate(this.parent_);
  } else if (this.current.render) {
    this.current.render(this.parent_);
  } else {
    goog.dom.appendChild(this.parent_, /** @type {Node} */ (component));
  }
};


/** @override */
pn.ui.WebViewMgr.prototype.clearExistingState = function() {
  this.parent_.innerHTML = '';
  if (!this.current) { return; }
  goog.dispose(this.current);
  this.current = null;

  this.removeAll(); // Remove all view listeners
  goog.dom.removeChildren(this.parent_);
};

