;
goog.provide('pn.ui.edit.DeleteCommand');



/**
 * @constructor
 * @extends {pn.ui.edit.Command}
 */
pn.ui.edit.DeleteCommand = function() {
  pn.ui.edit.Command.call(this, 'Delete', pn.app.AppEvents.ENTITY_DELETE);

  this.preclick = function() {
    return window.confirm('Are you sure you want to delete this item?');
  };
};
goog.inherits(pn.ui.edit.DeleteCommand, pn.ui.edit.Command);
