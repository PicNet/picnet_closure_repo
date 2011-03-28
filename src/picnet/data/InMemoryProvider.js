goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.object');

goog.require('picnet.data.IDataProvider');
goog.require('picnet.data.InMemoryRepository');

goog.provide('picnet.data.InMemoryProvider');



/**
 * @constructor
 * @implements {picnet.data.IDataProvider}
 * @extends {goog.Disposable}
 */
picnet.data.InMemoryProvider = function() {
  goog.Disposable.call(this);

  /**
   * @type {!picnet.data.InMemoryRepository}
   */
  this.repository = new picnet.data.InMemoryRepository();
};
goog.inherits(picnet.data.InMemoryProvider, goog.Disposable);


/** @inheritDoc */
picnet.data.InMemoryProvider.prototype.getEntities = function(type) {
  return this.repository.getList(type);
};


/** @inheritDoc */
picnet.data.InMemoryProvider.prototype.getEntity = function(type, id) {
  return this.repository.getItem(type, id);
};


/** @inheritDoc */
picnet.data.InMemoryProvider.prototype.saveEntity =
    function(type, data, callback, handler) {
  if (data.ID === 0) {
    throw new Error('InMemoryProvider does not support saveEntity with ID = 0');
  }
  this.repository.saveItem(type, data);
  if (callback) callback.call(handler || this, null);
};


/** @inheritDoc */
picnet.data.InMemoryProvider.prototype.saveEntities =
    function(data, callback, handler) {
  goog.object.forEach(data, function(entities) {
    if (goog.array.contains(entities, function(e) { return e.ID === 0; })) {
      throw new Error('InMemoryProvider does not support saveEntities with' +
          ' ID = 0');
    }
  });
  for (var type in data) { this.repository.saveList(type, data[type]); }
  if (callback) callback.call(handler || this, null);
};


/** @inheritDoc */
picnet.data.InMemoryProvider.prototype.deleteEntity =
    function(type, id, callback, handler) {
  this.repository.deleteItem(type, id);
  if (callback) callback.call(handler || this, null);
};


/** @inheritDoc */
picnet.data.InMemoryProvider.prototype.deleteEntities =
    function(type, ids, callback, handler) {
  this.repository.deleteItems(type, ids);
  if (callback) callback.call(handler || this, null);
};


/** @inheritDoc */
picnet.data.InMemoryProvider.prototype.disposeInternal = function() {
  picnet.data.InMemoryProvider.superClass_.disposeInternal.call(this);

  goog.dispose(this.repository);
};
