
goog.provide('pn.seq.ReverseComparer');

goog.require('pn.seq.IComparer');



/**
 * @constructor
 * @implements {pn.seq.IComparer}
 * @param {!pn.seq.IComparer} comparer The comparer to reverse.
 */
pn.seq.ReverseComparer = function(comparer) {
  this.comparer_ = comparer;
};


/** @inheritDoc */
pn.seq.ReverseComparer.prototype.compare = function(x, y) {
  return this.comparer_.compare(y, x); // Reverse args
};
