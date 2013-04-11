;
goog.provide('pn.ui.edit.state.Provider');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('pn.ui.edit.FieldBuilder');



/**
 * @constructor
 * @param {!Object.<!(Element|Text|goog.ui.Component)>} controls The UI
 *    controls.
 * @param {!Object.<!pn.ui.edit.FieldCtx>} fctxs The field contextes.
 */
pn.ui.edit.state.Provider = function(controls, fctxs) {
  pn.assObj(controls);

  /**
   * @const
   * @private
   * @type {!Object.<!(Element|Text|goog.ui.Component)>}
   */
  this.controls_ = controls;

  /**
   * @const
   * @private
   * @type {!Object.<!pn.ui.edit.FieldCtx>}
   */
  this.fctxs_ = fctxs;
};

////////////////////////////////////////////////////////////////////////////////
// VALUE
////////////////////////////////////////////////////////////////////////////////


/**
 * @param {string} id The ID of the field.
 * @return {*} The value of the specified field.
 */
pn.ui.edit.state.Provider.prototype.getValue = function(id) {
  pn.assStr(id);

  return pn.ui.edit.FieldBuilder.getFieldValue(this.getControl(id));
};


/**
 * @param {string} id The ID of the field.
 * @param {*} value The value of the specified field to set.
 */
pn.ui.edit.state.Provider.prototype.setValue = function(id, value) {
  pn.assStr(id);

  var ctl = this.getControl(id);
  if (ctl.setValue) ctl.setValue(value);
  else ctl.value = value;
};


/**
 * @param {string} id The id of the control we need.
 * @return {!(Element|Text|goog.ui.Component)} The control for the specified id.
 */
pn.ui.edit.state.Provider.prototype.getControl = function(id) {
  pn.assObj(this.controls_[id], 'Could not find control with ID "%s"', id);

  return this.controls_[id];
};


/**
 * @param {string} id The id of the control we need.
 * @return {!pn.ui.edit.FieldCtx} The field context for the specified id.
 */
pn.ui.edit.state.Provider.prototype.getCtx = function(id) {
  pn.assObj(this.fctxs_[id], 'Could not find field context with ID "%s"', id);

  return this.fctxs_[id];
};
