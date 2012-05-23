;
goog.provide('pn.ui.FieldCtx');

goog.require('pn.ui.BaseField');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.ui.BaseField} spec The field specifications.
 * @param {!Object} entity The current entity being rendererd.
 * @param {!Object.<!Array.<!Object>>} cache The current cache.
 */
pn.ui.FieldCtx = function(spec, entity, cache) {
  goog.asserts.assert(spec);
  goog.asserts.assert(entity);
  goog.asserts.assert(cache);

  goog.Disposable.call(this);

  /** @type {!pn.ui.BaseField} */
  this.spec = spec;

  /** @type {Object} */
  this.entity = entity;

  /** @type {!Object.<!Array.<!Object>>} */
  this.cache = cache;

  /** @type {!string} */
  this.id = spec.id;

  /** @type {!pn.ui.UiSpec} */
  this.entitySpec = spec.entitySpec;

  /** @type {pn.app.schema.FieldDef} */
  this.schema = pn.app.ctx.schema.getFieldSchema(spec);

  /** @type {(Element|goog.ui.Component)} */
  this.component = null;

  /** @type {Element} */
  this.parentComponent = null;
};
goog.inherits(pn.ui.FieldCtx, goog.Disposable.call);


/** @return {boolean} Wether this field is editable. */
pn.ui.FieldCtx.prototype.isEditable = function() {
  goog.asserts.assert(this.entity);

  return !this.spec.readonly && !this.spec.tableType &&
      (this.spec.showOnAdd || !pn.data.EntityUtils.isNew(this.entity));
};


/** @return {boolean} Wether this field is required. */
pn.ui.FieldCtx.prototype.isRequired = function() {
  if (!this.spec.readonly) return false;
  return (this.spec.validator && this.spec.validator.required) ||
      (this.schema != null && !this.schema.allowNull);
};


/** @return {*} The current control value of this field. */
pn.ui.FieldCtx.prototype.getControlValue = function() {
  return pn.ui.edit.FieldBuilder.getFieldValue(this.component);
};


/** @return {*} The value of  this field. */
pn.ui.FieldCtx.prototype.getEntityValue = function() {
  if (!goog.isDefAndNotNull(this.entity)) return null;
  return this.entity[this.spec.dataProperty];
};


/** @return {*} The display value of this field. */
pn.ui.FieldCtx.prototype.getDisplayValue = function() {
  return pn.data.EntityUtils.getEntityDisplayValue(
      this.cache,
      this.spec.displayPath,
      this.entity,
      this.spec.tableParentField);
};


/** @inheritDoc */
pn.ui.FieldCtx.prototype.disposeInternal = function() {
  pn.ui.FieldCtx.superClass_.disposeInternal.call(this);

  goog.dispose(this.component);
  goog.dispose(this.parentComponent);
  if (this.spec.renderer) goog.dispose(this.spec.renderer);

  delete this.component;
  delete this.parentComponent;
};
