;
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.json');
goog.require('goog.net.IframeIo');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Option');
goog.require('goog.ui.Select');

goog.provide('pn.ui.grid.ExportCommand');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
pn.ui.grid.ExportCommand = function() {
  goog.ui.Component.call(this);

  /**
   * @type {pn.ui.grid.Grid.EventType}
   */
  this.eventType = pn.ui.grid.Grid.EventType.EXPORT_DATA;

  /**
   * @private
   * @type {goog.ui.Select}
   */
  this.select_ = null;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
};
goog.inherits(pn.ui.grid.ExportCommand, goog.ui.Component);


/** @inheritDoc */
pn.ui.grid.ExportCommand.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.grid.ExportCommand.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  this.select_ = new goog.ui.Select('Export Data...');
  this.select_.addItem(new goog.ui.Option('Export Data...', ''));
  this.select_.addItem(new goog.ui.Option('CSV', 'csv'));
  this.select_.addItem(new goog.ui.Option('TXT (tab delimited)', 'txt'));
  this.select_.addItem(new goog.ui.Option('Excel', 'xls'));
  this.select_.addItem(new goog.ui.Option('PDF', 'pdf'));

  this.select_.setSelectedIndex(0);

  this.select_.render(element);
};


/** @inheritDoc */
pn.ui.grid.ExportCommand.prototype.enterDocument = function() {
  this.eh_.listen(this.select_, goog.ui.Component.EventType.ACTION, function() {
    var exportFormat = this.select_.getValue();
    if (!exportFormat) return;
    this.select_.setSelectedIndex(0);
    var e = new goog.events.Event(this.eventType, this);
    e.exportFormat = exportFormat;
    this.dispatchEvent(e);
  }, false, this);
};


/** @inheritDoc */
pn.ui.grid.ExportCommand.prototype.exitDocument = function() {
  this.eh_.removeAll();
};


/** @inheritDoc */
pn.ui.grid.ExportCommand.prototype.disposeInternal = function() {
  goog.dispose(this.select_);
  goog.dispose(this.eh_);
};
