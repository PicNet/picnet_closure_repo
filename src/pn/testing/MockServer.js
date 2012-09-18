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
  pn.data.Server.call(this, 'controller_uri');

  /** @type {number} */
  this.nextId = 1;

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
};
goog.inherits(pn.testing.MockServer, pn.data.Server);


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

  if (this.nextFail) { this.doFail_(failure); return; }
  entity.id = this.nextId++;
  this.doSuccess_(entity, success);
};


/** @override */
pn.testing.MockServer.prototype.updateEntity =
    function(entity, success, failure) {
  this.calls.push({ method: 'updateEntity', args: arguments });

  if (this.nextFail) { this.doFail_(failure); return; }
  this.doSuccess_(entity, success);
};


/** @override */
pn.testing.MockServer.prototype.deleteEntity =
    function(entity, success, failure) {
  this.calls.push({ method: 'deleteEntity', args: arguments });

  if (this.nextFail) { this.doFail_(failure); return; }
  this.doSuccess_(entity, success);
};


/** @override */
pn.testing.MockServer.prototype.getQueryUpdates =
    function(queries, lastUpdate, success, failure) {
  this.calls.push({ method: 'getQueryUpdates', args: arguments });

  if (this.nextFail) { this.doFail_(failure); return; }

  var results = {};
  goog.array.forEach(queries, function(q) {
    results[q.toString()] = {'List' : [], 'LastUpdate': 1};
  });  
  this.doAjaxSuccess_(results, success);
};


/** @override */
pn.testing.MockServer.prototype.getAllUpdates =
    function(lastUpdate, success, failure) {
  this.calls.push({ method: 'getAllUpdates', args: arguments });

  if (this.nextFail) { this.doFail_(failure); return; }
  this.doAjaxSuccess_({}, success);
};


/** @override */
pn.testing.MockServer.prototype.query =
    function(queries, queriesToUpdate, lastUpdate, success, failure) {
  this.calls.push({ method: 'query', args: arguments });  
  if (this.nextFail) { this.doFail_(failure); return; }

  var results = {};
  goog.array.forEach(queries, function(q) {
    results[q.toString()] = {'List' : [], 'LastUpdate': 1};
  });
  // TODO: Need a new response type for queries
  this.doAjaxSuccess_(results, success);
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
    lastUpdate: 1,
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
    lastUpdate: 1,
    Updates: this.nextServerResponseUpdates,
    AjaxResponse: resData
  });
  this.lastServerResponse = response;
  callback(response);
};
