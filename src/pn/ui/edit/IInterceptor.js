;
goog.provide('pn.ui.edit.IInterceptor');



/**
 * @interface
 */
pn.ui.edit.IInterceptor = function() {};


/** Called when the Edit component is fully initialsed. */
pn.ui.edit.IInterceptor.prototype.init = function() {};


/** @return {!Array.<string>} Any errors. */
pn.ui.edit.IInterceptor.prototype.validate = function() {};
