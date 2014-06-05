;
goog.provide('pn.ui.MessagePanel');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('pn.log');
goog.require('pn.ui.BaseControl');



/**
 * @constructor
 * @extends {pn.ui.BaseControl}
 * @param {!Element} panel The panel to use to display the messages/errors.
 */
pn.ui.MessagePanel = function(panel) {
  pn.ui.BaseControl.call(this, panel);

  /**
   * @private
   * @type {number}
   */
  this.timer_ = 0;

  /**
   * @private
   * @type {!Array.<string>}
   */
  this.messages_ = [];

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.MessagePanel');

  var cb = this.clearMessage.pnbind(this);
  if (!window['Hammer']) {
    this.listenTo(panel, goog.events.EventType.CLICK, cb);
  } else {
    this.ontap(panel, cb);
  }
};
goog.inherits(pn.ui.MessagePanel, pn.ui.BaseControl);


/**
 * Clears the message panel and resets to original class.
 */
pn.ui.MessagePanel.prototype.clearMessage = function() {
  this.messages_ = [];
  if (this.timer_) goog.Timer.clear(this.timer_);
  this.el.innerHTML = '';
  pn.dom.show(this.el, false);
};


/**
 * @param {string} message The error to display.
 */
pn.ui.MessagePanel.prototype.showError = function(message) {
  pn.assStr(message);
  this.showList_([message], 'error');
};


/**
 * @param {Array.<string>} list The error list to display.
 */
pn.ui.MessagePanel.prototype.showErrors = function(list) {
  pn.assArr(list);
  this.showList_(list, 'error');
};


/**
 * @param {string} message The error to display.
 */
pn.ui.MessagePanel.prototype.showWarning = function(message) {
  pn.assStr(message);
  this.showList_([message], 'warning');
};


/**
 * @param {Array.<string>} list The error list to display.
 */
pn.ui.MessagePanel.prototype.showWarnings = function(list) {
  pn.assArr(list);
  this.showList_(list, 'warning');
};


/**
 * @param {string} message The message to display.
 */
pn.ui.MessagePanel.prototype.showMessage = function(message) {
  pn.assStr(message);
  this.showList_([message], 'info');
};


/**
 * @param {Array.<string>} list The message list to display.
 */
pn.ui.MessagePanel.prototype.showMessages = function(list) {
  pn.assArr(list);
  this.showList_(list, 'info');
};


/**
 * @private
 * @param {Array.<string>} list The message list to display.
 * @param {string} cls The class of the messages to displahy (error,
 *    warning, info)
 */
pn.ui.MessagePanel.prototype.showList_ = function(list, cls) {
  pn.ass(list.length);

  if (this.timer_) { goog.Timer.clear(this.timer_); }
  this.messages_ = this.messages_.pnconcat(list.pnmap(
      function(m) { return cls + '|:' + m; })).
      pnremoveDuplicates();

  this.log_.finest('Showing Messages:\n' + this.messages_.join('\n'));

  var html = '<ul>' + this.messages_.pnmap(function(m) {
    var tokens = m.split('|:');
    return '<li class="' + tokens[0] + '">' + tokens[1];
  }).join('</li>') + '</li></ul>';

  this.el.innerHTML = html;
  pn.dom.show(this.el, true);
  // Variable length message timeout, 2s per message
  var totchars = this.messages_.pnreduce(
      function(acc, m) { return acc + m.length; }),
      timeout = Math.max(1500, totchars * 80);
  this.timer_ = goog.Timer.callOnce(this.clearMessage, timeout, this);
};


/** @override */
pn.ui.MessagePanel.prototype.disposeInternal = function() {
  pn.ui.MessagePanel.superClass_.disposeInternal.call(this);
  delete this.el;
};
