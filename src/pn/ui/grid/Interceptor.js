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
 * @param {!Array.<!pn.data.Entity>} list The list to filter.
 * @return {!Array.<!pn.data.Entity>} The filtered list.
 */
pn.ui.grid.Interceptor.prototype.filterList = function(list) { return list; };


/**
 * Override this if you want to be change row css classes in this grid.
 * @param {!pn.data.Entity} e The row entity.
 * @return {string} Any additional css classes for this row.
 */
pn.ui.grid.Interceptor.prototype.rowCssClass = function(e) { return ''; };


/**
 * Override this if you want to be change row selection behaviour per row.
 * @param {!pn.data.Entity} e The row entity.
 * @return {boolean} Wether the specified row entity can be selected.
 */
pn.ui.grid.Interceptor.prototype.canSelect = function(e) { return true; };
