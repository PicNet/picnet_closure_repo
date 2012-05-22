;
goog.provide('pn.ui.grid.Command');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('pn.ui.grid.Grid.EventType');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {string} name The name/caption of this column.
 * @param {pn.ui.grid.Grid.EventType} eventType The event to fire on '
 *    componenet action.
 * @param {string=} opt_tooltip The optional tooltip for this command.
 */
pn.ui.grid.Command = function(name, eventType, opt_tooltip) {
  goog.asserts.assert(name);
  goog.asserts.assert(eventType);

  goog.ui.Component.call(this);

  /**
   * @private
   * @type {string}
   */
  this.name_ = name;

  /**
   * @private
   * @type {string}
   */
  this.tooltip_ = opt_tooltip || name;

  /**
   * @type {pn.ui.grid.Grid.EventType}
   */
  this.eventType = eventType;

  /**
   * @private
   * @type {goog.ui.Button}
   */
  this.commandElement_ = null;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
};
goog.inherits(pn.ui.grid.Command, goog.ui.Component);


/** @inheritDoc */
pn.ui.grid.Command.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.grid.Command.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  this.commandElement_ = new goog.ui.Button(this.name_);
  this.commandElement_.setTooltip(this.tooltip_);
  this.commandElement_.enableClassName(
      goog.string.removeAll(this.name_.toLowerCase(), ''), true);
  this.commandElement_.render(element);
};


/** @inheritDoc */
pn.ui.grid.Command.prototype.enterDocument = function() {
  this.eh_.listen(this.commandElement_, goog.ui.Component.EventType.ACTION,
      function() {
        this.dispatchEvent(new goog.events.Event(this.eventType, this));
      });
};


/** @inheritDoc */
pn.ui.grid.Command.prototype.exitDocument = function() {
  this.eh_.removeAll();
};


/** @inheritDoc */
pn.ui.grid.Command.prototype.disposeInternal = function() {
  goog.dispose(this.commandElement_);
  this.eh_.removeAll();
  goog.dispose(this.eh_);

  delete this.commandElement_;
  delete this.eh_;
};
