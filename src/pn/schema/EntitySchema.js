
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


/**
 * @param {string} field The name of the field whose schema we need.
 * @return {!pn.schema.FieldSchema} The schema for the specified field.
 */
pn.schema.EntitySchema.prototype.getField = function(field) {
  goog.asserts.assert(field);
  goog.asserts.assert(this.fieldSchemas[field]);

  return this.fieldSchemas[field];
};
