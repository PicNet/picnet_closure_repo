;
goog.provide('pn.data.TypeRegister');

goog.require('goog.asserts');


/**
 * @private
 * @type {!Object.<pn.data.Type>}
 */
pn.data.TypeRegister.types_ = {};


/**
 * @param {string} name The type name of the entity.
 * @param {pn.data.Type} ctor The entity type ctor (entity factory).
 */
pn.data.TypeRegister.register = function(name, ctor) {
  goog.asserts.assert(name);
  goog.asserts.assert(ctor);

  pn.data.TypeRegister.types_[name] = ctor;
};


/**
 * @param {string} name The type name of the entity.
 * @return {pn.data.Type} The registered ctor for the the specified
 *    entity type.
 */
pn.data.TypeRegister.fromName = function(name) {
  var ctor = pn.data.TypeRegister.types_[name];
  goog.asserts.assert(ctor, 'Could not find entity factory of type: ' + name);

  return ctor;
};
