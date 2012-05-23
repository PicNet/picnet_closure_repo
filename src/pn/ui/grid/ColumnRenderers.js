;
goog.provide('pn.ui.grid.ColumnRenderers');

goog.require('goog.string');
goog.require('pn.convert');
goog.require('pn.data.EntityUtils');
goog.require('pn.date');


/**
 * @param {!pn.ui.FieldCtx} field The field context for the current column.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.yesNoBoolRenderer = function(field) {
  return field.getEntityValue() === true ? 'Y' : 'N';
};


/**
 * @param {!pn.ui.FieldCtx} field The field context for the current column.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.dateRenderer = function(field) {
  return pn.ui.grid.ColumnRenderers.dateOrTimeFormatRenderer_(
      field, pn.date.dateFormat);
};


/**
 * @param {!pn.ui.FieldCtx} field The field context for the current column.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.dateTimeRenderer = function(field) {
  return pn.ui.grid.ColumnRenderers.dateOrTimeFormatRenderer_(
      field, pn.date.dateTimeFormat);
};


/**
 * @private
 * @param {!pn.ui.FieldCtx} field The field context for the current column.
 * @param {!goog.i18n.DateTimeFormat} formatter The formatter to use to format
 *    this time/date value;.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.dateOrTimeFormatRenderer_ =
    function(field, formatter) {
  var val = field.getEntityValue();
  if (val && goog.isNumber(val)) val = new Date(val);
  if (val && val.getFullYear() <= 1970) { val = null; }
  return val ? formatter.format(/** @type {Date} */ (val)) : '';
};


/**
 * @param {!pn.ui.FieldCtx} field The field context for the current column.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.centsRenderer = function(field) {
  var val = /** @type {number} */ (field.getEntityValue());
  return pn.convert.centsToCurrency(val);
};


/**
 * @param {!pn.ui.FieldCtx} field The field context for the current column.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.parentColumnRenderer = function(field) {

  return (pn.data.EntityUtils.getEntityDisplayValue(
      field.cache, field.spec.displayPath, field.entity) || '').toString();
};


/**
 * This renderer is used to display a CSV cell of all entities related to
 *    the entity in this row.  This renderer cannot be used by simply setting
 *    the renderer property in the column it needs to be wrapped so that
 *    the parentField and opt_childType parameters are set. I.e:
 *  <code>
 *  this.createColumn('ParentChildEntities', 'Children Label', {
 *      renderer: function(f) {
 *       return pn.ui.grid.ColumnRenderers.entitiesCsvRenderer(f, 'ParentID');
 *     }
 *   })
 *  </code>
 *
 * @param {!pn.ui.FieldCtx} field The field context for the current column.
 * @param {!string} parentField The child field used to match this
 *    entities children.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.entitiesCsvRenderer =
    function(field, parentField) {
  goog.asserts.assert(field.entity);
  goog.asserts.assert(field.spec.id.indexOf('Entities') >= 0);

  return (pn.data.EntityUtils.getEntityDisplayValue(
      field.cache, field.spec.displayPath, field.entity, parentField) || '').
      toString();
};
