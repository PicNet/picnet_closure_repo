;
goog.provide('pn.data.EntityUtils');


/**
 * @param {Object} entity The entity to check for newness.
 * @return {boolean} Wether the specified entity is new.
 */
pn.data.EntityUtils.isNew = function(entity) {
  return entity.id <= 0;
};


/**
 * @param {!pn.data.BaseDalCache} cache The data cache to use to get entities.
 * @param {string} path The path to the target entity.
 * @param {pn.data.Type} type The type of the current target enity(s).
 * @param {(Object|Array.<!Object>)} target The current entity or entity
 *    array.
 * @param {string=} opt_parentField The property to use to point back to the
 *    'target' when encountering the first 'Entities' property.  For instance
 *    lets assume that 'target' is of type 'Parent' and the path is
 *    'ChildEntities'.  In this case the parent field would be 'ParentID'
 *    which cannot be inferred from the path and given we have no type
 *    information for the target we cannot infer it that way either.
 * @return {*} The entities name.
 */
pn.data.EntityUtils.getEntityDisplayValue =
    function(cache, path, type, target, opt_parentField) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(type);
  goog.asserts.assert(target);

  var cacheKey = path + '_cache';
  if (goog.isDef(target[cacheKey])) return target[cacheKey];

  var entities = pn.data.EntityUtils.
      getTargetEntity(cache, path, type, target, opt_parentField);
  var value = entities.length > 1 ? entities.join(', ') : entities[0];
  return (target[cacheKey] = value);
};


/**
 * @param {!pn.data.BaseDalCache} cache The data cache to use to get entities.
 * @param {string|Array.<string>} path The path to the target entity.
 * @param {pn.data.Type} type The type of the current target enity(s).
 * @param {(Object|Array.<!Object>)} target The current entity or entity
 *    array.
 * @param {string=} opt_parentField The property to use to point back to the
 *    'target' when encountering the first 'Entities' property.  For instance
 *    lets assume that 'target' is of type 'Parent' and the path is
 *    'ChildEntities'.  In this case the parent field would be 'ParentID'
 *    which cannot be inferred from the path and given we have no type
 *    information for the target we cannot infer it that way either.
 * @return {!Array.<!Object>} The matched entity/entities (as an array).
 */
pn.data.EntityUtils.getTargetEntity =
    function(cache, path, type, target, opt_parentField) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(goog.isFunction(type));
  goog.asserts.assert(target);

  // Lets always work with arrays just to simplify
  if (!goog.isArray(target)) { target = [target]; }

  var steps = goog.isArray(path) ? path : path.split('.');
  var step = steps[0],
      next,
      ids;

  if (step !== 'ID' && goog.string.endsWith(step, 'ID')) {
    ids = pn.data.EntityUtils.getFromEntities(target, step);
    type = pn.data.EntityUtils.getTypeProperty(type, step);
    var entities = cache.get(type.type);
    next = /** @type {!Array.<!Object>} */ (goog.array.filter(entities,
        function(e) { return goog.array.contains(ids, e.id); }));
  } else if (goog.string.endsWith(step, 'Entities')) {
    type = pn.data.EntityUtils.getTypeProperty(type, step);
    next = cache.get(type.type);
    if (opt_parentField) {
      ids = pn.data.EntityUtils.getFromEntities(target, 'ID');
      next = goog.array.filter(next, function(e) {
        return goog.array.contains(ids, e[opt_parentField]);
      });
      opt_parentField = ''; // Only use once
    }
    if (!next) { throw new Error('Could not find: ' + type + ' in cache'); }
  } else {
    next = pn.data.EntityUtils.getFromEntities(target, step);
  }

  steps.shift();
  return steps.length > 0 ? pn.data.EntityUtils.getTargetEntity(
      cache, steps, type, next, opt_parentField) : next;
};


/**
 * @param {!(Object|Array.<!Object>)} entities The entity or the entity array.
 * @param {string} property The property in the entities array to retreive.
 * @return {!Array.<!*>} The property value.
 */
pn.data.EntityUtils.getFromEntities = function(entities, property) {
  if (goog.isArray(entities)) {
    return goog.array.map(entities, function(e) { return e[property]; });
  } else {
    return [entities[property]];
  }
};


/**
 * @param {!pn.data.BaseDalCache} cache The cache to search for the entity.
 * @param {pn.data.Type} type The type of entity to find.
 * @param {*} val The value (default to ID) to match.
 * @param {string=} opt_prop The property to match 'ID' if not specified.
 * @return {Object} The matched entity (or null).
 */
pn.data.EntityUtils.getEntityFromCache = function(cache, type, val, opt_prop) {
  var entities = cache.get(type.type);
  var prop = opt_prop || 'ID';
  return /** @type {Object} */ (goog.array.find(entities, function(e) {
    return e[prop] === val;
  }));
};


/**
 * @param {pn.data.Type} type The entity type to enfer the property type from.
 * @param {string} property The entity property to convert to a type name if
 *    possible.
 * @return {pn.data.Type} The type name inferred from the property
 *    parameter or the property itself.
 */
pn.data.EntityUtils.getTypeProperty = function(type, property) {
  return type.getFieldSchema(property).entityType;
};


/**
 * @param {pn.data.Type} type The entity type to enfer the property type from.
 * @param {string} property The entity property to convert to a type name if
 *    possible.
 * @return {?pn.data.Type} The type name inferred from the property
 *    parameter or the property itself.
 */
pn.data.EntityUtils.tryGetTypeProperty = function(type, property) {
  goog.asserts.assert(goog.isFunction(type), '"type" not specified');
  goog.asserts.assert(property, '"property" not specified');

  if (!pn.data.EntityUtils.isRelationshipProperty(property)) return null;

  return type.getFieldSchema(property).entityType;
};


/**
 * @param {string} property The entity property to check if it points to a
 *    parent or child relationship field.
 * @return {boolean} Wether the specified property is a parent or child
 *    property.
 */
pn.data.EntityUtils.isRelationshipProperty = function(property) {
  goog.asserts.assert(property);

  return property !== 'ID' &&
      (goog.string.endsWith(property, 'ID') ||
      goog.string.endsWith(property, 'Entities'));
};


/**
 * @param {string} property The entity property to check if it points to a
 *    parent relationship field.
 * @return {boolean} Wether the specified property is a parent property.
 */
pn.data.EntityUtils.isParentProperty = function(property) {
  goog.asserts.assert(property);
  return property !== 'ID' && goog.string.endsWith(property, 'ID');
};


/**
 * @param {string} property The entity property to check if it points to a
 *    children relationship field.
 * @return {boolean} Wether the specified property is a children property.
 */
pn.data.EntityUtils.isChildrenProperty = function(property) {
  goog.asserts.assert(property);
  return goog.string.endsWith(property, 'Entities');
};


/**
 * @param {pn.data.Type} type The type of entities we are ordering.
 * @param {!Array.<!Object>} list The entities to order.
 */
pn.data.EntityUtils.orderEntities = function(type, list) {
  goog.asserts.assert(goog.isFunction(type));
  goog.asserts.assert(list);
  if (!list.length) return;

  var template = list[0];
  var orderp = type.type + 'Order';
  var namep = type.type + 'Name';

  var ordert = goog.isDef(template[orderp]) ?
      type.getFieldSchema(orderp).entityType : null;
  var namet = goog.isDef(template[namep]) ?
      type.getFieldSchema(namep).entityType : null;

  if (ordert === 'number') {
    goog.array.sort(list, function(a, b) { return a[orderp] - b[orderp]; });
  } else if (namet === 'string') {
    goog.array.sort(list, function(a, b) {
      return goog.string.caseInsensitiveCompare(a[namep], b[namep]);
    });
  }
};


/**
 * @param {Object.<number>} enumeration The enumeration.
 * @param {number} val The value to convert to a name.
 * @return {string} The name of the given value in the specified enumeration.
 */
pn.data.EntityUtils.getEnumName = function(enumeration, val) {
  goog.asserts.assert(goog.isObject(enumeration));
  goog.asserts.assert(goog.isNumber(val));

  for (var name in enumeration) {
    var eval = enumeration[name];
    if (eval === val) return name;
  }
  throw new Error('Could not find the value: ' + val +
      ' in the specified enumeration');
};
