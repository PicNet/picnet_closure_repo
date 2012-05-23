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
 * @param {!pn.ui.FieldCtx} field The field to create a label for.
 * @return {!Element} The label element wrapped in a div.
 */
pn.ui.edit.FieldBuilder.getFieldLabel = function(field) {
  var className = (field.spec.className || 'field');
  var id = field.id;
  return goog.dom.createDom('div', {'id': id, 'class': className},
      goog.dom.createDom('label', { 'for': id }, field.spec.name || id));
};


/**
 * @param {Element|goog.ui.Component} inp The input field.
 * @return {string} The value in the specified field.
 */
pn.ui.edit.FieldBuilder.getFieldValue = function(inp) {
  goog.asserts.assert(inp);

  if (inp.getDate) {
    var d = inp.getDate();
    if (d) d = new goog.date.Date(d.getYear(), d.getMonth(), d.getDate());
    return d ? d.getTime() : 0;
  }
  if (inp.getValue) { return inp.getValue(); }
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
 * @param {!pn.ui.FieldCtx} field The field to create a dom tree for.
 * @return {Element|goog.ui.Component|Text} The created dom element.
 */
pn.ui.edit.FieldBuilder.createAndAttach = function(field) {
  var fb = pn.ui.edit.FieldBuilder;
  var elem;
  if (field.spec.renderer) {
    if (typeof (field.spec.renderer) === 'object') { // Complex Renderer
      elem = field.spec.renderer;
      field.spec.renderer.initialise(field);
      elem.decorate(field.parentComponent);
    } else {
      elem = field.spec.renderer(field);
    }
  } else if (pn.data.EntityUtils.isParentProperty(field.spec.dataProperty) &&
      !field.spec.tableType) {
    elem = field.spec.readonly ?
        fb.createReadOnlyParentEntitySelect_(field) :
        fb.createParentEntitySelect_(field);
    goog.dom.appendChild(field.parentComponent, /** @type {!Node} */ (elem));
  } else if (field.tableType) {
    elem = fb.createChildEntitiesSelectTable_(field);
  } else {
    var val = field.getEntityValue() || '';
    elem = goog.dom.createDom('input', { 'type': 'text', 'value': val});
    goog.dom.appendChild(field.parentComponent, elem);
  }
  return elem;
};


/**
 * @param {!pn.ui.FieldCtx} field The field spec to determine the field UI
 *    control appropriate value for.
 * @return {*} The UI control appropriate value.
 */
pn.ui.edit.FieldBuilder.transEntityToFieldValue = function(field) {
  var prop = field.spec.dataProperty;
  var useDefault = pn.data.EntityUtils.isNew(field.entity) &&
      goog.isDef(field.spec.defaultValue);
  var val = useDefault ? field.spec.defaultValue : field.entity[prop];
  if (useDefault && pn.data.EntityUtils.isParentProperty(prop)) {
    var type = pn.data.EntityUtils.getTypeProperty(prop);
    var list = field.cache[type];
    val = goog.array.find(list, function(e) {
      return e[type + 'Name'] === field.spec.defaultValue;
    })['ID'];
  }
  if (goog.string.endsWith(prop, 'Entities') && val && val.length) {
    // Controls always return sorted IDs so here we ensure we never throw a
    // dirty error if for somereason the original value is not sorted.
    val.sort();
  }
  return val;
};


/**
 * @private
 * @param {!pn.ui.FieldCtx} field The field/column to create a dom tree.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createParentEntitySelect_ = function(field) {
  var steps = field.spec.displayPath.split('.');
  var entityType = pn.data.EntityUtils.getTypeProperty(field.spec.dataProperty);

  var list = field.cache[entityType];
  if (!list) throw new Error('Expected access to "' + entityType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(field));
  var selTxt = 'Select ' + field.spec.name + ' ...';
  steps.shift();
  var path = steps.join('.');
  list = goog.array.map(list, function(e) {
    return {
      'ID': e['ID'],
      'Name': pn.data.EntityUtils.getEntityDisplayValue(field.cache, path, e)
    };
  });
  var sort = field.spec.additionalProperties.sortedValues;
  if (!goog.isDef(sort)) sort = true;
  return pn.ui.edit.FieldBuilder.createDropDownList_(
      selTxt, list, field.getEntityValue(), sort);
};


/**
 * @param {!pn.ui.FieldCtx} field The field/column to create a
 *    dom tree for.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createSearchParentFilter = function(field) {
  var sel = pn.ui.edit.FieldBuilder.createParentEntitySelect_(field);
  sel.setAttribute('multiple', 'multiple');
  sel.setAttribute('rows', 2);
  return sel;
};


/**
 * @private
 * @param {!pn.ui.FieldCtx} field The field to create parent select.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createReadOnlyParentEntitySelect_ = function(field) {
  var path = field.spec.displayPath;
  var val = pn.data.EntityUtils.
      getEntityDisplayValue(field.cache, path, field.entity) || '';

  var div = goog.dom.createDom('div', 'field', val.toString());
  div.value = field.entity[path.split('.')[0]];
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
 * @param {!pn.ui.FieldCtx} field The field to create a dom tree for.
 * @return {!Element|!goog.ui.Component} The created dom element.
 */
pn.ui.edit.FieldBuilder.createChildEntitiesSelectTable_ = function(field) {
  goog.asserts.assert(field.spec.tableType);
  goog.asserts.assert(field.entity['ID'] != 0);

  var parentId = field.entity['ID'];

  var parentField = field.spec.tableParentField;
  var list = field.cache[field.spec.tableType];
  if (!list) list = field.cache[goog.string.remove(field['id'], 'Entities')];
  if (!list) throw new Error('Expected access to "' + field.spec.tableType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(field));
  var data = !parentId ? [] : goog.array.filter(list,
      function(c) { return c[parentField] === parentId; });
  var spec = pn.app.ctx.specs.get(field.spec.tableSpec);
  var g = new pn.ui.grid.Grid(spec, data, field.cache);
  g.decorate(field.parentComponent);
  return g;
};
