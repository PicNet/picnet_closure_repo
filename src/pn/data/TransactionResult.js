
goog.provide('pn.data.TransactionResult');



/**
 * @constructor
 */
pn.data.TransactionResult = function() {};


/**
 * @type {number}
 */
pn.data.TransactionResult.prototype.ClientID;


/**
 * @type {number}
 */
pn.data.TransactionResult.prototype.ID;


/**
 * @type {boolean}
 */
pn.data.TransactionResult.prototype.IsDelete;


/**
 * @type {boolean}
 */
pn.data.TransactionResult.prototype.IsCreate;


/**
 * @type {!Array.<string>}
 */
pn.data.TransactionResult.prototype.Errors;
