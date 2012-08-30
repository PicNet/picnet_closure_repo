
goog.provide('pn.ui.DelayedThrottleInputListener');

goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.Timer');

/**
 * @constructor
 * @param {!Element} input The control to listen to
 * @param {number} delay The delay to wait for further updates before raising
 *    a notification.
 * @param {string} opt_eventType The optional event type to listen to, if 
 *    this is not specified then a smart event type is inferred
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
  this.checkTimer_();
};

/** @private */
pn.ui.DelayedThrottleInputListener.prototype.checkTimer_ = function() {
  if (this.timerId_) {
    clearTimeout(this.timerId_);
    this.timerId_ = 0;
  }

  var curtime = new Date().getTime();
  if (curtime - this.lastInputTime_ >= this.delay) { this.fireChanged_(); } 
  else { 
    var del = this.delay_ / 3;
    this.timerId_ = goog.Timer.callOnce(this.checkTimer_, del, this); 
  }
};

/** private */
pn.ui.DelayedThrottleInputListener.prototype.fireChanged_ = function() {  
  clearTimeout(this.timerId_);
  var eventType = pn.ui.DelayedThrottleInputListener.CHANGED;
  this.dispatchEvent(new goog.events.Event(eventType));
};

/**
 * @const
 * @type {string}
 */
pn.ui.DelayedThrottleInputListener.CHANGED = 'input-changed';