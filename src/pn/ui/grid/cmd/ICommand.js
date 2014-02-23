;
goog.provide('pn.ui.grid.cmd.ICommand');



/**
 * @interface
 */
pn.ui.grid.cmd.ICommand = goog.nullFunction;


/**
 * @type {string}
 */
pn.ui.grid.cmd.ICommand.prototype.eventType;


/**
 * @type {boolean}
 */
pn.ui.grid.cmd.ICommand.prototype.visibleOnEmpty;


/**
 * @type {boolean}
 */
pn.ui.grid.cmd.ICommand.prototype.visibleOnReadOnly;
