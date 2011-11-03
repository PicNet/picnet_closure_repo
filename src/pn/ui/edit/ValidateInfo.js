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
};


/**
 * @param {pn.ui.edit.Field} field The field config to validate.
 * @param {*} val The object value to validate.
 * @return {string} Any error that this field can have.
 */
pn.ui.edit.ValidateInfo.prototype.validateField = function(field, val) {
  var name = field.name;
  if (!val || (field.source && val === '0')) {
    return this.required ? name + ' is required.' : '';
  }

  if (this.minLength && val.length < this.minLength)
    return name + ' must be at least ' + this.minLength + ' chars.';
  if (this.maxLength && val.length > this.maxLength)
    return name + ' must be at most ' + this.maxLength + ' chars.';
  if (this.validateRegex && !val.match(this.validateRegex))
    return name + ' appears to be invalid.';
  return '';
};
