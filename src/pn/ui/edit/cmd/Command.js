;
goog.provide('pn.ui.edit.cmd.Command');



/**
 * @constructor
 * @param {string} name The name/caption of this column.
 * @param {string} eventType The event to fire on '
 *    componenet action.
 * @param {boolean=} opt_validate Wether to validate the edit details prior
 *    to firing this event.  If not valid then the event will not fire.
 */
pn.ui.edit.cmd.Command = function(name, eventType, opt_validate) {
  goog.asserts.assert(name);
  goog.asserts.assert(eventType);

  /** @type {string} */
  this.name = name;

  /** @type {string} */
  this.eventType = eventType;

  /** @type {boolean} */
  this.validate = opt_validate === true;

  /**
   * @type {string} The keyboard shortcut code for this command.  See:
   * http://closure-library.googlecode.com/svn/docs/class_goog_ui_KeyboardShortcutHandler.html
   * for full details on how to define shortcuts.
   */
  this.shortcut = '';

  /**
   * @type {null|function(Object=):boolean} Preclick function that takes the
   *    current edit entity and returns wether to continue with the command.
   */
  this.preclick = null;

  /**
   * @type {null|function(Object):undefined} The command handler. Takes
   *    the entity being edited.
   */
  this.click = null;

  /** @type {boolean} Wether to display this command on new entitis. */
  this.showOnNew = true;
};
