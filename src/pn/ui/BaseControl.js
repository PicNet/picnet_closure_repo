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

  /** @private @const @type {!pn.ui.GestureFilter} */
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
 * @protected
 * Helper to get or set the required state of a field.  Setting required adds
 *   a 'required' class to the field.
 * @param {string} id The ID suffix (without the page id) of the control
 *    value to set/retreive the required state.
 * @param {boolean=} opt_val The required value to set.  If not specified
 *   then we just get the required value;
 * @return {boolean} The required state of the specified control.
 */
pn.ui.BaseControl.prototype.required = function(id, opt_val) {
  pn.assStr(id);

  return this.requiredImpl_(this.getel(id), opt_val);
};


/**
 * @protected
 * Helper to get or set the required state of a field.  Setting required adds
 *   a 'required' class to the field.
 * @param {string} classname The class name of the control to set/retreive
 *    the required state.
 * @param {!Element} parent The parent control to search for the specified
 *    class name.
 * @param {boolean=} opt_val The required value to set.  If not specified
 *   then we just get the required value;
 * @return {boolean} The required state of the specified control.
 */
pn.ui.BaseControl.prototype.requiredByClass =
    function(classname, parent, opt_val) {
  pn.assStr(classname);
  pn.assInst(parent, HTMLElement);

  return this.requiredImpl_(this.byclass(classname, parent), opt_val);
};


/**
 * @private
 * @param {!Element} el The element to set or get as required.
 *    value to set/retreive the required state.
 * @param {boolean=} opt_val The required value to set.  If not specified
 *   then we just get the required value;
 * @return {boolean} The required state of the specified control.
 */
pn.ui.BaseControl.prototype.requiredImpl_ = function(el, opt_val) {
  if (goog.isBoolean(opt_val)) {
    goog.dom.classes.enable(el, 'required', !!opt_val);
    return !!opt_val;
  }
  return goog.style.isElementShown(el) && goog.dom.classes.has(el, 'required');
};


/**
 * @protected
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
    val = goog.string.trim(opt_val.toString() || '');
    if (el.setValue) { el.setValue(val); }
    else el.value = val;
  } else {
    val = goog.string.trim((!!el.getValue ? el.getValue() : el.value) || '');
  }
  return val;
};


/**
 * @protected
 * Helper to get or set the trimmed input value.
 * @param {string} id The ID suffix (without the page id) of the control
 *    value to set/retreive.
 * @param {goog.date.DateTime=} opt_val The value to set.  If not specified then
 *    we just get the value;
 * @return {!goog.date.DateTime} The select date value.
 */
pn.ui.BaseControl.prototype.dateval = function(id, opt_val) {
  var val = '',
      el = this.getel(id);

  if (goog.isDef(opt_val)) {
    el.value = (val = opt_val.getTime().toString());
  } else {
    val = goog.string.trim(this.getel(id).value || '');
  }
  return new goog.date.DateTime(parseInt(val, 10));
};


/**
 * @protected
 * Helper to get or set the trimmed input value.
 * @param {string} id The ID suffix (without the page id) of the element
 *    html to set/retreive.
 * @param {string=} opt_html The html to set.  If not specified then we just
 *    get the value
 * @return {string} The html content of the specified control.
 */
pn.ui.BaseControl.prototype.html = function(id, opt_html) {
  var html = '';
  if (goog.isDef(opt_html)) {
    this.getel(id).innerHTML = goog.string.trim(opt_html || '');
  } else {
    html = goog.string.trim(this.getel(id).innerHTML || '');
  }
  return html;
};


/**
 * @protected
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
 * @protected
 * Helper to access the pn.dom.get and following the standard naming
 *    conventions of the controller.
 * @param {string} id The ID suffix (without the page id) of the control to
 *    get.
 * @return {!Element} The element on this page with the specified id.
 */
pn.ui.BaseControl.prototype.getel = function(id) {
  return pn.dom.get(this.el.id + '-' + id);
};


/**
 * @protected
 * @param {string} id The ID suffix (without the page id) of the control to
 *    test for existance.
 * @return {boolean} Wether the specified element exists on the current form.
 */
pn.ui.BaseControl.prototype.hasel = function(id) {
  return !!goog.dom.getElement(this.el.id + '-' + id);
};


/**
 * @protected
 * @param {string|!Element} el The ID or element of the element to listen to.
 *    This uses the standard naming conventions for element IDs.
 * @param {function():undefined} cb The callback for the event.
 */
pn.ui.BaseControl.prototype.onchange = function(el, cb) {
  var el2 = goog.isString(el) ? this.getel(el) : el;
  this.listenTo(el2, goog.events.EventType.CHANGE, cb.pnbind(this));
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
 * @protected
 * @param {Array.<string>|string} events The event types to listen to.
 * @param {string|!Element} el The ID or element of the element to listen to.
 *    This uses the standard naming conventions for element IDs.
 * @param {function(goog.events.Event=):undefined} cb The callback for the
 *    event.
 */
pn.ui.BaseControl.prototype.ongesture = function(events, el, cb) {
  var el2 = goog.isString(el) ? this.getel(el) : el;
  this.gestures_.ongesture(events, el2, cb.pnbind(this));
};


/**
 * @protected
 * @param {string|!Element} el The ID or element of the element to listen to.
 *    This uses the standard naming conventions for element IDs.
 * @param {function():undefined} cb The callback for the event.
 */
pn.ui.BaseControl.prototype.onselect = function(el, cb) {
  var el2 = goog.isString(el) ? this.getel(el) : el;
  this.listenTo(el2, goog.events.EventType.SELECT, cb.pnbind(this));
};


/**
 * @protected
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
    if (!!opt_v && opt_v === o.id) { option.selected = 'selected'; }
    return option;
  });

  goog.dom.append(el2, options);
};


/**
 * @protected
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
 * @protected
 * @param {string|!Element} el The ID or element of the element to enable.
 *    This uses the standard naming conventions for element IDs.
 * @param {boolean} enabled Wether the element should be enabled or disabled.
 */
pn.ui.BaseControl.prototype.enable = function(el, enabled) {
  pn.assBool(enabled);
  var el2 = goog.isString(el) ? this.getel(el) : el;
  if (enabled) el2.removeAttribute('disabled');
  else el2.setAttribute('disabled', 'disabled');
};


/**
 * @protected
 * @param {string|!Element} el The ID or element of the element to enable.
 *    This uses the standard naming conventions for element IDs.
 * @return {boolean} Wether the element is enabled or disabled.
 */
pn.ui.BaseControl.prototype.enabled = function(el) {
  var el2 = goog.isString(el) ? this.getel(el) : el;
  return el2.getAttribute('disabled') !== 'disabled';
};


/**
 * @protected
 * @param {string|!Element|!Array} el The ID or element of the element to show.
 *    This uses the standard naming conventions for element IDs.
 * @param {boolean} visible Wether the element should be shown or hidden.
 */
pn.ui.BaseControl.prototype.show = function(el, visible) {
  pn.assBool(visible);
  if (goog.isArray(el)) {
    el.pnforEach(function(el3) { this.show(el3, visible); }, this);
    return;
  }
  var el2 = goog.isString(el) ? this.getel(el) : el;
  pn.dom.show(el2, visible);
};


/**
 * @protected
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


/** @override */
pn.ui.BaseControl.prototype.disposeInternal = function() {
  pn.ui.BaseControl.superClass_.disposeInternal.call(this);

  delete this.el;
};
