;
goog.provide('pn.data.IEntity');



/**
 * NOTE: This is pretty useless until public annotation is supported.
 *
 * @interface
 */
pn.data.IEntity = function() {};


/**
 * @type {number} The unique ID of this entity.  This ID must only be
 * unique for entities of the current type.
 */
pn.data.IEntity.prototype.ID = 0;
