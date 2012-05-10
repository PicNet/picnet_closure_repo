;
goog.provide('pn.ui.edit.ValidateInfo');



/** @constructor */
pn.ui.edit.ValidateInfo = function() {

  /** @type {boolean} */
  this.required = true;

  /** @type {number} */
  this.minLength = 0;

  /** @type {number} */
  this.maxLength = 0;

  /** @type {RegExp} */
  this.validateRegex = null;

  /** @type {number} */
  this.minNumber = Number.NaN;

  /** @type {number} */
  this.maxNumber = Number.NaN;

  /** @type {boolean} */
  this.isNumber = false;
};


/**
 * @return {pn.ui.edit.ValidateInfo} requested ValidateInfo.
 */
pn.ui.edit.ValidateInfo.createRequiredValidator = function() {
  return new pn.ui.edit.ValidateInfo();
};


/**
 * @return {pn.ui.edit.ValidateInfo} requested ValidateInfo.
 */
pn.ui.edit.ValidateInfo.createNumberValidator = function() {
  var validator = new pn.ui.edit.ValidateInfo();
  validator.isNumber = true;
  return validator;
};


/**
 * @param {number} min The minimum number.
 * @param {number} max The maximum number.
 * @return {pn.ui.edit.ValidateInfo} requested ValidateInfo.
 */
pn.ui.edit.ValidateInfo.createRangeValidator = function(min, max) {
  var validator = pn.ui.edit.ValidateInfo.createNumberValidator();
  validator.minNumber = min;
  validator.maxNumber = max;
  return validator;
};


/**
 * @param {number} min The minimum length.
 * @param {number=} opt_max The maximum length.
 * @return {pn.ui.edit.ValidateInfo} requested ValidateInfo.
 */
pn.ui.edit.ValidateInfo.createLengthValidator = function(min, opt_max) {
  var validator = new pn.ui.edit.ValidateInfo();
  validator.minLength = min;
  if (opt_max) { validator.maxLength = opt_max; }
  return validator;
};


/**
 * @param {pn.ui.edit.Field} field The field config to validate.
 * @param {*} val The object value to validate.
 * @return {string} Any error that this field can have.
 */
pn.ui.edit.ValidateInfo.prototype.validateField = function(field, val) {
  var isParent = pn.data.EntityUtils.isParentProperty(field.dataProperty);
  var isYesNoRenderer = field.renderer ===
      pn.ui.edit.FieldRenderers.yesNoRenderer;
  var isEmptyParentOrYesNo = (isParent || isYesNoRenderer) && val === '0';
  var isNullDate = field.renderer ===
      pn.ui.edit.FieldRenderers.dateRenderer && val === 0;
  if (!goog.isDefAndNotNull(val) || val === '' ||
      isEmptyParentOrYesNo || isNullDate) {
    return this.required ? field.name + ' is required.' : '';
  }

  if (this.minLength && val.length < this.minLength)
    return field.name + ' must be at least ' + this.minLength + ' chars.';
  if (this.maxLength && val.length > this.maxLength)
    return field.name + ' must be at most ' + this.maxLength + ' chars.';
  if (this.validateRegex && !val.match(this.validateRegex))
    return field.name + ' appears to be invalid.';
  if (this.isNumber && isNaN(val))
    return field.name + ' must be a number.';
  if (!isNaN(this.minNumber) || !isNaN(this.maxNumber)) {
    var valueNumber = parseFloat(val.toString());
    if ((!isNaN(this.minNumber) && valueNumber < this.minNumber) ||
        (!isNaN(this.maxNumber) && valueNumber > this.maxNumber)) {
      return field.name + ' must be between ' + this.minNumber + ' - ' +
          this.maxNumber + '.';
    }
  }
  return '';
};
