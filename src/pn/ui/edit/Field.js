;
goog.require('goog.date.Date');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');
goog.require('pn.ui.SpecDisplayItem');
goog.require('pn.ui.edit.ComplexRenderer');
goog.require('pn.ui.edit.ValidateInfo');

goog.provide('pn.ui.edit.Field');



/**
 * @constructor
 * @extends {pn.ui.SpecDisplayItem}
 * @param {string} id The id of this column.
 * @param {string} name The name/caption of this column.
 */
pn.ui.edit.Field = function(id, name) {
  goog.asserts.assert(id);
  goog.asserts.assert(name);

  pn.ui.SpecDisplayItem.apply(this, arguments);

  /** @type
      {pn.ui.edit.ComplexRenderer|
          function(*, Object, !Element, boolean=):
          !(Element|goog.ui.Component)} */
  this.renderer = null;

  /** @type {null|pn.ui.edit.ValidateInfo|
      function(pn.ui.edit.Field, *, Object, !Object.<Array>, Object):
          (string|Array)} */
  this.validator = null;

  /** @type {null|function(string, !(Element|goog.ui.Component), Object,
        Object.<Array>)} */
  this.onchange = null;

  /** @type {null|function(!(Element|goog.ui.Component), Object)} */
  this.oncreate = null;

  /** @type {null|function(!Array.<Object>, !Object.<Array>):!Array.<Object>} */
  this.sourceFilter = null;

  /** @type {boolean} */
  this.showOnAdd = true;

  /** @type {string} */
  this.filterColumn = this.id;

  /** @type {string} */
  this.tooltip = '';

  /** @type {string} */
  this.footnote = '';

  /** @type {*} */
  this.defaultValue = undefined;

  /** @type {string} */
  this.hintText = '';

  /** @type {string} */
  this.className = '';
};
goog.inherits(pn.ui.edit.Field, pn.ui.SpecDisplayItem);
