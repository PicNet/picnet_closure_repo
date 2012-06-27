;
goog.require('goog.date.Date');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');
goog.require('pn.convert');
goog.require('pn.date');
goog.require('pn.ui.InputDatePicker');

goog.provide('pn.ui.edit.FieldRenderers');


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!goog.ui.Component} The date control.
 */
pn.ui.edit.FieldRenderers.dateRenderer = function(fctx, parent, entity) {
  var val = fctx.getEntityValue(entity);
  var dt = null;
  if (val) {
    dt = new goog.date.Date();
    dt.setTime(/** @type {number} */(val));
    if (dt.getFullYear() <= 1970) dt = null;
  }

  var idp = new pn.ui.InputDatePicker(
      pn.date.dateFormat, pn.date.dateParser, 'DD/MMM/YYYY');
  idp.decorate(parent);
  idp.setDate(dt);
  return idp;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The date control.
 */
pn.ui.edit.FieldRenderers.timeRenderer = function(fctx, parent, entity) {
  var picker = goog.dom.createDom('select', {
    'class': 'time-picker'
  });

  for (var h = 5; h < 22; h++) {
    var displayHr = goog.string.padNumber((h % 12) + 1, 2);
    var amPm = h < 11 ? ' AM' : ' PM';
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
  picker.value = fctx.getEntityValue(entity);
  goog.dom.appendChild(parent, picker);
  return picker;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The cents input control.
 */
pn.ui.edit.FieldRenderers.centsRenderer = function(fctx, parent, entity) {
  var val = fctx.getEntityValue(entity) || 0;
  var input = goog.dom.createDom('input', 'cents');
  input.value = pn.convert.centsToCurrency(/** @type {number} */ (val));
  goog.dom.appendChild(parent, input);
  input.getValue = function() {
    return pn.convert.currencyToCents(input.value);
  };
  return input;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The int input control.
 */
pn.ui.edit.FieldRenderers.intRenderer = function(fctx, parent, entity) {
  var val = fctx.getEntityValue(entity) || 0;
  var input = goog.dom.createDom('input', {
    'class': 'int-field',
    'type': 'number'
  });
  input.value = val.toString();
  goog.dom.appendChild(parent, input);
  input.getValue = function() {
    return parseInt(input.value, 10) || 0;
  };
  return input;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.FieldRenderers.boolRenderer = function(fctx, parent, entity) {
  var inp = goog.dom.createDom('input', {'type': 'checkbox'});
  inp.defaultChecked = inp.checked = (fctx.getEntityValue(entity) === true);
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.FieldRenderers.yesNoRenderer = function(fctx, parent, entity) {
  var sel = goog.dom.createDom('select', 'yesno',
      goog.dom.createDom('option', {'value': '0'}, 'Select...'),
      goog.dom.createDom('option', {'value': 'true'}, 'Yes'),
      goog.dom.createDom('option', {'value': 'false'}, 'No')
      );
  var val = fctx.getEntityValue(entity);
  sel.value = goog.isDefAndNotNull(val) ? val.toString() : '0';
  goog.dom.appendChild(parent, sel);
  return sel;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The input control.
 */
pn.ui.edit.FieldRenderers.textFieldRenderer = function(fctx, parent, entity) {
  var inp = goog.dom.createDom('input', {
    'type': 'text',
    'value': fctx.getEntityValue(entity) || ''
  });
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.textAreaRenderer = function(fctx, parent, entity) {
  var textarea = goog.dom.createDom('textarea', {
    'rows': '5',
    'cols': '34' ,
    'value': fctx.getEntityValue(entity) || ''
  });
  goog.dom.appendChild(parent, textarea);
  return textarea;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The password control.
 */
pn.ui.edit.FieldRenderers.passwordRenderer = function(fctx, parent, entity) {
  var inp = goog.dom.createDom('input', {
    'type': 'password',
    'value': fctx.getEntityValue(entity) || ''
  });
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.hiddenTextField = function(fctx, parent, entity) {
  var inp = goog.dom.createDom('input', {
    'type': 'hidden',
    'value': fctx.getEntityValue(entity) || ''
  });
  goog.style.showElement(parent, false);
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.orderFieldRenderer = function(fctx, parent, entity) {
  var order = pn.data.EntityUtils.isNew(entity) ?
      fctx.cache[fctx.entitySpec.type].length :
      fctx.getEntityValue(entity);
  var inp = goog.dom.createDom('input', {
    'type': 'hidden',
    'value': order.toString()
  });
  goog.style.showElement(parent, false);
  goog.dom.appendChild(parent, inp);
  return inp;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @return {!Element} The text control for search inputs.
 */
pn.ui.edit.FieldRenderers.standardTextSearchField = function(fctx, parent) {
  var txt = goog.dom.createDom('input', {'type': 'text'});
  goog.dom.appendChild(parent, txt);
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
  var renderer = function(fctx, parent, entity) {
    var manyToManys = goog.array.filter(fctx.cache[mappingEntity],
        function(abrand) {
          return abrand[parentIdField] === entity['ID'];
        });
    var adminIDs = goog.array.map(manyToManys, function(mm) {
      return mm[adminEntity + 'ID'];
    });

    // Setting the value in the dataProperty of the fctx so that dirty
    // checking handles fctxs with many to many lists.
    entity[mappingEntity + 'Entities'] = adminIDs;

    var select = goog.dom.createDom('select', {'multiple': 'multiple'});
    goog.array.forEach(fctx.cache[adminEntity], function(ae) {
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
    goog.dom.appendChild(parent, select);
    return select;
  };
  return renderer;
};
