;
goog.provide('pn.ui.grid.Grid');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.ui.grid.Column');
goog.require('pn.ui.grid.Config');



/**
 * The pn.ui.grid.Grid is built atop SlickGrid
 * (https://github.com/mleibman/SlickGrid/).  See SlickGrid documentation for
 * full detauils.
 *
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!Array} list The entities to display.
 * @param {!Array.<pn.ui.grid.Column>} cols The columns to display.
 * @param {!pn.ui.grid.Config} cfg The grid configuration.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 */
pn.ui.grid.Grid = function(list, cols, cfg, cache) {
  goog.asserts.assert(goog.isDefAndNotNull(list));
  goog.asserts.assert(cols);
  goog.asserts.assert(cfg);
  goog.asserts.assert(cache);

  goog.ui.Component.call(this);

  /**
   * @private
   * @type {!Array}
   */
  this.list_ = list;

  /**
   * @private
   * @type {!Array.<pn.ui.grid.Column>}
   */
  this.cols_ = cols;

  /**
   * @private
   * @type {!pn.ui.grid.Config}
   */
  this.cfg_ = cfg;

  /**
   * @private
   * @type {!Object.<Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {Object}
   */
  this.slick_ = null;

  /**
   * @private
   * @type {Function}
   */
  this.selectionHandler_ = null;
};
goog.inherits(pn.ui.grid.Grid, goog.ui.Component);


/** @inheritDoc */
pn.ui.grid.Grid.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.grid.Grid.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  var opts = {'class': 'grid-container', 'style': 'display:none'};
  var div = goog.dom.createDom('div', opts);
  goog.dom.appendChild(element, div);


  this.slick_ = new window['Slick']['Grid'](div, this.list_,
      goog.array.map(this.cols_, function(c) {
        var formatter = c.formatter ||
            c.source ? goog.bind(this.parentColumnFormatter_, this) : null;
        return c.toSlick(formatter);
      }, this),
      this.cfg_.toSlick());

  goog.style.showElement(div, true);
};


/**
 * @private
 * @param {number} row The row index.
 * @param {number} cell The cell index.
 * @param {Object} value The raw cell value.
 * @param {Object} col The Slick column config object.
 * @param {Object} dataContext entity data being displayed in this row.
 * @return {string} The html to render for this field.
 */
pn.ui.grid.Grid.prototype.parentColumnFormatter_ =
    function(row, cell, value, col, dataContext) {
  if (!value) return '';
  var type = col.source;
  var entity = goog.array.find(this.cache_[type], function(e) {
    return e[type + 'ID'] === value;
  }, this);
  if (!entity) throw new Error('Could not find related entity of type[' +
      type + '] id[' + value + ']');
  return entity[col.sourceField || (type + 'Name')];
};


/** @inheritDoc */
pn.ui.grid.Grid.prototype.enterDocument = function() {
  pn.ui.grid.Grid.superClass_.enterDocument.call(this);

  this.slick_['setSelectionModel'](new window['Slick']['RowSelectionModel']());
  this.selectionHandler_ = goog.bind(this.handleSelection_, this);
  this.slick_['onSelectedRowsChanged']['subscribe'](this.selectionHandler_);
};


/** @inheritDoc */
pn.ui.grid.Grid.prototype.exitDocument = function() {
  pn.ui.grid.Grid.superClass_.exitDocument.call(this);

  this.slick_['onSelectedRowsChanged']['unsubscribe'](this.selectionHandler_);
};


/**
 * @private
 * @param {Event} ev The selection event from the SlickGrid.
 * @param {Object} evData The data for the selection event.
 */
pn.ui.grid.Grid.prototype.handleSelection_ = function(ev, evData) {
  var idx = evData['rows'][0];
  var selected = this.list_[idx];
  var event = new goog.events.Event(goog.ui.Component.EventType.CHANGE, this);
  event.selected = selected;
  this.dispatchEvent(event);
};


/** @inheritDoc */
pn.ui.grid.Grid.prototype.disposeInternal = function() {
  pn.ui.grid.Grid.superClass_.disposeInternal.call(this);

  goog.array.forEach(this.cols_, goog.dispose);
  goog.dispose(this.cfg_);
  if (this.slick_) this.slick_['destroy']();
  goog.dispose(this.slick_);
  delete this.slick_;
  delete this.cfg_;
};
