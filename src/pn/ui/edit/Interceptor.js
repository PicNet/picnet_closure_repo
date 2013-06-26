;
goog.provide('pn.ui.edit.Interceptor');

goog.require('goog.events.EventHandler');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.ui.edit.Interceptor = function() {
  goog.Disposable.call(this);

  /**
   * @protected
   * @type {pn.ui.edit.CommandsComponent}
   */
  this.component = null;

  /**
   * @protected
   * @type {!Object} The entity being edited.
   */
  this.entity = {};

  /**
   * @protected
   * @type {!Object.<Array>} The cache with all related entities.
   */
  this.cache = {};

  /**
   * @type {!Object.<!(Element|goog.ui.Component|Text)>} The components map for
   *    this UI.
   */
  this.components = {};

  /** @type {!Object.<!Element>} The commands map in the UI. */
  this.commands = {};

  /**
   * @protected
   * @type {!goog.events.EventHandler}
   */
  this.eh = new goog.events.EventHandler(this);
};
goog.inherits(pn.ui.edit.Interceptor, goog.Disposable);


/**
 * Called after an Edit.js is created.  This is only used to initialise
 * the values related to the entity being edited. To attach events, etc
 * override the init method.
 *
 * Note: This method is an internal method and should not be called or
 *    inherited. Currently only called by Edit.js to initialise the spec
 *    to allow documentEntered functionality.
 *
 * @param {!pn.ui.edit.CommandsComponent} component The Edit/MultiEdit
 *    currently being shown.
 * @param {!Object} entity The entity that was just decorated.
 * @param {!Object.<!Array.<!Object>>} cache The cache with all loaded entities.
 * @param {!Object.<Element|goog.ui.Component|Text>} components The components
 *    map for this UI.
 * @param {!Object.<!Element>} commands The command elements.
 */
pn.ui.edit.Interceptor.prototype.init =
    function(component, entity, cache, components, commands) {

  /** @type {!pn.ui.edit.CommandsComponent} */
  this.component = component;

  /** @type {!Object} */
  this.entity = entity;

  /** @type {!Object.<!Array.<!Object>>} */
  this.cache = cache;

  /** @type {!Object.<Element|goog.ui.Component|Text>} */
  this.components = components;

  /** @type {!Object.<!Element>} */
  this.commands = commands;

  if (pn.data.EntityUtils.isNew(this.entity)) {
    this.showCommand('Delete', false);
    this.showCommand('Clone', false);
  }
};


/**
 * Override this method to add events to any fields or do any custom UI
 * processing.  At this stage you will have access to this.entity, this.cache
 * and this.components.
 */
pn.ui.edit.Interceptor.prototype.postInit = function() {};


/**
 * Override this method to do custom validation checking.  These errors are
 *    in addition to the standard field based error checking done by Edit.js.
 * @return {!Array} An array of any errors found in the form in addition to
 *    the standard error checks done by Edit.js.
 */
pn.ui.edit.Interceptor.prototype.getCustomValidationErrors = function() {
  return [];
};


/**
 * @param {string} id The id of the field (and its label) to check
 *    for visibility.
 * @return {boolean} visible Wether the specified field element is currently
 *    visible.
 */
pn.ui.edit.Interceptor.prototype.isShown = function(id) {
  var el = this.getFieldContainer_(this.components[id], id);
  return goog.style.isElementShown(el);
};


/**
 * @protected
 * @param {string} id The id of the field (and its label) to show/hide.
 * @param {boolean} visible Wether to show or hide the element.
 */
pn.ui.edit.Interceptor.prototype.showElement = function(id, visible) {
  goog.asserts.assert(this.components[id],
      'Could not find a component for field: ' + id);

  var el = this.getFieldContainer_(this.components[id], id);
  goog.style.showElement(el, visible);
};


/**
 * @protected
 * @param {string} id The id of the command to hide.
 * @param {boolean} visible Wether to show or hide the command.
 */
pn.ui.edit.Interceptor.prototype.showCommand = function(id, visible) {
  var cmd = this.commands[id];
  // Command is not available, usually the case for commands that are only
  // visible on edit (not add)
  if (!cmd) return;

  var el = this.getFieldContainer_(cmd, id);
  goog.style.showElement(el, visible);
};


/**
 * @private
 * @param {!(Element|goog.ui.Component|Text)} el The element to get the parent
 *    container element for.
 * @param {string} id The id of the element we are looking for.
 * @return {!Element} The parent container of the speicified field id.
 */
pn.ui.edit.Interceptor.prototype.getFieldContainer_ = function(el, id) {
  goog.asserts.assert(el, 'el is null - id: ' + id);

  var element = el.getElement ? el.getElement() : el;
  while (element.id !== id) { element = element.parentNode; }
  return /** @type {!Element} */ (element);
};


/** @inheritDoc */
pn.ui.edit.Interceptor.prototype.disposeInternal = function() {
  pn.ui.edit.Interceptor.superClass_.disposeInternal.call(this);

  this.eh.removeAll();
  goog.dispose(this.eh);

  delete this.eh;
  delete this.entity;
  delete this.cache;
  delete this.component;
  delete this.components;
};
