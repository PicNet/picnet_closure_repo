
goog.provide('pn.model.ChangeEvent');
goog.provide('pn.model.EventType');



/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {!Array} changes The details of the changes to this model.
 */
pn.model.ChangeEvent = function(changes) {
  pn.ass(changes);

  goog.events.Event.call(this, pn.model.EventType.CHANGE);

  /** @type {!Array} */
  this.changes = changes;
};
goog.inherits(pn.model.ChangeEvent, goog.events.Event);


/** @enum {string} */
pn.model.EventType = {
  CHANGE: 'model-change'
};
