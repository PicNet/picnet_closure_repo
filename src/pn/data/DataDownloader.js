;
goog.provide('pn.data.DataDownloader');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.EventType');
goog.require('goog.net.IframeIo');



/**
 * @constructor
 * @param {!Element} parent The parent element to attach an iframe to.
 */
pn.data.DataDownloader = function(parent) {
  goog.asserts.assert(parent);

  /**
   * @private
   * @type {!Element}
   */
  this.parent_ = parent;
};


/**
 * @param {string} exportUrl The export http GET url.
 * @param {!Object} exportData The data to send to the http request.
 * @param {!function(string):undefined=} opt_oncomplete The
 *    oncomplete callback.
 */
pn.data.DataDownloader.prototype.exportData =
    function(exportUrl, exportData, opt_oncomplete) {
  var formid = 'export_' + goog.now();
  var exportform = /** @type {!HTMLFormElement} */ (goog.dom.createDom('form',
      {'id': formid, 'method': 'POST', 'action' : exportUrl}));
  exportform['enctype'] = exportform['encoding'] = 'multipart/form-data';

  for (var i in exportData) {
    var field = goog.dom.createDom('input',
        {'id': i, 'name': i, 'type': 'hidden', 'value': exportData[i]});
    goog.dom.appendChild(exportform, field);
  }

  goog.dom.appendChild(this.parent_, exportform);
  this.exportDataImpl_(exportform, opt_oncomplete);
};


/**
 * @private
 * @param {!HTMLFormElement} exportform The form with the export data.
 * @param {!function(string):undefined=} opt_oncomplete The
 *    oncomplete callback.
 */
pn.data.DataDownloader.prototype.exportDataImpl_ =
    function(exportform, opt_oncomplete) {
  var io = new goog.net.IframeIo();
  goog.events.listenOnce(io, goog.net.EventType.COMPLETE, function() {
    if (opt_oncomplete) opt_oncomplete(io.getResponseHtml());
    goog.dispose(io);
    goog.dom.removeNode(exportform);
  }, false, this);
  io.sendFromForm(exportform, undefined, true);
};
