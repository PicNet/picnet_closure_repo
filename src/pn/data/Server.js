;
goog.provide('pn.data.Server');
goog.provide('pn.data.Server.Response');
goog.provide('pn.data.Server.Update');
goog.require('goog.debug.Logger');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.net.XhrManager');
goog.require('goog.style');
goog.require('pn.app.AppEvents');
goog.require('pn.data.DataDownloader');
goog.require('pn.data.IDataSource');
goog.require('pn.json');
goog.require('pn.log');
goog.require('pn.data.TypeRegister');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {string} controller The controller Uri
 */
pn.data.Server = function(controller) {
  goog.asserts.assert(goog.isString(controller));

  goog.events.EventTarget.call(this);

  /**
   * @private
   * @const
   * @type {string}
   */
  this.controller_ = controller;

  /**
   * @private
   * @type {goog.net.XhrManager}
   */
  this.manager_ = new goog.net.XhrManager(0);
  this.registerDisposable(this.manager_);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.data.Server');

  /**
   * @private
   * @type {number}
   */
  this.requestCount_ = 0;
};
goog.inherits(pn.data.Server, goog.events.EventTarget);

/**
 * @param {!pn.data.Entity} entity The entity to create
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The 
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.createEntity = 
    function(entity, lastUpdate, success, failure) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));  

  var json = this.getEntityJson_(entity, lastUpdate);
  this.ajax_('CreateEntity', json, success, failure);
};

/**
 * @param {!pn.data.Entity} entity The entity to update
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The 
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.updateEntity = 
    function(entity, lastUpdate, success, failure) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  var json = this.getEntityJson_(entity, lastUpdate);
  this.ajax_('UpdateEntity', json, success, failure);
};

/**
 * @param {!pn.data.Entity} entity The entity to delete
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The 
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.deleteEntity = 
    function(entity, lastUpdate, success, failure) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  var json = this.getEntityJson_(entity, lastUpdate);
  this.ajax_('DeleteEntity', json, success, failure);
};

/**
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The 
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.getUpdates = 
    function(lastUpdate, success, failure) {
  goog.asserts.assert(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  var json = { 'lastUpdate': lastUpdate };
  this.ajax_('GetUpdates', json, success, failure);
};

/**
 * @private
 * @param {!pn.data.Entity} entity The entity to convert to a json data object.
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @return {{type:string, entityJson:string}}
 */
pn.data.Server.prototype.getEntityJson_ = function(entity, lastUpdate) {
  goog.asserts.assert(entity instanceof pn.data.Entity);

  return { 
    'lastUpdate': lastUpdate,
    'type': entity.type, 
    'entityJson': pn.json.serialiseJson(entity)
  };
};

/**
 * @private
 * @param {string} action The name of the action on the server endpoint.
 * @param {!Object} data The data to send to the endpoint.
 * @param {!function(!pn.data.Server.Response):undefined} success The 
 *    success callback.
 * @param {function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.ajax_ = function(action, data, success, failure) {
  goog.asserts.assert(goog.isString(action));
  goog.asserts.assert(goog.isObject(data));
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));  
  
  this.dispatchEvent(new goog.events.Event(pn.data.Server.EventType.LOADING));

  var uri = this.controller_ + action,
      start = goog.now(),
      rid = uri + (this.requestCount_++),
      qd = goog.uri.utils.buildQueryDataFromMap(data),
      callback = goog.bind(function(e) {
        goog.asserts.assert(e.target instanceof goog.net.XhrIo);
        this.reply_(e.target, start, success, failure);
      }, this);

  this.manager_.send(rid, uri, 'POST', qd, null, null, callback);
};

/**
 * @private
 * @param {!goog.net.XhrIo} xhr The xhr request details.
 * @param {number} start The time the request began.
 * @param {!function(!pn.data.Server.Response):undefined} success The 
 *    success callback.
 * @param {function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.reply_ = function(xhr, start, success, failure) {
  goog.asserts.assert(xhr instanceof goog.net.XhrIo);
  goog.asserts.assert(goog.isNumber(start) && start > 0);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  if (!xhr.isSuccess()) {
    failure('An unexpected error has occurred.');
  } else { 
    var resp = xhr.getResponseText();
    if (goog.string.startsWith(resp, 'ERROR:')) {
      failure(resp.split(':')[1]);  
    } else {
      var raw = /** @type {pn.data.Server.RawResponse} */ (
          pn.json.parseJson(resp));
      var response = new pn.data.Server.Response(raw);
      success(response);
    }
  }

  this.log_.info('ajax uri: ' + xhr.getLastUri() + ' completed. Took: ' + 
      (goog.now() - start) + 'ms.');

  this.dispatchEvent(new goog.events.Event(pn.data.Server.EventType.LOADED));
};

/**
 * @typedef {{
 *    lastUpdate:number,
 *    Updates:!Array.<pn.data.Server.RawUpdate>,
 *    ResponseEntityType:string,
 *    ResponseEntity:Object
 *  }}
 */
pn.data.Server.RawResponse;

/**
 * @constructor
 * @param {pn.data.Server.RawResponse} raw The raw response json object 
 *    from the server.
 */
pn.data.Server.Response = function(raw) {
  goog.asserts.assert(goog.isObject(raw));

  /** @type {number} */
  this.lastUpdate = raw['lastUpdate'];

  /** @type {!Array.<pn.data.Server.Update>} */
  this.updates = goog.array.map(raw['Updates'], 
      function(u) { return new pn.data.Server.Update(u); }, this);

  /** @type {pn.data.Entity} */
  this.responseData = pn.data.TypeRegister.parseEntity(
      raw['ResponseEntityType'], raw['ResponseEntity']);

  goog.asserts.assert(goog.isNumber(this.lastUpdate) && this.lastUpdate > 0);
  goog.asserts.assert(goog.isArray(this.updates));
  goog.asserts.assert(!goog.isDef(this.responseData) || 
      this.responseData instanceof pn.data.Entity);
};

/**
 * @typedef {{
 *    Type:string,
 *    ID:number,
 *    EntityType:string,
 *    Entity:Object
 *  }}
 */
pn.data.Server.RawUpdate;

/**
 * @constructor
 * @param {pn.data.Server.RawUpdate} raw The raw response json object from 
 *    the server.
 */
pn.data.Server.Update = function(raw) {
  goog.asserts.assert(goog.isObject(raw));  

  /** @type {string} */
  this.type = raw['Type'];

  /** @type {number} */
  this.id = raw['ID'];

  /** @type {pn.data.Entity} */
  this.entity = pn.data.TypeRegister.parseEntity(
    raw['EntityType'], raw['Entity']);  

  goog.asserts.assert(goog.isNumber(this.id));
  goog.asserts.assert(this.type === 'create' || 
      this.type === 'update' || this.type === 'delete');   
  goog.asserts.assert(this.type !== 'delete' || this.entity === null);
  goog.asserts.assert(this.type === 'delete' || 
      this.entity instanceof pn.data.Entity);  
};


/** @enum {string} */
pn.data.Server.EventType = {
  LOADING: 'server-loading',
  LOADED: 'server-loaded'
};
