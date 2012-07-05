;
goog.provide('pn.ui.edit.cmd.CancelCommand');

goog.require('pn.ui.edit.cmd.Command');



/**
 * @constructor
 * @extends {pn.ui.edit.cmd.Command}
 */
pn.ui.edit.cmd.CancelCommand = function() {
  pn.ui.edit.cmd.Command.call(this, 'Cancel', pn.app.AppEvents.ENTITY_CANCEL);
  this.shortcut = 'esc';
};
goog.inherits(pn.ui.edit.cmd.CancelCommand, pn.ui.edit.cmd.Command);
