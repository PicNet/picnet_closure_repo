goog.provide('pn.ui.DynTableHelpers');


/**
 * @param {!pn.ui.BaseControl} parent The parent control or controller of
 *    this table.
 * @param {!Element} table The table control.
 */
pn.ui.DynTableHelpers.handleRemoveRow = function(parent, table) {
  pn.assInst(parent, pn.ui.BaseControl);
  pn.assInst(table, Element);

  var tr = pn.toarr(table.rows).pnlast(),
      remove = pn.toarr(tr.cells).pnlast().children[0];

  parent.ontap(remove, function() {
    var index = pn.toarr(table.rows).pnfindIndex(
        function(tr2) { return tr2 === tr; });
    table.deleteRow(index);
  });
};
