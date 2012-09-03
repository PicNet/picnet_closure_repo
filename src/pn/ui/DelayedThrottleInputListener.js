;
goog.provide('pn.ui.DelayedThrottleInputListener');

goog.require('goog.Timer');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');



/**
 * @constructor
 * @param {number} delay The delay to wait for further updates before raising
 *    a notification.
 * @extends {goog.events.EventTarget}
 */
pn.ui.DelayedThrottleInputListener = function(delay) {
  goog.asserts.assert(goog.isNumber(delay));

  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {number}
   */
  this.delay_ = delay;

  /**
   * @private
   * @type {string}
   */
  this.currentValue_ = '';

  /**
   * @private
   * @type {string}
   */
  this.lastFilterValue_ = '';

  /**
   * @private
   * @type {number}
   */
  this.lastInputTime_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.timerId_ = 0;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eh_);
};
goog.inherits(pn.ui.DelayedThrottleInputListener, goog.events.EventTarget);


/**
 * @param {!Element} inp The control to listen to.
 * @param {string=} opt_eventType The optional event type to listen to, if
 *    this is not specified then a smart event type is inferred.
 */
pn.ui.DelayedThrottleInputListener.prototype.addInput =
    function(inp, opt_eventType) {
  goog.asserts.assert(inp);
  goog.asserts.assert(!goog.isDef(opt_eventType) ||
      goog.isString(opt_eventType));

  var eventType = opt_eventType || this.inferEventType_(inp);
  this.eh_.listen(inp, eventType, this.onInputEvent_);
};


/**
 * @private
 * @param {!Element} inp The input element to check.
 * @return {string} An event type inferred from the type of
 *    input control used as the source.
 */
pn.ui.DelayedThrottleInputListener.prototype.inferEventType_ = function(inp) {
  var type = inp.options ? 'select-one' : inp.getAttribute('type');
  return type === 'text' ? goog.events.EventType.KEYUP :
      type === 'checkbox' ? goog.events.EventType.CLICK :
      goog.events.EventType.CHANGE;
};


/**
 * @private
 * @param {!goog.events.Event} e The change/keyup event fired.
 */
pn.ui.DelayedThrottleInputListener.prototype.onInputEvent_ = function(e) {
  goog.asserts.assert(e && e.target);

  this.currentValue_ = e.target.value;
  this.lastInputTime_ = new Date().getTime();

  if (this.timerId_) {
    goog.Timer.clear(this.timerId_);
    this.timerId_ = 0;
  }
  this.checkTimer_();
};


/** @private */
pn.ui.DelayedThrottleInputListener.prototype.checkTimer_ = function() {
  var curtime = new Date().getTime();
  if (!this.delay_ || curtime - this.lastInputTime_ >= this.delay_) {
    this.fireIfChanged_();
    this.timerId_ = 0;
  } else {
    var del = this.delay_ / 3;
    this.timerId_ = goog.Timer.callOnce(this.checkTimer_, del, this);
  }
};


/** @private */
pn.ui.DelayedThrottleInputListener.prototype.fireIfChanged_ = function() {
  clearTimeout(this.timerId_);

  if (this.lastFilterValue_ !== this.currentValue_) {
    var e = new goog.events.Event(pn.ui.DelayedThrottleInputListener.CHANGED);
    e.value = (this.lastFilterValue_ = this.currentValue_);
    this.dispatchEvent(e);
  }
};


/**
 * @const
 * @type {string}
 */
pn.ui.DelayedThrottleInputListener.CHANGED = 'input-changed';
