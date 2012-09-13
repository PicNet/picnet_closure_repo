;
goog.provide('pn.ui.edit.Interceptor');

goog.require('goog.events.EventHandler');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.ui.edit.CommandsComponent} component The Edit/MultiEdit
 *    currently being shown.
 * @param {!pn.data.Entity} entity The entity that was just decorated.
 * @param {!pn.data.BaseDalCache} cache The cache with all loaded entities.
 * @param {!Object.<Element|goog.ui.Component>} controls The controls map
 *    for this UI.
 * @param {!Object.<goog.ui.Button>} commands The command elements.
 */
pn.ui.edit.Interceptor =
    function(component, entity, cache, controls, commands) {
  goog.Disposable.call(this);

  /**
   * @protected
   * @type {pn.ui.edit.CommandsComponent}
   */
  this.component = component;

  /**
   * @protected
   * @type {!pn.data.Entity} The entity being edited.
   */
  this.entity = entity;

  /**
   * @protected
   * @type {!pn.data.BaseDalCache} The cache with all related entities.
   */
  this.cache = cache;

  /**
   * @private
   * @type {!Object.<!(Element|goog.ui.Component)>} The controls map
   *  for this UI.  The first item is the control for the field.  The second is
   *  the parent.
   */
  this.controls_ = controls;

  /**
   * @private
   * @type {!Object.<!goog.ui.Button>} The commands map in the UI.
   */
  this.commands_ = commands;

  /**
   * @protected
   * @type {!goog.events.EventHandler}
   */
  this.eh = new goog.events.EventHandler(this);
  this.registerDisposable(this.eh);
};
goog.inherits(pn.ui.edit.Interceptor, goog.Disposable);


/**
 * Override this method to do custom validation checking.  These errors are
 *    in addition to the standard field based error checking done by Edit.js.
 * @return {!Array} An array of any errors found in the form in addition to
 *    the standard error checks done by Edit.js.
 */
pn.ui.edit.Interceptor.prototype.getCustomValidationErrors =
    function() { return []; };


/**
 * @param {string} id The id of the control we need.
 * @return {!(Element|goog.ui.Component)} The control for the specified id.
 */
pn.ui.edit.Interceptor.prototype.getControl = function(id) {
  goog.asserts.assert(this.controls_[id]);
  return this.controls_[id];
};
