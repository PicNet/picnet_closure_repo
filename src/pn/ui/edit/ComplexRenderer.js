;
goog.provide('pn.ui.edit.ComplexRenderer');

goog.require('goog.events.EventHandler');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
pn.ui.edit.ComplexRenderer = function() {
  goog.ui.Component.call(this);

  /**
   * @protected
   * @type {*}
   */
  this.val = null;

  /**
   * @protected
   * @type {Object}
   */
  this.entity = null;

  /**
   * @protected
   * @type {!Object.<!Array>}
   */
  this.cache = {};

  /**
   * @protected
   * @type {!pn.ui.SpecDisplayItem}
   */
  this.spec;

  /**
   * @type {boolean}
   */
  this.showLabel = true;

  /**
   * @protected
   * @type {goog.events.EventHandler}
   */
  this.eh = null;
};
goog.inherits(pn.ui.edit.ComplexRenderer, goog.ui.Component);


/**
 * @param {*} val The value to display in this field.
 * @param {Object} entity The entity being displayed.
 * @param {!Object.<Array>} cache The admin cache for entities related to the
 *    current entity.
 * @param {!pn.ui.SpecDisplayItem} spec The field spec.
 */
pn.ui.edit.ComplexRenderer.prototype.initialise =
    function(val, entity, cache, spec) {
  goog.asserts.assert(cache);
  goog.asserts.assert(spec);

  this.eh = new goog.events.EventHandler(this);
  this.val = val;
  this.entity = entity;
  this.cache = cache;
  this.spec = spec;
};


/**
 * @param {Object=} opt_target The entity to push values onto if specified.
 * @return {*} Gets the value in the current editor.
 */
pn.ui.edit.ComplexRenderer.prototype.getValue = goog.abstractMethod;


/**
 * Optional
 * @param {pn.ui.edit.Field} field The Field to validate.
 * @param {*} value The value of the field in the current form.
 * @return {string|Array} Any error (if any) for the specified field.
 */
pn.ui.edit.ComplexRenderer.prototype.validate = function(field, value) {
  return '';
};


/** @override */
pn.ui.edit.ComplexRenderer.prototype.createDom =
    function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.edit.ComplexRenderer.prototype.disposeInternal = function() {
  pn.ui.edit.ComplexRenderer.superClass_.disposeInternal.call(this);

  goog.dispose(this.eh);
  delete this.val;
  delete this.entity;
  delete this.cache;
  delete this.spec;
};
