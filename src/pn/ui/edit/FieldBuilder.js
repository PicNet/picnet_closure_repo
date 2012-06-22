;
goog.provide('pn.ui.edit.FieldBuilder');

goog.require('goog.date.Date');
goog.require('goog.events.EventHandler');
goog.require('goog.string');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('pn.ui.UiSpecsRegister');
goog.require('pn.ui.grid.Grid');


/**
 * @param {!pn.ui.FieldCtx} fctx The field to create a label for.
 * @return {!Element} The label element wrapped in a div.
 */
pn.ui.edit.FieldBuilder.getFieldLabel = function(fctx) {
  var className = (fctx.spec.className || 'field');
  var id = fctx.id;
  return goog.dom.createDom('div', {'id': id, 'class': className},
      goog.dom.createDom('label', { 'for': id }, fctx.spec.name || id));
};


/**
 * @param {Element|goog.ui.Component} inp The input field.
 * @param {Object=} opt_target The optional 'entity' target to inject values
 *    into if required.
 * @return {string} The value in the specified field.
 */
pn.ui.edit.FieldBuilder.getFieldValue = function(inp, opt_target) {
  goog.asserts.assert(inp);

  if (inp.getValue) { return inp.getValue(opt_target); }
  else if (inp.options) {
    var arr = [];
    goog.array.forEach(inp.options, function(o) {
      if (o.selected) { arr.push(o.value); }
    });
    return inp.multiple && arr.length > 1 ? arr : arr[0];
  }
  else if (inp.type === 'checkbox') { return inp.checked; }
  else { return inp.value; }
};


/**
 * @param {!pn.ui.FieldCtx} fctx The field to create a dom tree for.
 * @param {!Element} parent The parent control to attach this control to.
 * @param {!Object} entity The entity being edited.
 * @return {Element|goog.ui.Component|Text} The created dom element.
 */
pn.ui.edit.FieldBuilder.createAndAttach = function(fctx, parent, entity) {
  var fb = pn.ui.edit.FieldBuilder;
  var elem;
  var renderer = fctx.getFieldRenderer();
  if (renderer) {
    if (renderer instanceof pn.ui.edit.ComplexRenderer) {
      elem = renderer;
      renderer.initialise(fctx, entity);
      elem.decorate(parent);
    } else {
      elem = renderer(fctx, parent, entity);
    }
  } else if (pn.data.EntityUtils.isParentProperty(fctx.spec.dataProperty) &&
      !fctx.spec.tableType) {
    elem = fctx.spec.readonly ?
        fb.createReadOnlyParentEntitySelect_(fctx, entity) :
        fb.createParentEntitySelect_(fctx, entity);
    goog.dom.appendChild(parent, /** @type {!Node} */ (elem));
  } else if (fctx.tableType) {
    elem = fb.createChildEntitiesSelectTable_(fctx, parent, entity);
  } else {
    var val = fctx.getEntityValue(entity) || '';
    elem = goog.dom.createDom('input', { 'type': 'text', 'value': val});
    goog.dom.appendChild(parent, elem);
  }
  return elem;
};


/**
 * @private
 * @param {!pn.ui.FieldCtx} fctx The field/column context to create a dom tree.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createParentEntitySelect_ = function(fctx, entity) {
  var steps = fctx.spec.displayPath.split('.');
  var cascading = !!fctx.spec.tableType;
  var entityType = cascading ?
      fctx.spec.tableType :
      pn.data.EntityUtils.getTypeProperty(fctx.spec.dataProperty);

  var list = fctx.cache[entityType];
  if (!list) throw new Error('Expected access to "' + entityType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(fctx));
  var selTxt = 'Select ' + fctx.spec.name + ' ...';
  steps.shift();
  var namePath = cascading ? entityType + 'Name' : steps.join('.');
  list = goog.array.map(list, function(e) {
    return {
      'ID': e['ID'],
      'Name': pn.data.EntityUtils.getEntityDisplayValue(fctx.cache, namePath, e)
    };
  });
  var sort = fctx.spec.additionalProperties['sortedValues'];
  if (!goog.isDef(sort)) sort = true;
  return pn.ui.edit.FieldBuilder.createDropDownList_(
      selTxt, list, fctx.getEntityValue(entity), sort);
};


/**
 * @param {!pn.ui.FieldCtx} fctx The field/column to create a dom tree for.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createSearchParentFilter = function(fctx) {
  var sel = pn.ui.edit.FieldBuilder.createParentEntitySelect_(fctx, {});
  sel.setAttribute('multiple', 'multiple');
  sel.setAttribute('rows', 2);
  return sel;
};


/**
 * @private
 * @param {!pn.ui.FieldCtx} fctx The field to create parent select.
 * @param {!Object} entity The entity being edited.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createReadOnlyParentEntitySelect_ =
    function(fctx, entity) {
  var path = fctx.spec.displayPath;
  var val = pn.data.EntityUtils.
      getEntityDisplayValue(fctx.cache, path, entity) || '';

  var div = goog.dom.createDom('div', 'field', val.toString());
  div.value = entity[path.split('.')[0]];
  return div;
};


/**
 * @private
 * @param {string} selectTxt The message to display in the first element of the
 *    list.
 * @param {!Array.<Object>} list The list of entities.
 * @param {*} selValue The selected value in the 'ID' field.
 * @param {boolean} sort Wether the list should display sorted.
 * @return {!Element} The select box.
 */
pn.ui.edit.FieldBuilder.createDropDownList_ =
    function(selectTxt, list, selValue, sort) {
  var select = goog.dom.createDom('select');
  if (selectTxt) {
    goog.dom.appendChild(select, goog.dom.createDom('option',
        {'value': '0' }, selectTxt));
  }
  var options = [];
  goog.array.forEach(list, function(e) {
    var opts = {'value': e['ID']};
    if (selValue && e['ID'] === selValue) { opts['selected'] = 'selected'; }
    var txt = e['Name'] ? e['Name'].toString() : '';
    goog.asserts.assert(txt !== undefined);
    if (txt) options.push(goog.dom.createDom('option', opts, txt));
  });
  if (sort) {
    goog.array.sortObjectsByKey(options, 'innerHTML',
        goog.string.caseInsensitiveCompare);
  }
  goog.array.forEach(options, function(o) {
    goog.dom.appendChild(select, o);
  });
  return select;
};


/**
 * @param {string} selectTxt The message to display in the first element of the
 *    list.
 * @param {!Array.<Object>} list The list of entities.
 * @param {string} txtf The text field property name.
 * @return {goog.ui.ComboBox} The select box.
 */
pn.ui.edit.FieldBuilder.createCombo = function(selectTxt, list, txtf) {
  goog.array.sortObjectsByKey(list, txtf,
      goog.string.caseInsensitiveCompare);
  var cb = new goog.ui.ComboBox();
  cb.setUseDropdownArrow(true);
  if (selectTxt) { cb.setDefaultText(selectTxt); }
  goog.array.forEach(list, function(e) {
    cb.addItem(new goog.ui.ComboBoxItem(e[txtf]));
  });
  return cb;
};


/**
 * @private
 * @param {!pn.ui.FieldCtx} fctx The field to create a dom tree for.
 * @param {!Element} parent The parent to attach to.
 * @param {!Object} entity The entity being edited.
 * @return {!Element|!goog.ui.Component} The created dom element.
 */
pn.ui.edit.FieldBuilder.createChildEntitiesSelectTable_ =
    function(fctx, parent, entity) {
  goog.asserts.assert(fctx.spec.tableType);
  goog.asserts.assert(entity['ID'] != 0);

  var parentId = entity['ID'];

  var parentField = fctx.spec.tableParentField;
  var list = fctx.cache[fctx.spec.tableType];
  if (!list) list = fctx.cache[goog.string.remove(fctx['id'], 'Entities')];
  if (!list) throw new Error('Expected access to "' + fctx.spec.tableType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(fctx));
  var data = !parentId ? [] : goog.array.filter(list,
      function(c) { return c[parentField] === parentId; });
  var spec = pn.app.ctx.specs.get(fctx.spec.tableSpec);
  var g = new pn.ui.grid.Grid(spec, data, fctx.cache);
  g.decorate(parent);
  return g;
};
