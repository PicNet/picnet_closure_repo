;
goog.provide('pn.testing.MockServer');

goog.require('pn.data.Server');
goog.require('pn.data.Server.Response');
goog.require('pn.data.Server.Update');



/**
 * @constructor
 * @extends {pn.data.Server}
 */
pn.testing.MockServer = function() {
  pn.data.Server.call(this, '/app/', 'controller_uri');

  /** @type {boolean} */
  this.nextFail = false;

  /** @type {!Array.<{method:string,entity:pn.data.Entity}>} */
  this.calls = [];

  /** @type {Object} */
  this.nextAjaxResponseData = {};

  /** @type {Object} */
  this.lastAjaxArgData = {};

  /** @type {pn.data.Server.Response} */
  this.lastServerResponse;

  /** @type {!Array.<pn.data.Server.Update>} */
  this.nextServerResponseUpdates = [];

  /**
   * @private
   * @type {!Object.<!Array.<!pn.data.Entity>>}
   */
  this.db_ = {};

  /**
   * @private
   * @type {!Array.<{type:string, id:number}>}
   */
  this.deleted_ = [];
};
goog.inherits(pn.testing.MockServer, pn.data.Server);


/**
 * @private
 * @type {number}
 */
pn.testing.MockServer.nextId_ = 1;


/** @override */
pn.testing.MockServer.prototype.ajax =
    function(uri, data, success, failure) {
  this.calls.push({ method: 'ajax', args: arguments });

  this.lastAjaxArgData = data;
  if (this.nextFail) { this.doFail_(failure); return; }
  this.doAjaxSuccess_(this.nextAjaxResponseData, success);
};


/** @override */
pn.testing.MockServer.prototype.createEntity =
    function(entity, success, failure) {
  this.calls.push({ method: 'createEntity', args: arguments });
  var cloned = goog.object.unsafeClone(entity);
  cloned.id = pn.testing.MockServer.nextId_++;
  this.updateEntityImpl_(cloned, success, failure);
};


/** @override */
pn.testing.MockServer.prototype.updateEntity =
    function(entity, success, failure) {
  this.calls.push({ method: 'updateEntity', args: arguments });

  this.updateEntityImpl_(entity, success, failure);
};


/**
 * @private
 * @param {!pn.data.Entity} entity The entity to update.
 * @param {!function(!pn.data.Server.Response):undefined} success The
 *    success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.testing.MockServer.prototype.updateEntityImpl_ =
    function(entity, success, failure) {
  if (this.nextFail) { this.doFail_(failure); return; }

  var list = this.db_[entity.type];
  if (!list) list = this.db_[entity.type] = [];
  var idx = list.pnfind(function(e) { return e.id === entity.id; });
  if (idx >= 0) list[idx] = entity;
  this.doSuccess_(entity, success);
};


/** @override */
pn.testing.MockServer.prototype.deleteEntity =
    function(entity, success, failure) {
  this.calls.push({ method: 'deleteEntity', args: arguments });

  if (this.nextFail) { this.doFail_(failure); return; }

  var list = this.db_[entity.type];
  if (!list) list = [];
  this.db_[entity.type] = list.pnfilter(
      function(e) { return e.id !== entity.id; });
  this.deleted_.push(entity);

  this.doSuccess_(entity, success);
};


/** @override */
pn.testing.MockServer.prototype.getQueryUpdates =
    function(queries, lastUpdate, success, failure) {
  this.calls.push({ method: 'getQueryUpdates', args: arguments });

  if (this.nextFail) { this.doFail_(failure); return; }

  var results = {};
  queries.pnforEach(goog.bind(function(q) {
    results[q.toString()] = {
      'List' : this.db_[q.Type],
      'LastUpdate': goog.now()
    };
  }, this));
  // TODO: Add deleted here
  this.doAjaxSuccess_(results, success);
};


/** @override */
pn.testing.MockServer.prototype.getAllUpdates =
    function(lastUpdate, success, failure) {
  this.calls.push({ method: 'getAllUpdates', args: arguments });

  if (this.nextFail) { this.doFail_(failure); return; }
  this.doAjaxSuccess_(goog.object.unsafeClone(this.db_), success);
};


/** @override */
pn.testing.MockServer.prototype.query =
    function(queries, queriesToUpdate, lastUpdate, success, failure) {
  this.calls.push({ method: 'query', args: arguments });
  if (this.nextFail) { this.doFail_(failure); return; }

  var results = {};
  queries.pnforEach(goog.bind(function(q) {
    if (!this.db_[q.Type]) this.db_[q.Type] = [];
    results[q.toString()] = this.db_[q.Type];
  }, this));
  this.doQuerySuccess_(results, success);
};


/**
 * @private
 * @param {function(string):undefined} callback The error callback.
 */
pn.testing.MockServer.prototype.doFail_ = function(callback) {
  this.nextFail = false;

  callback('Error Message');
};


/**
 * @private
 * @param {pn.data.Entity} resData The entity to pass to the
 *    success callback.
 * @param {function(pn.data.Server.Response):undefined} callback The success
 *    callback.
 */
pn.testing.MockServer.prototype.doSuccess_ = function(resData, callback) {
  var rawEntity = resData.clone();
  rawEntity.ID = rawEntity.id;

  var response = new pn.data.Server.Response({
    LastUpdate: goog.now(),
    Updates: this.nextServerResponseUpdates,
    ResponseEntityType: rawEntity.type,
    ResponseEntity: rawEntity
  });
  this.lastServerResponse = response;
  callback(response);
};


/**
 * @private
 * @param {pn.data.Entity|Object} resData The object to pass to the
 *    success callback.
 * @param {function(pn.data.Server.Response):undefined} callback The success
 *    callback.
 */
pn.testing.MockServer.prototype.doAjaxSuccess_ = function(resData, callback) {
  var response = new pn.data.Server.Response({
    LastUpdate: goog.now(),
    Updates: this.nextServerResponseUpdates,
    AjaxResponse: resData
  });
  this.lastServerResponse = response;
  callback(response);
};


/**
 * @private
 * @param {!Object.<!Array<pn.data.Entity>>} results The query results with
 *    the query.toString() as the key to the query.
 * @param {function(pn.data.Server.Response):undefined} callback The success
 *    callback.
 */
pn.testing.MockServer.prototype.doQuerySuccess_ = function(results, callback) {
  var response = new pn.data.Server.Response({
    LastUpdate: goog.now(),
    Updates: this.nextServerResponseUpdates
  });
  response.queryResults = results;
  this.lastServerResponse = response;
  callback(response);
};
