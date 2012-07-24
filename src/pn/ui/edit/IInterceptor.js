
goog.provide('pn.ui.edit.IInterceptor');

/**
 * @interface
 */
pn.ui.edit.IInterceptor = function() {};

/** 
 * Called when the Edit component is fully initialsed.
 * @param {!Object} entity The entity being edited.
 */
pn.ui.edit.IInterceptor.prototype.init = function(entity) {};