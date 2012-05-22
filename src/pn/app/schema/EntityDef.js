
goog.provide('pn.app.schema.EntityDef');



/**
 * @constructor
 * @param {string} name The name of this entity.
 * @param {!Object.<!pn.app.schema.FieldDef>} fields The fields of
 *    this EntityDef.
 */
pn.app.schema.EntityDef = function(name, fields) {

  /**
   * The collection of fields in this entity
   * @type {!Object.<!pn.app.schema.FieldDef>}
   */
  this.fields = fields;
};
