;
goog.provide('pn.data.LazyFacade');

goog.require('pn.data.BaseFacade');
goog.require('pn.data.Query');



/**
 * @constructor
 * @extends {pn.data.BaseFacade}
 * @param {!pn.data.LocalCache} cache The local cache.
 * @param {!pn.data.Server} server The remote server source.
 */
pn.data.LazyFacade = function(cache, server) {
  pn.assInst(cache, pn.data.LocalCache);
  pn.assInst(server, pn.data.Server);

  /**
   * @private
   * @type {number}
   */
  this.defaultTime_ = new Date(3000, 1, 1).getTime();

  pn.data.BaseFacade.call(this, cache, server);
};
goog.inherits(pn.data.LazyFacade, pn.data.BaseFacade);


/**
 * This implementation of getLastUpdate avoids the facade ever getting
 *    a full update from the server if it has never been intialised.
 *
 * @override
 */
pn.data.LazyFacade.prototype.getLastUpdate = function() {
  var val = pn.data.LazyFacade.superClass_.getLastUpdate.call(this);
  return goog.isDef(val) ? val : this.defaultTime_;
};


/** @override */
pn.data.LazyFacade.prototype.sync = function() {
  var queries = this.cache.getCachedQueries();
  if (queries.length === 0) return;

  this.server.getQueryUpdates(queries, this.getLastUpdate(),
      goog.bind(this.parseServerResponse, this),
      goog.bind(this.handleError, this));
};


/**
 * The LazyFacade does not try to get the full data from the server on the
 *    first request, instead it needs to be 'primed' by querying each type
 *    before its used in the application.
 *
 * @override
 */
pn.data.LazyFacade.prototype.queryImpl = function(queries, callback) {
  pn.ass(goog.isArray(queries) && queries.length > 0);
  pn.assFun(callback);

  var cachedQueries = this.cache.getCachedQueries();
  queries.pnforEach(function(q) { cachedQueries.pnremove(q); });

  var loaded = queries.pnfilter(
      function(q) { return this.cache.contains(q); }, this);
  var unloaded = queries.pnfilter(
      function(q) { return !this.cache.contains(q); }, this);

  var cached = this.cache.query(loaded);
  if (unloaded.length === 0) {
    callback(cached);
  } else {
    this.server.query(unloaded, cachedQueries, this.getLastUpdate(),
        goog.bind(this.parseServerResponse, this, function(results) {
          goog.object.forEach(results, function(list, key) {
            pn.assArr(list);

            cached[key] = list;
            var query = pn.data.Query.fromString(key);
            this.cache.saveQuery(query, list);
          }, this);
          callback(cached);
        }), goog.bind(this.handleError, this));
  }
};
