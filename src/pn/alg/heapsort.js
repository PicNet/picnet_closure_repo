;
goog.provide('pn.alg.heapsort');

goog.require('pn.alg.bt');


/** @param {!Array} arr The array to sort in place. */
pn.alg.heapsort.sort = function(arr) {
  arr.splice(0, 0, null); // Start the index at 1
  var bt = new pn.alg.bt();
  bt.arr_ = arr;
  bt.N_ = arr.length;
  for (var i = Math.floor(arr.length / 2); i >= 1; i--) { bt.sink_(i); }
  while (bt.N_ > 1) {
    bt.exch_(1, bt.N_--);
    bt.sink_(1, bt.N_);
  }
  arr.splice(0, 1);
};
