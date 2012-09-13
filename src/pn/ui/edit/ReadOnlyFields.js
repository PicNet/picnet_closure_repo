;
goog.require('pn.convert');
goog.require('pn.date');

goog.provide('pn.ui.edit.ReadOnlyFields');


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.textField = function(fctx, parent, entity) {
  var val = fctx.spec.displayPath ?
      fctx.getDisplayValue(entity) :
      fctx.getEntityValue(entity);
  if (!val) val = '';
  if (goog.isString(val)) {
    val = pn.ui.edit.ReadOnlyFields.toHtmlText(val);
  }
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.DEFAULT;
  var div = pn.ui.edit.ReadOnlyFields.field_(fctx, type, parent, entity);
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
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.itemList = function(fctx, parent, entity) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.ITEM_LIST;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type, parent, entity);
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The time field.
 */
pn.ui.edit.ReadOnlyFields.timeField = function(fctx, parent, entity) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.TIME;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type, parent, entity);
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The enumeration field.
 */
pn.ui.edit.ReadOnlyFields.enumField = function(fctx, parent, entity) {
  var val = /** @type {number} */ (fctx.getEntityValue(entity));
  var name = pn.data.EntityUtils.getEnumName(fctx.schema.entityType, val);
  return pn.ui.edit.ReadOnlyFields.createDiv_(name, val, parent);
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The readonly cents field.
 */
pn.ui.edit.ReadOnlyFields.centsField = function(fctx, parent, entity) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.CENTS;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type, parent, entity);
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The readonly int field.
 */
pn.ui.edit.ReadOnlyFields.intField = function(fctx, parent, entity) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.INT;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type, parent, entity);
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.ReadOnlyFields.boolField = function(fctx, parent, entity) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.BOOLEAN;
  var ctl = pn.ui.edit.ReadOnlyFields.field_(fctx, type, parent, entity);
  ctl.checked = fctx.value;
  return ctl;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The readonly
 *    text field control.
 */
pn.ui.edit.ReadOnlyFields.dateField = function(fctx, parent, entity) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.DATE;
  return pn.ui.edit.ReadOnlyFields.field_(fctx, type, parent, entity);
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.entityParentListField =
    function(fctx, parent, entity) {
  var path = fctx.spec.displayPath;
  var val = pn.data.EntityUtils.getEntityDisplayValue(
      fctx.cache, path, fctx.spec.entitySpec.type, entity) || '';

  var div = goog.dom.createDom('div', 'field', val.toString());
  div.value = entity[path.split('.')[0]];
  goog.dom.appendChild(parent, div);
  return div;
};


/**
 * @private
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a control for.
 * @param {!pn.ui.edit.ReadOnlyFields.FieldType_} type The type of this field.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being added.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.field_ = function(fctx, type, parent, entity) {
  goog.asserts.assert(type);
  var ft = pn.ui.edit.ReadOnlyFields.FieldType_;
  var val = type === ft.ITEM_LIST ?
      fctx.getDisplayValue(entity) :
      fctx.getEntityValue(entity);

  var text = pn.ui.edit.ReadOnlyFields.getTextForFieldType_(type, val);
  return pn.ui.edit.ReadOnlyFields.createDiv_(text, val, parent);
};


/**
 * @private
 * @param {string} text The text to show in this div.
 * @param {*} value The value to set in this div.
 * @param {!Element} parent The parent to attach this control to.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.createDiv_ = function(text, value, parent) {
  var div = goog.dom.createDom('div', 'field');
  div.innerHTML = text;
  div.value = value;
  goog.dom.appendChild(parent, div);
  return div;
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
    case ft.TIME:
      var hours = Math.floor(value / 60);
      var minutes = Math.floor(value % 60);
      var displayHr = goog.string.padNumber((hours % 12) + 1, 2);
      var displayMin = goog.string.padNumber(minutes, 2);
      return displayHr + ':' + displayMin + ' ' + (hours < 11 ? ' AM' : ' PM');
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
