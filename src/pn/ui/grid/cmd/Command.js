;
goog.provide('pn.ui.grid.cmd.Command');

goog.require('goog.Disposable');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('pn.ui.grid.cmd.ICommand');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @implements {pn.ui.grid.cmd.ICommand}
 * @param {string} name The name/caption of this column.
 * @param {string} eventType The event to fire on the component action.
 * @param {string=} opt_tooltip The optional tooltip for this command.
 * @param {(Element|goog.ui.Component)=} opt_elem The optional element for
 *    this command.  If specified no additional event work is done on
 *    this command.
 */
pn.ui.grid.cmd.Command = function(name, eventType, opt_tooltip, opt_elem) {
  pn.ass(name);
  pn.ass(eventType);

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
   * @type {boolean}
   */
  this.hasExplicitElem_ = !!opt_elem;

  /**
   * @private
   * @type {Element|goog.ui.Component}
   */
  this.commandElement_ = opt_elem || null;
};
goog.inherits(pn.ui.grid.cmd.Command, goog.ui.Component);


/** @override */
pn.ui.grid.cmd.Command.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.grid.cmd.Command.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  if (!this.hasExplicitElem_) {
    this.commandElement_ = new goog.ui.Button(this.name_);
    this.commandElement_.setTooltip(this.tooltip_);
    this.commandElement_.enableClassName(
        goog.string.removeAll(this.name_.toLowerCase(), ''), true);
  }
  if (this.commandElement_ instanceof goog.Disposable) {
    this.registerDisposable(/** @type {goog.Disposable} */ (
        this.commandElement_));
  }

  if (this.commandElement_.render) this.commandElement_.render(element);
  else goog.dom.appendChild(element, /** @type {!Element} */ (
      this.commandElement_));
};


/** @override */
pn.ui.grid.cmd.Command.prototype.enterDocument = function() {
  if (this.hasExplicitElem_) return;

  var action = goog.ui.Component.EventType.ACTION;
  this.getHandler().listen(this.commandElement_, action, function() {
    this.dispatchEvent(new goog.events.Event(this.eventType, this));
  });
};
