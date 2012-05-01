
goog.provide('pn.app.schema.Entity');



/**
 * @constructor
 * @param {string} name The name of this entity.
 * @param {!Object.<!pn.app.schema.Field>} fields The fields of this Entity.
 */
pn.app.schema.Entity = function(name, fields) {

  /**
   * The collection of fields in this entity
   * @type {!Object.<!pn.app.schema.Field>}
   */
  this.fields = fields;
};
