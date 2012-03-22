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
   * @type {!Object} The entity being edited.  This is set in the
   *  initEdit method and unset in the dispose method.
   */
  this.entity = {};

  /**
   * @protected
   * @type {!Object.<Array>} The cache with all related entities.  This is
   *    set in the  initEdit method and unset in the dispose method.
   */
  this.cache = {};

  /**
   * @type {!Object.<Element|goog.ui.Component>} The fields map in the UI.
   *    This is set in the  initEdit method and unset in the dispose method.
   */
  this.fields = {};

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
 * @param {!Object} entity The entity that was just decorated.
 * @param {!Object.<Array>} cache The cache with all related entities.
 * @param {!Object.<Element|goog.ui.Component>} fields The fields map in the UI.
 */
pn.ui.edit.Interceptor.prototype.initInternal =
    function(entity, cache, fields) {
  this.entity = entity;
  this.cache = cache;
  this.fields = fields;

  if (!this.entity['ID']) {
    this.showCommand('Delete', false);
    this.showCommand('Clone', false);
  }
};


/**
 * Override this method to add events to any fields or do any custom UI
 * processing.  At this stage you will have access to this.entity, this.cache
 * and this.fields.
 */
pn.ui.edit.Interceptor.prototype.init = function() {};


/**
 * @protected
 * @param {string} id The id of the field (and its label) to check
 *    for visibility.
 * @return {boolean} visible Wether the specified field element is currently
 *    visible.
 */
pn.ui.edit.Interceptor.prototype.isShown = function(id) {
  return goog.style.isElementShown(this.getFieldContainer_(id));
};


/**
 * @protected
 * @param {string} id The id of the field (and its label) to show/hide.
 * @param {boolean} visible Wether to show or hide the element.
 */
pn.ui.edit.Interceptor.prototype.showElement = function(id, visible) {
  goog.style.showElement(this.getFieldContainer_(id), visible);
};


/**
 * @protected
 * @param {string} id The id of the command to hide.
 * @param {boolean} visible Wether to show or hide the command.
 */
pn.ui.edit.Interceptor.prototype.showCommand = function(id, visible) {
  var commandsContainer = goog.dom.getElementByClass('commands-container');
  var el = goog.dom.getElementByClass(id.toLowerCase(), commandsContainer);
  goog.style.showElement(el, visible);
};


/**
 * @private
 * @param {string} id The id of the element to get the container for.
 * @return {!Element} The parent container of the speicified field id.
 */
pn.ui.edit.Interceptor.prototype.getFieldContainer_ = function(id) {
  goog.asserts.assert(this.fields);
  goog.asserts.assert(this.fields[id]);

  var el = this.fields[id];
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
  delete this.fields;
};
