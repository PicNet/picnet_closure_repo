
goog.provide('pn');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.functions');

/**
 * @private
 * @param {Arguments} args The arguments object to prepend 'this' to.
 * @return {!Array} The array of the given arguments with this prepended to
 *    the beggining of the array.
 */
Object.prototype.aargs_ = function(args) {
  var arr = Array.prototype.slice.call(args);
  arr.splice(0, 0, this);
  return arr;
};

////////////////////////////////////////////////////////////////////////////////
// Array prototype enhancements
////////////////////////////////////////////////////////////////////////////////

/**
 * @see goog.array.concat
 * @this {Array}
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array} The new resultant array.
 */
Array.prototype.pnconcat = function() {
  return goog.array.concat.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.map
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):?} f The function to call for every
 *     element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return something. The result will be inserted into a new array.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array with the results from f.
 * @template T,S
 */
Array.prototype.pnmap = function() {
  return goog.array.map.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.forEach
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this: S, T, number, ?): ?} f The function to call for every
 *     element.
 *     This function takes 3 arguments (the element, the index and the array).
 *     The return value is ignored. The function is called only for indexes of
 *     the array which have assigned values; it is not called for indexes which
 *     have been deleted or which have never been assigned values.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @template T,S
 */
Array.prototype.pnforEach = function() {
  goog.array.forEach.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.filter
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array in which only elements that passed the test are
 *     present.
 * @template T,S
 */
Array.prototype.pnfilter = function() {
  return goog.array.filter.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.reduce
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, R, T, number, ?) : R} f The function to call for
 *     every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {?} val The initial value to pass into the function on the first call.
 * @param {S=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {R} Result of evaluating f repeatedly across the values of the array.
 * @template T,S,R
 */
Array.prototype.pnreduce = function() {
  return goog.array.reduce.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.every
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} false if any element fails the test.
 * @template T,S
 */
Array.prototype.pnall = function() {
  return goog.array.every.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.findIndex
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the first array element that passes the test,
 *     or -1 if no element is found.
 * @template T,S
 */
Array.prototype.pnany = function() {
  return goog.array.findIndex.apply(null, this.aargs_(arguments)) >= 0;
};

/**
 * @see goog.array.filter
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array in which only elements that passed the test are
 *     present.
 * @template T,S
 */
Array.prototype.pnsingle = function() {  
  var arr = this;
  if (arguments.length) { arr = this.pnfilter.apply(this, arguments); }
  if (arr.length !== 1) 
    throw 'Expected single match got: ' + filtered.length;
  return arr[0];
};

/**
 * @see goog.array.filter
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array in which only elements that passed the test are
 *     present.
 * @template T,S
 */
Array.prototype.pnfirst = function() {
  var arr = this;
  if (arguments.length) { arr = this.pnfilter.apply(this, arguments); }
  if (arr.length < 1) throw 'Expected at least one element';  
  return arr[0];
};

/**
 * @see goog.array.filter
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array in which only elements that passed the test are
 *     present.
 * @template T,S
 */
Array.prototype.pnlast = function() {
  var arr = this;
  if (arguments.length) { arr = this.pnfilter.apply(this, arguments); }
  if (arr.length < 1) throw 'Expected at least one element';  
  return arr[arr.length - 1];
};

/**
 * @see goog.array.equals
 * @this {goog.array.ArrayLike} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
Array.prototype.pnequals = function() {
  return goog.array.equals.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.contains
 * @this {goog.array.ArrayLike} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
Array.prototype.pncontains = function() {
  return goog.array.contains.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.find
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {T} The first array element that passes the test, or null if no
 *     element is found.
 * @template T,S
 */
Array.prototype.pnfind = function() {
  return goog.array.find.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.findIndex
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the first array element that passes the test,
 *     or -1 if no element is found.
 * @template T,S
 */
Array.prototype.pnfindIndex = function() {
  return goog.array.findIndex.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.reduce
 * @this {goog.array.ArrayLike} arr The array to test.
 * @return {boolean} true if empty.
 */
Array.prototype.pnisEmpty = function() {
  return goog.array.isEmpty.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.array.zip
 * @this {...!goog.array.ArrayLike} var_args Arrays to be combined.
 * @return {!Array.<!Array>} A new array of arrays created from provided arrays.
 */
Array.prototype.pnzip = function() {
  return goog.array.zip.apply(null, this.aargs_(arguments));
};

/**
  * @this {goog.array.ArrayLike} arr The array to reverse.
 */
Array.prototype.pnreverse = function() {
  var arr = this.slice();
  arr.reverse();
  return arr;
};

////////////////////////////////////////////////////////////////////////////////
// Function prototype enhancements
////////////////////////////////////////////////////////////////////////////////

/**
 * @see goog.bind
 * @this {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @suppress {deprecated} See above.
 */
Function.prototype.pnbind = function() {
  return goog.bind.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.partial
 * @this {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
Function.prototype.pnpartial = function() {
  return goog.partial.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.functions.compose
 * @this {Function} The initial function to add to the composition.
 * @this {...Function} var_args A list of functions.
 * @return {!Function} The composition of all inputs.
 */
Function.prototype.pncompose = function() {
  var args = this.aargs_(arguments).pnreverse();
  return goog.functions.compose.apply(null, args);
};

/**
 * @see goog.functions.and
 * @this {Function} The initial function to include in the test.
 * @param {...Function} var_args A list of functions.
 * @return {!Function} A function that ANDs its component functions.
 */
Function.prototype.pnand = function() {
  return goog.functions.and.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.functions.not
 * @this {Function} The initial function to include in the test.
 * @param {!Function} f The original function.
 * @return {!Function} A function that delegates to f and returns opposite.
 */
Function.prototype.pnnot = function() {
  return goog.functions.not.apply(null, this.aargs_(arguments));
};

/**
 * @see goog.functions.or
 * @this {Function} The initial function to include in the test.
 * @param {...Function} var_args A list of functions.
 * @return {!Function} A function that ORs its component functions.
 */
Function.prototype.pnor = function() {
  return goog.functions.or.apply(null, this.aargs_(arguments));
};

/**
 * @this {Function} The function whose arguments we will flip
 * @return {!Function} A function with flipped arguments.
 */
Function.prototype.pnflip = function() {
  var f = this;
  return function() {
    var args = Array.prototype.slice.call(arguments);
    return f.apply(this, args.reverse());
  };
};