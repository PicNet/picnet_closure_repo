
goog.provide('pn.app.schema.Schema');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.app.schema.EntityDef');
goog.require('pn.app.schema.FieldDef');



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
   * @type {!Object.<!pn.app.schema.EntityDef>}
   */
  this.entities_ = {};

  goog.array.forEach(description, this.parseEntity_, this);
};
goog.inherits(pn.app.schema.Schema, goog.Disposable);


/**
 * @param {!pn.ui.BaseField} fieldSpec The field spec for the field being
 *     queried.
 * @return {pn.app.schema.FieldDef} The field schema for the specified field.
 */
pn.app.schema.Schema.prototype.getFieldSchema = function(fieldSpec) {
  var type = fieldSpec.entitySpec.type;
  var prop = fieldSpec.dataProperty;
  return this.entities_[type].fields[prop];
};


/**
 * @param {!pn.ui.FieldCtx} field The field context for the field being
 *    validated.
 * @return {!Array.<string>} Any errors (if any) for the specified field.
 */
pn.app.schema.Schema.prototype.getValidationErrors = function(field) {
  var schema = this.getFieldSchema(field.spec);
  if (!schema) {
    var desc = field.spec.entitySpec.type + '.' + field.id;
    throw new Error('Could not find the schema of ' + desc);
  }
  var validator = new pn.ui.edit.ValidateInfo();
  validator.required = !schema.allowNull;
  if (field.length) {
    validator.maxLength = schema.length;
  }
  if (this.isNumericalTypeField_(schema)) {
    validator.isNumber = true;
  }
  var error = validator.validateField(field);
  return error ? [error] : [];
};


/**
 * @private
 * @param {!pn.app.schema.FieldDef} field The field to determine wether its a
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
  var e = new pn.app.schema.EntityDef(name, fields);
  this.entities_[name] = e;
};


/**
 * @private
 * @param {!Object} f The description of the field from the server (
 *   i.e. Use object property string identifiers.).
 * @return {!pn.app.schema.FieldDef} The parsed field.
 */
pn.app.schema.Schema.prototype.parseField_ = function(f) {
  goog.asserts.assert(f);

  return new pn.app.schema.FieldDef(
      f['name'], f['type'], f['allowNull'], f['length']);

};


/** @inheritDoc */
pn.app.schema.Schema.prototype.disposeInternal = function() {
  pn.app.schema.Schema.superClass_.disposeInternal.call(this);

  delete this.entities_;
};
