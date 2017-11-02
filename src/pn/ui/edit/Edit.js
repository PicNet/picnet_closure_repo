;
goog.provide('pn.ui.edit.Edit');
goog.provide('pn.ui.edit.Edit.EventType');

goog.require('goog.date.Date');
goog.require('goog.dom');
goog.require('goog.dom.classes');
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
   * @type {!Array.<pn.ui.FieldCtx>}
   */
  this.fctxs_ = goog.array.map(this.cfg_.fieldSpecs, function(fieldSpec) {
    return new pn.ui.FieldCtx(fieldSpec, entity, cache);
  }, this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.edit.Edit');
};
goog.inherits(pn.ui.edit.Edit, pn.ui.edit.CommandsComponent);


/** @inheritDoc. */
pn.ui.edit.Edit.prototype.isDirty = function() {
  this.log_.fine('isDirty: ' + this.spec.id);
  var dirty = goog.array.findIndex(this.getEditableFields_(), function(fctx) {
    return this.cfg_.interceptor.isShown(fctx.id) && fctx.isDirty();
  }, this) >= 0;
  this.log_.fine('isDirty: ' + this.spec.id + ' -> ' + dirty);
  return dirty;
};


/** @inheritDoc. */
pn.ui.edit.Edit.prototype.resetDirty = function() {
  this.log_.fine('resetDirty: ' + this.spec.id);

  this.entity = this.getCurrentFormData();
  goog.array.forEach(this.getEditableFields_(), function(fctx) {
    goog.object.extend(fctx.entity, this.entity);
  }, this);
};


/** @return {!Array.<!pn.ui.FieldCtx>} All fields. */
pn.ui.edit.Edit.prototype.getFields = function() { return this.fctxs_; };


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
      this.entity.EventType = this.entity["EventType"];
      this.entity.type = this.entity["type"];
      this.entity.states = this.entity["states"];
      this.entity.states = this.entity["stateid"];
      this.entity.heading = this.entity["heading"];
      this.entity.descriptionLabel = this.entity["descriptionLabel"];
      this.entity.hcp = this.entity["hcp"];
      this.entity.hcps = this.entity["hcps"];
    var html = this.cfg_.template(this.entity);
    var templateDiv = goog.dom.htmlToDocumentFragment(html);
    goog.dom.appendChild(div, templateDiv);
  }
  this.decorateFields_(div);
  this.updateRequiredClasses();

  if (!this.fireInterceptorEvents) return;
  var cmds = this.getCommandButtons();
  var inputs = {};
  goog.array.forEach(this.fctxs_,
      function(fctx) { inputs[fctx.id] = fctx.component; });
  this.cfg_.interceptor.init(this, this.entity, this.cache_, inputs, cmds);
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

  goog.array.forEach(this.fctxs_, function(fctx) {
    // Do not do child tables on new entities
    fctx.parentComponent = useTemplate ?
            pn.dom.getElement(fctx.id) : fieldset;

    if ((newEntity && !fctx.spec.showOnAdd) ||
            (!fctx.spec.showOnReadOnly && fctx.spec.readonly)) {
      if (useTemplate) {
        // Hide the parent only if using templates, otherwise it will try
        // to hide the parent fieldset which may include other fields.
        goog.style.setElementShown(fctx.parentComponent, false);
      }
      return;
    }
    var renderer = fctx.getFieldRenderer();
    if (!useTemplate &&
            (!(renderer instanceof pn.ui.edit.ComplexRenderer) ||
                renderer.showLabel !== false)) {
      fctx.parentComponent = fb.getFieldLabel(fctx);
      goog.dom.appendChild(fieldset, fctx.parentComponent);
    }
    var input = fb.createAndAttach(fctx);
    // TODO: This code should not be here, perhaps in FildCtx?
    // If this is a private '_' field, like an attachment control and we
    // are using a complex renderer, lets set the initial value on the
    // current entity so we can use this later for dirty comparison.
    if (goog.string.startsWith(fctx.id, '_') && input.getValue) {
      this.entity[fctx.id] = input.getValue();
    }
    fctx.component = input;

    if (!focusSet && input.focus && !fctx.spec.readonly) {
      focusSet = true;
      goog.Timer.callOnce(function() {
        try { input.focus(); } catch (ex) {}
      }, 1); }
  }, this);
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.updateRequiredClasses = function() {
  goog.array.forEach(this.fctxs_, function(fctx) {
    var parent = fctx.parentComponent;
    if (!parent) return; // Not shown, such as fields not shown on add

    if (fctx.isRequired()) {
      goog.dom.classlist.add(parent, 'required');
    } else {
      goog.dom.classlist.remove(parent, 'required');
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
  goog.array.forEach(this.getEditableFields_(), function(fctx) {
    if (!this.cfg_.interceptor.isShown(fctx.id)) return;
    errors = goog.array.concat(errors, fctx.validate());
  }, this);
  if (this.fireInterceptorEvents) {
    var errors2 = this.cfg_.interceptor.getCustomValidationErrors();
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
  goog.array.forEach(this.getEditableFields_(), function(fctx) {
    var val = fctx.getControlValue(current);
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
      function(fctx) { return fctx.isEditable(); });
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

  if (!this.fireInterceptorEvents) return;
  this.cfg_.interceptor.postInit();
};


/**
 * @private
 * @param {pn.ui.FieldCtx} fctx The field to attach events to.
 */
pn.ui.edit.Edit.prototype.enterDocumentOnChildrenField_ = function(fctx) {
  var fieldSpec = fctx.spec;
  if (!fieldSpec.tableType || fieldSpec.readonly) return;

  this.eh.listen(fctx.component, pn.ui.grid.Grid.EventType.ADD, function() {
    var e = new goog.events.Event(pn.ui.edit.Edit.EventType.ADD_CHILD, this);
    e.parent = this.entity;
    e.entityType = fieldSpec.tableType;
    e.parentField = fieldSpec.tableParentField;
    this.publishEvent_(e);
  });
  this.eh.listen(fctx.component, pn.ui.grid.Grid.EventType.ROW_SELECTED,
      function(ev) {
        var e = new goog.events.Event(
            pn.ui.edit.Edit.EventType.EDIT_CHILD, this);
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
  goog.array.forEach(this.fctxs_, goog.dispose);

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
