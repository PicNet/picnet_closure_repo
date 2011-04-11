goog.require('goog.array');

goog.require('pn.Utils');
goog.require('pn.data.AbstractRepository');
goog.require('pn.data.IRepository');

goog.provide('pn.data.LocalStorageRepository');



/**
 * @constructor
 * @implements {pn.data.IRepository}
 * @extends {pn.data.AbstractRepository}
 * @param {string} databaseName The name of the database to create or open.
 */
pn.data.LocalStorageRepository = function(databaseName) {
  pn.data.AbstractRepository.call(this, databaseName);

  this.log.fine('using the pn.data.LocalStorageRepository');
};
goog.inherits(pn.data.LocalStorageRepository,
    pn.data.AbstractRepository);


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.isSupported = function() {
  return true;
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.isInitialised =
    function(callback, handler) {
  // LocalStorage does not need to be pre-initialised
  callback.call(handler || this, true);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.init =
    function(types, callback, handler) {
  this.types = types;
  callback.call(handler || this);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.getList =
    function(type, callback, handler) {
  var json = window['localStorage'][type];
  if (json === '{}') { json = null; }
  if (json) {
    json = /** @type {Array} */ (this.recreateDates(
        /** @type {Object} */ (pn.Utils.parseJson(json))));
  }
  callback.call(handler || this, json || []);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.getLists =
    function(typeprefix, callback, handler) {
  if (typeprefix === 'UnsavedEntities' || typeprefix === 'DeletedIDs') {
    this.getUnsavedLists(typeprefix, function(dict2) {
      callback.call(handler || this, dict2);
    }, this);
  }
  else {
    var dict = {};
    for (var i = 0; i < window['localStorage']['length']; i++) {
      var type = window['localStorage']['key'](i);
      if (type.indexOf(typeprefix) !== 0) continue;
      this.getList(type, function(data) { dict[type] = data; });
    }
    callback.call(handler || this, dict);
  }
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.getUnsyncLists =
    function(typename, callback, handler) {
  var dict = {};
  goog.array.forEach(this.types, function(type) {
    if (goog.isDefAndNotNull(window['localStorage'][typename + '|' + type]))
      var list = this.recreateDates(pn.Utils.parseJson(
          window['localStorage'][typename + '|' + type]));
    if (list) dict[type] = list;
  }, this);
  callback.call(handler || this, dict);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.deleteList =
    function(type, callback, handler) {
  window['localStorage']['removeItem'](type);
  callback.call(handler || this, true);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.saveList =
    function(type, list, callback, handler) {
  this.getList(type, function(arr) {
    goog.array.forEach(list, function(e) {
      this.updateListWithItem(arr, e);
    }, this);
    window['localStorage'][type] =
        pn.Utils.serialiseJson(this.makeDateSafe(arr));
    callback.call(handler || this, true);
  }, this);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.getItem =
    function(type, id, callback, handler) {
  this.getList(type, function(list) {
    callback.call(handler || this, !list ? null : goog.array.find(list,
        function(e) { return e.ID === id; }));
  });
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.deleteItem =
    function(type, id, callback, handler) {
  this.getList(type, function(arr) {
    if (!arr) {
      return callback.call(handler || this, false);
    }
    var newarr = goog.array.filter(arr, function(e) {
      return id !== e.ID;
    });
    if (newarr.length !== arr.length) {
      this.deleteList(type, function() {
        this.saveList(type, newarr, function() {
          callback.call(handler || this, true);
        }, this);
      }, this);
    } else { callback.call(handler || this, false); }
  }, this);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.deleteItems =
    function(type, ids, callback, handler) {
  this.getList(type, function(arr) {
    if (!arr) { return callback.call(handler || this, false); }
    var newarr = goog.array.filter(arr, function(e) {
      return goog.array.indexOf(ids, e.ID) < 0;
    });
    if (newarr.length !== arr.length) {
      this.deleteList(type, function() {
        this.saveList(type, newarr, function() {
          callback.call(handler || this, true);
        }, this);
      }, this);
    } else { callback.call(handler || this, false); }
  }, this);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.saveItem =
    function(type, item, callback, handler) {
  this.saveList(type, [item], callback, handler);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.clearEntireDatabase =
    function(callback, handler) {
  window['localStorage']['clear']();
  callback.call(handler);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.disposeInternal = function() {
  pn.data.LocalStorageRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.log);
};
