;
goog.provide('pn');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.functions');
goog.require('goog.object');
goog.require('goog.string');

////////////////////////////////////////////////////////////////////////////////
// Misc Static Convenience Helpers
////////////////////////////////////////////////////////////////////////////////


/**
 * @param {!goog.array.ArrayLike} args The arguments (or any
 *    array like) object to turn into an array.
 * @return {!Array} The array object from the given arguments object.
 */
pn.toarr = function(args) { return goog.array.clone(args); };

////////////////////////////////////////////////////////////////////////////////
// Assertion Helpers
////////////////////////////////////////////////////////////////////////////////


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.ass = function(condition, opt_message, var_args) {
  goog.asserts.assert.apply(null, arguments);
};


/**
 * @param {*} val The value to check for the type.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assStr = function(val, opt_message, var_args) 
    { pn.assType_(goog.isString, arguments, 'string'); };


/**
 * @param {*} val The value to check for the type.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assNum = function(val, opt_message, var_args) 
    { pn.assType_(goog.isNumber, arguments, 'number'); };


/**
 * @param {*} val The value to check for the type.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assInt = function(val) {
  var num = val;
  pn.assType_(goog.isNumber, arguments, 'number');
  pn.ass(/^\d+$/.test(num), 'val %s is not an integer', num);
};


/**
 * @param {*} val The value to check for the type.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assPosInt = function(val) {
  var num = val;
  pn.assType_(goog.isNumber, arguments, 'number');
  pn.ass(/^\d+$/.test(num), 'val %s is not an integer', num);
  pn.ass(/** @type {number} */ (num) > 0, 'val %s is not greater than 0', num);
};


/**
 * @param {*} val The value to check for the type.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assBool = function(val, opt_message, var_args) 
    { pn.assType_(goog.isBoolean, arguments, 'boolean'); };


/**
 * @param {*} val The value to check for the type.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assObj = function(val, opt_message, var_args) 
    { pn.assType_(goog.isObject, arguments, 'object'); };


/**
 * @param {*} val The value to check for the type.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assArr = function(val, opt_message, var_args) 
    { pn.assType_(goog.isArray, arguments, 'array'); };


/**
 * @param {*} val The value to check for the type.
 * @param {Function} ctor The expected type to do an instanceof check on the
 *    first element.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assArrInst = function(val, ctor) {
  pn.assArr(val);
  pn.ass(val.length > 0, 'Empty array');
  pn.assInst(val[0], ctor);
};


/**
 * @param {*} val The value to check for the type.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assFun = function(val, opt_message, var_args) 
    { pn.assType_(goog.isFunction, arguments, 'function'); };


/**
 * @param {*} val The value to check for the type.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assDefAndNotNull = function(val, opt_message, var_args) 
    { pn.assType_(goog.isDefAndNotNull, arguments, 'defined and not null'); };


/**
 * @param {*} val The value to check for the type.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assDef = function(val, opt_message, var_args) 
    { pn.assType_(goog.isDef, arguments, 'defined'); };


/**
 * @param {*} val The value to check for isntanceof type.
 * @param {Function} ctor The expected type to do an instanceof check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assInst = function(val, ctor, opt_message, var_args) {
  pn.ass(val instanceof ctor, opt_message || 'Not expected type');
};


/**
 * @private
 * @param {function(*):boolean} predicate The actual function that checks the
 *    given value for matching type.
 * @param {!goog.array.ArrayLike} args The arguments passed to the original
 *    function.  These arguments should be (val, opt_message, var_args).
 * @param {string} typeName The type expected, this will be used for the
 *    default message if no other message is specified.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
pn.assType_ = function(predicate, args, typeName) {
  if (args.length === 0) args = [undefined];
  var target = args[0];
  var success = predicate(target);
  args[0] = success;
  if (!success && args.length === 1) {
    args = pn.toarr(args);
    args.push('Expected %s but was %s'.pnsubs(typeName, goog.typeOf(target)));
  }
  pn.ass.apply(null, args);
};


/**
 * @private
 * @param {!*} thiso A referece to the callers 'this' to prepend to the
 *    arguments object.
 * @param {!goog.array.ArrayLike} args The arguments object to prepend 'this'
 *    to.
 * @return {!Array} The array of the given arguments with this prepended to
 *    the beggining of the array.
 */
pn.aargs_ = function(thiso, args) {
  var arr = [thiso];
  for (var i = 0, len = args.length; i < len; i++) { arr.push(args[i]); }
  return arr;
};

////////////////////////////////////////////////////////////////////////////////
// String prototype enhancements
////////////////////////////////////////////////////////////////////////////////


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @this {string} The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
String.prototype.pnsubs = function(var_args) {
  return goog.string.subs.apply(null, pn.aargs_(this, arguments));
};

// TODO: Add pnendsWith, pnstartsWith, pnreplaceAll, pntrim

////////////////////////////////////////////////////////////////////////////////
// Array prototype enhancements
////////////////////////////////////////////////////////////////////////////////


/**
 * @see goog.array.clone
 * @this {Array.<T>} arr  Array or array-like object to clone.
 * @return {!Array.<T>} Clone of the input array.
 * @template T
 */
Array.prototype.pnclone = function() {
  return goog.array.clone(this);
};


/**
 * @see goog.array.concat
 * @this {Array}
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array} The new resultant array.
 */
Array.prototype.pnconcat = function(var_args) {
  return goog.array.concat.apply(null, pn.aargs_(this, arguments));
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
Array.prototype.pnmap = function(f, opt_obj) {
  return goog.array.map.apply(null, pn.aargs_(this, arguments));
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
Array.prototype.pnforEach = function(f, opt_obj) {
  goog.array.forEach.apply(null, pn.aargs_(this, arguments));
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
Array.prototype.pnfilter = function(f, opt_obj) {
  return goog.array.filter.apply(null, pn.aargs_(this, arguments));
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
 * @return {number} The length of the given array after applying the specified
 *    filter (if any).
 * @template T,S
 */
Array.prototype.pncount = function(f, opt_obj) {
  return goog.isFunction(f) ?
      goog.array.filter.apply(null, pn.aargs_(this, arguments)).length :
      this.length;
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
Array.prototype.pnreduce = function(f, val, opt_obj) {
  return goog.array.reduce.apply(null, pn.aargs_(this, arguments));
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
Array.prototype.pnall = function(f, opt_obj) {
  return goog.array.every.apply(null, pn.aargs_(this, arguments));
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
 * @return {boolean} Wether any element in the array matches the specified
 *    filter.
 * @template T,S
 */
Array.prototype.pnany = function(f, opt_obj) {
  return goog.array.findIndex.apply(null, pn.aargs_(this, arguments)) >= 0;
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
 * @return {!T} The only matching element or an error is thrown.
 * @template T,S
 */
Array.prototype.pnsingle = function(f, opt_obj) {
  var arr = this;
  if (arguments.length) { arr = this.pnfilter.apply(this, arguments); }
  if (arr.length !== 1) {
    throw new Error('Expected single match got: ' + arr.length);
  }
  return arr[0];
};


/**
 * @see goog.array.filter
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean=} opt_f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {T} The first matching element or an Error if no matching elements.
 * @template T,S
 */
Array.prototype.pnfirstOrNull = function(opt_f, opt_obj) {
  var arr = this;
  if (arguments.length) { arr = this.pnfilter.apply(this, arguments); }
  if (arr.length < 1) return null;
  return arr[0];
};


/**
 * @see goog.array.filter
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean=} opt_f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {T} The first matching element or an Error if no matching elements.
 * @template T,S
 */
Array.prototype.pnfirst = function(opt_f, opt_obj) {
  var arr = this;
  if (arguments.length) { arr = this.pnfilter.apply(this, arguments); }
  if (arr.length < 1) throw new Error('Expected at least one element');
  return arr[0];
};


/**
 * @see goog.array.filter
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean=} opt_f The function to
 *     call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {T} The last machine element or Error.
 * @template T,S
 */
Array.prototype.pnlastOrNull = function(opt_f, opt_obj) {
  var arr = this;
  if (arguments.length) { arr = this.pnfilter.apply(this, arguments); }
  if (arr.length < 1) return null;
  return arr[arr.length - 1];
};


/**
 * @see goog.array.filter
 * @this {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean=} opt_f The function to call
 *     for element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {T} The last machine element or Error.
 * @template T,S
 */
Array.prototype.pnlast = function(opt_f, opt_obj) {
  var arr = this;
  if (arguments.length) { arr = this.pnfilter.apply(this, arguments); }
  if (arr.length < 1) throw new Error('Expected at least one element');
  return arr[arr.length - 1];
};


/**
 * @see goog.array.equals
 * @this {Array} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
Array.prototype.pnequals = function(arr2, opt_equalsFn) {
  return goog.array.equals.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.array.contains
 * @this {Array} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
Array.prototype.pncontains = function(obj) {
  return goog.array.contains.apply(null, pn.aargs_(this, arguments));
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
Array.prototype.pnfind = function(f, opt_obj) {
  return goog.array.find.apply(null, pn.aargs_(this, arguments));
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
Array.prototype.pnfindIndex = function(f, opt_obj) {
  return goog.array.findIndex.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.array.findIndex
 * @this {Array} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at index 0.
 * @return {number} The index of the first matching array element.
 */
Array.prototype.pnindexOf = function(obj, opt_fromIndex) {
  return goog.array.indexOf.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.array.reduce
 * @this {Array} arr The array to test.
 * @return {boolean} true if empty.
 */
Array.prototype.pnisEmpty = function() {
  return goog.array.isEmpty.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.array.zip
 * @this {Array}
 * @param {...goog.array.ArrayLike} var_args Arrays to be combined.
 * @return {!Array.<!Array>} A new array of arrays created from provided arrays.
 */
Array.prototype.pnzip = function(var_args) {
  return goog.array.zip.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.array.sort
 * @this {Array.<T>} arr The array to be sorted.
 * @param {?function(T,T):number=} opt_compareFn Optional comparison
 *     function by which the
 *     array is to be ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {!Array.<T>} A reference to self array.
 * @template T
 */
Array.prototype.pnsort = function(opt_compareFn) {
  goog.array.sort.apply(null, pn.aargs_(this, arguments));
  return this;
};


/**
 * @see goog.array.sortObjectsByKey
 * @this {Array.<T>} arr An array of objects to sort.
 * @param {string} key The object key to sort by.
 * @param {Function=} opt_compareFn The function to use to compare key
 *     values.
 * @return {!Array.<T>} A reference to self array.
 * @template T
 */
Array.prototype.pnsortObjectsByKey = function(key, opt_compareFn) {
  goog.array.sortObjectsByKey.apply(null, pn.aargs_(this, arguments));
  return this;
};


/**
 * @see goog.array.remove
 * Removes the first occurrence of a particular value from an array.
 * @this {Array} The array from which to remove the specified item.
 * @param {*} obj Object to remove.
 * @return {boolean} True if an element was removed.
 */
Array.prototype.pnremove = function(obj) {
  return goog.array.remove.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.array.removeDuplicates
 * @this {!Array.<T>} arr The array from which to remove duplicates.
 * @param {Array=} opt_rv An optional array in which to return the results,
 *     instead of performing the removal inplace.  If specified, the original
 *     array will remain unchanged.
 * @return {!Array.<T>} A reference to self array.
 * @template T
 */
Array.prototype.pnremoveDuplicates = function(opt_rv) {
  goog.array.removeDuplicates.apply(null, pn.aargs_(this, arguments));
  return this;
};


/**
 * @see goog.array.removeDuplicates
 * @this {!Array.<T>} arr The array from which to remove duplicates.
 * @param {string} key The object property to use as the duplicate comparer.
 * @return {!Array.<T>} A reference to self array.
 * @template T
 */
Array.prototype.pnremoveDuplicatesByKey = function(key) {
  var added = {};
  return this.pnfilter(function(e) {
    var k = e[key];
    if (k in added) return false;
    added[k] = true;
    return true;
  });
};


/**
 * @this {Array.<T>|goog.array.ArrayLike} arr The array to reverse.
 * @return {!Array.<T>} The reversed array.
 * @template T
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
Function.prototype.pnbind = function(selfObj, var_args) {
  return goog.bind.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.partial
 * @this {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
Function.prototype.pnpartial = function(var_args) {
  return goog.partial.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.functions.compose
 * @this {Function} The initial function to add to the composition.
 * @param {...Function} var_args A list of functions.
 * @return {!Function} The composition of all inputs.
 */
Function.prototype.pncompose = function(var_args) {
  var args = pn.aargs_(this, arguments).pnreverse();
  return goog.functions.compose.apply(null, args);
};


/**
 * @see goog.functions.and
 * @this {Function} The initial function to include in the test.
 * @param {...Function} var_args A list of functions.
 * @return {!Function} A function that ANDs its component functions.
 */
Function.prototype.pnand = function(var_args) {
  return goog.functions.and.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.functions.not
 * @this {Function} The initial function to include in the test.
 * @param {!Function} f The original function.
 * @return {!Function} A function that delegates to f and returns opposite.
 */
Function.prototype.pnnot = function(f) {
  return goog.functions.not.apply(null, pn.aargs_(this, arguments));
};


/**
 * @see goog.functions.or
 * @this {Function} The initial function to include in the test.
 * @param {...Function} var_args A list of functions.
 * @return {!Function} A function that ORs its component functions.
 */
Function.prototype.pnor = function(var_args) {
  return goog.functions.or.apply(null, pn.aargs_(this, arguments));
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
