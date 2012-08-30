;
goog.provide('pn.ui.grid.Interceptor');

goog.require('goog.events.EventHandler');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.data.BaseDalCache} cache The cache with all
 *    related entities.
 */
pn.ui.grid.Interceptor = function(cache) {
  goog.Disposable.call(this);

  /**
   * @protected
   * @type {!pn.data.BaseDalCache} The cache with all related entities.
   */
  this.cache = cache;
};
goog.inherits(pn.ui.grid.Interceptor, goog.Disposable);


/**
 * Override this if you need to only display part of the results passed to the
 *    grid.  Careful with this, it may be better to do a custom server call
 *    and return less entities to this grid saving on bandwith also.
 * @param {!Array.<!Object>} list The list to filter.
 * @return {!Array.<!Object>} The filtered list.
 */
pn.ui.grid.Interceptor.prototype.filterList = function(list) { return list; };
