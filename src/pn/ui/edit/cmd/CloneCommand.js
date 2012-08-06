;
goog.provide('pn.ui.edit.cmd.CloneCommand');

goog.require('pn.ui.edit.cmd.Command');



/**
 * @constructor
 * @extends {pn.ui.edit.cmd.Command}
 */
pn.ui.edit.cmd.CloneCommand = function() {
  pn.ui.edit.cmd.Command.call(
      this, 'Clone', pn.app.AppEvents.ENTITY_CLONE, true);
};
goog.inherits(pn.ui.edit.cmd.CloneCommand, pn.ui.edit.cmd.Command);
