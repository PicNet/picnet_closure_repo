;
goog.provide('pn.ui.grid.Config');

goog.require('pn.ui.BaseConfig');



/**
 * @constructor
 * @extends {pn.ui.BaseConfig}
 * @param {!Array.<pn.ui.grid.Column>} columns The specification of all the
 *    columns to display in this grid.
 * @param {!Array.<pn.ui.grid.Command>} commands All the commands supported by
 *    this grid.
 */
pn.ui.grid.Config = function(columns, commands) {
  goog.asserts.assert(columns.length > 0);
  goog.asserts.assert(commands);

  pn.ui.BaseConfig.call(this, columns);

  /** @type {!Array.<pn.ui.grid.Column>} */
  this.columns = columns;

  /** @type {!Array.<pn.ui.grid.Command>} */
  this.commands = commands;

  /** @type {boolean} */
  this.readonly = false;

  /** @type {boolean} */
  this.allowEdit = true;

  /** @type {boolean} */
  this.enableQuickFilters = true;

  /** @type {string} */
  this.defaultSortColumn = '';

  /** @type {boolean} */
  this.defaultSortAscending = true;

  //////////////////////////////////////////////////////////////////////////////
  // Slick Grid Properties
  //////////////////////////////////////////////////////////////////////////////

  /** @type {boolean} */
  this.enableColumnReorder = false;

  /** @type {boolean} */
  this.forceFitColumns = true;

  /** @type {boolean} */
  this.multiSelect = false;

  /** @type {boolean} */
  this.editable = true;
};
goog.inherits(pn.ui.grid.Config, pn.ui.BaseConfig);


/**
 * @return {pn.ui.grid.Config} A SlickGrid compative object even when
 *    in COMPILE mode.
 */
pn.ui.grid.Config.prototype.toSlick = function() {
  var cfg = /** @type {pn.ui.grid.Config} */ (goog.object.clone(this));
  goog.object.extend(cfg, {
    'enableColumnReorder': this.enableColumnReorder,
    'forceFitColumns': this.forceFitColumns,
    'multiSelect': this.multiSelect,
    'editable': this.editable,
    'showHeaderRow': this.enableQuickFilters
  });
  return cfg;
};
