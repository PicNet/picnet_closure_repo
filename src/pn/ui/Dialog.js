;
goog.provide('pn.ui.Dialog');



/**
 * A modal dialog that is more aware of the pn.app context than a generic
 *    dialog.
 * @constructor
 * @extends {goog.ui.Dialog}
 */
pn.ui.Dialog = function() {
  goog.ui.Dialog.call(this);

  this.setModal(true);
};
goog.inherits(pn.ui.Dialog, goog.ui.Dialog);


/** @override */
pn.ui.Dialog.prototype.enterDocument = function() {
  pn.ui.Dialog.superClass_.enterDocument.call(this);

  var et = goog.ui.PopupBase.EventType;
  this.getHandler().listen(this, [et.SHOW, et.HIDE], this.onShowHide_);
};


/**
 * This method disables all application keyboard shortcuts while this
 *    dialog is visible.
 * @private
 * @param {!goog.events.Event} e The show/hide event.
 */
pn.ui.Dialog.prototype.onShowHide_ = function(e) {
  var showing = e.type === goog.ui.PopupBase.EventType.SHOW;
  pn.app.ctx.keys.setAllEnabled(!showing);
};
