
goog.provide('pn.ui.grid.DataView');

goog.require('goog.disposable.IDisposable');
goog.require('goog.events.EventHandler');
goog.require('pn.model.Collection');



/**
 * @constructor
 * @extends {Slick.Data.DataView}
 * @implements {goog.disposable.IDisposable}
 * @param {Object=} opt_options Optional slick grid DataView options.
 */
pn.ui.grid.DataView = function(opt_options) {
  var members = Slick.Data.DataView.call(this, opt_options);

  // Required as Slick.Data.DataView uses ugly style crockford encapsulation.
  goog.object.extend(this, members);

  /**
   * @private
   * @type {Function}
   */
  this.origSetItems_ = this.setItems;

  /** @override */
  this.setItems = this.setItemsImpl_;

  /**
   * @private
   * @type {pn.model.Collection}
   */
  this.model_ = null;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
};
goog.inherits(pn.ui.grid.DataView, Slick.Data.DataView);


/**
 * @private
 * @param {!Array.<!Object>} items The items to set in this data view.
 * @param {string} objectIdProperty The ID property name .
 */
pn.ui.grid.DataView.prototype.setItemsImpl_ =
    function(items, objectIdProperty) {
  goog.asserts.assert(goog.isArray(items));

  this.origSetItems_(items, objectIdProperty);

  if (this.model_) {
    this.eh_.unlisten(this.model_, pn.model.EventType.CHANGE, this.updateGrid_);
    goog.dispose(this.model_);
  }
  // TODO: Dissabled for now, throwing to many changes
  // this.model_ = new pn.model.Collection(items);
  // this.eh_.listen(this.model_, pn.model.EventType.CHANGE, this.updateGrid_);
};


/**
 * @private
 * @param {!pn.model.ChangeEvent} e The change event with the details of
 *    changed items in the grid.
 */
pn.ui.grid.DataView.prototype.updateGrid_ = function(e) {
  goog.asserts.assert(e);

  var changes = e.changes;
  this.beginUpdate();
  goog.array.forEach(changes, function(details) {
    if (details.item) this.updateItem(details.item['ID'], details.item);
  }, this);
  this.endUpdate();
};


/** @override */
pn.ui.grid.DataView.prototype.dispose = function() {
  goog.dispose(this.model_);
  goog.dispose(this.eh_);
};


/** @override */
pn.ui.grid.DataView.prototype.isDisposed = function() {
  return this.eh_.isDisposed();
};
