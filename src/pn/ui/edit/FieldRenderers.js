;
goog.require('goog.date.Date');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');

goog.provide('pn.ui.edit.FieldRenderers');


/**
 * @param {number} val The date (millis since 1970) to display.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!goog.ui.InputDatePicker} The date control.
 */
pn.ui.edit.FieldRenderers.dateRenderer = function(val, parent, opt_search) {
  var dt = val ? new Date(val) : null;
  if (dt && dt.getFullYear() <= 1970) { dt = null; }

  var glb = pn.rcdb.Global;

  var fieldLabelInput = new goog.ui.LabelInput('DD/MMM/YYYY');
  fieldLabelInput.render(parent);
  parent.labelInput_ = fieldLabelInput;

  var idp = new goog.ui.InputDatePicker(glb.dateFormat, glb.dateParser);
  idp.decorate(fieldLabelInput.getElement());
  if (dt) { idp.setDate(new goog.date.Date(dt)); }

  return idp;
};


/**
 * @param {boolean} val The boolean to display.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.FieldRenderers.boolRenderer = function(val, parent, opt_search) {
  var inp = goog.dom.createDom('input', {'type': 'checkbox'});
  if (val === true) inp.selected = 'selected';
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {string} val The text to display.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.textAreaRenderer = function(val, parent, opt_search) {
  if (opt_search === true) {
    return pn.ui.edit.FieldRenderers.standardTextSearchField(parent);
  }
  var textarea = goog.dom.createDom('textarea',
      {'rows': '5', 'value': val || ''});
  goog.dom.appendChild(parent, textarea);
  return textarea;
};


/**
 * @param {string} val The text to display.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.FieldRenderers.readOnlyTextField =
    function(val, parent, opt_search) {
  if (opt_search === true) {
    return pn.ui.edit.FieldRenderers.standardTextSearchField(parent);
  }
  var readonly = goog.dom.createDom('input',
      {'type': 'text', 'readonly': 'readonly',
        'disabled': 'disabled', 'value': val || ''});
  goog.dom.appendChild(parent, readonly);
  return readonly;
};


/**
 * @param {!Element} parent The parent to attach this search input control to.
 * @return {!Element} The text field control for search inputs.
 */
pn.ui.edit.FieldRenderers.standardTextSearchField = function(parent) {
  var txt = goog.dom.createDom('input', {'type': 'text'});
  goog.dom.appendChild(parent, txt);
  return txt;
};
