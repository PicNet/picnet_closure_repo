;
goog.provide('pn.ui.edit.DecimalRenderer');



/**
 * @constructor
 * @extends {pn.ui.edit.ComplexRenderer}
 */
pn.ui.edit.DecimalRenderer = function() {
  pn.ui.edit.ComplexRenderer.call(this);
  /**
   * @private
   * @type {Element}
   */
  this.input_ = null;
};
goog.inherits(pn.ui.edit.DecimalRenderer, pn.ui.edit.ComplexRenderer);


/** @inheritDoc */
pn.ui.edit.DecimalRenderer.prototype.getValue = function() {
  return this.input_.value ? parseFloat(this.input_.value) : 0;
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
  this.input_ =
      goog.dom.createDom('input', {'type': 'number', 'value': this.val || 0});
  goog.dom.appendChild(element, this.input_);
};


/** @inheritDoc */
pn.ui.edit.DecimalRenderer.prototype.disposeInternal =
    function() {
  pn.ui.edit.DecimalRenderer.superClass_.disposeInternal.call(this);
  goog.dispose(this.input_);
};
