;
goog.require('goog.date.Date');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');

goog.require('pn.Utils');
goog.provide('pn.ui.edit.FieldRenderers');


/**
 * @param {*} val The date (millis since 1970) to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!goog.ui.InputDatePicker} The date control.
 */
pn.ui.edit.FieldRenderers.dateRenderer =
    function(val, entity, parent, opt_search) {  
  goog.asserts.assert(!goog.isDefAndNotNull(val) ||
      goog.isNumber(val) || opt_search);

  var dt = null;
  if (val) {
    dt = new goog.date.Date();

    dt.setTime(/** @type {number} */ (val));
    if (dt.getFullYear() <= 1970) dt = null;
  }

  var fieldLabelInput = new goog.ui.LabelInput('DD/MMM/YYYY');
  fieldLabelInput.render(parent);
  parent.labelInput_ = fieldLabelInput;

  var idp = new goog.ui.InputDatePicker(
      pn.Utils.dateFormat, pn.Utils.dateParser);
  idp.getDatePicker().setShowWeekNum(false);
  idp.decorate(fieldLabelInput.getElement());
  if (dt) {
    idp.setDate(dt);
  }

  return idp;
};


/**
 * @param {*} val The boolean to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.FieldRenderers.boolRenderer =
    function(val, entity, parent, opt_search) {
  var inp = goog.dom.createDom('input', {'type': 'checkbox'});
  inp.defaultChecked = inp.checked = (val === true);
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.textAreaRenderer =
    function(val, entity, parent, opt_search) {
  if (opt_search === true) {
    return pn.ui.edit.FieldRenderers.standardTextSearchField(parent);
  }
  var textarea = goog.dom.createDom('textarea',
      {'rows': '5', 'value': val || ''});
  goog.dom.appendChild(parent, textarea);
  return textarea;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.hiddenTextField =
    function(val, entity, parent, opt_search) {
  goog.asserts.assert(!opt_search);

  var inp = goog.dom.createDom('input', {'type': 'hidden', 'value': val || ''});
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.FieldRenderers.readOnlyTextField =
    function(val, entity, parent, opt_search) {
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
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.FieldRenderers.readOnlyTextAreaField =
    function(val, entity, parent, opt_search) {
  var ta = pn.ui.edit.FieldRenderers.textAreaRenderer(
      val, entity, parent, opt_search);
  ta['readonly'] = 'readonly';
  ta['disabled'] = 'disabled';
  return ta;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element|!goog.ui.LabelInput|!goog.ui.InputDatePicker} The readonly
 *    text field control.
 */
pn.ui.edit.FieldRenderers.readOnlyDateField =
    function(val, entity, parent, opt_search) {
  if (opt_search === true) {
    return pn.ui.edit.FieldRenderers.dateRenderer(val, entity, parent, true);
  }
  var date = !val ? null : new Date(val);
  var txt = !date ? '' : pn.Utils.dateFormat.format(date);
  var li = new goog.ui.LabelInput(txt);
  li.render(parent);
  li.setEnabled(false);
  li.getValue = function() { return date ? date.getTime() : 0; };

  return li;
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
