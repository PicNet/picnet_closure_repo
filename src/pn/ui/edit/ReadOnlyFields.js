;
goog.require('pn.convert');
goog.require('pn.date');

goog.provide('pn.ui.edit.ReadOnlyFields');


/**
 * @param {!pn.ui.edit.FieldSpec} fieldSpec The field wholse display value we
 *    want.
 * @param {!*} value The value on the non-readonly field.
 * @return {string} The text of the display value.
 */
pn.ui.edit.ReadOnlyFields.getText = function(fieldSpec, value) {
  if (!goog.isDefAndNotNull(value)) return '';

  if (goog.isString(value)) return value;
  else if (goog.isArray(value)) {
    return goog.array.filter(value, function(v) { return !!v; }).join(',');
  }

  var type = pn.ui.edit.ReadOnlyFields.getFieldType_(fieldSpec);
  return pn.ui.edit.ReadOnlyFields.getTextForFieldType_(type, value);
};


/** @param {!pn.ui.UiSpec} spec This specs that will be made readonly. */
pn.ui.edit.ReadOnlyFields.toReadOnlySpec = function(spec) {
  if (!spec.editConfig) return;
  goog.array.forEach(spec.editConfig.fieldSpecs,
      pn.ui.edit.ReadOnlyFields.toReadOnlyField);
};


/**
 * @param {pn.ui.edit.FieldSpec} fieldSpec The field to change into readonly.
 */
pn.ui.edit.ReadOnlyFields.toReadOnlyField = function(fieldSpec) {
  fieldSpec.readonly = true;

  // Complex renderers should know how to handle their own readonlyness
  if (fieldSpec.renderer instanceof pn.ui.edit.ComplexRenderer) { return; }

  var fr = pn.ui.edit.FieldRenderers;
  var rr = pn.ui.edit.ReadOnlyFields;
  var curr = fieldSpec.renderer;
  var rendermap = [
    [fr.timeRenderer, rr.timeField],
    [fr.dateRenderer, rr.dateField],
    [fr.boolRenderer, rr.boolField],
    [fr.yesNoRenderer, rr.boolField],
    [fr.centsRenderer, rr.centsField],
    [fr.intRenderer, rr.intField]
  ];
  if (goog.string.endsWith(fieldSpec.dataProperty, 'Entities')) {
    if (fieldSpec.renderer === null) return; // Leave grids alone
    fieldSpec.renderer = rr.itemList;
  } else if (!curr) { fieldSpec.renderer = rr.textField; }
  else {
    if (goog.array.findIndex(rendermap, function(trans) {
      if (curr === trans[0] || curr === trans[1]) {
        fieldSpec.renderer = trans[1];
        return true;
      }
      return false;
    }) < 0) {
      fieldSpec.renderer = rr.textField;
    }
  }
};


/**
 * @param {!pn.ui.FieldCtx} fctx The field to create a control for.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.textField = function(fctx) {
  var val = fctx.spec.displayPath ?
      fctx.getDisplayValue() :
      fctx.getEntityValue();
  if (!val) val = '';
  if (goog.isString(val)) {
    val = pn.ui.edit.ReadOnlyFields.toHtmlText(val);
  }
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.DEFAULT;
  var div = pn.ui.edit.ReadOnlyFields.field_(fctx, type);
  div.innerHTML = val;
  return div;
};


/**
 * @param {string} text The text to replace any new lines and tabs with html
 *    equivalents.
 * @return {string} The html representation of the server side text.
 */
pn.ui.edit.ReadOnlyFields.toHtmlText = function(text) {
  goog.asserts.assert(goog.isString(text));
  return text.
      replace(/\n/g, '<br/>').
      replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
};


/**
 * @param {!pn.ui.FieldCtx} fctx The field to create a control for.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.itemList = function(fctx) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.ITEM_LIST;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type);
};


/**
 * @param {!pn.ui.FieldCtx} fctx The field to create a control for.
 * @return {!Element} The time field.
 */
pn.ui.edit.ReadOnlyFields.timeField = function(fctx) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.TIME;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type);
};


/**
 * @param {!pn.ui.FieldCtx} fctx The field to create a control for.
 * @return {!Element} The readonly cents field.
 */
pn.ui.edit.ReadOnlyFields.centsField = function(fctx) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.CENTS;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type);
};


/**
 * @param {!pn.ui.FieldCtx} fctx The field to create a control for.
 * @return {!Element} The readonly int field.
 */
pn.ui.edit.ReadOnlyFields.intField = function(fctx) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.INT;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type);
};


/**
 * @param {!pn.ui.FieldCtx} fctx The field to create a control for.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.ReadOnlyFields.boolField = function(fctx) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.BOOLEAN;
  var ctl = pn.ui.edit.ReadOnlyFields.field_(fctx, type);
  ctl.checked = fctx.value;
  return ctl;
};


/**
 * @param {!pn.ui.FieldCtx} fctx The field to create a control for.
 * @return {!Element} The readonly
 *    text field control.
 */
pn.ui.edit.ReadOnlyFields.dateField = function(fctx) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.DATE;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type);
};


/**
 * @private
 * @param {!pn.ui.FieldCtx} fctx The field to create a control for.
 * @param {!pn.ui.edit.ReadOnlyFields.FieldType_} type The type of this field.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.field_ = function(fctx, type) {
  goog.asserts.assert(type);
  var ft = pn.ui.edit.ReadOnlyFields.FieldType_;
  var val = type === ft.ITEM_LIST ?
      fctx.getDisplayValue() :
      fctx.getEntityValue();

  var text = pn.ui.edit.ReadOnlyFields.getTextForFieldType_(type, val);
  var readonly = goog.dom.createDom('div', 'field');
  readonly.innerHTML = text;
  readonly.value = val;
  goog.dom.appendChild(fctx.parentComponent, readonly);
  return readonly;
};


/**
 * @private
 * @param {!pn.ui.edit.ReadOnlyFields.FieldType_} type The type of this
 *    field value.
 * @param {!*} value The value on the non-readonly field.
 * @return {string} The text of the display value.
 */
pn.ui.edit.ReadOnlyFields.getTextForFieldType_ = function(type, value) {
  if (!goog.isDefAndNotNull(value)) return '';

  var ft = pn.ui.edit.ReadOnlyFields.FieldType_;
  switch (type) {
    case ft.DEFAULT: return value.toString();
    case ft.ITEM_LIST:
      if (!value) { return '<ul class="empty"><li>No items found.</li></ul>'; }
      var items = value.split(', ');
      return '<ul><li>' + items.join('</li><li>') + '</li></ul>';
    case ft.TIME: return /** @type {string} */ (value);
    case ft.DATE:
      var date = !value ? null : new Date(value);
      return !date ? '' : pn.date.dateFormat.format(date);
    case ft.BOOLEAN:
      return value === true ? 'yes' : 'no';
    case ft.CENTS:
      return pn.convert.centsToCurrency(/** @type {number} */ (value));
    case ft.INT:
      return (value || 0).toString();
  }
  throw new Error('Type: ' + type + ' Not Supported');
};


/**
 * @private
 * @param {!pn.ui.edit.FieldSpec} fieldSpec The field specifications whose type
 *    we need.
 * @return {!pn.ui.edit.ReadOnlyFields.FieldType_} The field type for the given
 *    specifications.
 */
pn.ui.edit.ReadOnlyFields.getFieldType_ = function(fieldSpec) {
  var fr = pn.ui.edit.FieldRenderers;
  var ft = pn.ui.edit.ReadOnlyFields.FieldType_;
  var ro = pn.ui.edit.ReadOnlyFields;
  var curr = fieldSpec.renderer;
  var dataProp = fieldSpec.dataProperty;
  var isList = goog.string.endsWith(dataProp, 'Entities');

  if (pn.data.EntityUtils.isParentProperty(fieldSpec.dataProperty) &&
      !fieldSpec.tableType) throw new Error('Not Supported');

  if (isList) return ft.ITEM_LIST;
  else if (!curr) return ft.DEFAULT;
  else if (curr === fr.timeRenderer || curr === ro.timeField) return ft.TIME;
  else if (curr === fr.dateRenderer || curr === ro.dateField) return ft.DATE;
  else if (curr === fr.yesNoRenderer || curr === fr.boolRenderer ||
      curr === ro.boolField) return ft.BOOLEAN;
  else if (curr === fr.centsRenderer || curr === ro.centsField) return ft.CENTS;
  else if (curr === fr.intRenderer || curr === ro.intField) return ft.INT;
  else return ft.DEFAULT;
};


/**
 * @private
 * @enum {string}
 */
pn.ui.edit.ReadOnlyFields.FieldType_ = {
  DATE: 'date',
  TIME: 'time',
  BOOLEAN: 'boolean',
  CENTS: 'cents',
  INT: 'int',
  ITEM_LIST: 'itemlist',
  DEFAULT: 'default'
};
