;
goog.provide('pn.data.LocalCache');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('pn.data.BaseDalCache');
goog.require('pn.data.LinqParser');
goog.require('pn.data.Query');
goog.require('pn.json');
goog.require('pn.storage');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.data.LocalCache = function() {
  goog.Disposable.call(this);

  /** @type {number} */
  this.lastUpdate = 0;

  /**
   * @private
   * @const
   * @type {string}
   */
  this.STORE_PREFIX_ = 'LOCAL_DATA_CACHE:';

  /**
   * @private
   * @type {!Object.<string, !Array.<pn.data.Entity>>}
   */
  this.cache_ = {};

  /**
   * @private
   * @type {!Object.<!pn.data.Query>}
   */
  this.cachedQueries_ = [];

  this.init_();
};
goog.inherits(pn.data.LocalCache, goog.Disposable);


/**
 * Gets an entity from the local cache.  If this entity does not exist in the
 *    client cache then an error is thrown.
 *
 * @param {string} type The type of entity to query.
 * @param {number} id The ID of the entity to retreive.
 * @return {!pn.data.Entity} The entity with the specified id.
 */
pn.data.LocalCache.prototype.getEntity = function(type, id) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(type in this.cache_, type + ' not in cache');
  goog.asserts.assert(goog.isNumber(id) && id !== 0);

  var en = this.cache_[type].pnsingle(function(entity) {
    return entity.id === id;
  }, this);
  return en;
};


/**
 * TODO: When creating a new entity it is now detached form this cache.  This
 * method should return the created entity so it is 'live'.
 *
 * Creates a local entity with a temporary ID.
 * @param {!pn.data.Entity} entity The entity to create.  Since this is an
 *    instance of a new data.Entity its ID should be 0 until a temp ID is
 *    assigned here.
 * @return {!pn.data.Entity} The same entity is returned but its ID property
 *    is now set to the temporary ID and the entity is 'live'.
 */
pn.data.LocalCache.prototype.createEntity = function(entity) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(entity.type in this.cache_,
      entity.type + ' not in cache');
  goog.asserts.assert(entity.id < 0);

  this.cache_[entity.type].push(entity);
  this.flush_(entity.type);

  return entity;
};


/**
 * Updates a local entity with an optional temporary ID.
 * @param {!pn.data.Entity} entity The entity to update.
 * @param {number=} opt_tmpid The optional temporary ID if we need to update
 *    an entity that has not hit the server yet.
 */
pn.data.LocalCache.prototype.updateEntity = function(entity, opt_tmpid) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(!goog.isDef(opt_tmpid) ||
      (goog.isNumber(opt_tmpid) && opt_tmpid < 0));

  var id = opt_tmpid || entity.id;
  var list = this.cache_[entity.type];
  var found = false;
  for (var i = 0, len = list.length; i < len; i++) {
    var e = list[i];
    if (e.id === id) { list[i] = entity; found = true; break; }
  }
  if (!found) throw new Error('Could not find entity: ' +
      entity.type + '.' + entity.id + ' in the cache.');

  // entity.update(); // TODO: fire live entity changed

  this.flush_(entity.type);
};


/**
 * Deletes a local entity .
 * @param {!string} type The type of the entity to delete.
 * @param {number} id The ID of the entity to delete.
 */
pn.data.LocalCache.prototype.deleteEntity = function(type, id) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(type in this.cache_, type + ' not in cache');
  goog.asserts.assert(goog.isNumber(id) && id !== 0);

  // var live = this.getEntity(type, id);
  // live.delete(); // TODO: fire live entity deleted

  this.cache_[type] = goog.array.filter(this.cache_[type],
      function(e) { return e.id !== id; });
  this.flush_(type);
};


/**
 * If there is an issue deleting an entity on the server then call this to
 *    revert the delete operation.  This basically recreates the entity.
 * @param {!pn.data.Entity} entity The entity to undelete.
 */
pn.data.LocalCache.prototype.undeleteEntity = function(entity) {
  goog.asserts.assert(entity instanceof pn.data.Entity);

  this.cache_[entity.type].push(entity);
  this.flush_(entity.type);
};


/**
 * Wether this cache has the specified type primed.
 * @param {!pn.data.Query} query The query type to check.
 * @return {boolean} Wether the specified type list exists in this cache.
 */
pn.data.LocalCache.prototype.contains = function(query) {
  goog.asserts.assert(query instanceof pn.data.Query);
  return (query.Type in this.cache_);
};


/**
 * @param {!Array.<pn.data.Query>} queries The queries to execute.
 * @return {!Object.<!Array.<pn.data.Entity>>} The query results.
 */
pn.data.LocalCache.prototype.query = function(queries) {
  return queries.pnreduce(goog.bind(function(results, q) {
    goog.asserts.assert(q instanceof pn.data.Query);

    goog.asserts.assert(q.Type in this.cache_, 'The type: ' + q.Type +
        ' does not exist in the local cache');

    var list = this.cache_[q.Type];
    if (q.Linq) {
      var filter = pn.data.LinqParser.parse(q.Linq);
      list = filter(list);
    }
    results[q.toString()] = list;
    return results;
  }, this), {});
};


/** @return {!Array.<!pn.data.Query>} The cached queries. */
pn.data.LocalCache.prototype.getCachedQueries = function() {
  return goog.object.getValues(this.cachedQueries_);
};


/**
 * @param {pn.data.Query} query The query to save.
 * @param {!Array.<pn.data.Entity>} list The list of entities to save against
 *    the specified type.
 */
pn.data.LocalCache.prototype.saveQuery = function(query, list) {
  goog.asserts.assert(query instanceof pn.data.Query);
  goog.asserts.assert(goog.isArray(list));

  var type = query.Type;
  var current = this.cache_[type];
  if (current) {
    // TODO: Instead of just 'Union'ing the lists we should actually update
    // any entity that needs updates.
    var existing = current.pnfilter(function(e) {
      return list.pnfindIndex(function(newe) {
        return newe.id === e.id;
      }) < 0;
    });
    list = list.pnconcat(existing);
  }
  this.cache_[type] = list;
  var qid = query.toString();
  this.cachedQueries_[qid] = query;
  this.flush_(type);
  this.flushCachedQueries_();
};


/** @private */
pn.data.LocalCache.prototype.init_ = function() {
  var cachedtime = pn.storage.get(this.STORE_PREFIX_ + 'version');
  this.lastUpdate = cachedtime ? parseInt(cachedtime, 10) : 0;

  var queriesJson = pn.storage.get(this.STORE_PREFIX_ + 'queries');
  if (queriesJson) {
    var arr = /** @type {!Array.<string>} */ (pn.json.parseJson(queriesJson));
    this.cachedQueries_ = arr.pnreduce(function(acc, qstr) {
      var query = pn.data.Query.fromString(qstr);
      acc[qstr] = query;
      return acc;
    }, {});
  } else { this.cachedQueries_ = {}; }
  var parse = goog.bind(function(type) {
    return pn.json.parseJson(pn.storage.get(this.STORE_PREFIX_ + type));
  }, this);

  if (!queriesJson) {
    if (this.lastUpdate > 0) {
      throw 'Last update time is set but the cache is empty.';
    }
    this.cache_ = {};
    return;
  }

  this.cache_ = {};
  for (var qid in this.cachedQueries_) {
    var query = pn.data.Query.fromString(qid);

    var rawList = parse(query.Type);
    goog.asserts.assert(goog.isArray(rawList));

    var list = pn.data.TypeRegister.parseEntities(query.Type, rawList);
    this.cache_[query.Type] = list;
  }
};


/**
 * @private
 * @param {string} type The type (cache key) to flush to disk.
 */
pn.data.LocalCache.prototype.flush_ = function(type) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(type in this.cache_, type + ' not in cache');

  var list = this.cache_[type];
  var json = pn.json.serialiseJson(list, true);
  pn.storage.set(this.STORE_PREFIX_ + type, json);
};


/** @private */
pn.data.LocalCache.prototype.flushCachedQueries_ = function() {
  var json = pn.json.serialiseJson(goog.object.getKeys(this.cachedQueries_));
  pn.storage.set(this.STORE_PREFIX_ + 'queries', json);
};
