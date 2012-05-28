;
goog.provide('pn.ui.edit.FieldValidator');


/**
 * @param {!pn.ui.FieldCtx} fctx The field context to validate.
 * @return {!Array.<string>} Any errors (if any) for the specified field.
 */
pn.ui.edit.FieldValidator.validateFieldValue = function(fctx) {
  var isDBField = function() {
    return !goog.string.startsWith(fctx.id, '_') &&
        !goog.string.endsWith(fctx.spec.dataProperty, 'Entities');
  };
  var arraytise = pn.ui.edit.FieldValidator.arraytise_;

  if (fctx.spec.renderer instanceof pn.ui.edit.ComplexRenderer) {
    return arraytise(fctx.spec.renderer.validate(), []);
  }
  var errors = isDBField() ? pn.app.ctx.schema.getValidationErrors(fctx) : [];
  // Always return schema issues before checking other errors as other
  // validations may conflic or duplicate these errors.
  if (errors.length || !fctx.spec.validator) { return errors; }

  if (fctx.spec.validator instanceof pn.ui.edit.ValidateInfo) {
    return arraytise(fctx.spec.validator.validateField(fctx), errors);
  }
  var f = /** @type {function(pn.ui.FieldCtx):string} */ (fctx.spec.validator);
  return arraytise(f(fctx), errors);
};


/**
 * @private
 * @param {(string|Array.<string>)} source The source errors, wether a single
 *    string or an array of strings.
 * @param {!Array.<string>} target The array of strings to add the source error
 *    to.
 * @return {!Array.<string>} The target array with the concatenated source.
 */
pn.ui.edit.FieldValidator.arraytise_ = function(source, target) {
  if (!source) return target;
  if (goog.isArray(source)) {
    if (source.length) {
      if (!goog.isString(source[0])) {
        throw new Error('Errors should be strings');
      }
      target = goog.array.concat(target, source);
    }
    return target;
  }
  if (goog.isString(source)) {
    target.push(source);
    return target;
  }
  throw new Error('Err of type: ' + typeof(source) + ' is not supported.');
};
