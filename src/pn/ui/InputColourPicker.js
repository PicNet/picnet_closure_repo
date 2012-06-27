
goog.provide('pn.ui.InputColourPicker');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('goog.ui.PopupColorPicker');



/**
 * @extends {goog.ui.Component}
 * @constructor
 */
pn.ui.InputColourPicker = function() {
  goog.ui.Component.call(this);

  /**
   * @private
   * @type {Element}
   */
  this.input_ = goog.dom.createDom('input', {
    'type': 'text',
    'class': 'input-colour-picker-input'
  });
  this.input_.setAttribute('readonly', 'readonly');

  /**
   * @private
   * @type {string}
   */
  this.col_ = '';

  /**
   * @private
   * @type {goog.ui.PopupColorPicker}
   */
  this.pcp_ = new goog.ui.PopupColorPicker();
  this.registerDisposable(this.pcp_);
};
goog.inherits(pn.ui.InputColourPicker, goog.ui.Component);


/** @param {string} colour The colour to set on the control. */
pn.ui.InputColourPicker.prototype.setColour = function(colour) {
  goog.style.setStyle(this.input_, 'background-color', this.col_ = colour);
};


/**
* Returns the selected date, if any.  Compares the dates from the date picker
* and the input field, causing them to be synced if different.
* @return {?string} The selected colour.
*/
pn.ui.InputColourPicker.prototype.getValue = function() {
  return this.col_;
};


/** @return {Element} The label input control. */
pn.ui.InputColourPicker.prototype.getInput = function() {
  return this.input_;
};


/** @inheritDoc */
pn.ui.InputColourPicker.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  var parent = goog.dom.createDom('div', 'input-colour-picker');
  this.pcp_.render();
  this.pcp_.attach(this.input_);
  goog.dom.appendChild(parent, this.input_);
  goog.dom.appendChild(element, parent);
};


/** @inheritDoc */
pn.ui.InputColourPicker.prototype.enterDocument = function() {
  pn.ui.InputColourPicker.superClass_.enterDocument.call(this);
  var changeEvent = goog.events.EventType.CHANGE;
  this.getHandler().listen(this.pcp_, changeEvent, function(e) {
    this.setColour(this.pcp_.getSelectedColor());
    this.dispatchEvent(e);
  });
};
