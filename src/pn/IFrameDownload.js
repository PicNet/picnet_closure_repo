;
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.EventType');
goog.require('goog.net.IframeIo');

goog.provide('pn.IFrameDownload');



/**
 * @constructor
 *
 * @param {!Element} parent
 * @param {string} downloadUrl
 * @param {Object=} data
 * @param {function(!goog.net.IframeIo):undefined=} oncomplete
 */
pn.IFrameDownload = function(parent, downloadUrl, data, oncomplete) {
	var formid = 'ifd_' + new Date().getTime();
	var frm = /** @type {!HTMLFormElement} */ (goog.dom.createDom('form', {'id': formid, 'method': 'POST', 'action': downloadUrl}));
	frm['enctype'] = frm['encoding'] = 'multipart/form-data';

  if (data) {
	  for (var i in data) {
		  var field = goog.dom.createDom('input', {'id': i, 'name': i, 'type': 'hidden', 'value': data[i]});
		  goog.dom.appendChild(frm, field);
	  }
  }

	goog.dom.appendChild(parent, frm);
	this.downloadDataImpl(frm, oncomplete);
};


/**
 * @private
 * @param {!HTMLFormElement} frm
 * @param {function(!goog.net.IframeIo):undefined=} oncomplete
 */
pn.IFrameDownload.prototype.downloadDataImpl = function(frm, oncomplete) {
	var io = new goog.net.IframeIo();
	goog.events.listenOnce(io, goog.net.EventType.COMPLETE,
		function(e) {
			if (oncomplete) oncomplete(io);
			goog.dispose(io);
			goog.dom.removeNode(frm);
		}
	, false, this);
	io.sendFromForm(frm, undefined, true);
};
