;
goog.provide('pn.alg.sort');

goog.require('goog.array');
goog.require('pn');


/**
 * @param {!Array} arr The array to sort using Selection algorithm.  The
 *    selection algorithm is the most naive implementation of sort in this
 *    library and simply finds the lowest value in the array and places it in
 *    the current lowest index and then continues to the next.  It runs in
 *    quadratic time (N^2/2) and should be avoided.
 *    @see https://class.coursera.org/algs4partI-2012-001/lecture/25
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.sort.selection = function(arr, opt_comparer) {
  pn.assArr(arr);
  pn.ass(!goog.isDef(opt_comparer) || goog.isFunction(opt_comparer));

  var less = pn.alg.sort.less_;
  var exch = pn.alg.sort.exch_;

  for (var i = 0, len = arr.length; i < len; i++) {
    var minv = arr[i],
        minidx = i;
    for (var j = i + 1; j < len; j++) {
      var jv = arr[j];
      if (less(jv, minv, opt_comparer)) {
        minv = jv;
        minidx = j;
      }
    }
    exch(arr, i, minidx);
  }
  pn.ass(goog.array.isSorted(arr, opt_comparer));
};


/**
 * @param {!Array} arr The array to sort using Insertion algorithm.  The
 *    insertion algorithm starts at the beggining of the array and working to
 *    the right moves each item to the left whilst being less than the item
 *    before it.  This algorithm is easy to understand if visualised.
 *    @see https://class.coursera.org/algs4partI-2012-001/lecture/26
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.sort.insertion = function(arr, opt_comparer) {
  pn.assArr(arr);
  pn.ass(!goog.isDef(opt_comparer) || goog.isFunction(opt_comparer));

  var less = pn.alg.sort.less_;
  var exch = pn.alg.sort.exch_;

  for (var i = 1, len = arr.length; i < len; i++) {
    for (var j = i; j > 0; j--) {
      if (!less(arr[j], arr[j - 1], opt_comparer)) { break; }
      exch(arr, j, j - 1);
    }
  }
  pn.ass(goog.array.isSorted(arr, opt_comparer));
};


/**
 * @param {!Array} arr The array to sort using Shell algorithm.  Sorts the array
 *    using H-Sorting of the array, which is a long range Insertion sort that
 *    does this over decreasing ranges.
 *    @see https://class.coursera.org/algs4partI-2012-001/lecture/27
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.sort.shell = function(arr, opt_comparer) {
  pn.assArr(arr);
  pn.ass(!goog.isDef(opt_comparer) || goog.isFunction(opt_comparer));

  var less = pn.alg.sort.less_;
  var exch = pn.alg.sort.exch_;

  var len = arr.length;
  var h = 1;
  while (h < len / 3) h = 3 * h + 1;

  while (h >= 1) {
    for (var i = h; i < len; i++) {
      for (var j = i; j >= h; j -= h) {
        if (!less(arr[j], arr[j - h], opt_comparer)) break;
        exch(arr, j, j - h);
      }
    }
    h = Math.floor(h / 3);
  }
  pn.ass(goog.array.isSorted(arr, opt_comparer));
};


/**
 * @param {!Array} arr The array to sort using Merge algorithm.  Merge sort
 *    recursively splits an array in 2 and merges those halves.  Those halves
 *    are then sorted.
 *    @see https://class.coursera.org/algs4partI-2012-001/lecture/30
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.sort.merge = function(arr, opt_comparer) {
  var aux = new Array(arr.length);
  pn.alg.sort.mergeSort_(arr, aux, 0, arr.length - 1, opt_comparer);
};


/**
 * @param {!Array} arr The array to sort using Quick algorithm.  Quick sort
 *    recursively partitions then sorts an array.
 *    @see https://class.coursera.org/algs4partI-2012-001/lecture/35
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.sort.quick = function(arr, opt_comparer, opt_shuffle) {
  var shuffle = goog.isDef(opt_shuffle) ? opt_shuffle : true;
  if (shuffle) goog.array.shuffle(arr);
  pn.alg.sort.quickSort_(arr, 0, arr.length - 1, opt_comparer);
};


/**
 * @private
 * @param {!Array} arr The array that is split into two halves.  lo-mid and
 *    mid+1 - hi.
 * @param {number} lo The 0th index of the left half of the array.
 * @param {number} hi The end index of the right half of the array.
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.sort.quickSort_ = function(arr, lo, hi, opt_comparer) {
  pn.assArr(arr);
  pn.assNum(lo);
  pn.assNum(hi);
  if (hi <= lo) return;
  pn.ass(lo >= 0 && lo < arr.length, 'Invalid array index: %s', lo);
  pn.ass(hi >= 0 && hi < arr.length, 'Invalid array index: %s', hi);

  var j = pn.alg.sort.quickPartition_(arr, lo, hi, opt_comparer);
  pn.alg.sort.quickSort_(arr, lo, j - 1, opt_comparer);
  pn.alg.sort.quickSort_(arr, j + 1, hi, opt_comparer);
};


/**
 * @private
 * @param {!Array} arr The array that is split into two halves.  lo-mid and
 *    mid+1 - hi.
 * @param {number} lo The 0th index of the left half of the array.
 * @param {number} hi The end index of the right half of the array.
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 * @return {number} The index of the partitioned element.
 */
pn.alg.sort.quickPartition_ = function(arr, lo, hi, opt_comparer) {
  pn.assArr(arr);
  pn.assNum(lo);
  pn.assNum(hi);
  pn.ass(lo >= 0 && lo < arr.length, 'Invalid array index: %s', lo);
  pn.ass(hi >= 0 && hi < arr.length, 'Invalid array index: %s', hi);

  var i = lo,
      j = hi + 1,
      less = pn.alg.sort.less_,
      exch = pn.alg.sort.exch_;
  while (true) {
    while (less(arr[++i], arr[lo], opt_comparer))
      if (i === hi) break;
      while (less(arr[lo], arr[--j], opt_comparer))
        if (j === lo) break;
        if (i >= j) break;
        exch(arr, i, j);
  }
  exch(arr, lo, j);
  return j;
};


/**
 * @private
 * @param {!Array} arr The array that is split into two halves.  lo-mid and
 *    mid+1 - hi.
 * @param {!Array} aux A copy of the arr.
 * @param {number} lo The 0th index of the left half of the array.
 * @param {number} hi The end index of the right half of the array.
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.sort.mergeSort_ = function(arr, aux, lo, hi, opt_comparer) {
  pn.assArr(arr);
  pn.assArr(aux);
  pn.ass(arr.length === aux.length);
  pn.assNum(lo);
  pn.assNum(hi);
  pn.ass(lo >= 0 && lo < arr.length, 'Invalid array index: %s', lo);
  pn.ass(hi >= 0 && hi < arr.length, 'Invalid array index: %s', hi);

  if (hi <= lo) return;
  var mid = Math.floor(lo + ((hi - lo) / 2));
  pn.alg.sort.mergeSort_(arr, aux, lo, mid, opt_comparer);
  pn.alg.sort.mergeSort_(arr, aux, mid + 1, hi, opt_comparer);
  pn.alg.sort.mergeMerge_(arr, aux, lo, mid, hi, opt_comparer);
};


/**
 * @private
 * @param {!Array} arr The array that is split into two halves.  lo-mid and
 *    mid+1 - hi.
 * @param {!Array} aux A copy of the arr.
 * @param {number} lo The 0th index of the left half of the array.
 * @param {number} mid The end index of the left half of the array.
 * @param {number} hi The end index of the right half of the array.
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 */
pn.alg.sort.mergeMerge_ = function(arr, aux, lo, mid, hi, opt_comparer) {
  pn.assArr(arr);
  pn.assArr(aux);
  pn.ass(arr.length === aux.length);
  pn.assNum(lo);
  pn.assNum(mid);
  pn.assNum(hi);
  pn.ass(lo >= 0 && lo < arr.length, 'Invalid array index: %s', lo);
  pn.ass(mid >= 0 && mid < arr.length, 'Invalid array index: %s', mid);
  pn.ass(hi >= 0 && hi < arr.length, 'Invalid array index: %s', hi);

  var i = lo,
      j = mid + 1;
  for (var k = lo; k <= hi; k++) { // k spans from start of left to end of right
    if (i > mid) arr[k] = aux[j++]; // We have gone over the edge of left arr
    else if (j > hi) arr[k] = aux[i++]; // We have gone over edge of right arr
    // if jval < ival use jval
    else if (pn.alg.sort.less_(aux[j], aux[i], opt_comparer)) arr[k] = aux[j++];
    // Otherwise ival must be less than or eq to jval so use jval
    else arr[k] = aux[i++];
  }
};


/**
 * @private
 * @param {*} a The first element to compare.
 * @param {*} b The second element to compare.
 * @param {function(*, *):number=} opt_comparer An optional comparer function
 *    that returns 0 if values are equal, > 0 if a > b and < 0 if a < b.
 * @return {boolean} Wether a is less than b.
 */
pn.alg.sort.less_ = function(a, b, opt_comparer) {
  if (!opt_comparer) return a < b;
  return opt_comparer(a, b) < 0;
};


/**
 * @private
 * @param {!Array} arr The array to exchange elements in.
 * @param {number} a The first index to swap.
 * @param {number} b The second index to swap.
 */
pn.alg.sort.exch_ = function(arr, a, b) {
  pn.assArr(arr);
  pn.assNum(a);
  pn.assNum(b);
  pn.ass(a >= 0 && a < arr.length, 'Invalid array index: %s', a);
  pn.ass(b >= 0 && b < arr.length, 'Invalid array index: %s', b);

  if (a === b) return;
  var tmp = arr[b];
  arr[b] = arr[a];
  arr[a] = tmp;
};
