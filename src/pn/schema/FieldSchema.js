
goog.provide('pn.schema.FieldSchema');



/**
 * @constructor
 * @param {string} name The name of this field.
 * @param {string} type The type of this field.
 * @param {pn.data.Type?} entityType The type of this field if this field
 *    is a relationship.
 * @param {boolean} allowNull Wether this field allows null values.
 * @param {number} length The length of this field (only applicable to
 *     string fields).
 */
pn.schema.FieldSchema = function(name, type, entityType, allowNull, length) {
  goog.asserts.assert(name);
  goog.asserts.assert(type);
  goog.asserts.assert(!entityType || goog.isFunction(entityType));

  /**
   * The name of this field
   * @type {string}
   */
  this.name = name;

  /**
   * The type of this field
   * @type {string}
   */
  this.type = type;

  /**
   * The entity type of this field if this field is a relationship.
   * @type {pn.data.Type?}
   */
  this.entityType = entityType;

  /**
   * Wether this field allows null values
   * @type {boolean}
   */
  this.allowNull = allowNull;

  /**
   * The length of this field (for string fields)
   * @type {number}
   */
  this.length = length;
};
