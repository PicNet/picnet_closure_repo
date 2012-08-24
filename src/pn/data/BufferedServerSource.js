;
goog.provide('pn.data.BufferedServerSource');

goog.require('goog.debug.Logger');
goog.require('goog.events.Event');
goog.require('goog.net.XhrManager');
goog.require('goog.style');
goog.require('pn.app.AppEvents');
goog.require('pn.data.DataDownloader');
goog.require('pn.data.IDataSource');
goog.require('pn.data.MemCache');
goog.require('pn.data.ServerSource');
goog.require('pn.json');
goog.require('pn.log');



/**
 * @constructor
 * @extends {pn.data.ServerSource}
 * @param {number} bufferExpireMins The number of minutes to buffer the server
 *    requests by.
 */
pn.data.BufferedServerSource = function(bufferExpireMins) {
  pn.data.ServerSource.call(this);

  /**
   * @private
   * @type {!pn.data.MemCache}
   */
  this.cache_ = new pn.data.MemCache(bufferExpireMins);
  this.registerDisposable(this.cache_);
};
goog.inherits(pn.data.BufferedServerSource, pn.data.ServerSource);


/** @override */
pn.data.BufferedServerSource.prototype.getEntityLists =
    function(types, callback) {
  goog.asserts.assert(types);
  goog.asserts.assert(callback);

  var strtypes = goog.array.map(types, function(t) { return t.type; });
  var loaded = this.cache_.getLists(strtypes);
  var unloaded = goog.array.filter(types,
      function(type) { return !goog.isDef(loaded[type.type]); });

  if (!unloaded.length) {
    callback(loaded);
    return;
  }

  pn.data.BufferedServerSource.superClass_.getEntityLists.call(this, types,
      goog.bind(function(results) {
        goog.object.forEach(results,
            function(arr, type) { this.cache_.updateList(type, arr); }, this);
        goog.object.extend(loaded, results);
        callback(loaded);
      }, this));
};


/**
 * Removes a type from the cache, meaning that next time the request for this
 *    type comes in, it will need to be sourced from the server.
 * @param {pn.data.Type} type The type to remove from the cache.
 */
pn.data.BufferedServerSource.prototype.invalidateCache = function(type) {
  goog.asserts.assert(goog.isFunction(type));
  this.cache_.invalidateCache(type.type);
};


/**
 * @param {pn.data.Type} type The type to retreive from the cache.
 * @return {Array.<!Object>} The cached list if it exists in the cache.
 */
pn.data.BufferedServerSource.prototype.getCachedList = function(type) {
  goog.asserts.assert(goog.isFunction(type));
  return this.cache_.getCachedList(type.type);
};
