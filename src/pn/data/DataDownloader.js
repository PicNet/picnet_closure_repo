﻿;
goog.provide('pn.data.DataDownloader');

goog.require('goog.net.EventType');
goog.require('goog.net.IframeIo');


/**
 * @param {string} url The export http GET url.
 * @param {Object} data The data to send to the http request.
 * @param {function(string):undefined=} opt_cb The oncomplete callback with
 *    the response html as the argument.
 * @param {number=} opt_timeout An optional timeout for the request.
 * @suppress {accessControls}
 */
pn.data.DataDownloader.send = function(url, data, opt_cb, opt_timeout) {
  pn.ass(url);
  // NOTE: Callback will not be called if we are downloading a file.
  var cb = function(e) {
    if (opt_cb) { opt_cb(e && e.target ? e.target.getResponseHtml() : null); }
    opt_cb = undefined;
  };

  // HACK: See below for description.
  var frames = goog.net.IframeIo.instances_;
  goog.object.forEach(frames, goog.dispose);
  var io = new goog.net.IframeIo();

  goog.events.listen(io, goog.net.EventType.READY, io.dispose, false, io);
  goog.events.listen(io, goog.net.EventType.COMPLETE, cb);
  io.send(url, 'POST', true, data);

  // This hack is required as downloading files with IframeIo does not
  // work (response is ended and the internal form is not disposed).
  // See report:
  goog.Timer.callOnce(function() {
    goog.dispose(io);
    cb(null);
  }, opt_timeout || 10000);
};
