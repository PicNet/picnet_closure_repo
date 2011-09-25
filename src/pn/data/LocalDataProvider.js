goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.object');
goog.require('pn.Utils');

goog.require('pn.data.IDataProvider');
goog.require('pn.data.IEntity');
goog.require('pn.data.IRepository');
goog.require('pn.data.TransactionResult');

goog.provide('pn.data.LocalDataProvider');



/**
 * @constructor
 * @implements {pn.data.IDataProvider}
 * @extends {goog.Disposable}
 * @param {!pn.data.IRepository} repository The repository to use for
 *    storing local data.
 */
pn.data.LocalDataProvider = function(repository) {
  goog.Disposable.call(this);

  /**
   * @type {!pn.data.IRepository}
   */
  this.repository = repository;
};
goog.inherits(pn.data.LocalDataProvider, goog.Disposable);


/** @inheritDoc */
pn.data.LocalDataProvider.prototype.getEntities = function(type) {
  throw new Error('LocalDataProvider.getEntities not supported');
  // this.repository.getList(type, callback, opt_handler);
};


/** @inheritDoc */
pn.data.LocalDataProvider.prototype.getEntity = function(type, id) {
  throw new Error('LocalDataProvider.getEntity not supported');
  // this.repository.getItem(type, id, callback, opt_handler);
};


/**
 * A counter used to ensure that the IDs set on local entities
 *    are always unique.
 * @private
 * @type {number}
 */
pn.data.LocalDataProvider.prototype.localSaveEntityIndex_ = 0;


/** @inheritDoc */
pn.data.LocalDataProvider.prototype.saveEntity =
    function(type, data, callback, opt_handler) {
  var clientid = 0;
  if (typeof(data) !== 'number' && !data.ID) {
    // new entities get a negative ID for locals
    clientid = data.ID;
    this.setValidEntityIDPreSave_(data);
  }
  this.repository.saveItem(type, data, function() {
    callback.call(opt_handler || this,
        {'ClientID': clientid, 'ID': data.ID, 'Errors': []});
  }, opt_handler);
};


/**
 * @param {string} type The type of the unsaved entity.
 * @param {!pn.data.IEntity} data The entity data.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.saveUnsavedEntity =
    function(type, data, callback, opt_handler) {
  this.repository.saveItem('UnsavedEntities|' + type, data, function() {
    callback.call(opt_handler || this);
  }, this);
};


/**
 * @param {!Object.<string, !Array.<pn.data.IEntity>>} data The unsaved
 *    entities map.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.saveUnsavedEntities =
    function(data, callback, opt_handler) {
  for (var type in data) {
    this.repository.saveList('UnsavedEntities|' + type, data[type],
        function() {
          callback.call(opt_handler || this);
        }, this);
  }
};


/** @inheritDoc */
pn.data.LocalDataProvider.prototype.saveEntities =
    function(data, callback, opt_handler) {
  var types = goog.object.getKeys(data);
  this.saveEntitiesImpl_(types, data, callback, opt_handler);
};


/**
 * @private
 * @param {!Array.<string>} types The types of entities to save (this list is
 *    popped recursively).
 * @param {!Object.<string, !Array.<pn.data.IEntity>>} data The entity map
 *    to save.
 * @param {!function(Array.<pn.data.TransactionResult>)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.saveEntitiesImpl_ =
    function(types, data, callback, opt_handler) {
  if (!types || types.length === 0) {
    callback.call(opt_handler, []);
    return;
  }
  var type = types.pop();
  var entities = data[type];
  goog.array.forEach(entities, this.setValidEntityIDPreSave_, this);
  this.repository.saveList(type, entities, function(success) {
    if (!success) {
      callback.call(opt_handler || this, [{Errors: 'Unknown Error'}]);
      return;
    }
    this.saveEntitiesImpl_(types, data, callback, opt_handler);
  }, this);
};


/** @inheritDoc */
pn.data.LocalDataProvider.prototype.deleteEntity =
    function(type, id, callback, opt_handler) {
  this.repository.deleteItem('UnsavedEntities|' + type, id, function() {
    // Offline Delete, add to the Deleted_type list for later server update
    this.repository.deleteItem(type, id, function(result) {
      if (callback) callback.call(opt_handler || this, result);
    }, this);
  }, this);
};


/** @inheritDoc */
pn.data.LocalDataProvider.prototype.deleteEntities =
    function(type, ids, callback, opt_handler) {
  this.repository.deleteItems('UnsavedEntities|' + type, ids, function() {
    // Offline Delete, add to the Deleted_type list for later server update
    this.repository.deleteItems(type, ids, function(result) {
      if (callback) callback.call(opt_handler || this, result);
    }, this);
  }, this);
};


/**
 * @param {string} type The type of the local deleted eneity.
 * @param {number} id The ID of the entity that has been deleted.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.saveDeletedEntity =
    function(type, id, callback, opt_handler) {
  if (id < 0) {
    callback.call(opt_handler || this);
    return;
  }
  this.repository.saveItem('DeletedIDs|' + type, id, function() {
    callback.call(opt_handler || this);
  }, this);
};


/**
 * @param {string} type The type of the entities that have been deleted.
 * @param {!Array.<number>} ids The IDs of the entities that have been deleted.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.saveDeletedEntities =
    function(type, ids, callback, opt_handler) {
  var posids = goog.array.filter(ids, function(t) { return t > 0; });
  if (posids.length <= 0) {
    callback.call(opt_handler || this);
    return;
  }
  this.repository.saveList('DeletedIDs|' + type, posids, function(success) {
    callback.call(opt_handler || this, success ? [] :
        [{Errors: 'Unknown Error'}]);
  }, this);
};


/**
 * @private
 * @param {!pn.data.IEntity} entity The entity to set local
 *    (disconnected) ID.
 */
pn.data.LocalDataProvider.prototype.setValidEntityIDPreSave_ =
    function(entity) {
  if (entity.ID) return;
  entity.ID = pn.data.LocalDataProvider.getRandomNegativeID();
};


/**
 * @return {number} A random negative ID (guranteed unique).
 */
pn.data.LocalDataProvider.getRandomNegativeID = function() {
  return -(new Date().getTime() +
      pn.data.LocalDataProvider.prototype.localSaveEntityIndex_++);
};


/**
 * @param {!function(Object.<string, Array.<Object>>)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.getAllUnsavedEntities =
    function(callback, opt_handler) {
  this.repository.getLists('UnsavedEntities', callback, opt_handler);
};


/**
 * @param {!function(Object.<string, Array.<number>>)} callback The success
 *    callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.getAllDeletedEntities =
    function(callback, opt_handler) {
  this.repository.getLists('DeletedIDs', callback, opt_handler);
};


/**
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.resetLocalChanges =
    function(callback, opt_handler) {
  this.repository.deleteList('UnsavedEntities', function() {
    this.repository.deleteList('DeletedIDs', callback, opt_handler);
  }, this);
};


/**
 * @param {string} type The type of the local data to update.
 * @param {!Object} data The local data to update.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.updateLocalData =
    function(type, data, callback, opt_handler) {
  if (data['Data'] && data['Results']) { // Append imports data
    if (data['Data'].length === 0) {
      callback.call(opt_handler || this, true);
      return;
    }
    this.repository.getList(type, function(list) {
      this.repository.saveList(type,
          list.concat(data['Data']), callback, opt_handler);
    }, this);
    this.repository.saveList(type, data['Data'], callback, opt_handler);
  // This is a getEntities result, replace list
  } else if (pn.Utils.isArray(data)) {
    this.repository.saveList(type, /** @type {!Array} */ (data),
        callback, opt_handler);
  } else {  // Others
    var isdelete = typeof data === 'number' || !isNaN(parseInt(data, 10));
    if (isdelete) { this.repository.deleteItem(type, /** @type {number} */
        (data), callback, opt_handler); }
    else { this.repository.saveItem(type, /** @type {!pn.data.IEntity} */
        (data), callback, opt_handler); }
  }
};


/**
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.clearEntireDatabase =
    function(callback, opt_handler) {
  this.repository.clearEntireDatabase(callback, opt_handler);
};


/**
 * For testing only
 * @private
 * @param {!Array.<string>} types The types supported by this repository.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.LocalDataProvider.prototype.reset_ =
    function(types, callback, opt_handler) {
  this.repository.init(types, callback, opt_handler);
};


/** @inheritDoc */
pn.data.LocalDataProvider.prototype.disposeInternal = function() {
  pn.data.LocalDataProvider.superClass_.disposeInternal.call(this);

  goog.dispose(this.repository);
};
