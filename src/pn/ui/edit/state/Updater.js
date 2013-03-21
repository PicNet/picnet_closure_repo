;
goog.provide('pn.ui.edit.state.Updater');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');



/**
 * @constructor
 * @extends {goog.events.EventHandler}
 * @param {pn.ui.edit.state.State} state The state model.
 * @param {!Object.<!(Element|Text|goog.ui.Component)>} controls The UI
 *    controls.
 */
pn.ui.edit.state.Updater = function(state, controls) {
  pn.assInst(state, pn.ui.edit.state.State);
  pn.assObj(controls);

  /**
   * @private
   * @type {!Object.<!(Element|Text|goog.ui.Component)>}
   */
  this.controls_ = controls;

  goog.events.EventHandler.call(this);
  this.listen(state, pn.ui.edit.state.State.CHANGED, this.changed_);
};
goog.inherits(pn.ui.edit.state.Updater, goog.events.EventHandler);


/**
 * @private
 * @param {goog.events.Event} e The change event.
 */
pn.ui.edit.state.Updater.prototype.changed_ = function(e) {
  pn.assObj(e.changes);
  goog.object.forEach(e.changes, this.updateField_, this);
};


/**
 * @private
 * @param {pn.ui.edit.state.State.Field} fstate The state of the field.
 * @param {string} id The id of the field.
 */
pn.ui.edit.state.Updater.prototype.updateField_ = function(fstate, id) {
  pn.assObj(fstate);
  pn.assStr(id);

  var ctl = this.controls_[id];
  pn.assObj(ctl);

  // TODO: Remove EditUtils.
  pn.ui.edit.EditUtils.showElement(ctl, id, fstate.visible);
  pn.ui.edit.EditUtils.setEnabled(ctl, fstate.enabled);
  pn.ui.edit.EditUtils.setRequired(ctl, id, fstate.required);
  // TODO: setReadOnly
};
