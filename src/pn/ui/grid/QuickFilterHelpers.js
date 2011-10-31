;
goog.provide('pn.ui.grid.QuickFilterHelpers');

goog.require('pn.ui.SpecDisplayItem');


/**
 * @param {pn.ui.grid.Column} col The column to apply the filter to.
 * @param {number} width The width of the control to create.
 * @param {string} value The value to display in the filter.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @return {!Element} The quick filter input control.
 */
pn.ui.grid.QuickFilterHelpers.createFilterInput =
    function(col, width, value, cache) {
  var inp;
  if (col.source) {
    width += 2;
    inp = pn.ui.edit.FieldBuilder.createParentEntitySelect(col, -1, cache);
  } else if (col.formatter) {
    value = '';
    width += 2;
    inp.innerHTML = '&nbsp;';
  } else {
    width -= 2;
    inp = goog.dom.createDom('input', {'type': 'text'});
  }
  goog.style.setWidth(inp, width);
  if (value) { inp.value = value; }
  return inp;
};
