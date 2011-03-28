;
goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.object');

goog.require('picnet.Utils');
goog.require('picnet.data.IDataProvider');
goog.require('picnet.data.IEntity');
goog.require('picnet.data.TransactionResult');

goog.provide('picnet.data.IDataAjaxRequest');
goog.provide('picnet.data.RemoteDataProvider');



/**
 * @interface
 */
picnet.data.IDataAjaxRequest = function() {};


/**
 * @param {string} method The remote method to call.
 * @param {!Object} data The args to pass to the remote method.
 * @param {!function(Object)|function(Array.<Object>)|
 *    !function(picnet.data.TransactionResult)|
 *    !function(Array.<picnet.data.TransactionResult>)} callback The
 *    success callback.
 * @param {!function()|null} offlineCallback The callback to use when the
 *    application has gone offline.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IDataAjaxRequest.prototype.makeAjaxRequest =
    function(method, data, callback, offlineCallback, handler) {};



/**
 * @constructor
 * @implements {picnet.data.IDataProvider}
 * @extends {goog.Disposable}
 * @param {!picnet.data.IDataAjaxRequest} ajax The ajax provider.
 */
picnet.data.RemoteDataProvider = function(ajax) {
  goog.Disposable.call(this);

  /**
   * @private
   * @type {!picnet.data.IDataAjaxRequest}
   */
  this.ajax_ = ajax;

  /**
   * @type {function(string,picnet.data.IEntity):boolean}
   */
  this.onPreSave;
};
goog.inherits(picnet.data.RemoteDataProvider, goog.Disposable);


/**
 * @const
 * @type {string}
 */
picnet.data.RemoteDataProvider.OFFLINE = 'OFFLINE';


/** @inheritDoc */
picnet.data.RemoteDataProvider.prototype.getEntities = function(type) {
  throw new Error('RemoteDataProvider.getEntities not supported');
};


/** @inheritDoc */
picnet.data.RemoteDataProvider.prototype.getEntity = function(type, id) {
  throw new Error('RemoteDataProvider.getEntity not supported');

};


/** @inheritDoc */
picnet.data.RemoteDataProvider.prototype.saveEntity =
    function(type, data, callback, handler) {
  if (this.onPreSave && !this.onPreSave(type, data)) {
    callback.call(handler, null);
    return;
  }

  this.ajax_.makeAjaxRequest('SaveEntity', {'type': type, 'entity':
        picnet.Utils.serialiseJson(data)}, callback, function() {
    callback.call(handler, picnet.data.RemoteDataProvider.OFFLINE);
  }, handler);
};


/** @inheritDoc */
picnet.data.RemoteDataProvider.prototype.deleteEntity =
    function(type, id, callback, handler) {
  this.ajax_.makeAjaxRequest('DeleteEntity', {'type': type, 'id': id}, callback,
      function() {
        callback.call(handler, picnet.data.RemoteDataProvider.OFFLINE);
      }, handler);
};


/** @inheritDoc */
picnet.data.RemoteDataProvider.prototype.deleteEntities =
    function(type, ids, callback, handler) {
  if (!ids || ids.length === 0) { return callback.call(handler || this, []); }
  this.ajax_.makeAjaxRequest('DeleteEntities', {'type': type, 'ids': ids},
      callback, function() {
        callback.call(handler, picnet.data.RemoteDataProvider.OFFLINE);
      }, handler);
};


/** @inheritDoc */
picnet.data.RemoteDataProvider.prototype.saveEntities =
    function(data, callback, handler) {
  this.ajax_.makeAjaxRequest('SaveEntities', {'data':
        picnet.Utils.serialiseJson(
        this.convertToPolymorphicablePackage_(data))},
  callback, function() {
    callback.call(handler, picnet.data.RemoteDataProvider.OFFLINE);
  }, handler);
};


/**
 * @private
 * @param {!Object.<string, !Array.<picnet.data.IEntity>>} data The data to
 *    convert.
 * @return {!Object.<string, string>} The converted data (serialised [json]
 *    internals).
 */
picnet.data.RemoteDataProvider.prototype.convertToPolymorphicablePackage_ =
    function(data) {
  // Convert arrays to JSON to allow polymorphic deserialisation in server
  var data2 = {};
  for (var type in data) {
    var arr = data[type];
    if (this.onPreSave) {
      arr = goog.array.map(arr, function(e) { this.onPreSave(type, e); });
    }
    data2[type] = picnet.Utils.serialiseJson(arr);
  }
  return data2;
};


/**
 * @param {!Object.<string, !Array.<picnet.data.IEntity>>} tosave The batch
 *    data map to save.
 * @param {!Object.<string, !Array.<number>>} todelete The batch data map
 *    to delete.
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.RemoteDataProvider.prototype.updateServer =
    function(tosave, todelete, callback, handler) {
  if (goog.object.isEmpty(tosave) && goog.object.isEmpty(todelete)) {
    callback.call(handler || this, null);
    return;
  }
  this.ajax_.makeAjaxRequest('UpdateServer', {
    'tosave':
        picnet.Utils.serialiseJson(
        this.convertToPolymorphicablePackage_(tosave)),
    'todelete': picnet.Utils.serialiseJson(todelete)
  }, callback, null, handler);
};


/**
 * @param {string} since The data to get changes from.
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.RemoteDataProvider.prototype.getChangesSince =
    function(since, callback, handler) {
  this.ajax_.makeAjaxRequest('GetChangesSince', {'since': since},
      callback, null, handler);
};


/**
 * @private
 * @param {!Object} o The object to property level stringify.
 */
picnet.data.RemoteDataProvider.prototype.stringifyValues_ = function(o) {
  if (!o) { return; }
  for (var i in o) {
    o[i] = picnet.Utils.serialiseJson(o[i]);
  }
};


/** @inheritDoc */
picnet.data.RemoteDataProvider.prototype.disposeInternal = function() {
  picnet.data.RemoteDataProvider.superClass_.disposeInternal.call(this);

  goog.dispose(this.ajax_);
};
