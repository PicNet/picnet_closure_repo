;
goog.provide('pn.ui.IDirtyAware');



/** @interface */
pn.ui.IDirtyAware = goog.nullFunction;


/** @return {boolean} Wether the current edit screen is dirty. */
pn.ui.IDirtyAware.prototype.isDirty = goog.nullFunction;


/** Resets the dirty state of the current view */
pn.ui.IDirtyAware.prototype.resetDirty = goog.nullFunction;

