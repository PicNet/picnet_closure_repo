goog.require('goog.array');
goog.require('goog.debug');

goog.require('pn.data.AbstractRepository');
goog.require('pn.data.IEntity');

goog.provide('pn.data.IndexedDBRepository');

if (!window['indexedDB'] && 'webkitIndexedDB' in window) {
  window['indexedDB'] = window.webkitIndexedDB;
} else if (!window['indexedDB'] && 'mozIndexedDB' in window) {
  window['indexedDB'] = window.mozIndexedDB;
}



/**
 * @constructor
 * @extends {pn.data.AbstractRepository}
 * @param {string} databaseName The name of the database to open or create.
 */
pn.data.IndexedDBRepository = function(databaseName) {
  pn.data.AbstractRepository.call(this, databaseName);
  this.log.finest('using the pn.data.IndexedDBRepository');
};
goog.inherits(pn.data.IndexedDBRepository, pn.data.AbstractRepository);


/**
 * @private
 * @type {!IDBDatabase}
 */
pn.data.IndexedDBRepository.prototype.db_;


/**
 * @private
 * @type {!Array.<string>}
 */
pn.data.IndexedDBRepository.prototype.osNames_;


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.isSupported = function() {
  return pn.data.IndexedDBRepository.isSupported();
};


/**
 * @return {boolean} Wether indexeddb is supported in the current browser.
 */
pn.data.IndexedDBRepository.isSupported = function() {
  return typeof (window['indexedDB']) !== 'undefined';
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.isInitialised =
    function(callback, opt_handler) {
  callback.call(opt_handler || this, goog.isDefAndNotNull(this.db_));
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.init =
    function(types, callback, opt_handler) {

  this.types = types;
  this.osNames_ = goog.array.concat([], this.types);
  this.osNames_ = goog.array.concat(this.osNames_,
      goog.array.map(this.types,
      function(t) { return 'UnsavedEntities|' + t; }));
  this.osNames_ = goog.array.concat(this.osNames_,
      goog.array.map(this.types,
      function(t) { return 'DeletedIDs|' + t; }));

  this.getDatabase_(callback, opt_handler); // Init the DB
};


/**
 * @private
 * @param {function(IDBDatabase)} callback The callback to call with the open
 *    database.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IndexedDBRepository.prototype.getDatabase_ =
    function(callback, opt_handler) {
  if (this.db_) {
    callback.call(opt_handler, this.db_);
    return;
  }
  var name = this.databaseName;
  this.runRequest_(window['indexedDB'].open(name, name),
      function(result) {
        this.db_ = result;
        if (this.db_.version === '1.1') {
          callback.call(opt_handler, this.db_);
          return;
        }

        this.runRequest_(this.db_.setVersion('1.1'), function() {
          goog.array.forEach(this.osNames_, function(t) {
            this.db_.createObjectStore(t, {'keyPath': 'ID'}, false);
          }, this);
          callback.call(opt_handler, this.db_);
        }, this);
      }, this);
};


/**
 * @private
 * @param {string} table The name of the object store to open.
 * @param {boolean} rw Wether the transaction needs to be read-write.
 * @return {!IDBObjectStore} The object store for the specified type.
 */
pn.data.IndexedDBRepository.prototype.getObjectStore_ = function(table, rw) {
  return this.getTransaction_([table], rw).objectStore(table);
};


/**
 * @private
 * @param {Array.<string>} types The name of the object store types.
 * @param {boolean} rw Wether the transaction needs to be read-write.
 * @return {!IDBTransaction} The transaction that can access all the
 *    specified types.
 */
pn.data.IndexedDBRepository.prototype.getTransaction_ = function(types, rw) {
  var trans = this.db_.transaction(types, rw ? 'readwrite' : 'readonly');
  return trans;
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.getList =
    function(type, callback, opt_handler) {
  this.getListImpl_(this.getObjectStore_(type, false), callback, opt_handler);
};


/**
 * @private
 * @param {!IDBObjectStore} os The object store to use for the getAll operation.
 * @param {!function(Array.<pn.data.IEntity>)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IndexedDBRepository.prototype.getListImpl_ =
    function(os, callback, opt_handler) {
  if (os.getAll) {
    this.runRequest_(os.getAll(), function(result) {
      callback.call(opt_handler || this, result);
    }, this);
  } else {
    var list = [];
    // WebKit unfortunatelly does not support clear so ugly cursor here
    this.doOnCursor_(os, function(c) {
      list.push(c.value);
    }, function() {
      callback.call(opt_handler || this, list);
    }, opt_handler);
  }
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.getLists =
    function(typeprefix, callback, opt_handler) {
  if (typeprefix === 'UnsavedEntities' || typeprefix === 'DeletedIDs') {
    this.getUnsavedLists(typeprefix, function(dict2) {
      callback.call(opt_handler || this, dict2);
    }, this);
  } else {
    var types = goog.array.filter(this.types, function(t) {
      return t.indexOf(typeprefix) === 0;
    });
    this.getListsFromTransaction_(types, callback, opt_handler);
  }
};


/**
 * @private
 * @param {!Array.<string>} types The types to retreive.
 * @param {!function(Object.<string, Array.<pn.data.IEntity|number>>)}
 *    callback  The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IndexedDBRepository.prototype.getListsFromTransaction_ =
    function(types, callback, opt_handler) {
  var dict = {};
  var trans = this.getTransaction_(types, false);
  this.getListsImpl_(trans, types, dict, callback, opt_handler);
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
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IndexedDBRepository.prototype.getListsImpl_ =
    function(transaction, types, dict, callback, opt_handler) {
  if (types.length === 0) { callback.call(opt_handler || this, dict); return; }
  var type = types.pop();

  var os = transaction.objectStore(type);
  this.getListImpl_(os, function(list) {
    dict[type] = list;
    this.getListsImpl_(transaction, types, dict, callback, opt_handler);
  }, this);
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.deleteList =
    function(type, callback, opt_handler) {
  if (type === 'UnsavedEntities') {
    this.removeLocalUnsavedItems_(goog.array.clone(this.types), function() {
      callback.call(opt_handler || this, true);
    }, this);
  } else if (!goog.array.contains(this.osNames_, type)) {
    callback.call(opt_handler || this, false);
  } else {
    var os = this.getObjectStore_(type, true);
    if (os.clear) {
      this.runRequest_(os.clear(), function() {
        callback.call(opt_handler || this, true);
      }, this);
    } else {
      // WebKit unfortunatelly does not support clear so ugly cursor here
      this.doOnCursor_(os, function(c) {
        c['delete']();
      }, callback, opt_handler);
    }
  }
};


/**
 * @private
 * @param {IDBObjectStore} os The object store to iterate.
 * @param {function(!IDBCursor):undefined} op The operation to perform in each
 *    iteration.
 * @param {!function(boolean):undefined} callback The callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IndexedDBRepository.prototype.doOnCursor_ =
    function(os, op, callback, opt_handler) {
  this.runRequest_(os.openCursor(), function(cursor) {
    if (!cursor) {
      callback.call(opt_handler || this, true);
      return;
    }
    op.call(opt_handler || this, cursor);
    cursor['continue']();
  }, this);
};


/**
 * @private
 * @param {!Array.<string>} types The types to remove unsaved items from.
 * @param {!function()} callback The callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IndexedDBRepository.prototype.removeLocalUnsavedItems_ =
    function(types, callback, opt_handler) {
  if (types.length === 0) {
    callback.call(opt_handler || this);
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
        this.removeLocalUnsavedItems_(types, callback, opt_handler);
        return;
      }, this);
    }, this);
  }, this);
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.saveList =
    function(type, list, callback, opt_handler) {
  list = goog.array.clone(list);
  this.saveListImpl_(this.getObjectStore_(type, true), list,
      callback, opt_handler);
};


/**
 * @private
 * @param {!IDBObjectStore} os The object store.
 * @param {!Array.<pn.data.IEntity|number>} list The list to save.
 * @param {!function(boolean)} callback The callback to call after save.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IndexedDBRepository.prototype.saveListImpl_ =
    function(os, list, callback, opt_handler) {
  if (!list || list.length === 0) {
    callback.call(opt_handler, true);
    return;
  }

  var item = list.pop();
  os.add(item);
  this.saveListImpl_(os, list, callback, opt_handler);
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.deleteItem =
    function(type, id, callback, opt_handler) {
  var os = this.getObjectStore_(type, true);
  this.runRequest_(os['delete'](id),
      function() {
        callback.call(opt_handler || this, true);
      }, this, function() {
        callback.call(opt_handler || this, false);
      });
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.deleteItems =
    function(type, ids, callback, opt_handler) {
  if (ids.length === 0) {return callback.call(opt_handler || this, true); }
  ids = goog.array.clone(ids);
  this.deleteItemsImpl_(this.getObjectStore_(type, true),
      type, ids, callback, opt_handler);
};


/**
 * @private
 * @param {!IDBObjectStore} os The object store.
 * @param {string} type The entity type.
 * @param {!Array.<number>} ids The ids to delete (of the specified type).
 * @param {!function(boolean)} callback Success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IndexedDBRepository.prototype.deleteItemsImpl_ =
    function(os, type, ids, callback, opt_handler) {
  if (!ids || ids.length === 0) {
    callback.call(opt_handler || this, true);
    return;
  }

  var id = ids.pop();
  this.runRequest_(os['delete'](id), function() {
    this.deleteItemsImpl_(os, type, ids, callback, opt_handler);
  }, this);
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.getItem =
    function(type, id, callback, opt_handler) {
  this.runRequest_(this.getObjectStore_(type, false).get(id), function(result) {
    callback.call(opt_handler || this, result);
  }, this);
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.saveItem =
    function(type, item, callback, opt_handler) {
  if (typeof(item) === 'number') {
    item = /** @type {!pn.data.IEntity} */ ({ID: item});
  }

  var os = this.getObjectStore_(type, true);
  this.runRequest_(os.put(item),
      function() {
        callback.call(opt_handler || this, true);
      }, this);
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.clearEntireDatabase =
    function(callback, opt_handler) {
  this.deleteListsImpl_(goog.array.clone(this.osNames_),
      callback, this);
};


/**
 * @private
 * @param {Array.<string>} types The types to delete.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IndexedDBRepository.prototype.deleteListsImpl_ =
    function(types, callback, opt_handler) {
  if (types.length === 0) {
    callback.call(opt_handler || this);
    return;
  }
  this.deleteList(types.pop(), function() {
    this.deleteListsImpl_(types, callback, opt_handler);
  }, this);
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.getUnsyncLists =
    function(typename, callback, opt_handler) {
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
    callback.call(opt_handler || this, dict3);
  }, this);
};


/**
 * @private
 * @param {IDBRequest} req The indexeddb request.
 * @param {function(Object=,*=):undefined} callback The success
 *    callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 * @param {Function=} opt_onerror The error callback.
 */
pn.data.IndexedDBRepository.prototype.runRequest_ =
    function(req, callback, opt_handler, opt_onerror) {
  if (opt_onerror) {
    req.onerror = function(e) { opt_onerror.call(opt_handler || this, e); }
  } else {
    req.onerror = goog.bind(function(e) {
      this.log.severe(goog.debug.expose(e));
    }, this);
  }

  req.onsuccess = function(e) {
    goog.Timer.callOnce(function() {
      callback.call(opt_handler || this, e.result || req['result']);
    }, 1);
  };
};


/** @inheritDoc */
pn.data.IndexedDBRepository.prototype.disposeInternal = function() {
  pn.data.IndexedDBRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.db_);
  goog.dispose(this.log);

  delete this.db_;
};
