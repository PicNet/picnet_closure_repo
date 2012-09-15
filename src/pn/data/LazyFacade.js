
goog.provide('pn.data.LazyFacade');
goog.require('pn.data.BaseFacade');

/**
 * @constructor
 * @extends {pn.data.Facade}
 */
pn.data.LazyFacade = function() {};

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