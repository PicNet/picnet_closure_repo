;
goog.provide('pn.ui.grid.OrderingColumnSpec');

goog.require('pn.ui.grid.ColumnSpec');



/**
 * A column that is used solely to reorder the grid.
 *
 * @constructor
 * @extends {pn.ui.grid.ColumnSpec}
 *
 * @param {string} id The id of this column, this is also the property that
 *    will be used to save the order.  Note: This field does not display
 *    the value of this property.
 * @param {!pn.ui.UiSpec} entitySpec The specifications (pn.ui.UiSpec) of
 *    the entity being displayed.
 */
pn.ui.grid.OrderingColumnSpec = function(id, entitySpec) {
  pn.ui.grid.ColumnSpec.call(this, id, {}, entitySpec);

  this.name = '';
  this.cssClass = 'cell-reorder';
  this.behavior = 'move';
  this.width = 8;
  this.renderer = function() { return ''; };
};
goog.inherits(pn.ui.grid.OrderingColumnSpec, pn.ui.grid.ColumnSpec);
