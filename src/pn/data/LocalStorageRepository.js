
goog.require('goog.array');
goog.require('pn.data.AbstractRepository');
goog.require('pn.data.IRepository');
goog.require('pn.json');

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
    function(callback, opt_handler) {
  // LocalStorage does not need to be pre-initialised
  callback.call(opt_handler || this, true);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.init =
    function(types, callback, opt_handler) {
  this.types = types;
  callback.call(opt_handler || this);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.getList =
    function(type, callback, opt_handler) {
  var json = window['localStorage'][type];
  if (json === '{}') { json = null; }
  if (json) {
    json = /** @type {Array} */ (pn.json.parseJson(json));
  }
  callback.call(opt_handler || this, json || []);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.getLists =
    function(typeprefix, callback, opt_handler) {
  if (typeprefix === 'UnsavedEntities' || typeprefix === 'DeletedIDs') {
    this.getUnsavedLists(typeprefix, function(dict2) {
      callback.call(opt_handler || this, dict2);
    }, this);
  }
  else {
    var dict = {};
    for (var i = 0; i < window['localStorage']['length']; i++) {
      var type = window['localStorage']['key'](i);
      if (type.indexOf(typeprefix) !== 0) continue;
      this.getList(type, function(data) { dict[type] = data; });
    }
    callback.call(opt_handler || this, dict);
  }
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.getUnsyncLists =
    function(typename, callback, opt_handler) {
  var dict = {};
  goog.array.forEach(this.types, function(type) {
    if (goog.isDefAndNotNull(window['localStorage'][typename + '|' + type]))
      var list = window['localStorage'][typename + '|' + type];
    list = pn.json.parseJson(list);
    if (list) dict[type] = list;
  }, this);
  callback.call(opt_handler || this, dict);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.deleteList =
    function(type, callback, opt_handler) {
  window['localStorage']['removeItem'](type);
  callback.call(opt_handler || this, true);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.saveList =
    function(type, list, callback, opt_handler) {
  this.getList(type, function(arr) {
    goog.array.forEach(list, function(e) {
      this.updateListWithItem(arr, e);
    }, this);
    window['localStorage'][type] = pn.json.serialiseJson(arr);
    callback.call(opt_handler || this, true);
  }, this);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.getItem =
    function(type, id, callback, opt_handler) {
  this.getList(type, function(list) {
    var entity = !list ? null :  /** @type {pn.data.IEntity} */
        (goog.array.find(list, function(e) { return e.ID === id; }));
    callback.call(opt_handler || this, entity);
  });
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.deleteItem =
    function(type, id, callback, opt_handler) {
  this.getList(type, function(arr) {
    if (!arr) {
      return callback.call(opt_handler || this, false);
    }
    var newarr = goog.array.filter(arr, function(e) {
      return id !== e.ID;
    });
    if (newarr.length !== arr.length) {
      this.deleteList(type, function() {
        this.saveList(type, newarr, function() {
          callback.call(opt_handler || this, true);
        }, this);
      }, this);
    } else { callback.call(opt_handler || this, false); }
  }, this);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.deleteItems =
    function(type, ids, callback, opt_handler) {
  this.getList(type, function(arr) {
    if (!arr) { return callback.call(opt_handler || this, false); }
    var newarr = goog.array.filter(arr, function(e) {
      return goog.array.indexOf(ids, e.ID) < 0;
    });
    if (newarr.length !== arr.length) {
      this.deleteList(type, function() {
        this.saveList(type, newarr, function() {
          callback.call(opt_handler || this, true);
        }, this);
      }, this);
    } else { callback.call(opt_handler || this, false); }
  }, this);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.saveItem =
    function(type, item, callback, opt_handler) {
  this.saveList(type, [item], callback, opt_handler);
};


/** @inheritDoc */
pn.data.LocalStorageRepository.prototype.clearEntireDatabase =
    function(callback, opt_handler) {
  window['localStorage']['clear']();
  callback.call(opt_handler);
};
