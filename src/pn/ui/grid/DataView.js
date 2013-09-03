
goog.provide('pn.ui.grid.DataView');

goog.require('goog.disposable.IDisposable');
goog.require('goog.events.EventHandler');
goog.require('pn');



/**
 * @constructor
 * @extends {Slick.Data.DataView}
 * @implements {goog.disposable.IDisposable}
 * @param {pn.ui.grid.Interceptor} interceptor The interceptor for this grid.
 * @param {Object=} opt_options Optional slick grid DataView options.
 */
pn.ui.grid.DataView = function(interceptor, opt_options) {
  var members = Slick.Data.DataView.call(this, opt_options);

  // Required as Slick.Data.DataView uses ugly style crockford encapsulation.
  goog.object.extend(this, members);

  /**
   * @private
   * @type {pn.ui.grid.Interceptor}
   */
  this.interceptor_ = interceptor;

  /**
   * @private
   * @type {Function}
   */
  this.origSetItems_ = this.setItems;

  /** @override */
  this.setItems = this.setItemsImpl_;

  /**
   * @private
   * @type {Function}
   */
  this.origGetItemMetadata_ = this.getItemMetadata;

  /** @override */
  this.getItemMetadata = this.getItemMetadata_;

  /**
   * @private
   * @type {!Array}
   */
  this.model_ = null;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
};
if (window['Slick'])
  goog.inherits(pn.ui.grid.DataView, Slick.Data.DataView);


/**
 * @private
 * @param {!Array.<!Object>} items The items to set in this data view.
 * @param {string} idprop The ID property name .
 */
pn.ui.grid.DataView.prototype.setItemsImpl_ = function(items, idprop) {
  pn.assArr(items);

  this.origSetItems_(items.pnclone(), idprop);
  this.model_ = items;
};


/**
 * @private
 * @param {number|string} row The row index.
 * @return {!Object} A map of metadata properties for this row.
 */
pn.ui.grid.DataView.prototype.getItemMetadata_ = function(row) {
  var item = this.getItem(row),
      ret = this.origGetItemMetadata_(row);
  if (item && this.interceptor_) {
    var additional = this.interceptor_.rowCssClass(item);
    if (additional) {
      ret = ret || {};
      ret['cssClasses'] = (ret['cssClasses'] || '') + ' ' + additional;
    }
  }

  return ret;
};


/**
 * @private
 * @param {!pn.mvc.ChangeEvent} e The change event with the details of
 *    changed items in the grid.
 */
pn.ui.grid.DataView.prototype.updateGrid_ = function(e) {
  pn.ass(e);

  var changes = e.changes;
  this.beginUpdate();
  changes.pnforEach(function(details) {
    if (details.inserted) {
      this.addItem(details.model);
    } else if (details.removed) {
      this.deleteItem(details.model.id);
    } else {
      this.updateItem(details.model.id, details.model);
    }
  }, this);
  this.endUpdate();
};


/** @override */
pn.ui.grid.DataView.prototype.dispose = function() {
  if (this.destroy) this.destroy();

  goog.dispose(this.eh_);

  delete this.interceptor_;
  delete this.eh_;
};


/** @override */
pn.ui.grid.DataView.prototype.isDisposed = function() {
  return this.eh_.isDisposed();
};
