
goog.provide('pn.schema.FieldSchema');



/**
 * @constructor
 * @param {string} name The name of this field.
 * @param {string} type The type of this field.
 * @param {boolean} allowNull Wether this field allows null values.
 * @param {number} length The length of this field (only applicable to
 *     string fields).
 */
pn.schema.FieldSchema = function(name, type, allowNull, length) {

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
