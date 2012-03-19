;
goog.provide('pn.ui.SpecDisplayItem');



/**
 * @constructor
 * @param {string} id The id of this column.
 * @param {string} name The name/caption of this column.
 */
pn.ui.SpecDisplayItem = function(id, name) {
  goog.asserts.assert(id);
  goog.asserts.assert(name);

  /** @type {string} */
  this.id = id;

  /** @type {string} */
  this.dataColumn = id.split('.')[0];

  /** @type {string} */
  this.name = name;

  /** @type {string} */
  this.source = '';

  /** @type {!Array} */
  this.additionalCacheTypes = [];
};
