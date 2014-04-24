goog.provide('pn.ui.SelectRowTable');
goog.provide('pn.ui.SelectRowTableItem');

goog.require('pn.ui.BaseControl');



/**
 * A very simple/minimalist implementation a selectable table (checkboxes).
 *
 * @constructor
 * @extends {pn.ui.BaseControl}
 * @param {!Element} el The parent element
 * @param {!Array.<string>} headers The headers to display on the table.
 * @param {!Array.<*>} rows The rows to display on the table.
 * @param {!string} cbheader The selection column header.
 * @param {string=} opt_classname The optional class name for the table.
 * @param {function(string, *):string=} opt_valResolver An optional function
 *    that allows you to define how a table cell is displayed.
 */
pn.ui.SelectRowTable = function(el, headers, rows, 
    cbheader, opt_classname, opt_valResolver) {
  pn.assInst(el, HTMLElement);
  pn.assArr(headers);
  pn.assArr(rows);
  pn.assStr(cbheader);
  pn.ass(!opt_classname || goog.isString(opt_classname));
  pn.ass(!opt_valResolver || goog.isFunction(opt_valResolver));

  pn.ui.BaseControl.call(this, el);

  /** @private @const @type {!Element} */
  this.el_ = el;

  /** @private @const @type {string} */
  this.cbheader_ = cbheader;

  /** @private @const @type {!Array.<string>} */
  this.headers_ = headers;

  /** @private @const @type {!Array.<*>} */
  this.rows_ = rows;

  /** @private @const @type {string} */
  this.tblclass_ = opt_classname || 'select-row-table';

  /** @private @const @type {null|function(string, *):string} */
  this.resolver_ = opt_valResolver || null;

  this.init_();
};
goog.inherits(pn.ui.SelectRowTable, pn.ui.BaseControl);


/** @return {!Array.<*>} The selected row values. */
pn.ui.SelectRowTable.prototype.selected = function() {
  return pn.toarr(
      goog.dom.getElementsByTagNameAndClass('input', null, this.el_)).
      pnmap(function(cb, idx) {
        return !!cb.checked ? this.rows_[idx] : null;
      }, this).
      pnfilter(function(r) { return !!r; });
};


/** @private */
pn.ui.SelectRowTable.prototype.init_ = function() {
  var headtr = '<th>' + this.cbheader_ + '</th>' + this.headers_.
      pnmap(function(h) { return '<th>' + h + '</th>'; }).join('');

  var arrrows = this.rows_.pnmap(function(r) {
    if (this.resolver_)
      return this.headers_.pnmap(
          function(h) { return this.resolver_(h, r); }, this);
    if (goog.isArray(r)) return r;
    if (goog.isObject(r)) return goog.object.getValues(r);
    throw new Error('Not Supported');
  }, this);

  var seltd = '<td><input type="checkbox"></input></td>';

  var rowstrs = arrrows.pnmap(function(rowarr) {
    return seltd + rowarr.pnmap(
        function(v) { return '<td>' +
              (goog.isDefAndNotNull(v) ? v : '') + '</td>'; }).join('');
  }, this);

  var html = '<table class="' + this.tblclass_ + '"><thead><tr>' + headtr +
      '</tr></thead><tbody>' + rowstrs.pnmap(function(r) {
        return '<tr>' + r + '</tr>';
      }).join('') + '</tbody></table>';

  this.el_.innerHTML = html;
};
