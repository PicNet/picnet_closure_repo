;
goog.provide('pn.data.LazyFacade');
goog.require('pn.data.BaseFacade');



/**
 * @constructor
 * @extends {pn.data.BaseFacade}
 * @param {string} controller The controller uri for the server.
 */
pn.data.LazyFacade = function(controller) {
  pn.data.BaseFacade.call(this, controller);
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
  return val || Number.MAX_VALUE;
};


/** @override */
pn.data.LazyFacade.prototype.sync = function() {
  var queries = this.cache.getCachedQueries();
  this.server.getQueryUpdates(queries, this.getLastUpdate(),
      goog.bind(this.parseServerResponse_, this),
      goog.bind(this.handleError_, this));
};


/**
 * The LazyFacade does not try to get the full data from the server on the
 *    first request, instead it needs to be 'primed' by querying each type
 *    before its used in the application.
 *
 * @override
 */
pn.data.LazyFacade.prototype.queryImpl = function(queries, callback) {
  goog.asserts.assert(goog.isArray(queries) && queries.length > 0);
  goog.asserts.assert(goog.isFunction(callback));

  var available = goog.array.filter(queries,
      function(q) { return this.cache.contains(q); }, this);
  var unloaded = goog.array.filter(queries,
      function(q) { return !this.cache.contains(q); }, this);

  var cached = this.cache.query(available);
  if (unloaded.length === 0) {
    callback(cached);
  } else {
    this.server.query(unloaded, this.getLastUpdate(),
        goog.bind(this.parseServerResponse_, this, function(results) {
          goog.object.forEach(results, function(data, key) {
            var list = data['List'];
            var lastUpdate = data['LastUpdate'];
            goog.asserts.assert(goog.isArray(list));
            goog.asserts.assert(goog.isNumber(lastUpdate) && lastUpdate > 0);

            var query = pn.data.Query.fromString(key);
            this.cache.saveQuery(query, lastUpdate, list);
          }, this);
          goog.object.extend(cached, results);
          callback(cached);
        }), goog.bind(this.handleError_, this));
  }
};
