;
goog.provide('pn.ui.edit.FieldValidator');


/**
 * @param {!pn.ui.FieldCtx} field The Field to validate.
 * @return {!Array.<string>} Any errors (if any) for the specified field.
 */
pn.ui.edit.FieldValidator.validateFieldValue = function(field) {
  var isDBField = function() {
    return !goog.string.startsWith(field.id, '_') &&
        !goog.string.endsWith(field.spec.dataProperty, 'Entities');
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

  if (field.spec.renderer instanceof pn.ui.edit.ComplexRenderer) {
    return arraytise(field.spec.renderer.validate(), []);
  }

  var errors = isDBField() ? pn.app.ctx.schema.getValidationErrors(field) : [];
  // Always return schema issues before checking other errors as other
  // validations may conflic or duplicate these errors.
  if (errors.length || !field.validator) { return errors; }

  // TODO: See if we can replace this with instanceof pn.ui.edit.ValidateInfo
  if (field.validator.validateField) {
    return arraytise(field.validator.validateField(field), errors);
  }
  var f = /** @type {function(pn.ui.FieldCtx):string} */ (field.validator);
  return arraytise(f(field), errors);
};
