;
goog.provide('pn.ui.edit.Config');

goog.require('pn.ui.BaseConfig');

goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.DeleteCommand');



/**
 * @constructor
 * @extends {pn.ui.BaseConfig}
 * @param {!Array.<pn.ui.edit.Field>} fieldSpecs An array of field meta
 *    specifications that describe how each of the display fields should be
 *    displayed, captioned and validated.
 * @param {Array.<pn.ui.edit.Command>=} opt_commands An optional commands array
 *    which can also be empty. If not defined then a default set of commands
 *    are used.
 * @param {function(?):string=} opt_template The optional template to render
 *    this edit control.
  * @param {pn.ui.edit.Interceptor=} opt_interceptor The optional interceptor
  *   used to receive and intercept lifecycle events.
 */
pn.ui.edit.Config =
    function(fieldSpecs, opt_commands, opt_template, opt_interceptor) {
  goog.asserts.assert(fieldSpecs);

  pn.ui.BaseConfig.call(this, fieldSpecs);

  /** @type {!Array.<pn.ui.edit.Field>} */
  this.fieldSpecs = fieldSpecs;

  /** @type {!Array.<pn.ui.edit.Command>} */
  this.commands = opt_commands || this.getDefaultCommands_();

  /** @type {null|function(?):string} */
  this.template = opt_template || null;

  /** @type {!pn.ui.edit.Interceptor} */
  this.interceptor = opt_interceptor || new pn.ui.edit.Interceptor();

  /** @type {boolean} */
  this.autoFocus = true;
};
goog.inherits(pn.ui.edit.Config, pn.ui.BaseConfig);


/**
 * @private
 * @return {!Array.<pn.ui.edit.Command>} The default commands used when no
 *    opt_commands are passed into the constructor.
 */
pn.ui.edit.Config.prototype.getDefaultCommands_ = function() {
  return [
    new pn.ui.edit.Command('Save', pn.ui.edit.Edit.EventType.SAVE, true),
    new pn.ui.edit.Command('Clone', pn.ui.edit.Edit.EventType.CLONE),
    new pn.ui.edit.DeleteCommand(),
    new pn.ui.edit.Command('Cancel', pn.ui.edit.Edit.EventType.CANCEL)
  ];
};


/** @inheritDoc */
pn.ui.edit.Config.prototype.disposeInternal = function() {
  pn.ui.edit.Config.superClass_.disposeInternal.call(this);

  delete this.fieldSpecs;
  delete this.commands;
  delete this.template;

  goog.dispose(this.interceptor);
  delete this.interceptor;
};
