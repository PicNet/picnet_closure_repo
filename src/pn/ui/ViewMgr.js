
// goog.provide('pn.ui.ViewMgr');

// goog.require('goog.array');
// goog.require('goog.dom');
// goog.require('goog.events.EventHandler');
// goog.require('goog.events.EventType');
// goog.require('pn.ui.UiSpec');
// goog.require('pn.ui.edit.Edit');
// goog.require('pn.ui.grid.Grid');



// /**
//  * @constructor
//  * @extends {goog.events.EventHandler}
//  * @param {!Element} parent The main view parent.
//  */
// pn.ui.ViewMgr = function(parent) {
//   pn.ass(parent);

//   goog.events.EventHandler.call(this, this);

//   /**
//    * @private
//    * @type {!Element}
//    */
//   this.parent_ = parent;

//   /**
//    * @private
//    * @type {goog.ui.Component|Node}
//    */
//   this.currentView_ = null;
// };
// goog.inherits(pn.ui.ViewMgr, goog.events.EventHandler);


// /** @param {goog.ui.Component|Node} component The component to display. */
// pn.ui.ViewMgr.prototype.showComponent = function(component) {
//   pn.ass(component);
//   pn.ass(this.parent_);

//   this.clearExistingState_();
//   this.currentView_ = component;
//   if (this.currentView_.canDecorate &&
//       this.currentView_.canDecorate(this.parent_)) {
//     this.currentView_.decorate(this.parent_);
//   } else if (this.currentView_.render) {
//     this.currentView_.render(this.parent_);
//   } else {
//     goog.dom.appendChild(this.parent_, /** @type {Node} */ (component));
//   }
// };


// *
//  * @param {!pn.ui.UiSpec} spec The specs of the object being
//  *    edited.
//  * @param {!pn.data.Entity} entity The entity to display/edit.
//  * @param {!pn.data.BaseDalCache} cache The data cache to use for related
//  *    entities.

// pn.ui.ViewMgr.prototype.showEdit = function(spec, entity, cache) {
//   pn.ass(spec && spec.type);
//   pn.ass(cache);
//   pn.ass(entity);

//   var edit = new pn.ui.edit.Edit(spec, entity, cache, pn.web.ctx.keys);
//   this.showComponent(edit);
// };


// /** @return {goog.ui.Component|Node} The currently displayed view. */
// pn.ui.ViewMgr.prototype.currentView = function() {
//   return this.currentView_;
// };


// /** @return {boolean} Whether the screen is dirty. */
// pn.ui.ViewMgr.prototype.isDirty = function() {
//   return this.currentView_ && this.currentView_.isDirty &&
//       this.currentView_.isDirty();
// };


// /** Resets the dirty state of the current view */
// pn.ui.ViewMgr.prototype.resetDirty = function() {
//   if (this.currentView_ && this.currentView_.resetDirty) {
//     this.currentView_.resetDirty();
//   }
// };


// /** @private */
// pn.ui.ViewMgr.prototype.clearExistingState_ = function() {
//   this.parent_.innerHTML = '';
//   if (!this.currentView_) { return; }
//   goog.dispose(this.currentView_);
//   this.currentView_ = null;

//   this.removeAll(); // Remove all view listeners
//   goog.dom.removeChildren(this.parent_);
// };


// /** @override */
// pn.ui.ViewMgr.prototype.disposeInternal = function() {
//   pn.ui.ViewMgr.superClass_.disposeInternal.call(this);

//   goog.dispose(this.currentView_);
// };
