;
goog.provide('pn.ui.edit.FieldValidator');


/**
 * @param {pn.ui.edit.Field} field The Field to validate.
 * @param {*} value The value of the field in the current form.
 * @param {Object} entity The entity being validated (with all form values).
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {Object} old The entity being validated (without new form values).
 * @return {string} Any error (if any) for the specified field.
 */
pn.ui.edit.FieldValidator.validateFieldValue =
    function(field, value, entity, cache, old) {
  if (!field.validator && field.renderer &&
      typeof(field.renderer) === 'object') { // ComplexRenderer
    field.validator = goog.bind(field.renderer.validate, field.renderer);
  }
  if (!field.validator) { return ''; }
  if (field.validator.validateField) {
    field.validator =
        goog.bind(field.validator.validateField, field.validator);
  }
  var func = /** @type {
      function(pn.ui.edit.Field, *, Object, !Object.<Array>, Object):
          !(string|Array.<string>)} */
      (field.validator);
  var err = func(field, value, entity, cache, old);
  return goog.isArray(err) ? err.join('<br/>') : err;
};
