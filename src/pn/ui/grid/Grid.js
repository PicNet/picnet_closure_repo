;
goog.provide('pn.ui.grid.Grid');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.style');
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
goog.require('pn.ui.grid.pipe.CommandsHandler');
goog.require('pn.ui.grid.pipe.EditHandler');
goog.require('pn.ui.grid.pipe.FilteringHandler');
goog.require('pn.ui.grid.pipe.GridHandler');
goog.require('pn.ui.grid.pipe.HandlerPipeline');
goog.require('pn.ui.grid.pipe.NoDataHandler');
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
 * @param {!pn.ui.grid.Config} cfg The grid configuration.
 * @param {!Array.<!pn.data.Entity>} list The entities to display.
 * @param {!pn.data.BaseDalCache} cache The data cache to use for related
 *    entities.
 */
pn.ui.grid.Grid = function(cfg, list, cache) {
  pn.assInst(cfg, pn.ui.grid.Config);
  pn.assArr(list);
  if (cache) pn.assInst(cache, pn.data.BaseDalCache);

  goog.ui.Component.call(this);

  /**
   * @private
   * @const
   * @type {!goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.grid.Grid');

  /**
   * @private
   * @const
   * @type {!pn.ui.grid.Config}
   */
  this.cfg_ = cfg;

  /** @type {pn.ui.grid.Interceptor} */
  this.interceptor = this.cfg_.interceptor ?
      new this.cfg_.interceptor(cache) : null;
  this.registerDisposable(this.interceptor);

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
  this.gridId_ = this.cfg_.id + '_' + this.cfg_.getCctxs().pnreduce(
      function(acc, f) { return acc + f.id; }, '');

  /**
   * @private
   * @type {!Array.<!pn.data.Entity>}
   */
  this.list_ = this.interceptor ?
      this.interceptor.filterList(list) : list;

  /**
   * @private
   * @type {!pn.data.BaseDalCache}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {Slick.Grid}
   */
  this.slick_ = null;

  /**
   * @private
   * @type {pn.ui.grid.DataView}
   */
  this.view_ = null;

  this.log_.info('Grid created with: ' + this.list_.length + ' items');
};
goog.inherits(pn.ui.grid.Grid, goog.ui.Component);


/** @return {!Array.<!pn.data.Entity>} The selected row indexes. */
pn.ui.grid.Grid.prototype.getSelectedItems = function() {
  var rows = this.slick_.getSelectedRows().pnsort(),
      items = rows.pnmap(this.slick_.getDataItem, this.slick_);
  return items;
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


/** @return {Slick.Grid} The instance of slick grid being used by this grid. */
pn.ui.grid.Grid.prototype.getSlick = function() { return this.slick_; };

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

  var parent = this.decorateContainer_();
  this.createSlick_(parent);
};


/** @private */
pn.ui.grid.Grid.prototype.decorateCommands_ = function() {
  // TODO: The commands should be rendered by the CommandsHandler.  But to do
  // this we need to ensure that the GridHandler has access to the current
  // grid element (this.getElement());

  var parent = goog.dom.getElement('commands-container') || this.getElement();
  this.cfg_.commands.pnforEach(function(c) {
    if (this.cfg_.readonly && !c.visibleOnReadOnly) { return; }

    var hasData = this.list_.length > 0;
    if (hasData || c.visibleOnEmpty) { c.decorate(parent); }
  }, this);
};


/**
 * @private
 * @return {!Element} The created container for the noData and the slick grid
 *    controls.
 */
pn.ui.grid.Grid.prototype.decorateContainer_ = function() {
  var parent = pn.dom.addHtml(this.getElement(),
      pn.ui.soy.grid({ id: this.cfg_.id, hasData: this.list_.length > 0}));
  return parent;
};


/**
 * @private
 * @param {!Element} parent The element to add the slick grid to.
 */
pn.ui.grid.Grid.prototype.createSlick_ = function(parent) {
  if (!this.list_.length) return;
  var gc = goog.dom.getElementByClass('grid-container', parent);
  var height = this.cfg_.height;

  if (!height) {
    // Hack needed for IE9 and Chrome compatibility issues
    var wh = goog.dom.getViewportSize().height;
    var ey = goog.style.getClientPosition(gc).y;
    height = wh - ey - 80;
  }
  goog.style.setHeight(gc, height + 'px');

  this.view_ = new pn.ui.grid.DataView(this.interceptor);
  this.registerDisposable(this.view_);

  var cfg = this.cfg_;
  var columns = cfg.getCctxs().
      pnmap(function(cctx) { return cctx.toSlick(); });
  this.slick_ = new Slick.Grid(gc, this.view_.getDv(), columns, cfg.toSlick());

  goog.Timer.callOnce(this.slick_.resizeCanvas, 5, this.slick_);
};


/** @override */
pn.ui.grid.Grid.prototype.enterDocument = function() {
  pn.ui.grid.Grid.superClass_.enterDocument.call(this);

  this.attachGridEvents_();

  this.initialisePipeline_();
  this.pipeline_.preRender(!this.slick_);

  this.renderGrid_();

  this.pipeline_.postRender(!this.slick_);
};


/** @private */
pn.ui.grid.Grid.prototype.attachGridEvents_ = function() {
  // No data, do not display grid. This could cause issues if we ever do need
  // to support changing data sets i.e. 'pn.mvc.Collection'
  if (!this.slick_) return;

  this.view_.getDv().onRowsChanged.subscribe(goog.bind(function(e, args) {
    this.slick_.invalidateRows(args.rows);
    this.slick_.render();

    this.fireCustomPipelineEvent('row-data-changed', args.rows);
  }, this));

  this.view_.getDv().onRowCountChanged.subscribe(goog.bind(function() {
    this.slick_.updateRowCount();
    this.slick_.render();
    this.fireCustomPipelineEvent('row-count-changed');
  }, this));

  this.slick_.onColumnsResized.subscribe(goog.bind(function() {
    this.fireCustomPipelineEvent('resize');
  }, this));

  $(window).bind('resize', this.slick_.resizeCanvas);
};


/** @private */
pn.ui.grid.Grid.prototype.renderGrid_ = function() {
  if (!this.view_) return;

  this.view_.setItems(this.list_, this.cfg_.rowid);
};


/** @private */
pn.ui.grid.Grid.prototype.initialisePipeline_ = function() {
  var et = pn.ui.grid.pipe.HandlerPipeline.EventType.PIPELINE_EVENT;
  this.getHandler().listen(this.pipeline_, et, function(e) {
    var event = e.innerEvent;
    event.target = this;
    this.dispatchEvent(event);
  });

  var noData = goog.dom.getElementByClass('grid-no-data', this.getElement());
  var handlers = [
    new pn.ui.grid.pipe.FilteringHandler(this.gridId_, this.cache_),
    new pn.ui.grid.pipe.SortingHandler(this.gridId_),
    new pn.ui.grid.pipe.OrderingHandler(),
    new pn.ui.grid.pipe.TotalsHandler(this.getElement()),
    new pn.ui.grid.pipe.RowSelectionHandler(),
    new pn.ui.grid.pipe.ColWidthsHandler(this.gridId_),
    new pn.ui.grid.pipe.CommandsHandler(this.cfg_.type),
    new pn.ui.grid.pipe.EditHandler(),
    new pn.ui.grid.pipe.NoDataHandler(noData)
  ];

  handlers.pnforEach(this.pipeline_.add, this.pipeline_);
  handlers.pnforEach(this.registerDisposable, this);

  this.pipeline_.setMembers(
      this.slick_, this.view_, this.cfg_, this.interceptor);
};


/** @override */
pn.ui.grid.Grid.prototype.disposeInternal = function() {
  pn.ui.grid.Grid.superClass_.disposeInternal.call(this);

  if (this.slick_) {
    $(window).unbind('resize', this.slick_.resizeCanvas);
    this.view_.dispose();
    goog.object.forEach(this.slick_, function(f) {
      if (f instanceof Slick.Event) { f['unsubscribeAll'](); }
    });
    goog.object.forEach(this.view_.getDv(), function(f) {
      if (f instanceof Slick.Event) { f['unsubscribeAll'](); }
    });
    this.slick_.getColumns().pnforEach(function(c) { delete c['formatter']; });
    this.slick_.destroy();
    delete this.slick_;
    delete this.view_;
  }
};


/**
 * @const
 * @type {string}
 */
pn.ui.grid.Grid.SELECTED = 'grid-row-selected';
