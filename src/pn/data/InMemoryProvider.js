goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.object');

goog.require('pn.data.IDataProvider');
goog.require('pn.data.InMemoryRepository');

goog.provide('pn.data.InMemoryProvider');



/**
 * @constructor
 * @implements {pn.data.IDataProvider}
 * @extends {goog.Disposable}
 */
pn.data.InMemoryProvider = function() {
  goog.Disposable.call(this);

  /**
   * @type {!pn.data.InMemoryRepository}
   */
  this.repository = new pn.data.InMemoryRepository();
};
goog.inherits(pn.data.InMemoryProvider, goog.Disposable);


/** @inheritDoc */
pn.data.InMemoryProvider.prototype.getEntities = function(type) {
  return this.repository.getList(type);
};


/** @inheritDoc */
pn.data.InMemoryProvider.prototype.getEntity = function(type, id) {
  return this.repository.getItem(type, id);
};


/** @inheritDoc */
pn.data.InMemoryProvider.prototype.saveEntity =
    function(type, data, callback, opt_handler) {
  if (data.ID === 0) {
    throw new Error('InMemoryProvider does not support saveEntity with ID = 0');
  }
  this.repository.saveItem(type, data);
  if (callback) callback.call(opt_handler || this, null);
};


/** @inheritDoc */
pn.data.InMemoryProvider.prototype.saveEntities =
    function(data, callback, opt_handler) {
  goog.object.forEach(data, function(entities) {
    if (goog.array.contains(entities, function(e) { return e.ID === 0; })) {
      throw new Error('InMemoryProvider does not support saveEntities with' +
          ' ID = 0');
    }
  });
  for (var type in data) { this.repository.saveList(type, data[type]); }
  if (callback) callback.call(opt_handler || this, null);
};


/** @inheritDoc */
pn.data.InMemoryProvider.prototype.deleteEntity =
    function(type, id, callback, opt_handler) {
  this.repository.deleteItem(type, id);
  if (callback) callback.call(opt_handler || this, null);
};


/** @inheritDoc */
pn.data.InMemoryProvider.prototype.deleteEntities =
    function(type, ids, callback, opt_handler) {
  this.repository.deleteItems(type, ids);
  if (callback) callback.call(opt_handler || this, null);
};


/** @inheritDoc */
pn.data.InMemoryProvider.prototype.disposeInternal = function() {
  pn.data.InMemoryProvider.superClass_.disposeInternal.call(this);

  goog.dispose(this.repository);
};
