
goog.provide('pn.data.Entity');
goog.provide('pn.data.Entity.EntityType');

goog.require('pn.data.FieldSchema');

/**
 * @constructor
 * @param {string} type The entity type name.
 * @param {number} id The entity id.
 */
pn.data.Entity = function(type, id) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(goog.isNumber(id));

  /**
   * @expose
   * @type {string}
   */
  this.type = type;

  /**
   * @expose
   * @type {number}
   */
  this.id = id;
};

/**
 * @param {!pn.data.Entity} other The other entity for the equality comparison.
 * @return {boolean} Wether the specified other entity is equal to this entity.
 */
pn.data.Entity.prototype.equals = function(other) {
  if (!(other instanceof pn.data.Entity)) return false;
  var keys1 = goog.object.getKeys(this);
  var keys2 = goog.object.getKeys(other);
  if (!goog.array.equals(keys1, keys2)) return false;
  return goog.array.findIndex(keys1, function(key) {
    return this[key] !== other[key];
  }) >= 0;
};

/**
 * @return {!pn.data.Entity} A cloned copy of this entity
 */
pn.data.Entity.prototype.clone = function() {
  var cloned = new this.constructor(this.type, this.id);
  goog.object.extend(cloned, this);
  return cloned;
};

////////////////////////////////////////////////////////////////////////////////
// ABSTRACT MEMBERS
////////////////////////////////////////////////////////////////////////////////

/**
 * @expose
 * @param {string} name The name of the field.
 * @return {pn.data.FieldSchema} The schema for the given field.
 */
pn.data.Entity.prototype.getFieldSchema = goog.abstractMethod;

/** @typedef {function(new:pn.data.Entity, Object=):undefined} */
pn.data.Entity.EntityType;