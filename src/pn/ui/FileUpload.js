;
goog.provide('pn.ui.FileUpload');
goog.provide('pn.ui.FileUpload.EventType');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.net.IframeIo');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 *
 * @param {string} id The id to use for the file input control.
 * @param {string} serverAction The server action name.
 * @param {(Object.<string, string>|function():Object.<string, string>)=}
 *    opt_getData The optional data provider.
 * @param {function(string):boolean=} opt_validateData The optional data
 *    validator.
 */
pn.ui.FileUpload = function(id, serverAction, opt_getData, opt_validateData) {
  pn.ass(id);
  pn.ass(serverAction);

  goog.ui.Component.call(this);

  /**
   * @private
   * @type {string}
   */
  this.fuid_ = id;

  /**
   * @private
   * @type {string}
   */
  this.serverAction_ = serverAction;

  /**
   * @private
   * @type {HTMLFormElement}
   */
  this.uploadform_ = null;

  /**
   * @private
   * @type {goog.net.IframeIo}
   */
  this.io_ = null;

  /**
   * @private
   * @type {!Array.<!Element>}
   */
  this.formFields_ = [];

  /**
   * @private
   * @type {Object.<string, string>|function():Object.<string, string>|
   *    undefined}
   */
  this.getData_ = opt_getData;
  /**
   * @private
   * @type {function(string):boolean|undefined}
   */
  this.validateData_ = opt_validateData;
};
goog.inherits(pn.ui.FileUpload, goog.ui.Component);


/**
 * @type {string}
 * @const
 */
pn.ui.FileUpload.UPLOAD_START = 'upload-start';


/** @override */
pn.ui.FileUpload.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.FileUpload.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  this.fileInput_ = goog.dom.createDom('input',
      {'id': this.fuid_, 'name': this.fuid_, 'type': 'file'});
  this.uploadform_ = /** @type {!HTMLFormElement} */ (
      goog.dom.createDom('form', {'id': this.fuid_ + '_form',
        'enctype': 'multipart/form-data', 'method': 'POST', 'action' :
            this.serverAction_}, this.fileInput_));
  this.uploadform_.encoding = 'multipart/form-data'; // For IE
  this.registerDisposable(this.uploadform_);

  goog.dom.appendChild(element, this.uploadform_);
};


/** @override */
pn.ui.FileUpload.prototype.enterDocument = function() {
  pn.ui.FileUpload.superClass_.enterDocument.call(this);
  this.getHandler().listen(this.fileInput_, goog.events.EventType.CHANGE,
      this.doUpload_);
};


/**
 * @private
 */
pn.ui.FileUpload.prototype.doUpload_ = function() {
  if (this.validateData_ &&
      !this.validateData_.call(this, this.fileInput_.value)) return;

  var e = new goog.events.Event(pn.ui.FileUpload.UPLOAD_START, this);
  this.dispatchEvent(e);

  this.io_ = new goog.net.IframeIo();
  var complete = goog.net.EventType.COMPLETE;
  this.getHandler().listen(this.io_, complete, this.onComplete_);

  if (this.getData_) {
    var data = typeof (this.getData_) === 'object' ?
        this.getData_ : this.getData_.call(this);
    this.setUploadData_(data);
  }

  this.io_.sendFromForm(this.uploadform_, undefined, true);
};


/**
 * @private
 * @param {Object.<string, string>} data The data to set in the upload form.
 */
pn.ui.FileUpload.prototype.setUploadData_ = function(data) {
  this.formFields_ = [];
  this.uploadform_.childNodes.pnforEach(function(c) {
    if (c.getAttribute('type') === 'file') return;
    goog.dom.removeNode(c);
    goog.dispose(c);
  });
  for (var i in data) {
    var child = goog.dom.createDom('input',
        {'type': 'hidden', 'id': i, 'name': i, 'value': data[i]});
    goog.dom.appendChild(this.uploadform_, child);
    this.formFields_.push(child);
  }
};


/**
 * @private
 */
pn.ui.FileUpload.prototype.onComplete_ = function() {
  this.fileInput_.disabled = false;
  var complete = goog.net.EventType.COMPLETE;
  this.getHandler().unlisten(this.io_, complete, this.onComplete_);

  var et = this.io_.isSuccess() ?
      pn.ui.FileUpload.EventType.UPLOAD_COMPLETE :
      pn.ui.FileUpload.EventType.UPLOAD_ERROR;

  var event = new goog.events.Event(et, this);
  event.io = this.io_;
  event.data = this.io_.isSuccess() ?
      this.io_.getResponseHtml() :
      this.io_.getLastError();

  goog.dispose(this.io_);
  this.formFields_ = [];

  this.dispatchEvent(event);
};


/**
 * @enum {string}
 */
pn.ui.FileUpload.EventType = {
  UPLOAD_COMPLETE: 'upload-complete',
  UPLOAD_ERROR: 'upload-error'
};
