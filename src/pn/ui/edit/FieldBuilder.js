;
goog.provide('pn.ui.edit.FieldBuilder');

goog.require('goog.string');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('pn');


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a label for.
 * @return {!Element} The label element wrapped in a div.
 */
pn.ui.edit.FieldBuilder.getFieldContainer = function(fctx) {
  var className = (fctx.spec.className || 'field');
  var id = fctx.controlId;
  var container = goog.dom.createDom('div', {'id': id, 'class': className});
  var renderer = fctx.spec.renderer;
  if (!(renderer instanceof pn.ui.edit.ComplexRenderer) ||
      renderer.showLabel !== false) {
    var lbl = goog.dom.createDom('label', { 'for': id }, fctx.spec.name || id);
    goog.dom.appendChild(container, lbl);
  }
  return container;
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field to create a dom tree for.
 * @param {!Element} parent The parent control to attach this control to.
 * @param {!pn.data.Entity} entity The entity being edited.
 * @return {Element|Text|goog.ui.Component} The created dom element.
 */
pn.ui.edit.FieldBuilder.createAndAttach = function(fctx, parent, entity) {
  var renderer = fctx.spec.renderer;
  if (renderer instanceof pn.ui.edit.ComplexRenderer) {
    renderer.decorate(parent);
    return /** @type {!pn.ui.edit.ComplexRenderer} */ (renderer);
  }
  var func = /** @type {Function} */ (renderer);
  return func(fctx, parent, entity);
};


/**
 * @param {string} selectTxt The message to display in the first element of the
 *    list.
 * @param {!Array.<Object>} list The list of entities.
 * @param {string} txtf The text field property name.
 * @return {goog.ui.ComboBox} The select box.
 */
pn.ui.edit.FieldBuilder.createCombo = function(selectTxt, list, txtf) {
  list.pnsortObjectsByKey(txtf, goog.string.caseInsensitiveCompare);
  var cb = new goog.ui.ComboBox();
  cb.setUseDropdownArrow(true);
  if (selectTxt) { cb.setDefaultText(selectTxt); }
  list.pnforEach(function(e) {
    cb.addItem(new goog.ui.ComboBoxItem(e[txtf]));
  });
  return cb;
};
