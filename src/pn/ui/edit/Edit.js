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
goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.CommandsComponent');
goog.require('pn.ui.edit.Config');
goog.require('pn.ui.edit.FieldBuilder');
goog.require('pn.ui.edit.FieldValidator');
goog.require('pn.ui.edit.Interceptor');
goog.require('pn.ui.grid.Column');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.Grid');



/**
 * @constructor
 * @extends {pn.ui.edit.CommandsComponent}
 * @param {!pn.ui.UiSpec} spec The specifications for this edit.
 * @param {!Object} data The data object to edit, null for new entity.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 */
pn.ui.edit.Edit = function(spec, data, cache) {
  goog.asserts.assert(spec);
  goog.asserts.assert(data);
  goog.asserts.assert(cache);

  pn.ui.edit.CommandsComponent.call(this, spec);

  /**
   * @private
   * @type {!Object}
   */
  this.data_ = data;


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
    return new pn.ui.FieldCtx(fieldSpec, data, cache);
  }, this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.edit.Edit');

  this.normaliseDateOnlyFields_(data);
};
goog.inherits(pn.ui.edit.Edit, pn.ui.edit.CommandsComponent);


/**
 * This is required so that fields with date only (no time) renderers don't
 *    throw 'dirty' checks when nothing has changed (just time is lost)
 * @private
 * @param {!Object} data The entity to normalize.
 */
pn.ui.edit.Edit.prototype.normaliseDateOnlyFields_ = function(data) {
  // TODO: This code should not be here it should at best be part of the
  // FieldRenderers.dateRenderer code, but definatelly not here.
  goog.array.forEach(this.getEditableFields_(),
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) {
        if (fctx.spec.renderer !== pn.ui.edit.FieldRenderers.dateRenderer) {
          return;
        }
        var date = data[fctx.id];
        if (!date) return;
        var dt = new goog.date.Date();
        dt.setTime(/** @type {number} */ (date));
        var trimmed = new goog.date.Date(
            dt.getYear(), dt.getMonth(), dt.getDate());
        data[fctx.id] = trimmed.getTime();
      }, this);
};


/**
 * @return {boolean} Wether the current edit screen is dirty.
 */
pn.ui.edit.Edit.prototype.isDirty = function() {
  if (!this.data_) return false;

  return goog.array.findIndex(this.getEditableFields_(),
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) {
        if (!this.cfg_.interceptor.isShown(fctx.id)) { return false; }
        var fb = pn.ui.edit.FieldBuilder;
        var orig = fb.transEntityToFieldValue(fctx);
        var curr = fctx.getControlValue();

        var isFalseEquivalent = function(val) {
          return !val || val === '0' || val === 'false' || val === '{}';
        };
        // Handle tricky falsies
        if (isFalseEquivalent(curr) && isFalseEquivalent(orig)) {
          return false;
        }

        // goog.string.canonicalizeNewlines required for IE7 which handles
        // newlines differently adding a keycode 13,10 rather than just 10
        curr = curr ? goog.string.canonicalizeNewlines(curr.toString()) : '';
        orig = orig ? goog.string.canonicalizeNewlines(orig.toString()) : '';

        if (curr !== orig) {
          this.log_.info(
              'Dirty ' + fctx.id + ' 1[' + orig + '] 2[' + curr + ']');
          return true;
        }
      }, this) >= 0;
};


/** Resets the dirty state of the current view */
pn.ui.edit.Edit.prototype.resetDirty = function() {
  this.data_ = this.getCurrentFormData();
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

  pn.ui.edit.Edit.superClass_.decorateInternal.call(this, div);
  if (this.cfg_.template) {
    var html = this.cfg_.template(this.data_);
    var templateDiv = goog.dom.htmlToDocumentFragment(html);
    goog.dom.appendChild(div, templateDiv);
  }
  this.decorateFields_(div);
  this.updateRequiredClasses();

  var cmds = this.getCommandButtons();
  var inputs = {};
  goog.array.forEach(this.fctxs_,
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) { inputs[fctx.id] = fctx.component; });
  this.cfg_.interceptor.init(this, this.data_, this.cache_, inputs, cmds);
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
      newEntity = pn.data.EntityUtils.isNew(this.data_);

  if (fieldset) { goog.dom.appendChild(parent, fieldset); }

  goog.array.forEach(this.fctxs_,
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) {
        // Do not do child tables on new entities
        fctx.parentComponent = useTemplate ?
            pn.dom.getElement(fctx.id) : fieldset;

        if (newEntity && !fctx.spec.showOnAdd) {
          goog.style.showElement(fctx.parentComponent, false);
          return;
        }
        if (!useTemplate &&
            (!fctx.spec.renderer || fctx.spec.renderer.showLabel !== false)) {
          fctx.parentComponent = fb.getFieldLabel(fctx);
          goog.dom.appendChild(fieldset, fctx.parentComponent);
        }
        var input = fb.createAndAttach(fctx);
        // If this is a private '_' field, like an attachment control and we
        // are using a complex renderer, lets set the initial value on the
        // current entity so we can use this later for dirty checking.
        if (goog.string.startsWith(fctx.id, '_') && input.getValue) {
          this.data_[fctx.id] = input.getValue();
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
  goog.array.forEach(this.fctxs_,
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) {
        var parent = fctx.parentComponent;
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
        if (!this.cfg_.interceptor.isShown(fctx.id)) return;

        var err = pn.ui.edit.FieldValidator.validateFieldValue(fctx);
        if (err.length) {
          errors = goog.array.concat(errors, err);
          var val = fctx.getControlValue();
          this.log_.info(
              'Field: ' + fctx.id + ' val: ' + val + ' error: ' + err);
        }
      }, this);
  var errors2 = this.cfg_.interceptor.getCustomValidationErrors();
  errors = goog.array.concat(errors, errors2);
  return errors;
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.getCurrentFormData = function() {
  var current = {};
  goog.object.extend(current, this.data_);
  goog.object.extend(current, this.getFormData());

  return current;
};


/**
 * @return {!Object.<*>} The values of each field in the current form.  This
 *    does not include the base data object (this.data_) information.
 */
pn.ui.edit.Edit.prototype.getFormData = function() {
  var current = {};
  goog.array.forEach(this.getEditableFields_(),
      /** @param {!pn.ui.FieldCtx} fctx The field context. */
      function(fctx) {
        var val = fctx.getControlValue();
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
  this.cfg_.interceptor.postInit();
};


/**
 * @private
 * @param {pn.ui.FieldCtx} fctx The field to attach events to.
 */
pn.ui.edit.Edit.prototype.enterDocumentOnChildrenField_ = function(fctx) {
  var spec = fctx.spec;
  if (!spec.tableType || spec.readonly) return;

  this.eh.listen(fctx.component, pn.ui.grid.Grid.EventType.ADD, function() {
    var e = new goog.events.Event(pn.ui.edit.Edit.EventType.ADD_CHILD, this);
    e.parent = this.data_;
    e.entityType = spec.tableType;
    e.parentField = spec.tableParentField;
    this.publishEvent_(e);
  });
  this.eh.listen(fctx.component, pn.ui.grid.Grid.EventType.ROW_SELECTED,
      function(ev) {
        var e = new goog.events.Event(
            pn.ui.edit.Edit.EventType.EDIT_CHILD, this);
        e.entityId = ev.selected['ID'];
        e.parent = this.data_;
        e.entityType = spec.tableType;
        e.parentField = spec.tableParentField;
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
