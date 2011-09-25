;
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.EventType');
goog.require('goog.net.IframeIo');

goog.provide('pn.IFrameDownload');



/**
 * @constructor
 *
 * @param {!Element} parent The element to attach the invisible iframe to.
 * @param {string} downloadUrl The url of the resource to download.
 * @param {Object=} opt_data The data to pass to the http GET request.
 * @param {function(!goog.net.IframeIo):undefined=} opt_oncomplete The optional
 *    callback.
 */
pn.IFrameDownload = function(parent, downloadUrl, opt_data, opt_oncomplete) {
  var formid = 'ifd_' + new Date().getTime();
  var frm = /** @type {!HTMLFormElement} */ (goog.dom.createDom('form',
      {'id': formid, 'method': 'POST', 'action': downloadUrl}));
  frm['enctype'] = frm['encoding'] = 'multipart/form-data';

  if (opt_data) {
    for (var i in opt_data) {
      var field = goog.dom.createDom('input',
          {'id': i, 'name': i, 'type': 'hidden', 'value': opt_data[i]});
      goog.dom.appendChild(frm, field);
    }
  }

  goog.dom.appendChild(parent, frm);
  this.downloadDataImpl_(frm, opt_oncomplete);
};


/**
 * @private
 * @param {!HTMLFormElement} frm The form containing the request details.
 * @param {function(!goog.net.IframeIo):undefined=} opt_oncomplete The optional
 *    callback.
 */
pn.IFrameDownload.prototype.downloadDataImpl_ = function(frm, opt_oncomplete) {
  var io = new goog.net.IframeIo();
  goog.events.listenOnce(io, goog.net.EventType.COMPLETE,
      function() {
        if (opt_oncomplete) opt_oncomplete(io);
        goog.dispose(io);
        goog.dom.removeNode(frm);
      }
      , false, this);
  io.sendFromForm(frm, undefined, true);
};
