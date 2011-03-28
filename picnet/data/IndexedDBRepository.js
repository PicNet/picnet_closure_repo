goog.require('goog.array');
goog.require('goog.debug');

goog.require('picnet.data.AbstractRepository');
goog.require('picnet.data.IEntity');

goog.provide('picnet.data.IndexedDBRepository');

if ('webkitIndexedDB' in window) {
  window['indexedDB'] = window.webkitIndexedDB;
  window['IDBTransaction'] = window.webkitIDBTransaction;
  window['IDBKeyRange'] = window.webkitIDBKeyRange;
} else if ('mozIndexedDB' in window) {
  window['indexedDB'] = window.mozIndexedDB;
}



/**
 * NOTE: This is broken in the current FireFox 4b7 release.  Please use FF4b6 to
 * test. I'm sure it will be fixed when FF4 is relerased next year
 *
 * @constructor
 * @extends {picnet.data.AbstractRepository}
 * @param {string} databaseName The name of the database to open or create.
 */
picnet.data.IndexedDBRepository = function(databaseName) {
  picnet.data.AbstractRepository.call(this, databaseName);
  this.log.finest('using the picnet.data.IndexedDBRepository');
};
goog.inherits(picnet.data.IndexedDBRepository, picnet.data.AbstractRepository);


/**
 * @private
 * @type {!IDBDatabase}
 */
picnet.data.IndexedDBRepository.prototype.db_;


/**
 * @private
 * @type {!Array.<string>}
 */
picnet.data.IndexedDBRepository.prototype.osNames_;


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.isSupported = function() {
  return picnet.data.IndexedDBRepository.isSupported();
};


/**
 * @return {boolean} Wether indexeddb is supported in the current browser.
 */
picnet.data.IndexedDBRepository.isSupported = function() {
  return typeof (window['indexedDB']) !== 'undefined';
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.isInitialised =
    function(callback, handler) {
  callback.call(handler || this, goog.isDefAndNotNull(this.db_));
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.init =
    function(types, callback, handler) {

  this.types = types;
  this.osNames_ = goog.array.concat([], this.types);
  this.osNames_ = goog.array.concat(this.osNames_,
      goog.array.map(this.types,
      function(t) { return 'UnsavedEntities|' + t; }));
  this.osNames_ = goog.array.concat(this.osNames_,
      goog.array.map(this.types,
      function(t) { return 'DeletedIDs|' + t; }));

  this.getDatabase_(callback, handler); // Init the DB
};


/**
 * @private
 * @param {function(IDBDatabase)} callback The callback to call with the open
 *    database.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IndexedDBRepository.prototype.getDatabase_ =
    function(callback, handler) {
  if (this.db_) {
    callback.call(handler, this.db_);
    return;
  }
  this.runRequest_(window.indexedDB.open(
      this.databaseName, this.databaseName),
      function(result) {
        this.db_ = result;
        if (this.db_.version === '1.1') {
          callback.call(handler, this.db_);
          return;
        }

        this.runRequest_(this.db_.setVersion('1.1'), function() {
          goog.array.forEach(this.osNames_, function(t) {
            this.db_.createObjectStore(t, {'keyPath': 'ID'}, false);
          }, this);
          callback.call(handler, this.db_);
        }, this);
      }, this);
};


/**
 * @private
 * @param {string} table The name of the object store to open.
 * @param {boolean} readWrite Wether the transaction needs to be read-write.
 * @return {!IDBObjectStore} The object store for the specified type.
 */
picnet.data.IndexedDBRepository.prototype.getObjectStore_ =
    function(table, readWrite) {
  return this.getTransaction_([table], readWrite).objectStore(table);
};


/**
 * @private
 * @param {Array.<string>} types The name of the object store types.
 * @param {boolean} readWrite Wether the transaction needs to be read-write.
 * @return {!IDBTransaction} The transaction that can access all the
 *    specified types.
 */
picnet.data.IndexedDBRepository.prototype.getTransaction_ =
    function(types, readWrite) {
  var trans = this.db_.transaction(types,
      readWrite ? IDBTransaction.READ_WRITE :
      IDBTransaction.READ_ONLY);
  return trans;
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.getList =
    function(type, callback, handler) {
  this.getListImpl_(this.getObjectStore_(type, false), callback, handler);
};


/**
 * @private
 * @param {!IDBObjectStore} os The object store to use for the getAll operation.
 * @param {!function(Array.<picnet.data.IEntity>)} callback The
 *    success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IndexedDBRepository.prototype.getListImpl_ =
    function(os, callback, handler) {
  if (os.getAll) {
    this.runRequest_(os.getAll(), function(result) {
      callback.call(handler || this, result);
    }, this);
  } else {
    var list = [];
    // WebKit unfortunatelly does not support clear so ugly cursor here
    this.doOnCursor_(os, function(c) {
      list.push(c.value);
    }, function() {
      callback.call(handler || this, list);
    }, handler);
  }
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.getLists =
    function(typeprefix, callback, handler) {
  if (typeprefix === 'UnsavedEntities' || typeprefix === 'DeletedIDs') {
    this.getUnsavedLists(typeprefix, function(dict2) {
      callback.call(handler || this, dict2);
    }, this);
  } else {
    var types = goog.array.filter(this.types, function(t) {
      return t.indexOf(typeprefix) === 0;
    });
    this.getListsFromTransaction_(types, callback, handler);
  }
};


/**
 * @private
 * @param {!Array.<string>} types The types to retreive.
 * @param {!function(Object.<string, Array.<picnet.data.IEntity|number>>)}
 *    callback  The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IndexedDBRepository.prototype.getListsFromTransaction_ =
    function(types, callback, handler) {
  var dict = {};
  var trans = this.getTransaction_(types, false);
  this.getListsImpl_(trans, types, dict, callback, handler);
};


/**
 * @private
 * @param {!IDBTransaction} transaction The transaction to use for the
 *    operations.  The transaction needs to have access to all the specified
 *    types.
 * @param {Array.<string>} types The types to retreive.
 * @param {Object.<string, Array.<string>>} dict The dictionary to fill with
 *    the retreived data.
 * @param {function(Object.<string, Array.<string>>)} callback The callback to
 *    call with the retreived data.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IndexedDBRepository.prototype.getListsImpl_ =
    function(transaction, types, dict, callback, handler) {
  if (types.length === 0) { callback.call(handler || this, dict); return; }
  var type = types.pop();

  var os = transaction.objectStore(type);
  this.getListImpl_(os, function(list) {
    dict[type] = list;
    this.getListsImpl_(transaction, types, dict, callback, handler);
  }, this);
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.deleteList =
    function(type, callback, handler) {
  if (type === 'UnsavedEntities') {
    this.removeLocalUnsavedItems_(goog.array.clone(this.types), function() {
      callback.call(handler || this, true);
    }, this);
  } else if (!goog.array.contains(this.osNames_, type)) {
    callback.call(handler || this, false);
  } else {
    var os = this.getObjectStore_(type, true);
    if (os.clear) {
      this.runRequest_(os.clear(), function() {
        callback.call(handler || this, true);
      }, this);
    } else {
      // WebKit unfortunatelly does not support clear so ugly cursor here
      this.doOnCursor_(os, function(c) {
        c['delete']();
      }, callback, handler);
    }
  }
};


/**
 * @private
 * @param {IDBObjectStore} os The object store to iterate.
 * @param {function(!IDBCursor):undefined} op The operation to perform in each
 *    iteration.
 * @param {!function()} callback The callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IndexedDBRepository.prototype.doOnCursor_ =
    function(os, op, callback, handler) {
  this.runRequest_(os.openCursor(), function(cursor) {
    if (!cursor) {
      callback.call(handler || this, true);
      return;
    }
    op.call(handler || this, cursor);
    cursor['continue']();
  }, this);
};


/**
 * @private
 * @param {!Array.<string>} types The types to remove unsaved items from.
 * @param {!function()} callback The callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IndexedDBRepository.prototype.removeLocalUnsavedItems_ =
    function(types, callback, handler) {
  if (types.length === 0) {
    callback.call(handler || this);
    return;
  }
  var type = types.pop();

  var unsavedtype = 'UnsavedEntities|' + type;

  this.getList(type, function(list) {
    var ids = [];
    goog.array.forEach(list, function(item) { if (item.ID < 0) {
      ids.push(item.ID);
    } }, this);
    this.deleteItems(type, ids, function() {
      this.deleteList(unsavedtype, function(deleted) {
        this.removeLocalUnsavedItems_(types, callback, handler);
        return;
      }, this);
    }, this);
  }, this);
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.saveList =
    function(type, list, callback, handler) {
  list = goog.array.clone(list);
  this.saveListImpl_(this.getObjectStore_(type, true), list, callback, handler);
};


/**
 * @private
 * @param {!IDBObjectStore} os The object store.
 * @param {!Array.<picnet.data.IEntity|number>} list The list to save.
 * @param {!function(boolean)} callback The callback to call after save.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IndexedDBRepository.prototype.saveListImpl_ =
    function(os, list, callback, handler) {
  if (!list || list.length === 0) {
    callback.call(handler, true);
    return;
  }

  var item = list.pop();
  os.add(item);
  this.saveListImpl_(os, list, callback, handler);
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.deleteItem =
    function(type, id, callback, handler) {
  var os = this.getObjectStore_(type, true);
  this.runRequest_(os['delete'](id),
      function() {
        callback.call(handler || this, true);
      }, this, function() {
        callback.call(handler || this, false);
      });
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.deleteItems =
    function(type, ids, callback, handler) {
  if (ids.length === 0) {return callback.call(handler || this, true); }
  ids = goog.array.clone(ids);
  this.deleteItemsImpl_(this.getObjectStore_(type, true),
      type, ids, callback, handler);
};


/**
 * @private
 * @param {!IDBObjectStore} os The object store.
 * @param {string} type The entity type.
 * @param {!Array.<number>} ids The ids to delete (of the specified type).
 * @param {!function(boolean)} callback Success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IndexedDBRepository.prototype.deleteItemsImpl_ =
    function(os, type, ids, callback, handler) {
  if (!ids || ids.length === 0) {
    callback.call(handler || this, true);
    return;
  }

  var id = ids.pop();
  this.runRequest_(os['delete'](id), function() {
    this.deleteItemsImpl_(os, type, ids, callback, handler);
  }, this);
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.getItem =
    function(type, id, callback, handler) {
  this.runRequest_(this.getObjectStore_(type, false).get(id), function(result) {
    callback.call(handler || this, result);
  }, this);
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.saveItem =
    function(type, item, callback, handler) {
  if (typeof(item) === 'number') { item = {ID: item}; }

  var os = this.getObjectStore_(type, true);
  this.runRequest_(os.put(item),
      function() {
        callback.call(handler || this, true);
      }, this);
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.clearEntireDatabase =
    function(callback, handler) {
  this.deleteListsImpl_(goog.array.clone(this.osNames_),
      callback, this);
};


/**
 * @private
 * @param {Array.<string>} types The types to delete.
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IndexedDBRepository.prototype.deleteListsImpl_ =
    function(types, callback, handler) {
  if (types.length === 0) {
    callback.call(handler || this);
    return;
  }
  this.deleteList(types.pop(), function() {
    this.deleteListsImpl_(types, callback, handler);
  }, this);
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.getUnsyncLists =
    function(typename, callback, handler) {
  var dict = {};
  var types = [];
  goog.array.forEach(this.types, function(type) {
    var fullType = typename + '|' + type;
    if (goog.array.contains(this.osNames_, fullType)) {
      types.push(fullType);
    }
  }, this);


  this.getListsFromTransaction_(types, function(dict2) {
    var dict3 = {};
    for (var i in dict2) {
      var list = dict2[i];
      if (!list || list.length === 0) continue;
      if (typename === 'DeletedIDs') { list = goog.array.map(list,
          function(item) { return item.ID; }); }
      dict3[i.split('|')[1]] = list;
    }
    callback.call(handler || this, dict3);
  }, this);
};


/**
 * @private
 * @param {IDBRequest} req The indexeddb request.
 * @param {function(IDBSuccessEvent=,*=):undefined} callback The success
 *    callback.
 * @param {Object=} handler The context to use when calling the callback.
 * @param {Function=} onerror The error callback.
 */
picnet.data.IndexedDBRepository.prototype.runRequest_ =
    function(req, callback, handler, onerror) {
  if (onerror) {
    req.onerror = function(e) { onerror.call(handler || this, e); }
  } else {
    var that = this;
    req.onerror = function(e) {
      that.log.severe(goog.debug.expose(e));
    }
  }

  req.onsuccess = function(e) {
    callback.call(handler || this, e.result || req['result']);
  }
};


/** @inheritDoc */
picnet.data.IndexedDBRepository.prototype.disposeInternal = function() {
  picnet.data.IndexedDBRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.db_);
  goog.dispose(this.log);

  delete this.db_;
};
