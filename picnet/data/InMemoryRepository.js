goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.object');

goog.require('picnet.data.IEntity');

goog.provide('picnet.data.InMemoryRepository');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
picnet.data.InMemoryRepository = function() {
  goog.Disposable.call(this);
  /**
     * @private
     * @type {!Object.<string, !Array.<Object>>}
     */
  this.db_ = {};
};
goog.inherits(picnet.data.InMemoryRepository, goog.Disposable);


/**
 * @param {string} type The type of the list to retreive.
 * @return {!Array.<picnet.data.IEntity>} The retreived list.
 */
picnet.data.InMemoryRepository.prototype.getList = function(type) {
  return this.getListImpl_(type);
};


/**
 * @param {string} type The type of the item to retreive.
 * @param {number} id The ID of the specified item.
 * @return {picnet.data.IEntity} The retreived item.
 */
picnet.data.InMemoryRepository.prototype.getItem = function(type, id) {
  var item = /** @type {picnet.data.IEntity} */ (goog.array.find(this.db_[type],
      function(e) { return id === e.ID; }));
  return !item ? null : /** @type {picnet.data.IEntity} */
      (goog.object.clone(item));
};


/**
 * @param {string} type The type of the item to delete.
 * @param {number} id The ID of the item to delete.
 */
picnet.data.InMemoryRepository.prototype.deleteItem = function(type, id) {
  if (!this.db_[type]) { return; }
  this.db_[type] = goog.array.filter(this.db_[type], function(e) {
    return id !== e.ID;
  });
};


/**
 * @param {string} type The type of the list to remove unsaved entities from.
 */
picnet.data.InMemoryRepository.prototype.deleteLocalUnsavedItems =
    function(type) {
  this.db_[type] = goog.array.filter(this.getList(type), function(e) {
    return e.ID > 0;
  });
};


/**
 * @param {string} type The type of the items to delete.
 * @param {Array.<number>} ids The IDs of the items to delete.
 */
picnet.data.InMemoryRepository.prototype.deleteItems = function(type, ids) {
  this.db_[type] = goog.array.filter(this.db_[type], function(e) {
    return goog.array.indexOf(ids, e.ID) < 0;
  });
};


/**
 * @param {string} type The type of the list to remove.
 */
picnet.data.InMemoryRepository.prototype.deleteList = function(type) {
  delete this.db_[type];
};


/**
 * @param {string} type The type of the item to save.
 * @param {picnet.data.IEntity|number} item The item to save or create.
 */
picnet.data.InMemoryRepository.prototype.saveItem = function(type, item) {
  var arr = this.getList(type);
  this.updateListWithItem_(arr, item);
  this.db_[type] = arr;
};


/**
 * @param {string} type The type of the list to save.
 * @param {!Array.<picnet.data.IEntity>} list The list to save.  Will append to
 *    existing list (or update items).
 */
picnet.data.InMemoryRepository.prototype.saveList = function(type, list) {
  if (!list || list.length === 0) return;
  var arr = this.getList(type);
  if (!arr || arr.length === 0) {
    this.db_[type] = list;
    return;
  }

  goog.array.forEach(list, function(e) {
    this.updateListWithItem_(arr, e);
  }, this);
  this.db_[type] = arr;
};


/**
 * @private
 * @param {string} type The type of the list to retreive.
 * @return {!Array.<Object>} The retreived list.
 */
picnet.data.InMemoryRepository.prototype.getListImpl_ = function(type) {
  if (!this.db_[type]) this.db_[type] = [];
  return goog.array.clone(this.db_[type]);
};


/**
 * @private
 * @param {!Array.<picnet.data.IEntity|number>} list The list to update with the
 *    specified item.
 * @param {picnet.data.IEntity|number} item The item to add or modify on
 *    the list.
 */
picnet.data.InMemoryRepository.prototype.updateListWithItem_ =
    function(list, item) {
  var idx = goog.array.findIndex(list, function(e) {
    return (typeof(item) !== 'number' ? e.ID === item.ID : e === item);
  });
  if (idx >= 0) { list[idx] = item; }
  else { list.push(item); }
};


/** @inheritDoc */
picnet.data.InMemoryRepository.prototype.disposeInternal = function() {
  picnet.data.InMemoryRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.db_);
  delete this.db_;
};

