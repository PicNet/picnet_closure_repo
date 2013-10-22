
goog.provide('pn.ui.grid.DataView');

goog.require('goog.disposable.IDisposable');
goog.require('goog.events.EventHandler');
goog.require('pn');
goog.require('pn.mvc.Collection');



/**
 * @constructor
 * @implements {goog.disposable.IDisposable}
 * @param {pn.ui.grid.Interceptor} interceptor The interceptor for this grid.
 * @param {Object=} opt_options Optional slick grid DataView options.
 */
pn.ui.grid.DataView = function(interceptor, opt_options) {

  /**
   * @private
   * @type {!Slick.Data.DataView}
   */
  this.dv_ = new Slick.Data.DataView(opt_options);

  /**
   * @private
   * @type {pn.ui.grid.Interceptor}
   */
  this.interceptor_ = interceptor;

  /**
   * @private
   * @type {pn.mvc.Collection}
   */
  this.model_ = null;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
};


/** @return {!Slick.Data.DataView} The Slick.Data.DataView implementation. */
pn.ui.grid.DataView.prototype.getDv = function() { return this.dv_; };


/**
 * @param {!Array.<!Object>} items The items to set in this data view.
 * @param {string} idprop The ID property name .
 */
pn.ui.grid.DataView.prototype.setItems = function(items, idprop) {
  pn.assArr(items);

  this.dv_.beginUpdate();
  this.dv_.setItems(items.pnmap(function(e) {
    e[idprop] = e.getValue(idprop);
    return e;
  }), idprop);
  this.dv_.endUpdate();
  if (this.model_) {
    this.eh_.unlisten(this.model_, pn.mvc.EventType.CHANGE, this.updateGrid_);
    goog.dispose(this.model_);
  }
  this.model_ = new pn.mvc.Collection(items);
  this.eh_.listen(this.model_, pn.mvc.EventType.CHANGE, this.updateGrid_);
};


/**
 * @param {number} row The row index.
 * @return {!Object} A map of metadata properties for this row.
 */
pn.ui.grid.DataView.prototype.getItemMetadata = function(row) {
  pn.assNum(row);

  var item = this.dv_.getItem(row),
      ret = this.dv_.getItemMetadata(row) || {};
  if (item && this.interceptor_) {
    var additional = this.interceptor_.rowCssClass(item);
    if (additional) {
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
  this.dv_.beginUpdate();
  changes.pnforEach(function(details) {
    if (details.inserted) {
      this.dv_.addItem(details.model);
    } else if (details.removed) {
      this.dv_.deleteItem(details.model.id);
    } else {
      this.dv_.updateItem(details.model.id, details.model);
    }
  }, this);
  this.dv_.endUpdate();
};


/** @override */
pn.ui.grid.DataView.prototype.dispose = function() {
  if (this.dv_.destroy) this.dv_.destroy();

  goog.dispose(this.model_);
  goog.dispose(this.eh_);

  delete this.interceptor_;
  delete this.eh_;
  delete this.model_;
};


/** @override */
pn.ui.grid.DataView.prototype.isDisposed = function() {
  return this.eh_.isDisposed();
};
