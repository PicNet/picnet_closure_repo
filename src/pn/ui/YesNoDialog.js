
goog.provide('pn.ui.YesNoDialog');

goog.require('goog.ui.Dialog');
goog.require('goog.ui.Dialog.ButtonSet');
goog.require('goog.ui.Dialog.EventType');



/**
 * @constructor
 * @param {!string} title The title of this dialog.
 * @param {!string} content The content of this dialog.
 * @param {Array.<string>=} opt_buttonTexts The optional button texts.
 */
pn.ui.YesNoDialog = function(title, content, opt_buttonTexts) {

  /**
   * @private
   * @type {!string}
   */
  this.title_ = title;

  /**
   * @private
   * @type {!string}
   */
  this.content_ = content;

  /**
   * @private
   * @type {Array.<string>}
   */
  this.buttonTexts_ = opt_buttonTexts || null;
};


/**
 * @param {function(boolean):undefined} callback The callback.
 */
pn.ui.YesNoDialog.prototype.show = function(callback) {
  goog.asserts.assert(callback);

  var dialog = new goog.ui.Dialog();
  dialog.setContent(this.content_);
  dialog.setTitle(this.title_);
  dialog.setModal(true);
  var bs = goog.ui.Dialog.ButtonSet.createYesNoCancel();
  dialog.setButtonSet(bs);  

  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, function(e) {
    dialog.dispose();
    if (e.key === 'cancel') { return; }
    callback(e.key === 'yes');
  }, false, this);

  dialog.setVisible(true);

  if (this.buttonTexts_) {
    bs.getButton('yes').innerText = this.buttonTexts_[0];
    bs.getButton('no').innerText = this.buttonTexts_[1];
  } 
};
