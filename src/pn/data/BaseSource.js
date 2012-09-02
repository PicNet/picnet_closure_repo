;
goog.provide('pn.data.BaseSource');

goog.require('pn.data.IDataSource');



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
    var list = results[type.type];
    var entity = goog.array.find(list, function(e) { return e.id === id; });
    callback(this.parseEntity(entity));
  });
};


/**
 * @param {pn.data.Type} type The type of the entities to attempt to
 *    parse.
 * @param {!Array} data The data to attempt to parse.
 * @return {!Array.<pn.data.Entity>} The parsed entity or the original data.
 */
pn.data.BaseSource.parseEntities = function(type, data) {
  var action = goog.partial(pn.data.BaseSource.parseEntity, type);
  return goog.array.map(data, action);
};


/**
 * @param {pn.data.Type} type The type of the entity to attempt to
 *    parse.
 * @param {Object} data The data to attempt to parse.
 * @return {pn.data.Entity} The parsed entity or the original data.
 */
pn.data.BaseSource.parseEntity = function(type, data) {
  goog.asserts.assert(goog.isFunction(type), 'type is not a ctor');
  if (!goog.isObject(data)) return data;
  return new type(data);
};
