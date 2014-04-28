goog.provide('pn.ui.BaseControl');

goog.require('pn.mvc.Controller');
goog.require('pn.ui.GestureFilter');
goog.require('pn.ui.MessagePanel');



/**
 * @constructor
 * @extends {pn.app.EventHandlerTarget}
 * @param {!Element} el The element (view) for this controller.
 */
pn.ui.BaseControl = function(el) {
  pn.assInst(el, HTMLElement);
  pn.assStr(el.id);

  pn.app.EventHandlerTarget.call(this);

  /** @type {!Element} */
  this.el = el;

  /** @private @const @type {!pn.ui.GlobalGestureHandler} */
  var ggh = pn.ui.GlobalGestureHandler.instance();
  this.gestures_ = new pn.ui.GestureFilter(ggh);
  this.registerDisposable(this.gestures_);

  /** @protected @type {goog.debug.Logger} */
  this.log = pn.log.getLogger(el.id);
};
goog.inherits(pn.ui.BaseControl, pn.app.EventHandlerTarget);


///////////////////////////////////////////////////////////////////////////////
/// PROTECTED HELPERS
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// DOM / UI
///////////////////////////////////////////////////////////////////////////////


/**
 * Helper to get or set the trimmed input value.
 * @param {string} id The ID suffix (without the page id) of the control
 *    value to set/retreive.
 * @param {*=} opt_val The value to set.  If not specified then we just
 *    get the value;
 * @return {string} The select value or values.
 */
pn.ui.BaseControl.prototype.val = function(id, opt_val) {
  var el = (goog.isString(id) ? this.getel(id) : id),
      val = '';
  if (goog.isDef(opt_val)) {
    val = opt_val;
    if (el.setValue) { el.setValue(opt_val); }
    else el.value = opt_val.toString().pntrim();
  } else {
    val = (!!el.getValue ? el.getValue() : el.value) || '';
    if (!!val && goog.isString(val)) val = val.pntrim();
  }
  return val;
};


/**
 * Helper to get or set the numerical field value.
 * @param {string} id The ID suffix (without the page id) of the control
 *    value to set/retreive.
 * @param {number=} opt_val The value to set.  If not specified then we just
 *    get the value;
 * @return {number} The select value or values.
 */
pn.ui.BaseControl.prototype.numval = function(id, opt_val) {
  var val = this.val(id, opt_val);
  var nval = goog.isString(val) ? parseInt(val, 10) : val;
  var v = /** @type {number} */ (nval || 0);
  pn.assNum(v);
  return v;
};


/**
 * Helper to get or set the trimmed input value.
 * @param {string} id The ID suffix (without the page id) of the control
 *    value to set/retreive.
 * @param {goog.date.DateTime=} opt_val The value to set.  If not specified then
 *    we just get the value;
 * @return {goog.date.DateTime} The select date value.
 */
pn.ui.BaseControl.prototype.dateval = function(id, opt_val) {
  var val = /** @type {goog.date.DateTime} */ (null),
      el = this.getel(id);
  pn.ass(el.getValue && el.setValue);

  if (goog.isDef(opt_val)) {
    el.setValue(opt_val);
  } else {
    val = /** @type {goog.date.DateTime} */ (el.getValue());
    pn.assInst(val, goog.date.DateTime);
  }
  return !val || val.getYear() < 1970 || isNaN(val.getYear()) ? null : val;
};


/**
 * Helper to get or set the trimmed input value.
 * @param {string|Element} id The ID suffix (without the page id) of the
 *    element to set/retreive the internal html.
 * @param {string=} opt_html The html to set.  If not specified then we just
 *    get the value
 * @return {string} The html content of the specified control.
 */
pn.ui.BaseControl.prototype.html = function(id, opt_html) {
  var html = '';
  if (goog.isDef(opt_html)) {
    this.getel(id).innerHTML = (opt_html || '').pntrim();
  } else {
    html = (this.getel(id).innerHTML || '').pntrim();
  }
  return html;
};


/**
 * Helper to access the pn.dom.byClass and following the standard naming
 *    conventions of the controller.
 * @param {string} id The ID suffix (without the page id) of the control to
 *    get.
 * @param {Element=} opt_parent The optional containing parent.
 * @return {!Element} The element on this page with the specified class name
 *    within this element.
 */
pn.ui.BaseControl.prototype.byclass = function(id, opt_parent) {
  var parent = opt_parent || this.el;
  return pn.dom.byClass(this.el.id + '-' + id, parent);
};


/**
 * Helper to access the pn.dom.get and following the standard naming
 *    conventions of the controller.
 * @param {string|Element} id The ID suffix (without the page id) of the
 *    control to get.
 * @return {!Element} The element on this page with the specified id.
 */
pn.ui.BaseControl.prototype.getel = function(id) {
  return id instanceof HTMLElement ?
      /** @type {!Element} */ (id) :
      pn.dom.get(this.el.id + '-' + id);
};


/**
 * @param {string} id The ID suffix (without the page id) of the control to
 *    test for existance.
 * @return {boolean} Wether the specified element exists on the current form.
 */
pn.ui.BaseControl.prototype.hasel = function(id) {
  return !!goog.dom.getElement(this.el.id + '-' + id);
};


/**
 * @param {string|!Element|!Array.<(string|!Element)>} el The ID or element
 *    of the element to listen to. This uses the standard naming conventions
 *    for element IDs.
 * @param {function():undefined} cb The callback for the event.
 */
pn.ui.BaseControl.prototype.onchange = function(el, cb) {
  this.getels_(el).pnforEach(function(e) {
    this.listenTo(e, goog.events.EventType.CHANGE, cb.pnbind(this));
  }, this);

};


/**
 * @param {string|!Element|!Array.<(string|!Element)>} el The ID or element
 *    of the element to listen to. This uses the standard naming conventions
 *    for element IDs.
 * @param {function():undefined} cb The callback for the event.
 */
pn.ui.BaseControl.prototype.onkeyup = function(el, cb) {
  this.getels_(el).pnforEach(function(e) {
    this.listenTo(e, goog.events.EventType.KEYUP, cb.pnbind(this));
  }, this);
};


/**
 * @param {string|!Element} el The ID or element of the element to listen to.
 *    This uses the standard naming conventions for element IDs.
 * @param {function(goog.events.Event=):undefined} cb The callback for
 *    the event.
 */
pn.ui.BaseControl.prototype.ontap = function(el, cb) {
  this.ongesture(pn.ui.GlobalGestureHandler.EventType.TAP, el, cb);
};


/**
 * @param {Array.<string>|string} events The event types to listen to.
 * @param {string|!Element|!Array.<(string|!Element)>} el The ID or element
 *    of the element to listen to. This uses the standard naming conventions
 *    for element IDs.
 * @param {function(goog.events.Event=):undefined} cb The callback for the
 *    event.
 */
pn.ui.BaseControl.prototype.ongesture = function(events, el, cb) {
  this.getels_(el).pnforEach(function(e) {
    this.gestures_.ongesture(events, e, cb.pnbind(this));
  }, this);
};


/**
 * @param {string|!Element|!Array.<(string|!Element)>} el The ID or element
 *    of the element to listen to. This uses the standard naming conventions
 *    for element IDs.
 * @param {function():undefined} cb The callback for the event.
 */
pn.ui.BaseControl.prototype.onselect = function(el, cb) {
  this.getels_(el).pnforEach(function(e) {
    this.listenTo(e, goog.events.EventType.SELECT, cb.pnbind(this));
  }, this);
};


/** @param {string|!Element} el The ID or element of the element to focus. */
pn.ui.BaseControl.prototype.focus = function(el) {
  var el2 = goog.isString(el) ? this.getel(el) : el;
  el2.focus();
};


/**
 * @param {string|!Element} el The ID or element of the element to listen to.
 *    This uses the standard naming conventions for element IDs.
 * @param {!(Array.<!pn.ui.MultiSelectItem>|Object.<string>)} values
 *    The values to populate the list with.
 * @param {(number|string)=} opt_v The optional selected value.
 */
pn.ui.BaseControl.prototype.populateList = function(el, values, opt_v) {
  var el2 = goog.isString(el) ? this.getel(el) : el;
  el2.origchildren = null;
  goog.dom.removeChildren(el2);
  /** @type {!Array.<!pn.ui.MultiSelectItem>} */
  var arr = [];

  if (goog.isArray(values)) { arr = values; }
  else {
    goog.object.forEach(values, function(v, k) {
      pn.assStr(v);
      arr.push({name: v, id: k});
    });
  }

  var options = arr.pnmap(function(o) {
    var html = '<option value="' + o.id + '">' + o.name + '</option>',
        option = pn.dom.htmlToEl(html);
    if (!!opt_v && (opt_v === o.id || opt_v === o.name)) {
      option.selected = 'selected';
    }
    return option;
  });
  goog.dom.append(el2, options);
};


/**
 * @param {string|!Element} el The ID or element of the element to listen to.
 *    This uses the standard naming conventions for element IDs.
 * @param {string} filter The filter to filter the list with.
 */
pn.ui.BaseControl.prototype.filterList = function(el, filter) {
  var el2 = goog.isString(el) ? this.getel(el) : el,
      children = pn.toarr(el2.options || el2.children),
      orig = el2.origchildren || (el2.origchildren = children.pnclone());
  filter = !filter ? '' : filter.toLowerCase();

  var newset = orig.pnfilter(function(e) {
    var val = e.innerHTML.toLowerCase();
    return val.indexOf(filter) >= 0;
  });
  goog.dom.removeChildren(el2);
  goog.dom.append(el2, newset);
};


/**
 * @param {string|!Element|!Array.<(string|!Element)>} el The ID or element
 *    of the element to enable. This uses the standard naming conventions
 *    for element IDs.
 * @param {boolean} enabled Wether the element should be enabled or disabled.
 */
pn.ui.BaseControl.prototype.enable = function(el, enabled) {
  pn.assBool(enabled);
  this.getels_(el).pnforEach(function(e) {
    if (!!e.setEnabled) { e.setEnabled(enabled); }
    else {
      if (enabled) e.removeAttribute('disabled');
      else e.setAttribute('disabled', 'disabled');
    }
  }, this);
};


/**
 * @param {string|!Element} el The ID or element of the element to enable.
 *    This uses the standard naming conventions for element IDs.
 * @return {boolean} Wether the element is enabled or disabled.
 */
pn.ui.BaseControl.prototype.enabled = function(el) {
  var el2 = goog.isString(el) ? this.getel(el) : el;
  return el2.getAttribute('disabled') !== 'disabled';
};


/**
 * @param {string|!Element|!Array.<(string|!Element)>} el The ID or element
 *    of the element to show. This uses the standard naming conventions for
 *    element IDs.
 * @param {boolean} visible Wether the element should be shown or hidden.
 */
pn.ui.BaseControl.prototype.show = function(el, visible) {
  pn.assBool(visible);
  pn.assDef(el);

  this.getels_(el).pnforEach(function(e) {
    pn.dom.show(e, visible);
  });
};


/**
 * @param {string|!Element} el The ID or element of the element to
 *    get visibility state for. This uses the standard naming conventions
 *    for element IDs.
 * @return {boolean} visible Wether the element is visible.
 */
pn.ui.BaseControl.prototype.isshown = function(el) {
  var el2 = goog.isString(el) ? this.getel(el) : el;
  while (!!el2 && !goog.dom.classes.has(el2, 'page') &&
      !goog.dom.classes.has(el2, 'dialog')) {
    if (!goog.style.isElementShown(el2)) return false;
    el2 = /** @type {!Element} */ (el2.parentNode);
  }
  return true;
};


/**
 * @private
 * @param {string|!Element|!Array.<(string|!Element)>} els The element or
 *   element IDs to resolve into an element array.
 * @return {!Array.<!Element>} The resolved element array.
 */
pn.ui.BaseControl.prototype.getels_ = function(els) {
  if (!goog.isArray(els)) els = [els];
  return els.pnmap(this.getel, this);
};


/** @override */
pn.ui.BaseControl.prototype.disposeInternal = function() {
  pn.ui.BaseControl.superClass_.disposeInternal.call(this);

  delete this.el;
};
