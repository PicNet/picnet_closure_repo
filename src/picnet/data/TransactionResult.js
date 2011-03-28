;
goog.provide('picnet.data.TransactionResult');



/**
 * @constructor
 */
picnet.data.TransactionResult = function() {};


/**
 * @type {number}
 */
picnet.data.TransactionResult.prototype.ClientID;


/**
 * @type {number}
 */
picnet.data.TransactionResult.prototype.ID;


/**
 * @type {boolean}
 */
picnet.data.TransactionResult.prototype.IsDelete;


/**
 * @type {boolean}
 */
picnet.data.TransactionResult.prototype.IsCreate;


/**
 * @type {!Array.<string>}
 */
picnet.data.TransactionResult.prototype.Errors;
