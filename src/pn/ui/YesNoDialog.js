
goog.provide('pn.ui.YesNoDialog');

goog.require('goog.ui.Dialog');
goog.require('goog.ui.Dialog.ButtonSet');
goog.require('goog.ui.Dialog.EventType');
goog.require('pn.ui.Dialog');



/**
 * @constructor
 * @param {!string} title The title of this dialog.
 * @param {!string} content The content of this dialog.
 */
pn.ui.YesNoDialog = function(title, content) {

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
};


/**
 * @param {function(boolean):undefined} callback The callback.
 */
pn.ui.YesNoDialog.prototype.show = function(callback) {
  goog.asserts.assert(callback);

  var dialog = new pn.ui.Dialog();
  dialog.setContent(this.content_);
  dialog.setTitle(this.title_);
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createYesNoCancel());

  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, function(e) {
    dialog.dispose();
    if (e.key === 'cancel') { return; }
    callback(e.key === 'yes');
  }, false, this);

  dialog.setVisible(true);
};
