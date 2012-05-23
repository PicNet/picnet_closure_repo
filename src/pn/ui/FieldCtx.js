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

  /** @type {pn.app.schema.FieldSchema} */
  this.schema = pn.app.ctx.schema.getFieldSchema(spec);

  /** @type {(Element|goog.ui.Component)} */
  this.component = null;

  /** @type {Element} */
  this.parentComponent = null;

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.FieldCtx');
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
  if (this.spec.readonly) return false;
  return (this.spec.validator && this.spec.validator.required) ||
      (this.schema != null && !this.schema.allowNull);
};


/** @return {*} The current control value of this field. */
pn.ui.FieldCtx.prototype.getControlValue = function() {
  return pn.ui.edit.FieldBuilder.getFieldValue(this.component);
};


/** @return {*} The value of  this field. */
pn.ui.FieldCtx.prototype.getEntityValue = function() {
  if (pn.data.EntityUtils.isNew(this.entity)) {
    if (goog.isDefAndNotNull(this.spec.defaultValue)) {
      return this.getDefaultFieldValue_();
    }
    return undefined;
  }
  var v = this.entity[this.spec.dataProperty];
  if (goog.string.endsWith(this.spec.dataProperty, 'Entities') &&
      goog.isArray(v)) {
    // Controls always return sorted IDs so here we ensure we never throw a
    // dirty error if for somereason the original value is not sorted.
    v.sort();
  }
  return v;
};


/**
 * @return {boolean} Wether this field is currently dirty (i.e. The control is
 *    different than the entity value).
 */
pn.ui.FieldCtx.prototype.isDirty = function() {
  var orig = this.getEntityValue();
  var curr = this.getControlValue();

  // Handle tricky falsies
  var isFalseEquivalent = function(val) {
    return !val || val === '0' || val === 'false' || val === '{}';
  };
  if (isFalseEquivalent(curr) && isFalseEquivalent(orig)) { return false; }

  // goog.string.canonicalizeNewlines required for IE7 which handles
  // newlines differently adding a keycode 13,10 rather than just 10
  curr = curr ? goog.string.canonicalizeNewlines(curr.toString()) : '';
  orig = orig ? goog.string.canonicalizeNewlines(orig.toString()) : '';

  if (curr !== orig) {
    this.log_.info('Dirty ' + this.id + ' 1[' + orig + '] 2[' + curr + ']');
  }
  return curr !== orig;
};


/**
 * @return {!Array.<string>} An error list of all validation errors (empty if
 *    no errors found).
 */
pn.ui.FieldCtx.prototype.validate = function() {
  var errs = pn.ui.edit.FieldValidator.validateFieldValue(this);
  if (errs.length) {
    var val = this.getControlValue();
    this.log_.info('Field: ' + this.id + ' val: ' + val + ' error: ' + errs);
  }
  return errs;
};


/**
 * @private
 * @return {*} The default value of  this field.
 */
pn.ui.FieldCtx.prototype.getDefaultFieldValue_ = function() {
  goog.asserts.assert(goog.isDefAndNotNull(this.spec.defaultValue));
  var val = this.spec.defaultValue;
  if (pn.data.EntityUtils.isParentProperty(this.spec.dataProperty)) {
    var type = pn.data.EntityUtils.getTypeProperty(this.spec.dataProperty);
    var list = this.cache[type];
    val = goog.array.find(list, function(e) {
      return e[type + 'Name'] === this.spec.defaultValue;
    }, this)['ID'];
  }
  return val;
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

  goog.dispose(this.log_);
  goog.dispose(this.component);
  goog.dispose(this.parentComponent);
  if (this.spec.renderer) goog.dispose(this.spec.renderer);

  delete this.log_;
  delete this.component;
  delete this.parentComponent;
};
