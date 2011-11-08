;
goog.provide('pn.data.IEntity');



/**
 * @interface
 */
pn.data.IEntity = function() {};


/**
 * @type {number} The unique ID of this entity.  This ID must only be
 * unique for entities of the current type.  ID's must be > 0.
 */
pn.data.IEntity.prototype.ID = 0;
