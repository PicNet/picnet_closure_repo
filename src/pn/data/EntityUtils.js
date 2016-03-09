﻿;
goog.provide('pn.data.EntityUtils');

goog.require('pn');
goog.require('pn.data.TypeRegister');


/**
 * @param {pn.data.Entity} entity The entity to check for newness.
 * @return {boolean} Wether the specified entity is new.
 */
pn.data.EntityUtils.isNew = function(entity) {
  return entity.id <= 0;
};


/**
 * @param {!pn.data.BaseDalCache} cache The data cache to use to get entities.
 * @param {string} path The path to the target entity.
 * @param {string} type The type of the current target enity(s).
 * @param {!(pn.data.Entity|Array.<!pn.data.Entity>)} target The current entity
 *    or entity array.
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
  pn.ass(cache);
  pn.ass(path);
  pn.ass(type);
  pn.ass(target);

  var cacheKey = path + '_cache';
  if (target.hasExtProp(cacheKey)) { return target.getExtValue(cacheKey); }

  var entities = pn.data.EntityUtils.
      getTargetEntity(cache, path, type, target, opt_parentField);
  var value = entities.length > 1 ? entities.join(', ') : entities[0];
  return target.setExtValue(cacheKey, value);
};


/**
 * @param {!pn.data.BaseDalCache} cache The data cache to use to get entities.
 * @param {string|Array.<string>} path The path to the target entity.
 * @param {string} type The type of the current target enity(s).
 * @param {!(pn.data.Entity|Array.<!pn.data.Entity>)} target The current entity
 *    or entity array.
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
  pn.ass(cache);
  pn.ass(path);
  pn.assStr(type);
  pn.ass(target);

  // Lets always work with arrays just to simplify
  if (!goog.isArray(target)) { target = [target]; }

  var steps = goog.isArray(path) ? path : path.split('.');
  var step = steps[0],
      next,
      ids;

  if (step !== 'ID' && step.pnendsWith('ID')) {  // Parent
    ids = pn.data.EntityUtils.getFromEntities(target, step);
    type = pn.data.EntityUtils.getTypeProperty(type, step);
    next = pn.data.EntityUtils.filterBy(cache.get(type), ids);
  } else if (step.pnendsWith('Entities')) { // Child
    type = pn.data.EntityUtils.getTypeProperty(type, step);
    next = cache.get(type);
    if (opt_parentField) {
      var parentField = /** @type {string} */ (opt_parentField);
      ids = pn.data.EntityUtils.getFromEntities(target, 'ID');
      // TODO: This filterBy is broken, this is an invalid evaluator for
      // binarySelect (as the entities are not ordered by this field)
      next = pn.data.EntityUtils.filterBy(cache.get(type), ids,
          function(id, e) {
            return id - /** @type {number} */ (e.getValue(parentField));
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
 * @param {!Array.<pn.data.Entity>} entities The entity list to filter.  Note:
 *    this array MUST be ordered.  Not being asserted for performance.
 * @param {!Array.<number>} ids The property value that we are looking for.
 * @param {function(number, !pn.data.Entity):number?=} opt_evaluator an optional
 *    evaluator that takes the current ids item and the entitiy to compare
 *    against.
 * @return {!Array.<pn.data.Entity>} The filtered list of entities.
 */
pn.data.EntityUtils.filterBy = function(entities, ids, opt_evaluator) {
  var filtered = [];
  for (var i = 0, len = ids.length; i < len; i++) {
    var id = ids[i];
    if (id <= 0) continue;

    var evaluator = opt_evaluator || function(id2, e) { return id2 - e.id; };
    var idx = goog.array.binarySelect(entities,
        function(e) { return evaluator(ids[i], e); });
    filtered.push(entities[idx]);
  }
  return filtered;
};


/**
 * @param {!(Object|Array.<!Object>)} entities The entity or the entity array.
 * @param {string} property The property in the entities array to retreive.
 * @return {!Array.<!*>} The property value.
 */
pn.data.EntityUtils.getFromEntities = function(entities, property) {
  if (goog.isArray(entities)) {
    return entities.pnmap(function(e) { return e.getValue(property); });
  } else {
    return [entities.getValue(property)];
  }
};


/**
 * @param {string} type The entity type to enfer the property type from.
 * @param {string} property The entity property to convert to a type name if
 *    possible.
 * @return {string} The type name inferred from the property
 *    parameter or the property itself.
 */
pn.data.EntityUtils.getTypeProperty = function(type, property) {
  pn.ass(goog.isString(type), '"type" not specified');
  pn.ass(goog.isString(property), '"property" not specified');

  var fs = pn.data.TypeRegister.getFieldSchema(type, property);
  return /** @type {string} */ (fs.entityType);
};


/**
 * @param {string} type The entity type to enfer the property type from.
 * @param {string} property The entity property to convert to a type name if
 *    possible.
 * @return {?string} The type name inferred from the property
 *    parameter or the property itself.
 */
pn.data.EntityUtils.tryGetTypeProperty = function(type, property) {
  pn.ass(goog.isString(type), '"type" not specified');
  pn.ass(goog.isString(property), '"property" not specified');

  if (!pn.data.EntityUtils.isRelationshipProperty(property)) return null;

  return /** @type {string} */ (
      pn.data.TypeRegister.getFieldSchema(type, property).entityType);
};


/**
 * @param {string} property The entity property to check if it points to a
 *    parent or child relationship field.
 * @return {boolean} Wether the specified property is a parent or child
 *    property.
 */
pn.data.EntityUtils.isRelationshipProperty = function(property) {
  pn.ass(property);

  return property !== 'ID' &&
      (property.pnendsWith('ID') ||
      property.pnendsWith('Entities'));
};


/**
 * @param {string} property The entity property to check if it points to a
 *    parent relationship field.
 * @return {boolean} Wether the specified property is a parent property.
 */
pn.data.EntityUtils.isParentProperty = function(property) {
  pn.ass(property);
  return property !== 'ID' && property.pnendsWith('ID');
};


/**
 * @param {string} property The entity property to check if it points to a
 *    children relationship field.
 * @return {boolean} Wether the specified property is a children property.
 */
pn.data.EntityUtils.isChildrenProperty = function(property) {
  pn.ass(property);
  return property.pnendsWith('Entities');
};


/**
 * @param {string} type The type of entities we are ordering.
 * @param {!Array.<!Object>} list The entities to order.
 */
pn.data.EntityUtils.orderEntities = function(type, list) {
  pn.assStr(type);
  pn.ass(list);
  if (!list.length) return;

  var template = list[0];
  var orderp = type + 'Order';
  var namep = type + 'Name';

  var ordert = template.hasProp(orderp) ?
      pn.data.TypeRegister.getFieldSchema(type, orderp).type : null;
  var namet = template.hasProp(namep) ?
      pn.data.TypeRegister.getFieldSchema(type, namep).type : null;

  if (ordert === 'number') {
    list.pnsort(function (a, b) {
      return a.getValue(orderp) > b.getValue(orderp) ? 1 : -1;
    });
  }
  else if (namet === 'string') {
    list.pnsort(function (a, b) {
      return a.getValue(namep).toUpperCase() > b.getValue(namep).toUpperCase() ?
        1 : -1;
    });
  }
};


/**
 * @param {string} type The type of entities we are ordering.
 * @param {!Array.<!Object>} list The entities to order.
 */
pn.data.EntityUtils.orderEntitiesByName = function(type, list) {
  pn.assStr(type);
  pn.ass(list);
  if (!list.length) return;

  var template = list[0];
  var namep = type + 'Name';

  pn.assDefAndNotNull(template.getValue(namep));

  list.pnsort(function(a, b) {
    return a.getValue(namep) > b.getValue(namep) ? 1 : -1;
  });
};


/**
 * @param {Object.<number>} enumeration The enumeration.
 * @param {number} val The value to convert to a name.
 * @return {string} The name of the given value in the specified enumeration.
 */
pn.data.EntityUtils.getEnumName = function(enumeration, val) {
  pn.assObj(enumeration);
  pn.assNum(val);

  for (var name in enumeration) {
    var evald = enumeration[name];
    if (evald === val) return name;
  }
  throw new Error('Could not find the value: ' + val +
      ' in the specified enumeration');
};
