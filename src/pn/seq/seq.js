
goog.provide('pn.seq');
goog.provide('pn.seq.Grouping');
goog.provide('pn.seq.Lookup');
goog.provide('pn.seq.OrderedSeq');
goog.provide('pn.seq.Seq');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.structs.Map');
goog.require('pn.seq.CompoundComparer');
goog.require('pn.seq.ProjectionComparer');
goog.require('pn.seq.ReverseComparer');



/**
 * // TODO: This should really not be public.
 * @constructor
 */
pn.seq.Seq = function() {};



/**
 * @private
 * @constructor
 * @const {!pn.seq.Seq}
 */
pn.seq.Seq.template_ = new pn.seq.Seq();


/**
 * @private
 * @param  {Object} src The object to test to see if its a sequence.
 * @return {Boolean} Wether the specified source is a sequence.
 */
pn.seq.Seq.isSeq_ = function(src) {
  return !!src && !!src.select;
};


/**
 * @param {!(Array|pn.seq.Seq)} source The source sequence or array.
 * @return {!pn.seq.Seq} The original sequence if it is a sequence or the
 *    created sequence from the specified array.
 */
pn.seq.Seq.create = function(source) {
  if (pn.seq.Seq.isSeq_(source)) return source;

  for (var i in pn.seq.Seq.template_) {
    if (source[i]) {
      throw new Error('source already contains function "' + i + '".');
    }
    source[i] = pn.seq.Seq.template_[i];
  }
  return /** @type {!pn.seq.Seq} */ (source);
};


/**
 * @private
 * @const
 * @type {!pn.seq.Seq}
 */
pn.seq.Seq.EMPTY_ = pn.seq.Seq.create([]);


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

  var seq = [],
      idx = 0;
  while (true) {
    if (idx++ >= count) return pn.seq.Seq.create(seq);
    seq.push(start + (idx - 1));
  }
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

  return pn.seq.Seq.create(goog.array.repeat(element, count));
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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!predicate) throw new Error('predicate is required and was not provided');

  return pn.seq.Seq.create(goog.array.filter(this, predicate));
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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!mutator) throw new Error('mutator is required and was not provided');

  return pn.seq.Seq.create(goog.array.map(this, mutator));
};


/**
 * Gets the length of the given sequence with an optional filtering predicate.
 *
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when counting the sequence.
 * @return {!number} The length of the sequence.
 */
pn.seq.Seq.prototype.count = function(opt_predicate) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  if (!opt_predicate) return this.length;
  return goog.array.filter(this, opt_predicate).length;
};


/**
 * Creates a new sequance by concatenating 2 or more sequences
 * @param {...(Array|pn.seq.Seq)} var_args The arrays or sequences to
 *    concatenate.
 * @return {!pn.seq.Seq} The concatenated sequences as one sequence.
 */
pn.seq.Seq.prototype.concatenate = function(var_args) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  var src = [];
  var args = goog.array.clone(arguments);
  goog.array.insertAt(args, this, 0);
  return pn.seq.Seq.create(goog.array.concat.apply(null, args));
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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  goog.asserts.assert(collectionSelector);

  var idx = 0;
  var inners = [];
  for (var i = 0, len = this.length; i < len; i++) {
    var item = collectionSelector ? collectionSelector(this[i], i) : this[i];
    inners.push(item);
  }
  var joined = pn.seq.Seq.create(goog.array.concat.apply(null, inners));
  return opt_resultSelector ? joined.select(opt_resultSelector) : joined;
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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  if (!opt_predicate) return this.length > 0;
  return goog.array.findIndex(this, opt_predicate) >= 0;
};


/**
 * Determines whether all elements of a sequence satisfy a condition.
 *
 * @param {function(*,number=):boolean}  predicate The predicate use when
 *    testing the sequence.
 * @return {boolean} Whether all elements of a sequence satisfy a condition.
 */
pn.seq.Seq.prototype.all = function(predicate) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!predicate) throw new Error('predicate is required and was not provided');

  return pn.seq.Seq.create(goog.array.every(this, predicate));
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The first element in the list or the first element matching
 *    the predicate.
 */
pn.seq.Seq.prototype.first = function(opt_predicate) {
  var fon = this.firstOrNull(opt_predicate);
  if (fon === null) throw new Error('No matching element found');
  return fon;
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The first element in the list or the first element matching
 *    the predicate. Null if no element is matched.
 */
pn.seq.Seq.prototype.firstOrNull = function(opt_predicate) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!opt_predicate) { return this.length === 0 ? null : this[0]; }
  for (var i = 0, len = this.length; i < len; i++) {
    var o = this[i];
    if (opt_predicate(o, i)) { return o; }
  }
  return null;
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The only element in the list or the first element matching
 *    the predicate.
 */
pn.seq.Seq.prototype.single = function(opt_predicate) {
  var son = this.singleOrNull(opt_predicate);
  if (son === null) throw new Error('No matching element found.');
  return son;
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The only element in the list or the first element matching
 *    the predicate. Null if no element is matched.
 */
pn.seq.Seq.prototype.singleOrNull = function(opt_predicate) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!opt_predicate && this.length === 0) return null;
  if (!opt_predicate && this.length > 1)
    throw new Error('More than a single element matched.');
  var filtered = !opt_predicate ? this : goog.array.filter(this, opt_predicate);
  if (filtered.length > 1) throw new Error('More than an element matched.');

  return filtered.length === 0 ? null : filtered[0];
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The last element in the list or the first element matching
 *    the predicate.
 */
pn.seq.Seq.prototype.last = function(opt_predicate) {
  var lon = this.lastOrNull(opt_predicate);
  if (lon === null) throw new Error('No matching element found');
  return lon;
};


/**
 * @param {function(*,number=):boolean=}  opt_predicate The optional predicate
 *    to use when testing the sequence.
 * @return {*} The last element in the list or the first element matching
 *    the predicate. Null if no element is matched.
 */
pn.seq.Seq.prototype.lastOrNull = function(opt_predicate) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!opt_predicate) {
    return this.length === 0 ? null : this[this.length - 1];
  }
  for (var len = this.length, i = len - 1; i >= 0; i--) {
    var o = this[i];
    if (opt_predicate(o)) return o;
  }
  return null;
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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  return this.length > 0 ?
      this :
      pn.seq.Seq.create([goog.isDef(opt_default) ? opt_default : null]);
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
  if (!pn.seq.Seq.isSeq_(this)) {
    throw new Error('Source is not a pn.seq.Seq');
  }
  if (!goog.isDefAndNotNull(seed))
    throw new Error('Seed is required and was not provided');
  if (!goog.isDefAndNotNull(accum))
    throw new Error('Accumulattor is required and was not provided');

  return goog.array.reduce(this, function(acc, x) {
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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  if (!opt_comparer) {
    var distinct = [];
    goog.array.removeDuplicates(this, distinct);
    return pn.seq.Seq.create(distinct);
  }
  var filtered = pn.seq.Seq.create([]);
  for (var i = 0, len = this.length; i < len; i++) {
    if (filtered.contains(this[i], opt_comparer)) continue;
    filtered.push(this[i]);
  }
  return pn.seq.Seq.create(filtered);
};


/**
 * Produces the set union of two sequences.
 *
 * @param {!(Array|pn.seq.Seq)} second The second sequence.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The union of the two sequences.
 */
pn.seq.Seq.prototype.union = function(second, opt_comparer) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  return this.concatenate(second).distinct(opt_comparer);
};


/**
 * Produces the set intersection of two sequences.
 *
 * @param {!pn.seq.Seq|!Array} second The second sequence.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The intersection of the two sequences.
 */
pn.seq.Seq.prototype.intersect = function(second, opt_comparer) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!second) throw new Error('second is required and was not provided');
  var results = [];
  for (var i = 0, len = this.length; i < len; i++) {
    var o = this[i];
    if (goog.array.indexOf(second, o) >= 0 && goog.array.indexOf(results, o)) {
      results.push(o);
    }
  }
  return pn.seq.Seq.create(results);
};


/**
 * Produces the set difference of two sequences
 *
 * @param {!pn.seq.Seq|!Array} second The second sequence.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!pn.seq.Seq} The difference of the two sequences.
 */
pn.seq.Seq.prototype.except = function(second, opt_comparer) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!second) throw new Error('second is required and was not provided');

  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!second) throw new Error('second is required and was not provided');
  var results = [];
  for (var i = 0, len = this.length; i < len; i++) {
    var o = this[i];
    if (goog.array.indexOf(second, o) < 0 && goog.array.indexOf(results, o)) {
      results.push(o);
    }
  }
  return pn.seq.Seq.create(results);
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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!keySelector) throw new Error('keySelector was not provided');

  return new pn.seq.Lookup(
      this.source_, keySelector, opt_elementSelector, opt_comparer);
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
pn.seq.Seq.prototype.joinTo =
    function(inner, outKeySelect, inKeySelect, resultSelector, opt_comparer) {
  this.joinValidate_(
      inner, outKeySelect, inKeySelect, resultSelector, opt_comparer);

  var lu = inner.toLookup(inKeySelect, undefined, opt_comparer);
  var results = [];
  this.forEach(function(outerElement) {
    var key = outKeySelect(outerElement);
    lu.get(key).forEach(function(innerElement) {
      results.push(resultSelector(outerElement, innerElement));
    });
  });
  return pn.seq.Seq.create(results);
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
  if (!pn.seq.Seq.isSeq_(this))
    throw new Error('Source is not a pn.seq.Seq');
  if (!keySelect)
    throw new Error('keySelect is required and was not provided');
  if (!elementSelect)
    throw new Error('elementSelect is required and was not provided');

  var lu = this.toLookup(keySelect, elementSelect, opt_comparer);
  return lu.select(function(group) {
    return opt_resultSelect ? opt_resultSelect(group.key, group) : group;
  });
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
  this.joinValidate_(
      inner, outKeySelect, inKeySelect, resultSelector, opt_comparer);

  var lu = inner.toLookup(inKeySelect, undefined, opt_comparer);
  var results = [];

  this.forEach(function(outerElement) {
    var key = outKeySelect(outerElement);
    results.push(resultSelector(outerElement, lu.get(key)));
  });
  return pn.seq.Seq.create(results);
};


/**
 * @private
 * @param {!pn.seq.Seq} inner The sequence to join to the first sequence.
 * @param {!function(*):*} outKeySelect The key of each element in the
 *    outer seq.
 * @param {!function(*):*} inKeySelect The key of each element in the inner seq.
 * @param {function(*, *):*} resultSelector The element from each element.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 */
pn.seq.Seq.prototype.joinValidate_ =
    function(inner, outKeySelect, inKeySelect, resultSelector, opt_comparer) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!pn.seq.Seq.isSeq_(inner)) throw new Error('inner is not a pn.seq.Seq');
  if (!outKeySelect)
    throw new Error('outKeySelect is required and was not provided');
  if (!inKeySelect)
    throw new Error('inKeySelect is required and was not provided');
  if (!resultSelector)
    throw new Error('resultSelector is required and was not provided');
};


/**
 * Takes entries in the sequence until the predicate return false.
 *
 * @param {function(*, number):boolean!} predicate The predicate.
 * @return {!pn.seq.Seq} The sequence.
 */
pn.seq.Seq.prototype.takeWhile = function(predicate) {
  if (!predicate) throw new Error('predicate is required and was not provided');
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  var idx = goog.array.findIndex(this, predicate);
  if (idx < 0) return pn.seq.Seq.EMPTY_;
  return pn.seq.Seq.create(goog.array.splice(this, 0, idx + 1));
};


/**
 * Skips entries in the sequence until the predicate return false.
 *
 * @param {function(*, number):boolean!} predicate The predicate.
 * @return {!pn.seq.Seq} The sequence.
 */
pn.seq.Seq.prototype.skipWhile = function(predicate) {
  if (!predicate) throw new Error('predicate is required and was not provided');
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  var inverted = function(e, idx) { return !predicate(e, idx); };
  var idx = goog.array.findIndex(this, predicate);
  if (idx < 0) return this;
  if (idx === this.length - 1) return pn.seq.Seq.EMPTY_;
  return pn.seq.Seq.create(goog.array.splice(this, idx, this.length - idx));
};


/**
 * Takes entries in the sequence until the the count is reached.
 *
 * @param {number} count The number of items to take.
 * @return {!pn.seq.Seq} The sequence.
 */
pn.seq.Seq.prototype.take = function(count) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
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


/**
 * @param {function(*):*!} keySelector The key selector.
 * @param {function(*):*=} opt_elemSelector The optional element selector.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {!goog.structs.Map} The sequence as a map.
 */
pn.seq.Seq.prototype.toMap =
    function(keySelector, opt_elemSelector, opt_comparer) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  return this.toLookup(keySelector, opt_elemSelector, opt_comparer).getMap();
};


/**
 * Reverses the sequence
 * @return {!pn.seq.Seq} The reversed sequence.
 */
pn.seq.Seq.prototype.reverseSeq = function() {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  var rev = goog.array.clone(this);
  rev.reverse();
  return pn.seq.Seq.create(rev);
};


/**
 * Sums all elements in the sequence with an optional projection
 * @param {function(*):number=} opt_selector An optional projection for
 *    the aggregation.
 * @return {number} The aggregate amount.
 */
pn.seq.Seq.prototype.sum = function(opt_selector) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  var acumm = {sum: 0, count: 0};
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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  var min = 0;
  for (var i = 0, len = this.length; i < len; i++) {
    num = this[i];
    if (opt_selector) num = opt_selector(num, i);
    if (i === 0 || num < min) min = num;
  }
  return min;
};


/**
 * Finds the maximum of all elements in the sequence with an
 *    optional projection
 * @param {function(*,number=):number=} opt_selector An optional projection for
 *    the aggregation.
 * @return {number} The aggregate amount.
 */
pn.seq.Seq.prototype.max = function(opt_selector) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  var max = 0;
  for (var i = 0, len = this.length; i < len; i++) {
    num = this[i];
    if (opt_selector) num = opt_selector(num, i);
    if (i === 0 || num > max) max = num;
  }
  return max;
};


/**
 * Gets the element at the specified index in the sequence.  If the index
 *    is not part of the sequence then an error is raised.
 * @param {number} index The index.
 * @return {*} The element at the given index.
 */
pn.seq.Seq.prototype.elementAt = function(index) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  return index < 0 || index >= this.length ? null : this[index];
};


/**
 * Gets the element at the specified index in the sequence.  If the index
 *    is not part of the sequence then null is returned.
 * @param {number} index The index.
 * @return {*} The element at the given index.
 */
pn.seq.Seq.prototype.elementAtOrNull = function(index) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  return index < 0 || index >= this.length ? null : this[index];
};


/**
 * Wether the sequence contains the specified value
 * @param {*} value The value to find.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {boolean} Wether the specified value was found in the sequence.
 */
pn.seq.Seq.prototype.contains = function(value, opt_comparer) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  var comparer = function(e) {
    return opt_comparer ?
        opt_comparer(e, value) :
        pn.seq.Seq.defaultEquality_(e, value);
  };

  for (var i = 0, len = this.length; i < len; i++) {
    if (comparer(this[i])) { return true; }
  }
  return false;
};


/**
 * Wether this sequence is equivalent to the given 'second' sequence.
 *    Equivalence is determined if the items in the sequence are in the same
 *    order and are equal between both sequences.
 * @param {!(Array|pn.seq.Seq)} second The second sequence to compare.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 * @return {boolean} Wether the sequences are equal.
 */
pn.seq.Seq.prototype.sequenceEquals = function(second, opt_comparer) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!second) throw new Error('second is required and was not provided');
  return goog.array.equals(this, second, opt_comparer);
};


/**
 * Applies a specified function to the corresponding elements of two
 *    sequences, producing a sequence of the results.
 * @param {!(Array|pn.seq.Seq)} second The second sequence to zip.
 * @param {!function(*,*):*} resultSelector The results projection.
 * @return {!pn.seq.Seq} The resulting sequence with items 'zipped'.
*/
pn.seq.Seq.prototype.zip = function(second, resultSelector) {
  if (!pn.seq.Seq.isSeq_(this))
    throw new Error('Source is not a pn.seq.Seq');
  if (!second)
    throw new Error('second is required');
  if (!resultSelector)
    throw new Error('resultSelector is required and was not provided');

  var zipped = goog.array.zip(this, second);
  var tupleSelector = function(tup) {
    return resultSelector.apply(null, tup);
  };
  return pn.seq.Seq.create(goog.array.map(zipped, tupleSelector));
};


/**
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {function(*,*):number=} opt_comparer The comparer.
 * @return {!pn.seq.OrderedSeq} The ordered sequence.
 */
pn.seq.Seq.prototype.orderBy = function(keySelector, opt_comparer) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

  return this.orderByImpl_(keySelector, false, opt_comparer);
};


/**
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {function(*,*):number=} opt_comparer The comparer.
 * @return {!pn.seq.OrderedSeq} The ordered sequence.
 */
pn.seq.Seq.prototype.orderByDescending = function(keySelector, opt_comparer) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');

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
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  if (!keySelector) throw new Error('keySelector was not provided');

  var comparer = opt_comparer || pn.seq.Seq.defaultComparer_;
  var projComparer = new pn.seq.ProjectionComparer(keySelector, comparer);
  if (descending) projComparer = new pn.seq.ReverseComparer(projComparer);
  return new pn.seq.OrderedSeq(this, projComparer);
};


/**
 * Runs an evaluator for every item in the sequence. This method is not in the
 *  .Net LINQ library but it should be.
 * @param {!function(*, number):undefined} evaluator The evaluator to run for
 *    each item in the sequence.
 */
pn.seq.Seq.prototype.doForEach = function(evaluator) {
  if (!pn.seq.Seq.isSeq_(this)) throw new Error('Source is not a pn.seq.Seq');
  goog.array.forEach(this, evaluator);
};



////////////////////////////////////////////////////////////////////////////////
// OrderedEnumerable
////////////////////////////////////////////////////////////////////////////////
/**
 * @constructor
 * @param {!(Array|pn.seq.Seq)} source The source array.
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
  if (!keySelector) throw new Error('keySelector was not provided');
  return this.appendComparer_(keySelector, false, opt_comparer);
};


/**
 * @param {!function(*):*} keySelector The selector of the compare key.
 * @param {function(*,*):number=} opt_comparer The comparer.
 * @return {!pn.seq.OrderedSeq} The ordered sequence.
 */
pn.seq.OrderedSeq.prototype.thenByDescending =
    function(keySelector, opt_comparer) {
  if (!keySelector) throw new Error('keySelector was not provided');
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
  if (!keySelector) throw new Error('keySelector was not provided');
  var comparer = opt_comparer || pn.seq.Seq.defaultComparer_;
  var secondComparer = new pn.seq.ProjectionComparer(keySelector, comparer);
  if (descending) secondComparer = new pn.seq.ReverseComparer(secondComparer);
  secondComparer = new pn.seq.CompoundComparer(this.comparer_, secondComparer);
  return new pn.seq.OrderedSeq(this, secondComparer);
};

////////////////////////////////////////////////////////////////////////////////
// LOOKUP
////////////////////////////////////////////////////////////////////////////////



/**
 * @constructor
 * @extends {pn.seq.Seq}
 * @param {!goog.iter.Iterable} iter The iterable source.
 * @param {!function(*):*} keySelector The key of each element in the seq.
 * @param {function(*):*=} opt_elementSelector The optional element from
 *    each element.
 * @param {function(*, *):boolean=} opt_comparer The optional equality comparer.
 */
pn.seq.Lookup = function(iter, keySelector, opt_elementSelector, opt_comparer) {
  if (!iter) throw new Error('iter is required and was not provided');
  if (!keySelector) throw new Error('keySelector was not provided');
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
  for (var i = 0, len = this.length; i < len; i++) {
    var e = this[i];
    var key = this.keySelector_(e);
    var elem = this.elemSelector_(e, idx++);
    this.set(key, elem);
  }
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
 * @return {number} The index of the key.
 */
pn.seq.Lookup.prototype.indexOfKey_ = function(key) {
  return goog.array.findIndex(this.keys_, function(k) {
    return this.comparer_(k, key);
  }, this);
};


/**
 * @return {!Array.<*>} The array of keys the lookup contains.
 */
pn.seq.Lookup.prototype.getKeys = function() {
  return goog.array.clone(this.keys_);
};


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
 * @param {!goog.iter.Iterable|!pn.seq.Seq} iter The iterable sequence
 *    in this group.
 */
pn.seq.Grouping = function(key, iter) {
  pn.seq.Seq.call(this, iter);

  /** @type {*} */
  this.key = key;
};
goog.inherits(pn.seq.Grouping, pn.seq.Seq);
