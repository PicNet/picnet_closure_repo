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
goog.require('pn.ui.grid.pipe.ColWidthsHandler');
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
};
goog.inherits(pn.ui.grid.Grid, goog.ui.Component);


/**
 * @return {Array.<Array.<string>>} The data of the grid. This is used when
 *    exporting the grid contents.
 */
pn.ui.grid.Grid.prototype.getGridData = function() {
  var headers = goog.array.map(this.cfg_.cCtxs,
      function(cctx1) { return cctx1.spec.name; });
  var gridData = [headers];
  var lencol = this.cfg_.cCtxs.length;
  for (var row = 0, len = this.dataView_.getLength(); row < len; row++) {
    var rowData = this.dataView_.getItem(row);
    var rowTxt = [];

    for (var cidx = 0; cidx < lencol; cidx++) {
      var cctx = this.cfg_.cCtxs[cidx];
      var val = rowData[cctx.spec.dataProperty];
      var renderer = cctx.getColumnRenderer();
      var txt = renderer ? renderer(cctx, rowData) : val;
      rowTxt.push(txt);
    }
    gridData.push(rowTxt);
  }
  return gridData;
};


/**
 * @param {string} eventType The type of event to fire.
 * @param {*=} opt_data  The optional data object to pass to the event
 *    handlers.
 */
pn.ui.grid.Grid.prototype.fireCustomPipelineEvent =
    function(eventType, opt_data) {
  this.pipeline_.fireCustomEvent(eventType, opt_data);
};

///////////////////////////////////////////////////////////////////////////////
// Internals of Grid.js
///////////////////////////////////////////////////////////////////////////////


/** @override */
pn.ui.grid.Grid.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.grid.Grid.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  this.decorateCommands_();

  var height = 80 + Math.min(550, this.list_.length * 25);
  var width = $(element).width();
  var parent = pn.dom.addHtml(element,
      pn.ui.soy.grid({
        specId: this.spec_.id,
        width: width,
        height: height,
        hasData: this.list_.length > 0}));
  this.noData_ = goog.dom.getElementByClass('grid-no-data', parent);

  this.createSlick_(parent);
};


/** @private */
pn.ui.grid.Grid.prototype.decorateCommands_ = function() {
  if (this.cfg_.readonly) { return; }
  goog.array.forEach(this.commands_, function(c) {
    c.decorate(this.getElement());
  }, this);
};


/**
 * @private
 * @param {!Element} parent The element to add the slick grid to.
 */
pn.ui.grid.Grid.prototype.createSlick_ = function(parent) {
  if (!this.list_.length) return;

  var gridContainer = goog.dom.getElementByClass('grid-container', parent);
  this.dataView_ = new pn.ui.grid.DataView();
  this.registerDisposable(this.dataView_);

  var columns = goog.array.map(this.cfg_.cCtxs,
      function(cctx) { return cctx.toSlick(); });
  this.slick_ = new Slick.Grid(
      gridContainer, this.dataView_, columns, this.cfg_.toSlick());
};


/** @override */
pn.ui.grid.Grid.prototype.enterDocument = function() {
  pn.ui.grid.Grid.superClass_.enterDocument.call(this);
  if (!this.slick_) return; // No data

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

  var rfr = goog.bind(
      function() { this.fireCustomPipelineEvent('resize'); }, this);

  this.slick_.onColumnsResized.subscribe(rfr);

  this.initialisePipeline_();
  this.pipeline_.preRender();

  this.dataView_.beginUpdate();
  this.dataView_.setItems(this.list_, 'ID');
  this.dataView_.endUpdate();

  this.pipeline_.postRender();
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
  this.pipeline_.add(new pn.ui.grid.pipe.ColWidthsHandler(this.hash_));

  this.pipeline_.setMembers(
      this.slick_, this.dataView_, this.cfg_, this.cfg_.cCtxs);
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
