;
goog.provide('pn.ui.edit.EditUtils');

goog.require('goog.dom');


/**
 * @param {!(Element|goog.ui.Component)} control The control that this
 *    field is rendererd on.
 * @param {string} id The id of the field being shown.
 * @return {boolean} visible Wether the specified field element is currently
 *    visible.
 */
pn.ui.edit.EditUtils.isShown = function(control, id) {
  goog.asserts.assert(control, 'control is null - id: ' + id);

  var parent = pn.ui.edit.EditUtils.getFieldParent(control, id);
  return goog.style.isElementShown(parent);
};


/**
 * @param {!(Element|goog.ui.Component)} control The control that this
 *    field is rendererd on.
 * @param {string} id The id of the field being queried.
 * @param {boolean} visible Wether to show or hide the element.
 */
pn.ui.edit.EditUtils.showElement = function(control, id, visible) {
  goog.asserts.assert(control,
      'Could not find a component for field: ' + id);

  var parent = pn.ui.edit.EditUtils.getFieldParent(control, id);
  goog.style.showElement(parent, visible);
};


/**
 * @param {!(Element|goog.ui.Component)} control The element to get the parent
 *    container element for.
 * @param {string} id The id of the field whose parent we need.
 * @return {!Element} The parent container of the speicified field id.
 */
pn.ui.edit.EditUtils.getFieldParent = function(control, id) {
  goog.asserts.assert(control, 'control is null - id: ' + id);

  var element = control.getElement ? control.getElement() : control;
  while (element.id !== id) { element = element.parentNode; }
  return /** @type {!Element} */ (element);
};
