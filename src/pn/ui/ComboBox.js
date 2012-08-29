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
    this.enable_(false);
    this.setValue('');
    this.enable_(true);
    return;
  }

  var len = this.getItemCount();
  for (var i = 0; i < len; i++) {
    var item = this.getItemAt(i);
    if (item.getModel() === value) {
      this.selectedModel_ = value;
      this.enable_(false);
      this.setValue(/** @type {string} */ (item.getCaption()));
      this.enable_(true);
      return;
    }
  }
  throw new Error('Could not find the specified model in the combo box');
};


/** @override */
pn.ui.ComboBox.prototype.enterDocument = function() {
  this.enable_(true);
  pn.ui.ComboBox.superClass_.enterDocument.call(this);
};


/**
 * @private
 * @param {boolean} enabled Wether to listen (or unlisten) to the change
 *    vents. For internal state setting all events should be ignored to fix
 *    duplicate text handling.
 */
pn.ui.ComboBox.prototype.enable_ = function(enabled) {
  var et = goog.events.EventType.CHANGE;
  if (enabled) this.getHandler().listen(this, et, this.onChanged_);
  else this.getHandler().unlisten(this, et, this.onChanged_);
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


/** @inheritDoc */
pn.ui.ComboBox.prototype.disposeInternal = function() {
  pn.ui.ComboBox.superClass_.disposeInternal.call(this);

  delete this.selectedModel_;
};
