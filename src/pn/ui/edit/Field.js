﻿;
goog.require('goog.date.Date');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');
goog.require('pn.ui.BaseField');
goog.require('pn.ui.edit.ComplexRenderer');
goog.require('pn.ui.edit.ValidateInfo');

goog.provide('pn.ui.edit.Field');
goog.provide('pn.ui.edit.Field.Renderer');



/**
 * The Field specification defines how a field should be captioned and how
 *    the input element (if any) should be rendered and handled.
 *
 * BaseField types (Field / Column) should be constructed using the
 *    convenience methods in UiSpec (UiSpec.prototype.createField).
 *
 * @constructor
 * @extends {pn.ui.BaseField}
 * @param {string} id The id of this column.
 * @param {!pn.ui.UiSpec} entitySpec The specifications (pn.ui.UiSpec) of
 *    the entity being displayed.
 * @param {string=} opt_name The optional name/caption of this column.
 */
pn.ui.edit.Field = function(id, entitySpec, opt_name) {
  goog.asserts.assert(id);
  goog.asserts.assert(entitySpec);

  pn.ui.BaseField.call(this, id, entitySpec, opt_name);

  /**
   * The renderer to use to render this field value.  This can either be of
   *    type pn.ui.edit.ComplexRenderer or simply a function that takes 3
   *    parameters and returns either a dom Element/Text a goog.ui.Component.
   *    The 3 parameters are the the value to display, the entity being
   *    displayed and the parent Dom Element.
   *
   * @type {pn.ui.edit.Field.Renderer}
   */
  this.renderer = null;

  /**
   * The custom validator for this field.  The validator can either be an
   *    instance of pn.ui.edit.ValidateInfo or a function that takes 2
   *    parameters, the Field specs (this class) and the current value and
   *    returns a string which represents the validation error (falsy
   *    represents no error).
   *
   * @type {null|pn.ui.edit.ValidateInfo|
   *       function(pn.ui.edit.Field,*,Object=,!Object.<!Array>):string}
   */
  this.validator = null;

  /**
   * If the entity['ID'] is <= 0 then the entity is considered new.  If this is
   *    the case then any showOnAdd=false fields will not be shown.
   *
   * @type {boolean}
   */
  this.showOnAdd = true;

  /**
   * Wether this field is readonly.  If specifying a renderer this value is
   *    ignored.
   *
   * @type {boolean}
   */
  this.readonly = false;

  /**
   * The default value to apply to the specified field.  This is only used
   *    when creating a new entity.
   *
   * @type {*}
   */
  this.defaultValue = undefined;

  /**
   * When displaying a table in this Field this field denotes the type of
   *    entity being displayed in the table.  If this is not specified we try
   *    to intelligently guess this by using the id of thie field.  If the
   *    ID ends with 'Entities' then we use the prefix of this id.  For example:
   *    if the id is: ChildrenEntities then the tableType will become
   *    'Children'.
   *
   * @type {string}
   */
  this.tableType = '';

  /**
   * When displaying a table in this field this points to the UiSpec id that
   *    will be used when rendering this table. If this is not specified then
   *    it will be the same as the tableType.
   *
   * @type {string}
   */
  this.tableSpec = '';

  /**
   * When displaying a table we only display the children entities that are
   *    related to the current entity being displayed in the parent page.  This
   *    field is the field that marks this relationship.  For instance:
   *
   * tabeType: 'Children',
   * tableParentField: 'ParentID'
   *
   * This setup will display a table of Children entities where their 'ParentID'
   *    property is equal to the 'ID' property of the current page entity. Note:
   *    this property is intelligently inferred if not specified from the type
   *    name of the entity being displayed (parent to this field).
   *
   * @type {string}
   */
  this.tableParentField = '';
};
goog.inherits(pn.ui.edit.Field, pn.ui.BaseField);


/** @inheritDoc */
pn.ui.edit.Field.prototype.extend = function(props) {
  pn.ui.edit.Field.superClass_.extend.call(this, props);
  var firstStep = this.id.split('.')[0];
  if (goog.string.endsWith(firstStep, 'Entities')) {
    if (!this.tableType) {
      this.tableType = pn.data.EntityUtils.getTypeProperty(firstStep);
    }
    if (!this.tableSpec) { this.tableSpec = this.tableType; }
  }

  if (this.tableType && !this.tableParentField) {
    this.tableParentField = this.entitySpec.type + 'ID';
  }
  if (this.readonly) { pn.ui.edit.ReadOnlyFields.toReadOnlyField(this); }
};


/** @typedef {pn.ui.edit.ComplexRenderer|function(*, Object, !Element):
              !(Element|goog.ui.Component|Text)} */
pn.ui.edit.Field.Renderer;
