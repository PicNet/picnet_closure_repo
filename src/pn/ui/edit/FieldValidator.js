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
  var arraytise = function(err, list) {
    if (!err) return list;
    if (goog.isArray(err)) {
      if (err.length) {
        if (!goog.isString(err[0])) {
          throw new Error('Errors should be strings');
        }
        list = goog.array.concat(list, err);
      }
      return list;
    }
    if (goog.isString(err)) {
      list.push(err);
      return list;
    }
    throw new Error('Err of type: ' + typeof(err) + ' is not supported.');
  };

  if (fctx.spec.renderer instanceof pn.ui.edit.ComplexRenderer) {
    return arraytise(fctx.spec.renderer.validate(), []);
  }

  var errors = isDBField() ? pn.app.ctx.schema.getValidationErrors(fctx) : [];
  // Always return schema issues before checking other errors as other
  // validations may conflic or duplicate these errors.
  if (errors.length || !fctx.validator) { return errors; }

  // TODO: See if we can replace this with instanceof pn.ui.edit.ValidateInfo
  if (fctx.validator.validateField) {
    return arraytise(fctx.validator.validateField(fctx), errors);
  }
  var f = /** @type {function(pn.ui.FieldCtx):string} */ (fctx.validator);
  return arraytise(f(fctx), errors);
};
