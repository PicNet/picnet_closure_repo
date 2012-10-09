;
goog.provide('pn.alg.bt');

goog.require('goog.string.StringBuffer');



/**
 * This is a heap ordered binary tree where the parent's key is no smaller than
 *    its children, i.e. The max key is always the root.  The root is found
 *    at index '1' of the internal array and the children of each node are
 *    found at idx * 2 and idx * 2 + 1.
 *    If a child node is found to have a larger key than its parent then it
 *    must swim to the top of the tree until both its children are smaller.
 * @constructor
 * @param {function(*, *):number=} opt_keyComparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.bt = function(opt_keyComparer) {
  this.arr_ = [null];
  this.size_ = 1;

  /**
   * @private
   * @type {function(*, *):number}
   */
  this.keyComparer_ = opt_keyComparer || null;
};


/**
 * @param {!pn.alg.btnode} node The node to add to the binary tree.
 */
pn.alg.bt.prototype.add = function(node) {
  pn.ass(node instanceof pn.alg.btnode);

  this.arr_[this.size_] = node;
  this.swim_(this.size_++);
};


/**
 * Deletes and returns the max element in the tree.  This is always the root
 *    element.
 * @return {!pn.alg.btnode} The maximum node just removed from this tree.
 */
pn.alg.bt.prototype.delMax = function() {
  pn.ass(this.size_ > 1, 'Tree is empty');

  var max = this.arr_[1];
  this.exch_(1, this.size_ - 1);
  this.sink_(1);
  delete this.arr_[this.size_ + 1];
  return max;
};


/** @override */
pn.alg.bt.prototype.toString = function() {
  pn.ass(this.size_ > 1, 'Tree is empty');

  var output = new goog.string.StringBuffer();
  this.appendNode_(output, 1, 0);
  return output.toString();
};


/**
 * @private
 * @param {!goog.string.StringBuffer} output The output buffer.
 * @param {number} idx The index of the node to add to the output buffer.
 * @param {number} depth The indentation depth to add to the node string.
 */
pn.alg.bt.prototype.appendNode_ = function(output, idx, depth) {
  pn.ass(output instanceof goog.string.StringBuffer);
  pn.assNum(idx);
  pn.assNum(depth);
  pn.ass(idx >= 1 && idx < this.size_);
  pn.ass(depth >= 0);

  var node = this.arr_[idx];
  pn.assDef(node);

  var left = this.arr_[idx * 2];
  var right = this.arr_[idx * 2 + 1];

  if (right) this.appendNode_(output, idx * 2 + 1, depth + 1);
  for (var i = 0; i < depth; i++) { output.append(' '); }
  output.append(node.toString() + '\n');
  if (left) this.appendNode_(output, idx * 2, depth + 1);
};


/**
 * @private
 * @param {number} idx The index of the node to swim up to its appropriate
 *    location on the tree.
 */
pn.alg.bt.prototype.swim_ = function(idx) {
  pn.ass(this.size_ > 1, 'Tree is empty');
  pn.assNum(idx);
  pn.ass(idx >= 1 && idx < this.size_);

  while (idx > 1) {
    var half = Math.floor(idx / 2);
    if (!this.less_(half, idx)) break;
    this.exch_(idx, half);
    idx = half;
  }
};


/**
 * @private
 * @param {number} idx The index of the node to sink down to its appropriate
 *    location on the tree.
 */
pn.alg.bt.prototype.sink_ = function(idx) {
  pn.ass(this.size_ > 1, 'Tree is empty');
  pn.assNum(idx);
  pn.ass(idx >= 1 && idx < this.size_);

  var len = this.size_;
  while (2 * idx <= len) {
    var j = idx * 2;
    if (j < len && this.less_(j, j + 1)) j++;
    if (!this.less_(idx, j)) break;
    this.exch_(idx, j);
    idx = j;
  }
};


/**
 * @private
 * @param {number} i1 The first index of the node to exchange.
 * @param {number} i2 The second index of the node to exchange.
 */
pn.alg.bt.prototype.exch_ = function(i1, i2) {
  pn.ass(this.size_ > 1, 'Tree is empty');
  pn.assNum(i1);
  pn.ass(i1 >= 1 && i1 < this.size_);
  pn.assNum(i2);
  //pn.ass(i2 >= 1 && i2 < this.size_);

  var tmp = this.arr_[i1];
  this.arr_[i1] = this.arr_[i2];
  this.arr_[i2] = tmp;
};


/**
 * @private
 * @param {number} i1 The first index of the node to compare.
 * @param {number} i2 The second index of the node to compare.
 * @return {boolean} Wether the node at index i1 is smaller than the node at
 *    index i2.
 */
pn.alg.bt.prototype.less_ = function(i1, i2) {
  pn.ass(this.size_ > 1, 'Tree is empty');
  pn.assNum(i1);
  pn.ass(i1 >= 1 && i1 < this.size_);
  pn.assNum(i2);
  //pn.ass(i2 >= 1 && i2 < this.size_);
  return this.arr_[i1].less(this.arr_[i2], this.keyComparer_);
};



/**
 * @constructor
 * @param {*} key The key to use.  This key must support default comparison
 *    (using > and <) as no opt_comparer is supported yet.
 * @param {*} val The value to store in this node.
 */
pn.alg.btnode = function(key, val) {
  pn.assDef(key);

  this.key = key;
  this.val = val;
};


/**
 * @param {!pn.alg.btnode} other The other node to compare.
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 * @return {boolean} Wether the this node smaller than the 'other' node.
 */
pn.alg.btnode.prototype.less = function(other, opt_comparer) {
  pn.ass(other instanceof pn.alg.btnode);

  if (!opt_comparer) return this.key < other.key;
  return opt_comparer(this.key, other.key) < 0;
};


/** @override */
pn.alg.btnode.prototype.toString = function() {
  var s = this.key;
  if (this.val && this.val !== this.key) s += ' (' + this.val.toString() + ')';
  return s;
};
