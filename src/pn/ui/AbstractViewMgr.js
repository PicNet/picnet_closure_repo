
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
   * @type {goog.ui.Component|Node|string}
   */
  this.current = null;
};
goog.inherits(pn.ui.AbstractViewMgr, goog.events.EventHandler);


/**
 * @param {!pn.ui.UiSpec} spec The specs of the object being
 *    edited.
 * @param {!pn.data.Entity} entity The entity to display/edit.
 * @param {!pn.data.BaseDalCache} cache The data cache to use for related
 *    entities.
 */
pn.ui.AbstractViewMgr.prototype.showEdit = function(spec, entity, cache) {
  pn.ass(spec && spec.type);
  pn.ass(cache);
  pn.ass(entity);

  var edit = new pn.ui.edit.Edit(spec, entity, cache, pn.web.ctx.keys);
  this.showComponent(edit);
};


/** @return {goog.ui.Component|Node|string} The currently displayed view. */
pn.ui.AbstractViewMgr.prototype.currentView = function() {
  return this.current;
};


/** @return {boolean} Whether the screen is dirty. */
pn.ui.AbstractViewMgr.prototype.isDirty = function() {
  return this.current && this.current.isDirty &&
      this.current.isDirty();
};


/** Resets the dirty state of the current view */
pn.ui.AbstractViewMgr.prototype.resetDirty = function() {
  if (this.current && this.current.resetDirty) {
    this.current.resetDirty();
  }
};


/** @private */
pn.ui.AbstractViewMgr.prototype.clearExistingState_ = function() {
  this.parent_.innerHTML = '';
  if (!this.current) { return; }
  goog.dispose(this.current);
  this.current = null;

  this.removeAll(); // Remove all view listeners
  goog.dom.removeChildren(this.parent_);
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
