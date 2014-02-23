;
goog.provide('pn.ui.edit.ValidateInfo');

goog.require('pn.ui.InputDatePicker');



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
  var validator = new pn.ui.edit.ValidateInfo();
  validator.required = true;
  return validator;
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
 * @param {pn.ui.edit.FieldCtx} fctx The field ctx to validate.
 * @param {!(Element|Text|goog.ui.Component)} control The control for this
 *    field.
 * @return {string} Any error that this field can have.
 */
pn.ui.edit.ValidateInfo.prototype.validateField = function(fctx, control) {
  var val = fctx.getControlValue(control),
      isParent = pn.data.EntityUtils.isParentProperty(fctx.spec.dataProperty),
      isYesNoRenderer = control.className === 'yesno',
      isEmptyParentOrYesNo = (isParent || isYesNoRenderer) &&
          (val === '0' || val === 0),
      isNullDate = control instanceof pn.ui.InputDatePicker && val === 0;

  if (!goog.isDefAndNotNull(val) || val === '' ||
      isEmptyParentOrYesNo || isNullDate) {
    return this.required ? fctx.spec.name + ' is required.' : '';
  }

  if (this.minLength && val.length < this.minLength)
    return fctx.spec.name + ' must be at least ' + this.minLength + ' chars.';
  if (this.maxLength && val.length > this.maxLength)
    return fctx.spec.name + ' must be at most ' + this.maxLength + ' chars.';
  if (this.validateRegex && !val.match(this.validateRegex))
    return fctx.spec.name + ' appears to be invalid.';
  if (this.isNumber && isNaN(val))
    return fctx.spec.name + ' must be a number.';
  if (!isNaN(this.minNumber) || !isNaN(this.maxNumber)) {
    var valueNumber = parseFloat(val.toString());
    if ((!isNaN(this.minNumber) && valueNumber < this.minNumber) ||
        (!isNaN(this.maxNumber) && valueNumber > this.maxNumber)) {
      return fctx.spec.name + ' must be between ' + this.minNumber + ' - ' +
          this.maxNumber + '.';
    }
  }
  return '';
};
