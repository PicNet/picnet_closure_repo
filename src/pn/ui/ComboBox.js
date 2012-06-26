;
goog.provide('pn.ui.ComboBox');

goog.require('goog.ui.ComboBox');



/**
 * @constructor
 * @extends {goog.ui.ComboBox}
 */
pn.ui.ComboBox = function() {
  goog.ui.ComboBox.call(this);

  /**
   * @private
   * @type {*}
   */
  this.selectedModel_ = null;
};
goog.inherits(pn.ui.ComboBox, goog.ui.ComboBox);


/** @return {*} The current selected model (if any, null if not). */
pn.ui.ComboBox.prototype.getSelectedModel = function() {
  return this.selectedModel_;
};


/** @param {*} value The model value to select. */
pn.ui.ComboBox.prototype.setSelectedModel = function(value) {
  if (!goog.isDefAndNotNull(value)) {
    this.selectedModel_ = null;
    this.setValue('');
    return;
  }

  var len = this.getItemCount();
  for (var i = 0; i < len; i++) {
    var item = this.getItemAt(i);
    if (item.getModel() === value) {
      this.selectedModel_ = value;
      this.setValue(/** @type {string} */ (item.getCaption()));
      return;
    }
  }
  throw new Error('Could not find the specified model in the combo box');
};


/** @override */
pn.ui.ComboBox.prototype.enterDocument = function() {
  var handler = this.getHandler();
  handler.listen(this, goog.events.EventType.CHANGE, this.onChanged_);
  pn.ui.ComboBox.superClass_.enterDocument.call(this);
};


/** @private */
pn.ui.ComboBox.prototype.onChanged_ = function() {
  var idx = this.getMenu().getHighlightedIndex();
  if (idx < 0) { this.selectedModel_ = null; }
  else {
    var cbi = this.getMenu().getChildAt(idx);
    this.selectedModel_ = cbi.getModel();
  }
};
