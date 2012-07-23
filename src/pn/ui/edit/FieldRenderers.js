;
goog.require('goog.date.Date');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');
goog.require('pn.convert');
goog.require('pn.date');

goog.provide('pn.ui.edit.FieldRenderers');


/**
 * @param {!pn.ui.FieldCtx} field The field to render.
 * @return {!goog.ui.Component} The date control.
 */
pn.ui.edit.FieldRenderers.dateRenderer = function(field) {
  var val = field.getEntityValue();
  var dt = null;
  if (val) {
    dt = new goog.date.Date();
    dt.setTime(/** @type {number} */ (val));
    if (dt.getFullYear() <= 1970) dt = null;
  }

  // fieldLabelInput not being disposed
  var fieldLabelInput = new goog.ui.LabelInput('DD/MMM/YYYY');
  fieldLabelInput.render(field.parentComponent);

  var idp = new goog.ui.InputDatePicker(pn.date.dateFormat, pn.date.dateParser);
  idp.getDatePicker().setShowWeekNum(false);
  idp.decorate(fieldLabelInput.getElement());
  if (dt) { idp.setDate(dt); }
  return idp;
};


/**
 * @param {!pn.ui.FieldCtx} field The field to render.
 * @return {!Element} The date control.
 */
pn.ui.edit.FieldRenderers.timeRenderer = function(field) {
  var picker = goog.dom.createDom('select', {
    'class': 'time-picker'
  });

  for (var h = 5; h < 23; h++) {
    var displayHr = goog.string.padNumber((h % 12) + 1, 2);
    var amPm = h < 11 ? ' AM' : ' PM';
    for (var m = 0; m < 60; m += 15) {
      var display = displayHr + ':' + goog.string.padNumber(m, 2) + amPm;
      var opt = goog.dom.createDom('option', {'value': display }, display);
      goog.dom.appendChild(picker, opt);
    }
  }
  picker.value = field.getEntityValue();
  goog.dom.appendChild(field.parentComponent, picker);
  return picker;
};


/**
 * @param {!pn.ui.FieldCtx} field The field to render.
 * @return {!Element} The cents input control.
 */
pn.ui.edit.FieldRenderers.centsRenderer = function(field) {
  var val = field.getEntityValue() || 0;
  var input = goog.dom.createDom('input', 'cents');
  input.value = pn.convert.centsToCurrency(/** @type {number} */ (val));
  goog.dom.appendChild(field.parentComponent, input);
  input.getValue = function() {
    return pn.convert.currencyToCents(input.value) || 0;
  };
  return input;
};


/**
 * @param {!pn.ui.FieldCtx} field The field to render.
 * @return {!Element} The int input control.
 */
pn.ui.edit.FieldRenderers.intRenderer = function(field) {
  var val = field.getEntityValue() || 0;
  var input = goog.dom.createDom('input', {
    'class': 'int-field',
    'type': 'number'
  });
  input.value = val.toString();
  goog.dom.appendChild(field.parentComponent, input);
  input.getValue = function() {
    return parseInt(input.value, 10) || 0;
  };
  return input;
};


/**
 * @param {!pn.ui.FieldCtx} field The field to render.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.FieldRenderers.boolRenderer = function(field) {
  var inp = goog.dom.createDom('input', {'type': 'checkbox'});
  inp.defaultChecked = inp.checked = (field.getEntityValue() === true);
  goog.dom.appendChild(field.parentComponent, inp);
  return inp;
};


/**
 * @param {!pn.ui.FieldCtx} field The field to render.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.FieldRenderers.yesNoRenderer = function(field) {
  var sel = goog.dom.createDom('select', 'yesno',
      goog.dom.createDom('option', {'value': '0'}, 'Select...'),
      goog.dom.createDom('option', {'value': 'true'}, 'Yes'),
      goog.dom.createDom('option', {'value': 'false'}, 'No')
      );
  var val = field.getEntityValue();
  sel.value = goog.isDefAndNotNull(val) ? val.toString() : '0';
  goog.dom.appendChild(field.parentComponent, sel);
  return sel;
};


/**
 * @param {!pn.ui.FieldCtx} field The field to render.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.textAreaRenderer = function(field) {
  var textarea = goog.dom.createDom('textarea', {
    'rows': '5',
    'cols': '34' ,
    'value': field.getEntityValue() || ''
  });
  goog.dom.appendChild(field.parentComponent, textarea);
  return textarea;
};


/**
 * @param {!pn.ui.FieldCtx} field The field to render.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.hiddenTextField = function(field) {

  var inp = goog.dom.createDom('input', {
    'type': 'hidden',
    'value': field.getEntityValue() || ''
  });
  goog.style.showElement(field.parentComponent, false);
  goog.dom.appendChild(field.parentComponent, inp);
  return inp;
};


/**
 * @param {!pn.ui.FieldCtx} field The field to render.
 * @return {!Element} The text field control for search inputs.
 */
pn.ui.edit.FieldRenderers.standardTextSearchField = function(field) {
  var txt = goog.dom.createDom('input', {'type': 'text'});
  goog.dom.appendChild(field.parentComponent, txt);
  return txt;
};


/**
 * @param {string} mappingEntity The many-to-many entity table name.
 * @param {string} parentIdField The field in the many-to-many table that
 *    points to the parent entity (not the admin entity).
 * @param {string} adminEntity The admin entity table name.
 * @param {function(Object):string=} opt_displayStrategy A function that
 *    returns a string to display as the select box option item for the given
 *    entity.
 * @return {!pn.ui.edit.FieldSpec.Renderer} The many to many list box renderer.
 */
pn.ui.edit.FieldRenderers.createManyToManyRenderer =
    function(mappingEntity, parentIdField, adminEntity, opt_displayStrategy) {
  var renderer = function(field) {
    var manyToManys = goog.array.filter(field.cache[mappingEntity],
        function(abrand) {
          return abrand[parentIdField] === field.entity['ID'];
        });
    var adminIDs = goog.array.map(manyToManys, function(mm) {
      return mm[adminEntity + 'ID'];
    });

    // Setting the value in the dataProperty of the field so that dirty
    // checking handles fields with many to many lists.
    field.entity[mappingEntity + 'Entities'] = adminIDs;

    var select = goog.dom.createDom('select', {'multiple': 'multiple'});
    goog.array.forEach(field.cache[adminEntity], function(ae) {
      var text = opt_displayStrategy ?
          opt_displayStrategy(ae) :
          ae[adminEntity + 'Name'];
      var opt = goog.dom.createDom('option', {
        'text': text,
        'value': ae['ID'],
        'selected': goog.array.findIndex(adminIDs, function(adminID) {
          return ae['ID'] === adminID;
        }) >= 0
      });
      select.options.add(opt);
    });
    goog.dom.appendChild(field.parentComponent, select);
    return select;
  };
  return renderer;
};
