goog.provide('pn.ui.MultiSelect');
goog.provide('pn.ui.MultiSelectItem');

goog.require('pn.ui.BaseControl');


/**
 * @typedef {{id:(number|string),name:string,cssclass:(string|undefined),
 *   selected:boolean, optn:boolean, nodes:Array.<!pn.ui.MultiSelectItem>}}
 */
pn.ui.MultiSelectItem;



/**
 * A very simple/minimalist implementation of a multi select list using UL/LIs.
 *
 * @constructor
 * @extends {pn.ui.BaseControl}
 * @param {!Element} ul The parent element
 * @param {Array.<!pn.ui.MultiSelectItem>=} opt_children A list of
 *    name/id pair items.
 */
pn.ui.MultiSelect = function(ul, opt_children) {
  pn.assInst(ul, HTMLElement);

  pn.ui.BaseControl.call(this, ul);

  /** @type {boolean} Wether to allow allowMultiple selections */
  this.allowMultiple = true;

  /** @private @const @type {!Element} */
  this.ul_ = ul;

  /**
   * @private
   * @type {function(!Array.<!pn.ui.MultiSelectItem>):undefined}
   *    On select callback
   */
  this.onselect_ = goog.nullFunction;

  /** @private @type {boolean} */
  this.readonly_ = !!ul.getAttribute('disabled');

  if (!this.readonly_) {
    ul.setAttribute('touch-action', '');
    var EventType = pn.ui.GlobalGestureHandler.EventType;
    this.ontap(this.ul_, this.selchanged_.pnbind(this));
    this.ongesture(EventType.HOLD, this.ul_, this.toggleopen_.pnbind(this));
  }

  /** @private @type {!Object.<pn.ui.MultiSelectItem>} */
  this.children_ = {};

  if (opt_children) this.options(opt_children);
};
goog.inherits(pn.ui.MultiSelect, pn.ui.BaseControl);


/** @param {!Array.<!pn.ui.MultiSelectItem>} list The list of children. */
pn.ui.MultiSelect.prototype.options = function(list) {
  this.children_ = {};
  var doli = goog.bind(function(o, parent) {
    this.children_[o.id] = o;

    var html = '<li data-itemid="' + o.id + '" touch-action>' +
            o.name + '</li>',
        li = pn.dom.htmlToEl(html),
        addargs = [li];

    if (o.selected) { addargs.push('selected'); }
    if (o.cssclass) { addargs.push(o.cssclass); }
    var lis = [li];
    if (!!o.nodes) {
      addargs.push('branch');
      addargs.push(o.open ? 'open' : 'closed');
      var children = o.nodes.pnmapMany(function(n) { return doli(n); }, li);
      lis = lis.pnconcat(children);
      if (o.open) this.show(children, true);
    } else {
      if (!!parent) li.style.display = 'none';
      addargs.push('leaf');
    }
    goog.dom.classes.add.apply(this, addargs);
    return lis;
  }, this);
  var elements = list.pnmapMany(function(n) { return doli(n); });
  goog.dom.removeChildren(this.ul_);
  goog.dom.append(this.ul_, elements);

};


/**
 * @param {!Array.<!pn.ui.MultiSelectItem>} list The list of
 *    options to unselect.
 */
pn.ui.MultiSelect.prototype.unselect = function(list) {
  pn.toarr(goog.dom.getChildren(this.ul_)).pnforEach(function(li) {
    if (list.pnfindIndex(function(v) {
      return v.id.toString() === li.getAttribute('data-itemid');
    }) >= 0) {
      goog.dom.classes.remove(li, 'selected');
    }
  });
};


/**
 * @param {!Array.<!pn.ui.MultiSelectItem>} list The list of
 *    options to remove.
 */
pn.ui.MultiSelect.prototype.remove = function(list) {
  pn.toarr(goog.dom.getChildren(this.ul_)).pnforEach(function(li) {
    if (list.pnfindIndex(function(v) {
      return v.id.toString() === li.getAttribute('data-itemid');
    }) >= 0) {
      goog.dom.removeNode(li);
    }
  });
};


/**
 * @param {!(function(string):boolean|string)} filter The filter to apply
 *    on the list.
 */
pn.ui.MultiSelect.prototype.filter = function(filter) {
  var fun = goog.isFunction(filter) ?
      filter :
      this.defaultFilter_(filter);

  pn.toarr(this.ul_.children).
      pnforEach(function(el) { pn.dom.show(el, fun(el.innerHTML)); });
};


/** Clears the current filter */
pn.ui.MultiSelect.prototype.clearFilter = function() {
  pn.toarr(this.ul_.children).
      pnforEach(function(el) { pn.dom.show(el, true); });
};


/**
 * @private
 * @param {string} filter The filter string
 * @return {!function(string):boolean} A default filtering function.
 */
pn.ui.MultiSelect.prototype.defaultFilter_ = function(filter) {
  pn.assStr(filter);

  var exp = filter.toLowerCase();
  return function(val) { return val.toLowerCase().indexOf(exp) >= 0; };
};


/** @private @param {!goog.events.Event} e */
pn.ui.MultiSelect.prototype.toggleopen_ = function(e) {
  var li = e.target;
  if (!li || !li.getAttribute('data-itemid') ||
      !goog.dom.classes.has(li, 'branch')) return;
  goog.dom.classes.toggle(li, 'open');
  goog.dom.classes.toggle(li, 'closed');

  var opening = goog.dom.classes.has(li, 'open');
  this.show(this.getChildLis_(li), opening);
};


/** @private @param {!goog.events.Event} e */
pn.ui.MultiSelect.prototype.selchanged_ = function(e) {
  var li = e.target;
  if (!li || !li.getAttribute('data-itemid')) return;
  if (goog.dom.classes.has(li, 'branch')) {
    if (!this.allowMultiple) {
      // No multi select assume tap is same as hold
      this.toggleopen_(e);
    } else {
      var children = this.getChildLis_(li);
      var allselected = children.pnall(function(c) {
        return goog.dom.classes.has(c, 'selected');
      });
      this.setSelected_(children, !allselected);
      if (goog.dom.classes.has(li, 'closed')) { this.toggleopen_(e); }
    }
    return;
  }
  if (!this.allowMultiple) { this.clearSelected(); }
  this.setSelected_([li], !goog.dom.classes.has(li, 'selected'));
};


/** @private @param {!Array.<!Element>} lis @param {boolean} selected */
pn.ui.MultiSelect.prototype.setSelected_ = function(lis, selected) {
  lis.pnforEach(function(li) {
    if (selected) goog.dom.classes.add(li, 'selected');
    else goog.dom.classes.remove(li, 'selected');
  });
  this.onselect_(this.selected());
};


/** @private @param {!Element} from @return {!Array.<!Element>} selected */
pn.ui.MultiSelect.prototype.getChildLis_ = function(from) {
  var parent = from.parentNode,
      lis = pn.toarr(parent.children),
      start = lis.pnindexOf(from),
      end = lis.pnfindIndex(function(li2, idx) {
        return idx > start && goog.dom.classes.has(li2, 'branch');
      });

  return pn.range(start + 1, end - 1).pnmap(function(i) { return lis[i]; });
};


/** Clears all selctions and fires changed event */
pn.ui.MultiSelect.prototype.clearSelected = function() {
  var els = goog.dom.getElementsByTagNameAndClass('li', 'selected', this.ul_);
  if (pn.toarr(els).pnforEach(
      function(li) { goog.dom.classes.remove(li, 'selected'); }).length) {
    this.onselect_(this.selected());
  }
};


/**
 * @param {function(!Array.<!pn.ui.MultiSelectItem>):undefined}
 *    handler The handler for select changes
 */
pn.ui.MultiSelect.prototype.onselectChanged = function(handler) {
  pn.assFun(handler);
  this.onselect_ = handler;
};


/** @return {!Array.<!pn.ui.MultiSelectItem>} The selected options */
pn.ui.MultiSelect.prototype.selected = function() {
  var selected = pn.toarr(this.ul_.children).
      pnfilter(function(el) { return goog.dom.classes.has(el, 'selected'); }).
      pnmap(function(el) {
        // data-itemid is not a number parseInt get NaN
        var id = el.getAttribute('data-itemid');
        return this.children_[id];
      }, this);
  return selected;
};


/** @override */
pn.ui.MultiSelect.prototype.disposeInternal = function() {
  pn.ui.MultiSelect.superClass_.disposeInternal.call(this);
  goog.dom.removeChildren(this.ul_);
  delete this.onselect_;
};
