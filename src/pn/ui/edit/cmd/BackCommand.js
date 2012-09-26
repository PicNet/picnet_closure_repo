;
goog.provide('pn.ui.edit.cmd.BackCommand');

goog.require('pn.ui.edit.cmd.Command');



/**
 * @constructor
 * @extends {pn.ui.edit.cmd.Command}
 */
pn.ui.edit.cmd.BackCommand = function() {
  pn.ui.edit.cmd.Command.call(this, 'Back', pn.app.AppEvents.ENTITY_CANCEL);
  this.shortcut = 'esc';
};
goog.inherits(pn.ui.edit.cmd.BackCommand, pn.ui.edit.cmd.Command);
