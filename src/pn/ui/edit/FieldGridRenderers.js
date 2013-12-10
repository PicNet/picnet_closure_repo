
goog.provide('pn.ui.edit.FieldGridRenderers');

goog.require('pn.ui.grid.Grid');

/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a dom tree for.
 * @param {!Element} parent The parent to attach to.
 * @param {!pn.data.Entity} entity The entity being edited.
 * @return {!Element|!goog.ui.Component} The created dom element.
 */
pn.ui.edit.FieldGridRenderers.childEntitiesTableRenderer =
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
      function(c) { return c.getValue(parentField) === parentId; }),
      spec = pn.app.ctx.specs.get(/** @type {string} */ (fctx.spec.tableSpec)),
      cfg = spec.getGridConfig(fctx.cache),
      g = new pn.ui.grid.Grid(cfg, data, fctx.cache);
  g.registerDisposable(spec);
  var container = goog.dom.createDom('div', {
    'class': 'child-grid-container',
    'style': 'width:' + $(parent).width() + 'px'
  });
  goog.dom.appendChild(parent, container);
  g.decorate(container);
  return g;
};

