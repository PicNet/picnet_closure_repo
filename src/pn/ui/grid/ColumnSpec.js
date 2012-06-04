;
goog.provide('pn.ui.grid.ColumnSpec');

goog.require('pn.ui.BaseFieldSpec');



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
 * @extends {pn.ui.BaseFieldSpec}
 *
 * @param {string} id The id of this column.
 * @param {!pn.ui.UiSpec} entitySpec The specifications (pn.ui.UiSpec) of
 *    the entity being displayed.
 * @param {string=} opt_name The optional name/caption of this column.
 */
pn.ui.grid.ColumnSpec = function(id, entitySpec, opt_name) {
  goog.asserts.assert(id);
  goog.asserts.assert(entitySpec);

  pn.ui.BaseFieldSpec.call(this, id, entitySpec, opt_name);

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
   *    This renderer is a function that takes 1 parameter and that is the
   *    field context for the current column and the current row details.
   *    The renderer then returns a html string of the value to display.
   *
   * @type {null|function(!pn.ui.FieldCtx):string}
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
goog.inherits(pn.ui.grid.ColumnSpec, pn.ui.BaseFieldSpec);


/** @inheritDoc */
pn.ui.grid.ColumnSpec.prototype.extend = function(props) {
  pn.ui.grid.ColumnSpec.superClass_.extend.call(this, props);

  if (!this.renderer && this.displayPath) {
    this.renderer = pn.ui.grid.ColumnRenderers.parentColumnRenderer;
  }
};


/**
 * @return {pn.ui.grid.ColumnSpec} A SlickGrid compative object even when in
 *    COMPILE mode.
 */
pn.ui.grid.ColumnSpec.prototype.toSlick = function() {
  // Need to copy twice as we need this to also work in compiled mode.
  var col = /** @type {pn.ui.grid.ColumnSpec} */ ({
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
    'source': this.displayPath
  });
  col.id = this.id;
  col.dataColumn = this.dataProperty;
  col.field = this.id;
  col.name = this.name;
  col.resizable = this.resizable;
  col.sortable = this.sortable;
  col.minWidth = this.minWidth;
  col.width = this.width;
  col.rerenderOnResize = this.rerenderOnResize;
  col.headerCssClass = this.headerCssClass;
  col.behavior = this.behavior;
  col.source = this.displayPath;
  return col;
};


/** @inheritDoc */
pn.ui.grid.ColumnSpec.prototype.disposeInternal = function() {
  pn.ui.grid.ColumnSpec.superClass_.disposeInternal.call(this);

  goog.dispose(this.renderer);

  delete this.renderer;
};
