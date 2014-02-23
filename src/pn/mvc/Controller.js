;
goog.provide('pn.mvc.Controller');

goog.require('pn');
goog.require('pn.app.EventHandlerTarget');
goog.require('pn.mvc.EventType');
goog.require('pn.mvc.ModelBase');
goog.require('pn.mvc.View');



/**
 * @constructor
 * @extends {pn.app.EventHandlerTarget}
 * @param {!(Element|pn.mvc.View)} view The view for this controller.
 * @param {pn.mvc.ModelBase=} opt_model The optional model for this
 *    controller's view.
 */
pn.mvc.Controller = function(view, opt_model) {
  pn.ass(view instanceof HTMLElement || view instanceof pn.mvc.View);
  pn.ass(!opt_model || opt_model instanceof pn.mvc.ModelBase);

  pn.app.EventHandlerTarget.call(this);

  /**
   * @private
   * @type {pn.mvc.ModelBase}
   */
  this.model_ = opt_model || null;

  /**
   * @private
   * @type {!(Element|pn.mvc.View)}
   */
  this.view_ = view;
};
goog.inherits(pn.mvc.Controller, pn.app.EventHandlerTarget);


/** @return {!(Element|pn.mvc.View)} The controllers view. */
pn.mvc.Controller.prototype.getView = function() { return this.view_; };


/** @return {pn.mvc.ModelBase} The controllers model. */
pn.mvc.Controller.prototype.getModel = function() { return this.model_; };


/** @override */
pn.mvc.Controller.prototype.disposeInternal = function() {
  pn.mvc.Controller.superClass_.disposeInternal.call(this);

  delete this.view_;
};
