
goog.provide('pn.app.schema.EntitySchema');



/**
 * @constructor
 * @param {string} name The name of this entity.
 * @param {!Object.<!pn.app.schema.FieldSchema>} fieldSchemas The field
 *    schemas of this EntitySchema.
 */
pn.app.schema.EntitySchema = function(name, fieldSchemas) {

  /**
   * The collection of fields in this entity
   * @type {!Object.<!pn.app.schema.FieldSchema>}
   */
  this.fieldSchemas = fieldSchemas;
};
