;
goog.provide('pn.ui.edit.ValidateInfo');



/**
 * @constructor
 * @param {number=} opt_maxLength The optional max length of the field.
 */
pn.ui.edit.ValidateInfo = function(opt_maxLength) {

  /** @type {boolean} */
  this.required = true;

  /** @type {number} */
  this.minLength = 1;

  /** @type {number} */
  this.maxLength = opt_maxLength || 0;

  /** @type {RegExp} */
  this.validateRegex = null;

  /** @type {number} */
  this.minNumber = Number.NaN;

  /** @type {number} */
  this.maxNumber = Number.NaN;

  /** @type {boolean} */
  this.isNumber = false;

  /** @type {boolean} */
  this.unique = false;
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
  var validator = new pn.ui.edit.ValidateInfo(opt_max);
  validator.minLength = min;
  return validator;
};


/**
 * @param {pn.ui.edit.Field} field The field config to validate.
 * @param {*} val The object value to validate.
 * @param {Object=} opt_entity The entity being validated.
 * @param {Array.<Object>=} opt_all All entities of this type.
 * @return {string} Any error that this field can have.
 */
pn.ui.edit.ValidateInfo.prototype.validateField =
    function(field, val, opt_entity, opt_all) {
  return this.validateItem(
      field.id, field.name, !!field.source, val, opt_entity, opt_all);
};


/**
 * @param {string} id The id of this field.
 * @param {string} name The name of the field.
 * @param {boolean} isParent Wether this field is a parent field.
 * @param {*} val The object value to validate.
 * @param {Object=} opt_entity The entity being validated.
 * @param {Array.<Object>=} opt_all All entities of this type.
 * @return {string} Any error that this field can have.
 */
pn.ui.edit.ValidateInfo.prototype.validateItem =
    function(id, name, isParent, val, opt_entity, opt_all) {
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
  if (!isNaN(this.minNumber) || !isNaN(this.maxNumber)) {
    var valueNumber = parseFloat(val.toString());
    if ((!isNaN(this.minNumber) && valueNumber < this.minNumber) ||
        (!isNaN(this.maxNumber) && valueNumber > this.maxNumber)) {
      return name + ' must be between ' + this.minNumber + ' - ' +
          this.maxNumber + '.';
    }
  }
  if (val && this.unique) {
    if (!opt_all) throw new Error('Expected entities list to be provided');
    if (!opt_entity) throw new Error('Expected entity to be provided');
    var hasDuplicate = goog.array.findIndex(opt_all, function(e) {
      return e[id] === val && opt_entity['ID'] !== e['ID'];
    }) >= 0;
    if (hasDuplicate) return name + ' must be unique';
  }
  return '';
};
