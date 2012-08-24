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
  if (val instanceof Number) {
    dt = pn.date.fromMillis(/** @type {number} */ (val));
  } else if (val instanceof goog.date.Date) {
    dt = val;
  } else if (val instanceof Date) {
    dt = pn.date.fromDate(/** @type {Date} */ (val));
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
 * @return {!Element} The select control.
 */
pn.ui.edit.FieldRenderers.enumRenderer = function(fctx, parent, entity) {
  var txt = 'Select...';
  var lst = [];

  goog.object.forEach(fctx.schema.entityType, function(val, name) {
    if (goog.isNumber(val)) lst.push({ id: val, name: name});
  });
  var selected = fctx.getEntityValue(entity);
  var select = pn.ui.edit.FieldRenderers.createDropDownList_(
      txt, lst, selected, -1);
  goog.dom.appendChild(parent, select);
  return select;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.orderFieldRenderer = function(fctx, parent, entity) {
  var order = pn.data.EntityUtils.isNew(entity) ?
      fctx.cache[fctx.entitySpec.type.type].length :
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
 * @param {!Object} entity The entity being edited.
 * @param {function(!Object,!Array.<!Object>):!Array.<!Object>=} opt_filter The
 *    filter to apply to the list entity.  This function takes the current
 *    entity and the list of unfiltered entities, this function needs to then
 *    return the filtered (and optionally resorted) entity list to display
 *    in the default select control.
 * @return {!Element} The parent select list.
 */
pn.ui.edit.FieldRenderers.entityParentListField =
    function(fctx, parent, entity, opt_filter) {
  var steps = fctx.spec.displayPath.split('.');
  var cascading = !!fctx.spec.tableType;
  var entityType = cascading ?
      fctx.spec.tableType :
      pn.data.EntityUtils.getTypeProperty(
          fctx.spec.entitySpec.type, fctx.spec.dataProperty);
  var list = fctx.cache[entityType.type];
  if (!list) throw new Error('Expected access to "' + entityType.type +
      '" but could not be found in cache. Field: ' + goog.debug.expose(fctx));
  pn.data.EntityUtils.orderEntities(entityType, list);
  if (opt_filter) list = opt_filter(entity, list);

  var selTxt = 'Select ' + fctx.spec.name + ' ...';
  steps.shift();
  var namePath = cascading ? entityType + 'Name' : steps.join('.');
  list = goog.array.map(list, function(e) {
    return {
      id: e.id,
      name: pn.data.EntityUtils.getEntityDisplayValue(
          fctx.cache, namePath, fctx.spec.entitySpec.type, e)
    };
  });
  var select = pn.ui.edit.FieldRenderers.createDropDownList_(
      selTxt, list, fctx.getEntityValue(entity));
  goog.dom.appendChild(parent, select);
  return select;
};


/**
 * @private
 * @param {string} selectTxt The message to display in the first element of the
 *    list.
 * @param {!Array.<{ID:number, Name: string}>} list The list of entities
 *    (requires an ID and Name field).
 * @param {*} selValue The selected value in the 'ID' field.
 * @param {number=} opt_noneId The ID to give to the 'Select...' entry.
 * @return {!Element} The select box.
 */
pn.ui.edit.FieldRenderers.createDropDownList_ =
    function(selectTxt, list, selValue, opt_noneId) {
  var select = goog.dom.createDom('select');
  if (selectTxt) {
    goog.dom.appendChild(select, goog.dom.createDom('option',
        {'value': goog.isDef(opt_noneId) ? opt_noneId.toString() : '0' },
        selectTxt));
  }
  goog.array.forEach(list, function(e) {
    var opts = {'value': e.id};
    if (goog.isDef(selValue) && e.id === selValue) {
      opts['selected'] = 'selected'; }
    var txt = e.name ? e.name.toString() : '';
    goog.asserts.assert(txt !== undefined);

    if (txt) {
      var option = goog.dom.createDom('option', opts, txt);
      goog.dom.appendChild(select, option);
    }
  });
  return select;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a dom tree for.
 * @param {!Element} parent The parent to attach to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element|!goog.ui.Component} The created dom element.
 */
pn.ui.edit.FieldRenderers.childEntitiesTableRenderer =
    function(fctx, parent, entity) {
  goog.asserts.assert(fctx.spec.tableType);
  goog.asserts.assert(entity.id != 0);

  var parentId = entity.id;

  var parentField = fctx.spec.tableParentField;
  var list = fctx.cache[fctx.spec.tableType.type];
  if (!list) list = fctx.cache[goog.string.remove(fctx.id, 'Entities')];
  if (!list) throw new Error('Expected access to "' + fctx.spec.tableType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(fctx));
  var data = !parentId ? [] : goog.array.filter(list,
      function(c) { return c[parentField] === parentId; });
  var spec = pn.app.ctx.specs.get(/** @type {string} */ (fctx.spec.tableSpec));
  var g = new pn.ui.grid.Grid(spec, data, fctx.cache);
  g.decorate(parent);
  return g;
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
        function(manyToMany) {
          return manyToMany[parentIdField] === entity.id;
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
        'value': ae.id,
        'selected': goog.array.findIndex(adminIDs, function(adminID) {
          return ae.id === adminID;
        }) >= 0
      });
      select.options.add(opt);
    });
    goog.dom.appendChild(parent, select);
    return select;
  };
  return renderer;
};


/**
 * @param {function(!Object,!Array.<!Object>):!Array.<!Object>} filter The
 *    filter to apply to the list entity.  This function takes the current
 *    entity and the list of unfiltered entities, this function needs to then
 *    return the filtered (and optionally resorted) entity list to display
 *    in the default select control.
 * @return {!pn.ui.edit.FieldSpec.Renderer} The many to many list box renderer.
 */
pn.ui.edit.FieldRenderers.createFilteredEntityParentList =
    function(filter) {
  var renderer = function(fctx, parent, entity) {
    var defaultImpl = pn.ui.edit.FieldRenderers.entityParentListField;
    return defaultImpl(fctx, parent, entity, filter);
  };
  return renderer;
};
