;
goog.provide('pn.ui.edit.FieldValidator');


/**
 * @param {pn.ui.edit.Field} field The Field to validate.
 * @param {*} value The value of the field in the current form.
 * @param {Object} entity The entity being validated.
 * @param {Array.<Object>} all All entities of this 'entity' type.
 * @return {string} Any error (if any) for the specified field.
 */
pn.ui.edit.FieldValidator.validateFieldValue =
    function(field, value, entity, all) {
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
      function(pn.ui.edit.Field,*,Object=,Array.<Object>=):string} */
      (field.validator);
  var error = func(field, value, entity, all);
  if (error && !goog.isString(error)) {
    throw new Error('Validator [' + field.id + '] returned a non string error');
  }
  return error;
};
