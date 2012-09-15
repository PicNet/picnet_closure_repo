
goog.provide('pn.data.BaseFacade');

goog.require('pn.data.Query');
goog.require('pn.data.Entity');
goog.require('pn.data.LocalCache');
goog.require('pn.data.Server');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

/**
 * An optimistic (Client assumes the server will succeed) Facade.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {string} controller The path to the controller
 */
pn.data.BaseFacade = function(controller) {
  goog.asserts.assert(goog.isString(controller));

  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {string}
   */
  this.controller_ = controller;

  /**
   * @protected
   * @type {pn.data.LocalCache}
   */
  this.cache = new pn.data.LocalCache();
  this.registerDisposable(this.cache);

  
  /**
   * @protected
   * @type {pn.data.Server}
   */
  this.server = new pn.data.Server(controller);
  this.registerDisposable(this.cache);

  /**
   * @private
   * @type {goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler();
  this.registerDisposable(this.eh_);

  goog.object.forEach(pn.data.Server.EventType, function(et) {
    this.eh_.listen(this.server, et, this.dispatchEvent);
  }, this);
  
};
goog.inherits(pn.data.BaseFacade, goog.events.EventTarget);

/**
 * Makes an arbitrary ajax call to the server.  The results are then
 *    inspected for entities and appropriate caches updated.
 *
 * @param {string} uri The server endpoint.
 * @param {!Object} data The request data.
 * @param {function(?):undefined} success The success callback.
 */
pn.data.BaseFacade.prototype.ajax = function(uri, data, success) {
  throw 'Not Implemented';
};

/**
 * Gets an entity from the local cache.  If this entity does not exist in the 
 *    client cache then an error is thrown.  So you must ensure that the cache
 *    is primed (Facade.query) prior to calling getEntity.
 *
 * @param {string} type The type of entity to query
 * @param {number} id The ID of the entity to retreive.
 * @return {!pn.data.Entity} The entity with the specified id.
 */
pn.data.BaseFacade.prototype.getEntity = function(type, id) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(goog.isNumber(id));

  return this.cache.getEntity(type, id);
};

/**
 * Creates an entity optimistically.  This is done by creating the entity in the
 *    local cache first and assigning a temporary ID.  This request is then 
 *    sent to the server and if succeeds the client updates with the proper 
 *    server ID.  Otherwise the client creation is rolled back.
 *
 * @param {!pn.data.Entity} entity The entity to create
 * @return {!pn.data.Entity} The created entity with an assigned temporary ID
 *    which will change once the server is updated.
 */
pn.data.BaseFacade.prototype.createEntity = function(entity) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(entity.id <= 0);

  entity = this.cache.createEntity(entity);
  var tmpid = entity.id;

  var onsuccess = goog.bind(function(entity2) {    
    entity.id = entity2.id;
    goog.asserts.assert(entity.equals(entity2));    

    this.cache.updateEntity(entity, tmpid);
  }, this);

  var onfail = goog.bind(function(error) {    
    this.cache.deleteEntity(entity.type, tmpid);
    throw new Error(error);
  }, this);
  this.server.createEntity(entity, onsuccess, onfail);

  return entity;
};

/**
 * Updates an entity in the client cache then returns control. The update is 
 *    then sent to the server.
 *
 * @param {!pn.data.Entity} entity The entity to update
 */
pn.data.BaseFacade.prototype.updateEntity = function(entity) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(entity.id > 0);

  var current = this.cache.getEntity(entity.type, entity.id);

  this.cache.updateEntity(entity);

  var onsuccess = function(entity2) {    
    goog.asserts.assert(entity.equals(entity2));
  };

  var onfail = goog.bind(function(error) {        
    this.cache.updateEntity(current); // Revert client cache
    throw new Error(error);
  }, this);

  this.server.updateEntity(entity, onsuccess, onfail);
};

/**
 * @param {!pn.data.Entity} entity The entity to delete
 */
pn.data.BaseFacade.prototype.deleteEntity = function(entity) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(entity.id > 0);

  var current = this.cache.getEntity(entity.type, entity.id);

  this.cache.deleteEntity(entity.type, entity.id);  
  var onfail = goog.bind(function(error) {    
    this.cache.undeleteEntity(current); // Revert client cache
    throw new Error(error);
  }, this);
  this.server.deleteEntity(entity, function() {}, onfail);
};

/**
 * @param {!Array.<(pn.data.Query|string)>} queries The queries to execute
 * @param {function(!Object.<!Array.<pn.data.Entity>>):undefined} The query 
 *    results callback.  The reason this is a callback rather than a
 *    returned value is that this can be overriden. See LazyFacade for
 *    an example of this.
 */
pn.data.BaseFacade.prototype.query = function(queries, callback) {
  goog.asserts.assert(goog.isArray(queries) && queries.length > 0);
  goog.asserts.assert(goog.isFunction(cb));

  callback(this.cache.query(queries));
};

/** @enum {string} */
pn.data.BaseFacade.EventType = {
  LOADING: 'server-loading',
  LOADED: 'server-loaded'
};
