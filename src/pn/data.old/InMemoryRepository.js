goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.object');

goog.require('pn.data.IEntity');

goog.provide('pn.data.InMemoryRepository');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.data.InMemoryRepository = function() {
  goog.Disposable.call(this);
  /**
   * @private
   * @type {!Object.<string, !Array.<Object>>}
   */
  this.db_ = {};
};
goog.inherits(pn.data.InMemoryRepository, goog.Disposable);


/**
 * @param {string} type The type of the list to retreive.
 * @return {!Array.<pn.data.IEntity>} The retreived list.
 */
pn.data.InMemoryRepository.prototype.getList = function(type) {
  return this.getListImpl_(type);
};


/**
 * @param {string} type The type of the item to retreive.
 * @param {number} id The ID of the specified item.
 * @return {pn.data.IEntity} The retreived item.
 */
pn.data.InMemoryRepository.prototype.getItem = function(type, id) {
  var item = /** @type {pn.data.IEntity} */ (goog.array.find(this.db_[type],
      function(e) { return id === e.ID; }));
  return !item ? null : /** @type {pn.data.IEntity} */
      (goog.object.clone(item));
};


/**
 * @param {string} type The type of the item to delete.
 * @param {number} id The ID of the item to delete.
 */
pn.data.InMemoryRepository.prototype.deleteItem = function(type, id) {
  if (!this.db_[type]) { return; }
  this.db_[type] = goog.array.filter(this.db_[type], function(e) {
    return id !== e.ID;
  });
};


/**
 * @param {string} type The type of the list to remove unsaved entities from.
 */
pn.data.InMemoryRepository.prototype.deleteLocalUnsavedItems =
    function(type) {
  this.db_[type] = goog.array.filter(this.getList(type), function(e) {
    return e.ID > 0;
  });
};


/**
 * @param {string} type The type of the items to delete.
 * @param {Array.<number>} ids The IDs of the items to delete.
 */
pn.data.InMemoryRepository.prototype.deleteItems = function(type, ids) {
  this.db_[type] = goog.array.filter(this.db_[type], function(e) {
    return goog.array.indexOf(ids, e.ID) < 0;
  });
};


/**
 * @param {string} type The type of the list to remove.
 */
pn.data.InMemoryRepository.prototype.deleteList = function(type) {
  delete this.db_[type];
};


/**
 * @param {string} type The type of the item to save.
 * @param {pn.data.IEntity|number} item The item to save or create.
 */
pn.data.InMemoryRepository.prototype.saveItem = function(type, item) {
  var arr = this.getList(type);
  this.updateListWithItem_(arr, item);
  this.db_[type] = arr;
};


/**
 * @param {string} type The type of the list to save.
 * @param {!Array.<pn.data.IEntity>} list The list to save.  Will append to
 *    existing list (or update items).
 */
pn.data.InMemoryRepository.prototype.saveList = function(type, list) {
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
pn.data.InMemoryRepository.prototype.getListImpl_ = function(type) {
  if (!this.db_[type]) this.db_[type] = [];
  return goog.array.clone(this.db_[type]);
};


/**
 * @private
 * @param {!Array.<pn.data.IEntity|number>} list The list to update with the
 *    specified item.
 * @param {pn.data.IEntity|number} item The item to add or modify on
 *    the list.
 */
pn.data.InMemoryRepository.prototype.updateListWithItem_ =
    function(list, item) {
  var idx = goog.array.findIndex(list, function(e) {
    return (typeof(item) !== 'number' ? e.ID === item.ID : e === item);
  });
  if (idx >= 0) { list[idx] = item; }
  else { list.push(item); }
};


/** @override */
pn.data.InMemoryRepository.prototype.disposeInternal = function() {
  pn.data.InMemoryRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.db_);
  delete this.db_;
};
