;
goog.provide('pn.ui.edit.CommandsComponent');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.ComplexRenderer');
goog.require('pn.ui.edit.Config');
goog.require('pn.ui.edit.Field');
goog.require('pn.ui.edit.FieldBuilder');
goog.require('pn.ui.edit.FieldValidator');
goog.require('pn.ui.grid.Column');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.Grid');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!pn.ui.UiSpec} spec The specifications for this edit.
 */
pn.ui.edit.CommandsComponent = function(spec) {
  goog.asserts.assert(spec);

  goog.ui.Component.call(this);

  /**
   * @protected
   * @type {!goog.events.EventHandler}
   */
  this.eh = new goog.events.EventHandler(this);

  /**
   * @protected
   * @type {!pn.ui.UiSpec}
   */
  this.spec = spec;

  /**
   * @private
   * @type {!Array.<pn.ui.edit.Command>}
   */
  this.commands_ = spec.editConfig.commands;

  /**
   * @private
   * @type {!Object.<goog.ui.Button>}
   */
  this.commandButtons_ = {};
};
goog.inherits(pn.ui.edit.CommandsComponent, goog.ui.Component);


/** @inheritDoc */
pn.ui.edit.CommandsComponent.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/**
 * @protected
 * @return {boolean} If this form is valid.
 */
pn.ui.edit.CommandsComponent.prototype.isValidForm = goog.abstractMethod;


/**
 * @protected
 * @return {!Object} The current form data (Read from input controls).
 */
pn.ui.edit.CommandsComponent.prototype.getCurrentFormData = goog.abstractMethod;


/** @return {!Object.<goog.ui.Button>} The command buttons. */
pn.ui.edit.CommandsComponent.prototype.getCommandButtons = function() {
  return this.commandButtons_;
};


/** @inheritDoc */
pn.ui.edit.CommandsComponent.prototype.decorateInternal = function(element) {
  goog.asserts.assert(element);

  this.setElementInternal(element);
  this.addCommandsPanel_(element, 'commands-container');
};


/**
 * @private
 * @param {!Element} parent The parent for this commands panel.
 * @param {string} className The name of the css class for this control.
 */
pn.ui.edit.CommandsComponent.prototype.addCommandsPanel_ =
    function(parent, className) {
  goog.asserts.assert(parent);
  if (!this.commands_.length) return;

  var div = goog.dom.getElementsByClass(className)[0] ||
      goog.dom.createDom('div', className);
  goog.dom.appendChild(parent, div);

  this.decorateCommands_(div);
};


/**
 * @private
 * @param {!Element} parent The parent element to attach the controls to.
 */
pn.ui.edit.CommandsComponent.prototype.decorateCommands_ = function(parent) {
  goog.array.forEach(this.commands_, function(c) {
    var className = c.name.toLowerCase();
    var button = goog.dom.createDom('button',
        {'class': 'goog-button ' + className, 'id': c.name});
    goog.dom.appendChild(parent, button);
    this.commandButtons_[c.name] = button;
  }, this);
};


/** @inheritDoc */
pn.ui.edit.CommandsComponent.prototype.enterDocument = function() {
  pn.ui.edit.CommandsComponent.superClass_.enterDocument.call(this);

  goog.array.forEach(this.commands_, this.doCommandEvent_, this);
};


/**
 * TODO: There is some very strange behaviour going on with this.  This is
 *    duplicate code with EditHandler.enterDocument.  Why 2 ways of handling
 *    commands/buttons?
 * @private
 * @param {pn.ui.edit.Command} command The command to attach events to.
 */
pn.ui.edit.CommandsComponent.prototype.doCommandEvent_ = function(command) {
  var button = this.commandButtons_[command.name];
  this.eh.listen(button, goog.events.EventType.CLICK, function() {
    if (!this.shouldFireCommandEvent(command)) { return; }
    this.fireCommandEvent(command, this.getCurrentFormData());
  });
};


/**
 * @protected
 * @param {pn.ui.edit.Command} command The command to determine
 *    wether to fire or not.
 * @return {boolean} Whether to fire Command Event.
 */
pn.ui.edit.CommandsComponent.prototype.shouldFireCommandEvent =
    function(command) {
  if (command.preclick && !command.preclick(this.getCurrentFormData())) {
    return false;
  } if (command.validate && !this.isValidForm()) { return false; }
  return true;
};


/**
 * @protected
 * @param {pn.ui.edit.Command} command The command to fire.
 * @param {Object} data The current form data.
 */
pn.ui.edit.CommandsComponent.prototype.fireCommandEvent = goog.abstractMethod;


/** @inheritDoc */
pn.ui.edit.CommandsComponent.prototype.exitDocument = function() {
  pn.ui.edit.CommandsComponent.superClass_.exitDocument.call(this);

  this.eh.removeAll();
};


/** @inheritDoc */
pn.ui.edit.CommandsComponent.prototype.disposeInternal = function() {
  pn.ui.edit.CommandsComponent.superClass_.disposeInternal.call(this);

  this.eh.removeAll();
  goog.dispose(this.eh);
  goog.object.forEach(this.commandButtons_, goog.dispose);
  goog.array.forEach(this.commands_, goog.dispose);
  goog.dispose(this.spec);

  delete this.eh;
  delete this.commandButtons_;
  delete this.commands_;
  delete this.spec;
};
