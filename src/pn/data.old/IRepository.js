goog.require('pn.data.IEntity');

goog.provide('pn.data.IRepository');



/**
 * @interface
 * @extends {goog.disposable.IDisposable}
 */
pn.data.IRepository = function() {};


/**
 * @return {boolean} Wether the current repository is supported.
 */
pn.data.IRepository.prototype.isSupported = function() {};


/**
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.isInitialised =
    function(callback, opt_handler) {};


/**
 * @param {!Array.<string>} types Type types that this repository will store.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.init = function(types, callback, opt_handler) {};


/**
 * @param {string} type The type of the list to retreive.
 * @param {!function(Array.<pn.data.IEntity>)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.getList =
    function(type, callback, opt_handler) {};


/**
 * @param {string} typeprefix The type (prefix) of the lists to retreive.
 * @param {!function(Object.<string, Array.<pn.data.IEntity|number>>)}
 *    callback  The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.getLists =
    function(typeprefix, callback, opt_handler) {};


/**
 * @param {string} type The type of the item to retreive.
 * @param {number} id The ID of the item to retreive.
 * @param {!function(pn.data.IEntity)} callback  The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.getItem =
    function(type, id, callback, opt_handler) {};


/**
 * @param {string} type The type of the item to delete.
 * @param {number} id The ID of the item to delete.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.deleteItem =
    function(type, id, callback, opt_handler) {};


/**
 * @param {string} type The type of the items to delete.
 * @param {!Array.<number>} ids The IDs of the items to delete.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.deleteItems =
    function(type, ids, callback, opt_handler) {};


/**
 * @param {string} type The type of the list to remove from the repository.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.deleteList =
    function(type, callback, opt_handler) {};


/**
 * @param {string} type The type of the item to create or modify.
 * @param {!pn.data.IEntity|number} item The item to create or modify.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.saveItem =
    function(type, item, callback, opt_handler) {};


/**
 * @param {string} type The type of the list to save.
 * @param {!Array.<pn.data.IEntity|number>} list The list that will be used
 *    to modify the existing type list.
 * @param {!function(boolean)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.saveList =
    function(type, list, callback, opt_handler) {};


/**
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.IRepository.prototype.clearEntireDatabase =
    function(callback, opt_handler) {};
