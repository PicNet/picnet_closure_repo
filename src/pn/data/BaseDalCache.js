;
goog.provide('pn.data.BaseDalCache');



/**
 * @constructor
 * @param {!Object.<!Array.<pn.data.Entity>>} cache The current context cache.
 */
pn.data.BaseDalCache = function(cache) {
  goog.asserts.assert(cache);

  /**
   * @private
   * @type {!Object.<!Array.<pn.data.Entity>>}
   */
  this.cache_ = cache;
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
