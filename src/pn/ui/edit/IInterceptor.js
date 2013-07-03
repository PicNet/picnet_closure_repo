;
goog.provide('pn.ui.edit.IInterceptor');



/**
 * @interface
 */
pn.ui.edit.IInterceptor = function() {};


/** Called when the Edit component is fully initialsed. */
pn.ui.edit.IInterceptor.prototype.init = function() { };


/** Get data for material.
 * @param {string} entity Entity for save.
 */
pn.ui.edit.IInterceptor.prototype.getData = function(entity) { };
