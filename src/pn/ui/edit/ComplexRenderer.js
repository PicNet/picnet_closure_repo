;
goog.provide('pn.ui.edit.ComplexRenderer');

goog.require('goog.ui.Component');
goog.require('pn.ui.edit.FieldCtx');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
pn.ui.edit.ComplexRenderer = function() {
  goog.ui.Component.call(this);

  /**
   * The field context.  This is set in UiSpec createField method.
   *
   * @type {pn.ui.edit.FieldCtx}
   */
  this.fctx = null;

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
 * @param {boolean} required Wether this control is required.
 * @return {string|Array.<string>} Any error (if any) for the specified field.
 */
pn.ui.edit.ComplexRenderer.prototype.validate = function(required) {
  return '';
};


/**
 * Optional
 * @param {boolean} enabled Wether this control is enabled.
 */
pn.ui.edit.ComplexRenderer.prototype.setEnabled = function(enabled) {};


/** @override */
pn.ui.edit.ComplexRenderer.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};
