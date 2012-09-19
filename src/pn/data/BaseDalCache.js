;
goog.provide('pn.data.BaseDalCache');



/**
 * @constructor
 * @param {!Object.<!Array.<pn.data.Entity>>} cache The current context cache.
 */
pn.data.BaseDalCache = function(cache) {
  goog.asserts.assert(goog.isObject(cache));
  goog.asserts.assert(goog.object.every(cache, goog.isArray));

  /**
   * @private
   * @type {!Object.<!Array.<pn.data.Entity>>}
   */
  this.cache_ = {};
  // This handles LocalCache style query results that have Type:Linq
  //  map keys.
  for (var key in cache) {
    var type = key.split(':')[0];
    goog.asserts.assert(!(type in this.cache_));
    this.cache_[type] = cache[key];
  }
};


/**
 * @param {string} type The type to retreive from the cache.
 * @return {!Array.<pn.data.Entity>} The entities of the specified type.
 */
pn.data.BaseDalCache.prototype.get = function(type) {
  goog.asserts.assert(goog.isString(type));

  var arr = this.cache_[type];
  if (!arr) throw new Error('Type: ' + type + ' not in cache.');
  return arr;
};
