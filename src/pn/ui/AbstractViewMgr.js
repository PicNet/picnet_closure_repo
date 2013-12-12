
goog.provide('pn.ui.AbstractViewMgr');

goog.require('goog.events.EventHandler');



/**
 * @constructor
 * @extends {goog.events.EventHandler}
 */
pn.ui.AbstractViewMgr = function() {
  goog.events.EventHandler.call(this, this);

  /**
   * @protected
   * @type {goog.ui.Component|Node}
   */
  this.current = null;
};
goog.inherits(pn.ui.AbstractViewMgr, goog.events.EventHandler);


/** @return {goog.ui.Component|Node} The currently displayed view. */
pn.ui.AbstractViewMgr.prototype.currentView = function() {
  return this.current;
};


/** @override */
pn.ui.AbstractViewMgr.prototype.disposeInternal = function() {
  pn.ui.AbstractViewMgr.superClass_.disposeInternal.call(this);

  this.clearExistingState();
};


/**
 * @param {goog.ui.Component|Node|string} component The component to display.
 *    Some view managers like Mobile view managers can display by ID and hence
 *    component can also be a string.
 */
pn.ui.AbstractViewMgr.prototype.showComponent = goog.abstractMethod;


/** Clears the existing view */
pn.ui.AbstractViewMgr.prototype.clearExistingState = goog.abstractMethod;
