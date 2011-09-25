;
goog.provide('pn.ui.edit.Command');



/**
 * @constructor
 * @param {string} name The name/caption of this column.
 * @param {pn.ui.edit.Edit.EventType} eventType The event to fire on '
 *    componenet action.
 */
pn.ui.edit.Command = function(name, eventType) {
  goog.asserts.assert(name);
  goog.asserts.assert(eventType);

  /** @type {string} */
  this.name = name;
  /** @type {pn.ui.edit.Edit.EventType} */
  this.eventType = eventType;
};
