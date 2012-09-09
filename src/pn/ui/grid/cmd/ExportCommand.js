;
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.json');
goog.require('goog.net.IframeIo');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Option');
goog.require('goog.ui.Select');

goog.provide('pn.ui.grid.cmd.ExportCommand');



/**
 * @constructor
 * @extends {pn.ui.grid.cmd.Command}
 */
pn.ui.grid.cmd.ExportCommand = function() {
  pn.ui.grid.cmd.Command.call(this, 'Export', pn.app.AppEvents.LIST_EXPORT);

  /**
   * @type {boolean}
   */
  this.visibleOnEmpty = false;

  /**
   * @type {boolean}
   */
  this.visibleOnReadOnly = true;

  /**
   * @private
   * @type {Element}
   */
  this.select_ = null;
};
goog.inherits(pn.ui.grid.cmd.ExportCommand, pn.ui.grid.cmd.Command);


/** @override */
pn.ui.grid.cmd.ExportCommand.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.grid.cmd.ExportCommand.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  this.select_ = goog.dom.createDom('select', 'export-select',
      goog.dom.createDom('option', {'value': '0'}, 'Export Data...'),
      goog.dom.createDom('option', {'value': 'csv'}, 'CSV'),
      goog.dom.createDom('option', {'value': 'txt'}, 'TXT'),
      goog.dom.createDom('option', {'value': 'xls'}, 'Excel'),
      goog.dom.createDom('option', {'value': 'pdf'}, 'PDF')
      );
  goog.dom.appendChild(element, this.select_);
};


/** @override */
pn.ui.grid.cmd.ExportCommand.prototype.enterDocument = function() {
  var change = goog.events.EventType.CHANGE;
  this.getHandler().listen(this.select_, change, function() {
    var exportFormat = this.select_.value;
    if (!exportFormat) return;
    this.select_.selectedIndex = 0;
    var e = new goog.events.Event(this.eventType, this);
    e.exportFormat = exportFormat;
    this.dispatchEvent(e);
  }, false, this);
};


/**
 * @param {Array.<!pn.ui.grid.ColumnCtx>} cctxs The column contexts being
 *    displayed.
 * @param {Array.<string>} headers The headers of the data.
 * @param {Slick.Data.DataView} view The DataView with the data to export.
 * @return {Array.<Array.<string>>} The data of the grid. This is used when
 *    exporting the grid contents.
 */
pn.ui.grid.cmd.ExportCommand.getGridData = function(cctxs, headers, view) {
  var gridData = [headers];
  var lencol = headers.length;
  for (var row = 0, len = view.getLength(); row < len; row++) {
    var rowData = view.getItem(row);
    var rowTxt = [];

    for (var cidx = 0; cidx < lencol; cidx++) {
      var cctx = cctxs[cidx];
      var val = rowData[cctx.spec.dataProperty];
      var renderer = cctx.getColumnRenderer();
      var txt = renderer ? renderer(cctx, rowData) : val;
      rowTxt.push(txt);
    }
    gridData.push(rowTxt);
  }
  return gridData;
};
