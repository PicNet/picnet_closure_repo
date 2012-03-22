;
goog.provide('pn.ui.edit.Config');

goog.require('pn.ui.BaseConfig');

goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.DeleteCommand');



/**
 * @constructor
 * @extends {pn.ui.BaseConfig}
 * @param {!Array.<pn.ui.edit.Field>} fields An array of field specifications
 *    that describe how each of the display fields should be displayed,
 *    captioned and validated.
 * @param {Array.<pn.ui.edit.Command>=} opt_commands An optional commands array
 *    which can also be empty. If not defined then a default set of commands
 *    are used.
 * @param {function(?):string=} opt_template The optional template to render
 *    this edit control.
 */
pn.ui.edit.Config = function(fields, opt_commands, opt_template) {
  goog.asserts.assert(fields);

  pn.ui.BaseConfig.call(this, fields);

  /** @type {!Array.<pn.ui.edit.Field>} */
  this.fields = fields;

  /** @type {!Array.<pn.ui.edit.Command>} */
  this.commands = opt_commands || this.getDefaultCommands_();

  /** @type {null|function(?):string} */
  this.template = opt_template || null;
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
