
goog.provide('pn.mvc.Controller');

goog.require('goog.events.EventHandler');
goog.require('pn.mvc.EventType');

/**
 * @constructor
 * @extends {goog.events.EventHandler}
 * @param {!pn.mvc.ModelBase} model The model for this controller's view. 
 * @param {!pn.mvc.View} view The view for this controller.
 */
pn.mvc.Controller = function(model, view) {
  pn.assInst(model, pn.mvc.ModelBase);
  pn.assInst(view, pn.mvc.View);

  goog.events.EventHandler.call(this);

  /**
   * @private
   * @type {!pn.mvc.ModelBase}
   */
  this.model = model;

  /**
   * @private
   * @type {!pn.mvc.View}
   */
  this.view = view;
};
goog.inherits(pn.mvc.Controller, goog.events.EventHandler);
