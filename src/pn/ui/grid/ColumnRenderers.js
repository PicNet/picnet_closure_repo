;
goog.provide('pn.ui.grid.ColumnRenderers');

goog.require('goog.string');
goog.require('pn.convert');
goog.require('pn.data.EntityUtils');
goog.require('pn.date');


/**
 * @param {!pn.ui.grid.ColumnCtx} cctx The context for the current column.
 * @param {!Object} entity The entity being displayed.
 * @return {string} The html value to display in this cell.
 */
pn.ui.grid.ColumnRenderers.yesNoBoolRenderer = function(cctx, entity) {
  return cctx.getEntityValue(entity) === true ? 'Y' : 'N';
};


/**
 * @param {!pn.ui.grid.ColumnCtx} cctx The context for the current column.
 * @param {!Object} entity The entity being displayed.
 * @return {string} The html value to display in this cell.
 */
pn.ui.grid.ColumnRenderers.dateRenderer = function(cctx, entity) {
  return pn.ui.grid.ColumnRenderers.dateOrTimeFormatRenderer_(
      cctx, pn.date.dateFormat, entity);
};


/**
 * @param {!pn.ui.grid.ColumnCtx} cctx The context for the current column.
 * @param {!Object} entity The entity being displayed.
 * @return {string} The html value to display in this cell.
 */
pn.ui.grid.ColumnRenderers.dateTimeRenderer = function(cctx, entity) {
  return pn.ui.grid.ColumnRenderers.dateOrTimeFormatRenderer_(
      cctx, pn.date.dateTimeFormat, entity);
};


/**
 * @private
 * @param {!pn.ui.grid.ColumnCtx} cctx The context for the current column.
 * @param {!goog.i18n.DateTimeFormat} formatter The formatter to use to format
 *    this time/date value;.
 * @param {!Object} entity The entity being displayed.
 * @return {string} The html value to display in this cell.
 */
pn.ui.grid.ColumnRenderers.dateOrTimeFormatRenderer_ =
    function(cctx, formatter, entity) {
  var val = cctx.getEntityValue(entity);
  if (val && goog.isNumber(val)) val = new Date(val);
  if (val && val.getFullYear() <= 1753) { val = null; }
  return val ? formatter.format(/** @type {Date} */ (val)) : '';
};


/**
 * @param {!pn.ui.grid.ColumnCtx} cctx The context for the current column.
 * @param {!Object} entity The entity being displayed.
 * @return {string} The html value to display in this cell.
 */
pn.ui.grid.ColumnRenderers.centsRenderer = function(cctx, entity) {
  var val = /** @type {number} */ (cctx.getEntityValue(entity));
  return pn.convert.centsToCurrency(val);
};


/**
 * @param {!pn.ui.grid.ColumnCtx} cctx The context for the current column.
 * @param {!Object} entity The entity being displayed.
 * @return {string} The html value to display in this cell.
 */
pn.ui.grid.ColumnRenderers.enumRenderer = function(cctx, entity) {
  var val = /** @type {number} */ (cctx.getEntityValue(entity));
  return pn.rr.dal.getEnumName(cctx.schema.type, val);
};


/**
 * @param {!pn.ui.grid.ColumnCtx} cctx The context for the current column.
 * @param {!Object} entity The entity being displayed.
 * @return {string} The html value to display in this cell.
 */
pn.ui.grid.ColumnRenderers.parentColumnRenderer = function(cctx, entity) {
  return (pn.data.EntityUtils.getEntityDisplayValue(
      cctx.cache, cctx.spec.displayPath, cctx.spec.entitySpec.type, entity) ||
          '').toString();
};


/**
 * This renderer is used to display a CSV cell of all entities related to
 *    the entity in this row.  This renderer cannot be used by simply setting
 *    the renderer property in the column it needs to be wrapped so that
 *    the parentField and opt_childType parameters are set. I.e:
 *  <code>
 *  this.createColumn('ParentChildEntities', cache, {
 *      renderer: function(f) {
 *       return pn.ui.grid.ColumnRenderers.entitiesCsvRenderer(f, 'ParentID');
 *     }
 *   })
 *  </code>
 *
 * @param {!pn.ui.grid.ColumnCtx} cctx The context for the current column.
 * @param {!string} parentField The child field used to match this
 *    entities children.
 * @param {!Object} entity The entity being displayed.
 * @return {string} The html value to display in this cell.
 */
pn.ui.grid.ColumnRenderers.entitiesCsvRenderer =
    function(cctx, parentField, entity) {
  goog.asserts.assert(entity);
  goog.asserts.assert(cctx.spec.id.indexOf('Entities') >= 0);

  return (pn.data.EntityUtils.getEntityDisplayValue(
      cctx.cache, cctx.spec.displayPath, cctx.spec.entitySpec.type,
      entity, parentField) || '').toString();
};
