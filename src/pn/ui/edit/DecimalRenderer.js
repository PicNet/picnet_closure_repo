;
goog.provide('pn.ui.edit.DecimalRenderer');

goog.require('goog.math');
goog.require('goog.i18n.NumberFormat');


/**
 * A decimal number renderer that is backed by a large integer.  All values
 * are multiplied by a constant (decimalMulitplier_) and any decimals
 * discarded.  This integer is then the base of decimal calculations.  Note:
 * getValue returns the integer value and this renderer expects this to be the
 * value when the renderer is created also.  So only for UI purposes is the 
 * decimal value ever shown.
 * 
 * @constructor
 * @extends {pn.ui.edit.ComplexRenderer}
 */
pn.ui.edit.DecimalRenderer = function() {
  pn.ui.edit.ComplexRenderer.call(this);

  /**
   * @private
   * @const
   * @type {number}
   */
  this.decimalMulitplier_ = 100000;

  /**
   * @private
   * @type {Element}
   */
  this.input_ = null;  

  /**
   * @private
   * @type {goog.i18n.NumberFormat}
   */
  this.formatter_ = new goog.i18n.NumberFormat('#,##0.0#;');
};
goog.inherits(pn.ui.edit.DecimalRenderer, pn.ui.edit.ComplexRenderer);

/**
 * @param {number} intv An integer value that represents a decimal multiplied 
 *    by the decimalMulitplier_ and had its decimal portion discarded.
 * @return {string} A formatted string representation of this value.
 */
pn.ui.edit.DecimalRenderer.getDisplayValue = function(intv) {
  goog.asserts.assert(goog.math.isInt(intv));

  return this.formatter_.format(this.formatter_.intv / this.decimalMulitplier_);
};

/**
 * @param {string} stringv A formatted string representation of a decimal value.
 * @return {number} intv An integer value that represents a decimal multiplied 
 *    by the decimalMulitplier_ and had its decimal portion discarded. 
 */
pn.ui.edit.DecimalRenderer.parseIntValue = function(stringv) {
  if (!stringv) return 0;
  goog.asserts.assert(goog.isString(stringv));
  var parsed = parseFloat(this.input_.value);
  goog.asserts.assert(goog.isNumber(parsed));

  var intv = Math.floor(parsed * this.decimalMulitplier_);
  return intv;
};

/** @inheritDoc */
pn.ui.edit.DecimalRenderer.prototype.getValue = function() {
  return pn.ui.edit.DecimalRenderer.parseIntValue(this.input_.value);
};


/** @inheritDoc */
pn.ui.edit.DecimalRenderer.prototype.validate =
    function() {
  if (!this.input_.value) return '';
  var flVal = parseFloat(this.input_.value);
  if (flVal.toString() !== this.input_.value) {
    return 'Appears to be an invalid number.';
  }
  return '';
};


/** @inheritDoc */
pn.ui.edit.DecimalRenderer.prototype.decorateInternal =
    function(element) {
  this.setElementInternal(element);
  var val = pn.ui.edit.DecimalRenderer.getDisplayValue(this.val);
  this.input_ = goog.dom.createDom('input', {'type': 'number', 'value': val});
  goog.dom.appendChild(element, this.input_);
};


/** @inheritDoc */
pn.ui.edit.DecimalRenderer.prototype.disposeInternal =
    function() {
  pn.ui.edit.DecimalRenderer.superClass_.disposeInternal.call(this);
  goog.dispose(this.input_);

  delete this.input_;
};
