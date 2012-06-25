;
goog.provide('pn.ui.edit.ComplexRenderer');

goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!pn.ui.edit.FieldCtx} fctx The field context object.
 * @param {!Object} entity The entity being edited.
 */
pn.ui.edit.ComplexRenderer = function(fctx, entity) {
  goog.asserts.assert(fctx);
  goog.asserts.assert(entity);

  goog.ui.Component.call(this);

  /**
   * @protected
   * @type {!pn.ui.edit.FieldCtx}
   */
  this.fctx = fctx;

  /**
   * @protected
   * @type {!Object}
   */
  this.entity = entity;

  /** @type {boolean} */
  this.showLabel = true;
};
goog.inherits(pn.ui.edit.ComplexRenderer, goog.ui.Component);


/**
 * @param {Object=} opt_target The optional 'entity' target to inject values
 *    into if required.
 * @return {*} Gets the value in the current editor.
 */
pn.ui.edit.ComplexRenderer.prototype.getValue = goog.abstractMethod;


/**
 * Optional
 * @return {string|Array.<string>} Any error (if any) for the specified field.
 */
pn.ui.edit.ComplexRenderer.prototype.validate = function() { return ''; };


/** @inheritDoc */
pn.ui.edit.ComplexRenderer.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.edit.ComplexRenderer.prototype.disposeInternal = function() {
  pn.ui.edit.ComplexRenderer.superClass_.disposeInternal.call(this);

  delete this.fctx;
};
