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


/**
 * @private
 * @type {!Object.<pn.data.Type>}
 */
pn.data.Entity.types_ = {};


/**
 * @param {string} name The type name of the entity.
 * @param {pn.data.Type} ctor The entity type ctor (entity factory).
 */
pn.data.Entity.register = function(name, ctor) {
  goog.asserts.assert(name);
  goog.asserts.assert(ctor);

  pn.data.Entity.types_[name] = ctor;
};


/**
 * @param {string} name The type name of the entity.
 * @return {pn.data.Type} The registered ctor for the the specified
 *    entity type.
 */
pn.data.Entity.fromName = function(name) {
  var ctor = pn.data.Entity.types_[name];
  goog.asserts.assert(ctor, 'Could not find entity factory of type: ' + name);

  return ctor;
};
