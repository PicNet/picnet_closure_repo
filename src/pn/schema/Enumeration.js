;
goog.provide('pn.schema.Enumeration');



/**
 * @constructor
 * @param {string} type The type of this enumeration.
 * @param {!Array.<string>} names The names of the enum values.
 * @param {!Array.<number>} values The integer underlying valuies of this enum.
 */
pn.schema.Enumeration = function(type, names, values) {
  goog.asserts.assert(type);
  goog.asserts.assert(names.length);
  goog.asserts.assert(values.length);

  /** @type {string} */
  this.type = type;

  /** @type {!Array.<string>} */
  this.names = names;

  /** @type {!Array.<number>} */
  this.values = values;

};
