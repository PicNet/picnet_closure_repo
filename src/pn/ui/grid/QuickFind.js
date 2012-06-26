;
goog.provide('pn.ui.grid.QuickFind');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('pn.ui.filter.GenericListFilterOptions');
goog.require('pn.ui.filter.SearchEngine');
goog.require('pn.ui.grid.ColumnSpec');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {!Array.<!pn.ui.grid.ColumnCtx>} cctxs The column specs being
 *    displayed.
 * @param {!Slick.Grid} slick The instance of the slick grid.
 */
pn.ui.grid.QuickFind = function(cache, cctxs, slick) {
  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {!Object.<Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {!Array.<!pn.ui.grid.ColumnCtx>}
   */
  this.cctxs_ = cctxs;

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
goog.inherits(pn.ui.grid.QuickFind, goog.events.EventTarget);


/**
 * @param {!Object} entity the row data item.
 * @return {boolean} Wether the item meets the quick filters.
 */
pn.ui.grid.QuickFind.prototype.matches = function(entity) {
  goog.asserts.assert(entity);

  for (var columnId in this.filters_) {
    if (columnId && this.filters_[columnId]) {
      var filterVal = this.filters_[columnId];
      var cctx = /** @type {!pn.ui.grid.ColumnCtx} */ (goog.array.find(
          this.cctxs_, function(fctx1) { return fctx1.id === columnId; }));
      var val = cctx.getEntityValue(entity);
      var renderer = cctx.getColumnRenderer();
      if (renderer === pn.ui.grid.ColumnRenderers.parentColumnRenderer) {
        val = val ? (pn.data.EntityUtils.getEntityDisplayValue(
            this.cache_, cctx.spec.displayPath, entity) || '').toString() : '';
      } else if (renderer) {
        val = renderer(cctx, entity);
      }
      var strval = '';
      if (goog.isDefAndNotNull(val)) { strval = val.toString().toLowerCase(); }
      if (!this.search_.matches(strval, filterVal)) { return false; }
    }
  }
  return true;
};


/** Initialises the quick filters and attaches the filters row to the grid */
pn.ui.grid.QuickFind.prototype.init = function() {

  for (var i = 0; i < this.cctxs_.length; i++) {
    var fctx = this.cctxs_[i];
    var header = this.slick_.getHeaderRowColumn(fctx.id);
    var val = this.filters_[fctx.id];
    var tt = pn.ui.filter.GenericListFilterOptions.DEFAULT_TOOLTIP;
    var input = this.createFilterInput_(fctx, 100, val, tt);

    goog.dom.removeChildren(header);
    goog.dom.appendChild(header, input);
  }

  var dataView = this.slick_.getData();
  var qf = this.filters_;

  var event = new goog.events.Event(pn.ui.grid.QuickFind.EventType.FILTERED);
  var fire = goog.bind(this.dispatchEvent, this, event);

  $(this.slick_.getHeaderRow()).delegate(':input', 'change keyup',
      function() {
        qf[this['data-id']] = $.trim(
            /** @type {string} */ ($(this).val())).toLowerCase();
        dataView.refresh();
        fire();
      });

  this.resize();
};


/** Resizes the filters row */
pn.ui.grid.QuickFind.prototype.resize = function() {
  var grid = /** @type {Element} */
      (this.slick_.getHeaderRow().parentNode.parentNode);
  var headerTemplates =
      goog.dom.getElementsByClass('slick-header-column', grid);
  for (var i = 0; i < this.cctxs_.length; i++) {
    var fctx = this.cctxs_[i];
    var header = this.slick_.getHeaderRowColumn(fctx.id);
    var input = goog.dom.getChildren(header)[0];
    var width = $(headerTemplates[i]).width();
    goog.style.setWidth(header, Math.max(0, width - 1));
    goog.style.setWidth(input, Math.max(0, width - 3));
  }
};


/**
 * @return {!Object.<string>} The current states of the quick find filters.
 */
pn.ui.grid.QuickFind.prototype.getFilterStates = function() {
  var states = {};
  for (var i = 0; i < this.cctxs_.length; i++) {
    var fctx = this.cctxs_[i];
    var header = this.slick_.getHeaderRowColumn(fctx.id);
    var input = goog.dom.getChildren(header)[0];
    var value = input.value;
    if (value) { states[fctx.id] = value; }
  }
  return states;
};


/**
 * @param {!Object.<string>} states The states to set in the filters.
 */
pn.ui.grid.QuickFind.prototype.setFilterStates = function(states) {
  if (!states) return;
  var needsRefresh = false;
  for (var i = 0; i < this.cctxs_.length; i++) {
    var fctx = this.cctxs_[i];
    if (!states[fctx.id]) continue;

    var header = this.slick_.getHeaderRowColumn(fctx.id);
    var input = goog.dom.getChildren(header)[0];
    this.filters_[fctx.id] = input.value = states[fctx.id];
    needsRefresh = true;
  }
  if (needsRefresh) {
    this.slick_.getData().refresh();
  }
};


/**
 * @private
 * @param {!pn.ui.grid.ColumnCtx} fctx The column to apply the filter to.
 * @param {number} width The width of the control to create.
 * @param {string} value The value to display in the filter.
 * @param {string} tooltip The control tooltip.
 * @return {!Element} The quick filter input control.
 */
pn.ui.grid.QuickFind.prototype.createFilterInput_ =
    function(fctx, width, value, tooltip) {
  var input = goog.dom.createDom('input', {
    'type': 'text',
    'title': tooltip
  });
  input['data-id'] = fctx.id;
  goog.style.setWidth(input, width - 3);
  if (value) { input.value = value; }
  return input;
};


/** @inheritDoc */
pn.ui.grid.QuickFind.prototype.disposeInternal = function() {
  pn.ui.grid.QuickFind.superClass_.disposeInternal.call(this);

  delete this.slick_;
};


/** @enum {string} */
pn.ui.grid.QuickFind.EventType = {
  FILTERED: 'filtered'
};
