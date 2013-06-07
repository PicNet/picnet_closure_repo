;
goog.provide('pn.data.Server');
goog.provide('pn.data.Server.EventType');
goog.provide('pn.data.Server.Response');
goog.provide('pn.data.Server.Update');

goog.require('goog.debug.Logger');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.net.XhrManager');
goog.require('goog.style');
goog.require('pn.app.AppEvents');
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
  pn.assStr(controller);

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
  pn.assStr(uri);
  pn.assObj(data);
  pn.assFun(success);
  pn.assFun(failure);

  this.ajax_(uri, data, success, failure);
};


/**
 * @param {!pn.data.Entity} entity The entity to create.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.createEntity =
    function(entity, success, failure) {
  pn.assInst(entity, pn.data.Entity);
  pn.assFun(success);
  pn.assFun(failure);

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
  pn.assInst(entity, pn.data.Entity);
  pn.assFun(success);
  pn.assFun(failure);

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
  pn.assInst(entity, pn.data.Entity);
  pn.ass(entity.id > 0);
  pn.assFun(success);
  pn.assFun(failure);

  var uri = this.getFacadeControllerAction_('DeleteEntity');
  this.ajax_(uri, {'type': entity.type, 'id': entity.id}, success, failure);
};


/**
 * @param {!Array.<!pn.data.PnQuery>} queries The queries to update.
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.getQueryUpdates =
    function(queries, lastUpdate, success, failure) {
  pn.ass(goog.isArray(queries) && queries.length > 0);
  pn.ass(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  pn.assFun(success);
  pn.assFun(failure);

  var json = {
    'lastUpdate': lastUpdate,
    'queriesJson': pn.json.serialiseJson(queries)
  };
  var uri = this.getFacadeControllerAction_('GetQueryUpdates');
  this.ajax_(uri, json, success, failure, true);
};


/**
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.getAllUpdates =
    function(lastUpdate, success, failure) {
  pn.ass(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  pn.assFun(success);
  pn.assFun(failure);

  var json = { 'lastUpdate': lastUpdate };
  var uri = this.getFacadeControllerAction_('GetAllUpdates');
  this.ajax_(uri, json, success, failure, true);
};


/**
 * @param {!Array.<pn.data.PnQuery>} queries The queries to run on the
 *    server.
 * @param {!Array.<pn.data.PnQuery>} queriesToUpdate The queries already in the
 *    cache requiring an update.
 * @param {number} lastUpdate The last 'server' time the cache was updated.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.query =
    function(queries, queriesToUpdate, lastUpdate, success, failure) {
  pn.ass(goog.isArray(queries) && queries.length > 0);
  pn.ass(goog.isNumber(lastUpdate) && lastUpdate >= 0);
  pn.assFun(success);
  pn.assFun(failure);

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
  pn.assStr(this.controller_);
  pn.assStr(action);

  return this.controller_ + '/' + action;
};


/**
 * @private
 * @param {!pn.data.Entity} entity The entity to convert to a json data object.
 * @return {{type:string, entityJson:string}}
 */
pn.data.Server.prototype.getEntityJson_ = function(entity) {
  pn.assInst(entity, pn.data.Entity);

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
 * @param {boolean=} opt_bg Wether this is a background request (should not
 *    show loading panel), default is false.
 */
pn.data.Server.prototype.ajax_ = function(uri, data, success, failure, opt_bg) {
  pn.assStr(uri);
  pn.assObj(data);
  pn.assFun(success);
  pn.assFun(failure);

  var bg = goog.isDef(opt_bg) ? opt_bg : false;
  try { this.ajaxImpl_(uri, data, success, failure, bg); }
  catch (ex) {
    var error = /** @type {!Error} */ (goog.debug.normalizeErrorObject(ex));
    this.log_.warning(error.stack || error.message);
    failure(ex.message);
  }
};


/**
 * @private
 * @param {string} uri The uri of the server endpoint.
 * @param {!Object} data The data to send to the endpoint.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {function(string):undefined} failure The failure callback.
 * @param {boolean} bg Wether this is a background request (should not
 *    show loading panel).
 */
pn.data.Server.prototype.ajaxImpl_ = function(uri, data, success, failure, bg) {
  pn.assStr(uri);
  pn.assObj(data);
  pn.assFun(success);
  pn.assFun(failure);
  pn.ass(goog.isBoolean(bg));

  var eventType = bg ?
      pn.data.Server.EventType.LOADING_BG :
      pn.data.Server.EventType.LOADING;

  this.dispatchEvent(new goog.events.Event(eventType));

  var start = goog.now(),
      rid = uri + (this.requestCount_++),
      qd = goog.uri.utils.buildQueryDataFromMap(data),
      callback = goog.bind(function(e) {
        pn.assInst(e.target, goog.net.XhrIo);
        this.reply_(e.target, start, success, failure, bg);
      }, this);

  this.log_.info('Making request: ' + uri);
  this.manager_.send(rid, uri, 'POST', qd, null, null, callback);
};


/**
 * @private
 * @param {!goog.net.XhrIo} xhr The xhr request details.
 * @param {number} start The time the request began.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {function(string):undefined} failure The failure callback.
 * @param {boolean} bg Wether this is a background request (should not
 *    show loading panel).
 */
pn.data.Server.prototype.reply_ = function(xhr, start, success, failure, bg) {
  pn.assInst(xhr, goog.net.XhrIo);
  pn.ass(goog.isNumber(start) && start > 0);
  pn.assFun(success);
  pn.assFun(failure);
  pn.ass(goog.isBoolean(bg));

  try { this.replyImpl_(xhr, start, success, failure, bg); }
  catch (ex) {
    var error = /** @type {!Error} */ (goog.debug.normalizeErrorObject(ex));
    this.log_.warning(error.stack || error.message);
    failure(ex.message);
  }
};


/**
 * @private
 * @param {!goog.net.XhrIo} xhr The xhr request details.
 * @param {number} start The time the request began.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {function(string):undefined} failure The failure callback.
 * @param {boolean} bg Wether this is a background request (should not
 *    show loading panel).
 */
pn.data.Server.prototype.replyImpl_ =
    function(xhr, start, success, failure, bg) {
  pn.assInst(xhr, goog.net.XhrIo);
  pn.ass(goog.isNumber(start) && start > 0);
  pn.assFun(success);
  pn.assFun(failure);
  pn.ass(goog.isBoolean(bg));

  if (!xhr.isSuccess()) {
    failure('An unexpected error has occurred.');
  } else {
    var resp = xhr.getResponseText();
    var raw = /** @type {pn.data.Server.RawResponse} */ (
        pn.json.parseJson(resp));
    var response = new pn.data.Server.Response(raw);

    if (response.debugMessage) {
      var sdb = pn.app.AppEvents.SHOW_DEBUG_MESSAGE;
      pn.app.ctx.pub(sdb, response.debugMessage);
    }

    if (response.error) {
      failure(response.error);
    } else {
      goog.Timer.callOnce(function() { success(response); });
    }
  }

  var took = goog.now() - start;
  this.log_.info('Request: ' + xhr.getLastUri() + ' Took: ' + took + 'ms.');
  var eventType = bg ?
      pn.data.Server.EventType.LOADED_BG :
      pn.data.Server.EventType.LOADED;
  this.dispatchEvent(new goog.events.Event(eventType));
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
  pn.assObj(raw);

  /** @type {Array.<pn.data.Server.Update>} */
  this.updates = raw['Updates'] ? raw['Updates'].pnmap(
      function(u) { return new pn.data.Server.Update(u); }, this) : null;

  /** @type {number} */
  this.lastUpdate = raw['LastUpdate'];

  /** @type {pn.data.Entity} */
  this.responseEntity = raw['ResponseEntityType'] ?
      pn.data.TypeRegister.parseEntity(raw['ResponseEntityType'],
          /** @type {!Object} */ (pn.json.parseJson(raw['ResponseEntity']))) :
      null;

  /** @type {Object|string|number} */
  this.ajaxData = goog.isDef(raw['AjaxResponse']) ?
      pn.json.parseJson(raw['AjaxResponse']) : null;

  /** @type {string} */
  this.error = raw['Error'] || '';

  /** @type {string} */
  this.debugMessage = raw['DebugMessage'] || '';

  /** @type {Object.<!Array.<pn.data.Entity>>} */
  this.queryResults = raw['QueryResults'] ?
      raw['QueryResults'].pnreduce(function(acc, qr) {
        var query = pn.data.PnQuery.fromString(qr['QueryId']);
        var results = pn.data.TypeRegister.parseEntities(query.Type,
            /** @type {!Array} */ (pn.json.parseJson(qr['ResultsJson'])));
        acc[query.toString()] = results;
        return acc;
      }, {}) : null;

  pn.ass(this.updates === null || goog.isArray(this.updates));
  pn.assNum(this.lastUpdate);
  pn.ass(
      this.responseEntity === null ||
      this.responseEntity instanceof pn.data.Entity);
  pn.ass(
      this.ajaxData === null ||
      goog.isObject(this.ajaxData) ||
      goog.isNumber(this.ajaxData) ||
      goog.isString(this.ajaxData));
  pn.ass(
      goog.isString(this.error) ||
      goog.isDefAndNotNull(this.ajaxData) ||
      goog.isDefAndNotNull(this.responseEntity) ||
      goog.isDefAndNotNull(this.updates), 'Response is not a FacadeResponse.');
};


/** @override */
pn.data.Server.Response.prototype.toString = function() {
  return 'updates[' + (this.updates ? this.updates.length : 'n/a') +
      '] last[' + this.lastUpdate +
      '] resEntity[' + (this.responseEntity ?
          this.responseEntity.type + '#' + this.responseEntity.id : 'n/a') +
      '] ajax[' + (this.ajaxData ? 'yes' : 'n/a') +
      '] error[' + (this.error ? this.error : 'n/a') +
      '] debugMessage[' + (this.debugMessage ? this.debugMessage : 'n/a') +
      '] queries[' + (this.queryResults ?
          goog.object.getCount(this.queryResults) : 'n/a') + ']';
};



/**
 * @constructor
 * @param {pn.data.Server.RawUpdate} raw The raw response json object from
 *    the server.
 */
pn.data.Server.Update = function(raw) {
  pn.assObj(raw);

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
      pn.data.TypeRegister.parseEntity(raw['EntityType'],
          /** @type {!Object} */ (pn.json.parseJson(raw['Entity']))) :
      null;

  pn.assNum(this.id);
  pn.assStr(this.entityType);
  pn.ass(this.type === 'create' ||
      this.type === 'update' || this.type === 'delete');
  pn.ass(this.type !== 'delete' || this.entity === null);
  pn.ass(this.type === 'delete' ||
      this.entity instanceof pn.data.Entity);
};


/** @enum {string} */
pn.data.Server.EventType = {
  LOADING: 'server-loading',
  LOADED: 'server-loaded',
  LOADING_BG: 'server-loading-bg',
  LOADED_BG: 'server-loaded-bg'
};
