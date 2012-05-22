;
goog.provide('pn.ui.edit.FieldValidator');


/**
 * @param {pn.ui.edit.Field} field The Field to validate.
 * @param {*} value The value of the field in the current form.
 * @return {string} Any error (if any) for the specified field.
 */
pn.ui.edit.FieldValidator.validateFieldValue =
    function(field, value) {
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
      function(pn.ui.edit.Field,*):string} */
      (field.validator);
  return func(field, value);
};
