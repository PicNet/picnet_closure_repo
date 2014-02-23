;
goog.provide('pn.ui.UiSpecHelper');

goog.require('pn.ui.edit.FieldCtx');
goog.require('pn.ui.edit.FieldSpec');
goog.require('pn.ui.grid.ColumnCtx');
goog.require('pn.ui.grid.ColumnSpec');
goog.require('pn.ui.grid.OrderingColumnSpec');


/**
 * @param {!pn.ui.UiSpec} uispec The spec being built.
 * @param {string} id The id representing the column.
 * @param {!pn.data.BaseDalCache} cache The current context cache.
 * @param {Object=} opt_props Any additional properties for the column.
 * @return {!pn.ui.grid.ColumnCtx} The created column.
 */
pn.ui.UiSpecHelper.createColumn = function(uispec, id, cache, opt_props) {
  pn.assInst(uispec, pn.ui.UiSpec);
  pn.assStr(id);
  pn.assInst(cache, pn.data.BaseDalCache);

  var spec = new pn.ui.grid.ColumnSpec(id, opt_props || {}, uispec);
  uispec.registerDisposable(spec);
  var fctx = new pn.ui.grid.ColumnCtx(spec, cache);
  uispec.registerDisposable(fctx);

  return fctx;
};


/**
 * @param {!pn.ui.UiSpec} uispec The spec being built.
 * @param {string} id The id representing the ordering column.
 * @param {!pn.data.BaseDalCache} cache The current context cache.
 * @return {!pn.ui.grid.ColumnCtx} The created column.
 */
pn.ui.UiSpecHelper.createOrderingColumn = function(uispec, id, cache) {
  pn.assInst(uispec, pn.ui.UiSpec);
  pn.assStr(id);
  pn.assInst(cache, pn.data.BaseDalCache);

  var spec = new pn.ui.grid.OrderingColumnSpec(id, uispec);
  uispec.registerDisposable(spec);
  var fctx = new pn.ui.grid.ColumnCtx(spec, cache);
  uispec.registerDisposable(fctx);

  return fctx;
};


/**
 * @param {!pn.ui.UiSpec} uispec The spec being built.
 * @param {string} id The id representing the field.
 * @param {!pn.data.BaseDalCache} cache The current context cache.
 * @param {Object=} opt_props Any additional properties for the field.
 * @return {!pn.ui.edit.FieldCtx} The field created.
 */
pn.ui.UiSpecHelper.createField = function(uispec, id, cache, opt_props) {
  pn.assInst(uispec, pn.ui.UiSpec);
  pn.assStr(id);
  pn.assInst(cache, pn.data.BaseDalCache);

  var spec = new pn.ui.edit.FieldSpec(id, opt_props || {}, uispec,
      pn.app.ctx.cfg.defaultRendererCreator());
  uispec.registerDisposable(spec);
  var fctx = new pn.ui.edit.FieldCtx(spec, cache);
  uispec.registerDisposable(fctx);

  // HACK: This is not nice, but complex renderers do really need the fctx.
  if (spec.renderer instanceof pn.ui.edit.ComplexRenderer) {
    spec.renderer.fctx = fctx;
  }

  return fctx;
};
