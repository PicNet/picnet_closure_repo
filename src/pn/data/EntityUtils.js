;
goog.provide('pn.data.EntityUtils');


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string} path The path to the target entity.
 * @param {!Object} entity The starting entity
 * @return {string} The entities name.
 */
pn.data.EntityUtils.getEntityDisplayValue = function(cache, path, entity) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(entity);
  
  var steps = path.split('.');
  var target = pn.data.EntityUtils.getTargetEntity(cache, path, entity);
  if (!target) { return ''; }

  var name = steps.length > 1 ? steps[steps.length - 1] : (steps[0] + 'Name');
  var display = target[name];
  return display;
};


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string|Array.<string>} path The path to the target entity.
 * @param {!Object} entity The starting entity
 * @return {Object} The matched entity.
 */
pn.data.EntityUtils.getTargetEntity = function(cache, path, entity) {
  goog.asserts.assert(cache);
  goog.asserts.assert(path);
  goog.asserts.assert(entity);

  var steps = goog.isArray(path) ? path : path.split('.');
  var type = steps[0];  
  var id = 0;
    
  if (goog.string.endsWith(type, 'ID')) {
    id = entity[type];
    type = type.substring(0, type.length - 2);
  }
  var list = cache[type];  
  if (!list) throw new Error('Could not find: ' + type + ' in cache');
  var target = /** @type {Object} */ (goog.array.find(list, function(e) {    
    return e['ID'] === id;
  }));
  if (!target) return null;

  if (steps.length > 2) {
    steps.shift();
    return pn.data.EntityUtils.getTargetEntity(cache, steps, target);
  }
  return target;
};
