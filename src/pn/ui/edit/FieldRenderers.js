;
goog.require('goog.date.DateTime');
goog.require('pn.convert');
goog.require('pn.date');
goog.require('pn.ui.InputDatePicker');

goog.provide('pn.ui.edit.FieldRenderers');


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being edited.
 * @return {!goog.ui.Component} The date control.
 */
pn.ui.edit.FieldRenderers.dateRenderer = function(fctx, parent, entity) {
  var val = fctx.getEntityValue(entity);
  var dt = null;
  if (goog.isNumber(val)) {
    dt = pn.date.fromMillis(val);
  } else if (val instanceof goog.date.DateTime) {
    dt = val;
  } else if (val instanceof Date) {
    dt = pn.date.fromDate(/** @type {Date} */ (val));
  }
  var idp = new pn.ui.InputDatePicker(
      pn.date.dateFormat, pn.date.dateParser, 'DD/MMM/YYYY');
  idp.decorate(parent);
  idp.setDate(dt);

  // Fixes any dirty issues with date renderers
  entity[fctx.id] = idp.getDate();
  return idp;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being edited.
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
 * @param {!pn.data.Entity} entity The entity being edited.
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
 * @param {!pn.data.Entity} entity The entity being edited.
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
 * @param {!pn.data.Entity} entity The entity being edited.
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
 * @param {!Element} p The parent to attach this control to.
 * @param {!pn.data.Entity} en The entity being edited.
 * @param {Array.<string>?=} opt_lbls The true false labels (default 'No',
 *    'Yes' [ORDER MATTERS]).
 * @return {!Element} The checkbox control.
 */
pn.ui.edit.FieldRenderers.boolRadioRenderer = function(fctx, p, en, opt_lbls) {
  var lst = [
    {id: fctx.id, name: opt_lbls ? opt_lbls[0] : 'No', value: false},
    {id: fctx.id, name: opt_lbls ? opt_lbls[1] : 'Yes', value: true}
  ],
      selected = fctx.getEntityValue(en);
  return pn.ui.edit.FieldRenderers.createRadioGroup_(lst, p, selected,
      function(s) { return s === 'true'; });
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being edited.
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
  sel.getValue = function() {
    return sel.value === '0' ? null : sel.value === 'true';
  };
  goog.dom.appendChild(parent, sel);
  return sel;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being edited.
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
 * @param {!pn.data.Entity} entity The entity being edited.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.textAreaRenderer = function(fctx, parent, entity) {
  var value = fctx.spec.additionalProperties.clearOnLoad ?
      '' : (fctx.getEntityValue(entity) || '');
  if (fctx.spec.additionalProperties.clearOnLoad) { entity[fctx.id] = ''; }
  var textarea = goog.dom.createDom('textarea', {
    'rows': '5',
    'cols': '34' ,
    'value': value
  });
  textarea.setValue = function(val) {
    // This hack is needed because IEs display null when null is passed in.
    textarea.value = val || '';
  };
  goog.dom.append(parent, textarea);
  return textarea;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being edited.
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
 * @param {!pn.data.Entity} entity The entity being edited.
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
 * @param {!pn.data.Entity} entity The entity being edited.
 * @return {!Element} The select control.
 */
pn.ui.edit.FieldRenderers.enumRenderer = function(fctx, parent, entity) {
  var txt = 'Select...';
  var lst = [];

  var enumo = /** @type {Object.<number>} */ (fctx.schema.entityType);
  goog.object.forEach(enumo, function(val, name) {
    if (goog.isNumber(val)) {
      lst.push({
        id: val,
        name: name.replace(/_/g, ' ')
      });
    }
  });
  lst.pnsortObjectsByKey('name');

  var selected = /** @type {number} */ (fctx.getEntityValue(entity));
  var select = pn.ui.edit.FieldRenderers.createDropDownList_(
      fctx, txt, lst, selected, -1);
  select.origgetv = select.getValue;
  select.getValue = function() {
    var v = select.origgetv();
    return v === -1 ? undefined : v;
  };
  goog.dom.appendChild(parent, select);
  return select;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being edited.
 * @return {!Element} The select control.
 */
pn.ui.edit.FieldRenderers.enumRadioRenderer = function(fctx, parent, entity) {
  var lst = [],
      enumo = /** @type {Object.<number>} */ (fctx.schema.entityType);
  goog.object.forEach(enumo, function(val, name) {
    if (goog.isNumber(val)) lst.push({
      id: fctx.id,
      value: val,
      name: name.replace(/_/g, ' ')
    });
  });
  var selected = /** @type {number} */ (fctx.getEntityValue(entity));
  return pn.ui.edit.FieldRenderers.createRadioGroup_(lst, parent, selected,
      function(s) { return parseInt(s, 10); });
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being edited.
 * @return {!Element} The textarea control.
 */
pn.ui.edit.FieldRenderers.orderFieldRenderer = function(fctx, parent, entity) {
  var order = pn.data.EntityUtils.isNew(entity) ?
      fctx.cache.get(fctx.entitySpec.type).length :
      fctx.getEntityValue(entity);
  var inp = goog.dom.createDom('input', {
    'type': 'hidden',
    'value': order.toString()
  });
  goog.style.showElement(parent, false);
  goog.dom.appendChild(parent, inp);
  inp.getValue = function() { return parseInt(inp.value, 10); };
  return inp;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {!Element} parent The parent to attach this control to.
 * @param {!pn.data.Entity} entity The entity being edited.
 * @param {function(!pn.data.Entity,!Array.<!pn.data.Entity>):
 *    !Array.<!pn.data.Entity>=} opt_filter The filter to apply to the list
 *    entity.  This function takes the current entity and the list of
 *    unfiltered entities, this function needs to then return the filtered
 *    (and optionally resorted) entity list to display in the default
 *    select control.
 * @return {!Element} The parent select list.
 */
pn.ui.edit.FieldRenderers.entityParentListField =
    function(fctx, parent, entity, opt_filter) {
  var steps = fctx.spec.displayPath.split('.');
  var cascading = !!fctx.spec.tableType;
  var entityType = /** @type {string} */ (cascading ?
      fctx.spec.tableType :
      pn.data.EntityUtils.getTypeProperty(
          fctx.spec.entitySpec.type, fctx.spec.dataProperty)),
      current = /** @type {number} */ (fctx.getEntityValue(entity));

  var list = fctx.cache.get(entityType);
  if (!list) throw new Error('Expected access to "' + entityType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(fctx));
  list = list.pnfilter(function(e) {
    return e.id === current || !goog.isDef(e.IsActive) || !!e.IsActive;
  });
  if (opt_filter) list = opt_filter(entity, list);

  pn.data.EntityUtils.orderEntities(entityType, list);

  var selTxt = 'Select ' + fctx.spec.name + ' ...';
  steps.shift();
  var namePath = cascading ? entityType + 'Name' : steps.join('.');
  list = list.pnmap(function(e) {
    return {
      id: e.id,
      name: pn.data.EntityUtils.getEntityDisplayValue(
          fctx.cache, namePath, fctx.spec.entitySpec.type, e)
    };
  });
  var select = pn.ui.edit.FieldRenderers.createDropDownList_(
      fctx, selTxt, list, current);
  goog.dom.appendChild(parent, select);
  return select;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a dom tree for.
 * @param {!Element} parent The parent to attach to.
 * @param {!pn.data.Entity} entity The entity being edited.
 * @return {!Element|!goog.ui.Component} The created dom element.
 */
pn.ui.edit.FieldRenderers.childEntitiesTableRenderer =
    function(fctx, parent, entity) {
  pn.ass(fctx.spec.tableType);
  pn.ass(entity.id != 0);

  var parentId = entity.id,
      parentField = fctx.spec.tableParentField,
      list = fctx.cache.get(/** @type {string} */ (fctx.spec.tableType));
  if (!list) list = fctx.cache.get(goog.string.remove(fctx.id, 'Entities'));
  if (!list) throw new Error('Expected access to "' + fctx.spec.tableType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(fctx));
  var data = !parentId ? [] : list.pnfilter(
      function(c) { return c[parentField] === parentId; }),
      spec = pn.web.ctx.specs.get(/** @type {string} */ (fctx.spec.tableSpec)),
      cfg = spec.getGridConfig(fctx.cache),
      g = new pn.ui.grid.Grid(cfg, data, fctx.cache);
  goog.dispose(spec);
  var container = goog.dom.createDom('div', {
    'class': 'child-grid-container',
    'style': 'width:' + $(parent).width() + 'px'
  });
  goog.dom.appendChild(parent, container);
  g.decorate(container);
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
    var manyToManys = fctx.cache.get(mappingEntity).pnfilter(
        function(manyToMany) {
          return manyToMany[parentIdField] === entity.id;
        });
    var adminIDs = manyToManys.pnmap(function(mm) {
      return mm[adminEntity + 'ID'];
    });

    // Setting the value in the dataProperty of the fctx so that dirty
    // checking handles fctxs with many to many lists.
    entity[mappingEntity + 'Entities'] = adminIDs;

    var select = goog.dom.createDom('select', {'multiple': 'multiple'});
    fctx.cache.get(adminEntity).pnforEach(function(ae) {
      var text = opt_displayStrategy ?
          opt_displayStrategy(ae) :
          ae[adminEntity + 'Name'];
      var opt = goog.dom.createDom('option', {
        'text': text,
        'value': ae.id,
        'selected': adminIDs.pnfindIndex(function(adminID) {
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


/**
 * @private
 * @param {!pn.ui.edit.FieldCtx} fctx The field to render.
 * @param {string} selectTxt The message to display in the first element of the
 *    list.
 * @param {!Array.<{ID:number, Name: string}>} list The list of entities
 *    (requires an ID and Name field).
 * @param {number} selValue The selected value in the 'ID' field.
 * @param {number=} opt_noneId The ID to give to the 'Select...' entry.
 * @return {!Element} The select box.
 */
pn.ui.edit.FieldRenderers.createDropDownList_ =
    function(fctx, selectTxt, list, selValue, opt_noneId) {
  pn.ass(!selectTxt || goog.isString(selectTxt));
  pn.assArr(list);
  pn.ass(!goog.isDef(selValue) || goog.isNumber(selValue),
      'Not supported: ' + selValue);
  pn.ass(!goog.isDef(opt_noneId) || goog.isNumber(opt_noneId),
      'Not supported: ' + opt_noneId);

  var select = goog.dom.createDom('select');

  // TODO: This shoudl really be another class that delegates to a HtmlSelect

  /** @return {number} The selected ID. */
  select.getValue = function() { return parseInt(select.value, 10); };

  if (fctx.spec.additionalProperties.list) {
    list = fctx.spec.additionalProperties.list();
  }

  /** @param {number=} opt_selectedid The optional selected id. */
  select.refresh = function(opt_selectedid) {
    goog.dom.removeChildren(select);
    if (selectTxt) {
      goog.dom.appendChild(select, goog.dom.createDom('option',
          {'value': goog.isDef(opt_noneId) ? opt_noneId.toString() : '0' },
          selectTxt));
    }

    var selected = opt_selectedid ? opt_selectedid :
        goog.isDef(selValue) ? selValue :
            select.getValue() ? select.getValue() :
                opt_noneId ? opt_noneId : 0;
    list.pnforEach(function(e) {
      var opts = {'value': e.id};
      if (e.id === selected) { opts['selected'] = 'selected'; }

      var txt = e.name ? e.name.toString() : '';
      pn.ass(txt !== undefined);

      if (txt) {
        var option = goog.dom.createDom('option', opts, txt);
        goog.dom.appendChild(select, option);
      }
    });
  };
  select.refresh();
  return select;
};


/**
 * @private
 * @param {!Array.<{id:*,name:string,value:*}>} lst The list of options.
 * @param {!Element} parent The parent to attach this control to.
 * @param {*} selected The selected item;.
 * @param {function(*):*=} opt_valParser A parser to turn the string value of
 *    the radio control into a more appropriate type.
 * @return {!Element} The radio group container control.
 */
pn.ui.edit.FieldRenderers.createRadioGroup_ =
    function(lst, parent, selected, opt_valParser) {
  pn.assArr(lst);
  pn.assObj(parent);

  var container = pn.dom.create('div', 'radiogroup'),
      inputs = [];

  lst.pnforEach(function(opt, i) {
    pn.assStr(opt.name);
    pn.assDef(opt.id);
    pn.assDef(opt.value);

    var input = pn.dom.create('input', {
      'type': 'radio',
      'id': opt.id + '_' + i,
      'name': opt.id,
      'value': opt.value
    }),
        label = pn.dom.create('label', { 'for': opt.id }, opt.name);
    inputs.push(input);
    goog.dom.appendChild(container, input);
    goog.dom.appendChild(container, label);
  });

  container.setValue = function(val) {
    var vals = val.toString();
    inputs.
        pnfind(function(inp) { return inp.value === vals; }).
        checked = 'checked';
  };
  container.getValue = function() {
    var inp = inputs.pnfind(function(inp2) { return !!inp2.checked; });
    return !!inp ?
        (opt_valParser ? opt_valParser(inp.value) : inp.value) :
        undefined;
  };
  if (goog.isDef(selected)) { container.setValue(selected); }
  container.setEnabled = function(enabled) {
    inputs.pnforEach(function(inp) {
      inp['disabled'] = (enabled ? '' : 'disabled');
    });
  };

  goog.dom.appendChild(parent, container);
  return container;
};
