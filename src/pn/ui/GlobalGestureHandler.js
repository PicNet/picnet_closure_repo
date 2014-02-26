
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
 * @param {!Element} parent The element to use as the parent for all events.
 *    This will then use event delegation to fire off events for the correct
 *    elements.
 */
pn.ui.GlobalGestureHandler = function(parent) {
  pn.assInst(parent, HTMLElement);

  goog.events.EventTarget.call(this);

  if (pn.ui.GlobalGestureHandler.initialised_)
    throw new Error('GlobalGestureHandler is intended to be used on the body');
  pn.ui.GlobalGestureHandler.initialised_ = true;

  this.disableDesktopClicks_();

  var hammer = Hammer(parent, { swipe: false }),
      EventType = pn.ui.GlobalGestureHandler.EventType,
      kill = function(e) {
        e.preventDefault();
        e.gesture.preventDefault();
        e.gesture.srcEvent.preventDefault();
        e.stopPropagation();
        e.gesture.stopPropagation();
        e.gesture.stopDetect();
      };
  var fire = function(type, e) {
    var el = this.getTouchEl_(e.target);
    if (!el) return;
    kill(e);
    this.dispatchEvent(new goog.events.Event(type, el));
  };

  hammer.on('tap', fire.pnbind(this, EventType.TAP));
  hammer.on('hold', fire.pnbind(this, EventType.HOLD));
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


/** @private Disable clicks on all achors with '#' */
pn.ui.GlobalGestureHandler.prototype.disableDesktopClicks_ = function() {
  var as = pn.toarr(goog.dom.getElementsByTagNameAndClass('a'));
  as.pnforEach(function(a) {
    if (!a.hasAttribute('href') || a.getAttribute('href') === '#') {
      a.onclick = function(e) { e.preventDefault(); return false; };
    }
  });
};


/** @private @param {!Element} el @return {!Element} */
pn.ui.GlobalGestureHandler.prototype.getTouchEl_ = function(el) {
  while (!!el && el.hasAttribute) {
    var href = el.getAttribute('href');
    if (!!href && href !== '#') return null;
    if (el.hasAttribute('touch-action') || href === '#') return el;
    el = el.parentNode;
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
