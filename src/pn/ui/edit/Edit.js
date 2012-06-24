;
goog.provide('pn.ui.edit.Edit');
goog.provide('pn.ui.edit.Edit.EventType');

goog.require('goog.date.Date');
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.dom');
goog.require('pn.ui.FieldCtx');
goog.require('pn.ui.IDirtyAware');
goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.CommandsComponent');
goog.require('pn.ui.edit.Config');
goog.require('pn.ui.edit.FieldBuilder');
goog.require('pn.ui.edit.FieldValidator');
goog.require('pn.ui.edit.Interceptor');
goog.require('pn.ui.grid.ColumnSpec');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.Grid');



/**
 * @constructor
 * @extends {pn.ui.edit.CommandsComponent}
 * @implements {pn.ui.IDirtyAware}
 *
 * @param {!pn.ui.UiSpec} spec The specifications for this edit.
 * @param {!Object} entity The entity object to edit, {} for new entity.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 */
pn.ui.edit.Edit = function(spec, entity, cache) {
  goog.asserts.assert(spec);
  goog.asserts.assert(entity);
  goog.asserts.assert(cache);

  pn.ui.edit.CommandsComponent.call(this, spec, entity);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.edit.Edit');

  /** @type {boolean} */
  this.fireInterceptorEvents = true;

  /**
   * @private
   * @type {!Object.<!Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {pn.ui.edit.Config}
   */
  this.cfg_ = this.spec.editConfig;

  /**
   * @private
   * @type {pn.ui.edit.Interceptor}
   */
  this.interceptor_ = null;

  /**
   * @private
   * @type {!Array.<pn.ui.FieldCtx>}
   */
  this.fctxs_ = goog.array.map(this.cfg_.fieldSpecs, function(fieldSpec) {
    return new pn.ui.FieldCtx(fieldSpec, entity, cache);
  }, this);

  /**
   * @private
   * @type {!Object.<!Array.<!(Element|goog.ui.Component)>>}
   */
  this.controls_ = {};
};
goog.inherits(pn.ui.edit.Edit, pn.ui.edit.CommandsComponent);


/** @inheritDoc. */
pn.ui.edit.Edit.prototype.isDirty = function() {
  this.log_.fine('isDirty: ' + this.spec.id);
  var dirty = goog.array.findIndex(this.getEditableFields_(), function(fctx) {
    var ctl = this.controls_[fctx.id][0];
    return fctx.isShown(ctl) &&
        fctx.isDirty(this.entity, ctl);
  }, this) >= 0;
  this.log_.fine('isDirty: ' + this.spec.id + ' -> ' + dirty);
  return dirty;
};


/** @inheritDoc. */
pn.ui.edit.Edit.prototype.resetDirty = function() {
  this.log_.fine('resetDirty: ' + this.spec.id);
  this.entity = this.getCurrentFormData();
};


/** @return {!Array.<!pn.ui.FieldCtx>} All fields. */
pn.ui.edit.Edit.prototype.getFields = function() { return this.fctxs_; };


/**
 * @param {string} id The id of the field whose control we want.
 * @return {!(Element|goog.ui.Component)} The component for the specified
 *    field id.
 */
pn.ui.edit.Edit.prototype.getControl = function(id) {
  var control = this.controls_[id][0];
  if (!control) throw new Error('Cound not find the control for id: ' + id);
  return control;
};


/**
 * @param {string} id The id of the field whose control we want.
 * @return {!Element} The component parent for the specified field id.
 */
pn.ui.edit.Edit.prototype.getParentControl = function(id) {
  var parent = this.controls_[id][1];
  if (!parent) throw new Error('Cound not find the parent for id: ' + id);
  return /** @type {!Element} */ (parent);
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  var div = goog.dom.createDom('div', 'details-container ' + this.spec.type);
  goog.dom.appendChild(element, div);
  if (this.cfg_.titleStrategy) {
    var headerDiv = goog.dom.createDom('div', 'edit-head');
    var title = this.cfg_.titleStrategy(this.spec, this.entity, this.cache_);
    var titleDiv = goog.dom.createDom('div', 'edit-title');
    titleDiv.innerHTML = title;
    goog.dom.appendChild(headerDiv, titleDiv);
    goog.dom.appendChild(div, headerDiv);
    pn.ui.edit.Edit.superClass_.decorateInternal.call(this, headerDiv);
  } else {
    pn.ui.edit.Edit.superClass_.decorateInternal.call(this, div);
  }
  if (this.cfg_.template) {
    var html = this.cfg_.template(this.entity);
    var templateDiv = goog.dom.htmlToDocumentFragment(html);
    goog.dom.appendChild(div, templateDiv);
  }
  this.decorateFields_(div);
  this.updateRequiredClasses();
};


/**
 * @private
 * @param {!Element} parent The parent element to attach the fields to.
 */
pn.ui.edit.Edit.prototype.decorateFields_ = function(parent) {
  var fb = pn.ui.edit.FieldBuilder;

  var useTemplate = !!this.cfg_.template,
      focusSet = !this.cfg_.autoFocus,
      fieldset = useTemplate ? null : goog.dom.createDom('fieldset', 'fields'),
      newEntity = pn.data.EntityUtils.isNew(this.entity);

  if (fieldset) { goog.dom.appendChild(parent, fieldset); }

  goog.array.forEach(this.fctxs_,
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) {
        // Do not do child tables on new entities
        var parentComp = useTemplate ? pn.dom.getElement(fctx.id) : fieldset;

        if ((newEntity && !fctx.spec.showOnAdd) ||
            (!fctx.spec.showOnReadOnly && fctx.spec.readonly)) {
          if (useTemplate) {
            // Hide the parent only if using templates, otherwise it will try
            // to hide the parent fieldset which may include other fields.
            goog.style.showElement(parentComp, false);
          }
          return;
        }
        var renderer = fctx.getFieldRenderer();
        if (!useTemplate &&
            (!(renderer instanceof pn.ui.edit.ComplexRenderer) ||
                renderer.showLabel !== false)) {
          parentComp = fb.getFieldLabel(fctx);
          goog.dom.appendChild(fieldset, parentComp);
        }
        var input = fb.createAndAttach(fctx, parentComp, this.entity);
        // TODO: This code should not be here, perhaps in FildCtx?
        // If this is a private '_' field, like an attachment control and we
        // are using a complex renderer, lets set the initial value on the
        // current entity so we can use this later for dirty comparison.
        if (goog.string.startsWith(fctx.id, '_') && input.getValue) {
          this.entity[fctx.id] = input.getValue();
        }
        this.controls_[fctx.id] = [input, parentComp];

        if (!focusSet && input.focus && !fctx.spec.readonly) {
          focusSet = true;
          goog.Timer.callOnce(function() {
            try { input.focus(); } catch (ex) {}
          }, 1); }
      }, this);
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.updateRequiredClasses = function() {
  goog.array.forEach(this.fctxs_,
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) {
        var parent = this.controls_[fctx.id][1];
        if (!parent) return; // Not shown, such as fields not shown on add

        if (fctx.isRequired()) {
          goog.dom.classes.add(parent, 'required');
        } else {
          goog.dom.classes.remove(parent, 'required');
        }
      }, this);
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.isValidForm = function() {
  var errors = this.getFormErrors();
  if (errors.length) {
    var et = pn.ui.edit.Edit.EventType.VALIDATION_ERROR;
    var event = new goog.events.Event(et, this);
    event.errors = errors;
    this.publishEvent_(event);
  }

  return !errors.length;
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.getFormErrors = function() {
  var errors = [];
  goog.array.forEach(this.getEditableFields_(),
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) {
        var ctl = this.controls_[fctx.id][0];
        if (!fctx.isShown(ctl)) return;
        errors = goog.array.concat(errors, fctx.validate(ctl));
      }, this);
  if (this.fireInterceptorEvents && this.interceptor_) {
    var errors2 = this.interceptor_.getCustomValidationErrors();
    errors = goog.array.concat(errors, errors2);
  }
  return errors;
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.getCurrentFormData = function() {
  var current = {};
  goog.object.extend(current, this.entity);
  goog.object.extend(current, this.getFormData());

  return current;
};


/**
 * @return {!Object.<*>} The values of each field in the current form.  This
 *    does not include the base data object (this.entity) information.
 */
pn.ui.edit.Edit.prototype.getFormData = function() {
  var current = {};
  goog.array.forEach(this.getEditableFields_(),
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) {
        var ctl = this.controls_[fctx.id][0];
        var val = fctx.getControlValue(ctl, current);
        if (val !== undefined) current[fctx.spec.dataProperty] = val;
      }, this);
  return current;
};


/**
 * @private
 * @return {!Array.<!pn.ui.FieldCtx>} All editable fields.
 */
pn.ui.edit.Edit.prototype.getEditableFields_ = function() {
  return goog.array.filter(this.fctxs_,
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) { return fctx.isEditable(this.entity); }, this);
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.fireCommandEvent = function(command, data) {
  var event = new goog.events.Event(command.eventType, this);
  event.data = data;
  this.publishEvent_(event);
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.enterDocument = function() {
  pn.ui.edit.Edit.superClass_.enterDocument.call(this);
  goog.array.forEach(this.fctxs_, this.enterDocumentOnChildrenField_, this);

  if (!this.fireInterceptorEvents || !this.cfg_.interceptor) return;

  this.interceptor_ = new this.cfg_.interceptor(
      this, this.entity, this.cache_, this.controls_, this.getCommandButtons());
};


/**
 * @private
 * @param {pn.ui.FieldCtx} fctx The field to attach events to.
 */
pn.ui.edit.Edit.prototype.enterDocumentOnChildrenField_ = function(fctx) {
  var fieldSpec = fctx.spec;
  if (!fieldSpec.tableType || fieldSpec.readonly) return;

  var grid = this.controls_[fctx.id][0];
  this.eh.listen(grid, pn.ui.grid.Grid.EventType.ADD, function() {
    var e = new goog.events.Event(pn.ui.edit.Edit.EventType.ADD_CHILD, this);
    e.parent = this.entity;
    e.entityType = fieldSpec.tableType;
    e.parentField = fieldSpec.tableParentField;
    this.publishEvent_(e);
  });
  this.eh.listen(grid, pn.ui.grid.Grid.EventType.ROW_SELECTED, function(ev) {
    var e = new goog.events.Event(pn.ui.edit.Edit.EventType.EDIT_CHILD, this);
    e.entityId = ev.selected['ID'];
    e.parent = this.entity;
    e.entityType = fieldSpec.tableType;
    e.parentField = fieldSpec.tableParentField;
    this.publishEvent_(e);
  });
};


/**
 * @private
 * @param {!goog.events.Event} e The event to publish using the pn.app.ctx.pub
 *    mechanism.
 */
pn.ui.edit.Edit.prototype.publishEvent_ = function(e) {
  if (!this.cfg_.publishEventBusEvents) {
    this.dispatchEvent(e);
    return;
  }

  var ae = pn.app.AppEvents;
  var args;
  switch (e.type) {
    case pn.ui.edit.Edit.EventType.ADD_CHILD:
      args = [ae.CHILD_ENTITY_ADD, e.parent, e.entityType, e.parentField];
      break;
    case pn.ui.edit.Edit.EventType.EDIT_CHILD:
      args = [ae.ENTITY_SELECT, e.entityType, e.entityId];
      break;
    case pn.ui.edit.Edit.EventType.VALIDATION_ERROR:
      args = [ae.ENTITY_VALIDATION_ERROR, e.errors];
      break;
    default:
      args = ['entity-' + e.type, this.spec.type, e.data];
  }
  pn.app.ctx.pub.apply(null, args);
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.disposeInternal = function() {
  pn.ui.edit.Edit.superClass_.disposeInternal.call(this);

  goog.dispose(this.log_);
  goog.dispose(this.interceptor_);
  goog.array.forEach(this.fctxs_, goog.dispose);
  goog.object.forEach(this.controls_, function(arr) {
    goog.array.forEach(arr, goog.dispose);
  });

  delete this.interceptor_;
  delete this.controls_;
  delete this.fctxs_;
  delete this.cfg_;
  delete this.log_;
};


/** @enum {string} */
pn.ui.edit.Edit.EventType = {
  SAVE: 'save',
  CANCEL: 'cancel',
  DELETE: 'delete',
  CLONE: 'clone',
  ADD_CHILD: 'add-child',
  EDIT_CHILD: 'edit-child',
  VALIDATION_ERROR: 'validation-error'
};
