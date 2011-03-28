goog.require('picnet.data.IEntity');
goog.require('picnet.data.TransactionResult');

goog.provide('picnet.data.IDataProvider');



/**
 * @interface
 */
picnet.data.IDataProvider = function() {};


/**
 * @param {string} type The type of the entity to retreive.
 * @param {number} id The ID of the entity to retreive.
 * @return {picnet.data.IEntity} The entity retreived (or null).
 */
picnet.data.IDataProvider.prototype.getEntity = function(type, id) {};


/**
 * @param {string} type The type of the entity list to retreive.
 * @return {!Array.<picnet.data.IEntity>} All entities of the specified type.
 */
picnet.data.IDataProvider.prototype.getEntities = function(type) {};


/**
 * @param {string} type The type of the entity to save.
 * @param {!picnet.data.IEntity} data The data to save.
 * @param {!function(picnet.data.TransactionResult)} callback The
 *    success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IDataProvider.prototype.saveEntity =
    function(type, data, callback, handler) {};


/**
 * @param {!Object.<string, !Array.<picnet.data.IEntity>>} data The data map
 *    representing the entities to save.
 * @param {!function(Array.<picnet.data.TransactionResult>)} callback The
 *    success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IDataProvider.prototype.saveEntities =
    function(data, callback, handler) {};


/**
 * @param {string} type The type of the entity to delete.
 * @param {number} id The ID of the entity to delete.
 * @param {!function(picnet.data.TransactionResult)} callback The
 *    success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IDataProvider.prototype.deleteEntity =
    function(type, id, callback, handler) {};


/**
 * @param {string} type The type of the entities to delete.
 * @param {!Array.<number>} ids The IDs of the entities to delete.
 * @param {!function(Array.<picnet.data.TransactionResult>)} callback The
 *    success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IDataProvider.prototype.deleteEntities =
    function(type, ids, callback, handler) {};
