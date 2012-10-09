;
goog.provide('pn.alg.heapsort');

goog.require('goog.array');



/**
 * @constructor
 * @param {!Array} arr The array to sort using HeapSort algorithm.
 *    @see https://class.coursera.org/algs4partI-2012-001/lecture/41
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.heapsort = function(arr, opt_comparer) {
  /**
   * @private
   * @type {!Array}
   */
  this.arr_ = arr;

  /**
   * @private
   * @type {number}
   */
  this.size_ = arr.length;

  /**
   * @private
   * @type {function(*, *):number}
   */
  this.comparer_ = opt_comparer || goog.array.defaultCompare;
};


/** Sorts the array */
pn.alg.heapsort.prototype.sort = function() {
  for (var k = this.size_ / 2; k >= 1; k--)
    this.sink_(k, this.size_);
  while (this.size_ > 1) {
    this.exch_(1, this.size_--);
    this.sink_(1);
  }
};


/**
 * @private
 * @param {number} k The index of the node to sink.
 */
pn.alg.heapsort.prototype.sink_ = function(k) {
  while (2 * k <= this.size_) {
    var j = 2 * k;
    if (j < this.size_ && this.less_(j, j + 1)) j++;
    if (!this.less_(k, j)) break;
    this.exch_(k, j);
    k = j;
  }
};


/**
 * @private
 * @param {number} i The index of the first node to compare.
 * @param {number} j The index of the second node to compare.
 * @return {boolean} Wether i is less than j.
 */
pn.alg.heapsort.prototype.less_ = function(i, j) {
  return this.comparer_(this.arr_[i - 1], this.arr_[j - 1]) < 0;
};


/**
 * @private
 * @param {number} i The index of the first node to exchange.
 * @param {number} j The index of the second node to exchange.
 */
pn.alg.heapsort.prototype.exch_ = function(i, j) {
  var swap = this.arr_[i - 1];
  this.arr_[i - 1] = this.arr_[j - 1];
  this.arr_[j - 1] = swap;
};
