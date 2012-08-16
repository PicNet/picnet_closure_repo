;
goog.provide('pn.ui.grid.ColumnCtx');

goog.require('goog.date.Date');
goog.require('pn.ui.edit.EditUtils');
goog.require('pn.ui.edit.FieldRenderers');
goog.require('pn.ui.grid.ColumnRenderers');
goog.require('pn.ui.grid.ColumnSpec');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.ui.grid.ColumnSpec} spec The field specifications.
 * @param {!Object.<!Array.<!Object>>} cache The current cache.
 */
pn.ui.grid.ColumnCtx = function(spec, cache) {
  goog.asserts.assert(spec);
  goog.asserts.assert(cache);

  goog.Disposable.call(this);

  /** @type {!pn.ui.grid.ColumnSpec} */
  this.spec = spec;
  this.registerDisposable(this.spec);

  /** @type {!Object.<!Array.<!Object>>} */
  this.cache = cache;

  /** @type {!string} */
  this.id = spec.id;

  /** @type {!pn.ui.UiSpec} */
  this.entitySpec = spec.entitySpec;

  /** @type {pn.schema.FieldSchema} */
  this.schema = pn.app.ctx.schema.getFieldSchema(spec);
};
goog.inherits(pn.ui.grid.ColumnCtx, goog.Disposable);


/**
 * @return {pn.ui.grid.ColumnSpec} A config object for a slick grid column.
 */
pn.ui.grid.ColumnCtx.prototype.toSlick = function() {
  var cfg = this.spec.toSlick();
  var rnd = this.getColumnRenderer();
  cfg['formatter'] = rnd ? goog.bind(function(row, cell, value, col, item) {
    return rnd(this, item);
  }, this) : null;
  return cfg;
};


/**
 * @param {!Object} entity The entity being shown.
 * @return {*} The compareable value of this column, suitable for sorting, etc.
 */
pn.ui.grid.ColumnCtx.prototype.getCompareableValue = function(entity) {
  goog.asserts.assert(entity);

  if (this.spec.sortValueRenderer) {
    return this.spec.sortValueRenderer(this, entity);
  }

  var renderer = this.getColumnRenderer();
  var useRealValue =
      !renderer ||
      renderer === pn.ui.grid.ColumnRenderers.dateRenderer ||
      renderer === pn.ui.grid.ColumnRenderers.dateTimeRenderer ||
      renderer === pn.ui.grid.ColumnRenderers.centsRenderer;
  return useRealValue ? this.getEntityValue(entity) : renderer(this, entity);
};


/**
 * @param {Object} entity The entity's whose value we need.
 * @return {*} The value of  this field.
 */
pn.ui.grid.ColumnCtx.prototype.getEntityValue = function(entity) {
  goog.asserts.assert(entity);

  return entity[this.spec.dataProperty];
};


/**
 * @return {(pn.ui.grid.ColumnSpec.Renderer|null)} The specified
 *    column renderer or an implied renderer from the given column schema type.
 */
pn.ui.grid.ColumnCtx.prototype.getColumnRenderer = function() {
  if (goog.isDef(this.spec.renderer)) return this.spec.renderer;
  if (!this.schema) return null;
  return pn.app.ctx.cfg.defaultColumnRenderers[this.schema.type] ||
      (pn.data.EntityUtils.isParentProperty(this.spec.dataProperty) ?
          pn.ui.grid.ColumnRenderers.parentColumnRenderer : null);
};
