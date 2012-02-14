;
goog.provide('pn.ui.edit.FieldBuilder');

goog.require('goog.date.Date');
goog.require('goog.string');


/**
 * @param {string} id The id of this label/field.
 * @param {string} name The text for this label.
 * @param {string=} opt_clazz An optional class name.  Will use 'field' if
 *    not specified.
 * @return {!Element} The label element wrapped in a div.
 */
pn.ui.edit.FieldBuilder.getFieldLabel = function(id, name, opt_clazz) {
  var dom = goog.dom.createDom('div', { 'class' : opt_clazz || 'field' },
      goog.dom.createDom('label', { 'for': id }, name));
  return dom;
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
 * @param {Object} entity The entity being displayed.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element|!goog.ui.Component} The created dom element.
 */
pn.ui.edit.FieldBuilder.createAndAttach =
    function(field, parent, entity, cache, opt_search) {
  var fb = pn.ui.edit.FieldBuilder;
  var val = entity ? entity[field.dataColumn] : '';
  var elem;
  if (field.renderer) {
    if (field.source) { val = fb.getValueFromSourceTable_(field, val, cache); }
    if (typeof (field.renderer) === 'object') {
      elem = field.renderer;
      field.renderer.initialise(val, entity, cache, field, opt_search);
      elem.render(parent);
    } else {
      elem = field.renderer(val, entity, parent, opt_search);
    }
  } else if (field.source) {
    elem = fb.createParentEntitySelect(field, val, cache, opt_search);
    goog.dom.appendChild(parent, /** @type {!Node} */ (elem));
  } else if (field.table || field.readOnlyTable) {
    elem = fb.createChildEntitiesSelectTable_(field, parent, entity, cache);
  } else {
    elem = goog.dom.createDom('input',
        { 'id': field.id, 'type': 'text', 'value': val || '' });
    goog.dom.appendChild(parent, elem);
  }
  return elem;
};


/**
 * @param {!pn.ui.SpecDisplayItem} spec The field/column to create a
 *    dom tree for.
 * @param {number} id The ID of the current child entity (this).
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.FieldBuilder.createParentEntitySelect =
    function(spec, id, cache, opt_search) {
  var relationship = spec.source.split('.');
  if (relationship.length > 2 && id > 0) {
    throw new Error('Can only have embedded parent lists when in filter mode');
  }
  var entityType = relationship[
      relationship.length === 1 ? 0 : relationship.length - 2];
  var textField = relationship.length === 1 ?
      entityType + 'Name' : relationship[relationship.length - 1];
  var list = cache[entityType];
  if (spec.sourceFilter) { list = spec.sourceFilter(list, cache); }

  if (!list) throw new Error('Expected access to "' + entityType +
      '" but could not be found in cache. Field: ' + goog.debug.expose(spec));

  var opts = { 'id': spec.id };
  if (opt_search === true) {
    opts['multiple'] = 'multiple';
    opts['rows'] = 2;
  }
  var selTxt = 'Select ' + spec.name + ' ...';
  return pn.ui.edit.FieldBuilder.
      createDropDownList(selTxt, list, textField, 'ID', id, opts);
};


/**
 * @param {string} selectTxt The message to display in the first element of the
 *    list.
 * @param {!Array.<Object>} list The list of entities.
 * @param {string} txtf The text field property name.
 * @param {string} valf The value field property name.
 * @param {*} selValue The selected value in the valf field.
 * @param {!Object} opts The select list additional options.
 * @return {!Element} The select box.
 */
pn.ui.edit.FieldBuilder.createDropDownList =
    function(selectTxt, list, txtf, valf, selValue, opts) {
  var select = goog.dom.createDom('select', opts);
  if (selectTxt) {
    goog.dom.appendChild(select, goog.dom.createDom('option',
        {'value': '0' }, selectTxt));
  }
  var options = [];
  goog.array.forEach(list, function(e) {
    opts = {'value': e[valf]};
    if (selValue && e[valf] === selValue) { opts['selected'] = 'selected'; }
    var txt = e[txtf] ? e[txtf].toString() : null;
    goog.asserts.assert(txt !== undefined);
    options.push(goog.dom.createDom('option', opts, txt));
  });
  goog.array.sortObjectsByKey(options, 'innerHTML',
      goog.string.caseInsensitiveCompare);
  goog.array.forEach(options, function(o) {
    goog.dom.appendChild(select, o);
  });
  return select;
};


/**
 * @private
 * @param {!pn.ui.SpecDisplayItem} spec The field/column to create a
 *    dom tree for.
 * @param {number} id The ID of the current child entity (this).
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @return {string} The value from the selected parent eneity.
 */
pn.ui.edit.FieldBuilder.getValueFromSourceTable_ = function(spec, id, cache) {
  var relationship = spec.source.split('.');
  var list = cache[relationship[0]];
  if (!list) throw new Error('Expected access to "' + relationship[0] +
      '" but could not be found in cache. Field: ' + goog.debug.expose(spec));
  var source = goog.array.find(list, function(e) {
    return e['ID'] === id;
  });
  return !source ? 'n/a' : source[relationship[1] || relationship[0] + 'Name'];
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
  goog.asserts.assert(entity['ID'],
      'Cannot create child entity table for entities that have not been saved');
  var parentId = entity['ID'];
  var table = field.table || field.readOnlyTable;

  var relationship = table.split('.');
  var parentField = relationship[1];
  var list = cache[relationship[0]];
  if (!list) throw new Error('Expected access to "' + relationship[0] +
      '" but could not be found in cache. Field: ' + goog.debug.expose(field));
  var data = !parentId ? [] : goog.array.filter(list,
      function(c) { return c[parentField] === parentId; });
  var spec = pn.rcdb.Global.getSpec(relationship[0]);
  var g = pn.ui.edit.FieldBuilder.createGrid(spec, !field.table, data, cache);
  g.decorate(parent);
  return g;
};


/**
 * @param {!pn.rcdb.ui.specs.SpecsBase} spec The specs for the entities in
 *    this grid.
 * @param {boolean} readonly Wether this table is readonly.
 * @param {!Array.<Object>} data The grid data.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @return {!pn.ui.grid.Grid} The created grid.
 */
pn.ui.edit.FieldBuilder.createGrid = function(spec, readonly, data, cache) {
  var width = goog.style.getSize(
      goog.dom.getElement('view-container')).width - 25;
  var cfg = spec.getGridConfig(width);
  cfg.readonly = readonly;
  var cols = spec.getGridColumns();
  var commands = spec.getGridCommands();
  var grid = new pn.ui.grid.Grid(data, cols, commands, cfg, cache);
  return grid;
};
