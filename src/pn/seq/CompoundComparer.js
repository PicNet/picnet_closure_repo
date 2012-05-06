
goog.provide('pn.seq.CompoundComparer');

goog.require('pn.seq.IComparer');



/**
 * @constructor
 * @implements {pn.seq.IComparer}
 * @param {...(pn.seq.IComparer)} comparers The comparers to compound
 *    (in order).
 */
pn.seq.CompoundComparer = function(comparers) {
  /**
   * @private
   * @type {!Array.<pn.seq.IComparer>}
   */
  this.comparers_ = goog.array.clone(arguments);
};


/** @inheritDoc */
pn.seq.CompoundComparer.prototype.compare = function(x, y) {
  var res = 0;
  for (var i = 0, limit = this.comparers_.length; i < limit; i++) {
    res = this.comparers_[i].compare(x, y);
    if (res !== 0) break;
  }
  return res;
};
