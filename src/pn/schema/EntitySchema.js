
goog.provide('pn.schema.EntitySchema');



/**
 * @constructor
 * @param {string} name The name of this entity.
 * @param {!Object.<!pn.schema.FieldSchema>} fieldSchemas The field
 *    schemas of this EntitySchema.
 */
pn.schema.EntitySchema = function(name, fieldSchemas) {

  /**
   * The collection of fields in this entity
   * @type {!Object.<!pn.schema.FieldSchema>}
   */
  this.fieldSchemas = fieldSchemas;
};
