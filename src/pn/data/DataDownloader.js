;
goog.provide('pn.data.DataDownloader');

goog.require('goog.net.IframeIo');


/**
 * @param {string} url The export http GET url.
 * @param {Object} data The data to send to the http request.
 * @param {function(string):undefined=} opt_cb The oncomplete callback with
 *    the response html as the argument.
 * @param {number=} opt_timeout An optional timeout for the request.
 */
pn.data.DataDownloader.send = function(url, data, opt_cb, opt_timeout) {
  goog.asserts.assert(url);
  // NOTE: Callback will not be called if we are downloading a file.
  var cb = function(e) {
    if (opt_cb) opt_cb(e && e.target ? e.target.getResponseHtml() : null);
    opt_cb = undefined;
  };

  // This hack is required as downloading files with IframeIo does not
  // work (response is ended and the internal form is not disposed).
  // See report:
  /** @suppress {accessControls} */
  goog.Timer.callOnce(function() {
    goog.dispose(goog.net.IframeIo.form_);
    delete goog.net.IframeIo.form_;
    cb(null);
  }, opt_timeout || 2000);

  goog.net.IframeIo.send(url, cb, 'POST', true, data);
};
