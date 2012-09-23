;
goog.provide('pn.ui.srch.SearchGrid');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.data.EntityFilter');
goog.require('pn.ui.grid.Grid');
goog.require('pn.ui.srch.SearchPanel');



/**
 *
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!pn.ui.UiSpec} spec The spec.
 * @param {!Array} list The entities to display.
 * @param {!pn.data.BaseDalCache} cache The data cache to use for related
 *    entities.
 */
pn.ui.srch.SearchGrid = function(spec, list, cache) {
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
   * @type {!pn.ui.srch.Config}
   */
  this.cfg_ = spec.getSearchConfig(cache);
  this.registerDisposable(this.cfg_);

  /**
   * @private
   * @type {!Array}
   */
  this.list_ = list;

  /**
   * @private
   * @type {!pn.data.BaseDalCache}
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
   * @type {!pn.data.EntityFilter}
   */
  this.filter_ = new pn.data.EntityFilter(this.cache_, spec);
  this.registerDisposable(this.filter_);
};
goog.inherits(pn.ui.srch.SearchGrid, goog.ui.Component);


/**
 * @param {!Object.<string>} filters The filters to use to filter the list by.
 */
pn.ui.srch.SearchGrid.prototype.filterList = function(filters) {
  goog.asserts.assert(filters);
  this.grid_.fireCustomPipelineEvent('filter', goog.bind(function(entity) {
    return this.filter_.filterEntity(entity, filters);
  }, this));
};


/** @override */
pn.ui.srch.SearchGrid.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.srch.SearchGrid.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  var parentDiv = goog.dom.createDom('div', 'filterable-list-container');
  var leftDiv = goog.dom.createDom('div', 'search-layout-container');
  var rightDiv = goog.dom.createDom('div', 'grid-layout-container');
  goog.dom.appendChild(element, parentDiv);
  goog.dom.appendChild(parentDiv, leftDiv);
  goog.dom.appendChild(parentDiv, rightDiv);

  this.decorateSeachPanel_(leftDiv);

  this.grid_ = new pn.ui.grid.Grid(this.spec_, this.list_, this.cache_);
  this.registerDisposable(this.grid_);
  this.grid_.decorate(rightDiv);
};


/**
 * @private
 * @param {Element} parent The parent to attach the search panel to.
 */
pn.ui.srch.SearchGrid.prototype.decorateSeachPanel_ = function(parent) {
  var filters = {};
  var showPrefix = this.cfg_.showTypePrefixes;
  this.cfg_.fCtxs.pnforEach(function(fctx) {
    if (pn.data.EntityUtils.isChildrenProperty(fctx.spec.dataProperty)) {
      return;
    }
    var filterid = this.spec_.id + '.' + fctx.id;
    var txt = (showPrefix ? this.spec_.name + ' - ' : '') + fctx.spec.name;
    filters[filterid] = txt;
  }, this);

  this.searchPanel_ = new pn.ui.srch.SearchPanel(filters, this.cfg_.fCtxs);
  this.registerDisposable(this.searchPanel_);
  this.searchPanel_.decorate(parent);
};


/** @override */
pn.ui.srch.SearchGrid.prototype.enterDocument = function() {
  pn.ui.srch.SearchGrid.superClass_.enterDocument.call(this);

  var searchEvent = pn.ui.srch.SearchPanel.SEARCH;
  this.getHandler().listen(this.searchPanel_, searchEvent, function(e) {
    this.filterList(e.filters);
  });
};
