;
goog.require('goog.date.Date');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');
goog.require('pn.ui.BaseField');
goog.require('pn.ui.edit.ComplexRenderer');
goog.require('pn.ui.edit.ValidateInfo');

goog.provide('pn.ui.edit.Field');



/**
 * @constructor
 * @extends {pn.ui.BaseField}
 * @param {string} id The id of this column.
 * @param {string=} opt_name The optional name/caption of this column.
 */
pn.ui.edit.Field = function(id, opt_name) {
  goog.asserts.assert(id);  

  pn.ui.BaseField.call(this, id, opt_name);

  /** @type
      {pn.ui.edit.ComplexRenderer|
          function(*, Object, !Element, boolean=):
              !(Element|goog.ui.Component|Text)} */
  this.renderer = null;

  /** @type {null|pn.ui.edit.ValidateInfo|
      function(pn.ui.edit.Field, *):string} */
  this.validator = null;

  /** @type {null|function(string, !(Element|goog.ui.Component), Object)} */
  this.onchange = null;

  /** @type {null|function(!(Element|goog.ui.Component), Object)} */
  this.oncreate = null;

  /** @type {null|function(!Array.<Object>, !Object.<Array>):!Array.<Object>} */
  this.displayPathFilter = null;

  /** @type {boolean} */
  this.showOnAdd = true;

  /** @type {boolean} */
  this.readonly = false;

  /** @type {*} */
  this.defaultValue = undefined;

  /** @type {string} */
  this.tableType = '';

  /** @type {string} */
  this.tableSpec = '';

  /** @type {string} */
  this.tableParentField = '';
};
goog.inherits(pn.ui.edit.Field, pn.ui.BaseField);
