;
goog.provide('pn.data.BaseSource');
goog.provide('pn.data.IDataSource');



/**
 * @constructor
 * @implements {pn.data.IDataSource}
 * @extends {goog.Disposable}
 */
pn.data.BaseSource = function() {
  goog.Disposable.call(this);
};
goog.inherits(pn.data.BaseSource, goog.Disposable);


/** @override */
pn.data.BaseSource.prototype.getEntityLists = goog.abstractMethod;


/** @override */
pn.data.BaseSource.prototype.getEntity = function(type, id, callback) {
  this.getEntityLists([type], function(results) {
    var list = results[type];
    var entity = goog.array.find(list, function(e) { return e['ID'] === id; });
    callback(entity);
  });
};



/** @interface */
pn.data.IDataSource = function() {};


/**
 * @param {Array.<string>} types The entity types to load.
 * @param {function(!Object.<Array>):undefined} callback A success callback.
 */
pn.data.IDataSource.prototype.getEntityLists = function(types, callback) {};


/**
 * @param {string} type The entity type to load.
 * @param {number} id The entity ID of the specified type to load.
 * @param {function(Object):undefined} callback A success callback that takes
 *    the loaded entity or null.
 */
pn.data.IDataSource.prototype.getEntity = function(type, id, callback) {};
