
goog.provide('pn.mvc.ChangeEvent');
goog.provide('pn.mvc.EventType');



/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {!Array.<pn.mvc.Change>} changes The details of the changes to this model.
 */
pn.mvc.ChangeEvent = function(changes) {
  pn.ass(changes);

  goog.events.Event.call(this, pn.mvc.EventType.CHANGE);

  /** @type {!Array.<pn.mvc.Change>} */
  this.changes = changes;
};
goog.inherits(pn.mvc.ChangeEvent, goog.events.Event);


/** @enum {string} */
pn.mvc.EventType = {
  CHANGE: 'model-change'
};
