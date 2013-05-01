;
goog.provide('pn.data.BaseDalCache');



/**
 * @constructor
 * @param {!Object.<!Array.<pn.data.Entity>>} cache The current context cache.
 */
pn.data.BaseDalCache = function(cache) {
  pn.assObj(cache);
  pn.ass(goog.object.every(cache, goog.isArray));

  /**
   * @private
   * @type {!Object.<!Array.<pn.data.Entity>>}
   */
  this.cache_ = {};

  // This handles LocalCache style query results that have Type:Linq
  //  map keys.
  for (var key in cache) {
    var type = key.split(':')[0];
    pn.ass(!(type in this.cache_));
    var arr = cache[key];
    pn.ass(goog.array.isSorted(arr, function(a, b) { return a.id - b.id; }),
        'Array of type: %s is not sorted.'.pnsubs(type));
    this.cache_[type] = arr;

    // Should always be ordered for performance.
    pn.ass(goog.array.isSorted(arr));
  }
};


/**
 * @param {string} type The type to retreive from the cache.
 * @return {!Array.<pn.data.Entity>} A copy of the entities of the
 *    specified type.
 */
pn.data.BaseDalCache.prototype.get = function(type) {
  return this.getImpl_(type).pnclone();
};


/**
 * @private
 * @param {string} type The type to retreive from the cache.
 * @return {!Array.<pn.data.Entity>} The entities of the specified type.
 */
pn.data.BaseDalCache.prototype.getImpl_ = function(type) {
  pn.assStr(type);

  var arr = this.cache_[type];
  if (!arr) throw new Error('Type: ' + type + ' not in cache.');
  pn.ass(goog.array.isSorted(arr, function(a, b) { return a.id - b.id; }),
      'Array of type: %s is not sorted.'.pnsubs(type));
  return arr;
};


/**
 * @param {string} type The type to retreive from the cache.
 * @param {number} id The ID of the entity of the specified type to retreive.
 * @return {!pn.data.Entity} The entities of the specified type.
 */
pn.data.BaseDalCache.prototype.getEntity = function(type, id) {
  pn.assStr(type);
  pn.ass(goog.isNumber(id) && id > 0);

  var arr = this.getImpl_(type);
  pn.ass(goog.array.isSorted(arr, function(a, b) { return a.id - b.id; }));
  var idx = goog.array.binarySelect(arr, function(e) { return id - e.id; });
  pn.ass(idx >= 0, 'Could not find entity of type :%s id: %s'.pnsubs(type, id));
  return /** @type {!pn.data.Entity} */ (arr[idx]);
};


/**
 * @param {!pn.data.BaseDalCache} source The source cache to add to this cache.
 *    NOTE: This will replace any elements in the source array.
 */
pn.data.BaseDalCache.prototype.extend = function(source) {
  pn.assInst(source, pn.data.BaseDalCache);

  for (var type in source.cache_) {
    this.cache_[type] = source.cache_[type];
  }
};
