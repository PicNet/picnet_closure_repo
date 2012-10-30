;
goog.provide('pn.mvc.View');

goog.require('pn.app.EventHandlerTarget');
goog.require('pn.mvc.EventType');



/**
 * @constructor
 * @extends {pn.app.EventHandlerTarget}
 * @param {!Element} el The DOM element to attach this View to.
 * @param {!pn.mvc.ModelBase} model The model for this view.
 */
pn.mvc.View = function(el, model) {
  pn.assInst(el, HTMLElement);
  pn.assInst(model, pn.mvc.ModelBase);

  pn.app.EventHandlerTarget.call(this);

  /**
   * @private
   * @type {!Element}
   */
  this.el_ = el;

  /**
   * @private
   * @type {!pn.mvc.ModelBase}
   */
  this.model_ = model;
  this.registerDisposable(this.model_);
  this.listen(this.model_, pn.mvc.EventType.CHANGE, this.refresh);

  this.decorate(this.el_);
};
goog.inherits(pn.mvc.View, pn.app.EventHandlerTarget);


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
