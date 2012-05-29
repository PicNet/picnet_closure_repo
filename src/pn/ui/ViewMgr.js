
goog.provide('pn.ui.ViewMgr');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('pn.ui.edit.Edit');
goog.require('pn.ui.grid.Grid');



/**
 * @constructor
 * @extends {goog.events.EventHandler}
 * @param {!Element} parent The main view parent.
 */
pn.ui.ViewMgr = function(parent) {
  goog.asserts.assert(parent);

  goog.events.EventHandler.call(this, this);

  /**
   * @private
   * @type {!Element}
   */
  this.parent_ = parent;

  /**
   * @private
   * @type {goog.ui.Component}
   */
  this.currentView_ = null;
};
goog.inherits(pn.ui.ViewMgr, goog.events.EventHandler);


/** @param {goog.ui.Component} component The component to display. */
pn.ui.ViewMgr.prototype.showComponent = function(component) {
  goog.asserts.assert(component);

  this.clearExistingState_();
  this.currentView_ = component;
  this.currentView_.decorate(this.parent_);
};


/**
 * @param {!pn.ui.UiSpec} spec The specs of the object being
 *    edited.
 * @param {!Object} entity The entity to display/edit.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 */
pn.ui.ViewMgr.prototype.showEdit = function(spec, entity, cache) {
  goog.asserts.assert(spec && spec.type);
  goog.asserts.assert(cache);
  goog.asserts.assert(entity);

  var edit = new pn.ui.edit.Edit(spec, entity, cache);
  this.showComponent(edit);
};


/**
 * @return {boolean} Whether the screen is dirty.
 */
pn.ui.ViewMgr.prototype.isDirty = function() {
  return this.currentView_ && this.currentView_.isDirty &&
      this.currentView_.isDirty();
};


/**
 * Resets the dirty state of the current view
 */
pn.ui.ViewMgr.prototype.resetDirty = function() {
  if (this.currentView_ && this.currentView_.resetDirty) {
    this.currentView_.resetDirty();
  }
};


/** @private */
pn.ui.ViewMgr.prototype.clearExistingState_ = function() {
  this.parent_.innerHTML = '';
  if (!this.currentView_) { return; }
  goog.dispose(this.currentView_);
  delete this.currentView_;

  this.removeAll(); // Remove all view listeners
  goog.dom.removeChildren(this.parent_);
};


/** @inheritDoc */
pn.ui.ViewMgr.prototype.disposeInternal = function() {
  pn.ui.ViewMgr.superClass_.disposeInternal.call(this);

  goog.dispose(this.parent_);
  goog.dispose(this.currentView_);

  delete this.parent_;
  delete this.currentView_;
};
