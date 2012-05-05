
goog.provide('pn.app.schema.Schema');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.app.schema.Entity');
goog.require('pn.app.schema.Field');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Array} description The description of the schema from the server (
 *   i.e. Use object property string identifiers.).
 */
pn.app.schema.Schema = function(description) {
  goog.Disposable.call(this);

  goog.asserts.assert(description);

  /**
   * @private
   * @type {!Object.<!pn.app.schema.Entity>}
   */
  this.entities_ = {};

  goog.array.forEach(description, this.parseEntity_, this);
};
goog.inherits(pn.app.schema.Schema, goog.Disposable);

/**
 * @param {!pn.ui.edit.Field} fieldSpec The field spec for the field being
 *     queried.
 * @return {pn.app.schema.Field} The field schema for the specified field.
 */
pn.app.schema.Schema.prototype.getFieldSchema = function(fieldSpec) {
  var type = fieldSpec.entitySpec.type;
  var prop = fieldSpec.dataProperty;
  return this.entities_[type].fields[prop];
};


/**
 * @param {!pn.ui.edit.Field} fieldSpec The field spec for the field being
 *     validated.
 * @param {*} value The value of the field in the current form.
 * @return {!Array.<string>} Any errors (if any) for the specified field.
 */
pn.app.schema.Schema.prototype.getValidationErrors =
    function(fieldSpec, value) {
  var field = this.getFieldSchema(fieldSpec);
  if (!field) {
    var desc = fieldSpec.entitySpec.type + '.' + fieldSpec.id;
    throw new Error('Could not find the schema of ' + desc);
  }
  var validator = new pn.ui.edit.ValidateInfo();
  validator.required = !field.allowNull;
  if (field.length) {
    validator.maxLength = field.length;
  }
  if (this.isNumericalTypeField_(field)) {
    validator.isNumber = true;
  }
  var error = validator.validateField(fieldSpec, value);
  return error ? [error] : [];
};


/**
 * @private
 * @param {!pn.app.schema.Field} field The field to determine wether its a
 *    number type.
 * @return {boolean} Wether the specified field is a number.
 */
pn.app.schema.Schema.prototype.isNumericalTypeField_ = function(field) {
  var t = field.type;
  return t === 'Byte ' ||
      t === 'Int16' ||
      t === 'Int32' ||
      t === 'Int64' ||
      t === 'Single' ||
      t === 'Double' ||
      t === 'Decimal';
};


/**
 * @private
 * @param {!Object} entity The description of the entity from the server (
 *   i.e. Use object property string identifiers.).
 */
pn.app.schema.Schema.prototype.parseEntity_ = function(entity) {
  goog.asserts.assert(entity);

  var name = entity['name'];
  var fields = {};
  goog.array.forEach(entity['fields'], function(f) {
    var field = this.parseField_(f);
    fields[field.name] = field;
  }, this);
  var e = new pn.app.schema.Entity(name, fields);
  this.entities_[name] = e;
};


/**
 * @private
 * @param {!Object} f The description of the field from the server (
 *   i.e. Use object property string identifiers.).
 * @return {!pn.app.schema.Field} The parsed field.
 */
pn.app.schema.Schema.prototype.parseField_ = function(f) {
  goog.asserts.assert(f);

  return new pn.app.schema.Field(
      f['name'], f['type'], f['allowNull'], f['length']);

};

/** @inheritDoc */
pn.app.schema.Schema.prototype.disposeInternal = function() {
  pn.app.schema.Schema.superClass_.disposeInternal.call(this);

  delete this.entities_;
};