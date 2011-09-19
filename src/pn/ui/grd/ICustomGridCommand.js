
// goog.require('pn.ui.Grid'); // Causes Circular Dependency

goog.provide('pn.ui.ICustomGridCommand');


/**
 * @interface
 */
pn.ui.ICustomGridCommand = function() {};

/**
 * @param {!pn.ui.Grid} grid
 * @param {!Element} parent
 */
pn.ui.ICustomGridCommand.prototype.createCommandElement = function(grid, parent) {};