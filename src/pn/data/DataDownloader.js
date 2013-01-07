;
goog.provide('pn.data.DataDownloader');

goog.require('goog.net.IframeIo');


/**
 * @private
 * @type {goog.net.IframeIo}
 */
pn.data.DataDownloader.io_ = null;


/**
 * @param {string} url The export http GET url.
 * @param {Object} data The data to send to the http request.
 * @param {function(string):undefined=} opt_cb The oncomplete callback with
 *    the response html as the argument.
 */
pn.data.DataDownloader.send = function(url, data, opt_cb) {
  goog.asserts.assert(url);
  var dispose = function() {
    if (!pn.data.DataDownloader.io_) return;
    pn.data.DataDownloader.io_.dispose();
    pn.data.DataDownloader.io_ = null;
  };
  dispose();

  // NOTE: Callback will not be called if we are downloading a file.
  var cb = function(e) {
    dispose();
    if (opt_cb) opt_cb(e && e.target ? e.target.getResponseHtml() : null);
    opt_cb = undefined;
  };

  pn.data.DataDownloader.io_ = new goog.net.IframeIo();
  goog.events.listenOnce(
      pn.data.DataDownloader.io_, goog.net.EventType.COMPLETE, cb);
  pn.data.DataDownloader.io_.send(url, 'POST', true, data);
  goog.Timer.callOnce(dispose, 20000);
};
