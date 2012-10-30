;
goog.provide('pn.app.EventHandlerTarget');

goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pn.app.EventHandlerTarget = function() {
  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eh_);
};
goog.inherits(pn.app.EventHandlerTarget, goog.events.EventTarget);


/**
 * @protected
 * @param {goog.events.EventTarget|EventTarget} src Event source.
 * @param {string|Array.<string>} type Event type to listen for or array of
 *     event types.
 * @param {Function|Object=} opt_fn Optional callback function to be used as the
 *    listener or an object with handleEvent function.
 * @return {goog.events.EventHandler} This object, allowing for chaining of
 *     calls.
 */
pn.app.EventHandlerTarget.prototype.listen = function(src, type, opt_fn) {
  return this.eh_.listen(src, type, opt_fn);
};
