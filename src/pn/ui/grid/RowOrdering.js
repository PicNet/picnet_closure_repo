;
goog.provide('pn.ui.grid.RowOrdering');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('pn.ui.filter.GenericListFilterOptions');
goog.require('pn.ui.filter.SearchEngine');
goog.require('pn.ui.grid.ColumnSpec');



/**
 * This code is mostly copied from:
 *   http://mleibman.github.com/SlickGrid/examples/example9-row-reordering.html
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {Slick.Grid} slick The instance of the slick grid.
 */
pn.ui.grid.RowOrdering = function(slick) {
  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {Slick.Grid}
   */
  this.slick_ = slick;

  /**
   * @private
   * @type {boolean}
   */
  this.ordering_ = false;
};
goog.inherits(pn.ui.grid.RowOrdering, goog.events.EventTarget);


/** @return {boolean} Wether we are currently ordering the grid. */
pn.ui.grid.RowOrdering.prototype.isOrdering = function() {
  return this.ordering_;
};


/** Initialises the quick filters and attaches the filters row to the grid */
pn.ui.grid.RowOrdering.prototype.init = function() {
  var moveRowsPlugin = new Slick.RowMoveManager();
  var grid = this.slick_;
  var self = this;

  moveRowsPlugin.onBeforeMoveRows.subscribe(function(e, data) {
    for (var i = 0; i < data.rows.length; i++) {
      // no point in moving before or after itself
      if (data.rows[i] == data.insertBefore ||
          data.rows[i] == data.insertBefore - 1) {
        e.stopPropagation();
        return false;
      }
    }
    self.ordering_ = true;
    return true;
  });

  moveRowsPlugin.onMoveRows.subscribe(function(e, args) {
    var extractedRows = [], left, right;
    var rows = args.rows;
    var dataView = grid.getData();
    var items = dataView.getItems();

    var insertBefore = args.insertBefore;
    left = items.slice(0, insertBefore);
    right = items.slice(insertBefore, items.length);

    rows.sort(function(a, b) { return a - b; });

    for (var i = 0; i < rows.length; i++) {
      extractedRows.push(items[rows[i]]);
    }

    rows.reverse();

    for (var i2 = 0; i2 < rows.length; i2++) {
      var row = rows[i2];
      if (row < insertBefore) {
        left.splice(row, 1);
      } else {
        right.splice(row - insertBefore, 1);
      }
    }

    items = left.concat(extractedRows.concat(right));

    var selectedRows = [];
    for (var i3 = 0; i3 < rows.length; i3++)
      selectedRows.push(left.length + i3);

    grid.resetActiveCell();
    dataView.setItems(items);
    grid.setSelectedRows(selectedRows);
    grid.render();

    self.ordering_ = false;

    var event = new goog.events.Event(pn.app.AppEvents.LIST_ORDERED);
    event.ids = goog.array.map(items, function(item) { return item.id; });
    self.dispatchEvent(event);
  });

  grid.registerPlugin(moveRowsPlugin);
};
