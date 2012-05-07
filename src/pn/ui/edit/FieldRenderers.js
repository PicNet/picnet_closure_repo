;
goog.require('goog.date.Date');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');
goog.require('pn.convert');
goog.require('pn.date');
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

  var idp = new goog.ui.InputDatePicker(pn.date.dateFormat, pn.date.dateParser);
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
  var picker = goog.dom.createDom('select', {
    'class': 'time-picker'
  });

  for (var h = 5; h < 22; h++) {
    var displayHr = goog.string.padNumber((h % 12) + 1, 2);
    var amPm = h < 12 ? ' AM' : 'PM';
    for (var m = 0; m < 60; m += 15) {
      var value = h * 60 + m;
      var opt = goog.dom.createDom('option',
          {'value': value },
          displayHr + ':' +
          goog.string.padNumber(m, 2) +
          amPm);
      goog.dom.appendChild(picker, opt);
    }
  }
  picker.value = val;
  goog.dom.appendChild(parent, picker);
  return picker;
};


/**
 * @param {*} val The text to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The cents input control.
 */
pn.ui.edit.FieldRenderers.centsRenderer = function(val, entity, parent) {
  val = val || 0;
  var input = goog.dom.createDom('input', 'cents');
  input.value = pn.convert.centsToCurrency(/** @type {number} */ (val));
  goog.dom.appendChild(parent, input);
  input.getValue = function() {
    return pn.convert.currencyToCents(input.value);
  };
  return input;

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
 * @param {*} val The boolean to display.
 * @param {Object} entity The Entity being displayed.
 * @param {!Element} parent The parent to attach this input control to.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.FieldRenderers.yesNoRenderer =
    function(val, entity, parent) {
  var sel = goog.dom.createDom('select', 'yesno',
      goog.dom.createDom('option', {'value': '0'}, 'Select...'),
      goog.dom.createDom('option', {'value': 'true'}, 'Yes'),
      goog.dom.createDom('option', {'value': 'false'}, 'No')
      );
  sel.value = goog.isDefAndNotNull(val) ? val.toString() : '0';
  goog.dom.appendChild(parent, sel);
  return sel;
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
 * @return {!Element} The text field control for search inputs.
 */
pn.ui.edit.FieldRenderers.standardTextSearchField =
    function(val, entity, parent) {
  var txt = goog.dom.createDom('input', {'type': 'text'});
  goog.dom.appendChild(parent, txt);
  return txt;
};


/**
 * @param {string} mappingEntity The many-to-many entity table name.
 * @param {string} parentIdField The field in the many-to-many table that
 *    points to the parent entity (not the admin entity).
 * @param {string} adminEntity The admin entity table name.
 * @return {!pn.ui.edit.Field.Renderer} The many to many list box renderer.
 */
pn.ui.edit.FieldRenderers.createManyToManyRenderer =
    function(mappingEntity, parentIdField, adminEntity) {
  var renderer = function(val, entity, parent, cache) {
    var aebes = goog.array.filter(cache[mappingEntity],
        function(abrand) {
          return abrand[parentIdField] === entity['ID'];
        });
    var select = goog.dom.createDom('select', {'multiple': 'multiple'});
    goog.array.forEach(cache[adminEntity], function(b) {
      var opt = goog.dom.createDom('option', {
        'text': b[adminEntity + 'Name'],
        'value': b['ID'],
        'selected': goog.array.findIndex(aebes, function(aeb) {
          return b['ID'] === aeb[adminEntity + 'ID'];
        }) >= 0
      });
      select.options.add(opt);
    });
    goog.dom.appendChild(parent, select);
    return select;
  };
  return renderer;
};
