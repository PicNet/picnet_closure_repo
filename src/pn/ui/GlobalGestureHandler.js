
goog.provide('pn.ui.GlobalGestureHandler');
goog.provide('pn.ui.GlobalGestureHandler.EventType');

goog.require('goog.Timer');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('pn.log');



/**
* @constructor
* @extends {goog.events.EventTarget}
* @param {Element} parent The element to use as the parent for all events.
*    This will then use event delegation to fire off events for the correct
*    elements.
*/
pn.ui.GlobalGestureHandler = function(parent) {
  var cls = pn.ui.GlobalGestureHandler;
  if (!!cls.instance_) throw new Error('GlobalGestureHandler initialised');

  pn.assInst(parent, HTMLElement);

  goog.events.EventTarget.call(this);

  if (cls.initialised_)
    throw new Error('GlobalGestureHandler is intended to be used on the body');
  cls.initialised_ = true;

  cls.disableDesktopClicks();

  var hammer = Hammer(parent, { swipe: false }),
      EventType = cls.EventType,
      kill = function(e) {

        e.preventDefault();
        e.gesture.preventDefault();
        e.gesture.srcEvent.preventDefault();
        e.stopPropagation();
        e.gesture.stopPropagation();
        e.gesture.stopDetect();
      };
  var isforinp = function(el) {
    if (el instanceof HTMLInputElement) return true;
    if (!(el instanceof HTMLLabelElement)) return false;
    var id = el.getAttribute('for');
    var forel = id ? pn.dom.get(id) : null;
    return forel instanceof HTMLInputElement;
  };
  var fire = goog.bind(function(type, e) {
    var el = this.getTouchEl_(e.target);
    if (!el || isforinp(e.target)) { return; }
    kill(e);
    var ev = new goog.events.Event(type, el);
    ev.actualtarget = e.target;
    this.dispatchEvent(ev);
  }, this);

  hammer.on('tap', fire.pnbind(this, EventType.TAP));
  hammer.on('hold', function(e) {
    cls.clicksDisabled_ = true; // This is a hack to support hold pop ups...
    goog.Timer.callOnce(function() { cls.clicksDisabled_ = false; }, 1000);
    fire(EventType.HOLD, e);
  });
  hammer.on('doubletap', fire.pnbind(this, EventType.DOUBLETAP));
  hammer.on('drag', goog.bind(function(e) {
    var el = this.getTouchEl_(e.target);
    var type = '';
    if (e.gesture.direction == 'left') { type = EventType.SWIPELEFT; }
    else if (e.gesture.direction == 'right') { type = EventType.SWIPERIGHT; }
    if (!el || !type) return;
    kill(e);

    this.dispatchEvent(new goog.events.Event(type, el));
  }, this));
};
goog.inherits(pn.ui.GlobalGestureHandler, goog.events.EventTarget);


/** @private @type {pn.ui.GlobalGestureHandler} */
pn.ui.GlobalGestureHandler.instance_ = null;


/** @private @type {boolean} */
pn.ui.GlobalGestureHandler.clicksDisabled_ = false;


/** @return {!pn.ui.GlobalGestureHandler} The global singleton instance. */
pn.ui.GlobalGestureHandler.instance = function() {
  return pn.ui.GlobalGestureHandler.instance_ ||
      (pn.ui.GlobalGestureHandler.instance_ =
      new pn.ui.GlobalGestureHandler(document.body));
};


/** @param {Element=} opt_el Disable clicks on all achors with '#' */
pn.ui.GlobalGestureHandler.disableDesktopClicks = function(opt_el) {
  var as = pn.toarr(goog.dom.getElementsByTagNameAndClass('a', '', opt_el));
  as.pnforEach(function(a) {
    if (!a.hasAttribute('href') || a.getAttribute('href') === '#') {
      a.onclick = function(e) { e.preventDefault(); return false; };
    } else {
      // This is a hack to support tap and hold pop ups.
      a.onclick = function(e) {
        if (pn.ui.GlobalGestureHandler.clicksDisabled_) {
          e.preventDefault(); return false;
        }
        return true;
      };
    }
  });
};


/** @private @param {Element} el @return {Element} */
pn.ui.GlobalGestureHandler.prototype.getTouchEl_ = function(el) {
  while (!!el && el.hasAttribute) {
    var href = el.getAttribute('href');
    if (!!href && href !== '#') return null;
    if (el.hasAttribute('touch-action') || href === '#') return el;
    el = /** @type {Element} */ (el.parentNode);
  }
  return null;
};


/** @enum {string} */
pn.ui.GlobalGestureHandler.EventType = {
  TAP: 'TAP',
  HOLD: 'HOLD',
  DOUBLETAP: 'DOUBLETAP',
  SWIPELEFT: 'SWIPELEFT',
  SWIPERIGHT: 'SWIPERIGHT'
};



