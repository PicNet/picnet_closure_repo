
goog.provide('pn.seq');

goog.require('goog.array');
goog.require('goog.asserts');

/**
 * @constructor
 * @param {!Array.<*>} source The source array
 */
pn.seq = function(source) {
  goog.asserts.assert(goog.isDefAndNotNull(source));
  goog.asserts.assert(goog.isArrayLike(source));
  
  /**
   * @protected
   * @type {!Array.<*>}
   */
  this.array = source;
}; 

/** 
 * @private
 * @const
 * @type {!pn.seq}
 */
pn.seq.EMPTY_ = new pn.seq([]);

/** 
 * Generates an empty sequence.
 * @return {!pn.seq} A singleton empty sequence.
 */
pn.seq.empty = function() { return pn.seq.EMPTY_; };

/** 
 * Generates a sequence of integral numbers within a specified range
 * @param {number} start The value of the first integer in the sequence 
 * @param {number} count The number of sequential integers to generate
 * @return {!pn.seq} The created sequence.
 */
pn.seq.range = function(start, count) {
  goog.asserts.assert(start >= 0);
  goog.asserts.assert(count >= 0);  
  var arr = [],
      limit = start + count;  
  for (var i = start; i < limit; i++) { arr.push(i); }  
  return new pn.seq(arr);
};

/** 
 * Generates a sequence that contains one repeated value
 * @param {*} element The value to be repeated 
 * @param {number} count The number of times to repeat the value in the generated sequence
 * @return {!pn.seq} The created sequence.
 */
pn.seq.repeat = function(element, count) {  
  goog.asserts.assert(count >= 0);
  var arr = [];
  for (var i = 0; i < count; i++) { arr.push(element); }
  return new pn.seq(arr);
};
 
/**
 * The where clause is used in a query expression to specify which elements 
 * from the data source will be returned in the query expression. It applies a 
 * Boolean condition (predicate) to each source element (referenced by the 
 * range variable) and returns those for which the specified condition is true. 
 * A single query expression may contain multiple where clauses and a single 
 * clause may contain multiple predicate subexpressions.
 *
 * @param {function(*,number=):boolean}  predicate The predicate to use when 
 *    filtering the sequence.  This predicate closure can take an optional
 *    index of the element being filtered.
 * @param {Object=} opt_obj The optional context object to use when calling the 
 *    predicate function
 * @return {!pn.seq} The filtered sequence.  Note: The input sequence is
 *    never modified.
 */
pn.seq.prototype.where = function(predicate, opt_obj) {
  goog.asserts.assert(goog.isDefAndNotNull(predicate));
  return new pn.seq(goog.array.filter(this.array, predicate, opt_obj));
};

/**
 * In a query expression, the select clause specifies the type of values that 
 * will be produced when the query is executed. The result is based on the 
 * evaluation of all the previous clauses and on any expressions in the select 
 * clause itself. A query expression must terminate with either a select 
 * clause or a group clause.
 *
 * @param {function(*,number=):boolean}  predicate The predicate to use when 
 *    filtering the sequence.  This predicate closure can take an optional
 *    index of the element being filtered.
 * @param {Object=} opt_obj The optional context object to use when calling the 
 *    predicate function
 * @return {!pn.seq} The modified sequence.  Note: The input sequence is
 *    never modified. 
 */
pn.seq.prototype.select = function(predicate, opt_obj) {
  goog.asserts.assert(goog.isDefAndNotNull(predicate));
  return new pn.seq(goog.array.map(this.array, predicate, opt_obj));
};

/** 
 * Gets the length of the given sequence with an optional filtering predicate.
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when counting the sequence.  
 * @param {Object=} opt_obj The optional context object to use when calling the 
 *    predicate function
 * @return {!number} The length of the sequence.
 */
pn.seq.prototype.count = function(opt_predicate, opt_obj) {
  if (!opt_predicate) return this.array.length;
  return this.where(opt_predicate, opt_obj).array.length;  
};


/** 
 * Creates a new sequance by concatenating 2 or more sequences
 * @param {...(pn.seq|Array)} var_args The arrays or sequences to 
 *    concatenate.
 */
pn.seq.prototype.concat = function(var_args) {
  goog.asserts.assert(arguments.length > 0);
  var arrays = [this.array];
  for (var i = 0, limit = arguments.length; i < limit; i++) {
    var arg = arguments[i];
    if (goog.isArrayLike(arg)) arrays.push(arg);
    else if (arg.array) arrays.push(arg.array);
    else {
      var err = 'Concat only supports elements of type pn.seq or an array.';
      throw new Error(err);
    }
  }    
  return new pn.seq(goog.array.concat.apply(null, arrays));
};

/**
 * Projects each element of a sequence to an IEnumerable(Of T) and flattens 
 * the resulting sequences into one sequence.
 * @param {function(*,number=):Array}  collectionSelector A transform function 
 *    to apply to each source element; the second parameter of the function 
 *    represents the index of the source element
 * @param {function(*, *):*} opt_resultSelector A transform function to apply 
 *    to each element of the intermediate sequence
 */
pn.seq.prototype.selectMany = function(collectionSelector, opt_resultSelector) {
  goog.asserts.assert(collectionSelector);
  
  var arr = [];
  for (var i = 0, limit = this.array.length; i < limit; i++) {
    var elem = this.array[i];
    var earr = collectionSelector(elem, i);    
    if (earr.array) earr = earr.array;    
    for (var j = 0, elimit = earr.length; j < elimit; j++) {
      var e = earr[j];
      if (opt_resultSelector) e = opt_resultSelector(elem, e);
      arr.push(e);
    }
  }
  return new pn.seq(arr);
};

/**
 * Determines whether any element of a sequence exists or satisfies 
 *    a condition
 *
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {boolean} Whether any element of a sequence exists or satisfies 
 *    a condition
 */
pn.seq.prototype.any = function(opt_predicate) {
  if (!opt_predicate) return this.array.length > 0;
  for (var i = 0, limit = this.array.length; i < limit; i++) {
    if (opt_predicate(this.array[i], i)) return true;
  }
  return false;
};

/**
 * Determines whether all elements of a sequence satisfy a condition.
 *
 * @param {function(*,number=):boolean}  predicate The predicate use when 
 *    testing the sequence.  
 * @return {boolean} Whether all elements of a sequence satisfy a condition
 */
pn.seq.prototype.all = function(predicate) {  
  goog.asserts.assert(predicate);
  for (var i = 0, limit = this.array.length; i < limit; i++) {
    if (!predicate(this.array[i], i)) return false;
  }
  return true;
};

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The first element in the list or the first element matching 
 *    the predicate
 */
pn.seq.prototype.first = function(opt_predicate) {
  return this.firstImpl_(true, opt_predicate);
};

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The first element in the list or the first element matching 
 *    the predicate. Null if no element is matched.
 */
pn.seq.prototype.firstOrNull = function(opt_predicate) {
  return this.firstImpl_(false, opt_predicate);
};

/**
 * @private
 * @param {boolean} throwOnNotMatch Wether to allow none matches (and return 
 *    null)
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The first element in the list or the first element matching 
 *    the predicate. Null if no element is matched.
 */
pn.seq.prototype.firstImpl_ = function(throwOnNotMatch, opt_predicate) {
  if (this.array.length === 0) {
    if (throwOnNotMatch) throw new Error('Empty list not allowed');
    return null;
  }
  if (!opt_predicate) return this.array[0];
  for (var i = 0, limit = this.array.length; i < limit; i++) {
    var e = this.array[i];
    if (opt_predicate(e, i)) return e;
  }
  if (throwOnNotMatch) 
    throw new Error('There is no element that matches the predicate');
  return null;
}

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The only element in the list or the first element matching 
 *    the predicate.
 */
pn.seq.prototype.single = function(opt_predicate) {
  return this.singleImpl_(true, opt_predicate);
};

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The only element in the list or the first element matching 
 *    the predicate. Null if no element is matched.
 */
pn.seq.prototype.singleOrNull = function(opt_predicate) {
  return this.singleImpl_(false, opt_predicate);
};

/**
 * @private
 * @param {boolean} throwOnNotMatch Wether to allow none matches (and return 
 *    null)
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The only element in the list or the only element matching 
 *    the predicate. Null if no element is matched.
 */
pn.seq.prototype.singleImpl_ = function(throwOnNotMatch, opt_predicate) {
  if (this.array.length === 0) {
    if (throwOnNotMatch) throw new Error('Empty list not allowed');
    return null;
  }
  if (!opt_predicate) {
    if (this.array.length > 1) throw new Error('Multiple items match');
    return this.array[0];
  }
  var found = undefined;
  for (var i = 0, limit = this.array.length; i < limit; i++) {
    var e = this.array[i];
    if (opt_predicate(e, i)) {
      if (found !== undefined) throw new Error('Multiple items match');
      return found = e;
    }
  }
  if (throwOnNotMatch && found === undefined) 
    throw new Error('There is no element that matches the predicate');
  return found;
}

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The last element in the list or the first element matching 
 *    the predicate. 
 */
pn.seq.prototype.last = function(opt_predicate) {
  return this.lastImpl_(true, opt_predicate);
};

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The last element in the list or the first element matching 
 *    the predicate. Null if no element is matched.
 */
pn.seq.prototype.lastOrNull = function(opt_predicate) {
  return this.lastImpl_(false, opt_predicate);
};

/**
 * @private
 * @param {boolean} throwOnNotMatch Wether to allow none matches (and return 
 *    null)
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.   
 * @return {*} The last element in the list or the last element matching 
 *    the predicate. Null if no element is matched.
 */
pn.seq.prototype.lastImpl_ = function(throwOnNotMatch, opt_predicate) {
  if (this.array.length === 0) {
    if (throwOnNotMatch) throw new Error('Empty list not allowed');
    return null;
  }
  if (!opt_predicate) return this.array[this.array.length - 1];
  var start = this.array.length - 1;
  for (var i = start; i >= 0; i--) {
    var e = this.array[i];
    if (opt_predicate(e, i)) return e;
  }
  if (throwOnNotMatch) 
    throw new Error('There is no element that matches the predicate');
  return null;
}

/**
 * Returns the elements of the list, or a default valued singleton collection 
 *    if the sequence is empty
 *
 * @param {*=} opt_default The default value for a singleton collection if 
 *    source sequence is empty
 */
pn.seq.prototype.defaultIfEmpty = function(opt_default) {
  if (this.array.length === 0) { 
    var val = opt_default === undefined ? null : opt_default;
    return new pn.seq([val]); 
  }
  return this;
};

/**
 * Applies an accumulator function over a sequence. The specified seed value 
 * is used as the initial accumulator value, and the specified function is 
 * used to select the result value.
 *
 * @param {*} seed The initial seed 
 * @param {function(*, *):*} accum The accumulator function that takes the 
 *    current accumulated value and the next value to accumulate
 * @param {function(*):*=} opt_projection The optional projection to use on the
 *    final accumulated value
 */
pn.seq.prototype.aggregate = function(seed, accum, opt_projection) {
  if (!goog.isDefAndNotNull(seed)) throw new Error('Seed is not specified');
  if (!goog.isDefAndNotNull(accum)) 
    throw new Error('Accumulattor is not specified');    
  var reduced = goog.array.reduce(this.array, accum, seed);
  if (opt_projection) reduced = opt_projection(reduced);
  return reduced;
};

/**
 * Returns distinct elements from a sequence by using a specified comparer 
 *    to compare values
 * 
 * @param {function(*, *):boolean=} opt_comparer The optional comparer to use
 *    when comparing items in the sequence.
 */
pn.seq.prototype.distinct = function(opt_comparer) {
  var result = [];
  if (!opt_comparer) {
    goog.array.removeDuplicates(this.array, result);
    return new pn.seq(result);
  }    
  for (var i = 0, limit = this.array.length; i < limit; i++) {
    var e = this.array[i];
    if (goog.array.findIndex(result, function(e2) { 
      return opt_comparer(e2, e); 
    }) < 0) { result.push(e); }    
  }
  return new pn.seq(result);
};