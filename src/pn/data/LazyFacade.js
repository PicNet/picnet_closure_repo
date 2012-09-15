
goog.provide('pn.data.LazyFacade');
goog.require('pn.data.BaseFacade');

/**
 * @constructor
 * @extends {pn.data.Facade}
 */
pn.data.LazyFacade = function() {};

/** 
 * This implementation of getLastUpdate avoids the facade ever getting 
 *    a full update from the server if it has never been intialised.
 *
 * @override 
 */
pn.data.BaseFacade.prototype.getLastUpdate = function() {
  var val = pn.data.BaseFacade.superClass_.getLastUpdate.call(this);
  return val || Number.MAX_VALUE;
};

/** 
 * The LazyFacade does not try to get the full data from the server on the
 *    first request, instead it needs to be 'primed' by querying each type
 *    before its used in the application.
 *
 * @override 
 */
pn.data.LazyFacade.prototype.query = function(queries, callback) {  
  var available = goog.array.filter(queries, 
      function(q) { return this.cache.contains(q); }, this);
  var unloaded = goog.array.filter(queries, 
      function(q) { return !this.cache.contains(q); }, this);
  var cached = this.cache.query(available);

  this.server.query(unloaded, goog.bind(function(results) {
    goog.object.forEach(results, 
        function(list, key) { this.cache.saveQuery(key, list); }, this);
    goog.object.extend(cached, results);
    callback(cached);
  }, this));
};