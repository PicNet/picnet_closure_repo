
goog.provide('pn.seq.IComparer');



/** @interface */
pn.seq.IComparer = function() {};


/**
 * @param {*} x The first element to compare.
 * @param {*} y The second element to compare.
 * @return {number} Wether y is greater than x (1).  (-1) if less and (0) if
 *    equals.
 */
pn.seq.IComparer.prototype.compare = function(x, y) {};
