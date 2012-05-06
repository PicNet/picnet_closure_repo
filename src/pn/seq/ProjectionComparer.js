
goog.provide('pn.seq.ProjectionComparer');

goog.require('pn.seq.IComparer');

/**
 * @constructor
 * @implements {pn.seq.IComparer}
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {!function(*,*):number} comparer The comparer.
 */

pn.seq.ProjectionComparer = function(keySelector, comparer) {
  /**
   * @private
   * @type {!function(*):*}
   */
  this.keySelector_ = keySelector;

  /**
   * @private
   * @type {!function(*,*):number}
   */
  this.comparer_ = comparer;
};


/** @inheritDoc */
pn.seq.ProjectionComparer.prototype.compare = function(x, y) {
  var x1 = this.keySelector_(x);
  var y1 = this.keySelector_(y);
  return this.comparer_(x1, y1);
};
