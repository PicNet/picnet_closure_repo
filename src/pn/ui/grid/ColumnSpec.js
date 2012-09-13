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
 * @param {!Object} props The properties to add this column.  After adding
 *    we will also apply default values to any attribute that was not
 *    explicitally set.
 * @param {!pn.ui.UiSpec} entitySpec The specifications (pn.ui.UiSpec) of
 *    the entity being displayed.
 */
pn.ui.grid.ColumnSpec = function(id, props, entitySpec) {
  goog.asserts.assert(id);
  goog.asserts.assert(props);
  goog.asserts.assert(entitySpec);

  pn.ui.BaseFieldSpec.call(this, id, entitySpec);

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
  this.tooltip = '';

  /** @type {string} */
  this.cssClass = '';

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
   * @type {pn.ui.grid.ColumnSpec.Renderer}
   */
  this.renderer = undefined;

  /**
   * An optional funciton that returns a string or a number (any compareable
   *    value really).  This value is then used for sorting.
   *
   * @type {pn.ui.grid.ColumnSpec.SortValueRenderer}
   */
  this.sortValueRenderer = undefined;

  /**
   * Wether this column should show in the totals legend at the bottom of the
   *    grid.
   *
   * @type {boolean}
   */
  this.total = false;

  this.extend(props);
};
goog.inherits(pn.ui.grid.ColumnSpec, pn.ui.BaseFieldSpec);


/** @override */
pn.ui.grid.ColumnSpec.prototype.extend = function(props) {
  pn.ui.grid.ColumnSpec.superClass_.extend.call(this, props);

  if (!this.renderer && this.displayPath) {
    this.renderer = pn.ui.grid.ColumnRenderers.parentColumnRenderer;
  }
  if (!this.tooltip) this.tooltip = this.name;
  if (!this.renderer) this.renderer = this.getDefaultRenderer_();
};


/**
 * @private
 * @return {undefined|pn.ui.grid.ColumnSpec.Renderer} The inferred renderer for
 *    this column.
 */
pn.ui.grid.ColumnSpec.prototype.getDefaultRenderer_ = function() {
  goog.asserts.assert(!this.renderer);

  var schemaType;
  if (this.id.indexOf('.') > 0) {
    schemaType = 'parent';
  } else {
    var schema = this.entitySpec.type.getFieldSchema(this.id);
    schemaType = schema ? schema.type : '';
  }
  return pn.app.ctx.cfg.defaultColumnRenderers[schemaType];
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
    'toolTip': this.tooltip,
    'resizable': this.resizable,
    'sortable': this.sortable,
    'minWidth': this.minWidth,
    'width': this.width,
    'rerenderOnResize': this.rerenderOnResize,
    'headerCssClass': this.headerCssClass,
    'cssClass': this.cssClass,
    'behavior': this.behavior,
    'source': this.displayPath
  });
  col.id = this.id;
  col.dataColumn = this.dataProperty;
  col.field = this.id;
  col.name = this.name;
  col.tooltip = this.tooltip;
  col.resizable = this.resizable;
  col.sortable = this.sortable;
  col.minWidth = this.minWidth;
  col.width = this.width;
  col.rerenderOnResize = this.rerenderOnResize;
  col.headerCssClass = this.headerCssClass;
  col.cssClass = this.cssClass;
  col.behavior = this.behavior;
  col.source = this.displayPath;
  return col;
};


/**
 * @typedef {(undefined|function(!pn.ui.grid.ColumnCtx,
 *    !pn.data.Entity):string)}
 */
pn.ui.grid.ColumnSpec.Renderer;


/**
 * @typedef
 *    {(undefined|function(!pn.ui.grid.ColumnCtx,!Object):(string|number))}
 */
pn.ui.grid.ColumnSpec.SortValueRenderer;
