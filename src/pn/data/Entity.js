;
goog.provide('pn.data.Entity');

goog.require('pn.data.FieldSchema');



/**
 * @constructor
 * @param {string} type The entity type.
 * @param {number} id The entity id.
 */
pn.data.Entity = function(type, id) {

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


/**  @type {string}  */
pn.data.Entity.type = '';


/**
 * @param {string} name The name of the field.
 * @return {pn.data.FieldSchema} The schema for the given field.
 */
pn.data.Entity.getFieldSchema = goog.abstractMethod;
