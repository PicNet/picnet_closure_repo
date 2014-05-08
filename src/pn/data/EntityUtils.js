;
goog.provide('pn.data.EntityUtils');


/**
 * @param {Object} entity The entity to check for newness.
 * @return {boolean} Wether the specified entity is new.
 */
pn.data.EntityUtils.isNew = function(entity) {
  return entity['ID'] <= 0;
};


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string} path The path to the target entity.
 * @param {(Object|Array.<!Object>)} target The current entity or entity
 *    array.
 * @param {string=} opt_parentField The property to use to point back to the
 *    'target' when encountering the first 'Entities' property.  For instance
 *    lets assume that 'target' is of type 'Parent' and the path is
 *    'ChildEntities'.  In this case the parent field would be 'ParentID'
 *    which cannot be inferred from the path and given we have no type
 *    information for the target we cannot infer it that way either.
 * @param {string=} opt_entityType Hack to handle different first step path.
 * @return {*} The entities name.
 */
pn.data.EntityUtils.getEntityDisplayValue =
    function(cache, path, target, opt_parentField, opt_entityType) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(target);

  var cacheKey = path + '_cache';
  if (goog.isDef(target[cacheKey])) return target[cacheKey];
  var entities = pn.data.EntityUtils.
      getTargetEntity(cache, path, target, opt_parentField, opt_entityType);
  var value = entities.length > 1 ? entities.join(', ') : entities[0];
  return (target[cacheKey] = value);
};


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string|Array.<string>} path The path to the target entity.
 * @param {(Object|Array.<!Object>)} target The current entity or entity
 *    array.
 * @param {string=} opt_parentField The property to use to point back to the
 *    'target' when encountering the first 'Entities' property.  For instance
 *    lets assume that 'target' is of type 'Parent' and the path is
 *    'ChildEntities'.  In this case the parent field would be 'ParentID'
 *    which cannot be inferred from the path and given we have no type
 *    information for the target we cannot infer it that way either.
 * @param {string=} opt_entityType Hack to handle different first step path.
 * @return {!Array.<!Object>} The matched entity/entities (as an array).
 */
pn.data.EntityUtils.getTargetEntity =
    function(cache, path, target, opt_parentField, opt_entityType) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(target);
  // Lets always work with arrays just to simplify
  if (!goog.isArray(target)) { target = [target]; }

  var steps = goog.isArray(path) ? path : path.split('.');
  var step = opt_entityType ? (opt_entityType + 'ID') : steps[0],
      next,
      ids;
  if (step !== 'ID' && goog.string.endsWith(step, 'ID')) {
    ids = pn.data.EntityUtils.getFromEntities(target, step);
    step = pn.data.EntityUtils.getTypeProperty(step);
    var entities = pn.data.EntityUtils.getFromCache_(cache, step);
    next = /** @type {!Array.<!Object>} */ (goog.array.filter(entities,
        function(e) { return goog.array.contains(ids, e['ID']); }));
  } else if (goog.string.endsWith(step, 'Entities')) {
    step = pn.data.EntityUtils.getTypeProperty(step);
    next = pn.data.EntityUtils.getFromCache_(cache, step);
    if (opt_parentField) {
      ids = pn.data.EntityUtils.getFromEntities(target, 'ID');
      next = goog.array.filter(next, function(e) {
        return goog.array.contains(ids, e[opt_parentField]);
      });
      opt_parentField = ''; // Only use once
    }
    if (!next) { throw new Error('Could not find: ' + step + ' in cache'); }
  } else {
    next = pn.data.EntityUtils.getFromEntities(target, step);
  }
  steps.shift();
  return steps.length > 0 ?
      pn.data.EntityUtils.getTargetEntity(cache, steps, next, opt_parentField) :
      next;
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
 * @param {!Object.<Array.<!Object>>} cache The cache to search for the entity.
 * @param {string} type The type of entity to find.
 * @param {*} val The value (default to ID) to match.
 * @param {string=} opt_prop The property to match 'ID' if not specified.
 * @return {Object} The matched entity (or null).
 */
pn.data.EntityUtils.getEntityFromCache = function(cache, type, val, opt_prop) {
  var entities = pn.data.EntityUtils.getFromCache_(cache, type);
  var prop = opt_prop || 'ID';
  return /** @type {Object} */ (goog.array.find(entities, function(e) {
    return e[prop] === val;
  }));
};


/**
 * @param {string} property The entity property to convert to a type name if
 *    possible.
 * @return {string} The type name inferred from the property parameter or the
 *    property itself.
 */
pn.data.EntityUtils.getTypeProperty = function(property) {
  if (property !== 'ID' && goog.string.endsWith(property, 'ID')) {
    return property.substring(0, property.length - 2);
  } else if (goog.string.endsWith(property, 'Entities')) {
    return property.substring(0, property.length - 8);
  } else { return property; }
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
 * @private
 * @param {!Object.<!Array.<!Object>>} cache The cache to search for the
 *    specified type.
 * @param {string} type The type to get.
 * @return {!Array.<!Object>} The objects of the specified type.
 */
pn.data.EntityUtils.getFromCache_ = function(cache, type) {
  if (type in cache) return cache[type];
  throw new Error('Could not find "' + type + '" in the cache.');
};
