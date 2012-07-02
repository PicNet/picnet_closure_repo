;
goog.provide('pn.data.DataLoader');

goog.require('goog.debug.Logger');
goog.require('goog.net.XhrManager');
goog.require('goog.style');
goog.require('pn.app.AppEvents');
goog.require('pn.json');
goog.require('pn.log');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {Element} loadingPanel The loading panel to use to show when making
 *    ajax calls.
 */
pn.data.DataLoader = function(loadingPanel) {
  goog.Disposable.call(this);

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
  this.logger_ = pn.log.getLogger('pn.data.DataLoader');

  /**
   * @private
   * @type {number}
   */
  this.requestCount_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.outstandingCount_ = 0;

  /**
   * @private
   * @type {Element}
   */
  this.loadingPanel_ = loadingPanel;

  /**
   * @private
   * @type {!Object}
   */
  this.routes_ = pn.app.ctx.cfg.serverRoutes;
};
goog.inherits(pn.data.DataLoader, goog.Disposable);


/**
 * @private
 * @const
 * @type {number}
 */
pn.data.DataLoader.prototype.MAX_BUCKET_SIZE_ = -1;


/**
 * Loads the data schema from the server.
 * @param {function(!Array.<!Object>):undefined} callback The callback for the
 *    schema loading.
 */
pn.data.DataLoader.prototype.loadSchema = function(callback) {
  this.ajax_(this.routes_.loadSchema, {}, callback);
};


/**
 * @param {Array.<string>} types The entity types to load.
 * @param {function(Object.<Array>):undefined} callback A success callback.
 * @param {boolean=} opt_background Wether the query is to run in
 *    the background. i.e. Without a loading panel.
 * @param {string=} opt_parentField The optional parent field to check for a
 *    parentId match.
 * @param {number=} opt_parentId The optional parent id to check for a match.
 */
pn.data.DataLoader.prototype.loadEntityLists =
    function(types, callback, opt_background, opt_parentField, opt_parentId) {
  goog.asserts.assert(types);
  goog.asserts.assert(callback);

  var loaded = {};
  if (!types.length) {
    callback(loaded);
    return;
  }
  if (opt_parentId <= 0) {
    goog.array.forEach(types, function(t) { loaded[t] = []; });
    callback(loaded);
    return;
  }
  // Split up large requests in to buckets of MAX_BUCKET_SIZE_ types. If
  // MAX_BUCKET_SIZE_ is <= 0 then just do 1 bucket
  var buckets = this.MAX_BUCKET_SIZE_ <= 0 ? {'0': types} :
      goog.array.bucket(types, goog.bind(function(type, idx) {
        return Math.floor(idx / this.MAX_BUCKET_SIZE_).toString();
      }, this));

  var expected = types.length;
  goog.object.forEach(buckets, function(arr) {
    this.ajax_(this.routes_.getEntityLists,
        {
          'types': arr,
          'parentField': opt_parentField,
          'parentId': opt_parentId
        },
        function(lists) {
          expected -= lists.length;
          goog.array.forEach(lists, function(list, idx) {
            loaded[arr[idx]] = list;
          }, this);
          if (expected === 0) { callback(loaded); }
        }, opt_background);
  }, this);
};


/**
 * @param {string} type The entity type to load.
 * @param {number} id The ID to load.
 * @param {function(string, Object):undefined=} opt_callback An optional
 *    callback.
 */
pn.data.DataLoader.prototype.loadEntity =
    function(type, id, opt_callback) {
  goog.asserts.assert(type);
  goog.asserts.assert(goog.isNumber(id));

  var cb = opt_callback || function(en) {
    var mediatorEventType = pn.app.AppEvents.LOADED_ENTITY;
    pn.app.ctx.pub(mediatorEventType, type, en);
  };
  if (id <= 0) { cb({'ID': id }); }
  else this.ajax_(this.routes_.getEntity, { 'type': type, 'id': id }, cb);
};


/**
 * @param {string} type The type of the entity to save.
 * @param {Object} entity The entity to save.
 * @param {function((string|Object)):undefined=} opt_cb The optional callback.
 */
pn.data.DataLoader.prototype.saveEntity = function(type, entity, opt_cb) {
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
pn.data.DataLoader.prototype.orderEntities = function(type, ids, opt_cb) {
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
pn.data.DataLoader.prototype.saveEntityCallback_ = function(type, saved) {
  if (goog.isString(saved)) { window.alert(saved); }
  else {
    pn.app.ctx.pub(pn.app.AppEvents.ENTITY_SAVED, type, saved);
  }
};


/**
 * @param {string} type The type of the entity to save.
 * @param {Object} entity The entity to clone.
 */
pn.data.DataLoader.prototype.cloneEntity = function(type, entity) {
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
pn.data.DataLoader.prototype.deleteEntity = function(type, entity) {
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
pn.data.DataLoader.prototype.listExport = function(type, format, data) {
  var ed = {'exportType': format, 'exportData': pn.json.serialiseJson(data)};
  var uri = pn.app.ctx.cfg.appPath + this.routes_.exportData;
  pn.data.DataDownloader.send(uri, ed);
};


/**
 * @private
 * @param {string} uri The uri to call.
 * @param {!Object.<Object>} data The data to send in the call.
 * @param {Function|!string=} opt_success The success callback or event name.
 * @param {boolean=} opt_background Wether the query is to run in
 *    the background. i.e. Without a loading panel.
 */
pn.data.DataLoader.prototype.ajax_ =
    function(uri, data, opt_success, opt_background) {
  goog.asserts.assert(uri);
  goog.asserts.assert(data);

  if (!opt_background) {
    this.outstandingCount_++;
    goog.style.showElement(this.loadingPanel_, true);
  }

  var start = goog.now(),
      rid = uri + (this.requestCount_++),
      path = pn.app.ctx.cfg.appPath + uri,
      qd = goog.uri.utils.buildQueryDataFromMap(data);

  this.xhrMgr_.send(rid, path, 'POST', qd, null, null, goog.bind(function(e) {
    if (!opt_background) { this.outstandingCount_--; }
    var xhr = e.target;
    if (!xhr.isSuccess()) {
      var error = 'An unexpected error has occurred.';
      pn.app.ctx.pub(pn.app.AppEvents.SHOW_ERROR, error);
    }
    else { this.ajaxSuccess_(xhr, opt_success); }

    var took = goog.now() - start;
    var msg = 'ajax uri: ' + uri + ' completed. Took: ' + took + 'ms.';
    this.logger_.info((opt_background ? 'background ' : '') + msg);

    if (!opt_background && this.outstandingCount_ === 0) {
      goog.Timer.callOnce(function() {
        goog.style.showElement(this.loadingPanel_, false);
      }, 1, this);
    }
  }, this));
};


/**
 * @private
 * @param {!goog.net.XhrIo} xhr The completed Xhrio.
 * @param {Function|!string=} opt_success The success callback or event name.
 */
pn.data.DataLoader.prototype.ajaxSuccess_ = function(xhr, opt_success) {
  var resp = xhr.getResponseText();
  // Do not json deserialise xml response or error
  var parsed = !goog.isDefAndNotNull(resp) ? null :
      resp.charAt(0) === '<' || resp.indexOf('Error:') == 0 ? resp :
      pn.json.parseJson(resp);
  if (goog.isString(opt_success)) {
    pn.app.ctx.pub(opt_success, parsed);
  } else if (goog.isDefAndNotNull(opt_success)) {
    opt_success.call(this, parsed);
  }
};
