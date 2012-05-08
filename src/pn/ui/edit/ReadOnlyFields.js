;
goog.require('goog.date.Date');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');
goog.require('pn.convert');
goog.require('pn.date');

goog.provide('pn.ui.edit.ReadOnlyFields');


/**
 * @param {!pn.ui.edit.Field} field The field wholse display value we want.
 * @param {!*} value The value on the non-readonly field.
 * @return {string} The text of the display value.
 */
pn.ui.edit.ReadOnlyFields.getText = function(field, value) {
  if (!goog.isDefAndNotNull(value)) return '';

  if (goog.isString(value)) return value;
  else if (goog.isArray(value)) return value.join(', ');

  var type = pn.ui.edit.ReadOnlyFields.getFieldType_(field);
  return pn.ui.edit.ReadOnlyFields.getTextForFieldType_(type, value);
};


/** @param {!pn.ui.UiSpec} spec This specs that will be made readonly. */
pn.ui.edit.ReadOnlyFields.toReadOnlySpec = function(spec) {
  if (!spec.editConfig) return;
  goog.array.forEach(spec.editConfig.fields,
      pn.ui.edit.ReadOnlyFields.toReadOnlyField);
};


/** @param {!pn.ui.edit.Field} field The field to change into readonly. */
pn.ui.edit.ReadOnlyFields.toReadOnlyField = function(field) {
  var fr = pn.ui.edit.FieldRenderers;
  var rr = pn.ui.edit.ReadOnlyFields;
  var curr = field.renderer;

  var rendermap = [
    [fr.timeRenderer, rr.timeField],
    [fr.dateRenderer, rr.dateField],
    [fr.boolRenderer, rr.boolField],
    [fr.yesNoRenderer, rr.boolField],
    [fr.centsRenderer, rr.centsField]
  ];
  field.readonly = true;
  if (!curr) {
    if (goog.string.endsWith(field.dataProperty, 'Entities')) {
      field.renderer = rr.itemList;
    } else {
      field.renderer = rr.textField;
    }
  } else if (curr.setReadOnly) curr.setReadOnly(true);
  else {
    if (goog.array.findIndex(rendermap, function(trans) {
      if (curr === trans[0] || curr === trans[1]) {
        field.renderer = trans[1];
        return true;
      }
    }) < 0) {
      field.renderer = rr.textField;
    }
  }
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.textField = function(val, entity, parent) {
  if (!val) val = '';
  if (goog.isString(val)) {
    val = pn.ui.edit.ReadOnlyFields.toHtmlText(val);
  }
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.DEFAULT;
  return pn.ui.edit.ReadOnlyFields.field_(val, parent, type);
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
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.itemList = function(val, entity, parent) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.ITEM_LIST;
  return pn.ui.edit.ReadOnlyFields.field_(val, parent, type);
};


/**
 * @param {*} val The time number represented by hhmm format.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The time field.
 */
pn.ui.edit.ReadOnlyFields.timeField = function(val, entity, parent) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.TIME;
  return pn.ui.edit.ReadOnlyFields.field_(val, parent, type);
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The readonly cents field.
 */
pn.ui.edit.ReadOnlyFields.centsField = function(val, entity, parent) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.CENTS;
  return pn.ui.edit.ReadOnlyFields.field_(val, parent, type);
};


/**
 * @param {*} val The boolean to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.ReadOnlyFields.boolField = function(val, entity, parent) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.BOOLEAN;
  var field = pn.ui.edit.ReadOnlyFields.field_(val, parent, type);
  field.checked = field.value;
  return field;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The readonly
 *    text field control.
 */
pn.ui.edit.ReadOnlyFields.dateField = function(val, entity, parent) {
  var type = pn.ui.edit.ReadOnlyFields.FieldType_.DATE;
  return pn.ui.edit.ReadOnlyFields.field_(val, parent, type);
};


/**
 * @private
 * @param {*} value The field value.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {!pn.ui.edit.ReadOnlyFields.FieldType_} type The type of this field.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.ReadOnlyFields.field_ = function(value, parent, type) {
  goog.asserts.assert(parent);
  goog.asserts.assert(type);

  var text = pn.ui.edit.ReadOnlyFields.getTextForFieldType_(type, value);
  var readonly = goog.dom.createDom('div', 'field');
  readonly.innerHTML = text;
  readonly.value = value;
  goog.dom.appendChild(parent, readonly);
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
    case ft.TIME:
      var hours = Math.floor(value / 100);
      var minutes = Math.floor(value % 100);
      var displayHr = goog.string.padNumber((hours % 12) + 1, 2);
      var displayMin = goog.string.padNumber(minutes, 2);
      return displayHr + ':' + displayMin + ' ' + (hours < 12 ? ' AM' : ' PM');
    case ft.DATE:
      var date = !value ? null : new Date(value);
      return !date ? '' : pn.date.dateFormat.format(date);
    case ft.BOOLEAN: return value === true ? 'yes' : 'no';
    case ft.CENTS:
      return pn.convert.centsToCurrency(/** @type {number} */ (value));
  }
  throw new Error('Type: ' + type + ' Not Supported');
};


/**
 * @private
 * @param {!pn.ui.edit.Field} field The field specifications whose type we
 *    need.
 * @return {!pn.ui.edit.ReadOnlyFields.FieldType_} The field type for the given
 *    specifications.
 */
pn.ui.edit.ReadOnlyFields.getFieldType_ = function(field) {
  var fr = pn.ui.edit.FieldRenderers;
  var ft = pn.ui.edit.ReadOnlyFields.FieldType_;
  var ro = pn.ui.edit.ReadOnlyFields;
  var curr = field.renderer;
  if (pn.data.EntityUtils.isParentProperty(field.dataProperty) &&
      !field.tableType) throw new Error('Not Supported');
  else if (!curr) {
    if (goog.string.endsWith(field.dataProperty, 'Entities')) {
      return ft.ITEM_LIST;
    }
    return ft.DEFAULT;
  }
  else if (curr.setReadOnly) throw new Error('Not Supported');
  else if (curr === fr.timeRenderer || curr === ro.timeField) return ft.TIME;
  else if (curr === fr.dateRenderer || curr === ro.dateField) return ft.DATE;
  else if (curr === fr.yesNoRenderer || curr === fr.boolRenderer ||
      curr === ro.boolField) return ft.BOOLEAN;
  else if (curr === fr.centsRenderer || curr === ro.centsField) return ft.CENTS;
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
  ITEM_LIST: 'itemlist',
  DEFAULT: 'default'
};
