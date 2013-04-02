;
goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.object');

goog.require('pn.data.IEntity');
goog.require('pn.data.IRepository');

goog.provide('pn.data.AbstractRepository');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @implements {pn.data.IRepository}
 * @param {string} databaseName The name of the database to open or create.
 */
pn.data.AbstractRepository = function(databaseName) {
  goog.Disposable.call(this);

  /**
   *
   * @protected
   * @type {goog.debug.Logger}
   */
  this.log = goog.debug.Logger.getLogger('pn.data.AbstractRepository');
  this.log.setLevel(goog.debug.Logger.Level.FINEST);

  /**
   * @protected
   * @type {string}
   */
  this.databaseName = databaseName;
  /**
   * @protected
   * @type {Array.<string>}
   */
  this.types;
};
goog.inherits(pn.data.AbstractRepository, goog.Disposable);


/** @override */
pn.data.AbstractRepository.prototype.isSupported = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.isInitialised = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.init = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.getList = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.saveList = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.getLists = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.deleteList = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.saveItem = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.getItem = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.deleteItem = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.deleteItems = goog.abstractMethod;


/** @override */
pn.data.AbstractRepository.prototype.clearEntireDatabase =
    function(callback, opt_handler) {};


/**
 * @protected
 * @param {string} typename The name of the unsynced list type to retreive.
 * @param {!function(Object.<string, Array.<string>>)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.AbstractRepository.prototype.getUnsyncLists = goog.abstractMethod;


/**
 * @protected
 * @param {string} typename The name of the unsaved list type to retreive.
 * @param {!function(Object.<string, Array.<pn.data.IEntity|number>>)}
 *    callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.AbstractRepository.prototype.getUnsavedLists =
    function(typename, callback, opt_handler) {
  this.getUnsyncLists(typename, function(dict) {
    var dict2 = {};
    for (var type in dict) {
      dict2[type] = goog.array.map(dict[type], function(t) {
        return (typename === 'UnsavedEntities' ? t : parseInt(t, 10));
      }, this);
    }
    callback.call(opt_handler || this, dict2);
  }, this);
};


/**
 * @param {Array.<pn.data.IEntity|number>} list The list to add or update
 *    item in.
 * @param {pn.data.IEntity|number} item The item to add or update in the
 *    specified list.
 */
pn.data.AbstractRepository.prototype.updateListWithItem =
    function(list, item) {
  var idx = goog.array.findIndex(list, function(e) {
    return typeof(item) === 'number' ? item === e : e.ID === item.ID;
  });
  if (idx >= 0) { list[idx] = item; }
  else { list.push(item); }
};


/** @override */
pn.data.AbstractRepository.prototype.disposeInternal = function() {
  pn.data.AbstractRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.log);
};
