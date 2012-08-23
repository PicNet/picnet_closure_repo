;
goog.provide('pn.data.IDataSource');



/** @interface */
pn.data.IDataSource = function() {};


/**
 * @param {Array.<pn.data.Type>} types The entity types to load.
 * @param {function(!Object.<Array.<pn.data.Entity>>):undefined} callback A
 *    success callback that takes an map of entities for each type.
 */
pn.data.IDataSource.prototype.getEntityLists = function(types, callback) {};


/**
 * @param {pn.data.Type} type The entity type to load.
 * @param {number} id The entity ID of the specified type to load.
 * @param {function(pn.data.Entity):undefined} callback A success callback
 *    that takes the loaded entity or null.
 */
pn.data.IDataSource.prototype.getEntity = function(type, id, callback) {};
