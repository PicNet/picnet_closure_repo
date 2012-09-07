;
goog.provide('pn.ui.grid.Command');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {string} name The name/caption of this column.
 * @param {string} eventType The event to fire on the component action.
 * @param {string=} opt_tooltip The optional tooltip for this command.
 */
pn.ui.grid.Command = function(name, eventType, opt_tooltip) {
  goog.asserts.assert(name);
  goog.asserts.assert(eventType);

  goog.ui.Component.call(this);

  /**
   * @type {string}
   */
  this.eventType = eventType;

  /**
   * @type {boolean}
   */
  this.visibleOnEmpty = true;

  /**
   * @type {boolean}
   */
  this.visibleOnReadOnly = false;

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
   * @private
   * @type {goog.ui.Button}
   */
  this.commandElement_ = null;
};
goog.inherits(pn.ui.grid.Command, goog.ui.Component);


/** @override */
pn.ui.grid.Command.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.grid.Command.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  this.commandElement_ = new goog.ui.Button(this.name_);
  this.registerDisposable(this.commandElement_);

  this.commandElement_.setTooltip(this.tooltip_);
  this.commandElement_.enableClassName(
      goog.string.removeAll(this.name_.toLowerCase(), ''), true);
  this.commandElement_.render(element);
};


/** @override */
pn.ui.grid.Command.prototype.enterDocument = function() {
  var action = goog.ui.Component.EventType.ACTION;
  this.getHandler().listen(this.commandElement_, action, function() {
    this.dispatchEvent(new goog.events.Event(this.eventType, this));
  });
};
