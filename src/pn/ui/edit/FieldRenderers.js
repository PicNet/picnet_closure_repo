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
 * @return {!goog.ui.Component} The date control.
 */
pn.ui.edit.FieldRenderers.dateRenderer =
    function(val, entity, parent) {
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
 * @param {*} val The time number represented by hhmm format.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The date control.
 */
pn.ui.edit.FieldRenderers.timeRenderer =
    function(val, entity, parent) {
  var num = parseInt(val || 0, 10);
  var hours = Math.floor(num / 100);
  var minutes = Math.floor(num % 100);
  var hourPick = goog.dom.createDom('select', 'time-picker-hours');
  var minitesPick = goog.dom.createDom('select', 'time-picker-minutes');

  for (var h = 0; h < 24; h++) {
    var displayHr = (h % 12) + 1;
    var hr = goog.string.padNumber(displayHr, 2) + (h < 12 ? ' AM' : ' PM');
    var opt = goog.dom.createDom('option',
        {'value': h, 'selected': hours === h }, hr);
    if (hours === h) opt['selected'] = 'selected';
    goog.dom.appendChild(hourPick, opt);
  }

  for (var m = 0; m < 60; m += 5) {
    var opt = goog.dom.createDom('option',
        {'value': m, 'selected': minutes === m }, goog.string.padNumber(m, 2));
    goog.dom.appendChild(minitesPick, opt);
  }

  var elem = goog.dom.createDom('div', 'time-picker',
      hourPick, ':', minitesPick);

  goog.dom.appendChild(parent, elem);
  elem.getValue = function() {
    return hourPick.value * 100 + minitesPick.value;
  };
  return elem;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Text} The readonly
 *    text field control.
 */
pn.ui.edit.FieldRenderers.centsRenderer = function(val, entity, parent) {
  goog.asserts.assertNumber(val);
  var display = pn.Utils.centsToDisplayString(/** @type {number} */ (val));
  return goog.dom.createTextNode(display);
};


/**
 * @param {*} val The boolean to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.FieldRenderers.boolRenderer =
    function(val, entity, parent) {
  var inp = goog.dom.createDom('input', {'type': 'checkbox'});
  inp.defaultChecked = inp.checked = (val === true);
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.textAreaRenderer =
    function(val, entity, parent) {
  var textarea = goog.dom.createDom('textarea',
      {'rows': '5', 'value': val || ''});
  goog.dom.appendChild(parent, textarea);
  return textarea;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.hiddenTextField =
    function(val, entity, parent) {

  var inp = goog.dom.createDom('input', {'type': 'hidden', 'value': val || ''});
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.FieldRenderers.readOnlyTextField =
    function(val, entity, parent) {
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
 * @return {!Element} The readonly text field control.
 */
pn.ui.edit.FieldRenderers.readOnlyTextAreaField =
    function(val, entity, parent) {
  var ta = pn.ui.edit.FieldRenderers.textAreaRenderer(val, entity, parent);
  ta['readonly'] = 'readonly';
  ta['disabled'] = 'disabled';
  return ta;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!goog.ui.LabelInput} The readonly
 *    text field control.
 */
pn.ui.edit.FieldRenderers.readOnlyDateField =
    function(val, entity, parent) {
  var date = !val ? null : new Date(val);
  var txt = !date ? '' : pn.Utils.dateFormat.format(date);
  var li = new goog.ui.LabelInput(txt);
  li.render(parent);
  li.setEnabled(false);
  li.getValue = function() { return date ? date.getTime() : 0; };

  return li;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The text field control for search inputs.
 */
pn.ui.edit.FieldRenderers.standardTextSearchField =
    function(val, entity, parent) {
  var txt = goog.dom.createDom('input', {'type': 'text'});
  goog.dom.appendChild(parent, txt);
  return txt;
};
