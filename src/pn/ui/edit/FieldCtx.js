;
goog.provide('pn.ui.edit.FieldCtx');

goog.require('pn.ui.edit.EditUtils');
goog.require('pn.ui.edit.EditUtils');
goog.require('pn.ui.edit.FieldValidator');
goog.require('pn.ui.edit.ValidateInfo');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.ui.edit.FieldSpec} spec The field specifications.
 * @param {!pn.data.BaseDalCache} cache The current cache.
 */
pn.ui.edit.FieldCtx = function(spec, cache) {
  pn.ass(spec);
  pn.ass(cache);

  goog.Disposable.call(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.edit.FieldCtx');

  /** @type {!pn.ui.edit.FieldSpec} */
  this.spec = spec;

  /** @type {!pn.data.BaseDalCache} */
  this.cache = cache;

  /** @type {!string} */
  this.id = spec.id;

  /** @type {!string} */
  this.controlId = '_ctl_' + (++pn.ui.edit.FieldCtx.ID_COUNTER_) + '_' +
      spec.id.replace(/\./g, '_');

  /** @type {!pn.ui.UiSpec} */
  this.entitySpec = spec.entitySpec;

  /** @type {pn.data.FieldSchema} */
  this.schema = this.id.pnstartsWith('_') ||
      this.id.indexOf('.') >= 0 ?
          null : pn.data.TypeRegister.getFieldSchema(
              this.entitySpec.type, this.id);
};
goog.inherits(pn.ui.edit.FieldCtx, goog.Disposable);


/**
 * @private
 * @type {number}
 */
pn.ui.edit.FieldCtx.ID_COUNTER_ = 0;


/**
 * @param {!pn.data.Entity} entity Then entity is required to check wether this
 *    is a new entity or existing one as some fields are only editable if
 *    or if not a new entity.
 * @return {boolean} Wether this field is editable.
 */
pn.ui.edit.FieldCtx.prototype.isEditable = function(entity) {
  pn.assInst(entity, pn.data.Entity);

  return !this.spec.readonly && !this.spec.tableType &&
      (this.spec.showOnAdd || !pn.data.EntityUtils.isNew(entity));
};


/** @return {boolean} Wether this field is required. */
pn.ui.edit.FieldCtx.prototype.isDefaultRequired = function() {
  if (this.spec.readonly) return false;
  if (this.spec.validator && this.spec.validator.required) return true;
  if (this.schema != null && !this.schema.allowNull) {
    // No need to show required '*' for bools as they are either false or true.
    if (this.schema.type !== 'boolean') { return true; }
  }
  return false;
};


/**
 * @param {!(Element|Text|goog.ui.Component)} component The compoenent that
 *    this field is rendererd on.
 * @param {Object=} opt_target The optional 'entity' target to inject values
 *    into if required.
 * @return {*} The current control value of this field.
 */
pn.ui.edit.FieldCtx.prototype.getControlValue =
    function(component, opt_target) {
  return pn.ui.edit.EditUtils.getFieldValue(component, opt_target);
};


/**
 * @param {!(Element|Text|goog.ui.Component)} control The control that this
 *    field is rendererd on.
 * @return {boolean} visible Wether the specified field element is currently
 *    visible.
 */
pn.ui.edit.FieldCtx.prototype.isShown = function(control) {
  return pn.ui.edit.EditUtils.isShown(control, this.controlId);
};


/**
 * @protected
 * @param {!(Element|Text|goog.ui.Component)} control The control that this
 *    field is rendererd on.
 * @param {boolean} visible Wether to show or hide the element.
 */
pn.ui.edit.FieldCtx.prototype.showElement = function(control, visible) {
  pn.ui.edit.EditUtils.showElement(control, this.controlId, visible);
};


/**
 * @param {!pn.data.Entity} entity The entity's whose value we need.
 * @return {*} The value of  this field.
 */
pn.ui.edit.FieldCtx.prototype.getEntityValue = function(entity) {
  pn.assInst(entity, pn.data.Entity);

  var v = entity.getValueOrExt(this.spec.dataProperty);

  if (!goog.isDef(v) && pn.data.EntityUtils.isNew(entity) &&
      goog.isDefAndNotNull(this.spec.defaultValue)) {
    return this.getDefaultFieldValue_();
  }

  return v;
};


/**
 * @param {!pn.data.Entity} entity The entity's whose display value we need.
 * @return {*} The display value of this field.
 */
pn.ui.edit.FieldCtx.prototype.getDisplayValue = function(entity) {
  pn.assInst(entity, pn.data.Entity);
  return pn.data.EntityUtils.getEntityDisplayValue(
      this.cache,
      this.spec.displayPath,
      this.spec.entitySpec.type,
      entity,
      this.spec.tableParentField);
};


/**
 * @param {!pn.data.Entity} entity The entity being checked for dirty.
 * @param {!(Element|Text|goog.ui.Component)} control The control for this
 *    field.
 * @return {boolean} Wether this field is currently dirty (i.e. The control is
 *    different than the entity value).
 */
pn.ui.edit.FieldCtx.prototype.isDirty = function(entity, control) {
  pn.assInst(entity, pn.data.Entity);
  pn.ass(control);

  if (!this.isShown(control) || this.spec.ignoreDirty) return false;

  var orig = this.getEntityValue(entity);
  var curr = this.getControlValue(control);

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
 * @param {!(Element|Text|goog.ui.Component)} control The control for this
 *    field.
 * @param {boolean} forceRequired Make field required regardless of validator
 *    and schema state.
 * @return {!Array.<string>} An error list of all validation errors (empty if
 *    no errors found).
 */
pn.ui.edit.FieldCtx.prototype.validate = function(control, forceRequired) {
  // TODO: Its messy that this calls FieldValidator who calls
  // this.getValidationErrors below.
  var errs = pn.ui.edit.FieldValidator.validateFieldValue(
      this, control, forceRequired);
  if (errs.length) {
    var val = this.getControlValue(control);
    this.log_.info('Field: ' + this.id + ' val: ' + val + ' error: ' + errs);
  }
  return errs;
};


/**
 * @param {!(Element|Text|goog.ui.Component)} control The control for this
 *    field.
 * @param {boolean} forceRequired Make field required regardless of validator
 *    and schema state.
 * @return {!Array.<string>} Any errors (if any) for the specified field.
 */
pn.ui.edit.FieldCtx.prototype.getValidationErrors =
    function(control, forceRequired) {
  var validator = new pn.ui.edit.ValidateInfo();
  validator.required = !!forceRequired || !this.schema.allowNull;
  if (this.length) { validator.maxLength = this.schema.length; }
  if (this.schema.type === 'number') { validator.isNumber = true; }
  var error = validator.validateField(this, control);
  return error ? [error] : [];
};


/**
 * @private
 * @return {*} The default value of  this field.
 */
pn.ui.edit.FieldCtx.prototype.getDefaultFieldValue_ = function() {
  pn.ass(goog.isDefAndNotNull(this.spec.defaultValue));

  var val = this.spec.defaultValue;
  if (pn.data.EntityUtils.isParentProperty(this.spec.dataProperty)) {
    var type = pn.data.EntityUtils.getTypeProperty(
        this.entitySpec.type, this.spec.dataProperty);
    var list = this.cache.get(type);
    val = list.pnfind(function(e) {
      return e.getValue(type + 'Name') === this.spec.defaultValue;
    }, this).id;
  } else if (this.schema.type === 'Enumeration') {
    for (var name in this.schema.entityType) {
      if (name === val) { val = this.schema.entityType[name]; }
    }
  }
  return val;
};


/** @override */
pn.ui.edit.FieldCtx.prototype.disposeInternal = function() {
  pn.ui.edit.FieldCtx.superClass_.disposeInternal.call(this);

  delete this.spec;
  delete this.cache;
  delete this.entitySpec;
  delete this.schema;
};
