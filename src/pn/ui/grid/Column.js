;
goog.provide('pn.ui.grid.Column');

goog.require('pn.ui.BaseField');



/**
 * The Column specification defines how a column should be headered and how
 *    the cell should be rendered.  For full details of the meaning of most
 *    of these values see:
 *  http://mleibman.github.com/SlickGrid/examples/example2-formatters.html
 *
 * BaseField types (Field / Column) should be constructed using the
 *    convenience methods in UiSpec (UiSpec.prototype.createColumn).
 *
 * @constructor
 * @extends {pn.ui.BaseField}
 *
 * @param {string} id The id of this column.
 * @param {!pn.ui.UiSpec} entitySpec The specifications (pn.ui.UiSpec) of
 *    the entity being displayed.
 * @param {string=} opt_name The optional name/caption of this column.
 */
pn.ui.grid.Column = function(id, entitySpec, opt_name) {
  goog.asserts.assert(id);
  goog.asserts.assert(entitySpec);

  pn.ui.BaseField.call(this, id, entitySpec, opt_name);

  /** @type {boolean} */
  this.resizable = true;

  /** @type {boolean} */
  this.sortable = true;

  /** @type {number} */
  this.minWidth = 0;

  /** @type {number} */
  this.width = 100;

  /** @type {boolean} */
  this.rerenderOnResize = false;

  /** @type {string} */
  this.headerCssClass = '';

  /** @type {string} */
  this.behavior = '';

  //////////////////////////////////////////////////////////////////////////////
  // Field below are not solely for slick grid.
  //////////////////////////////////////////////////////////////////////////////

  /**
   * The renderer which will be turned into a slick grid formatter in Grid.js.
   *    This renderer is a function that takes 4 parameters, the entity
   *    displayed in the current row, The cache of entities in the current
   *    context, the value of this column in the current entity and a reference
   *    to this Column specifications.  The renderer then returns a html string
   *    of the value to display.
   *
   * @type {null|function(
   *   !Object,!Object.<!Array>,*,!pn.ui.grid.Column):string}
   */
  this.renderer = null;

  /**
   * Wether this column should show in the totals legend at the bottom of the
   *    grid.
   *
   * @type {boolean}
   */
  this.total = false;
};
goog.inherits(pn.ui.grid.Column, pn.ui.BaseField);


/** @inheritDoc */
pn.ui.grid.Column.prototype.extend = function(props) {
  pn.ui.grid.Column.superClass_.extend.call(this, props);

  if (!this.renderer && this.displayPath) {
    this.renderer = pn.ui.grid.ColumnRenderers.parentColumnRenderer;
  }
};


/**
 * @param {function(number,number,Object,Object,Object):string}
 *    formatter The formatter to use for this column.
 * @return {pn.ui.grid.Column} A SlickGrid compative object even when in
 *    COMPILE mode.
 */
pn.ui.grid.Column.prototype.toSlick = function(formatter) {
  var col = /** @type {pn.ui.grid.Column} */ (goog.object.clone(this));
  goog.object.extend(col, {
    'id': this.id,
    'dataColumn': this.dataProperty,
    'field': this.id,
    'name': this.name,
    'resizable': this.resizable,
    'sortable': this.sortable,
    'minWidth': this.minWidth,
    'width': this.width,
    'rerenderOnResize': this.rerenderOnResize,
    'headerCssClass': this.headerCssClass,
    'behavior': this.behavior,
    'formatter': formatter,
    'source': this.displayPath
  });
  return col;
};
