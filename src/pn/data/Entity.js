;
goog.provide('pn.data.Entity');

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
