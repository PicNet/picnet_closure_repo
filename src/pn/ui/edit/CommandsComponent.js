;
goog.provide('pn.ui.edit.CommandsComponent');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('pn.ui.KeyShortcutMgr');
goog.require('pn.ui.edit.cmd.Command');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!pn.ui.UiSpec} spec The specifications for this edit.
 * @param {!pn.data.Entity} entity The entity being edited.
 * @param {!pn.data.BaseDalCache} cache The entities cache to use for
 *    related entities.
 * @param {pn.ui.KeyShortcutMgr=} opt_keys The optional keyboard shortcut
 *    manager.
 */
pn.ui.edit.CommandsComponent = function(spec, entity, cache, opt_keys) {
  pn.assInst(spec, pn.ui.UiSpec);
  pn.assInst(entity, pn.data.Entity);
  pn.assInst(cache, pn.data.BaseDalCache);
  pn.ass(!opt_keys || opt_keys instanceof pn.ui.KeyShortcutMgr);

  goog.ui.Component.call(this);

  /**
   * @protected
   * @type {!pn.ui.UiSpec}
   */
  this.spec = spec;
  this.registerDisposable(this.spec);

  /**
   * @private
   * @type {pn.ui.KeyShortcutMgr}
   */
  this.keys_ = opt_keys || null;

  /**
   * @protected
   * @type {!pn.data.Entity}
   */
  this.entity = entity;

  /**
   * @protected
   * @type {!pn.data.BaseDalCache}
   */
  this.cache = cache;

  /**
   * @protected
   * @type {!pn.ui.edit.Config}
   */
  this.cfg = spec.getEditConfig(entity, cache);
  this.registerDisposable(this.cfg);

  /**
   * @private
   * @type {!Array.<pn.ui.edit.cmd.Command>}
   */
  this.commands_ = this.cfg.commands.pnfilter(function(c) {
    return !pn.data.EntityUtils.isNew(entity) || c.showOnNew;
  });

  /**
   * @private
   * @type {!Object.<!Element>}
   */
  this.commandButtons_ = {};
};
goog.inherits(pn.ui.edit.CommandsComponent, goog.ui.Component);


/** @return {!Array.<string>} Any errors in the form. */
pn.ui.edit.CommandsComponent.prototype.getFormErrors = goog.abstractMethod;


/** @return {boolean} If this form is valid. */
pn.ui.edit.CommandsComponent.prototype.isValidForm = goog.abstractMethod;


/** @return {!Object} The current form data (Read from input controls). */
pn.ui.edit.CommandsComponent.prototype.getCurrentFormData = goog.abstractMethod;


/**
 * @protected
 * @param {pn.ui.edit.cmd.Command} command The command to fire.
 * @param {Object} data The current form data.
 */
pn.ui.edit.CommandsComponent.prototype.fireCommandEvent = goog.abstractMethod;


/** @override */
pn.ui.edit.CommandsComponent.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @return {!Object.<Element>} The command buttons. */
pn.ui.edit.CommandsComponent.prototype.getCommandButtons = function() {
  return this.commandButtons_;
};


/** @override */
pn.ui.edit.CommandsComponent.prototype.decorateInternal = function(element) {
  pn.ass(element);

  this.setElementInternal(element);
  this.addCommandsPanel_(element, 'commands-container');
};


/**
 * @private
 * @param {Element} parent The parent for this commands panel.
 * @param {string} className The name of the css class for this control.
 */
pn.ui.edit.CommandsComponent.prototype.addCommandsPanel_ =
    function(parent, className) {
  pn.ass(parent);
  if (!this.commands_.length) return;

  var div = goog.dom.getElementsByClass(className)[0];
  if (!div) {
    div = goog.dom.createDom('div', className);
    goog.dom.appendChild(parent, div);
  }
  this.decorateCommands_(div);
};


/**
 * @private
 * @param {!Element} parent The parent element to attach the controls to.
 */
pn.ui.edit.CommandsComponent.prototype.decorateCommands_ = function(parent) {
  this.commands_.pnforEach(function(c) {
    var className = c.name.toLowerCase();
    var tooltip = this.getCommandTooltip_(c);
    var button = goog.dom.createDom('button',
        {'class': 'goog-button ' + className, 'id': c.name, 'title': tooltip},
        c.name);
    goog.dom.appendChild(parent, button);
    this.commandButtons_[c.name] = button;
  }, this);
};


/** @override */
pn.ui.edit.CommandsComponent.prototype.enterDocument = function() {
  pn.ui.edit.CommandsComponent.superClass_.enterDocument.call(this);

  this.commands_.pnforEach(this.doCommandEvent_, this);
  if (!this.keys_) return;
  this.commands_.pnforEach(function(cmd) {
    if (!cmd.shortcut) return;
    this.keys_.register(cmd.name, cmd.shortcut, this.handle_.pnbind(this));
  }, this);
};


/**
 * @private
 * @param {!pn.ui.edit.cmd.Command} cmd The command to get the tooltip for.
 * @return {string} The tooltip for the specified command.
 */
pn.ui.edit.CommandsComponent.prototype.getCommandTooltip_ = function(cmd) {
  if (!cmd.shortcut) return cmd.name;
  var shortcuts = cmd.shortcut.split(',').pnmap(function(sc) {
    var components = sc.split('+').pnmap(function(comp) {
      return comp.toUpperCase();
    });
    return components.join(' + ');
  });
  return cmd.name + ' [' + shortcuts.join('] or [') + ']';
};


/**
 * @private
 * @param {string} id The id of the shortcut command fired.
 */
pn.ui.edit.CommandsComponent.prototype.handle_ = function(id) {
  var command = /** @type {pn.ui.edit.cmd.Command} */ (
      this.commands_.pnfind(function(c) { return c.name === id; }));

  if (!this.shouldFireCommandEvent(command)) { return; }
  this.fireCommandEvent(command, this.getCurrentFormData());
};


/**
 * @private
 * @param {pn.ui.edit.cmd.Command} command The command to attach events to.
 */
pn.ui.edit.CommandsComponent.prototype.doCommandEvent_ = function(command) {
  var button = this.commandButtons_[command.name];
  this.getHandler().listen(button, goog.events.EventType.CLICK, function() {
    if (!this.shouldFireCommandEvent(command)) { return; }
    this.fireCommandEvent(command, this.getCurrentFormData());
  });
};


/**
 * @protected
 * @param {pn.ui.edit.cmd.Command} command The command to determine
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


/** @override */
pn.ui.edit.CommandsComponent.prototype.disposeInternal = function() {
  pn.ui.edit.CommandsComponent.superClass_.disposeInternal.call(this);

  if (!this.keys_) return;

  this.commands_.pnforEach(function(cmd) {
    if (cmd.shortcut) this.keys_.unregister(cmd.name);
  }, this);
};
