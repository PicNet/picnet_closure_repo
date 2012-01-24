
goog.provide('pn.seq.Seq');
goog.provide('pn.seq.Lookup');
goog.provide('pn.seq.Grouping');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.structs.Map');


/**
 * @constructor
 * @param {!Array.<*>} source The source array
 */
pn.seq.Seq = function(source) {
  goog.asserts.assert(goog.isDefAndNotNull(source));
  goog.asserts.assert(goog.isArrayLike(source));
  
  /**
   * @private
   * @type {!Array.<*>}
   */
  this.array_ = source;
}; 

/** 
 * @private
 * @const
 * @type {!pn.seq.Seq}
 */
pn.seq.Seq.EMPTY_ = new pn.seq.Seq([]);

/** 
 * Generates an empty sequence.
 * @return {!pn.seq.Seq} A singleton empty sequence.
 */
pn.seq.Seq.empty = function() { return pn.seq.Seq.EMPTY_; };

/** 
 * Generates a sequence of integral numbers within a specified range
 * @param {number} start The value of the first integer in the sequence 
 * @param {number} count The number of sequential integers to generate
 * @return {!pn.seq.Seq} The created sequence.
 */
pn.seq.Seq.range = function(start, count) {
  goog.asserts.assert(start >= 0);
  goog.asserts.assert(count >= 0);  
  var arr = [],
      limit = start + count;  
  for (var i = start; i < limit; i++) { arr.push(i); }  
  return new pn.seq.Seq(arr);
};

/** 
 * Generates a sequence that contains one repeated value
 * @param {*} element The value to be repeated 
 * @param {number} count The number of times to repeat the value in the generated sequence
 * @return {!pn.seq.Seq} The created sequence.
 */
pn.seq.Seq.repeat = function(element, count) {  
  goog.asserts.assert(count >= 0);
  var arr = [];
  for (var i = 0; i < count; i++) { arr.push(element); }
  return new pn.seq.Seq(arr);
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
 * @return {!pn.seq.Seq} The filtered sequence.  Note: The input sequence is
 *    never modified.
 */
pn.seq.Seq.prototype.where = function(predicate, opt_obj) {
  goog.asserts.assert(goog.isDefAndNotNull(predicate));
  return new pn.seq.Seq(goog.array.filter(this.array_, predicate, opt_obj));
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
 * @return {!pn.seq.Seq} The modified sequence.  Note: The input sequence is
 *    never modified. 
 */
pn.seq.Seq.prototype.select = function(predicate, opt_obj) {
  goog.asserts.assert(goog.isDefAndNotNull(predicate));
  return new pn.seq.Seq(goog.array.map(this.array_, predicate, opt_obj));
};

/** 
 * Gets the length of the given sequence with an optional filtering predicate.
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when counting the sequence.  
 * @param {Object=} opt_obj The optional context object to use when calling the 
 *    predicate function
 * @return {!number} The length of the sequence.
 */
pn.seq.Seq.prototype.count = function(opt_predicate, opt_obj) {
  if (!opt_predicate) return this.array_.length;
  return this.where(opt_predicate, opt_obj).array_.length;  
};


/** 
 * Creates a new sequance by concatenating 2 or more sequences
 * @param {...(pn.seq.Seq|Array)} var_args The arrays or sequences to 
 *    concatenate.
 */
pn.seq.Seq.prototype.concat = function(var_args) {
  goog.asserts.assert(arguments.length > 0);
  var arrays = [this.array_];
  for (var i = 0, limit = arguments.length; i < limit; i++) {
    var arg = arguments[i];
    if (goog.isArrayLike(arg)) arrays.push(arg);
    else if (arg.array_) arrays.push(arg.array_);
    else {
      var err = 'Concat only supports elements of type pn.seq.Seq or an array.';
      throw new Error(err);
    }
  }    
  return new pn.seq.Seq(goog.array.concat.apply(null, arrays));
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
pn.seq.Seq.prototype.selectMany = function(collectionSelector, opt_resultSelector) {
  goog.asserts.assert(collectionSelector);
  
  var arr = [];
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    var elem = this.array_[i];
    var earr = collectionSelector(elem, i);    
    if (earr.array_) earr = earr.array_;    
    for (var j = 0, elimit = earr.length; j < elimit; j++) {
      var e = earr[j];
      if (opt_resultSelector) e = opt_resultSelector(elem, e);
      arr.push(e);
    }
  }
  return new pn.seq.Seq(arr);
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
pn.seq.Seq.prototype.any = function(opt_predicate) {
  if (!opt_predicate) return this.array_.length > 0;
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    if (opt_predicate(this.array_[i], i)) return true;
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
pn.seq.Seq.prototype.all = function(predicate) {  
  goog.asserts.assert(predicate);
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    if (!predicate(this.array_[i], i)) return false;
  }
  return true;
};

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The first element in the list or the first element matching 
 *    the predicate
 */
pn.seq.Seq.prototype.first = function(opt_predicate) {
  return this.firstImpl_(true, opt_predicate);
};

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The first element in the list or the first element matching 
 *    the predicate. Null if no element is matched.
 */
pn.seq.Seq.prototype.firstOrNull = function(opt_predicate) {
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
pn.seq.Seq.prototype.firstImpl_ = function(throwOnNotMatch, opt_predicate) {
  if (this.array_.length === 0) {
    if (throwOnNotMatch) throw new Error('Empty list not allowed');
    return null;
  }
  if (!opt_predicate) return this.array_[0];
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    var e = this.array_[i];
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
pn.seq.Seq.prototype.single = function(opt_predicate) {
  return this.singleImpl_(true, opt_predicate);
};

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The only element in the list or the first element matching 
 *    the predicate. Null if no element is matched.
 */
pn.seq.Seq.prototype.singleOrNull = function(opt_predicate) {
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
pn.seq.Seq.prototype.singleImpl_ = function(throwOnNotMatch, opt_predicate) {
  if (this.array_.length === 0) {
    if (throwOnNotMatch) throw new Error('Empty list not allowed');
    return null;
  }
  if (!opt_predicate) {
    if (this.array_.length > 1) throw new Error('Multiple items match');
    return this.array_[0];
  }
  var found = undefined;
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    var e = this.array_[i];
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
pn.seq.Seq.prototype.last = function(opt_predicate) {
  return this.lastImpl_(true, opt_predicate);
};

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate 
 *    to use when testing the sequence.  
 * @return {*} The last element in the list or the first element matching 
 *    the predicate. Null if no element is matched.
 */
pn.seq.Seq.prototype.lastOrNull = function(opt_predicate) {
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
pn.seq.Seq.prototype.lastImpl_ = function(throwOnNotMatch, opt_predicate) {
  if (this.array_.length === 0) {
    if (throwOnNotMatch) throw new Error('Empty list not allowed');
    return null;
  }
  if (!opt_predicate) return this.array_[this.array_.length - 1];
  var start = this.array_.length - 1;
  for (var i = start; i >= 0; i--) {
    var e = this.array_[i];
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
pn.seq.Seq.prototype.defaultIfEmpty = function(opt_default) {
  if (this.array_.length === 0) { 
    var val = opt_default === undefined ? null : opt_default;
    return new pn.seq.Seq([val]); 
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
pn.seq.Seq.prototype.aggregate = function(seed, accum, opt_projection) {
  if (!goog.isDefAndNotNull(seed)) throw new Error('Seed is not specified');
  if (!goog.isDefAndNotNull(accum)) 
    throw new Error('Accumulattor is not specified');    
  var reduced = goog.array.reduce(this.array_, accum, seed);
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
pn.seq.Seq.prototype.distinct = function(opt_comparer) {
  var result = [];
  if (!opt_comparer) {
    goog.array.removeDuplicates(this.array_, result);
    return new pn.seq.Seq(result);
  }      
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    var e = this.array_[i];
    if (goog.array.findIndex(result, function(e2) { 
      return opt_comparer(e2, e); 
    }) < 0) { result.push(e); }    
  }
  return new pn.seq.Seq(result);
};

/**
 * Produces the set union of two sequences.
 * 
 * @param {!pn.seq.Seq|!Array} second The second sequence
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer
 * @return {!pn.seq.Seq} The union of the two sequences.
 */
pn.seq.Seq.prototype.union = function(second, opt_comparer) {  
  if (!second) throw new Error('second is not specified');
  
  var first = this.array_;
  if (second.array_) second = second.array_;
  var all = goog.array.concat(first, second);  
  return new pn.seq.Seq(all).distinct(opt_comparer);
};

/**
 * Produces the set intersection of two sequences.
 * 
 * @param {!pn.seq.Seq|!Array} second The second sequence
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer
 * @return {!pn.seq.Seq} The intersection of the two sequences.
 */
pn.seq.Seq.prototype.intersect = function(second, opt_comparer) {  
  if (!second) throw new Error('second is not specified');
  var result = [];
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    var e = this.array_[i];
    var comparer = function(e2) { 
      return (opt_comparer ? opt_comparer(e2, e) : e2 === e);  
    };
    if (goog.array.findIndex(result, comparer) >= 0) continue;
    if (goog.array.findIndex(second, comparer) < 0) continue;
    result.push(e);
  }
  return new pn.seq.Seq(result);
};

/**
 * Produces the set difference of two sequences
 * 
 * @param {!pn.seq.Seq|!Array} second The second sequence
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer
 * @return {!pn.seq.Seq} The difference of the two sequences.
 */
pn.seq.Seq.prototype.except = function(second, opt_comparer) {  
  if (!second) throw new Error('second is not specified');
  var result = [];
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    var e = this.array_[i];
    var comparer = function(e2) {       
      return (opt_comparer ? opt_comparer(e2, e) : e2 === e);  
    };
    if (goog.array.findIndex(result, comparer) >= 0) continue;
    if (goog.array.findIndex(second, comparer) >= 0) continue;
    result.push(e);
  }
  return new pn.seq.Seq(result);
};

/**
 * Creates a pn.seq.Lookup given a keySelector
 * 
 * @param {!function(*):*} keySelector The key of each element in the seq
 * @param {function(*, *):*=} opt_elementSelector The optional element from 
 *    each element
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Lookup} The lookup
 */
pn.seq.Seq.prototype.toLookup = 
    function(keySelector, opt_elementSelector, opt_comparer) {
  if (!keySelector) throw new Error('keySelector is not specified');
  var lu = new pn.seq.Lookup();
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    var e = this.array_[i];    
    var key = keySelector(e);
    var elem = opt_elementSelector ? opt_elementSelector(e, i) : e;    
    if (lu.containsKey(key, opt_comparer)) {            
      lu.get(key, opt_comparer).array_.push(elem);
    } else { lu.set(key, new pn.seq.Seq([elem]), opt_comparer); }
  }
  lu.collapse();
  return lu;
};

/**
 * Correlates the elements of two sequences based on matching keys
 *
 * @param {!pn.seq.Seq} inner The sequence to join to the first sequence
 * @param {!function(*):*} outKeySelect The key of each element in the 
 *    outer seq
 * @param {!function(*):*} inKeySelect The key of each element in the inner seq
 * @param {function(*, *):*} resultSelector The element from each element
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The joined sequence.
 */
pn.seq.Seq.prototype.join = 
    function(inner, outKeySelect, inKeySelect, resultSelector, opt_comparer) {
  if (!inner) throw new Error('inner is not specified');
  if (!outKeySelect) throw new Error('outKeySelect is not specified');
  if (!inKeySelect) throw new Error('inKeySelect is not specified');
  if (!resultSelector) throw new Error('resultSelector is not specified');
  var lu = inner.toLookup(inKeySelect, null, opt_comparer); 
  var results = [];
  for (var i = 0, limit = this.array_.length; i < limit; i++) 
  { 
    var outerElement = this.array_[i];
    var key = outKeySelect(outerElement); 
    var inner2 = lu.get(key);
    for (var j = 0, jlimit = inner2.array_.length; j < jlimit; j++) {
      results.push(resultSelector(outerElement, inner2.array_[j]));        
    }      
  } 
  return new pn.seq.Seq(results);
};

/**
 * Groups the elements of a sequence.
 * 
 * @param {!function(*):*} keySelect The key of each element in the seq
 * @param {!function(*):*} elementSelect The element of each element in the seq.
 * @param {function(*, pn.seq.Seq):*=} opt_resultSelect The optional element 
 *    from each element
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The joined sequence.
 */
pn.seq.Seq.prototype.groupBy = 
    function(keySelect, elementSelect, opt_resultSelect, opt_comparer) {
  if (!keySelect) throw new Error('keySelect is not specified');
  if (!elementSelect) throw new Error('elementSelect is not specified');  
  var lu = this.toLookup(keySelect, elementSelect, opt_comparer);    
  return lu.select(function(group) {    
    return opt_resultSelect ? opt_resultSelect(group.key, group) : group;
  });
};

/**
 * Correlates the elements of two sequences based on key equality, and 
 *    groups the results
 *
 * @param {!pn.seq.Seq} inner The sequence to join to the first sequence
 * @param {!function(*):*} outKeySelect The key of each element in the 
 *    outer seq
 * @param {!function(*):*} inKeySelect The key of each element in the inner seq
 * @param {function(*, *):*} resultSelector The element from each element
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The joined sequence.
 */
pn.seq.Seq.prototype.groupJoin = 
    function(inner, outKeySelect, inKeySelect, resultSelector, opt_comparer) {
  // TODO: Validation is same as join() reuse?
  if (!inner) throw new Error('inner is not specified');  
  if (!outKeySelect) throw new Error('outKeySelect is not specified');
  if (!inKeySelect) throw new Error('inKeySelect is not specified');
  if (!resultSelector) throw new Error('resultSelector is not specified');
  
  var lu = inner.toLookup(inKeySelect, null, opt_comparer); 
  var results = [];
  for (var i = 0, limit = this.array_.length; i < limit; i++) 
  { 
    var outerElement = this.array_[i];
    var key = outKeySelect(outerElement); 
    results.push(resultSelector(outerElement, lu.get(key))); 
  } 
  return new pn.seq.Seq(results);
};

/**
 * Takes entries in the sequence until the predicate return false.
 *
 * @param {function(*, number):boolean!} predicate The predicate
 * @return {!pn.seq.Seq} The sequence
 */
pn.seq.Seq.prototype.takeWhile = function(predicate) {
  if (!predicate) throw new Error('predicate is not specified');
  var index = goog.array.findIndex(this.array_, 
    function(e, i) { return ! predicate(e, i); });    
  if (index < 0) return this;  
  return new pn.seq.Seq(this.array_.slice(0, index));  
};

/**
 * Skips entries in the sequence until the predicate return false.
 *
 * @param {function(*, number):boolean!} predicate The predicate
 * @return {!pn.seq.Seq} The sequence
 */
pn.seq.Seq.prototype.skipWhile = function(predicate) {
  if (!predicate) throw new Error('predicate is not specified');  
  var index = goog.array.findIndex(this.array_, 
    function(e, i) { return !predicate(e, i); });
  if (index < 0) return pn.seq.Seq.empty();    
  return new pn.seq.Seq(this.array_.slice(index));  
};

/**
 * Takes entries in the sequence until the the count is reached.
 *
 * @param {number} count The number of items to take
 * @return {!pn.seq.Seq} The sequence
 */
pn.seq.Seq.prototype.take = function(count) {
  if (!goog.isNumber(count) || count < 0) 
    throw new Error('count is not specified');
  return new pn.seq.Seq(this.array_.slice(0, count));  
};

/**
 * Skips entries in the sequence until the the count is reached.
 *
 * @param {number} count The number of items to skip
 * @return {!pn.seq.Seq} The sequence
 */
pn.seq.Seq.prototype.skip = function(count) {
  if (!goog.isNumber(count) || count < 0) 
    throw new Error('count is not specified');
  return new pn.seq.Seq(this.array_.slice(count));  
};

/** @return {!Array.<*>} The sequence as an array */
pn.seq.Seq.prototype.toArray = function() { 
  return goog.array.clone(this.array_); 
};

/** 
 * @param {function(*):*!} keySelector The key selector
 * @param {function(*):*=} opt_elemSelector The optional element selector
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!goog.structs.Map} The sequence as a map 
 */
pn.seq.Seq.prototype.toMap = 
    function(keySelector, opt_elemSelector, opt_comparer) {   
  var lookup = this.toLookup(keySelector, opt_elemSelector, opt_comparer);
  return lookup.getMap();
};

pn.seq.Seq.prototype.orderBy = function() { 
  throw new Error('Not Implemented'); 
}

pn.seq.Seq.prototype.reverse = function() { 
  var arr = goog.array.clone(this.array_);
  arr.reverse();
  return new pn.seq.Seq(arr);
};

pn.seq.Seq.prototype.sum = function(opt_selector) {
  return this.aggregate(0, function(tot, curr) {
    var i = opt_selector ? opt_selector(curr) : curr;
    return tot + i;
  });
};

pn.seq.Seq.prototype.average = function(opt_selector) {
  var len = this.array_.length;
  return len !== 0 ? this.sum(opt_selector) / len : 0;  
};

pn.seq.Seq.prototype.min = function(opt_selector) {
  var min = undefined;
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    var e = this.array_[i];
    if (opt_selector) e = opt_selector(e);
    if (min === undefined || e < min) min = e;
  }    
  return min;  
};

pn.seq.Seq.prototype.max = function(opt_selector) {
  var max = undefined;
  for (var i = 0, limit = this.array_.length; i < limit; i++) {
    var e = this.array_[i];
    if (opt_selector) e = opt_selector(e);
    if (max === undefined || e > max) max = e;
  }    
  return max;  
};

pn.seq.Seq.prototype.elementAt = function(index) {
  if (!goog.isNumber(index) || index < 0 || this.array_.length <= index) {
    throw new Error('Index outside of bounds of sequence');  
  }
  return this.array_[index];
};

pn.seq.Seq.prototype.elementAtOrNull = function(index) {  
  return this.array_.length <= index ? null: this.array_[index];
};

pn.seq.Seq.prototype.contains = function(value, opt_comparer) {    
  var comparer = function(e2) { 
    return (opt_comparer ? opt_comparer(e2, value) : e2 === value);  
  };
  return goog.array.indexOf(this.array_, comparer) >= 0;
};

pn.seq.Seq.prototype.sequenceEquals = function(second, opt_comparer) {
  if (!second) throw new Error('second is not specified');
  var limit = this.array_.length;
  if (limit !== second.array_.length) { return false; }
  for (var i = 0; i < limit; i++) {
    var e1 = this.array_[i];
    var e2 = second.array_[i];
    if (!(opt_comparer ? opt_comparer(e1, e2) : e1 === e2)) return false;    
  }
  return true;
};

pn.seq.Seq.prototype.zip = function(second, resultSelector) {
  if (!second) throw new Error('second is not specified');
  if (!resultSelector) throw new Error('resultSelector is not specified');
  
  var limit = Math.min(this.array_.length, second.array_.length);
  var results = [];
  for (var i = 0; i < limit; i++) {
    results.push(resultSelector(this.array_[i], second.array_[i]));
  }
  return new pn.seq.Seq(results);
};

////////////////////////////////////////////////////////////////////////////////
// LOOKUP
////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @extends {pn.seq.Seq}
 */
pn.seq.Lookup = function() {
  pn.seq.Seq.call(this, []);
  this.map_ = new goog.structs.Map();
};
goog.inherits(pn.seq.Lookup, pn.seq.Seq);

pn.seq.Lookup.prototype.containsKey = function(key, opt_comparer) {  
  if (!opt_comparer) return this.map_.containsKey(key);
  var keys = this.map_.getKeys();
  return goog.array.findIndex(keys, function(k) {      
    return opt_comparer(k, key); 
  }) >= 0;
};

pn.seq.Lookup.prototype.getKeys = function() { return this.map_.getKeys(); };

pn.seq.Lookup.prototype.get = function(key, opt_comparer) {  
  key = opt_comparer ? this.getCompatibleKey_(key, opt_comparer) : key;
  var val = this.map_.get(key);  
  return val || pn.seq.Seq.empty();
};

pn.seq.Lookup.prototype.set = function(key, value, opt_comparer) {  
  key = opt_comparer ? this.getCompatibleKey_(key, opt_comparer) : key;    
  this.map_.set(key, value);  
};

pn.seq.Lookup.prototype.getCompatibleKey_ = function(key, comparer) {
  var keys = this.map_.getKeys();
  var idx = goog.array.findIndex(keys, function(k) {     
    return comparer(k, key); 
  });
  return idx >= 0 ? keys[idx] : key;  
};

pn.seq.Lookup.prototype.collapse = function() {
  var arr = [];  
  var keys = this.getKeys();  
  for (var i = 0, limit = keys.length; i < limit; i++) {
    var key = keys[i];
    var seq = this.get(key);
    arr.push(new pn.seq.Grouping(key, seq));
  }
  this.array_ = arr;
};

pn.seq.Lookup.prototype.getMap = function() { return this.map_; }

////////////////////////////////////////////////////////////////////////////////
// GROUPING
////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @extends {pn.seq.Seq}
 */
pn.seq.Grouping = function(key, seq) {
  pn.seq.Seq.call(this, seq.array_);
  
  /** @type {*} */
  this.key = key;
};
goog.inherits(pn.seq.Grouping, pn.seq.Seq);