goog.provide('pn.ctl.BaseDialog');

goog.require('pn.ctl.BaseController');
goog.require('pn.infra.MD5');



/**
 * @constructor
 * @extends {pn.ctl.BaseController}
 * @param {!Element} el The element (view) for this controller.
 */
pn.ctl.BaseDialog = function(el) {
  pn.ctl.BaseController.call(this, el);

  /** @protected @type {!goog.debug.Logger} */
  this.log = pn.log.getLogger('pn.ctl.BaseDialog[' + el.id + ']');

  /** @private @type {!function(Object):undefined} */
  this.onsubmit_ = null;

  /** @private @type {!function():undefined} */
  this.onhide_ = null;
};
goog.inherits(pn.ctl.BaseDialog, pn.ctl.BaseController);


/** @param {function(Object):undefined} cb The callback on submit. */
pn.ctl.BaseDialog.prototype.onsubmit = function(cb) {
  pn.assFun(cb);
  this.onsubmit_ = cb;
};


/** @param {function():undefined} cb The callback on hide. */
pn.ctl.BaseDialog.prototype.onhide = function(cb) {
  pn.assFun(cb);
  this.onhide_ = cb;
};


/** @override */
pn.ctl.BaseDialog.prototype.shown = function() {
  if (this.hasel('submit')) this.ontap('submit', this.submit_);
  if (this.hasel('cancel')) this.ontap('cancel', this.cancel_);
};


/** @protected Hides this dialog. */
pn.ctl.BaseDialog.prototype.hide = function() {
  this.hideDialog_();
};


/** @private */
pn.ctl.BaseDialog.prototype.submit_ = function() {
  pn.assFun(this.onsubmit_);
  var value = this.value(),
      cb = this.onsubmit_;

  // Disposes the CB and possible controls responsible for this.value
  this.hideDialog_();

  cb(value);
};


/** @protected @return {Object} The object 'value' to return to the caller. */
pn.ctl.BaseDialog.prototype.value = goog.abstractMethod;


/** @private */
pn.ctl.BaseDialog.prototype.cancel_ = function() {
  this.log.finest('cancel');
  this.hideDialog_();
};


/** @private */
pn.ctl.BaseDialog.prototype.hideDialog_ = function() {
  if (!this.hiding()) return;
  this.onsubmit_ = null;

  this.show(this.el, false);
  this.hid();
  this.log.fine('hid dialog');
  if (this.onhide_) {
    this.onhide_();
    this.onhide_ = null;
  }
  goog.dispose(this);
};
