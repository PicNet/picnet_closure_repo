;
goog.provide('pn.ui.grid.pipe.FilteringHandler');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 * @param {string} gridId The unique grid id for the current grid.
 * @param {!pn.data.BaseDalCache} cache The data cache to use for related
 *    entities.
 */
pn.ui.grid.pipe.FilteringHandler = function(gridId, cache) {
  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.grid.pipe.FilteringHandler');

  /**
   * @private
   * @type {string}
   */
  this.storeId_ = gridId + '_filters';

  /**
   * @private
   * @type {!pn.data.BaseDalCache}
   */
  this.cache_ = cache;

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
};
goog.inherits(pn.ui.grid.pipe.FilteringHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.FilteringHandler.prototype.postRender = function() {
  this.view.setFilter(goog.bind(this.filterImpl_, this));
  if (this.cfg.enableQuickFilters) { this.initQuickFilters_(); }
};


/** @private */
pn.ui.grid.pipe.FilteringHandler.prototype.initQuickFilters_ = function() {
  // This can be null, in which case we do not add the quick find filter.
  var qfinp = goog.dom.getElement('quick-find');
  this.quickFind_ =
      new pn.ui.grid.QuickFind(this.cache_, this.cctxs, this.slick, qfinp);
  this.registerDisposable(this.quickFind_);
  this.initPersistentFilters_();
};


/** @private */
pn.ui.grid.pipe.FilteringHandler.prototype.initPersistentFilters_ =
    function() {
  if (!this.cfg.persistFilters) { return; }
  this.setSavedFilterStates_();
  var filteredEventType = pn.ui.grid.QuickFind.EventType.FILTERED;
  this.listen(this.quickFind_, filteredEventType, this.saveFilterStates_);
};


/** @private */
pn.ui.grid.pipe.FilteringHandler.prototype.setSavedFilterStates_ = function() {
  var statesStr = pn.storage.get(this.storeId_);
  if (!statesStr) { return; }
  var filterStates = /** @type {!Object.<string>} */
      (goog.json.unsafeParse(statesStr));
  this.quickFind_.setFilterStates(filterStates);
};


/** @private */
pn.ui.grid.pipe.FilteringHandler.prototype.saveFilterStates_ = function() {
  var jsonData = pn.json.serialiseJson(this.quickFind_.getFilterStates());
  pn.storage.set(this.storeId_, jsonData);
};


/**
 * @private
 * @param {!pn.data.Entity} entity The row item to pass to the currentFilter_.
 * @return {boolean} Whether the specified item satisfies the currentFilter.
 */
pn.ui.grid.pipe.FilteringHandler.prototype.filterImpl_ = function(entity) {
  if (this.quickFind_ && !this.quickFind_.matches(entity)) { return false; }
  return !this.currentFilter_ || this.currentFilter_(entity);
};


/** @override */
pn.ui.grid.pipe.FilteringHandler.prototype.onCustomEvent =
    function(eventType, opt_data) {
  if (eventType === 'resize' && this.quickFind_) { this.quickFind_.resize(); }
  if (eventType === 'filter') {
    this.filter_(/** @type {function(Object):boolean} */ (opt_data));
  }
};


/**
 * @private
 * @param {function(Object):boolean} filter The filter function to apply.
 */
pn.ui.grid.pipe.FilteringHandler.prototype.filter_ = function(filter) {
  pn.assFun(filter);

  this.log_.info('Filtering grid');
  this.currentFilter_ = filter;
  this.view.refresh();
  this.slick.render();
};
