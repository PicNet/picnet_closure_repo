;
goog.provide('pn.data.Entity');
goog.provide('pn.data.Type');

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



/** 
 * pn.data.Type is not really an object, its a reference to the constructor of
 *    the specific entity type and can be called with 'new type(raw)'.
 *
 * @constructor 
 * @this {pn.data.Entity}
 * @param {!Object} raw The raw data object.
 */
pn.data.Type = function(raw) {};

/**
 * @expose
 * @type {string}
 */
pn.data.Type.prototype.type = '';

/**
 * @expose
 * @param {string} name The name of the field.
 * @return {pn.data.FieldSchema} The schema for the given field.
 */
pn.data.Type.prototype.getFieldSchema = goog.abstractMethod;