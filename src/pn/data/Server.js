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
goog.require('pn.data.TypeRegister');
goog.require('pn.json');
goog.require('pn.log');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {string} controller The controller Uri.
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
 * @param {string} uri The server endpoint for this request.
 * @param {!Object} data The data for the server ajax request.  Ensure that
 *    this is using safe compiled object keys (strings).
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.ajax =
    function(uri, data, success, failure) {
  goog.asserts.assert(goog.isString(uri));
  goog.asserts.assert(goog.isObject(data));
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  this.ajax_(pn.app.ctx.cfg.appPath + uri, data, success, failure);
};


/**
 * @param {!pn.data.Entity} entity The entity to create.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.createEntity =
    function(entity, success, failure) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  var json = this.getEntityJson_(entity);
  var uri = this.getFacadeControllerAction_('CreateEntity');
  this.ajax_(uri, json, success, failure);
};


/**
 * @param {!pn.data.Entity} entity The entity to update.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.updateEntity =
    function(entity, success, failure) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  var json = this.getEntityJson_(entity);
  var uri = this.getFacadeControllerAction_('UpdateEntity');
  this.ajax_(uri, json, success, failure);
};


/**
 * @param {!pn.data.Entity} entity The entity to delete.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.deleteEntity =
    function(entity, success, failure) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  var json = this.getEntityJson_(entity);
  var uri = this.getFacadeControllerAction_('DeleteEntity');
  this.ajax_(uri, json, success, failure);
};


/**
 * @param {!Array.<!pn.data.Query>} queries The queries to update.
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.getQueryUpdates =
    function(queries, lastUpdate, success, failure) {
  goog.asserts.assert(goog.isArray(queries) && queries.length > 0);
  goog.asserts.assert(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  var json = {
    'lastUpdate': lastUpdate,
    'queriesJson': pn.json.serialiseJson(queries)
  };
  var uri = this.getFacadeControllerAction_('GetQueryUpdates');
  this.ajax_(uri, json, success, failure);
};


/**
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.getAllUpdates =
    function(lastUpdate, success, failure) {
  goog.asserts.assert(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  var json = { 'lastUpdate': lastUpdate };
  var uri = this.getFacadeControllerAction_('GetAllUpdates');
  this.ajax_(uri, json, success, failure);
};


/**
 * @param {!Array.<pn.data.Query>} queries The queries to run on the
 *    server.
 * @param {!Array.<pn.data.Query>} queriesToUpdate The queries already in the
 *    cache requiring an update.
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.query =
    function(queries, queriesToUpdate, lastUpdate, success, failure) {
  goog.asserts.assert(goog.isArray(queries) && queries.length > 0);
  goog.asserts.assert(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  var json = {
    'queriesJson': pn.json.serialiseJson(queries),
    'queriesToUpdateJson': pn.json.serialiseJson(queriesToUpdate),
    'lastUpdate': lastUpdate
  };
  var uri = this.getFacadeControllerAction_('Query');
  this.ajax_(uri, json, success, failure);
};


/**
 * @private
 * @param {string} action The server action to perform (on the default
 *    controller).
 * @return {string} The full uri to the specified server action.
 */
pn.data.Server.prototype.getFacadeControllerAction_ = function(action) {
  goog.asserts.assert(goog.isString(this.controller_));
  goog.asserts.assert(goog.isString(action));

  return this.controller_ + action;
};


/**
 * @private
 * @param {!pn.data.Entity} entity The entity to convert to a json data object.
 * @return {{type:string, entityJson:string}}
 */
pn.data.Server.prototype.getEntityJson_ = function(entity) {
  goog.asserts.assert(entity instanceof pn.data.Entity);

  return {
    'type': entity.type,
    'entityJson': pn.json.serialiseJson(entity)
  };
};


/**
 * @private
 * @param {string} uri The uri of the server endpoint.
 * @param {!Object} data The data to send to the endpoint.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.ajax_ = function(uri, data, success, failure) {
  goog.asserts.assert(goog.isString(uri));
  goog.asserts.assert(goog.isObject(data));
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  // var event = new goog.events.Event(pn.data.Server.EventType.LOADING, this);
  // TODO: This is throwing an error
  // this.dispatchEvent(event);

  var start = goog.now(),
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
    var raw = /** @type {pn.data.Server.RawResponse} */ (
        pn.json.parseJson(resp));
    var response = new pn.data.Server.Response(raw);
    if (response.error) {
      failure(response.error);
    } else {
      success(response);
    }
  }

  this.log_.info('ajax uri: ' + xhr.getLastUri() + ' completed. Took: ' +
      (goog.now() - start) + 'ms.');
  // TODO: Fix this is throwing: Object [object Object] has no method
  // 'getParentEventTarget'
  // this.dispatchEvent(new goog.events.Event(pn.data.Server.EventType.LOADED));
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
 * @typedef {{
 *    lastUpdate:number,
 *    Updates:!Array.<pn.data.Server.RawUpdate>,
 *    ResponseEntityType:string,
 *    ResponseEntity:Object,
 *    AjaxResponse: Object,
 *    Error: string
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

  /** @type {Array.<pn.data.Server.Update>} */
  this.updates = raw['Updates'] ? goog.array.map(raw['Updates'],
      function(u) { return new pn.data.Server.Update(u); }, this) : null;

  /** @type {pn.data.Entity} */
  this.responseEntity = raw['ResponseEntityType'] ?
      pn.data.TypeRegister.parseEntity(raw['ResponseEntityType'],
          /** @type {!Object} */ (pn.json.parseJson(raw['ResponseEntity']))) :
      null;

  /** @type {Object|string} */
  this.ajaxData = raw['AjaxResponse'] ?
      pn.json.parseJson(raw['AjaxResponse']) : null;

  /** @type {string} */
  this.error = raw['Error'] || '';

  /** @type {Object.<!Array.<pn.data.Entity>>} */
  this.queryResults = raw['QueryResults'] ?
      goog.array.reduce(raw['QueryResults'], function(acc, qr) {
        var query = pn.data.Query.fromString(qr['QueryId']);
        var results = pn.data.TypeRegister.parseEntities(query.Type,
            /** @type {!Array} */ (pn.json.parseJson(qr['ResultsJson'])));
        acc[query.toString()] = results;
        return acc;
      }, {}) : null;

  goog.asserts.assert(this.updates === null || goog.isArray(this.updates));
  goog.asserts.assert(this.responseEntity === null ||
      this.responseEntity instanceof pn.data.Entity);
  goog.asserts.assert(this.ajaxData === null || goog.isObject(this.ajaxData));
  goog.asserts.assert(
      goog.isDefAndNotNull(this.ajaxData) ||
      goog.isDefAndNotNull(this.responseEntity) ||
      goog.isDefAndNotNull(this.updates), 'Response is not a FacadeResponse.');
};



/**
 * @constructor
 * @param {pn.data.Server.RawUpdate} raw The raw response json object from
 *    the server.
 */
pn.data.Server.Update = function(raw) {
  goog.asserts.assert(goog.isObject(raw));

  /** @type {string} */
  this.queryId = raw['QueryId'];

  /** @type {number} */
  this.queryLastUpdate = raw['QueryLastUpdate'];

  /** @type {string} */
  this.type = raw['UpdateType'];

  /** @type {number} */
  this.id = raw['EntityId'];

  /** @type {string} */
  this.entityType = raw['EntityType'];

  /** @type {pn.data.Entity} */
  this.entity = raw['Entity'] ?
      pn.data.TypeRegister.parseEntity(raw['EntityType'], raw['Entity']) :
      null;

  goog.asserts.assert(goog.isNumber(this.id));
  goog.asserts.assert(goog.isString(this.entityType));
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
