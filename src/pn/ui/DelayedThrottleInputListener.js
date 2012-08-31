;
goog.provide('pn.ui.DelayedThrottleInputListener');

goog.require('goog.Timer');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');



/**
 * @constructor
 * @param {!Element} input The control to listen to.
 * @param {number} delay The delay to wait for further updates before raising
 *    a notification.
 * @param {string=} opt_eventType The optional event type to listen to, if
 *    this is not specified then a smart event type is inferred.
 * @extends {goog.events.EventTarget}
 */
pn.ui.DelayedThrottleInputListener = function(input, delay, opt_eventType) {
  goog.asserts.assert(input);
  goog.asserts.assert(goog.isNumber(delay) && delay > 0);
  goog.asserts.assert(!goog.isDef(opt_eventType) ||
      goog.isString(opt_eventType));

  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {!Element}
   */
  this.input_ = input;

  /**
   * @private
   * @type {number}
   */
  this.delay_ = delay;

  /**
   * @private
   * @type {string}
   */
  this.eventType_ = opt_eventType || this.inferEventType_();

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

  this.init_();
};
goog.inherits(pn.ui.DelayedThrottleInputListener, goog.events.EventTarget);


/**
 * @private
 * @return {string} An event type inferred from the type of
 *    input control used as the source.
 */
pn.ui.DelayedThrottleInputListener.prototype.inferEventType_ = function() {
  return this.input_.getAttribute('type') === 'text' ?
      goog.events.EventType.KEYUP :
      goog.events.EventType.CHANGE;
};


/** @private */
pn.ui.DelayedThrottleInputListener.prototype.init_ = function() {
  this.eh_.listen(this.input_, this.eventType_, this.onInputEvent_);
};


/** @private */
pn.ui.DelayedThrottleInputListener.prototype.onInputEvent_ = function() {
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
  if (curtime - this.lastInputTime_ >= this.delay_) {
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
  var value = this.input_.value;

  if (this.lastFilterValue_ !== value) {
    var e = new goog.events.Event(pn.ui.DelayedThrottleInputListener.CHANGED);
    e.value = this.lastFilterValue_ = value;
    this.dispatchEvent(e);
  }
};


/**
 * @const
 * @type {string}
 */
pn.ui.DelayedThrottleInputListener.CHANGED = 'input-changed';
