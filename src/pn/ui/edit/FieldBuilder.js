;
goog.provide('pn.ui.edit.FieldBuilder');


/**
 * @param {!(Element|goog.ui.Component)} inp The input field.
 * @return {string} The value in the specified field.
 */
pn.ui.edit.FieldBuilder.getFieldValue = function(inp) {
  goog.asserts.assert(inp);
  if (inp.getDate) {
    var date = inp.getDate();
    return date ? date.getTime() : 0;
  }
  if (inp.getValue) { return inp.getValue(); }
  else if (inp.options) {
    var arr = [];
    goog.array.forEach(inp.options, function(o) {
      if (o.selected) { arr.push(o.value); }
    });
    return inp.multiple ? arr : arr[0];
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
pn.ui.edit.FieldBuilder.createAndAttachInput =
    function(field, parent, entity, cache, opt_search) {
  var val = entity ? entity[field.id] : '';
  var elem;
  if (field.renderer) {
    if (typeof (field.renderer) === 'object') {
      elem = field.renderer;
      field.renderer.initialise(val, entity, opt_search);
      elem.render(parent);
    } else {
      elem = field.renderer(val, parent, opt_search);
    }
  } else if (field.source)
    elem = pn.ui.edit.FieldBuilder.createParentEntitySelect_(
        field, val, parent, cache, opt_search);
  else if (field.table)
    elem = pn.ui.edit.FieldBuilder.createChildEntitiesSelectTable_(
        field, parent, entity, cache);
  else {
    elem = goog.dom.createDom('input',
        { 'id': field.id, 'type': 'text', 'value': val || '' });
    goog.dom.appendChild(parent, elem);
  }
  return elem;
};


/**
 * @private
 * @param {!pn.ui.edit.Field} field The field to create a dom tree for.
 * @param {number} id The ID of the current child entity (this).
 * @param {!Element} parent The parent to attach this input control to.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {boolean=} opt_search If this field is being created in search mode.
 * @return {!Element|!goog.ui.Component} The created dom element.
 */
pn.ui.edit.FieldBuilder.createParentEntitySelect_ =
    function(field, id, parent, cache, opt_search) {
  var relationship = field.source.split('.');
  var list = cache[relationship[0]];
  if (!list) throw new Error('Expected access to "' + relationship[0] +
      '" but could not be found in cache. Field: ' + goog.debug.expose(field));

  var opts = { 'id': field.id };
  if (opt_search === true) {
    opts['multiple'] = 'multiple';
    opts['rows'] = 2;
  }
  var select = goog.dom.createDom('select', opts);
  goog.dom.appendChild(select, goog.dom.createDom('option',
      {'value': '0' }, 'Select ' + field.name + ' ...'));
  goog.array.forEach(list, function(e) {
    var eid = e['ID'];
    var opts = {'value': eid};
    if (eid === id) { opts['selected'] = 'selected'; }
    goog.dom.appendChild(select,
        goog.dom.createDom('option', opts,
            e[relationship[1] || relationship[0] + 'Name']));
  });
  goog.dom.appendChild(parent, select);
  return select;
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
  goog.asserts.assert(entity['ID']);

  var parentId = entity['ID'];
  var relationship = field.table.split('.');
  var parentField = relationship[1];
  var list = cache[relationship[0]];
  if (!list) throw new Error('Expected access to "' + relationship[0] +
      '" but could not be found in cache. Field: ' + goog.debug.expose(field));
  var tableData = !parentId ? [] : goog.array.filter(list,
      function(c) { return c[parentField] === parentId; });

  var spec = pn.rcdb.Global.getSpec(relationship[0]);
  var cfg = spec.getGridConfig();

  var grid = new pn.ui.grid.Grid(tableData,
      spec.getGridColumns(), spec.getGridCommands(), cfg, cache);
  grid.decorate(parent);
  return grid;
};
