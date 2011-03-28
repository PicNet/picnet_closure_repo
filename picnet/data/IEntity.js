;
goog.provide('picnet.data.IEntity');



/**
 * @interface
 */
picnet.data.IEntity = function() {};


/**
 * @type {number} The unique ID of this entity.  Note this ID must only be
 * unique for entities of the current type.  ID's must be > 0.
 */
picnet.data.IEntity.prototype.ID;
