
goog.provide('pn.app.schema.Schema');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.app.schema.EntitySchema');
goog.require('pn.app.schema.FieldSchema');



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
   * @type {!Object.<!pn.app.schema.EntitySchema>}
   */
  this.entities_ = {};

  goog.array.forEach(description, this.parseEntity_, this);
};
goog.inherits(pn.app.schema.Schema, goog.Disposable);


/**
 * @param {string} type The type of entities we are ordering.
 * @param {!Array.<!Object>} list The entities to order.
 */
pn.app.schema.Schema.prototype.orderEntities = function(type, list) {
  var entitySchema = this.entities_[type];
  var orderp = type + 'Order';
  var namep = type + 'Name';
  var order = entitySchema.fieldSchemas[orderp];
  var name = entitySchema.fieldSchemas[namep];

  if (order && order.type === 'Int32') {
    goog.array.sort(list, function(a, b) { return a[orderp] - b[orderp]; });
  } else if (name && name.type === 'String') {
    goog.array.sort(list, function(a, b) {
      return goog.string.caseInsensitiveCompare(a[namep], b[namep]);
    });
  }
};


/**
 * @param {!pn.ui.BaseFieldSpec} fieldSpec The field spec for the field being
 *     queried.
 * @return {pn.app.schema.FieldSchema} The field schema for the specified field.
 */
pn.app.schema.Schema.prototype.getFieldSchema = function(fieldSpec) {
  var type = fieldSpec.entitySpec.type;
  var prop = fieldSpec.dataProperty;
  return this.entities_[type].fieldSchemas[prop];
};


/**
 * @param {!pn.ui.edit.FieldCtx} fctx The field context for the field being
 *    validated.
 * @param {!(Element|goog.ui.Component)} control The control for this field.
 * @return {!Array.<string>} Any errors (if any) for the specified field.
 */
pn.app.schema.Schema.prototype.getValidationErrors = function(fctx, control) {
  var schema = this.getFieldSchema(fctx.spec);
  if (!schema) {
    var desc = fctx.spec.entitySpec.type + '.' + fctx.id;
    throw new Error('Could not find the schema of ' + desc);
  }
  var validator = new pn.ui.edit.ValidateInfo();
  validator.required = !schema.allowNull;
  if (fctx.length) {
    validator.maxLength = schema.length;
  }
  if (this.isNumericalTypeField_(schema)) {
    validator.isNumber = true;
  }
  var error = validator.validateField(fctx, control);
  return error ? [error] : [];
};


/**
 * @private
 * @param {!pn.app.schema.FieldSchema} fieldSchema The field to determine
 *    wether its a number type.
 * @return {boolean} Wether the specified field is a number.
 */
pn.app.schema.Schema.prototype.isNumericalTypeField_ = function(fieldSchema) {
  var t = fieldSchema.type;
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
    var fieldSchema = this.parseFieldSchema_(f);
    fields[fieldSchema.name] = fieldSchema;
  }, this);
  var e = new pn.app.schema.EntitySchema(name, fields);
  this.entities_[name] = e;
};


/**
 * @private
 * @param {!Object} f The description of the field from the server (
 *   i.e. Use object property string identifiers.).
 * @return {!pn.app.schema.FieldSchema} The parsed field.
 */
pn.app.schema.Schema.prototype.parseFieldSchema_ = function(f) {
  goog.asserts.assert(f);

  return new pn.app.schema.FieldSchema(
      f['name'], f['type'], f['allowNull'], f['length']);

};
