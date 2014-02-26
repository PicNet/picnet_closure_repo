goog.provide('pn.ui.GestureFilter');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.GlobalGestureHandler.EventType');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.ui.GlobalGestureHandler} handler The low level gesture handler.
 */
pn.ui.GestureFilter = function(handler) {
  pn.assInst(handler, pn.ui.GlobalGestureHandler);
  goog.Disposable.call(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.GestureFilter');

  /**
   * @private
   * @type {!Array.<{
   *    element: !Element,
   *    events: !Array.<string>,
   *    callback: function(!goog.events.Event):undefined }>}
   */
  this.registered_ = [];

  var eh = new goog.events.EventHandler(this);
  this.registerDisposable(eh);
  var events = goog.object.getValues(pn.ui.GlobalGestureHandler.EventType);
  eh.listen(handler, events, this.ongesture_);
};
goog.inherits(pn.ui.GestureFilter, goog.Disposable);


/**
 * @param {Array.<string>|string} events The event types to listen to.
 * @param {!Element} el The element of the element to listen to.
 *    This uses the standard naming conventions for element IDs.
 * @param {function(!goog.events.Event):undefined} cb The callback for the
 *    event.
 */
pn.ui.GestureFilter.prototype.ongesture = function(events, el, cb) {
  var href = el.getAttribute('href');
  if (!el.hasAttribute('touch-action') &&
      href !== '#' && href !== '') throw new Error('Gestures only ' +
      'supported on anchors and elements with touch-action specified: ' +
      (el.id || el.className));
  pn.assInst(el, Element);
  var evs = goog.isString(events) ? [events] : events;
  this.registered_.push({ element: el, events: evs, callback: cb });
};


/** @private @param {!goog.events.Event} e The event fired */
pn.ui.GestureFilter.prototype.ongesture_ = function(e) {
  this.registered_.pnforEach(function(ge) {
    if ((ge.element === e.target || ge.element === e.target.parentNode) &&
        ge.events.pncontains(e.type)) {
      ge.callback(e);
    }
  });
};


/** @override */
pn.ui.GestureFilter.prototype.disposeInternal = function() {
  this.log_.finest('disposeInternal');
  pn.ui.GestureFilter.superClass_.disposeInternal.call(this);
  delete this.registered_;
};
