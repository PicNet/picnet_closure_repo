;
goog.provide('pn.ui.grid.Grid');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.app.AppEvents');
goog.require('pn.json');
goog.require('pn.storage');
goog.require('pn.ui.grid.ColumnCtx');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.DataView');
goog.require('pn.ui.grid.OrderingColumnSpec');
goog.require('pn.ui.grid.QuickFind');
goog.require('pn.ui.grid.RowOrdering');
goog.require('pn.ui.grid.pipe.FilteringHandler');
goog.require('pn.ui.grid.pipe.GridHandler');
goog.require('pn.ui.grid.pipe.HandlerPipeline');
goog.require('pn.ui.grid.pipe.OrderingHandler');
goog.require('pn.ui.grid.pipe.RowSelectionHandler');
goog.require('pn.ui.grid.pipe.SortingHandler');
goog.require('pn.ui.grid.pipe.TotalsHandler');
goog.require('pn.ui.soy');



/**
 * The pn.ui.grid.Grid is built atop SlickGrid
 * (https://github.com/mleibman/SlickGrid/).  See SlickGrid documentation for
 * full detauils.
 *
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!pn.ui.UiSpec} spec The specs for the entities in
 *    this grid.
 * @param {!Array} list The entities to display.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 */
pn.ui.grid.Grid = function(spec, list, cache) {
  goog.asserts.assert(spec);
  goog.asserts.assert(list);
  goog.asserts.assert(cache);

  goog.ui.Component.call(this);

  /**
   * @private
   * @type {!pn.ui.UiSpec}
   */
  this.spec_ = spec;
  this.registerDisposable(this.spec_);

  /**
   * @private
   * @type {pn.ui.grid.Config}
   */
  this.cfg_ = this.spec_.getGridConfig(cache);
  this.registerDisposable(this.cfg_);

  /**
   * @private
   * @type {pn.ui.grid.Interceptor}
   */
  this.interceptor_ = this.cfg_.interceptor ?
      new this.cfg_.interceptor(cache) : null;
  this.registerDisposable(this.interceptor_);

  /**
   * @private
   * @type {!pn.ui.grid.pipe.HandlerPipeline}
   */
  this.pipeline_ = new pn.ui.grid.pipe.HandlerPipeline();
  this.registerDisposable(this.pipeline_);

  /**
   * @private
   * @const
   * @type {string}
   */
  this.hash_ = goog.array.reduce(this.cfg_.cCtxs,
      function(acc, f) { return acc + f.id; }, '');

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.grid.Grid');

  /**
   * @private
   * @type {!Array}
   */
  this.list_ = this.interceptor_ ? this.interceptor_.filterList(list) : list;


  /**
   * @private
   * @type {!Array.<!pn.ui.grid.ColumnCtx>}
   */
  this.cctxs_ = this.getColumnsWithInitialState_(this.cfg_.cCtxs);

  /**
   * @private
   * @type {!Object.<Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {!Array.<pn.ui.grid.Command>}
   */
  this.commands_ = this.cfg_.commands;

  /**
   * @private
   * @type {Slick.Grid}
   */
  this.slick_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.noData_ = null;

  /**
   * @private
   * @type {pn.ui.grid.DataView}
   */
  this.dataView_ = null;

  /**
   * @private
   * @type {Function}
   */
  this.selectionHandler_ = null;
};
goog.inherits(pn.ui.grid.Grid, goog.ui.Component);


/**
 * @param {string} eventType The type of event to fire.
 * @param {*=} opt_data  The optional data object to pass to the event
 *    handlers.
 */
pn.ui.grid.Grid.prototype.fireCustomPipelineEvent =
    function(eventType, opt_data) {
  this.pipeline_.fireCustomEvent(eventType, opt_data);
};


/** @override */
pn.ui.grid.Grid.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.grid.Grid.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  if (!this.cfg_.readonly) {
    goog.array.forEach(this.commands_, function(c) {
      c.decorate(element);
    }, this);
  }

  var height = 80 + Math.min(550, this.list_.length * 25);
  var width = $(element).width();
  var hasData = this.list_.length > 0;
  var parent = pn.dom.addHtml(element,
      pn.ui.soy.grid({
        specId: this.spec_.id,
        width: width,
        height: height,
        hasData: hasData}));
  this.noData_ = goog.dom.getElementByClass('grid-no-data', parent);
  var gridContainer = goog.dom.getElementByClass('grid-container', parent);


  if (!hasData) { return; }

  this.dataView_ = new pn.ui.grid.DataView();
  this.registerDisposable(this.dataView_);

  var columns = goog.array.map(this.cctxs_,
      function(cctx) { return cctx.toSlick(); });
  this.slick_ = new Slick.Grid(
      gridContainer, this.dataView_, columns, this.cfg_.toSlick());
};


/**
 * @private
 * @param {!Array.<!pn.ui.grid.ColumnCtx>} cctxs The unsorted columns.
 * @return {!Array.<!pn.ui.grid.ColumnCtx>} The sorted columns with saved
 *    widths.
 */
pn.ui.grid.Grid.prototype.getColumnsWithInitialState_ = function(cctxs) {
  var state = pn.storage.get(this.hash_);
  if (!state) return cctxs;

  var data = goog.json.unsafeParse(state);
  var ids = data['ids'];
  var widths = data['widths'];
  var ordered = [];
  goog.array.forEach(ids, function(id, idx) {
    var cidx = goog.array.findIndex(cctxs,
        function(cctx1) { return cctx1.id === id; });
    var cctx = cctxs[cidx];
    delete cctxs[cidx];
    cctx.spec.width = widths[idx];
    ordered.push(cctx);
  });

  // Add remaining columns (if any)
  goog.array.forEach(cctxs, ordered.push);
  return ordered;
};


/**
 * @return {Array.<Array.<string>>} The data of the grid. This is used when
 *    exporting the grid contents.
 */
pn.ui.grid.Grid.prototype.getGridData = function() {
  var headers = goog.array.map(this.cctxs_,
      function(cctx1) { return cctx1.spec.name; });
  var gridData = [headers];
  var lencol = this.cctxs_.length;
  for (var row = 0, len = this.dataView_.getLength(); row < len; row++) {
    var rowData = this.dataView_.getItem(row);
    var rowTxt = [];

    for (var cidx = 0; cidx < lencol; cidx++) {
      var cctx = this.cctxs_[cidx];
      var val = rowData[cctx.spec.dataProperty];
      var renderer = cctx.getColumnRenderer();
      var txt = renderer ? renderer(cctx, rowData) : val;
      rowTxt.push(txt);
    }
    gridData.push(rowTxt);
  }
  return gridData;
};


/** @override */
pn.ui.grid.Grid.prototype.enterDocument = function() {
  pn.ui.grid.Grid.superClass_.enterDocument.call(this);
  if (!this.slick_) return; // No data

  // Selecting
  if (!this.cfg_.readonly) {
    goog.array.forEach(this.commands_, function(c) {
      this.getHandler().listen(c, c.eventType, function(e) {
        e.target = this;
        this.publishEvent_(e);
      });
    }, this);
  }

  this.dataView_.onRowsChanged.subscribe(goog.bind(function(e, args) {
    this.slick_.invalidateRows(args.rows);
    this.slick_.render();
  }, this));

  this.dataView_.onRowCountChanged.subscribe(goog.bind(function() {
    this.slick_.updateRowCount();
    this.slick_.render();
    this.fireCustomPipelineEvent('row-count-changed');
    goog.style.showElement(this.noData_, this.dataView_.getLength() === 0);
  }, this));


  this.dataView_.beginUpdate();
  this.dataView_.setItems(this.list_, 'ID');
  this.dataView_.endUpdate();

  var rfr = goog.bind(function() {
    this.fireCustomPipelineEvent('resize');
    this.saveGridState_();
  }, this);

  this.slick_.onColumnsReordered.subscribe(rfr);
  this.slick_.onColumnsResized.subscribe(rfr);

  this.initialisePipeline_();
};


/** @private */
pn.ui.grid.Grid.prototype.initialisePipeline_ = function() {
  var et = pn.ui.grid.pipe.HandlerPipeline.EventType.PIPELINE_EVENT;
  this.getHandler().listen(this.pipeline_, et, function(e) {
    var event = e.innerEvent;
    event.target = this;
    this.publishEvent_(event);
  });

  this.pipeline_.add(
      new pn.ui.grid.pipe.FilteringHandler(this.hash_, this.cache_));
  this.pipeline_.add(new pn.ui.grid.pipe.SortingHandler(this.hash_));
  this.pipeline_.add(new pn.ui.grid.pipe.OrderingHandler());
  this.pipeline_.add(new pn.ui.grid.pipe.TotalsHandler(this.getElement()));
  this.pipeline_.add(new pn.ui.grid.pipe.RowSelectionHandler());

  this.pipeline_.init(this.slick_, this.dataView_, this.cfg_, this.cctxs_);

  this.fireCustomPipelineEvent('initialised');
};


/** @private */
pn.ui.grid.Grid.prototype.saveGridState_ = function() {
  var columns = this.slick_.getColumns();
  var data = {
    'ids': goog.array.map(columns, function(c) { return c['id']; }),
    'widths': goog.array.map(columns, function(c) { return c['width']; })
  };
  pn.storage.set(this.hash_, pn.json.serialiseJson(data));
};


/**
 * @private
 * @param {!goog.events.Event} e The event to publish using the pn.app.ctx.pub
 *    mechanism.
 */
pn.ui.grid.Grid.prototype.publishEvent_ = function(e) {
  if (!this.cfg_.publishEventBusEvents) {
    this.dispatchEvent(e);
    return;
  }
  var ae = pn.app.AppEvents;
  switch (e.type) {
    case ae.ENTITY_SELECT:
      var id = e.selected['ID'];
      pn.app.ctx.pub(e.type, this.spec_.type, id);
      break;
    case ae.ENTITY_ADD:
      pn.app.ctx.pub(e.type, this.spec_.type);
      break;
    case ae.LIST_EXPORT:
      var data = e.target.getGridData();
      var format = e.exportFormat;
      pn.app.ctx.pub(e.type, this.spec_.type, format, data);
      break;
    default: throw new Error('Event: ' + e.type + ' is not supported');
  }
};


/** @override */
pn.ui.grid.Grid.prototype.disposeInternal = function() {
  pn.ui.grid.Grid.superClass_.disposeInternal.call(this);

  if (this.slick_) { this.slick_.destroy(); }
};
