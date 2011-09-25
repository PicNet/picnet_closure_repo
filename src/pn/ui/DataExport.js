;
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.EventType');
goog.require('goog.net.IframeIo');

goog.provide('pn.ui.DataExport');



/**
 * @constructor
 *
 * @param {!Element} parent The parent element to attach an iframe to.
 * @param {string} exportUrl The export http GET url.
 * @param {!Object} exportData The data to send to the http request.
 * @param {!function(!goog.net.IframeIo):undefined} oncomplete The
 *    oncomplete callback.
 */
pn.ui.DataExport = function(parent, exportUrl, exportData, oncomplete) {

  var formid = 'export_' + new Date().getTime();
  var exportform = /** @type {!HTMLFormElement} */ (
      goog.dom.createDom('form', {'id': formid,
        'enctype': 'multipart/form-data', 'method': 'POST', 'action' :
            exportUrl}));
  exportform.encoding = 'multipart/form-data'; // For IE

  for (var i in exportData) {
    var field = goog.dom.createDom('input',
        {'id': i, 'name': i, 'type': 'hidden', 'value': exportData[i]});
    goog.dom.appendChild(exportform, field);
  }

  goog.dom.appendChild(parent, exportform);
  this.exportDataImpl_(exportform, oncomplete);
};


/**
 * @private
 * @param {!HTMLFormElement} exportform The form with the export data.
 * @param {!function(!goog.net.IframeIo):undefined} oncomplete The
 *    oncomplete callback.
 */
pn.ui.DataExport.prototype.exportDataImpl_ = function(exportform, oncomplete) {
  var io = new goog.net.IframeIo();
  goog.events.listenOnce(io, goog.net.EventType.COMPLETE,
      function() {
        oncomplete(io);
        goog.dispose(io);
        goog.dom.removeNode(exportform);
      }
      , false, this);
  io.sendFromForm(exportform, undefined, true);
};
