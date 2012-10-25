;
goog.provide('pn.mvc.View');

goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('pn.mvc.EventType');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {!Element} el The DOM element to attach this View to.
 * @param {!pn.mvc.ModelBase} model The model for this view.
 */
pn.mvc.View = function(el, model) {
  pn.assInst(el, HTMLElement);
  pn.assInst(model, pn.mvc.ModelBase);

  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {!Element}
   */
  this.el_ = el;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eh_);

  /**
   * @private
   * @type {!pn.mvc.ModelBase}
   */
  this.model_ = model;
  this.registerDisposable(this.model_);
  this.eh_.listen(this.model_, pn.mvc.EventType.CHANGE, this.refresh);

  this.decorate(this.el_);
};
goog.inherits(pn.mvc.View, goog.events.EventTarget);


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
pn.mvc.View.prototype.listen = function(src, type, opt_fn) {
  return this.eh_.listen(src, type, opt_fn);
};


/** @return {!pn.mvc.ModelBase} The view's model. */
pn.mvc.View.prototype.getModel = function() { return this.model_; };


/**
 * @protected
 * @param {!Element} el The element to decorate.
 */
pn.mvc.View.prototype.decorate = goog.abstractMethod;


/**
 * @protected
 * @param {!pn.mvc.ChangeEvent} e The model change event.
 */
pn.mvc.View.prototype.refresh = goog.abstractMethod;
