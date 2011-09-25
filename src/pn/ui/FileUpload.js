;
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.net.IframeIo');

goog.provide('pn.ui.FileUpload');



/**
 * @constructor
 * @extends {goog.Disposable}
 *
 * @param {string} id The id to use for the file input control.
 * @param {string} serverAction The server action name.
 * @param {!Element} parent The parent element to attache the input control to.
 * @param {function(string, !goog.net.IframeIo):undefined} complete The
 *    complete callback.
 * @param {function():Object.<string, string>=} opt_getData The optional data
 *    provider.
 * @param {function(string):boolean=} opt_validateData The optional data
 *    validator.
 * @param {Object=} opt_handler The optional handler for callbacks.
 */
pn.ui.FileUpload = function(id, serverAction, parent, complete, 
    opt_getData, opt_validateData, opt_handler) {
  goog.Disposable.call(this);

  if (!cdm.online) { return; } // No upload in offline mode

  /**
   * @private
   * @type {!Element}
   */
  this.fileinput_ =
      goog.dom.createDom('input', {'id': id, 'name': id, 'type': 'file'});

  /**
   * @private
   * @type {!HTMLFormElement}
   */
  this.uploadform_ = /** @type {!HTMLFormElement} */ (
      goog.dom.createDom('form', {'id': id + 'form',
        'enctype': 'multipart/form-data', 'method': 'POST', 'action' :
            serverAction}, this.fileinput_));
  this.uploadform_.encoding = 'multipart/form-data'; // For IE

  /**
   * @private
   * @type {function():Object.<string, string>|undefined}
   */
  this.opt_getData_ = opt_getData;
  /**
   * @private
   * @type {function(string):boolean|undefined}
   */
  this.opt_validateData_ = opt_validateData;
  /**
   * @private
   * @type {function(string, !goog.net.IframeIo):undefined}
   */
  this.complete_ = complete;
  /**
   * @private
   * @type {Object|undefined}
   */
  this.opt_handler_ = opt_handler;


  goog.dom.appendChild(parent, this.uploadform_);
  // Works in IE, FF and Chrome
  this.listen(this.fileinput_, goog.events.EventType.CHANGE, this.doUpload_);
};
goog.inherits(pn.ui.FileUpload, goog.Disposable);


/**
 * @private
 */
pn.ui.FileUpload.prototype.doUpload_ = function() {
  if (this.opt_validateData_ &&
      !this.opt_validateData_.call(
      this.opt_handler_ || this, this.fileinput_.value)) return;

  if (this.opt_getData_) {
    this.setUploadData_(this.opt_getData_.call(this.opt_handler_ || this));
  }

  cdm.nav.showMessage('Uploading...');
  var io = new goog.net.IframeIo();
  this.listen(io, goog.net.EventType.COMPLETE, this.onComplete_);
  io.sendFromForm(this.uploadform_, undefined, true);
};


/**
 * @private
 * @param {Object.<string, string>} data The data to set in the upload form.
 */
pn.ui.FileUpload.prototype.setUploadData_ = function(data) {
  goog.array.forEach(this.uploadform_.childNodes, function(c) {
    if (c.getAttribute('type') === 'file') return;
    goog.dom.removeNode(c);
  });
  for (var i in data) {
    goog.dom.appendChild(this.uploadform_,
        goog.dom.createDom('input',
        {'type': 'hidden', 'id': i, 'name': i, 'value': data[i]}));
  }
};


/**
 * @private
 * @param {goog.events.Event} e The oncomplete event.
 */
pn.ui.FileUpload.prototype.onComplete_ = function(e) {
  cdm.nav.showMessage('');
  var io = /** @type {!goog.net.IframeIo} */ (e.target);
  this.complete_.call(this.opt_handler_ || this, this.fileinput_.value, io);
  this.fileinput_.disabled = false;
  goog.dispose(io);
};


/** @inheritDoc */
pn.ui.FileUpload.prototype.disposeInternal = function() {
  pn.ui.FileUpload.superClass_.disposeInternal.call(this);

  delete this.fileinput_;
  delete this.uploadform_;
  delete this.opt_getData_;
  delete this.complete_;
  delete this.opt_handler_;
};
