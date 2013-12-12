;
goog.provide('pn.ui.IDefaultRenderer');



/** @interface */
pn.ui.IDefaultRenderer = function() {};


/**
 * @param {!pn.ui.edit.FieldSpec} spec The spec for the field to create
 *    the default renderer for.
 * @param {boolean=} opt_readonly Wether to force the genration of a readonly
 *    renderer.
 * @return {pn.ui.edit.FieldSpec.Renderer} The inferred renderer for this field.
 */
pn.ui.IDefaultRenderer.prototype.getDefaultRenderer = goog.abstractMethod;
