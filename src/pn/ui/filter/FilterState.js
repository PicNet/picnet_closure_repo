;
goog.provide('pn.ui.filter.FilterState');



/**
 * @constructor
 * @param {string} id The id of this filter.
 * @param {string} value The value of this filter.
 * @param {number} idx The column index of this filter.
 * @param {string} type The type of this filter.
 */
pn.ui.filter.FilterState = function(id, value, idx, type) {
  /** @type {string} */
  this.id = id;

  /** @type {string} */
  this.value = value;

  /** @type {number} */
  this.idx = idx;

  /** @type {string} */
  this.type = type;
};


/** @override */
pn.ui.filter.FilterState.prototype.toString = function() {
  return 'id[' + this.id + '] value[' + this.value +
      '] idx[' + this.idx + '] type[' + this.type + ']';
};
