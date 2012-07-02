;
goog.provide('pn.ui.grid.Grid');
goog.provide('pn.ui.grid.Grid.EventType');

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
   * @const
   * @type {string}
   */
  this.hash_ = /** @type {string} */ (goog.array.reduce(this.cfg_.cCtxs,
      function(acc, f) { return acc + f.id; }, ''));

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
   * @type {!Array.<!pn.ui.grid.ColumnCtx>}
   */
  this.totalColumns_ = goog.array.filter(this.cctxs_,
      /** @param {!pn.ui.grid.ColumnCtx} fctx The field context. */
      function(fctx) { return !!fctx.spec.total; });

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

  /**
   * @private
   * @type {null|function(Object):boolean}
   */
  this.currentFilter_ = null;

  /**
   * @private
   * @type {pn.ui.grid.QuickFind}
   */
  this.quickFind_ = null;

  /**
   * @private
   * @type {pn.ui.grid.RowOrdering}
   */
  this.rowOrdering_ = null;

  /**
   * @private
   * @type {Object}
   */
  this.sort_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.totalsLegend_ = null;
};
goog.inherits(pn.ui.grid.Grid, goog.ui.Component);


/** @param {function(Object):boolean} filter The filter function to apply. */
pn.ui.grid.Grid.prototype.filter = function(filter) {
  this.log_.info('Filtering grid');
  this.currentFilter_ = filter;
  this.dataView_.refresh();
  this.slick_.render();
};


/**
 * @private
 * @param {!Object} item The row item to pass to the currentFilter_.
 * @return {boolean} Whether the specified item satisfies the currentFilter.
 */
pn.ui.grid.Grid.prototype.filterImpl_ = function(item) {
  if (this.quickFind_ && !this.quickFind_.matches(item)) { return false; }
  return !this.currentFilter_ || this.currentFilter_(item);
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

  var height = 80 + Math.min(550, this.list_.length * 25) + 'px;';
  var width = $(element).width();
  var gridContainer;
  var parent = goog.dom.createDom('div', 'grid-parent ' + this.spec_.type,
      this.noData_ = goog.dom.createDom('div', {
        'class': 'grid-no-data',
        'style': 'display:none'
      }, 'No matches found.'),
      gridContainer = goog.dom.createDom('div', {
        'class': 'grid-container',
        'style': 'width:' + width + 'px;height:' + height
      })
      );
  goog.dom.appendChild(element, parent);
  var hasData = this.list_.length > 0;

  if (hasData) {
    this.dataView_ = new pn.ui.grid.DataView();
    this.registerDisposable(this.dataView_);

    var columns = goog.array.map(this.cctxs_,
        goog.bind(this.getColumnSlickConfig_, this));
    this.slick_ = new Slick.Grid(gridContainer, this.dataView_,
        columns, this.cfg_.toSlick());

    if (this.totalColumns_.length) {
      this.totalsLegend_ = goog.dom.createDom('div', 'totals-legend');
      goog.dom.appendChild(element, this.totalsLegend_);
    }
  }

  goog.style.showElement(this.noData_, !hasData);
  goog.style.showElement(gridContainer, hasData);
};


/**
 * @private
 * @param {!pn.ui.grid.ColumnCtx} fctx The field context to convert to a slick
 *    grid column config.
 * @return {pn.ui.grid.ColumnSpec} A config object for a slick grid column.
 */
pn.ui.grid.Grid.prototype.getColumnSlickConfig_ = function(fctx) {
  var cfg = fctx.spec.toSlick();
  var renderer = fctx.getColumnRenderer();
  if (renderer) {
    cfg['formatter'] = function(row, cell, value, col, item) {
      return renderer(fctx, item);
    };
  }
  return cfg;
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
        /** @param {!pn.ui.grid.ColumnCtx} fctx1 The field context. */
        function(fctx1) { return fctx1.id === id; });
    var fctx = cctxs[cidx];
    delete cctxs[cidx];
    fctx.spec.width = widths[idx];
    ordered.push(fctx);
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
      /** @param {!pn.ui.grid.ColumnCtx} fctx1 The field context. */
      function(fctx1) { return fctx1.spec.name; });
  var gridData = [headers];
  var lencol = this.cctxs_.length;
  for (var row = 0, len = this.dataView_.getLength(); row < len; row++) {
    var rowData = this.dataView_.getItem(row);
    var rowTxt = [];

    for (var cidx = 0; cidx < lencol; cidx++) {
      var fctx = this.cctxs_[cidx];
      var val = rowData[fctx.spec.dataProperty];
      var renderer = fctx.getColumnRenderer();
      var txt = renderer ? renderer(fctx, rowData) : val;
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

  var hasOrderColumn = !this.cfg_.readonly && goog.array.findIndex(this.cctxs_,
      function(cctx) {
        return cctx.spec instanceof pn.ui.grid.OrderingColumnSpec;
      }) >= 0;
  var rowSelectionModel = new Slick.RowSelectionModel();
  // Selecting
  if (!this.cfg_.readonly) {
    if (this.cfg_.allowEdit) {
      this.slick_.setSelectionModel(rowSelectionModel);
      this.selectionHandler_ = goog.bind(this.handleSelection_, this);
      this.slick_.onSelectedRowsChanged.subscribe(this.selectionHandler_);
    }
    goog.array.forEach(this.commands_,
        /** @param {!pn.ui.grid.Command} c The command. */
        function(c) {
          this.getHandler().listen(c, c.eventType, function(e) {
            e.target = this;
            this.publishEvent_(e);
          });
        }, this);
  }
  if (!hasOrderColumn) {
    // Sorting
    this.slick_.onSort.subscribe(goog.bind(function(e, args) {
      this.sort_ = {
        'colid': args['sortCol']['id'],
        'asc': args['sortAsc']
      };
      var fctx = goog.array.find(this.cctxs_, function(fctx1) {
        return fctx1.id === args['sortCol']['id'];
      });
      this.dataView_.sort(function(a, b) {
        var x = fctx.getCompareableValue(a);
        var y = fctx.getCompareableValue(b);
        return (x === y ? 0 : (x > y ? 1 : -1));
      }, args['sortAsc']);
      this.saveGridState_();
    }, this));
  }

  this.dataView_.onRowsChanged.subscribe(goog.bind(function(e, args) {
    this.slick_.invalidateRows(args.rows);
    this.slick_.render();
  }, this));

  // Filtering
  this.dataView_.onRowCountChanged.subscribe(goog.bind(function() {
    this.slick_.updateRowCount();
    this.slick_.render();
    this.updateTotals_();
    goog.style.showElement(this.noData_, this.dataView_.getLength() === 0);
  }, this));


  // Initialise
  this.dataView_.beginUpdate();
  this.dataView_.setItems(this.list_, 'ID');
  this.dataView_.setFilter(goog.bind(this.filterImpl_, this));
  this.dataView_.endUpdate();

  // Quick Filters
  if (this.cfg_.enableQuickFilters) {
    this.quickFind_ = new pn.ui.grid.QuickFind(
        this.cache_, this.cctxs_, this.slick_);
    this.registerDisposable(this.quickFind_);
    this.quickFind_.init();
    if (this.cfg_.persistFilters) {
      var state = pn.storage.get(this.hash_);
      if (state) {
        var data = goog.json.unsafeParse(state);
        this.quickFind_.setFilterStates(data['filters']);
        var filtered = pn.ui.grid.QuickFind.EventType.FILTERED;
        this.getHandler().listen(this.quickFind_, filtered,
            goog.bind(this.saveGridState_, this));
      }
    }
  }

  if (hasOrderColumn) {
    this.rowOrdering_ = new pn.ui.grid.RowOrdering(this.slick_);
    this.registerDisposable(this.rowOrdering_);
    this.rowOrdering_.init();
    var ordered = pn.ui.grid.RowOrdering.EventType.ORDERED;
    this.getHandler().listen(this.rowOrdering_, ordered,
        goog.bind(this.publishEvent_, this));
  }

  var rfr = goog.bind(function() {
    if (this.quickFind_) { this.quickFind_.resize(); }
    this.saveGridState_();
  }, this);
  this.slick_.onColumnsReordered.subscribe(rfr);
  this.slick_.onColumnsResized.subscribe(rfr);

  this.setGridInitialSortState_();
};


/** @private */
pn.ui.grid.Grid.prototype.setGridInitialSortState_ = function() {
  var orderColumn = goog.array.find(this.cctxs_, function(cctx) {
    return cctx.spec instanceof pn.ui.grid.OrderingColumnSpec;
  });
  var state = pn.storage.get(this.hash_);
  if (!orderColumn && !state) return;
  var data = orderColumn ? {
    'sort': {
      'colid': orderColumn.spec.dataProperty,
      'asc': true
    }
  } : goog.json.unsafeParse(state);
  var col = null,
      asc = true;
  if (data['sort']) {
    col = data['sort']['colid'];
    asc = data['sort']['asc'];
  } else if (this.cfg_.defaultSortColumn) {
    col = this.cfg_.defaultSortColumn;
    asc = this.cfg_.defaultSortAscending;
  }
  if (col) {
    this.dataView_.fastSort(col, asc);
    this.slick_.setSortColumn(col, asc);
  }
};


/** @private */
pn.ui.grid.Grid.prototype.updateTotals_ = function() {
  if (!this.totalColumns_.length) return;

  var items = this.dataView_.getItems();
  var total = goog.array.reduce(items,
      function(acc, item) {
        goog.array.forEach(this.totalColumns_,
            /** @param {!pn.ui.grid.ColumnCtx} fctx The field context. */
            function(fctx) {
              if (acc[fctx.id] === undefined) acc[fctx.id] = 0;
              var itemVal = item[fctx.id];
              if (itemVal) acc[fctx.id] += itemVal;
            }, this);
        return acc;
      }, {}, this);
  var html = [];
  for (var field in total) {
    var fctx = /** @type {!pn.ui.grid.ColumnCtx} */ (
        goog.array.find(this.totalColumns_,
            /** @param {!pn.ui.grid.ColumnCtx} fctx1 The field context. */
            function(fctx1) {
          return fctx1.id === field;
        }));
    var val;
    var mockEntity = {};
    mockEntity[field] = total[field];
    var renderer = fctx.getColumnRenderer();
    if (renderer) { val = renderer(fctx, mockEntity); }
    else { val = parseInt(total[field], 10); }
    html.push('Total ' + fctx.spec.name + ': ' + val || '0');
  }
  this.totalsLegend_.innerHTML = '<ul><li>' +
      html.join('</li><li>') + '</li>';
};


/** @private */
pn.ui.grid.Grid.prototype.saveGridState_ = function() {
  var columns = this.slick_.getColumns();
  var data = {
    'ids': goog.array.map(columns, function(c) { return c['id']; }),
    'widths': goog.array.map(columns, function(c) { return c['width']; }),
    'sort': this.sort_
  };
  if (this.cfg_.persistFilters && this.quickFind_) {
    data['filters'] = this.quickFind_.getFilterStates();
  }
  pn.storage.set(this.hash_, pn.json.serialiseJson(data));
};


/**
 * @private
 * @param {Event} ev The selection event from the SlickGrid.
 * @param {Object} evData The data for the selection event.
 */
pn.ui.grid.Grid.prototype.handleSelection_ = function(ev, evData) {
  // Ignore if triggered by cell re-ordering.
  if (window.event.target.className.indexOf('cell-reorder') >= 0 ||
      (this.rowOrdering_ && this.rowOrdering_.isOrdering())) return;

  var idx = evData['rows'][0];
  var selected = this.dataView_.getItem(idx);
  var e = new goog.events.Event(pn.ui.grid.Grid.EventType.ROW_SELECTED, this);
  e.selected = selected;
  this.publishEvent_(e);
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
    case pn.ui.grid.Grid.EventType.ROW_SELECTED:
      var id = e.selected['ID'];
      pn.app.ctx.pub(ae.ENTITY_SELECT, this.spec_.type, id);
      break;
    case pn.ui.grid.Grid.EventType.ADD:
      pn.app.ctx.pub(ae.ENTITY_ADD, this.spec_.type);
      break;
    case pn.ui.grid.Grid.EventType.EXPORT_DATA:
      var data = e.target.getGridData();
      var format = e.exportFormat;
      pn.app.ctx.pub(ae.LIST_EXPORT, this.spec_.type, format, data);
      break;
    case pn.ui.grid.RowOrdering.EventType.ORDERED:
      pn.app.ctx.pub(ae.LIST_ORDERED, this.spec_.type, e.ids);
      break;
    default: throw new Error('Event: ' + e.type + ' is not supported');
  }
};


/** @override */
pn.ui.grid.Grid.prototype.disposeInternal = function() {
  pn.ui.grid.Grid.superClass_.disposeInternal.call(this);
  delete this.selectionHandler_;
  delete this.quickFind_;
  delete this.rowOrdering_;

  if (this.slick_) {
    var columns = this.slick_.getColumns();
    for (var c in columns) {
      for (var prop in c) { delete c[prop]; }
    }
    this.slick_.destroy();
  }
  if (this.dataView_) {
    this.dataView_.setFilter(null);
    delete this.dataView_;
  }
  delete this.slick_;
};


/** @enum {string} */
pn.ui.grid.Grid.EventType = {
  ROW_SELECTED: 'row-selected',
  ADD: 'add',
  EXPORT_DATA: 'export-data'
};
