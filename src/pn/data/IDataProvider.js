goog.require('pn.data.IEntity');
goog.require('pn.data.TransactionResult');

goog.provide('pn.data.IDataProvider');



/**
 * @interface
 */
pn.data.IDataProvider = function() {};


/**
 * @param {string} type The type of the entity to retreive.
 * @param {number} id The ID of the entity to retreive.
 * @return {pn.data.IEntity} The entity retreived (or null).
 */
pn.data.IDataProvider.prototype.getEntity = function(type, id) {};


/**
 * @param {string} type The type of the entity list to retreive.
 * @return {!Array.<pn.data.IEntity>} All entities of the specified type.
 */
pn.data.IDataProvider.prototype.getEntities = function(type) {};


/**
 * @param {string} type The type of the entity to save.
 * @param {!pn.data.IEntity} data The data to save.
 * @param {!function(pn.data.TransactionResult)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IDataProvider.prototype.saveEntity =
    function(type, data, callback, opt_handler) {};


/**
 * @param {!Object.<string, !Array.<pn.data.IEntity>>} data The data map
 *    representing the entities to save.
 * @param {!function(Array.<pn.data.TransactionResult>)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IDataProvider.prototype.saveEntities =
    function(data, callback, opt_handler) {};


/**
 * @param {string} type The type of the entity to delete.
 * @param {number} id The ID of the entity to delete.
 * @param {!function(pn.data.TransactionResult)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IDataProvider.prototype.deleteEntity =
    function(type, id, callback, opt_handler) {};


/**
 * @param {string} type The type of the entities to delete.
 * @param {!Array.<number>} ids The IDs of the entities to delete.
 * @param {!function(Array.<pn.data.TransactionResult>)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IDataProvider.prototype.deleteEntities =
    function(type, ids, callback, opt_handler) {};
