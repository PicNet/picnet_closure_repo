;
goog.provide('pn.data.EntityUtils');


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string} path The path to the target entity.
 * @param {!Object} entity The starting entity.
 * @return {string} The entities name.
 */
pn.data.EntityUtils.getEntityDisplayValue = function(cache, path, entity) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(entity);

  var steps = path.split('.');
  var target = pn.data.EntityUtils.getTargetEntity(cache, path, entity);
  if (!target.length) { return ''; }

  var nameProperty = steps.pop();
  if (goog.string.endsWith(nameProperty, 'ID')) {
    nameProperty = nameProperty.substring(0, nameProperty.length - 2) + 'Name';
  } else if (goog.string.endsWith(nameProperty, 'Entities')) {
    nameProperty = nameProperty.substring(0, nameProperty.length - 8) + 'Name';
  }

  var names = goog.array.map(target, function(e) { return e[nameProperty]; });
  return names.join(', ');
};


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string|Array.<string>} path The path to the target entity.
 * @param {!(!Object|Array.<!Object>)} target The current entity or entity
 *    array.
 * @return {!Array.<!Object>} The matched entity/entities (as an array).
 */
pn.data.EntityUtils.getTargetEntity = function(cache, path, target) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(target);

  // Lets always work with arrays just to simplify
  if (!goog.isArray(target)) { target = [target]; }

  var steps = goog.isArray(path) ? path : path.split('.');
  var step = steps[0];
  var next;

  if (goog.string.endsWith(step, 'ID')) {
    var ids = pn.data.EntityUtils.getFromEntities(target, step);
    step = step.substring(0, step.length - 2);
    next = /** @type {!Array.<!Object>} */ (goog.array.filter(cache[step],
        function(e) { return goog.array.contains(ids, e['ID']); }));
  } else if (goog.string.endsWith(step, 'Entities')) {
    step = step.substring(0, step.length - 8);
    next = cache[step];
    if (!next) { throw new Error('Could not find: ' + step + ' in cache'); }
  } else {
    next = pn.data.EntityUtils.getFromEntities(target, step);
  }

  steps.shift();
  return steps.length > 0 ?
      pn.data.EntityUtils.getTargetEntity(cache, steps, next) :
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
