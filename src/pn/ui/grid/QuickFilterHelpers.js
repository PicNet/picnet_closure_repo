;
goog.provide('pn.ui.grid.QuickFilterHelpers');

goog.require('pn.ui.SpecDisplayItem');


/**
 * @param {pn.ui.grid.Column} col The column to apply the filter to.
 * @param {number} width The width of the control to create.
 * @param {string} value The value to display in the filter.
 * @return {!Element} The quick filter input control.
 */
pn.ui.grid.QuickFilterHelpers.createFilterInput =
    function(col, width, value) {
  var input = goog.dom.createDom('input', {'type': 'text'});
  goog.style.setWidth(input, width - 3);
  if (value) { input.value = value; }
  return input;
};
