;
goog.provide('pn.mob.ui.ISwipeable');



/** @interface */
pn.mob.ui.ISwipeable = goog.nullFunction;


/**
 * @param {number} idx The page index being generated.
 * @return {!Element} The dom element that represents the page at the
 *    specified index.
 */
pn.mob.ui.ISwipeable.prototype.generate = goog.abstractMethod;


/** @param {number} idx The page index about to be shown. */
pn.mob.ui.ISwipeable.prototype.showing = goog.abstractMethod;
