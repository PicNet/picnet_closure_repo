;
goog.provide('pn.ui.edit.FieldValidator');


/**
 * @param {!pn.ui.edit.Field} field The Field to validate.
 * @param {*} value The value of the field in the current form.
 * @param {!Object} entity The entity being validated.
 * @param {!Object.<!Array>} cache The current entities cache.
 * @return {!Array.<string>} Any errors (if any) for the specified field.
 */
pn.ui.edit.FieldValidator.validateFieldValue =
    function(field, value, entity, cache) {
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

  var errors = pn.app.ctx.schema.getValidationErrors(field, value);
  // TODO: See if we can replace this with instanceof pn.ui.edit.ComplexRenderer
  if (!field.validator && field.renderer && field.renderer.validate) {
    // ComplexRenderer
    return arraytise(field.renderer.validate(), errors);
  }
  if (!field.validator) { return errors; }

  // TODO: See if we can replace this with instanceof pn.ui.edit.ValidateInfo
  if (field.validator.validateField) {
    return arraytise(field.validator.validateField(field, value), errors);
  }
  var f = /** @type {function(pn.ui.edit.Field,*,Object,!Object.<!Array>):
    string} */ (field.validator);
  return arraytise(f(field, value, entity, cache), errors);
};
