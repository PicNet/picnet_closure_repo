;
goog.provide('pn.data.ServerSource');

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
 * @implements {pn.data.IDataSource}
 */
pn.data.ServerSource = function() {
  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {goog.net.XhrManager}
   */
  this.xhrMgr_ = new goog.net.XhrManager(0);
  this.registerDisposable(this.xhrMgr_);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.logger_ = pn.log.getLogger('pn.data.ServerSource');

  /**
   * @private
   * @type {number}
   */
  this.requestCount_ = 0;

  /**
   * @private
   * @type {!Object}
   */
  this.routes_ = pn.app.ctx.cfg.serverRoutes;
};
goog.inherits(pn.data.ServerSource, goog.events.EventTarget);


/**
 * Makes an arbitrary ajax request.
 *
 * @param {string} uri The location of the server endpoint.
 * @param {!Object} data The data to send to the endpoint.
 * @param {function(?):undefined} callback The callback.
 */
pn.data.ServerSource.prototype.ajax = function(uri, data, callback) {
  this.ajax_(uri, data, callback);
};


/**
 * Loads the data schema from the server.
 * @param {function(!Array.<!Object>):undefined} callback The callback for the
 *    schema loading.
 */
pn.data.ServerSource.prototype.loadSchema = function(callback) {
  this.ajax_(this.routes_.loadSchema, {}, callback);
};


/** @override */
pn.data.ServerSource.prototype.getEntityLists = function(types, callback) {
  goog.asserts.assert(types);
  goog.asserts.assert(callback);

  var loaded = {};
  if (!types.length) {
    callback(loaded);
    return;
  }

  this.ajax_(this.routes_.getEntityLists, { 'types': types }, function(res) {
    for (var i = 0, len = types.length; i < len; i++) {
      loaded[types[i]] = res[i];
    }
    callback(loaded);
  });
};


/** @override */
pn.data.ServerSource.prototype.getEntity = function(type, id, callback) {
  goog.asserts.assert(type);
  goog.asserts.assert(goog.isNumber(id));
  goog.asserts.assert(callback);

  if (id <= 0) { callback({'ID': id }); }
  else this.ajax_(this.routes_.getEntity, { 'type': type, 'id': id }, callback);
};


/**
 * @param {string} type The type of the entity to save.
 * @param {Object} entity The entity to save.
 * @param {function((string|Object)):undefined=} opt_cb The optional callback.
 */
pn.data.ServerSource.prototype.saveEntity = function(type, entity, opt_cb) {
  goog.asserts.assert(type);
  goog.asserts.assert(entity);

  pn.app.ctx.validateSecurity(type);

  var json = pn.json.serialiseJson(entity);
  var data = { 'type': type, 'entityJson': json };
  var cb = opt_cb || goog.bind(this.saveEntityCallback_, this, type);
  this.ajax_(this.routes_.saveEntity, data, cb);
};


/**
 * @param {string} type The type of the entity to order.
 * @param {!Array.<number>} ids The list of IDs in correct order.
 * @param {function():undefined=} opt_cb The optional callback.
 */
pn.data.ServerSource.prototype.orderEntities = function(type, ids, opt_cb) {
  goog.asserts.assert(type);
  goog.asserts.assert(ids);

  this.ajax_(this.routes_.orderGrid, {type: type, ids: ids}, opt_cb);
};


/**
 * @private
 * @param {string} type The type of the entity that was saved.
 * @param {string|Object} saved The error message to 'alert' or the
 *    saved entity.
 */
pn.data.ServerSource.prototype.saveEntityCallback_ = function(type, saved) {
  if (goog.isString(saved)) { window.alert(saved); }
  else {
    pn.app.ctx.pub(pn.app.AppEvents.ENTITY_SAVED, type, saved);
  }
};


/**
 * @param {string} type The type of the entity to save.
 * @param {Object} entity The entity to clone.
 */
pn.data.ServerSource.prototype.cloneEntity = function(type, entity) {
  goog.asserts.assert(type);
  goog.asserts.assert(entity);

  pn.app.ctx.validateSecurity(type);

  var data = { 'type': type, 'entityJson': pn.json.serialiseJson(entity) };
  this.ajax_(this.routes_.cloneEntity, data, function(cloned) {
    pn.app.ctx.pub(pn.app.AppEvents.ENTITY_CLONED, type, cloned);
  });
};


/**
 * @param {string} type The type of the entity to save.
 * @param {Object} entity The entity to save.
 */
pn.data.ServerSource.prototype.deleteEntity = function(type, entity) {
  goog.asserts.assert(type);
  goog.asserts.assert(entity);

  pn.app.ctx.validateSecurity(type);

  var data = { 'type': type, 'entityJson': pn.json.serialiseJson(entity) };
  this.ajax_(this.routes_.deleteEntity, data, function(err) {
    if (err) { pn.app.ctx.pub(pn.app.AppEvents.SHOW_ERROR, err); }
    else {
      pn.app.ctx.pub(pn.app.AppEvents.ENTITY_DELETED, type, entity);
    }
  });
};


/**
 * @param {string} type The type of the entity being exported.
 * @param {string} format The export format.
 * @param {Array.<Array.<string>>} data The data to export.
 */
pn.data.ServerSource.prototype.listExport = function(type, format, data) {
  var ed = {'exportType': format, 'exportData': pn.json.serialiseJson(data)};
  var uri = pn.app.ctx.cfg.appPath + this.routes_.exportData;
  pn.data.DataDownloader.send(uri, ed);
};


/**
 * @private
 * @param {string} uri The uri to call.
 * @param {!Object.<Object>} data The data to send in the call.
 * @param {Function|!string=} opt_success The success callback or event name.
 */
pn.data.ServerSource.prototype.ajax_ = function(uri, data, opt_success) {
  goog.asserts.assert(uri);
  goog.asserts.assert(data);

  var eventType = pn.data.ServerSource.EventType;
  this.dispatchEvent(new goog.events.Event(eventType.LOADING));

  var start = goog.now(),
      rid = uri + (this.requestCount_++),
      path = pn.app.ctx.cfg.appPath + uri,
      qd = goog.uri.utils.buildQueryDataFromMap(data);

  this.xhrMgr_.send(rid, path, 'POST', qd, null, null, goog.bind(function(e) {
    var xhr = e.target;
    if (!xhr.isSuccess()) {
      var error = 'An unexpected error has occurred.';
      pn.app.ctx.pub(pn.app.AppEvents.SHOW_ERROR, error);
    }
    else { this.ajaxSuccess_(xhr, opt_success); }

    var took = goog.now() - start;
    this.logger_.info('ajax uri: ' + uri + ' completed. Took: ' + took + 'ms.');

    this.dispatchEvent(new goog.events.Event(eventType.LOADED));
  }, this));
};


/**
 * @private
 * @param {!goog.net.XhrIo} xhr The completed Xhrio.
 * @param {Function|!string=} opt_success The success callback or event name.
 */
pn.data.ServerSource.prototype.ajaxSuccess_ = function(xhr, opt_success) {
  var resp = xhr.getResponseText();
  var parsed = resp;
  // Do not json deserialise xml response or error
  if (goog.isString(resp)) {
    try { parsed = pn.json.parseJson(resp); }
    catch (ex) {} // Probably an error message, display as is.
  }

  if (goog.isString(opt_success)) {
    pn.app.ctx.pub(opt_success, parsed);
  } else if (goog.isDefAndNotNull(opt_success)) {
    opt_success.call(this, parsed);
  }
};


/** @enum {string} */
pn.data.ServerSource.EventType = {
  LOADING: 'server-loading',
  LOADED: 'server-loaded'
};
