goog.require('picnet.data.IEntity');

goog.provide('picnet.data.IRepository');



/**
 * @interface
 */
picnet.data.IRepository = function() {};


/**
 * @return {boolean} Wether the current repository is supported.
 */
picnet.data.IRepository.prototype.isSupported = function() {};


/**
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.isInitialised =
    function(callback, handler) {};


/**
 * @param {!Array.<string>} types Type types that this repository will store.
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.init = function(types, callback, handler) {};


/**
 * @param {string} type The type of the list to retreive.
 * @param {!function(Array.<picnet.data.IEntity>)} callback The
 *    success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.getList =
    function(type, callback, handler) {};


/**
 * @param {string} typeprefix The type (prefix) of the lists to retreive.
 * @param {!function(Object.<string, Array.<picnet.data.IEntity|number>>)}
 *    callback  The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.getLists =
    function(typeprefix, callback, handler) {};


/**
 * @param {string} type The type of the item to retreive.
 * @param {number} id The ID of the item to retreive.
 * @param {!function(picnet.data.IEntity)} callback  The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.getItem =
    function(type, id, callback, handler) {};


/**
 * @param {string} type The type of the item to delete.
 * @param {number} id The ID of the item to delete.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.deleteItem =
    function(type, id, callback, handler) {};


/**
 * @param {string} type The type of the items to delete.
 * @param {!Array.<number>} ids The IDs of the items to delete.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.deleteItems =
    function(type, ids, callback, handler) {};


/**
 * @param {string} type The type of the list to remove from the repository.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.deleteList =
    function(type, callback, handler) {};


/**
 * @param {string} type The type of the item to create or modify.
 * @param {!picnet.data.IEntity|number} item The item to create or modify.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.saveItem =
    function(type, item, callback, handler) {};


/**
 * @param {string} type The type of the list to save.
 * @param {!Array.<picnet.data.IEntity|number>} list The list that will be used
 *    to modify the existing type list.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.saveList =
    function(type, list, callback, handler) {};


/**
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.IRepository.prototype.clearEntireDatabase =
    function(callback, handler) {};
