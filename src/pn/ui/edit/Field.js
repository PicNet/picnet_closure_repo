;
goog.provide('pn.ui.edit.Field');



/**
 * @constructor
 * @param {string} id The id of this column.
 * @param {string} name The name/caption of this column.
 */
pn.ui.edit.Field = function(id, name) {
  goog.asserts.assert(id);
  goog.asserts.assert(name);

  /** @type {string} */
  this.id = id;
  /** @type {string} */
  this.name = name;
  /** @type {null|function(Object):!Element} */
  this.renderer = null;
  /** @type {null|function(Object):string} */
  this.validator = null;
  /** @type {string} */
  this.source = '';
  /** @type {string} */
  this.sourceField = '';
};
