
goog.provide('pn.mvc.View');

goog.require('goog.events.EventHandler');
goog.require('pn.mvc.EventType');

/**
 * @constructor
 * @extends {goog.events.EventHandler}
 * @param {!pn.mvc.ModelBase} model The model for this view. 
 */
pn.mvc.View = function(model) {
  pn.assInst(model, pn.mvc.ModelBase);

  goog.events.EventHandler.call(this);

  /**
   * @private
   * @type {!pn.mvc.ModelBase}
   */
  this.model = model;
  this.registerDisposable(this.model);
  this.listen(this.model, pn.mvc.EventType.CHANGE, this.refresh);
};
goog.inherits(pn.mvc.View, goog.events.EventHandler);

/**
 * @param {!pn.mvc.ChangeEvent} e The model change event
 */
pn.mvc.prototype.refresh = function(e) {};