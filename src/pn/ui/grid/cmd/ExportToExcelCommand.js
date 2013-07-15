;
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.json');
goog.require('goog.net.IframeIo');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Button');
goog.require('pn.ui.grid.cmd.Command');
goog.provide('pn.ui.grid.cmd.ExportToExcelCommand');



/**
 * @constructor
 * @extends {pn.ui.grid.cmd.Command}
 */
pn.ui.grid.cmd.ExportToExcelCommand = function() {
  pn.ui.grid.cmd.Command.call(this, 'Export', pn.web.WebAppEvents.LIST_EXPORT);

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
  this.button_ = null;
};
goog.inherits(pn.ui.grid.cmd.ExportToExcelCommand, pn.ui.grid.cmd.Command);


/** @override */
pn.ui.grid.cmd.ExportToExcelCommand.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.grid.cmd.ExportToExcelCommand.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  this.button_ = goog.dom.createDom('button', {'title' : 'Export To Excel', 'class' : 'button export-excel'});
  goog.dom.appendChild(element, this.button_);
};


/** @override */
pn.ui.grid.cmd.ExportToExcelCommand.prototype.enterDocument = function() {
  var click = goog.events.EventType.CLICK;
  this.getHandler().listen(this.button_, click, function() {
    var e = new goog.events.Event(this.eventType, this);
    e.exportFormat = 'xls';
    this.dispatchEvent(e);
  }, false, this);
};
