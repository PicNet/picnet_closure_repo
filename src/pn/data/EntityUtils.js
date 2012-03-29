;
goog.provide('pn.data.EntityUtils');


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string} path The path to the target entity.
 * @param {!(!Object|Array.<!Object>)} target The current entity or entity
 *    array.
 * @param {string=} opt_parentField The property to use to point back to the
 *    'target' when encountering the first 'Entities' property.  For instance
 *    lets assume that 'target' is of type 'Parent' and the path is
 *    'ChildEntities'.  In this case the parent field would be 'ParentID'
 *    which cannot be inferred from the path and given we have no type
 *    information for the target we cannot infer it that way either.
 * @return {string} The entities name.
 */
pn.data.EntityUtils.getEntityDisplayValue =
    function(cache, path, target, opt_parentField) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(target);

  var steps = path.split('.');
  target = pn.data.EntityUtils.
      getTargetEntity(cache, path, target, opt_parentField);
  if (!target.length) { return ''; }

  var lastStep = steps.pop();
  var nameProperty = pn.data.EntityUtils.getTypeProperty(lastStep);

  if (nameProperty !== lastStep) {
    target = goog.array.map(target, function(e) {
      return e[nameProperty + 'Name'];
    });
  }
  return target.join(', ');
};


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string|Array.<string>} path The path to the target entity.
 * @param {!(!Object|Array.<!Object>)} target The current entity or entity
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
    function(cache, path, target, opt_parentField) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(target);

  // Lets always work with arrays just to simplify
  if (!goog.isArray(target)) { target = [target]; }

  var steps = goog.isArray(path) ? path : path.split('.');
  var step = steps[0],
      next,
      ids;

  if (goog.string.endsWith(step, 'ID')) {
    ids = pn.data.EntityUtils.getFromEntities(target, step);
    step = pn.data.EntityUtils.getTypeProperty(step);
    next = /** @type {!Array.<!Object>} */ (goog.array.filter(cache[step],
        function(e) { return goog.array.contains(ids, e['ID']); }));
  } else if (goog.string.endsWith(step, 'Entities')) {
    step = pn.data.EntityUtils.getTypeProperty(step);
    next = cache[step];
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
