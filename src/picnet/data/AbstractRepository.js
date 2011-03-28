;
goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.object');

goog.require('picnet.data.IEntity');
goog.require('picnet.data.IRepository');

goog.provide('picnet.data.AbstractRepository');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @implements {picnet.data.IRepository}
 * @param {string} databaseName The name of the database to open or create.
 */
picnet.data.AbstractRepository = function(databaseName) {
  goog.Disposable.call(this);

  /**
     * @protected
     * @type {goog.debug.Logger}
     */
  this.log = goog.debug.Logger.getLogger('picnet.data.AbstractRepository');
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
goog.inherits(picnet.data.AbstractRepository, goog.Disposable);


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.isSupported = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.isInitialised = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.init = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.getList = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.saveList = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.getLists = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.deleteList = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.saveItem = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.getItem = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.deleteItem = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.deleteItems = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.clearEntireDatabase =
    function(callback, handler) {};


/**
 * @protected
 * @param {string} typename The name of the unsynced list type to retreive.
 * @param {!function(Object.<string, Array.<string>>)} callback The
 *    success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.AbstractRepository.prototype.getUnsyncLists = goog.abstractMethod;


/**
 * @protected
 * @param {string} typename The name of the unsaved list type to retreive.
 * @param {!function(Object.<string, Array.<picnet.data.IEntity|number>>)}
 *    callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.AbstractRepository.prototype.getUnsavedLists =
    function(typename, callback, handler) {
  this.getUnsyncLists(typename, function(dict) {
    var dict2 = {};
    for (var type in dict) {
      dict2[type] = goog.array.map(dict[type], function(t) {
        return (typename === 'UnsavedEntities' ? t : parseInt(t, 10));
      }, this);
    }
    callback.call(handler || this, dict2);
  }, this);
};


/**
 * @param {Array.<picnet.data.IEntity|number>} list The list to add or update
 *    item in.
 * @param {picnet.data.IEntity|number} item The item to add or update in the
 *    specified list.
 */
picnet.data.AbstractRepository.prototype.updateListWithItem =
    function(list, item) {
  var idx = goog.array.findIndex(list, function(e) {
    return typeof(item) === 'number' ? item === e : e.ID === item.ID;
  });
  if (idx >= 0) { list[idx] = item; }
  else { list.push(item); }
};


/**
 * @protected
 * @param {Object|number} e The entity to make date safe.
 * @return {Object|number} The data safe object.
 */
picnet.data.AbstractRepository.prototype.makeDateSafe = function(e) {
  if (1 === 1) return e; // TODO REMOVE THIS METHOD

  if (e.length) {
    return goog.array.map(/** @type {Array} */ (e),
        function(e2) { return this.makeDateSafe(e2); }, this);
  } else if (typeof(e) === 'number') { return e; }

  var e3 = goog.object.clone(e);
  for (var i in e3) {
    if (e3[i] && e3[i].getFullYear) {
      e3[i] = '\\/Date(' + e3[i].getTime() + ')\\/';
    }
  }
  return e3;
};


/**
 * @protected
 * @param {Object} o The object to recreate dates on.
 * @return {Object|number} The new object (with valid dates).
 */
picnet.data.AbstractRepository.prototype.recreateDates = function(o) {
  if (typeof o === 'string') throw 'strings not supported';

  if (!o) return o;
  if (o.length) {
    return goog.array.map(/** @type {Array} */ (o), function(o1) {
      return this.recreateDates(o1);
    }, this);
  }
  else if (typeof(o) === 'number') return o;

  for (var field in o) {
    var val = o[field];
    if (val && typeof (val) === 'string' && val.indexOf('\/Date(') >= 0) {
      var time = val.replace(/\\\/Date\((\d+)\)\\\//g, '$1');
      o[field] = new Date(parseInt(time, 10));
    }
  }
  return o;
};


/** @inheritDoc */
picnet.data.AbstractRepository.prototype.disposeInternal = function() {
  picnet.data.AbstractRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.log);
};
