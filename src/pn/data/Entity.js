;
goog.provide('pn.data.Entity');

goog.require('pn.data.Type');



/**
 * @constructor
 * @param {string} type The entity type.
 * @param {number} id The entity id.
 */
pn.data.Entity = function(type, id) {
  /** @type {string} */
  this.type = type;

  /** @type {number} */
  this.id = id;
};
