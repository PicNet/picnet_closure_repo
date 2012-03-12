;
goog.provide('pn.ui.grid.ColumnRenderers');

goog.require('goog.string');
goog.require('pn.data.EntityUtils');
goog.require('pn.ui.SpecDisplayItem');


/**
 * @param {!Object} entity The entity in the current row.
 * @param {!Object.<!Array>} cache An in memory database with required entities.
 * @param {boolean} val The value currently in this cell.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.yesNoBoolRenderer = function(entity, cache, val) {
  return val === true ? 'Y' : 'N';
};


/**
 * @param {!Object} entity The entity in the current row.
 * @param {!Object.<!Array>} cache An in memory database with required entities.
 * @param {number|Date|goog.date.Date} val The value currently in this cell.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.dateRenderer = function(entity, cache, val) {
  if (val && goog.isNumber(val)) val = new Date(val);
  if (val && val.getFullYear() <= 1970) { val = null; }
  return val ? pn.Utils.dateFormat.format(/** @type {Date} */ (val)) : '';
};


/**
 * @param {!Object} entity The entity in the current row.
 * @param {!Object.<!Array>} cache An in memory database with required entities.
 * @param {number} val The value currently in this cell.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.centsRenderer = function(entity, cache, val) {
  goog.asserts.assert(goog.isNumber(val));
  var dollars = Math.floor(val / 100);
  var cents = Math.floor(val % 100);
  return '$' + dollars + '.' + goog.string.padNumber(cents, 2);
};


/**
 * @param {!Object} entity The entity in the current row.
 * @param {!Object.<!Array>} cache An in memory database with required entities.
 * @param {*} val The value currently in this cell.
 * @param {!pn.ui.grid.Column} col The column specification for
 *    the current column.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.parentColumnRenderer =
    function(entity, cache, val, col) {
  var value = entity[col.dataColumn];
  if (!value) return '';
  return pn.data.EntityUtils.getEntityName(cache, col.source, value);
};


/**
 * This renderer is used to display a CSV cell of all entities related to
 *    the entity in this row.  This renderer cannot be used by simply setting
 *    the renderer property in the column it needs to be wrapped so that
 *    the parentField and opt_childType parameters are set. I.e:
 *  <code>
 *  this.createColumn('AcccEntryBrandEntities', 'Brands', {
 *      renderer: function(e, cache, v, col) {
 *       return pn.ui.grid.ColumnRenderers.
 *           entitiesCsvRenderer(e, cache, v, col, 'AcccEntryID', 'Brand');
 *     }
 *   })
 *  </code>
 *
 * @param {!Object} entity The entity in the current row.
 * @param {!Object.<!Array>} cache An in memory database with required entities.
 * @param {*} val The value currently in this cell.
 * @param {!pn.ui.grid.Column} col The column specification for
 *    the current column.
 * @param {!string} parentField The child field used to match this
 *    entities children.
 * @param {string=} opt_childType If the children are a many to many table this
 *    parameter represents the next step in the path.
 * @return {string} The html value to display in this cell;.
 */
pn.ui.grid.ColumnRenderers.entitiesCsvRenderer =
    function(entity, cache, val, col, parentField, opt_childType) {
  goog.asserts.assert(goog.string.endsWith(col.id, 'Entities'));

  var type = goog.string.remove(col.id, 'Entities');
  var list = goog.array.filter(cache[type], function(child) {
    return child[parentField] === entity['ID'];
  });
  var names;
  if (opt_childType) {
    names = goog.array.map(list, function(child) {
      return goog.array.find(cache[opt_childType], function(b) {
        return b['ID'] === child[opt_childType + 'ID'];
      })[opt_childType + 'Name'];
    });
  } else {
    names = goog.array.map(list, function(child) {
      return child[type + 'Name'];
    });
  }
  return names.join(', ');
};
