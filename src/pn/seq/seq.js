
goog.provide('pn.seq.Grouping');
goog.provide('pn.seq.Lookup');
goog.provide('pn.seq.OrderedSeq');
goog.provide('pn.seq.Seq');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.structs.Map');
goog.require('goog.iter.Iterator');
goog.require('pn.seq.CompoundComparer');
goog.require('pn.seq.ProjectionComparer');
goog.require('pn.seq.ReverseComparer');



/**
 * @constructor 
 * @param {!goog.iter.Iterable|!pn.seq.Seq} source The source iterable or array.
 */
pn.seq.Seq = function(source) {
  goog.asserts.assert(goog.isDefAndNotNull(source));    

  /**
   * @private   
   * @type {!goog.iter.Iterable}
   */
  this.source_ = source.source_ || source;  
};

/** 
 * @private 
 * @param {!goog.iter.Iterable} item The iterable to convert to an iterator
 * @return {!goog.iter.Iterator}
 */
pn.seq.Seq.toIterator_ = function(item) {
  if (item.iter_) return item.iter_();
  return goog.iter.toIterator(item);
};

/**
 * @private
 * @const
 * @type {!pn.seq.Seq}
 */
pn.seq.Seq.EMPTY_ = new pn.seq.Seq([]);


/**
 * @private
 * @param {*} x The first item to compare.
 * @param {*} y The second item to compare.
 * @return {boolean} Wether the items are considered equal.
 */
pn.seq.Seq.defaultEquality_ = function(x, y) {
  return x === y;
};


/**
 * @private
 * @param {*} x The first item to compare.
 * @param {*} y The second item to compare.
 * @return {number} The comparinson marker for the two items.
 */
pn.seq.Seq.defaultComparer_ = function(x, y) {
  return x === y ? 0 : (x > y ? 1 : -1);
};


/**
 * Generates an empty sequence.
 * @return {!pn.seq.Seq} A singleton empty sequence.
 */
pn.seq.Seq.empty = function() { return pn.seq.Seq.EMPTY_; };


/**
 * Generates a sequence of integral numbers within a specified range
 * @param {number} start The value of the first integer in the sequence.
 * @param {number} count The number of sequential integers to generate.
 * @return {!pn.seq.Seq} The created sequence.
 */
pn.seq.Seq.range = function(start, count) {
  goog.asserts.assert(start >= 0);
  goog.asserts.assert(count >= 0);
  
  var idx = 0;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {      
      if (idx++ >= count) throw goog.iter.StopIteration;      
      return start + (idx - 1);
    }
  };
  return new pn.seq.Seq(newIter);  
};


/**
 * Generates a sequence that contains one repeated value
 * @param {*} element The value to be repeated.
 * @param {number} count The number of times to repeat the value in
 *    the generated sequence.
 * @return {!pn.seq.Seq} The created sequence.
 */
pn.seq.Seq.repeat = function(element, count) {
  goog.asserts.assert(count >= 0);
  
  var idx = 0;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {      
      if (idx++ >= count) throw goog.iter.StopIteration;      
      return element;
    }
  };
  return new pn.seq.Seq(newIter);  
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
 * @return {!pn.seq.Seq} The filtered sequence.  Note: The input sequence is
 *    never modified.
 */
pn.seq.Seq.prototype.where = function(predicate) {
  if (!predicate) throw new Error('predicate is required and was not provided');    
  var idx = 0;
  var arr = [];
  var iter = this.iter_();
  while (true) {
    try {
      var e = iter.next();
      if (predicate(e, idx++)) arr.push(e);      
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) { throw ex; }      
      return new pn.seq.Seq(arr);    
    }
  }    
};


/**
 * In a query expression, the select clause specifies the type of values that
 * will be produced when the query is executed. The result is based on the
 * evaluation of all the previous clauses and on any expressions in the select
 * clause itself. A query expression must terminate with either a select
 * clause or a group clause.
 *
 * @param {function(*,number=):*}  mutator The mutator to use to mutate the
 *    sequence.
 * @return {!pn.seq.Seq} The modified sequence.  Note: The input sequence is
 *    never modified.
 */
pn.seq.Seq.prototype.select = function(mutator) {  
  if (!mutator) throw new Error('mutator is required and was not provided');
  var idx = 0;
  var arr = [];
  var iter = this.iter_();
  while (true) {
    try {
      arr.push(mutator(iter.next(), idx++));      
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) { throw ex; }      
      return new pn.seq.Seq(arr);    
    }
  }    
};


/**
 * Gets the length of the given sequence with an optional filtering predicate.
 *
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when counting the sequence.
 * @return {!number} The length of the sequence.
 */
pn.seq.Seq.prototype.count = function(opt_predicate) {
  var iter = opt_predicate ? 
    this.where(opt_predicate).iter_() : 
    this.iter_();
  var count = 0;
  while (true) {
    try {
      iter.next();
      count++;      
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) { throw ex; }      
      return count;
    }
  }    
};


/**
 * Creates a new sequance by concatenating 2 or more sequences
 * @param {...goog.iter.Iterable} var_args The arrays or sequences to
 *    concatenate.
 * @return {!pn.seq.Seq} The concatenated sequences as one sequence.
 */
pn.seq.Seq.prototype.concat = function(var_args) {
  var iters = goog.array.clone(arguments);  
  var idx = 0;
  var curr = this.iter_();
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      try {
        return curr.next();
      } catch (ex) {
        if (ex !== goog.iter.StopIteration) { throw ex; }      
        curr = iters[idx++];
        if (!curr) throw goog.iter.StopIteration;
        if (curr.source_) { curr = curr.iter_(); }
        if (!curr.next) { curr = pn.seq.Seq.toIterator_(curr); }        
      }
    } 
   };
  return new pn.seq.Seq(newIter);
};


/**
 * Projects each element of a sequence to an IEnumerable(Of T) and flattens
 * the resulting sequences into one sequence.
 * @param {function(*,number=):!Array}  collectionSelector A transform function
 *    to apply to each source element; the second parameter of the function
 *    represents the index of the source element.
 * @param {function(*, *):*=} opt_resultSelector A transform function to apply
 *    to each element of the intermediate sequence.
 * @return {!pn.seq.Seq} The modified sequence.
 */
pn.seq.Seq.prototype.selectMany =
    function(collectionSelector, opt_resultSelector) {
  goog.asserts.assert(collectionSelector);
  
  var idx = 0;
  var newIter = new goog.iter.Iterator;
  var thisiter = this.iter_();  
  var elem = thisiter.next();  
  var currIter = pn.seq.Seq.toIterator_(collectionSelector(elem, idx++));
  newIter.next = function() {
    while (true) {      
      try {        
        var next = currIter.next();
        return opt_resultSelector ? opt_resultSelector(elem, next) : next;      
      } catch (ex) {
        if (ex !== goog.iter.StopIteration) { throw ex; }    
        elem = thisiter.next();
        currIter = pn.seq.Seq.toIterator_(collectionSelector(elem, idx++));        
      }
    }
  };      
  return new pn.seq.Seq(newIter);
};


/**
 * Determines whether any element of a sequence exists or satisfies
 *    a condition
 *
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {boolean} Whether any element of a sequence exists or satisfies
 *    a condition.
 */
pn.seq.Seq.prototype.any = function(opt_predicate) {  
  var idx = 0;
  if (!opt_predicate) {
    try { this.iter_().next(); } 
    catch (ex) {
      if (ex !== goog.iter.StopIteration) { throw ex; }
      return false;
    } 
    return true;
  }
  return goog.iter.some(this.iter_(), function(e) { 
    return opt_predicate(e, idx++); 
  }, this);  
};


/**
 * Determines whether all elements of a sequence satisfy a condition.
 *
 * @param {function(*,number=):boolean}  predicate The predicate use when
 *    testing the sequence.
 * @return {boolean} Whether all elements of a sequence satisfy a condition.
 */
pn.seq.Seq.prototype.all = function(predicate) {
  if (!predicate) throw new Error('predicate is required and was not provided');  
  return goog.iter.every(this.iter_(), predicate, this);   
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The first element in the list or the first element matching
 *    the predicate.
 */
pn.seq.Seq.prototype.first = function(opt_predicate) {    
  if (!opt_predicate) { return this.iter_().next(); }  
  return this.where(opt_predicate).next();
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The first element in the list or the first element matching
 *    the predicate. Null if no element is matched.
 */
pn.seq.Seq.prototype.firstOrNull = function(opt_predicate) {
  try { return this.first(opt_predicate); }
  catch (ex) {
    if (ex !== goog.iter.StopIteration) { throw ex; }
    return null;
  }
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The only element in the list or the first element matching
 *    the predicate.
 */
pn.seq.Seq.prototype.single = function(opt_predicate) {  
  var check = function(iter) {
    var s = iter.next();
    try { iter.next();  } catch (ex) {
      if (ex !== goog.iter.StopIteration) { throw ex; }
      return s;
    }
    throw new Error('More than one value matched');
  };
  var idx = 0;
  return opt_predicate ? 
      check(goog.iter.filter(this.iter_(), function(e) {
        return opt_predicate(e, idx++); 
      }, this)) : 
      check(this.iter_());    
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The only element in the list or the first element matching
 *    the predicate. Null if no element is matched.
 */
pn.seq.Seq.prototype.singleOrNull = function(opt_predicate) {
  try { return this.single(opt_predicate); } 
  catch (ex) {
    if (ex !== goog.iter.StopIteration) { throw ex; }       
    return null;
  }
};

/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The last element in the list or the first element matching
 *    the predicate.
 */
pn.seq.Seq.prototype.last = function(opt_predicate) {
  var check = function(iter) {
    var hasValue = false;
    var val;
    while (true) {
      try { 
        val = iter.next(); 
        hasValue = true;
      } 
      catch (ex) {
        if (ex !== goog.iter.StopIteration) { throw ex; }       
        break;
      }
    }
    if (!hasValue) throw new Error('Could not find any matching elements');
    return val;
  };  
  var idx = 0;
  return opt_predicate ? 
      check(goog.iter.filter(this.iter_(), function(e) { 
        return opt_predicate(e, idx++); 
      }, this)) : 
      check(this.iter_());    
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The last element in the list or the first element matching
 *    the predicate. Null if no element is matched.
 */
pn.seq.Seq.prototype.lastOrNull = function(opt_predicate) {
  try {
    return this.last(opt_predicate);
  } catch (ex) {
    if (ex.message !== 'Could not find any matching elements') { throw ex; }       
    return null;
  }
};

/**
 * Returns the elements of the list, or a default valued singleton collection
 *    if the sequence is empty
 * 
 * @param {*=} opt_default The default value for a singleton collection if
 *    source sequence is empty.
 * @return {!pn.seq.Seq} The modified sequence.
 */
pn.seq.Seq.prototype.defaultIfEmpty = function(opt_default) {
  try {
    this.iter_().next();
    return this;
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) throw ex;    
    return new pn.seq.Seq([(opt_default === undefined ? null : opt_default)]);
  }   
};


/**
 * Applies an accumulator function over a sequence. The specified seed value
 * is used as the initial accumulator value, and the specified function is
 * used to select the result value.
 *
 * @param {*} seed The initial seed.
 * @param {function(*, *):*} accum The accumulator function that takes the
 *    current accumulated value and the next value to accumulate.
 * @param {function(*):*=} opt_projection The optional projection to use on the
 *    final accumulated value.
 * @return {*} The aggregated value.
 */
pn.seq.Seq.prototype.aggregate = function(seed, accum, opt_projection) {
  if (!goog.isDefAndNotNull(seed)) throw new Error('Seed is required and was not provided');
  if (!goog.isDefAndNotNull(accum))
    throw new Error('Accumulattor is required and was not provided');  
  return goog.iter.reduce(this.iter_(), function(acc, x) {    
    x = opt_projection ? opt_projection(x) : x;
    return accum(acc, x);
  }, seed);  
};


/**
 * Returns distinct elements from a sequence by using a specified comparer
 *    to compare values
 *
 * @param {function(*, *):boolean=} opt_comparer The optional comparer to use
 *    when comparing items in the sequence.
 * @return {!pn.seq.Seq} The modified sequence. 
 */
pn.seq.Seq.prototype.distinct = function(opt_comparer) {  
  var done = [];  
  var newIter = new goog.iter.Iterator;  
  var thisiter = this.iter_();     
  newIter.next = function() {
    while (true) {                  
      var element = thisiter.next();
      var comparer = opt_comparer || pn.seq.Seq.defaultEquality_;
      if (goog.array.findIndex(done, function(e) { 
        return comparer(e, element);        
      }) >= 0) continue;
      done.push(element);
      return element;
    }
  };
  return new pn.seq.Seq(newIter);  
};


/**
 * Produces the set union of two sequences.
 *
 * @param {!goog.iter.Iterator} second The second sequence.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The union of the two sequences.
 */
pn.seq.Seq.prototype.union = function(second, opt_comparer) {
  if (!second) throw new Error('second is required and was not provided');  
  second = pn.seq.Seq.toIterator_(second);
  var all = this.concat(second);  
  return new pn.seq.Seq(all).distinct(opt_comparer);  
};


/**
 * Produces the set intersection of two sequences.
 *
 * @param {!pn.seq.Seq|!Array} second The second sequence.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The intersection of the two sequences.
 */
pn.seq.Seq.prototype.intersect = function(second, opt_comparer) {
  if (!second) throw new Error('second is required and was not provided');
  var secondarr = /** @type {!goog.array.ArrayLike} */ 
      (goog.isArrayLike(second) ? 
      second : 
      goog.isArrayLike(second.source_) ? 
          second.source_ :
          new pn.seq.Seq(second).toArray());        
  var done = [];  
  
  var newIter = new goog.iter.Iterator;  
  var thisiter = this.iter_();  
  newIter.next = function() {
    while (true) {                  
      var element = thisiter.next();
      var comparer = opt_comparer || pn.seq.Seq.defaultEquality_;
      var idx = goog.array.findIndex(done, function(e) { 
        return comparer(e, element);        
      });
      if (idx >= 0) continue;      
      if (goog.array.removeIf(secondarr, function(e) { 
        return comparer(e, element);        
      })) {
        delete secondarr[idx];
        done.push(element);
        return element;
      }           
    }
  };
  return new pn.seq.Seq(newIter);  
};


/**
 * Produces the set difference of two sequences
 *
 * @param {!pn.seq.Seq|!Array} second The second sequence.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The difference of the two sequences.
 */
pn.seq.Seq.prototype.except = function(second, opt_comparer) {
  if (!second) throw new Error('second is required and was not provided');
  var secondarr = /** @type {!goog.array.ArrayLike} */ 
      (goog.isArrayLike(second) ? 
      second : 
      goog.isArrayLike(second.source_) ? 
          second.source_ :
          new pn.seq.Seq(second).toArray());               
  
  var newIter = new goog.iter.Iterator;  
  var thisiter = this.iter_();  
  newIter.next = function() {
    while (true) {                  
      var element = thisiter.next();
      var comparer = opt_comparer || pn.seq.Seq.defaultEquality_;
      var idx = goog.array.findIndex(secondarr, function(e) { 
        return comparer(e, element);        
      });
      if (idx >= 0) continue;      
      secondarr.push(element);      
      return element;      
    }
  };
  return new pn.seq.Seq(newIter);  
};


/**
 * Creates a pn.seq.Lookup given a keySelector
 *
 * @param {!function(*):*} keySelector The key of each element in the seq.
 * @param {function(*):*=} opt_elementSelector The optional element from
 *    each element.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Lookup} The lookup.
 */
pn.seq.Seq.prototype.toLookup =
    function(keySelector, opt_elementSelector, opt_comparer) {
  if (!keySelector) throw new Error('keySelector is required and was not provided');    
  return new pn.seq.Lookup(this.source_, keySelector, opt_elementSelector, opt_comparer);      
};


/**
 * Correlates the elements of two sequences based on matching keys
 *
 * @param {!pn.seq.Seq} inner The sequence to join to the first sequence.
 * @param {!function(*):*} outKeySelect The key of each element in the
 *    outer seq.
 * @param {!function(*):*} inKeySelect The key of each element in the inner seq.
 * @param {function(*, *):*} resultSelector The element from each element.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The joined sequence.
 */
pn.seq.Seq.prototype.join =
    function(inner, outKeySelect, inKeySelect, resultSelector, opt_comparer) {
  this.joinValidate_(inner, outKeySelect, inKeySelect, resultSelector, opt_comparer);
   
  var lu = inner.toLookup(inKeySelect, undefined, opt_comparer);
  var results = [];  
  this.forEach(function(outerElement) {       
    var key = outKeySelect(outerElement);    
    lu.get(key).forEach(function(innerElement) {           
      results.push(resultSelector(outerElement, innerElement));
    });
  });  
  return new pn.seq.Seq(results);
};


/**
 * Groups the elements of a sequence.
 *
 * @param {!function(*):*} keySelect The key of each element in the seq.
 * @param {!function(*):*} elementSelect The element of each element in the seq.
 * @param {function(*, pn.seq.Seq):*=} opt_resultSelect The optional element
 *    from each element.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The joined sequence.
 */
pn.seq.Seq.prototype.groupBy =
    function(keySelect, elementSelect, opt_resultSelect, opt_comparer) {
  if (!keySelect) throw new Error('keySelect is required and was not provided');
  if (!elementSelect) throw new Error('elementSelect is required and was not provided');  
  var lu = this.toLookup(keySelect, elementSelect, opt_comparer);    
  var seq = lu.select(function(group) {
    return opt_resultSelect ? opt_resultSelect(group.key, group) : group;
  });    
  return seq;
};


/**
 * Correlates the elements of two sequences based on key equality, and
 *    groups the results
 *
 * @param {!pn.seq.Seq} inner The sequence to join to the first sequence.
 * @param {!function(*):*} outKeySelect The key of each element in the
 *    outer seq.
 * @param {!function(*):*} inKeySelect The key of each element in the inner seq.
 * @param {function(*, *):*} resultSelector The element from each element.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The joined sequence.
 */
pn.seq.Seq.prototype.groupJoin =
    function(inner, outKeySelect, inKeySelect, resultSelector, opt_comparer) {
  this.joinValidate_(inner, outKeySelect, inKeySelect, resultSelector, opt_comparer);
  
  var lu = inner.toLookup(inKeySelect, undefined, opt_comparer);
  var results = [];
  
  this.forEach(function(outerElement) {  
    var key = outKeySelect(outerElement);
    results.push(resultSelector(outerElement, lu.get(key)));
  });
  return new pn.seq.Seq(results);
};

/**
 * @param {!pn.seq.Seq} inner The sequence to join to the first sequence.
 * @param {!function(*):*} outKeySelect The key of each element in the
 *    outer seq.
 * @param {!function(*):*} inKeySelect The key of each element in the inner seq.
 * @param {function(*, *):*} resultSelector The element from each element.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 */
pn.seq.Seq.prototype.joinValidate_ = 
    function(inner, outKeySelect, inKeySelect, resultSelector, opt_comparer) {
  if (!inner) throw new Error('inner is required and was not provided');
  if (!outKeySelect) throw new Error('outKeySelect is required and was not provided');
  if (!inKeySelect) throw new Error('inKeySelect is required and was not provided');
  if (!resultSelector) throw new Error('resultSelector is required and was not provided');
};


/**
 * Takes entries in the sequence until the predicate return false.
 *
 * @param {function(*, number):boolean!} predicate The predicate.
 * @return {!pn.seq.Seq} The sequence.
 */
pn.seq.Seq.prototype.takeWhile = function(predicate) {
  if (!predicate) throw new Error('predicate is required and was not provided');
  var idx = 0;  
  var iter = goog.iter.takeWhile(this.iter_(), function(e) { 
    return predicate(e, idx++);
  });  
  return new pn.seq.Seq(iter);  
};


/**
 * Skips entries in the sequence until the predicate return false.
 *
 * @param {function(*, number):boolean!} predicate The predicate.
 * @return {!pn.seq.Seq} The sequence.
 */
pn.seq.Seq.prototype.skipWhile = function(predicate) {
  if (!predicate) throw new Error('predicate is required and was not provided');
  var idx = 0;
  var iter = goog.iter.dropWhile(this.iter_(), function(e) { 
    return predicate(e, idx++); 
  });
  return new pn.seq.Seq(iter); 
};


/**
 * Takes entries in the sequence until the the count is reached.
 *
 * @param {number} count The number of items to take.
 * @return {!pn.seq.Seq} The sequence.
 */
pn.seq.Seq.prototype.take = function(count) {
  if (!goog.isNumber(count) || count < 0)
    throw new Error('count is required and was not provided');  
  return this.takeWhile(function(e, idx) { return idx < count; });  
};


/**
 * Skips entries in the sequence until the the count is reached.
 *
 * @param {number} count The number of items to skip.
 * @return {!pn.seq.Seq} The sequence.
 */
pn.seq.Seq.prototype.skip = function(count) {
  if (!goog.isNumber(count) || count < 0)
    throw new Error('count is required and was not provided');
  return this.skipWhile(function(e, idx) { return idx < count; });
};


/** @return {!Array.<*>} The sequence as an array. */
pn.seq.Seq.prototype.toArray = function() {
  return goog.iter.toArray(this.iter_());  
};


/**
 * @param {function(*):*!} keySelector The key selector.
 * @param {function(*):*=} opt_elemSelector The optional element selector.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!goog.structs.Map} The sequence as a map.
 */
pn.seq.Seq.prototype.toMap =
    function(keySelector, opt_elemSelector, opt_comparer) {
  var lookup = this.toLookup(keySelector, opt_elemSelector, opt_comparer);
  return lookup.getMap();
};


/**
 * Reverses the sequence
 * @return {!pn.seq.Seq} The reversed sequence.
 */
pn.seq.Seq.prototype.reverse = function() {
  var newIter = new goog.iter.Iterator;  
  var revIter;    
  newIter.next = goog.bind(function() {
    if (!revIter) {
      var arr = this.toArray();
      arr.reverse();
      revIter = pn.seq.Seq.toIterator_(arr);
    }    
    return revIter.next();    
  }, this);
  return new pn.seq.Seq(newIter);
};


/**
 * Sums all elements in the sequence with an optional projection
 * @param {function(*):number=} opt_selector An optional projection for
 *    the aggregation.
 * @return {number} The aggregate amount.
 */
pn.seq.Seq.prototype.sum = function(opt_selector) {
  return /** @type {number} */ (this.aggregate(0, function(tot, curr) {
    var i = opt_selector ? opt_selector(curr) : curr;
    return tot + i;
  }));
};


/**
 * Averages all elements in the sequence with an optional projection
 * @param {function(*):number=} opt_selector An optional projection for
 *    the aggregation.
 * @return {number} The aggregate amount.
 */
pn.seq.Seq.prototype.average = function(opt_selector) {
  var acumm = {sum:0,count:0};
  this.aggregate(acumm, function(tot, curr) {
    var sum = opt_selector ? opt_selector(curr) : curr;
    acumm.count++;
    acumm.sum += sum;
  });
  return acumm.sum / acumm.count;
};


/**
 * Finds the minimum of all elements in the sequence with an
 *    optional projection
 * @param {function(*,number=):number=} opt_selector An optional projection for
 *    the aggregation.
 * @return {number} The aggregate amount.
 */
pn.seq.Seq.prototype.min = function(opt_selector) {
  var min = 0;
  var idx = 0;
  var iter = this.iter_();
  try {
    while (true) {
      idx++;
      var num = /** @type {number} */ (iter.next());
      if (opt_selector) num = opt_selector(num, idx);
      if (idx === 1 || num < min) min = num;
    }  
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) throw ex;
    return min;
  }
};


/**
 * Finds the maximum of all elements in the sequence with an
 *    optional projection
 * @param {function(*,number=):number=} opt_selector An optional projection for
 *    the aggregation.
 * @return {number} The aggregate amount.
 */
pn.seq.Seq.prototype.max = function(opt_selector) {
  var max = 0;
  var idx = 0;
  var iter = this.iter_();
  try {
    while (true) {    
      var num = /** @type {number} */ (iter.next());
      idx++;
      if (opt_selector) num = opt_selector(num, idx);
      if (max === 1 || num > max) max = num;    
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) throw ex;
    return max;
  } 
};


/**
 * Gets the element at the specified index in the sequence.  If the index
 *    is not part of the sequence then an error is raised.
 * @param {number} index The index.
 * @return {*} The element at the given index.
 */
pn.seq.Seq.prototype.elementAt = function(index) {
  var idx = 0;  
  var iter = this.iter_();
  while (true) {    
    var e = iter.next();
    if (index === idx++) return e;    
  }  
};


/**
 * Gets the element at the specified index in the sequence.  If the index
 *    is not part of the sequence then null is returned.
 * @param {number} index The index.
 * @return {*} The element at the given index.
 */
pn.seq.Seq.prototype.elementAtOrNull = function(index) {
  try {
    return this.elementAt(index);
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) throw ex;
    return null;
  }
};


/**
 * Wether the sequence contains the specified value
 * @param {*} value The value to find.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {boolean} Wether the specified value was found in the sequence.
 */
pn.seq.Seq.prototype.contains = function(value, opt_comparer) {
  var comparer = function(e) {
    return opt_comparer ?
        opt_comparer(e, value) :
        pn.seq.Seq.defaultEquality_(e, value);
  };
  var iter = this.iter_();
  try {    
    while (true) { if (comparer(iter.next())) { return true; } }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) throw ex;
    return false;
  } 
};


/**
 * Wether this sequence is equivalent to the given 'second' sequence.
 *    Equivalence is determined if the items in the sequence are in the same
 *    order and are equal between both sequences.
 * @param {!goog.iter.Iterable} second The second sequence to compare.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {boolean} Wether the sequences are equal.
 */
pn.seq.Seq.prototype.sequenceEquals = function(second, opt_comparer) {
  if (!second) throw new Error('second is required and was not provided');  
  var compare = opt_comparer || pn.seq.Seq.defaultEquality_;
  // Copied from goog.iter.equals but replacing the comparisons
  var iterable1 = this.iter_();
  var iterable2 = pn.seq.Seq.toIterator_(second);
  var b1, b2;
  /** @preserveTry */
  try {
    while (true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if (!compare(val1, val2)) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    } else {
      if (b1 && !b2) {
        // iterable1 done but iterable2 is not done.
        return false;
      }
      if (!b2) {
        /** @preserveTry */
        try {
          // iterable2 not done?
          val2 = iterable2.next();
          // iterable2 not done but iterable1 is done
          return false;
        } catch (ex1) {
          if (ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          // iterable2 done as well... They are equal
          return true;
        }
      }
    }
  }  
  return false;
};


/**
 * Applies a specified function to the corresponding elements of two
 *    sequences, producing a sequence of the results.
 * @param {!goog.iter.Iterable} second The second sequence to zip.
 * @param {!function(*,*):*} resultSelector The results projection.
 * @return {!pn.seq.Seq} The resulting sequence with items 'zipped'.
*/
pn.seq.Seq.prototype.zip = function(second, resultSelector) {
  if (!second) throw new Error('second is required and was not provided');
  if (!resultSelector) throw new Error('resultSelector is required and was not provided');
  
  var newIter = new goog.iter.Iterator;
  var iter = this.iter_();
  var iter2 = pn.seq.Seq.toIterator_(second);  
  newIter.next = function() {    
    return resultSelector(iter.next(), iter2.next());    
  };
  return new pn.seq.Seq(newIter);    
};


/**
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {function(*,*):number=} opt_comparer The comparer.
 * @return {!pn.seq.OrderedSeq} The ordered sequence.
 */
pn.seq.Seq.prototype.orderBy = function(keySelector, opt_comparer) {
  return this.orderByImpl_(keySelector, false, opt_comparer);
};


/**
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {function(*,*):number=} opt_comparer The comparer.
 * @return {!pn.seq.OrderedSeq} The ordered sequence.
 */
pn.seq.Seq.prototype.orderByDescending = function(keySelector, opt_comparer) {
  return this.orderByImpl_(keySelector, true, opt_comparer);
};


/**
 * @private
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {boolean} descending Wether we are reversing the given comparer.
 * @param {function(*,*):number=} opt_comparer The comparer.
 * @return {!pn.seq.OrderedSeq} The ordered sequence.
 */
pn.seq.Seq.prototype.orderByImpl_ =
    function(keySelector, descending, opt_comparer) {
  if (!keySelector) throw new Error('keySelector is required and was not provided');
  var comparer = opt_comparer || pn.seq.Seq.defaultComparer_;
  var projComparer = new pn.seq.ProjectionComparer(keySelector, comparer);
  if (descending) projComparer = new pn.seq.ReverseComparer(projComparer);  
  return new pn.seq.OrderedSeq(this.iter_(), projComparer);
};

/**
 * Runs an evaluator for every item in the sequence. This method is not in the
 *  .Net LINQ library but it should be.
 * @param {!function(*, number):undefined} evaluator The evaluator to run for 
 *    each item in the sequence
 */
pn.seq.Seq.prototype.forEach = function(evaluator) {
  var idx = 0;    
  goog.iter.forEach(this.iter_(), function(e) { evaluator(e, idx++); }, this);    
};

/** 
 * Gets a fresh iterator from the sequence source
 * @private
 * @return {!goog.iter.Iterator}
 */
pn.seq.Seq.prototype.iter_ = function() {     
  return goog.iter.toIterator(this.source_);  
};

////////////////////////////////////////////////////////////////////////////////
// OrderedEnumerable
////////////////////////////////////////////////////////////////////////////////
/**
 * @constructor
 * @param {!goog.iter.Iterable} source The source array.
 * @param {!pn.seq.IComparer} comparer The sequence ordering comparer.
 * @extends {pn.seq.Seq}
 */
pn.seq.OrderedSeq = function(source, comparer) {
  if (!source) throw new Error('source is required and was not provided');
  pn.seq.Seq.call(this, source);  

  /**
   * @private
   * @type {goog.iter.Iterator}
   */
  this.orderedIterator_ = null;
  
  /**
   * @private
   * @type {!pn.seq.IComparer}
   */
  this.comparer_ = comparer;
};
goog.inherits(pn.seq.OrderedSeq, pn.seq.Seq);


/**
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {function(*,*):number=} opt_comparer The comparer.
 * @return {!pn.seq.OrderedSeq} The ordered sequence.
 */
pn.seq.OrderedSeq.prototype.thenBy = function(keySelector, opt_comparer) {
  if (!keySelector) throw new Error('keySelector is required and was not provided');
  return this.appendComparer_(keySelector, false, opt_comparer);
};


/**
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {function(*,*):number=} opt_comparer The comparer.
 * @return {!pn.seq.OrderedSeq} The ordered sequence.
 */
pn.seq.OrderedSeq.prototype.thenByDescending =
    function(keySelector, opt_comparer) {
  if (!keySelector) throw new Error('keySelector is required and was not provided');
  return this.appendComparer_(keySelector, true, opt_comparer);
};


/**
 * @private
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {boolean} descending Wether we are reversing the given comparer.
 * @param {function(*,*):number=} opt_comparer The comparer.
 * @return {!pn.seq.OrderedSeq} The ordered sequence.
 */
pn.seq.OrderedSeq.prototype.appendComparer_ =
    function(keySelector, descending, opt_comparer) {
  if (!keySelector) throw new Error('keySelector is required and was not provided');
  var comparer = opt_comparer || pn.seq.Seq.defaultComparer_;
  var secondComparer = new pn.seq.ProjectionComparer(keySelector, comparer);
  if (descending) secondComparer = new pn.seq.ReverseComparer(secondComparer);
  secondComparer = new pn.seq.CompoundComparer(this.comparer_, secondComparer);
  return new pn.seq.OrderedSeq(this.iter_(), secondComparer);
};

/** @inheritDoc */
pn.seq.OrderedSeq.prototype.toArray = function() {
  var arr = goog.iter.toArray(this.iter_());  
  var comparer = goog.bind(this.comparer_.compare, this.comparer_);
  goog.array.sort(arr, comparer);
  return arr;
};

////////////////////////////////////////////////////////////////////////////////
// LOOKUP
////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @extends {pn.seq.Seq}
 * @param {!goog.iter.Iterable} iter The iterable source
 * @param {!function(*):*} keySelector The key of each element in the seq.
 * @param {function(*):*=} opt_elementSelector The optional element from
 *    each element.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 */
pn.seq.Lookup = function(iter, keySelector, opt_elementSelector, opt_comparer) {
  if (!iter) throw new Error('iter is required and was not provided');
  if (!keySelector) throw new Error('keySelector is required and was not provided');  
  pn.seq.Seq.call(this, iter);
  
  this.keySelector_ = keySelector;
  this.elemSelector_ = opt_elementSelector || function(e) { return e; };
  this.comparer_ = opt_comparer || pn.seq.Seq.defaultEquality_;  
  this.lookupIterator_ = null;
    
  // Perhaps lookup should extend Map?
  this.map_ = new goog.structs.Map();      
  this.keys_ = [];
  
  this.init_();
};
goog.inherits(pn.seq.Lookup, pn.seq.Seq);

/** @private */
pn.seq.Lookup.prototype.init_ = function() {  
  var idx = 0;  
  try {
    var iter = this.iter_();
    while (true) {
      var e = iter.next();      
      var key = this.keySelector_(e);
      var elem = this.elemSelector_(e, idx++);
      this.set(key, elem);      
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) throw ex;
    this.collapse_();
  };  
};

/** 
 * Collapses the seqence. I.e. Sets the internal source_ property
 * @private
 */
pn.seq.Lookup.prototype.collapse_ = function() {  
  var arr = [];  
  for (var i = 0, limit = this.keys_.length; i < limit; i++) {  
    var key = this.keys_[i];    
    var arr2 = /** @type {!goog.iter.Iterable} */ (this.map_.get(key));
    var seq = new pn.seq.Seq(arr2);
    this.map_.set(key, seq);
    arr.push(new pn.seq.Grouping(key, seq));
  }
  this.source_ = arr;
};

/**
 * @param {*} key The key to find. 
 * @return {boolean} Wether the lookup contains the given key.
 */
pn.seq.Lookup.prototype.containsKey = function(key) {    
  return this.indexOfKey_(key) >= 0;
};

/**
 * @private
 * @param {*} key The key to find. 
 * @return {number} The index of the key
 */
pn.seq.Lookup.prototype.indexOfKey_ = function(key) {    
  return goog.array.findIndex(this.keys_, function(k) {
    return this.comparer_(k, key);
  }, this);
};

/**
 * @return {!Array.<*>} The array of keys the lookup contains.
 */
pn.seq.Lookup.prototype.getKeys = function() { return goog.array.clone(this.keys_); };


/**
 * @param {*} key The key to find. 
 * @return {!pn.seq.Seq} The sequence in the specified key (empty if key
 *    not found).
 */
pn.seq.Lookup.prototype.get = function(key) {
  var kidx = this.indexOfKey_(key);  
  if (kidx < 0) return pn.seq.Seq.empty();  
  return /** @type {!pn.seq.Seq} */ (this.map_.get(this.keys_[kidx]));  
};


/**
 * @param {*} key The key to find.
 * @param {!pn.seq.Seq} value The sequence to set in the specified key. 
 */
pn.seq.Lookup.prototype.set = function(key, value) {  
  var kidx = this.indexOfKey_(key);  
  if (kidx >= 0) {        
    var arr = this.map_.get(this.keys_[kidx]);    
    arr.push(value);    
    return;
  }   
  this.keys_.push(key);
  this.map_.set(key, [value]);
};


/**
 * @private
 * @param {*} key The key to find. 
 * @return {*} The first key that matches the comparer.
 */
pn.seq.Lookup.prototype.getCompatibleExistingKey_ = function(key) {    
  var idx = goog.array.findIndex(this.keys_, function(k) {    
    return this.comparer_(k, key);
  }, this);    
  return idx >= 0 ? this.keys_[idx] : key;
};


/**
 * @return {!goog.structs.Map} The internal Map.
 */
pn.seq.Lookup.prototype.getMap = function() { return this.map_; };

////////////////////////////////////////////////////////////////////////////////
// GROUPING
////////////////////////////////////////////////////////////////////////////////



/**
 * @constructor
 * @extends {pn.seq.Seq}
 * @param {*} key The key of this group.
 * @param {!goog.iter.Iterable|!pn.seq.Seq} iter The iterable sequence in this group.
 */
pn.seq.Grouping = function(key, iter) {
  pn.seq.Seq.call(this, iter);

  /** @type {*} */
  this.key = key;
};
goog.inherits(pn.seq.Grouping, pn.seq.Seq);
