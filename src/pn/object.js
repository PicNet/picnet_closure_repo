
goog.require('goog.asserts');
goog.require('goog.object');

goog.provide('pn.object');


/**
 * Extends an objects properties ensuring that all properties are unique.  If
 *    some of the properties to extend already exist then an error is thrown.
 *
 * @param {Object} target  The object to modify.
 * @param {...Object} var_args The objects from which values will be copied.
 */
pn.object.uniqueExtend = function(target, var_args) {
  goog.asserts.assert(target);
  goog.asserts.assert(arguments.length > 1);
  var args = goog.array.clone(arguments);
  var keys = [];
  goog.array.forEach(args, function(o) {
    keys = goog.array.concat(keys, goog.object.getKeys(o));
  });
  var exp = keys.length;
  goog.array.removeDuplicates(keys);
  if (exp !== keys.length) {
    throw new Error('Keys not unique amongst all objects');
  }

  goog.object.extend.apply(null, args);
};
