
goog.provide('pn.ui.edit.FieldCtx');

goog.require('pn.ui.edit.Field');


/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.ui.edit.Field} fieldSpec The field specifications
 * @param {!Object} entity The current entity being rendererd
 * @param {!Array.<!Object>} cache The current cache
 */
pn.ui.edit.FieldCtx = function(fieldSpec, entity, cache) {  
  goog.asserts.assert(fieldSpec);
  goog.asserts.assert(entity);
  goog.asserts.assert(cache);

  goog.Disposable.call(this);

  /** @type {!pn.ui.edit.Field} */
  this.fieldSpec = fieldSpec;

  /** @type {!Object} */
  this.entity = entity;

  /** @type {!Array.<!Object>} */
  this.cache = cache;  

  /** @type {!string} */
  this.id = fieldSpec.id;

  /** @type {!pn.ui.UiSpec} */
  this.entitySpec = fieldSpec.entitySpec;

  /** @type {!pn.app.schema.FieldDef} */
  this.fieldSchema = pn.app.ctx.schema.getFieldSchema(fieldSpec);  

  /** @type {(Element|goog.ui.Component)> */
  this.component = null;

  /** @type {Element> */
  this.parentComponent = null;
};

goog.inherits(pn.ui.edit.FieldCtx, goog.Disposable.call);