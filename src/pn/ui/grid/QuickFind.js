;
goog.provide('pn.ui.grid.QuickFind');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('pn.app.EventHandlerTarget');
goog.require('pn.ui.DelayedThrottleInputListener');
goog.require('pn.ui.filter.GenericListFilterOptions');
goog.require('pn.ui.filter.SearchEngine');
goog.require('pn.ui.grid.ColumnSpec');



/**
 * @constructor
 * @extends {pn.app.EventHandlerTarget}
 * @param {!pn.data.BaseDalCache} cache The data cache to use for related
 *    entities.
 * @param {Array.<!pn.ui.grid.ColumnCtx>} cctxs The column specs being
 *    displayed.
 * @param {Slick.Grid} slick The instance of the slick grid.
 * @param {Element=} opt_quickfind An optional quickfind control.  The
 *    quickfind control is a Text box that is used to search for a match
 *    anywhere in a row.
 * @param {Element=} opt_clear An optional clear control.  This control will
 *    trigger a clear event that will clear all filters.
 * @param {string=} opt_filterToolTip An optional filter tooltip, overrrides
 *     default tooltip.
 */
pn.ui.grid.QuickFind =
    function(cache, cctxs, slick, opt_quickfind, opt_clear, opt_filterToolTip) {
  pn.app.EventHandlerTarget.call(this);

  /**
   * @private
   * @type {!pn.data.BaseDalCache}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {Array.<!pn.ui.grid.ColumnCtx>}
   */
  this.cctxs_ = cctxs;

  /**
   * @private
   * @type {Slick.Grid}
   */
  this.slick_ = slick;

  /**
   * @private
   * @type {undefined|Element}
   */
  this.quickfind_ = opt_quickfind;

  /**
   * @private
   * @type {undefined|Element}
   */
  this.clear_ = opt_clear;

  /**
   * @private
   * @type {string}
   */
  this.filterToolTip_ = opt_filterToolTip ||
      pn.ui.filter.GenericListFilterOptions.DEFAULT_TOOLTIP;

  /**
   * @private
   * @type {!Array.<!Element>}
   */
  this.filterControls_ = [];

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



  /**
   * @private
   * @type {!pn.ui.DelayedThrottleInputListener}
   */
  this.inputListener_ = new pn.ui.DelayedThrottleInputListener(250);
  this.registerDisposable(this.inputListener_);



  this.init_();
};
goog.inherits(pn.ui.grid.QuickFind, pn.app.EventHandlerTarget);


/**
 * @param {!pn.data.Entity} entity the row data item.
 * @return {boolean} Wether the item meets the quick filters.
 */
pn.ui.grid.QuickFind.prototype.matches = function(entity) {
  pn.assInst(entity, pn.data.Entity);

  var row = [];
  var noMatchIdx = this.cctxs_.pnfindIndex(function(cctx) {
    var isFiltering = cctx.id in this.filters_;
    if (!isFiltering && !this.quickfind_) { return false; }
    var val = cctx.getEntityValue(entity),
        fv = this.filters_[cctx.id],
        renderer = cctx.getColumnRenderer();
    if (renderer === pn.ui.grid.ColumnRenderers.parentColumnRenderer) {
      val = val ? (pn.data.EntityUtils.getEntityDisplayValue(
          this.cache_, cctx.spec.displayPath,
          cctx.spec.entitySpec.type, entity) || '').toString() : '';
    } else if (renderer) {
      val = renderer(cctx, entity);
    }
    var strval = '';
    if (goog.isDefAndNotNull(val)) { strval = val.toString().toLowerCase(); }
    row.push(strval);
    return isFiltering && !this.search_.matches(strval, fv);
  }, this);
  if (noMatchIdx >= 0) return false;

  if (this.quickfind_) {
    var value = goog.string.trim(this.quickfind_.value);
    var rowstr = row.join('');
    return !value || this.search_.matches(rowstr, value);
  }
  return true;
};


/**
 * @private
 * Initialises the quick filters and attaches the filters row to the grid
 */
pn.ui.grid.QuickFind.prototype.init_ = function() {
  for (var i = 0; i < this.cctxs_.length; i++) {
    var fctx = this.cctxs_[i];
    var header = this.slick_.getHeaderRowColumn(fctx.id);
    var val = this.filters_[fctx.id];

    var input = this.createFilterInput_(fctx, 100, val, this.filterToolTip_);
    this.filterControls_.push(input);

    goog.dom.removeChildren(header);
    goog.dom.appendChild(header, input);
  }

  var eventtype = pn.ui.DelayedThrottleInputListener.CHANGED;
  this.listenTo(this.inputListener_, eventtype, this.refresh_.pnbind(this));
  this.filterControls_.pnforEach(
      function(inp) { this.inputListener_.addInput(inp); }, this);
  if (this.quickfind_) {
    this.inputListener_.addInput(this.quickfind_);
    goog.Timer.callOnce(this.quickfind_.focus, 1, this.quickfind_);
  }
  if (this.clear_) {
    var click = goog.events.EventType.CLICK;
    this.listenTo(this.clear_, click, this.clearFilters_.pnbind(this));
  }

  this.resize();
};


/** @private */
pn.ui.grid.QuickFind.prototype.refresh_ = function() {
  this.filterControls_.pnforEach(function(inp) {
    this.filters_[inp['data-id']] = goog.string.trim(inp.value);
  }, this);
  this.slick_.getData().refresh();

  var event = new goog.events.Event(pn.ui.grid.QuickFind.EventType.FILTERED);
  this.dispatchEvent(event);
};


/** @private */
pn.ui.grid.QuickFind.prototype.clearFilters_ = function() {
  this.filterControls_.pnforEach(function(inp) { inp.value = ''; });
  if (this.quickfind_) { this.quickfind_.value = ''; }
  this.inputListener_.clearFilterValues();
  this.refresh_();
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
  if (this.quickfind_ && this.quickfind_.value) {
    states['quick-find'] = this.quickfind_.value;
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
    this.inputListener_.setCurrentFilter(fctx.id, states[fctx.id]);
    needsRefresh = true;
  }
  var qfval = states['quick-find'];
  if (qfval && this.quickfind_) {
    needsRefresh = true;
    this.quickfind_.value = qfval;
    this.inputListener_.setCurrentFilter('quick-find', qfval);
  }
  if (needsRefresh) { this.slick_.getData().refresh(); }
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


/** @override */
pn.ui.grid.QuickFind.prototype.disposeInternal = function() {
  pn.ui.grid.QuickFind.superClass_.disposeInternal.call(this);

  delete this.slick_;
};


/** @enum {string} */
pn.ui.grid.QuickFind.EventType = {
  FILTERED: 'filtered'
};
