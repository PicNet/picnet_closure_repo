;
goog.provide('pn.ui.edit.cmd.DeleteCommand');

goog.require('pn.ui.edit.cmd.Command');



/**
 * @constructor
 * @extends {pn.ui.edit.cmd.Command}
 */
pn.ui.edit.cmd.DeleteCommand = function() {
  pn.ui.edit.cmd.Command.call(this, 'Delete', pn.app.AppEvents.ENTITY_DELETE);

  this.preclick = function() {
    return window.confirm('Are you sure you want to delete this item?');
  };
};
goog.inherits(pn.ui.edit.cmd.DeleteCommand, pn.ui.edit.cmd.Command);
