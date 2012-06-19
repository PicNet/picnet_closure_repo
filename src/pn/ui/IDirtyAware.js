;
goog.provide('pn.ui.IDirtyAware');



/** @interface */
pn.ui.IDirtyAware = function() {};


/** @return {boolean} Wether the current edit screen is dirty. */
pn.ui.IDirtyAware.prototype.isDirty = function() {};


/** Resets the dirty state of the current view */
pn.ui.IDirtyAware.prototype.resetDirty = function() {};

