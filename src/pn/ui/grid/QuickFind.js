;
goog.provide('pn.ui.grid.QuickFind');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.filter.GenericListFilterOptions');
goog.require('pn.ui.filter.SearchEngine');
goog.require('pn.ui.grid.Column');



/**
 * @constructor
 * @extends {goog.events.EventHandler}
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {!Array.<pn.ui.grid.Column>} cols The column specs being displayed.
 * @param {!Slick.Grid} slick The instance of the slick grid.
 */
pn.ui.grid.QuickFind = function(cache, cols, slick) {
  goog.events.EventHandler.call(this, this);

  /**
   * @private
   * @type {!Object.<Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {!Array.<pn.ui.grid.Column>}
   */
  this.cols_ = cols;

  /**
   * @private
   * @type {Slick.Grid}
   */
  this.slick_ = slick;

  /**
   * @private
   * @type {Object.<string>}
   */
  this.filters_ = {};

  /**
   * @private
   * @type {!pn.ui.filter.SearchEngine}
   */
  this.search_ = new pn.ui.filter.SearchEngine();
};
goog.inherits(pn.ui.grid.QuickFind, goog.events.EventHandler);


/**
 * @param {!Object} entity the row data item.
 * @return {boolean} Wether the item meets the quick filters.
 */
pn.ui.grid.QuickFind.prototype.matches = function(entity) {
  goog.asserts.assert(entity);

  for (var columnId in this.filters_) {
    if (columnId && this.filters_[columnId]) {
      var filterVal = this.filters_[columnId];
      var col = /** @type {pn.ui.grid.Column} */
          (goog.array.find(this.cols_,
              function(col) { return col.id === columnId; }));
      var val = entity[col.dataProperty];
      if (col.renderer === pn.ui.grid.ColumnRenderers.parentColumnRenderer) {
        val = val ? pn.data.EntityUtils.
            getEntityDisplayValue(this.cache_, col.displayPath, val) :
            '';
      } else if (col.renderer) {
        val = col.renderer(entity, this.cache_, val, col);
      }
      if (goog.isDefAndNotNull(val)) { val = val.toString().toLowerCase(); }
      if (!this.search_.matches(val, filterVal)) { return false; }
    }
  }
  return true;
};


/** Initialises the quick filters and attaches the filters row to the grid */
pn.ui.grid.QuickFind.prototype.init = function() {

  for (var i = 0; i < this.cols_.length; i++) {
    var col = this.cols_[i];
    var header = this.slick_.getHeaderRowColumn(col.id);
    var val = this.filters_[col.id];
    var tt = pn.ui.filter.GenericListFilterOptions.DEFAULT_TOOLTIP;
    var input = this.createFilterInput_(col, 100, val, col.id, tt);

    goog.dom.removeChildren(header);
    goog.dom.appendChild(header, input);
  }

  var dataView = this.slick_.getData();
  var qf = this.filters_;

  // TODO: This needs throttling
  $(this.slick_.getHeaderRow()).delegate(':input', 'change keyup',
      function() {
        qf[this['data-id']] = $.trim(
            /** @type {string} */ ($(this).val())).toLowerCase();
        dataView.refresh();
      });

  this.resize();
};


/** Resizes the filters row */
pn.ui.grid.QuickFind.prototype.resize = function() {
  var grid = /** @type {Element} */
      (this.slick_.getHeaderRow().parentNode.parentNode);
  var headerTemplates =
      goog.dom.getElementsByClass('slick-header-column', grid);
  for (var i = 0; i < this.cols_.length; i++) {
    var col = this.cols_[i];
    var header = this.slick_.getHeaderRowColumn(col.id);

    var input = goog.dom.getChildren(header)[0];
    var width = pn.dom.getComputedPixelWidth(headerTemplates[i]);
    goog.style.setWidth(header, width - 1);
    goog.style.setWidth(input, width - 3);
  }
};


/**
 * @private
 * @param {pn.ui.grid.Column} col The column to apply the filter to.
 * @param {number} width The width of the control to create.
 * @param {string} value The value to display in the filter.
 * @param {string} id The control id.
 * @param {string} tooltip The control tooltip.
 * @return {!Element} The quick filter input control.
 */
pn.ui.grid.QuickFind.prototype.createFilterInput_ =
    function(col, width, value, id, tooltip) {
  var input = goog.dom.createDom('input', {
    'type': 'text',
    'title': tooltip
  });
  input['data-id'] = id;
  goog.style.setWidth(input, width - 3);
  if (value) { input.value = value; }
  return input;
};


/** @inheritDoc */
pn.ui.grid.QuickFind.prototype.disposeInternal = function() {
  pn.ui.grid.QuickFind.superClass_.disposeInternal.call(this);

  goog.object.forEach(this.filters_, goog.dispose);
  goog.dispose(this.search_);

  delete this.cols_;
  delete this.slick_;
  delete this.filters_;
  delete this.search_;
};
