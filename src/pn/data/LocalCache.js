;
goog.provide('pn.data.LocalCache');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('pn.data.BaseDalCache');
goog.require('pn.data.LinqParser');
goog.require('pn.data.PnQuery');
goog.require('pn.data.TypeRegister');
goog.require('pn.json');
goog.require('pn.log');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {string} dbver The current db version.
 * @param {string=} opt_cachePrefix An optional prefix to use for all
 *    read/writes from/to the local cache.
 */
pn.data.LocalCache = function(dbver, opt_cachePrefix) {
  goog.Disposable.call(this);
  if (!window.localStorage)
    throw new Error('The current browser is not supported');

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.data.LocalCache');

  /**
   * @private
   * @type {number}
   */
  this.lastUpdate_ = 0;

  /**
   * @private
   * @const
   * @type {string}
   */
  this.dbver_ = dbver;

  /**
   * @private
   * @const
   * @type {string}
   */
  this.STORE_PREFIX_ = (opt_cachePrefix ?
      opt_cachePrefix : '' + 'LOCAL_DATA_CACHE:');

  /**
   * @private
   * @type {!Object.<string, !Array.<pn.data.Entity>>}
   */
  this.cache_ = {};

  /**
   * @private
   * @type {!Object.<!pn.data.PnQuery>}
   */
  this.cachedQueries_ = [];

  /**
   * @private
   * @type {Array.<string>}
   */
  this.transaction_ = null;

  this.checkDbVer_();
  this.init_();
};
goog.inherits(pn.data.LocalCache, goog.Disposable);


/**
 * Disables the local cache.
 * @private
 * @const
 * @type {boolean}
 */
pn.data.LocalCache.OFF_ = true;


/** Begins a transaction */
pn.data.LocalCache.prototype.begin = function() {
  if (this.transaction_) throw new Error('A transaction is already active');
  this.transaction_ = [];
};


/** Commits the active transaction */
pn.data.LocalCache.prototype.commit = function() {
  this.transaction_.
      pnremoveDuplicates().
      pnforEach(this.flush_, this);
  this.transaction_ = null;
  this.flushCachedQueries_();
};


/**
 * Gets an entity from the local cache.  If this entity does not exist in the
 *    client cache then an error is thrown.
 *
 * @param {string} type The type of entity to query.
 * @param {number} id The ID of the entity to retreive.
 * @return {!pn.data.Entity} The entity with the specified id.
 */
pn.data.LocalCache.prototype.getEntity = function(type, id) {
  pn.assStr(type);
  pn.ass(type in this.cache_, type + ' not in cache');
  pn.ass(goog.isNumber(id) && id !== 0);

  return /** @type {!pn.data.Entity} */ (this.cache_[type].pnsingle(
      function(entity) { return entity.id === id; }, this));
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
  pn.assInst(entity, pn.data.Entity);
  pn.ass(entity.type in this.cache_,
      entity.type + ' not in cache');
  pn.ass(entity.id < 0);
  this.cache_[entity.type].push(entity);

  if (this.transaction_) this.transaction_.push(entity.type);
  else this.flush_(entity.type);

  return entity;
};


/**
 * Updates a local entity with an optional temporary ID.
 * @param {!pn.data.Entity} entity The entity to update.
 * @param {number=} opt_tmpid The optional temporary ID if we need to update
 *    an entity that has not hit the server yet.
 */
pn.data.LocalCache.prototype.updateEntity = function(entity, opt_tmpid) {
  pn.assInst(entity, pn.data.Entity);
  pn.ass(!goog.isDef(opt_tmpid) ||
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

  if (this.transaction_) this.transaction_.push(entity.type);
  else this.flush_(entity.type);
};


/**
 * Deletes a local entity .
 * @param {!string} type The type of the entity to delete.
 * @param {number} id The ID of the entity to delete.
 */
pn.data.LocalCache.prototype.deleteEntity = function(type, id) {
  pn.assStr(type);
  pn.ass(type in this.cache_, type + ' not in cache');
  pn.ass(goog.isNumber(id) && id !== 0);

  // var live = this.getEntity(type, id);
  // live.delete(); // TODO: fire live entity deleted

  this.cache_[type] = this.cache_[type].pnfilter(
      function(e) { return e.id !== id; });

  if (this.transaction_) this.transaction_.push(type);
  else this.flush_(type);
};


/**
 * If there is an issue deleting an entity on the server then call this to
 *    revert the delete operation.  This basically recreates the entity.
 * @param {!pn.data.Entity} entity The entity to undelete.
 */
pn.data.LocalCache.prototype.undeleteEntity = function(entity) {
  pn.assInst(entity, pn.data.Entity);
  pn.ass(entity.id > 0, 'Entity ' + entity.type + ' does not have an ID');

  if (!(entity.type in this.cache_)) this.cache_[entity.type] = [];
  var entities = this.cache_[entity.type];
  // If this entity already exists in cache (was added locally) then we can
  // just update it.
  var idx = entities.pnfindIndex(function(e2) {
    return e2.id === entity.id;
  });

  if (idx < 0) {
    goog.array.binaryInsert(entities, entity, function(a, b) {
      return goog.array.defaultCompare(a.id, b.id);
    });
  } else {
    entities[idx] = entity;
  }

  if (this.transaction_) this.transaction_.push(entity.type);
  else this.flush_(entity.type);
};


/**
 * Wether this cache has the specified type primed.
 * @param {!pn.data.PnQuery} query The query type to check.
 * @return {boolean} Wether the specified type list exists in this cache.
 */
pn.data.LocalCache.prototype.contains = function(query) {
  pn.assInst(query, pn.data.PnQuery);
  return (query.Type in this.cache_);
};


/**
 * @param {!Array.<pn.data.PnQuery>} queries The queries to execute.
 * @return {!Object.<!Array.<pn.data.Entity>>} The query results.
 */
pn.data.LocalCache.prototype.query = function(queries) {
  return queries.pnreduce(goog.bind(function(results, q) {
    pn.assInst(q, pn.data.PnQuery);

    pn.ass(q.Type in this.cache_, 'The type: ' + q.Type +
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


/** @return {!Array.<!pn.data.PnQuery>} The cached queries. */
pn.data.LocalCache.prototype.getCachedQueries = function() {
  return goog.object.getValues(this.cachedQueries_);
};


/**
 * @param {pn.data.PnQuery} query The query to save.
 * @param {!Array.<pn.data.Entity>} list The list of entities to save against
 *    the specified type.
 */
pn.data.LocalCache.prototype.saveQuery = function(query, list) {
  pn.assInst(query, pn.data.PnQuery);
  pn.assArr(list);

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

  if (this.transaction_) this.transaction_.push(type);
  else {
    this.flush_(type);
    this.flushCachedQueries_();
  }
};


/** @return {number} The last updated date in millis. */
pn.data.LocalCache.prototype.getLastUpdate = function() {
  return this.lastUpdate_;
};


/** @param {number} lastUpdate The last updated date in millis. */
pn.data.LocalCache.prototype.setLastUpdate = function(lastUpdate) {
  this.lastUpdate_ = lastUpdate;
  if (!pn.data.LocalCache.OFF_)
    window.localStorage[this.key_('last')] = lastUpdate.toString();
};


/** @private */
pn.data.LocalCache.prototype.checkDbVer_ = function() {
  if (pn.data.LocalCache.OFF_) return;

  var exp = window.localStorage[this.STORE_PREFIX_ + 'dbver'];
  if (!this.dbver_ || this.dbver_ === exp) { return; }

  this.log_.info('Clearing the LocalCache. Version mismatch [' +
      exp + '] != [' + this.dbver_ + ']');

  if (exp) this.clear_();
  window.localStorage[this.STORE_PREFIX_ + 'dbver'] = this.dbver_;
};


/** @private */
pn.data.LocalCache.prototype.clear_ = function() {
  if (pn.data.LocalCache.OFF_) return;

  var ls = window.localStorage,
      len = ls.length;
  try {
    for (var i = 0; i < len; i++) {
      var key = ls.key(i) || '';
      if (key && goog.string.startsWith(key, this.STORE_PREFIX_))
        ls.removeItem(key);
    }
  } catch (ex) { ls.clear(); } // IE9 bug workaround.
};


/** @private */
pn.data.LocalCache.prototype.init_ = function() {
  var queriesJson;
  if (pn.data.LocalCache.OFF_ ||
      !(queriesJson = window.localStorage[this.key_('queries')])) {
    this.cachedQueries_ = {};
    this.lastUpdate_ = 0;
    this.cache_ = {};
    return;
  }

  var cachedtime = window.localStorage[this.key_('last')];
  this.lastUpdate_ = cachedtime ? parseInt(cachedtime, 10) : 0;

  var arr = /** @type {!Array.<string>} */ (pn.json.parseJson(queriesJson));
  this.cachedQueries_ = arr.pnreduce(function(acc, qstr) {
    var query = pn.data.PnQuery.fromString(qstr);
    acc[qstr] = query;
    return acc;
  }, {});

  var parse = goog.bind(function(type) {
    return pn.json.parseJson(window.localStorage[this.key_(type)]);
  }, this);

  this.cache_ = {};
  var queriesToRemove = [];
  for (var qid in this.cachedQueries_) {
    var query = pn.data.PnQuery.fromString(qid);

    var rawList = parse(query.Type);
    if (!goog.isDef(rawList)) {
      queriesToRemove.push(qid);
      continue;
    }

    pn.assArr(rawList);
    var ctor = pn.data.TypeRegister.fromName(query.Type);
    var entities = rawList.pnmap(function(data) {
      var e = new ctor({});
      e.fromCompressed(data);
      return e;
    });
    this.cache_[query.Type] = entities;
  }
  queriesToRemove.pnforEach(function(qid) {
    delete this.cachedQueries_[qid];
  }, this);
};


/**
 * @private
 * @param {string} type The type (cache key) to flush to disk.
 */
pn.data.LocalCache.prototype.flush_ = function(type) {
  if (pn.data.LocalCache.OFF_) return;
  pn.assStr(type);
  pn.ass(type in this.cache_, type + ' not in cache');

  var start = goog.now();

  var list = this.cache_[type].pnmap(function(e) { return e.toCompressed(); });
  var json = pn.json.serialiseJson(list, true);
  this.log_.info('Adding type[' + type + '] length[' +
      list.length + '] json[' + json.length + '] to cache');

  window.localStorage[this.key_(type)] = json;

  var took = goog.now() - start;
  this.log_.info('Flushed "' + type + '" took ' + took + 'ms.');
};


/** @private */
pn.data.LocalCache.prototype.flushCachedQueries_ = function() {
  var json = pn.json.serialiseJson(goog.object.getKeys(this.cachedQueries_));
  window.localStorage[this.key_('queries')] = json;
};


/**
 * @private
 * @param {string} key The unapplication specific key to retreive.
 * @return {string} The application (and version) specific version of the
 *    specified key.
 */
pn.data.LocalCache.prototype.key_ = function(key) {
  return this.STORE_PREFIX_ + this.dbver_ + ':' + key;
};
