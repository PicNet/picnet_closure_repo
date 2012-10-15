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
  pn.assNum(delay);

  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {number}
   */
  this.delay_ = delay;

  /**
   * @private
   * @type {!Object.<string>}
   */
  this.currentValues_ = {};

  /**
   * @private
   * @type {!Object.<string>}
   */
  this.lastValues_ = {};

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
  pn.ass(inp);
  pn.ass(!goog.isDef(opt_eventType) ||
      goog.isString(opt_eventType));

  var eventType = opt_eventType || this.inferEventType_(inp);
  this.eh_.listen(inp, eventType, this.onInputEvent_);
};


/**
 * Clears all saved filter values.
 */
pn.ui.DelayedThrottleInputListener.prototype.clearFilterValues = function() {
  this.lastValues_ = {};
};


/**
 * @param {string} id The id of the control whose value we are settings.
 * @param {string} val The current filter value.
 */
pn.ui.DelayedThrottleInputListener.prototype.setCurrentFilter =
    function(id, val) {
  this.lastValues_[id] = val;
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
  pn.ass(e && e.target);
  this.currentValues_ = e.target.value;
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
  if (!this.hasChanged_()) return;
  var e = new goog.events.Event(pn.ui.DelayedThrottleInputListener.CHANGED);
  e.value = (this.lastValues_ = this.currentValues_);
  this.dispatchEvent(e);
};


/**
 * @private
 * @return {boolean} Wether the filters have changed since last time the
 *    filters were applied.
 */
pn.ui.DelayedThrottleInputListener.prototype.hasChanged_ = function() {
  return !goog.array.equals(goog.object.getKeys(this.currentValues_),
      goog.object.getKeys(this.lastValues_)) ||
      !goog.array.equals(goog.object.getValues(this.currentValues_),
          goog.object.getValues(this.lastValues_));
};


/**
 * @const
 * @type {string}
 */
pn.ui.DelayedThrottleInputListener.CHANGED = 'input-changed';
