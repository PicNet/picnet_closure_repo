;
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.string');
goog.require('goog.style');
goog.require('pn.ui.filter.GenericListFilter');
goog.require('pn.ui.filter.TableFilterOptions');

goog.provide('pn.ui.filter.TableFilter');



/**
 * @constructor
 * @extends {pn.ui.filter.GenericListFilter}
 * @export
 *
 * @param {!HTMLTableElement} grid The HtmlTable element to add the PicNet
 *    table filter to.
 * @param {!pn.ui.filter.TableFilterOptions} opts The options for filtering.
 *    Since this options has to work outside of the closure environment all
 *    field names should be accessed as strings.
 */
pn.ui.filter.TableFilter = function(grid, opts) {
  // Backwards compatibility
  if (opts['matchingRow']) opts['matchingElement'] = opts['matchingRow'];
  if (opts['filteringRows']) opts['filteringElements'] = opts['filteringRows'];
  if (opts['filteredRows']) opts['filteredElements'] = opts['filteredRows'];

  pn.ui.filter.GenericListFilter.call(this, null, grid, opts);

  /**
   * @private
   * @type {Array.<number>}
   */
  this.filterColumnIndexes_;

  /**
   * @private
   * @type {Array.<!Element>}
   */
  this.headers_;

  /**
   * @private
   * @type {Element}
   */
  this.thead_;

  /**
   * @private
   * @type {Element}
   */
  this.tbody_;
};
goog.inherits(pn.ui.filter.TableFilter, pn.ui.filter.GenericListFilter);


/**
* @private
* @type {number}
*/
pn.ui.filter.TableFilter.grididx_ = 0;


/** @override */
pn.ui.filter.TableFilter.prototype.initialiseFilters = function() {
  this.tbody_ = goog.dom.getElementsByTagNameAndClass(
      'tbody', null, this.list)[0];
  this.thead_ = goog.dom.getElementsByTagNameAndClass(
      'thead', null, this.options['frozenHeaderTable'] || this.list)[0];

  if (!this.thead_) {
    var trTableRow = goog.dom.getElementsByTagNameAndClass(
        'tr', null, this.tbody_)[0];
    var tdCells = goog.dom.getElementsByTagNameAndClass('td', null, trTableRow);
    var thead = goog.dom.createDom('thead', null);
    goog.dom.insertChildAt(this.list, thead, 0);
    var tr = goog.dom.createDom('tr', null);
    goog.dom.appendChild(thead, tr);
    for (var i = 0; i < tdCells.length; i++) {
      var th = goog.dom.createDom('th', null);
      th.innerHTML = 'col' + i;
      goog.dom.appendChild(tr, th);
    }

    this.thead_ = thead;
  }
  pn.ui.filter.TableFilter.superClass_.initialiseFilters.call(this);
};


/** @override */
pn.ui.filter.TableFilter.prototype.initialiseControlCaches = function() {
  var headerRows = /** @type {!Array.<!Element>} */(
      goog.dom.getElementsByTagNameAndClass('tr', null, this.thead_));
  var filterRow = /** @type {!Array.<!Element>} */(
      goog.dom.getElementsByTagNameAndClass('tr', 'filters', this.thead_));
  if (headerRows.length > 1 && filterRow.length > 0) {
    this.headers_ = /** @type {!Array.<!Element>} */(
        goog.dom.getElementsByTagNameAndClass(
            'th', null, headerRows[headerRows.length - 2]));
  } else if (headerRows.length > 0) {
    this.headers_ = /** @type {!Array.<!Element>} */(
        goog.dom.getElementsByTagNameAndClass(
            'th', null, headerRows[headerRows.length - 1]));
  }

  this.listItems = /** @type {!Array.<!Element>} */(
      goog.dom.getElementsByTagNameAndClass('tr', null, this.tbody_));

  this.buildFiltersRow_();

  var tHeadFilters = goog.dom.getElementsByTagNameAndClass(
      'tr', 'filters', this.thead_)[0];
  this.filters = /** @type {!Array.<!Element>} */(goog.array.concat(
      goog.array.map(goog.dom.getElementsByTagNameAndClass(
      'input', null, tHeadFilters), function(ctl) { return ctl; }),
      goog.array.map(goog.dom.getElementsByTagNameAndClass(
      'select', null, tHeadFilters), function(ctl) { return ctl; })
      ));
  this.filterColumnIndexes_ = goog.array.map(
      this.filters, this.getColumnIndexOfFilter_, this);
};


/**
 * @private
 * @param {!Element} f The filter whose index in the table we are after.
 * @return {number} The index of the given filter in the parent row.
 */
pn.ui.filter.TableFilter.prototype.getColumnIndexOfFilter_ = function(f) {
  var td = goog.dom.getAncestorByTagNameAndClass(f, goog.dom.TagName.TD);
  if (!td || td.length <= 0) { return -1; }
  var tr = goog.dom.getAncestorByTagNameAndClass(td, goog.dom.TagName.TR);
  var cells = (tr.getElementsByTagName('td'));
  return goog.array.indexOf(cells, td);
};


/** @private */
pn.ui.filter.TableFilter.prototype.buildFiltersRow_ = function() {
  var filterRow = goog.dom.getElementsByTagNameAndClass(
      'tr', 'filters', this.thead_);
  if (filterRow.length > 0) {
    goog.dom.removeNode(filterRow[0]);
  }
  var tr = goog.dom.createDom('tr', { 'class': 'filters' });
  for (var i = 0; i < this.headers_.length; i++) {
    var header = this.headers_[i];
    var visible = goog.style.isElementShown(header);
    if (!visible) {
      continue;
    }

    var headerText = header.getAttribute('filter') === 'false' || !visible ?
        '' : goog.dom.getTextContent(header);
    var filterClass = header.getAttribute('filter-class');
    /** @type {Element} */
    var td;
    if (headerText && headerText.length > 0) {
      var filter = this.getFilterDom_(i, header);
      goog.style.setStyle(filter, 'width', '95%');
      td = goog.dom.createDom('td', null, filter);
    } else {
      td = goog.dom.createDom('td', { }, '');
    }

    if (filterClass) {
      goog.dom.classes.add(td, filterClass);
    }
    goog.dom.appendChild(tr, td);
  }
  goog.dom.appendChild(this.thead_, tr);
};


/**
 * @private
 * @param {number} colIdx The column index for this filter.
 * @param {!Element} header The TH element to attach this filter to.
 * @return {!Element} The filter DOM element.
 */
pn.ui.filter.TableFilter.prototype.getFilterDom_ = function(colIdx, header) {
  var filterType = header.getAttribute('filter-type') || 'text';
  switch (filterType) {
    case 'text': return goog.dom.createDom('input', {
      'type': 'text',
      'id': this.getListId() + '_filter_' + colIdx,
      'class': 'filter',
      'title': this.options['filterToolTipMessage']
    });
    case 'ddl': return this.getSelectFilter_(colIdx);
    default: throw 'filter-type: ' + filterType + ' is not supported';
  }
};


/**
 * @private
 * @param {number} colIdx The column index to create a SELECT filter for.
 * @return {!Element} The created SELECT DOM element.
 */
pn.ui.filter.TableFilter.prototype.getSelectFilter_ = function(colIdx) {
  var select = goog.dom.createDom('select', {
    'id': this.getListId() + '_filter_' + colIdx,
    'class': 'filter'
  }, goog.dom.createDom('option', {}, this.options['selectOptionLabel']));
  var cells = goog.array.map(this.listItems, function(r) {
    return r.cells[colIdx];
  });
  var values = [];
  goog.array.forEach(cells, function(td) {
    var txt = goog.string.trim(goog.dom.getTextContent(td));
    if (!txt || txt === '&nbsp;' || goog.array.indexOf(values, txt) >= 0) {
      return;
    }
    values.push(txt);
  });
  values.sort();

  goog.array.forEach(values, function(txt) {
    goog.dom.appendChild(select, goog.dom.createDom('option', {
      'value': txt.replace('"', '&quot;')
    }, txt));
  });

  return select;
};


/** @override */
pn.ui.filter.TableFilter.prototype.getFilterStates = function() {
  var filterStates = [];

  for (var i = 0; i < this.filters.length; i++) {
    var state = this.getFilterStateForFilter(this.filters[i]);
    if (state) { filterStates.push(state); }
  }

  if (!this.options['additionalFilterTriggers']) return filterStates;

  for (i = 0; i < this.options['additionalFilterTriggers'].length; i++) {
    state = this.getFilterStateForFilter(
        this.options['additionalFilterTriggers'][i]);
    if (state) filterStates.push(state);
  }
  return filterStates;
};


/**
 * @protected
 * @param {!Element} filter The filter whose state we require.
 * @return {pn.ui.filter.FilterState} The filter state for the specified filter.
 */
pn.ui.filter.TableFilter.prototype.getFilterStateForFilter = function(filter) {
  var state = pn.ui.filter.TableFilter.superClass_.
      getFilterStateForFilter.call(this, filter);
  if (state) { state.idx = this.getColumnIndexOfFilter_(filter); }
  return state;
};


/** @override */
pn.ui.filter.TableFilter.prototype.doesElementContainText =
    function(state, tr, textTokens) {
  var cells = tr.getElementsByTagName('td');
  var columnIdx = state === null ? -1 : state.idx;
  if (columnIdx < 0) {
    var txt = [];
    for (var i = 0; i < cells.length; i++) {
      var header = this.headers_[i];
      var visible = goog.style.isElementShown(header);
      if (!visible || header.getAttribute('filter') === 'false') { continue; }
      txt.push(goog.string.trim(goog.dom.getTextContent(cells[i])));
    }
    return pn.ui.filter.TableFilter.superClass_.doesElementContainText.
        call(this, state, tr, textTokens, txt.join('\t'));
  }
  else {
    return pn.ui.filter.TableFilter.superClass_.doesElementContainText.
        call(this, state, cells[columnIdx], textTokens);
  }

};
