;
goog.provide('pn.ui.edit.Command');



/**
 * @constructor
 * @param {string} name The name/caption of this column.
 * @param {pn.ui.edit.Edit.EventType} eventType The event to fire on '
 *    componenet action.
 * @param {boolean=} opt_allowOnAdd Wether to allow this command on a new
 *    entity being added.
 * @param {boolean=} opt_validate Wether to validate the edit details prior
 *    to firing this event.  If not valid then the event will not fire.
 */
pn.ui.edit.Command = function(name, eventType, opt_allowOnAdd, opt_validate) {
  goog.asserts.assert(name);
  goog.asserts.assert(eventType);

  /** @type {string} */
  this.name = name;
  /** @type {pn.ui.edit.Edit.EventType} */
  this.eventType = eventType;
  /** @type {boolean} */
  this.allowOnAdd = opt_allowOnAdd === true;
  /** @type {boolean} */
  this.validate = opt_validate === true;
};
