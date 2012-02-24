;
goog.provide('pn.ui.edit.Command');



/**
 * @constructor
 * @param {string} name The name/caption of this column.
 * @param {string} eventType The event to fire on '
 *    componenet action.
 * @param {boolean=} opt_validate Wether to validate the edit details prior
 *    to firing this event.  If not valid then the event will not fire.
 */
pn.ui.edit.Command = function(name, eventType, opt_validate) {
  goog.asserts.assert(name);
  goog.asserts.assert(eventType);

  /** @type {string} */
  this.name = name;
  /** @type {string} */
  this.eventType = eventType;
  /** @type {boolean} */
  this.validate = opt_validate === true;
  /** @type {null|function(Object=):boolean} Wether to
    continue with the command. */
  this.preclick = null;
  /** @type {null|function(string,Object):undefined} The command handler. */
  this.click = null;
};
