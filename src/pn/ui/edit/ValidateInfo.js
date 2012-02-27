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
  var validator = pn.ui.edit.ValidateInfo.createNumberValidator();
  validator.minLength = min;
  if (goog.isDefAndNotNull(opt_max)) validator.maxLength = opt_max;
  return validator;
};


/**
 * @param {pn.ui.edit.Field} field The field config to validate.
 * @param {*} val The object value to validate.
 * @param {Object=} opt_entity The entity being validated
 * @param {Array.<Object>=} opt_all All entities of this type
 * @return {string} Any error that this field can have.
 */
pn.ui.edit.ValidateInfo.prototype.validateField = 
    function(field, val, opt_entity, opt_all) {
  return this.validateItem(
      field.id, field.name, !!field.source, val, opt_entity, opt_all);
};


/**
 * @param {string} id The id of this field
 * @param {string} name The name of the field.
 * @param {boolean} isParent Wether this field is a parent field.
 * @param {*} val The object value to validate.
 * @param {Object=} opt_entity The entity being validated
 * @param {Array.<Object>=} opt_all All entities of this type
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
  if (this.minNumber !== undefined || this.maxNumber !== undefined) {
    var valueNumber = parseFloat(val.toString());
    if ((this.minNumber !== undefined && valueNumber < this.minNumber) ||
        (this.maxNumber !== undefined && valueNumber > this.maxNumber)) {
      return name + ' must be between ' + this.minNumber + ' - ' +
          this.maxNumber + '.';
    }
  }
  if (val && this.unique) {
    if (!opt_all) throw new Error('Expected entities list to be provided');
    if (!opt_entity) throw new Error('Expected entity to be provided');
    var hasDuplicate = goog.array.findIndex(opt_all, function(e) {
      console.log('val: ' + val + ' e[id]: ' + e[id] + ' opt_entity[ID]: ' + opt_entity['ID'] + ' e[ID]: ' + e['ID']);
      if (e[id] === val && opt_entity['ID'] !== e['ID']) {
        return true;
      }
    }) >= 0;
    if (hasDuplicate) return name + ' must be unique';
  }
  return '';
};
