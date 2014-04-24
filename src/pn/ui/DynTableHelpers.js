goog.provide('pn.ui.DynTableHelpers');


/**
 * @param {!pn.ui.BaseControl} parent The parent control or controller of
 *    this table.
 * @param {!Element} table The table control.
 * @param {function():undefined=} opt_cb Optional callback for row removal.
 */
pn.ui.DynTableHelpers.handleRemoveRow = function(parent, table, opt_cb) {
  pn.assInst(parent, pn.ui.BaseControl);
  pn.assInst(table, Element);

  var tr = pn.toarr(table.rows).pnlast(),
      remove = pn.toarr(tr.cells).pnlast().children[0];

  parent.ontap(remove, function() {
    var index = pn.toarr(table.rows).pnfindIndex(
        function(tr2) { return tr2 === tr; });
    table.deleteRow(index);
    if (opt_cb) opt_cb.call(parent);
  });
};


/**
 * @param {!pn.ui.BaseControl} parent The parent control or controller of
 *    this table.
 * @param {!Element} ul The UL control.
 * @param {function():undefined=} opt_cb Optional callback for row removal.
 */
pn.ui.DynTableHelpers.handleRemoveLi = function(parent, ul, opt_cb) {
  pn.assInst(parent, pn.ui.BaseControl);
  pn.assInst(ul, Element);

  var li = pn.toarr(ul.children).pnlast(),
      remove = /** @type {!Element} */ (goog.dom.getElementByClass(
          'table-list-remove', li));

  parent.ontap(remove, function() {
    goog.dom.removeNode(li);
    if (opt_cb) opt_cb.call(parent);
  });
};
