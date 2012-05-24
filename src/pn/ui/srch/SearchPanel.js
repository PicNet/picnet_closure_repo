;
goog.provide('pn.ui.srch.SearchPanel');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.fx.dom.ResizeHeight');
goog.require('goog.net.cookies');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.ui.edit.FieldBuilder');
goog.require('pn.ui.filter.GenericListFilterOptions');
goog.require('pn.ui.grid.ColumnSpec');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.Grid');
goog.require('pn.ui.grid.Grid.EventType');



/**
 *
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!Object.<string>} filters The id/caption map to show in the filter
 *    list.
 * @param {!Object.<Array>} cache The entities cache used for showin parental
 *    properties in the filters.
 */
pn.ui.srch.SearchPanel = function(filters, cache) {
  goog.asserts.assert(filters);
  goog.asserts.assert(cache);

  goog.ui.Component.call(this);

  /**
   * @private
   * @type {!Object.<string>}
   */
  this.filters_ = filters;

  /**
   * @private
   * @type {!Object.<Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {Element}
   */
  this.select_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.clear_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.go_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.searchPanel_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.controlsPanel_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.filtersPanel_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.toggle_ = null;

  /**
   * @private
   * @type {goog.fx.dom.ResizeHeight}
   */
  this.resizeShow_ = null;

  /**
   * @private
   * @type {goog.fx.dom.ResizeHeight}
   */
  this.resizeHide_ = null;

  /**
   * @private
   * @type {number}
   */
  this.panelHeight_ = 170;

  /**
   * @private
   * @type {!Object.<string, !Array.<!(Element|goog.ui.Component)>>}
   */
  this.filtersControls_ = {};

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.srch.SearchPanel');
};
goog.inherits(pn.ui.srch.SearchPanel, goog.ui.Component);


/** @type {string} */
pn.ui.srch.SearchPanel.SEARCH = 'search';


/** @inheritDoc */
pn.ui.srch.SearchPanel.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.srch.SearchPanel.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  var visible = goog.net.cookies.get('search-panel-visible') !== 'false';
  var msg = (visible ? 'Hide' : 'Show') + ' Filters';
  var title = 'Click to ' + (visible ? 'hide' : 'show') + ' the filters panel.';
  this.toggle_ = goog.dom.createDom('a', {
    'class': 'search-toggle',
    'title': title}, msg);
  this.searchPanel_ = goog.dom.createDom('div', 'search-panel');
  this.filtersPanel_ = goog.dom.createDom('div', 'filters-panel');
  goog.style.setHeight(this.searchPanel_, visible ? 'auto' : 0);

  this.createActionControls_(this.searchPanel_);

  goog.dom.appendChild(this.searchPanel_, this.filtersPanel_);
  goog.dom.appendChild(element, this.searchPanel_);
  goog.dom.appendChild(element, this.toggle_);
};


/**
 * @private
 * @param {!Element} parent The parent for this panel.
 */
pn.ui.srch.SearchPanel.prototype.createActionControls_ = function(parent) {
  this.controlsPanel_ = goog.dom.createDom('div', 'controls-panel');
  goog.dom.appendChild(parent, this.controlsPanel_);

  this.select_ = goog.dom.createDom('select', 'search-select');
  goog.dom.appendChild(this.controlsPanel_, this.select_);

  this.populateFieldSelect_();
  this.clear_ = goog.dom.createDom('div', {
    'class': 'button clear-filters',
    'title': 'Clear all filters'
  }, 'Clear');
  this.go_ = goog.dom.createDom('div', {
    'class': 'button go-filters',
    'title': 'Go!'
  }, 'Go');
  goog.dom.appendChild(this.controlsPanel_, this.clear_);
  goog.dom.appendChild(this.controlsPanel_, this.go_);
};


/** @private */
pn.ui.srch.SearchPanel.prototype.populateFieldSelect_ = function() {
  goog.dom.removeChildren(this.select_);
  goog.dom.appendChild(this.select_, goog.dom.createDom('option',
      {'value': ''}, 'Select a field to filter by'));

  var options = [];
  for (var fid in this.filters_) {
    var name = this.filters_[fid];
    options.push(goog.dom.createDom('option', {'value': fid}, name));
  }

  goog.array.sortObjectsByKey(options, 'innerHTML');
  goog.array.forEach(options, function(o) {
    goog.dom.appendChild(this.select_, o);
  }, this);
};


/** @inheritDoc */
pn.ui.srch.SearchPanel.prototype.enterDocument = function() {
  pn.ui.srch.SearchPanel.superClass_.enterDocument.call(this);

  var et = goog.events.EventType;
  this.eh_.listen(this.toggle_, et.CLICK, this.toggleFiltersPanel_);
  this.eh_.listen(this.go_, et.CLICK, this.doSearch_);
  this.eh_.listen(this.clear_, et.CLICK, this.doClear_);
  this.eh_.listen(this.select_, et.CHANGE, this.filterSelected_);
};


/** @private */
pn.ui.srch.SearchPanel.prototype.toggleFiltersPanel_ = function() {
  var showing = this.toggle_.innerHTML === 'Show Filters';
  if (!showing) {
    this.panelHeight_ = goog.style.getSize(this.searchPanel_).height;
  }
  goog.net.cookies.set('search-panel-visible', showing.toString());
  if (!this.resizeShow_) {
    var dur = 175;
    var rh = goog.fx.dom.ResizeHeight;
    this.resizeShow_ = new rh(this.searchPanel_, 0, this.panelHeight_, dur);
    this.resizeHide_ = new rh(this.searchPanel_, this.panelHeight_, 0, dur);
    var endEventType = goog.fx.Transition.EventType.END;
    this.eh_.listen(this.resizeShow_, endEventType, goog.bind(function() {
      goog.style.setHeight(this.searchPanel_, 'auto');
    }, this));
  } else {
    this.resizeHide_.start = this.panelHeight_;
    this.resizeShow_.end = this.panelHeight_;
  }
  this.toggle_.innerHTML = showing ? 'Hide Filters' : 'Show Filters';
  (!showing ? this.resizeShow_ : this.resizeHide_).stop(true);
  (showing ? this.resizeShow_ : this.resizeHide_).play(true);
};


/** @private */
pn.ui.srch.SearchPanel.prototype.doSearch_ = function() {
  var filters = {};
  for (var cid in this.filtersControls_) {
    var control = this.filtersControls_[cid][0];
    var val = pn.ui.edit.FieldBuilder.getFieldValue(control);

    // Ensure that all parent lists select whole text field (not just part)
    if (control.options && goog.isString(val)) val = [val];

    if (!goog.isDefAndNotNull(val) ||
        val === '' ||
        val === '0') continue;
    if (goog.isArray(val)) {
      if (val.length === 0) continue;
      if (val.length === 1 && val[0] === '0') continue;
    }
    filters[cid] = goog.isString(val) ? val.toString() : val;
  }
  var event = new goog.events.Event(pn.ui.srch.SearchPanel.SEARCH, this);
  event.filters = filters;
  this.dispatchEvent(event);
};


/** @private */
pn.ui.srch.SearchPanel.prototype.doClear_ = function() {
  goog.dom.removeChildren(this.filtersPanel_);
  goog.object.forEach(this.filtersControls_, function(arr) {
    this.eh_.unlisten(arr[0], goog.events.EventType.CHANGE);
    this.eh_.unlisten(arr[1], goog.events.EventType.CLICK);
    goog.array.forEach(arr, goog.dispose);
  }, this);
  this.filtersControls_ = {};
  this.populateFieldSelect_();
  this.doSearch_();
};


/** @private */
pn.ui.srch.SearchPanel.prototype.filterSelected_ = function() {
  var option = this.select_.options[this.select_.selectedIndex];
  var val = option.value;
  if (!val) return;

  var specid = val.substring(0, val.indexOf('.'));
  var fieldId = val.substring(val.indexOf('.') + 1);
  var spec = pn.app.ctx.specs.get(specid);
  var fctx;
  var fieldSpec = /** @type {pn.ui.edit.FieldSpec} */ (goog.array.find(
      spec.searchConfig.fieldSpecs, function(fieldSpec1) {
        return fieldSpec1.id === fieldId;
      }));
  if (!fieldSpec) {
    throw new Error('Could not find the specified field: ' + fieldId +
        ' in the searcheable fields of the ' + spec.id + ' spec');
  }
  fctx = new pn.ui.FieldCtx(fieldSpec, {}, this.cache_);
  this.select_.selectedIndex = 0;
  this.addFieldToTheFiltersSearch_(fctx, option);
  goog.dispose(fctx);

  goog.style.showElement(option, false);
  this.panelHeight_ = goog.style.getSize(this.searchPanel_).height;
};


/**
 * @private
 * @param {!pn.ui.FieldCtx} fctx The field context.
 * @param {!Element} option The select option element representing this option.
 */
pn.ui.srch.SearchPanel.prototype.addFieldToTheFiltersSearch_ =
    function(fctx, option) {
  goog.asserts.assert(fctx);
  goog.asserts.assert(option);

  var FieldBuilder = pn.ui.edit.FieldBuilder;
  var remove = goog.dom.createDom('div', { 'class': 'remove' }, 'Remove');

  var name = fctx.spec.name;
  var lbl = goog.dom.createDom('label', { 'for': fctx.id }, name);
  fctx.parentComponent = goog.dom.createDom('div', {
    'class': fctx.spec.className || 'field'
  }, lbl, remove);
  goog.dom.appendChild(this.filtersPanel_, fctx.parentComponent);

  var input;
  if (!fctx.spec.renderer &&
      pn.data.EntityUtils.isParentProperty(fctx.spec.dataProperty)) {
    input = FieldBuilder.createSearchParentFilter(fctx);
    goog.dom.appendChild(fctx.parentComponent, input);
  } else {
    var srchFctx = this.getSearchAppropriateFieldSpec_(fctx);
    input = FieldBuilder.createAndAttach(srchFctx);
    if (input['type'] === 'text') {
      input['title'] = pn.ui.filter.GenericListFilterOptions.DEFAULT_TOOLTIP;
    }
  }
  this.filtersControls_[fctx.id] = [input, remove, lbl, fctx.parentComponent];

  // fctx will be disposed before here so lets grab references for the closure.
  var fieldParent = fctx.parentComponent;
  var fieldId = fctx.id;
  var removeFilter = goog.bind(function() {
    delete this.filtersControls_[fieldId];

    goog.dom.removeNode(fieldParent);
    goog.style.showElement(option, true);

    this.eh_.unlisten(input, goog.events.EventType.CHANGE);
    this.eh_.unlisten(remove, goog.events.EventType.CLICK);

    this.doSearch_();
  }, this);

  this.eh_.listen(input, goog.events.EventType.CHANGE, this.doSearch_);
  this.eh_.listen(remove, goog.events.EventType.CLICK, removeFilter);
};


/**
 * @private
 * @param {!pn.ui.FieldCtx} fctx The field context to make appropriate for
 *    searching.
 * @return {!pn.ui.FieldCtx} The search appropriate field.
 */
pn.ui.srch.SearchPanel.prototype.getSearchAppropriateFieldSpec_ =
    function(fctx) {
  if (!fctx.spec.renderer) return fctx;
  var sf = /** @type {!pn.ui.FieldCtx} */ (goog.object.clone(fctx));
  var fr = pn.ui.edit.FieldRenderers;
  var rr = pn.ui.edit.ReadOnlyFields;
  var curr = fctx.spec.renderer;
  if (curr === fr.centsRenderer ||
      curr === rr.centsField ||
      curr === fr.timeRenderer ||
      curr === rr.timeField ||
      curr === fr.textAreaRenderer ||
      curr === fr.hiddenTextField) {
    sf.spec.renderer = fr.standardTextSearchField;
  }
  return sf;
};


/** @inheritDoc */
pn.ui.srch.SearchPanel.prototype.disposeInternal = function() {
  pn.ui.srch.SearchPanel.superClass_.disposeInternal.call(this);

  this.eh_.removeAll();
  goog.dispose(this.eh_);
  goog.dispose(this.log_);
  goog.dispose(this.select_);
  goog.dispose(this.clear_);
  goog.dispose(this.go_);
  goog.dispose(this.filtersPanel_);
  goog.dispose(this.controlsPanel_);
  goog.dispose(this.searchPanel_);
  goog.dispose(this.toggle_);
  goog.dispose(this.resizeShow_);
  goog.dispose(this.resizeHide_);

  goog.object.forEach(this.filtersControls_, function(arr) {
    goog.array.forEach(arr, function(c) { this.eh_.unlisten(c, null); }, this);
    goog.array.forEach(arr, goog.dispose);
  }, this);

  delete this.filters_;
  delete this.cache_;
  delete this.filtersControls_;
  delete this.eh_;
  delete this.log_;
  delete this.select_;
  delete this.clear_;
  delete this.go_;
  delete this.filtersPanel_;
  delete this.controlsPanel_;
  delete this.searchPanel_;
  delete this.toggle_;
  delete this.resizeShow_;
  delete this.resizeHide_;
};
