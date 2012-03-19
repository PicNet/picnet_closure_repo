;
goog.provide('pn.data.EntityUtils');


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string} path The path to the target entity.
 * @param {number} id The id of the entitiy in the list.
 * @return {string} The entities name.
 */
pn.data.EntityUtils.getEntityName = function(cache, path, id) {
  var steps = path.split('.');
  var entity = pn.data.EntityUtils.getTargetEntity(cache, path, id);
  if (!entity) return '';

  var name = steps.length > 1 ? steps[steps.length - 1] : (steps[0] + 'Name');
  return entity[name];
};


/**
 * @param {!Object.<Array>} cache The data cache to use to get entities.
 * @param {string|Array.<string>} path The path to the target entity.
 * @param {number} id The id of the entitiy in the list.
 * @return {Object} The matched entity.
 */
pn.data.EntityUtils.getTargetEntity = function(cache, path, id) {
  if (id <= 0) return null;
  var steps = goog.isArray(path) ? path : path.split('.');
  var type = steps[0];
  goog.asserts.assert(cache[type], 'Type: ' + type +
      ' not found in cache');
  var entity = /** @type {Object} */ (goog.array.find(cache[type],
      function(e) { return e['ID'] === id; }));
  if (steps.length > 2) {
    var id2 = entity[steps[1] + 'ID'];
    steps.shift();
    return pn.data.EntityUtils.getTargetEntity(cache, steps, id2);
  }
  return entity;
};
