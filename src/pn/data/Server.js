;
goog.provide('pn.data.Server');

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
  this.logger_ = pn.log.getLogger('pn.data.Server');

  /**
   * @private
   * @type {number}
   */
  this.requestCount_ = 0;
};
goog.inherits(pn.data.Server, goog.events.EventTarget);

/**
 * @param {!pn.data.Entity} entity The entity to create
 * @param {!function(!pn.data.Entity):undefined} success The success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.createEntity = function(entity, success, failure) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));  

  this.ajax_('CreateEntity', this.getEntityJson_(entity), success, failure);
};

/**
 * @param {!pn.data.Entity} entity The entity to update
 * @param {!function(!pn.data.Entity):undefined} success The success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.updateEntity = function(entity, success, failure) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  this.ajax_('UpdateEntity', this.getEntityJson_(entity), success, failure);
};

/**
 * @param {!pn.data.Entity} entity The entity to delete
 * @param {!function(!pn.data.Entity):undefined} success The success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.deleteEntity = function(entity, success, failure) {
  goog.asserts.assert(entity instanceof pn.data.Entity);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  this.ajax_('DeleteEntity', this.getEntityJson_(entity), success, failure);
};

/**
 * @param {number} from The from server millis. All changes past this date
 *    will be sent to the client.
 * @param {!function(!pn.data.Entity):undefined} success The success callback.
 * @param {!function(string):undefined} failure The failure callback.
 */
pn.data.Server.prototype.getUpdates = function(from, success, failure) {
  goog.asserts.assert(goog.isNumber(from) && from >= 0);
  goog.asserts.assert(goog.isFunction(success));
  goog.asserts.assert(goog.isFunction(failure));

  this.ajax_('GetUpdates', { 'from': from }, success, failure);
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
 * @param {string} action The name of the action on the server endpoint.
 * @param {!Object} data The data to send to the endpoint.
 * @param {function(?):undefined} success The success callback.
 * @param {function(?):undefined} failure The failure callback.
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
 * @param {function(?):undefined} success The success callback.
 * @param {function(?):undefined} failure The failure callback.
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
      success(pn.json.parseJson(resp));
    }
  }

  this.logger_.info('ajax uri: ' + xhr.getLastUri() + ' completed. Took: ' + 
      (goog.now() - start) + 'ms.');

  this.dispatchEvent(new goog.events.Event(pn.data.Server.EventType.LOADED));
};


/** @enum {string} */
pn.data.Server.EventType = {
  LOADING: 'server-loading',
  LOADED: 'server-loaded'
};
