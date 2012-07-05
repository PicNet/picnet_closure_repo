;
goog.provide('pn.ui.edit.cmd.SaveCommand');

goog.require('pn.ui.edit.cmd.Command');



/**
 * @constructor
 * @extends {pn.ui.edit.cmd.Command}
 */
pn.ui.edit.cmd.SaveCommand = function() {
  pn.ui.edit.cmd.Command.call(this, 'Save', pn.app.AppEvents.ENTITY_SAVE, true);
  this.shortcut = 'ctrl+ENTER,ctrl+s';
};
goog.inherits(pn.ui.edit.cmd.SaveCommand, pn.ui.edit.cmd.Command);
