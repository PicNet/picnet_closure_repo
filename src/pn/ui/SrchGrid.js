;
goog.provide('pn.ui.SrchGrid');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.data.EntityFilter');
goog.require('pn.ui.grid.Grid');
goog.require('pn.ui.grid.Grid.EventType');
goog.require('pn.ui.srch.SearchPanel');



/**
 *
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!pn.ui.UiSpec} spec The spec.
 * @param {!Array} list The entities to display.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 */
pn.ui.SrchGrid = function(spec, list, cache) {
  goog.asserts.assert(list);
  goog.asserts.assert(cache);

  goog.ui.Component.call(this);

  /**
   * @private
   * @type {!pn.ui.UiSpec}
   */
  this.spec_ = spec;

  /**
   * @private
   * @type {!Array}
   */
  this.list_ = list;

  /**
   * @private
   * @type {!Object.<Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {pn.ui.grid.Grid}
   */
  this.grid_ = null;

  /**
   * @private
   * @type {pn.ui.srch.SearchPanel}
   */
  this.searchPanel_ = null;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);

  /**
   * @private
   * @type {!pn.data.EntityFilter}
   */
  this.filter_ = new pn.data.EntityFilter(this.cache_, spec);
};
goog.inherits(pn.ui.SrchGrid, goog.ui.Component);


/**
 * @param {!Object.<string>} filters The filters to use to filter the list by.
 */
pn.ui.SrchGrid.prototype.filterList = function(filters) {
  goog.asserts.assert(filters);
  this.grid_.filter(goog.bind(function(rc) {
    return this.filter_.filterEntity(rc, filters);
  }, this));
};


/** @inheritDoc */
pn.ui.SrchGrid.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.SrchGrid.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  var parentDiv = goog.dom.createDom('div', 'filterable-list-container');
  var leftDiv = goog.dom.createDom('div', 'search-layout-container');
  var rightDiv = goog.dom.createDom('div', 'grid-layout-container');
  goog.dom.appendChild(element, parentDiv);
  goog.dom.appendChild(parentDiv, leftDiv);
  goog.dom.appendChild(parentDiv, rightDiv);

  this.decorateSeachPanel_(leftDiv);

  this.grid_ = new pn.ui.grid.Grid(this.spec_, this.list_, this.cache_);
  this.grid_.decorate(rightDiv);
  // Allow all grid events to pass through 'this' Event Target.  This
  // allows anyone to listen to the grid events by listening to this class
  this.grid_.dispatchEvent = goog.bind(this.dispatchEvent, this);
};


/**
 * @private
 * @param {Element} parent The parent to attach the search panel to.
 */
pn.ui.SrchGrid.prototype.decorateSeachPanel_ = function(parent) {
  var filters = {};
  var showPrefix = this.spec_.searchConfig.showTypePrefixes;
  goog.array.forEach(this.spec_.searchConfig.fields, function(field) {
    if (field.tableType) { return; } // Ignore inner tables
    var filterid = this.spec_.id + '.' + field.id;
    var txt = (showPrefix ? this.spec_.name + ' - ' : '') + field.name;
    filters[filterid] = txt;
  }, this);

  this.searchPanel_ = new pn.ui.srch.SearchPanel(filters, this.cache_);
  this.searchPanel_.decorate(parent);
};


/** @inheritDoc */
pn.ui.SrchGrid.prototype.enterDocument = function() {
  pn.ui.SrchGrid.superClass_.enterDocument.call(this);

  var searchEvent = pn.ui.srch.SearchPanel.SEARCH;
  this.eh_.listen(this.searchPanel_, searchEvent, this.filterList);
};


/** @inheritDoc */
pn.ui.SrchGrid.prototype.disposeInternal = function() {
  pn.ui.SrchGrid.superClass_.disposeInternal.call(this);

  this.eh_.removeAll();
  goog.dispose(this.eh_);
  goog.dispose(this.grid_);
  goog.dispose(this.searchPanel_);
  goog.dispose(this.filter_);
  goog.dispose(this.spec_);

  delete this.eh_;
  delete this.list_;
  delete this.cache_;
  delete this.grid_;
  delete this.searchPanel_;
  delete this.filter_;
  delete this.spec_;
};
