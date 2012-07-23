
goog.provide('pn.ui.ComboBox');
goog.provide('pn.ui.ComboBox.EventType');

goog.require('goog.ui.ComboBox');
goog.require('goog.events.Event');



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

  /**
   * @private
   * @type {boolean}
   */
  this.ignoreChange_ = false;
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
      this.ignoreChange_ = true;
      this.setValue(/** @type {string} */ (item.getCaption()));
      this.ignoreChange_ = false;
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

  handler.listen(this.getMenu(), 
      goog.ui.Component.EventType.ACTION, this.fireChangeEvent_);
};


/** @private */
pn.ui.ComboBox.prototype.onChanged_ = function() {  
  if (this.ignoreChange_) return;  

  var idx = this.getMenu().getHighlightedIndex();
  if (idx < 0) {     
    this.selectedModel_ = null; 
    this.fireChangeEvent_();
  } else {
    var cbi = this.getMenu().getChildAt(idx);
    this.selectedModel_ = cbi.getModel();
  }    
};

/** @private */
pn.ui.ComboBox.prototype.fireChangeEvent_ = function() {
  var event = new goog.events.Event(pn.ui.ComboBox.EventType.CHANGE, this);
  this.dispatchEvent(event);
};

/** @inheritDoc */
pn.ui.ComboBox.prototype.disposeInternal = function() {
  pn.ui.ComboBox.superClass_.disposeInternal.call(this);

  delete this.selectedModel_;
};

/** @enum {string} */
pn.ui.ComboBox.EventType = {
  CHANGE: 'cb-chage'
};