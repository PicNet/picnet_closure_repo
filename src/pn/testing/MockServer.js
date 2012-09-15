
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
};
goog.inherits(pn.testing.MockServer, pn.data.Server);

/** @override */
pn.testing.MockServer.prototype.createEntity = 
    function(entity, lastUpdate, success, failure) {
  this.calls.push({ method:'createEntity', entity:entity });

  if (this.nextFail) { this.doFail_(failure); return; }
  entity.id = this.nextId++;
  this.doSuccess_(entity, success);
};

/** @override */
pn.testing.MockServer.prototype.updateEntity = 
    function(entity, lastUpdate, success, failure) {
  this.calls.push({ method:'updateEntity', entity:entity });

  if (this.nextFail) { this.doFail_(failure); return; }
  this.doSuccess_(entity, success);
};

/** @override */
pn.testing.MockServer.prototype.deleteEntity = 
    function(entity, lastUpdate, success, failure) {
  this.calls.push({ method:'deleteEntity', entity:entity });

  if (this.nextFail) { this.doFail_(failure); return; }
  this.doSuccess_(null, success);
};

/** @override */
pn.testing.MockServer.prototype.getUpdates = 
    function(lastUpdate, success, failure) {
  this.calls.push({ method:'getUpdates', entity:entity });

  if (this.nextFail) { this.doFail_(failure); return; }
  this.doSuccess_(null, success);
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
 * @param {pn.data.Entity} entity The entity to pass to the success callback
 * @param {function(pn.data.Server.Response):undefined} callback The success
 *    callback
 */
pn.testing.MockServer.prototype.doSuccess_ = function(entity, callback) {
  var rawEntity = entity.clone();
  rawEntity.ID = rawEntity.id;

  var response = new pn.data.Server.Response({
    lastUpdate:1,
    Updates:[],
    ResponseEntityType: entity.type,
    ResponseEntity: entity
  });
  callback(response);
};