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
   * @type {boolean}
   */
  this.inSearchFilter = false;

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
};
goog.inherits(pn.ui.edit.ComplexRenderer, goog.ui.Component);


/**
 * @param {*} val The value to display in this field.
 * @param {Object} entity The entity being displayed.
 * @param {!Object.<Array>} cache The admin cache for entities related to the
 *    current entity.
 * @param {!pn.ui.SpecDisplayItem} spec The field spec.
 * @param {boolean=} opt_search If this field is being created in search mode.
 */
pn.ui.edit.ComplexRenderer.prototype.initialise =
    function(val, entity, cache, spec, opt_search) {
  goog.asserts.assert(cache);
  goog.asserts.assert(spec);

  this.val = val;
  this.entity = entity;
  this.cache = cache;
  this.spec = spec;
  this.inSearchFilter = opt_search === true;
};


/**
 * @return {*} Gets the value in the current editor.
 */
pn.ui.edit.ComplexRenderer.prototype.getValue = goog.abstractMethod;


/**
 * Optional
 * @return {string|Array} Any error (if any) for the specified field.
 */
pn.ui.edit.ComplexRenderer.prototype.validate = function() { return ''; };


/** @inheritDoc */
pn.ui.edit.ComplexRenderer.prototype.createDom =
    function() {
  this.decorateInternal(this.dom_.createElement('div'));
};
