;
goog.provide('pn.ui.edit.ValidateInfo');



/**
 * @constructor
 */
pn.ui.edit.ValidateInfo = function() {
  /** @type {boolean} */
  this.required = true;
  /** @type {number} */
  this.minLength = 1;
  /** @type {number} */
  this.maxLength = 200;
  /** @type {RegExp} */
  this.validateRegex = null;
  /** @type {number} */
  this.minNumber;
  /** @type {number} */
  this.maxNumber;
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
  var validator = pn.ui.edit.ValidateInfo.createNumberValidator();
  validator.minLength = min;
  if (goog.isDefAndNotNull(opt_max)) validator.maxLength = opt_max;
  return validator;
};


/**
 * @param {pn.ui.edit.Field} field The field config to validate.
 * @param {*} val The object value to validate.
 * @return {string} Any error that this field can have.
 */
pn.ui.edit.ValidateInfo.prototype.validateField = function(field, val) {
  return this.validateItem(field.name, !!field.source, val);
};


/**
 * @param {string} name The name of the field.
 * @param {boolean} isParent Wether this field is a parent field.
 * @param {*} val The object value to validate.
 * @return {string} Any error that this field can have.
 */
pn.ui.edit.ValidateInfo.prototype.validateItem = function(name, isParent, val) {
  if (!goog.isDefAndNotNull(val) || !val.length || (isParent && val === '0')) {
    return this.required ? name + ' is required.' : '';
  }

  if (this.minLength && val.length < this.minLength)
    return name + ' must be at least ' + this.minLength + ' chars.';
  if (this.maxLength && val.length > this.maxLength)
    return name + ' must be at most ' + this.maxLength + ' chars.';
  if (this.validateRegex && !val.match(this.validateRegex))
    return name + ' appears to be invalid.';
  if (this.isNumber && isNaN(val))
    return name + ' must be a number.';
  if (this.minNumber !== undefined || this.maxNumber !== undefined) {
    var valueNumber = parseFloat(val.toString());
    if ((this.minNumber !== undefined && valueNumber < this.minNumber) ||
        (this.maxNumber !== undefined && valueNumber > this.maxNumber)) {
      return name + ' must be between ' + this.minNumber + ' - ' +
          this.maxNumber + '.';
    }
  }
  return '';
};
