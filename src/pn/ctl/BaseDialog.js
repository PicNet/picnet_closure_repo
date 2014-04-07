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

  /** @private @type {function(*):undefined} */
  this.onsubmit_;

  /** @private @type {function():undefined} */
  this.onhide_;
};
goog.inherits(pn.ctl.BaseDialog, pn.ctl.BaseController);


/** @param {function(*):undefined} cb The callback on submit. */
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
  if (this.hasel('submit')) this.ontap('submit', this.submit);
  if (this.hasel('cancel')) this.ontap('cancel', this.cancel);
};


/** @protected Hides this dialog. */
pn.ctl.BaseDialog.prototype.hide = function() {
  this.hideDialog_();
};


/** @protected */
pn.ctl.BaseDialog.prototype.submit = function() {
  pn.ass(!this.onsubmit_ || goog.isFunction(this.onsubmit_));

  if (!this.validate()) return;

  var value = this.value(),
      cb = this.onsubmit_;

  // Disposes the CB and possible controls responsible for this.value
  this.hideDialog_();

  if (cb) cb(value);
};


/**
 * @protected
 * @return {boolean} Wether the dialog fields are valid inputs.
 * If your dialog needs validation override this method.
 */
pn.ctl.BaseDialog.prototype.validate = function() { return true; };


/** @protected @return {*} The object 'value' to return to the caller. */
pn.ctl.BaseDialog.prototype.value = goog.abstractMethod;


/** @protected */
pn.ctl.BaseDialog.prototype.cancel = function() {
  this.log.finest('cancel');
  this.hideDialog_();
};


/** @param {string} html The html to set as the header. */
pn.ctl.BaseDialog.prototype.header = function(html) {
  pn.assStr(html);

  pn.dom.byClass('dialog-header').innerHTML = html;
};


/** @private */
pn.ctl.BaseDialog.prototype.hideDialog_ = function() {
  if (!this.hiding()) return;
  delete this.onsubmit_;

  this.show(this.el, false);
  this.hid();
  this.log.fine('hid dialog');
  if (this.onhide_) {
    this.onhide_();
    delete this.onhide_;
  }
  goog.dispose(this);
};
