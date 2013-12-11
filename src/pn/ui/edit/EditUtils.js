;
goog.provide('pn.ui.edit.EditUtils');

goog.require('goog.dom');


/**
 * @param {!(Element|Text|goog.ui.Component)} control The control that this
 *    field is rendererd on.
 * @param {string} id The id of the field being shown.
 * @return {boolean} visible Wether the specified field element is currently
 *    visible.
 */
pn.ui.edit.EditUtils.isShown = function(control, id) {
  pn.ass(control, 'control is null - id: ' + id);

  var parent = pn.ui.edit.EditUtils.getFieldParent(control, id);
  return !!parent && goog.style.isElementShown(parent);
};


/**
 * @param {!(Element|Text|goog.ui.Component)} control The control that this
 *    field is rendererd on.
 * @param {string} id The id of the field being queried.
 * @param {boolean} visible Wether to show or hide the element.
 */
pn.ui.edit.EditUtils.showElement = function(control, id, visible) {
  pn.ass(control,
      'Could not find a component for field: ' + id);
  var parent = pn.ui.edit.EditUtils.getFieldParent(control, id);
  if (parent) { pn.dom.show(parent, visible); }
};


/**
 * @param {!(Element|Text|goog.ui.Component)} control The control that this
 *    field is rendererd on.
 * @param {boolean} enabled Wether the control is enabled.
 */
pn.ui.edit.EditUtils.setEnabled = function(control, enabled) {
  pn.ass(control);
  if (control.setEnabled) control.setEnabled(enabled);
  else control['disabled'] = enabled ? '' : 'disabled';
};


/**
 * @param {!(Element|Text|goog.ui.Component)} control The control that this
 *    field is rendererd on.
 * @param {string} id The id of the field being queried.
 * @param {boolean} required Wether this field is required.
 */
pn.ui.edit.EditUtils.setRequired = function(control, id, required) {
  pn.ass(control,
      'Could not find a component for field: ' + id);
  var parent = pn.ui.edit.EditUtils.getFieldParent(control, id);
  if (!parent) {
    var msg = 'EditUtils.setRequired could not find parent of "' + id + '"';
    pn.log.log(msg);
    return;
  }
  if (required) { goog.dom.classes.add(parent, 'required'); }
  else { goog.dom.classes.remove(parent, 'required'); }
};


/**
 * TODO: If this works as expected remove the 'id' parameter.
 *
 * @param {!(Element|Text|goog.ui.Component)} control The element to get the
 *    parent container element for.
 * @param {string} id The id of the field whose parent we need.  This id can
 *    either be the FieldCtx.id or the controlId.
 * @return {!Element} The parent container of the speicified field id.
 */
pn.ui.edit.EditUtils.getFieldParent = function(control, id) {
  pn.ass(control, 'control is null - id: ' + id);
  var element = control.getElement ? control.getElement() : control;
  return /** @type {!Element} */ (element.parentNode);
};

/**
 * @param {Element|Text|goog.ui.Component} inp The input field.
 * @param {Object=} opt_target The optional 'entity' target to inject values
 *    into if required.
 * @return {string|boolean} The value in the specified field.
 */
pn.ui.edit.EditUtils.getFieldValue = function(inp, opt_target) {
  pn.ass(inp);

  if (inp.getValue) { return inp.getValue(opt_target); }
  else if (inp.options) {
    var arr = [];
    pn.toarr(inp.options).pnforEach(function(o) {
      if (o.selected) { arr.push(o.value); }
    });
    return inp.multiple && arr.length > 1 ? arr : arr[0];
  }
  else if (inp.type === 'checkbox') { return !!inp.checked; }
  else { return inp.value; }
};
