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
 * @param {string} id The id of this label/field.
 * @param {string=} opt_name The text for this label. The id is used
 *  if ommitted.
 * @param {string=} opt_clazz An optional class name.  Will use 'field' if
 *    not specified.
 * @return {!Element} The label element wrapped in a div.
 */
pn.ui.edit.FieldBuilder.getFieldLabel =
    function(id, opt_name, opt_clazz) {
  goog.asserts.assert(id);
  var clazz = (opt_clazz || 'field');
  return goog.dom.createDom('div', {'id': id, 'class': clazz},
      goog.dom.createDom('label', { 'for': id }, opt_name || id));
};


/**
 * @param {!(Element|goog.ui.Component)} inp The input field.
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
 * @param {!pn.ui.edit.Field} field The field to create a dom tree for.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {!Object} entity The entity being displayed.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @return {!(Element|goog.ui.Component|Text)} The created dom element.
 */
pn.ui.edit.FieldBuilder.createAndAttach =
    function(field, parent, entity, cache) {
  var fb = pn.ui.edit.FieldBuilder;
  var val = fb.transEntityToFieldValue(field, entity, cache);
  var elem;
  if (field.renderer) {
    if (field.displayPath) {
      var path = field.displayPath;
      val = pn.data.EntityUtils.getEntityDisplayValue(
          cache, path, entity, field.tableParentField);
    }
    if (typeof (field.renderer) === 'object') { // Complex Renderer
      elem = field.renderer;
      field.renderer.initialise(val, entity, cache, field);
      elem.decorate(parent);
    } else {
      elem = field.renderer(val, entity, parent, cache);
    }
  } else if (pn.data.EntityUtils.isParentProperty(field.dataProperty) &&
      !field.tableType) {
    elem = field.readonly ?
        fb.createReadOnlyParentEntitySelect_(field, cache, entity) :
        fb.createParentEntitySelect_(field, cache, /** @type {number} */ (val));
    goog.dom.appendChild(parent, /** @type {!Node} */ (elem));
  } else if (field.tableType) {
    elem = fb.createChildEntitiesSelectTable_(field, parent, entity, cache);
  } else {
    val = goog.isDef(val) ? val : '';
    elem = goog.dom.createDom('input', { 'type': 'text', 'value': val});
    goog.dom.appendChild(parent, elem);
  }
  return elem;
};


/**
 * @param {!pn.ui.edit.Field} field The field spec to determine the field UI
 *    control appropriate value for.
 * @param {!Object} entity The entity being displayed.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @return {*} The UI control appropriate value.
 */
pn.ui.edit.FieldBuilder.transEntityToFieldValue =
    function(field, entity, cache) {
  var prop = field.dataProperty;
  var useDefault = pn.data.EntityUtils.isNew(entity) &&
      goog.isDef(field.defaultValue);
  var val = useDefault ? field.defaultValue : entity[prop];
  if (useDefault && pn.data.EntityUtils.isParentProperty(prop)) {
    var type = pn.data.EntityUtils.getTypeProperty(prop);
    var list = cache[type];
    val = goog.array.find(list, function(e) {
      return e[type + 'Name'] === field.defaultValue;
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
 * @param {!pn.ui.BaseField} field The field/column to create a
 *    dom tree for.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {number} val The selected value.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createParentEntitySelect_ =
    function(field, cache, val) {
  var steps = field.displayPath.split('.');
  var entityType = pn.data.EntityUtils.getTypeProperty(field.dataProperty);

  var list = cache[entityType];
  if (!list) throw new Error('Expected access to "' + entityType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(field));
  var selTxt = 'Select ' + field.name + ' ...';
  steps.shift();
  var path = steps.join('.');
  list = goog.array.map(list, function(e) {
    return {
      'ID': e['ID'],
      'Name': pn.data.EntityUtils.getEntityDisplayValue(cache, path, e)
    };
  });
  return pn.ui.edit.FieldBuilder.createDropDownList(selTxt, list, val);
};


/**
 * @param {!pn.ui.BaseField} field The field/column to create a
 *    dom tree for.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createSearchParentFilter =
    function(field, cache) {
  var sel = pn.ui.edit.FieldBuilder.
      createParentEntitySelect_(field, cache, 0);
  sel.setAttribute('multiple', 'multiple');
  sel.setAttribute('rows', 2);
  return sel;
};


/**
 * @private
 * @param {!pn.ui.BaseField} field The field/column to create a
 *    dom tree for.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {!Object} entity The current entity.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createReadOnlyParentEntitySelect_ =
    function(field, cache, entity) {
  var path = field.displayPath;
  var val = pn.data.EntityUtils.
      getEntityDisplayValue(cache, path, entity) || '';

  var div = goog.dom.createDom('div', 'field', val.toString());
  div.value = entity[path.split('.')[0]];
  return div;
};


/**
 * @param {string} selectTxt The message to display in the first element of the
 *    list.
 * @param {!Array.<Object>} list The list of entities.
 * @param {*} selValue The selected value in the 'ID' field.
 * @return {!Element} The select box.
 */
pn.ui.edit.FieldBuilder.createDropDownList =
    function(selectTxt, list, selValue) {
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
  goog.array.sortObjectsByKey(options, 'innerHTML',
      goog.string.caseInsensitiveCompare);
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
 * @param {!pn.ui.edit.Field} field The field to create a dom tree for.
 * @param {!Element} parent The parent to attach this input control to.
 * @param {Object} entity The entity being displayed.  Cannot be null.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @return {!Element|!goog.ui.Component} The created dom element.
 */
pn.ui.edit.FieldBuilder.createChildEntitiesSelectTable_ =
    function(field, parent, entity, cache) {
  goog.asserts.assert(entity);
  goog.asserts.assert(field.tableType);
  goog.asserts.assert(entity['ID'] != 0);

  var parentId = entity['ID'];

  var parentField = field.tableParentField;
  var list = cache[field.tableType];
  if (!list) list = cache[goog.string.remove(field['id'], 'Entities')];
  if (!list) throw new Error('Expected access to "' + field.tableType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(field));
  var data = !parentId ? [] : goog.array.filter(list,
      function(c) { return c[parentField] === parentId; });
  var spec = pn.app.ctx.specs.get(field.tableSpec);
  var g = new pn.ui.grid.Grid(spec, data, cache);
  g.decorate(parent);
  return g;
};
