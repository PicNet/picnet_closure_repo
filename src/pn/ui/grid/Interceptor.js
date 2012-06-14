;
goog.provide('pn.ui.grid.Interceptor');

goog.require('goog.events.EventHandler');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.ui.grid.Interceptor = function() {
  goog.Disposable.call(this);

  /**
   * @protected
   * @type {!Object.<!Array.<!Object>>} The cache with all related entities.
   */
  this.cache = {};
};
goog.inherits(pn.ui.grid.Interceptor, goog.Disposable);


/**
 * Called by Grid when initising the interceptor.
 *
 * @param {!Object.<!Array.<!Object>>} cache The cache with all related
 *    entities.
 */
pn.ui.grid.Interceptor.prototype.init = function(cache) {
  this.cache = cache;
};


/**
 * Override this if you need to only display part of the results passed to the
 *    grid.  Careful with this, it may be better to do a custom server call
 *    and return less entities to this grid saving on bandwith also.
 * @param {!Array.<!Object>} list The list to filter.
 * @return {!Array.<!Object>} The filtered list.
 */
pn.ui.grid.Interceptor.prototype.filterList = function(list) { return list; };
