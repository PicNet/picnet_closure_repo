;
goog.provide('pn.data.TypeRegister');

goog.require('goog.asserts');


/**
 * @private
 * @type {!Object.<pn.data.Entity.EntityType>}
 */
pn.data.TypeRegister.types_ = {};


/**
 * @param {string} name The type name of the entity.
 * @param {pn.data.Entity.EntityType} ctor The entity type ctor.
 */
pn.data.TypeRegister.register = function(name, ctor) {
  goog.asserts.assert(goog.isString(name));
  goog.asserts.assert(goog.isFunction(ctor));

  pn.data.TypeRegister.types_[name] = ctor;
};


/**
 * @param {string} name The type name of the entity.
 * @return {pn.data.Entity.EntityType} The registered ctor for the the 
 *    specified entity type.
 */
pn.data.TypeRegister.fromName = function(name) {
  goog.asserts.assert(goog.isString(name));

  var ctor = pn.data.TypeRegister.types_[name];
  goog.asserts.assert(ctor, 'Could not find entity factory of type: ' + name);

  return ctor;
};



/**
 * @param {string} type The type of the entities to attempt to parse.
 * @param {!Array} data The data to attempt to parse.
 * @return {!Array.<pn.data.Entity>} The parsed entity or the original data.
 */
pn.data.TypeRegister.parseEntities = function(type, data) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(goog.isObject(data));

  var action = goog.partial(pn.data.TypeRegister.parseEntity, type);
  return goog.array.map(data, action);
};


/**
 * @param {string} type The type of the entity to attempt to parse.
 * @param {Object} data The data to attempt to parse.
 * @return {pn.data.Entity} The parsed entity or the original data.
 */
pn.data.TypeRegister.parseEntity = function(type, data) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(goog.isObject(data));
  
  var ctor = pn.data.TypeRegister.fromName(type);
  return new ctor(data);
};


/**
 * @param {string} type The entity type to enfer the property type from.
 * @param {string} property The entity property to convert to a type name if
 *    possible.
 * @return {pn.data.FieldSchema} The field schema of the specified field.
 */
pn.data.TypeRegister.getFieldSchema = function(type, property) {
  goog.asserts.assert(goog.isString(type), '"type" not specified');
  goog.asserts.assert(goog.isString(property), '"property" not specified');
  
  return pn.data.TypeRegister.fromName(type).prototype.getFieldSchema(property);
};