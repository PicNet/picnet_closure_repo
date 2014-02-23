;
goog.provide('pn.data.BaseFacade');

goog.require('goog.events.EventHandler');
goog.require('pn.app.EventHandlerTarget');
goog.require('pn.data.Entity');
goog.require('pn.data.LocalCache');
goog.require('pn.data.PnQuery');
goog.require('pn.data.Server');
goog.require('pn.log');
goog.require('pn.web.WebAppEvents');



/**
 * An optimistic (Client assumes the server will succeed) Facade.
 *
 * @constructor
 * @extends {pn.app.EventHandlerTarget}
 * @param {!pn.data.LocalCache} cache The local cache.
 * @param {!pn.data.Server} server The remote server source.
 */
pn.data.BaseFacade = function(cache, server) {
  pn.assInst(cache, pn.data.LocalCache);
  pn.assInst(server, pn.data.Server);

  pn.app.EventHandlerTarget.call(this);

  /**
   * @protected
   * @type {!pn.data.LocalCache}
   */
  this.cache = cache;


  /**
   * @protected
   * @type {!pn.data.Server}
   */
  this.server = server;


  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.data.BaseFacade');

  /**
   * @private
   * @type {number}
   */
  this.timerid_ = 0;

  this.proxyServerEvents_();
  this.startUpdateInterval_();
};
goog.inherits(pn.data.BaseFacade, pn.app.EventHandlerTarget);

////////////////////////////////////////////////////////////////////////////////
// PUBLIC INTERFACE
////////////////////////////////////////////////////////////////////////////////


/**
 * DISSABLED AS ITS CAUSING ISSUES.
 * @private
 * @const
 * @type {boolean}
 */
pn.data.BaseFacade.SYNC_ = false;


/**
 * Makes an arbitrary ajax call to the server.  The results are then
 *    inspected for entities and appropriate caches updated.
 *
 * @param {string} uri The relative uri of the server endpoint.
 * @param {!Object} data The request data.
 * @param {function(?):undefined} callback The success callback.
 */
pn.data.BaseFacade.prototype.ajax = function(uri, data, callback) {
  pn.assStr(uri);
  pn.assObj(data);
  pn.assFun(callback);

  this.log_.info('ajax: ' + uri);

  this.server.ajax(uri, data,
      goog.bind(this.parseServerResponse, this, callback),
      goog.bind(this.handleError, this));
};


/**
 * Gets an entity from the local cache.  If this entity does not exist in the
 *    client cache then an error is thrown.  So you must ensure that the cache
 *    is primed (Facade.query) prior to calling getEntity.
 *
 * @param {string} type The type of entity to query.
 * @param {number} id The ID of the entity to retreive.
 * @return {!pn.data.Entity} The entity with the specified id.
 */
pn.data.BaseFacade.prototype.getEntity = function(type, id) {
  pn.assStr(type);
  pn.assNum(id);

  this.log_.info('getEntity: ' + type + '#' + id);

  return this.cache.getEntity(type, id);
};


/**
 * Creates an entity optimistically.  This is done by creating the entity in the
 *    local cache first and assigning a temporary ID.  This request is then
 *    sent to the server and if succeeds the client updates with the proper
 *    server ID.  Otherwise the client creation is rolled back.
 *
 * @param {!pn.data.Entity} entity The entity to create.
 * @param {function(!pn.data.Entity):undefined} callback The success callback
 *    that takes the created entity with the new ID value.
 */
pn.data.BaseFacade.prototype.createEntity = function(entity, callback) {
  pn.assInst(entity, pn.data.Entity);
  pn.ass(entity.id <= 0);
  pn.assFun(callback);

  this.log_.info('createEntity: ' + entity.type + '#' + entity.id);

  this.server.createEntity(entity,
      goog.bind(this.parseServerResponse, this, callback),
      goog.bind(this.handleError, this));
};


/**
 * Updates an entity in the client cache then returns control. The update is
 *    then sent to the server.
 *
 * @param {!pn.data.Entity} entity The entity to update.
 * @param {function(!pn.data.Entity):undefined} callback The success callback
 *    that takes the updated entity.
 */
pn.data.BaseFacade.prototype.updateEntity = function(entity, callback) {
  pn.assInst(entity, pn.data.Entity);
  pn.ass(entity.id > 0);
  pn.assFun(callback);

  this.log_.info('updateEntity: ' + entity.type + '#' + entity.id);

  var current = this.cache.getEntity(entity.type, entity.id);

  this.cache.updateEntity(entity);

  var onsuccess = function(entity2) {
    if (entity2.hasProp('DateLastUpdated')) {
      entity.setValue('DateLastUpdated', entity2.getValue('DateLastUpdated'));
    }
    pn.ass(entity.equals(entity2));
    callback(entity2);
  };

  var onfail = goog.bind(function(error, opt_ex) {
    this.cache.updateEntity(current); // Revert client cache
    this.handleError(error, opt_ex);
  }, this);

  this.server.updateEntity(entity,
      goog.bind(this.parseServerResponse, this, onsuccess),
      onfail);
};


/**
 * @param {!pn.data.Entity} entity The entity to delete.
 * @param {function():undefined} callback The success callback.
 */
pn.data.BaseFacade.prototype.deleteEntity = function(entity, callback) {
  pn.assInst(entity, pn.data.Entity);
  pn.ass(entity.id > 0);

  this.log_.info('deleteEntity: ' + entity.type + '#' + entity.id);

  var current = this.cache.getEntity(entity.type, entity.id);

  this.cache.deleteEntity(entity.type, entity.id);

  var onfail = goog.bind(function(error, opt_ex) {
    this.cache.undeleteEntity(current); // Revert client cache
    this.handleError(error, opt_ex);
  }, this);

  this.server.deleteEntity(entity,
      goog.bind(this.parseServerResponse, this, callback),
      onfail);
};


/**
 * @param {!Array.<(pn.data.PnQuery|string)>} queries The queries to execute.
 * @param {function(!Object.<!Array.<pn.data.Entity>>):undefined} callback The
 *    query results callback.  The reason this is a callback rather than a
 *    returned value is that this can be overriden. See LazyFacade for
 *    an example of this.
 */
pn.data.BaseFacade.prototype.query = function(queries, callback) {
  pn.ass(goog.isArray(queries) && queries.length > 0);
  pn.assFun(callback);

  var parsed = queries.pnmap(function(q) {
    if (q instanceof pn.data.PnQuery) return q;
    return new pn.data.PnQuery(q);
  });
  this.queryImpl(parsed, callback);
};


/**
 * This is overriden by LazyFacade and allows the Lazy facade to only cache
 *    content once queried.
 *
 * @protected
 * @param {!Array.<(pn.data.PnQuery)>} queries The queries to execute.
 * @param {function(!Object.<!Array.<pn.data.Entity>>):undefined} callback The
 *    query results callback.  The reason this is a callback rather than a
 *    returned value is that this can be overriden. See LazyFacade for
 *    an example of this.
 */
pn.data.BaseFacade.prototype.queryImpl = function(queries, callback) {
  pn.ass(goog.isArray(queries) && queries.length > 0);
  pn.assFun(callback);

  callback(this.cache.query(queries));
};

////////////////////////////////////////////////////////////////////////////////
// PRIVATE HELPERS
////////////////////////////////////////////////////////////////////////////////


/**
 * @protected
 * This is protected so that LazyFacade can override this with a custom
 *    implementation.
 * @return {number} The last server time that the cache was updated.
 */
pn.data.BaseFacade.prototype.getLastUpdate = function() {
  return this.cache.getLastUpdate();
};


/** @protected */
pn.data.BaseFacade.prototype.sync = function() {
  if (!pn.data.BaseFacade.SYNC_) return;

  this.log_.info('sync: ' + this.getLastUpdate());

  this.server.getAllUpdates(this.getLastUpdate(),
      goog.bind(this.parseServerResponse, this),
      goog.bind(this.handleError, this));
};


/**
 * @param {!(function((pn.data.Entity|Object|string|number)=):undefined|
 *    pn.data.Server.Response)} callbackOrResponse The success callback or
 *    the response object.
 * @param {pn.data.Server.Response=} opt_response The optional response
 *    object.  This is only allowed if the callbackOrResponse parameter
 *    is a function - a callback.
 */
pn.data.BaseFacade.prototype.parseServerResponse =
    function(callbackOrResponse, opt_response) {
  var callback = callbackOrResponse instanceof pn.data.Server.Response ?
      null : callbackOrResponse;
  var r = callbackOrResponse instanceof pn.data.Server.Response ?
      callbackOrResponse : opt_response;

  pn.ass(goog.isNull(callback) || goog.isFunction(callback));
  pn.assInst(r, pn.data.Server.Response);

  this.log_.info('parseServerResponse response[' + r.toString() + ']');

  if (r.updates) this.applyUpdates_(r.updates);
  if (r.lastUpdate > 0) this.cache.setLastUpdate(r.lastUpdate);
  if (callback) {
    var cbarg = !!r.responseEntity ? r.responseEntity :
        goog.isDefAndNotNull(r.ajaxData) ? r.ajaxData :
        r.queryResults;
    callback.call(this, cbarg);
  }
};


/**
 * @protected
 * @param {string} error The error from the server.
 * @param {Error=} opt_ex The optional exception from the server.
 */
pn.data.BaseFacade.prototype.handleError = function(error, opt_ex) {
  pn.assStr(error);

  if (opt_ex) {
    throw opt_ex;
  } else {
    pn.log.trace();
    pn.app.ctx.pub(pn.app.AppEvents.SHOW_ERROR, error);
  }
};


/** @private */
pn.data.BaseFacade.prototype.proxyServerEvents_ = function() {
  goog.object.forEach(pn.data.Server.EventType, function(et) {
    this.listenTo(this.server, et, this.dispatchEvent);
  }, this);
};


/** @private */
pn.data.BaseFacade.prototype.startUpdateInterval_ = function() {
  if (!pn.data.BaseFacade.SYNC_) return;
  this.timerid_ = setInterval(goog.bind(this.sync, this), 20000);
  goog.Timer.callOnce(this.sync, 1, this);
};


/**
 * @private
 * @param {!Array.<pn.data.Server.Update>} updates The updates since last
 *    update time.
 */
pn.data.BaseFacade.prototype.applyUpdates_ = function(updates) {
  pn.assArr(updates);

  this.cache.begin();
  updates.pnforEach(this.applyUpdate_, this);
  this.cache.commit();
};


/**
 * @private
 * @param {pn.data.Server.Update} update The update to update the cache with.
 */
pn.data.BaseFacade.prototype.applyUpdate_ = function(update) {
  pn.assInst(update, pn.data.Server.Update);
  switch (update.type) {
    case 'delete':
      this.cache.deleteEntity(update.entityType, update.id);
      break;
    case 'create':
    case 'update':
      // undeleteEntity is basically an unverified push back into the entity
      // list so it bypasses all the createEntity checks, like ID should be 0.
      this.cache.undeleteEntity(/** @type {!pn.data.Entity} */ (update.entity));
      break;
    default: throw new Error('Update: ' + update + ' is not supported');
  }
};


/** @override */
pn.data.BaseFacade.prototype.disposeInternal = function() {
  pn.data.BaseFacade.superClass_.disposeInternal.call(this);
  if (this.timerid_ !== 0) clearInterval(this.timerid_);
};
