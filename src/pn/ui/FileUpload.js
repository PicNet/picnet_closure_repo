goog.require('goog.dom');
goog.require('goog.net.IframeIo');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.array');

goog.require('picnet.ui.UIClass');

goog.provide('picnet.ui.FileUpload');

/**
 * @constructor
 * @extends {picnet.ui.UIClass}
 *
 * @param {string} id
 * @param {string} serverAction
 * @param {!Element} parent
 * @param {function(string, !goog.net.IframeIo):undefined} complete 
 * @param {function():Object.<string, string>=} getData 
 * @param {function(string):boolean=} validateData
 * @param {Object=} handler 
 */
picnet.ui.FileUpload = function(id, serverAction, parent, complete, getData, validateData, handler) {
	picnet.ui.UIClass.call(this);		

	if (!cdm.online) { return; } // No upload in offline mode

	/**
	 * @private
	 * @type {!Element}
	 */
    this.fileinput = goog.dom.createDom('input', {'id':id,'name':id,'type':'file'});
	/**
	 * @private
	 * @type {!HTMLFormElement}
	 */
	this.uploadform = /** @type {!HTMLFormElement} */ (goog.dom.createDom('form', {'id':id + 'form','enctype':'multipart/form-data','method':'POST','action':serverAction}, this.fileinput));
	this.uploadform.encoding = 'multipart/form-data'; // For IE

	/**
	 * @private
	 * @type {function():Object.<string, string>|undefined}
	 */
	this.getData = getData;
    /**
	 * @private
	 * @type {function(string):boolean|undefined}
	 */
	this.validateData = validateData;
	/**
	 * @private
	 * @type {function(string, !goog.net.IframeIo):undefined}
	 */
	this.complete = complete;
	/**
	 * @private
	 * @type {Object|undefined}
	 */
	this.handler = handler;

	goog.dom.appendChild(parent, this.uploadform);
	this.listen(this.fileinput, goog.events.EventType.CHANGE, this.doUpload); // Works in IE, FF and Chrome
};
goog.inherits(picnet.ui.FileUpload, picnet.ui.UIClass);

/**
 * @private
 */
picnet.ui.FileUpload.prototype.doUpload = function(e) {    
    if (this.validateData) { if(!this.validateData.call(this.handler || this, this.fileinput.value)) return; }

	if (this.getData) { this.setUploadData(this.getData.call(this.handler || this)); }

	cdm.nav.showMessage('Uploading...');
	var io = new goog.net.IframeIo();
	this.listen(io, goog.net.EventType.COMPLETE, this.onComplete);
	io.sendFromForm(this.uploadform, undefined, true);
};

/**
 * @private
 * @param {Object.<string, string>} data
 */
picnet.ui.FileUpload.prototype.setUploadData = function(data) {
	goog.array.forEach(this.uploadform.childNodes, function(c) {		
		if (c.getAttribute('type') === 'file') return;
		goog.dom.removeNode(c);
	});
	for (var i in data) { goog.dom.appendChild(this.uploadform, goog.dom.createDom('input', {'type':'hidden','id':i,'name':i,'value':data[i]})); }
};

/**
 * @private
 * @param {goog.events.Event} e
 */
picnet.ui.FileUpload.prototype.onComplete = function(e) {
	cdm.nav.showMessage('');
	var io = /** @type {!goog.net.IframeIo} */ (e.target);		
	this.complete.call(this.handler || this, this.fileinput.value, io);		
	this.fileinput.disabled = false;
	goog.dispose(io);
};

/** @inheritDoc */
picnet.ui.FileUpload.prototype.disposeInternal = function() {
    picnet.ui.FileUpload.superClass_.disposeInternal.call(this);

	delete this.fileinput;
	delete this.uploadform;
	delete this.getData;
	delete this.complete;
	delete this.handler;
};