;
goog.provide('pn.ui.edit.Edit');

goog.require('goog.date.DateTime');
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.dom');
goog.require('pn.ui.IDirtyAware');
goog.require('pn.ui.UiSpec');
goog.require('pn.ui.edit.CommandsComponent');
goog.require('pn.ui.edit.Config');
goog.require('pn.ui.edit.FieldBuilder');
goog.require('pn.ui.edit.FieldCtx');
goog.require('pn.ui.edit.FieldValidator');
goog.require('pn.ui.edit.Interceptor');
goog.require('pn.ui.edit.cmd.Command');
goog.require('pn.ui.edit.state.FState');
goog.require('pn.ui.edit.state.Provider');
goog.require('pn.ui.edit.state.Updater');
goog.require('pn.ui.grid.ColumnSpec');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.Grid');
goog.require('pn.ui.soy');



/**
 * @constructor
 * @extends {pn.ui.edit.CommandsComponent}
 * @implements {pn.ui.IDirtyAware}
 *
 * @param {!pn.ui.UiSpec} spec The specifications for this edit.
 * @param {!pn.data.Entity} entity The entity object to edit.
 * @param {!pn.data.BaseDalCache} cache The data cache to use for related
 *    entities.
 * @param {pn.ui.KeyShortcutMgr=} opt_keys The optional keyboard shortcut
 *    manager.
 */
pn.ui.edit.Edit = function(spec, entity, cache, opt_keys) {
  pn.assInst(spec, pn.ui.UiSpec);
  pn.assInst(entity, pn.data.Entity);
  pn.assInst(cache, pn.data.BaseDalCache);
  pn.ass(!opt_keys || opt_keys instanceof pn.ui.KeyShortcutMgr);

  pn.ui.edit.CommandsComponent.call(this, spec, entity, cache, opt_keys);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.edit.Edit');

  /** @type {boolean} */
  this.fireInterceptorEvents = true;

  /**
   * @private
   * @type {pn.ui.edit.Interceptor}
   */
  this.interceptor_ = null;

  /**
   * @private
   * @type {!Object.<!(Element|Text|goog.ui.Component)>}
   */
  this.controls_ = {};

  /**
   * @private
   * @type {pn.ui.edit.state.FState}
   */
  this.state_ = null;
};
goog.inherits(pn.ui.edit.Edit, pn.ui.edit.CommandsComponent);


/** @override. */
pn.ui.edit.Edit.prototype.isDirty = function() {
  this.log_.fine('isDirty: ' + this.spec.id);
  var dirty = this.getEditableFields_().pnfindIndex(function(fctx) {
    return fctx.isDirty(this.entity, this.getControl(fctx.id));
  }, this) >= 0;
  this.log_.fine('isDirty: ' + this.spec.id + ' -> ' + dirty);
  return dirty;
};


/** @override. */
pn.ui.edit.Edit.prototype.resetDirty = function() {
  var data = this.getCurrentFormData();
  this.entity = pn.data.TypeRegister.create(this.spec.type, data);
};


/** @return {!Array.<!pn.ui.edit.FieldCtx>} All fields. */
pn.ui.edit.Edit.prototype.getFieldContexs = function() {
  return this.cfg.fCtxs;
};


/**
 * @param {string} id The id of the field whose control we want.
 * @return {!(Element|Text|goog.ui.Component)} The component for the specified
 *    field id.
 */
pn.ui.edit.Edit.prototype.getControl = function(id) {
  var control = this.controls_[id];
  if (!control) throw new Error('Cound not find the control for id: ' + id);
  return control;
};


/** @override */
pn.ui.edit.Edit.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.edit.Edit.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  var title = this.cfg.titleStrategy ?
      this.cfg.titleStrategy(this.spec, this.entity, this.cache) : '',
      template = this.cfg.template || pn.ui.soy.edit,
      opts = { id: this.spec.id, title: title },
      div = pn.dom.addHtml(element, template(opts));

  // Expecting a 'main-group-area' div to contain all edit contents.
  div = pn.dom.byClass('main-group-area', element);
  pn.ui.edit.Edit.superClass_.decorateInternal.call(this, div);

  this.decorateFields_(div);
};


/**
 * @private
 * @param {!Element} parent The parent element to attach the fields to.
 */
pn.ui.edit.Edit.prototype.decorateFields_ = function(parent) {
  var fb = pn.ui.edit.FieldBuilder;

  var fieldset = goog.dom.createDom('fieldset', 'fields'),
      newEntity = pn.data.EntityUtils.isNew(this.entity);

  if (fieldset) { goog.dom.appendChild(parent, fieldset); }

  this.cfg.fCtxs.pnforEach(function(fctx) {
    var templateParent = goog.dom.getElement(fctx.id);
    var parentComp = templateParent || fieldset;

    if ((newEntity && !fctx.spec.showOnAdd) ||
            (!fctx.spec.showOnReadOnly && fctx.spec.readonly)) { return; }

    if (!templateParent) {
      goog.dom.appendChild(fieldset, parentComp = fb.getFieldContainer(fctx));
    }

    var inp = fb.createAndAttach(fctx, parentComp, this.entity);
    if (!inp) throw 'Field [' + fctx.id + '] renderer did not return a control';
    // TODO: This code should not be here, perhaps in FildCtx?
    // If this is a private '_' field, like an attachment control and we
    // are using a complex renderer, lets set the initial value on the
    // current entity so we can use this later for dirty comparison.
    if (goog.string.startsWith(fctx.id, '_') && inp.getValue) {
      this.entity.setValueOrExt(fctx.id, inp.getValue());
    }
    this.controls_[fctx.id] = inp;
  }, this);
};


/** @override */
pn.ui.edit.Edit.prototype.isValidForm = function(c) {
  var errors = this.getFormErrors(c);
  if (errors.length) {
    var et = pn.app.AppEvents.ENTITY_VALIDATION_ERROR;
    var event = new goog.events.Event(et, this);
    event.errors = errors;
    this.publishEvent_(event);
  }

  return !errors.length;
};


/** @override */
pn.ui.edit.Edit.prototype.getFormErrors = function(c) {
  var errors = [];
  if (this.fireInterceptorEvents && this.interceptor_) {
    var errors2 = this.interceptor_.getCustomValidationErrors(c);
    errors = errors.pnconcat(errors2);
  }
  this.getEditableFields_().pnforEach(function(fctx) {
    var ctl = this.getControl(fctx.id),
        forceRequired = this.state_.isRequired(fctx.id);
    if (!fctx.isShown(ctl)) return;
    errors = errors.pnconcat(fctx.validate(ctl, forceRequired));
  }, this);
  return errors;
};


/** @override */
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
  this.getEditableFields_().pnforEach(function(fctx) {
    var ctl = this.getControl(fctx.id);
    var val = fctx.getControlValue(ctl, current);
    if (val !== undefined) current[fctx.spec.dataProperty] = val;
  }, this);
  return current;
};


/**
 * @private
 * @return {!Array.<!pn.ui.edit.FieldCtx>} All editable fields.
 */
pn.ui.edit.Edit.prototype.getEditableFields_ = function() {
  return this.cfg.fCtxs.pnfilter(
      function(fctx) { return fctx.isEditable(this.entity); }, this);
};


/** @override */
pn.ui.edit.Edit.prototype.fireCommandEvent = function(command, data) {
  if (command.click) { command.click(data); }
  else {
    var event = new goog.events.Event(command.eventType, this);
    event.data = data;
    this.publishEvent_(event);
  }
};


/** @override */
pn.ui.edit.Edit.prototype.enterDocument = function() {
  pn.ui.edit.Edit.superClass_.enterDocument.call(this);

  var fctxs = {};
  this.cfg.fCtxs.pnforEach(function(fctx) { fctxs[fctx.id] = fctx; });

  var ids = goog.object.getKeys(this.controls_),
      provider = new pn.ui.edit.state.Provider(this.controls_, fctxs);
  this.state_ = new pn.ui.edit.state.FState(ids, provider);
  this.registerDisposable(this.state_);

  var updater = new pn.ui.edit.state.Updater(this.state_, this.controls_);
  this.registerDisposable(updater);

  var newEntity = pn.data.EntityUtils.isNew(this.entity);
  this.cfg.fCtxs.pnforEach(function(fctx) {
    if (newEntity && !fctx.spec.showOnAdd) return;

    if (fctx.isDefaultRequired()) this.state_.setRequired(fctx.id, true);
    if (fctx.spec.readonly) this.state_.setReadOnly(fctx.id, true);
  }, this);


  this.cfg.fCtxs.pnforEach(this.enterDocumentOnChildrenField_, this);

  this.autoFocus_();

  if (!this.fireInterceptorEvents || !this.cfg.interceptor) return;

  var e = this.entity,
      c = this.cache,
      btns = this.getCommandButtons();
  this.interceptor_ = new this.cfg.interceptor(e, c, this.state_, btns);
  this.registerDisposable(this.interceptor_);
};


/** @private */
pn.ui.edit.Edit.prototype.autoFocus_ = function() {
  if (!this.cfg.autoFocus) return;
  var newEntity = pn.data.EntityUtils.isNew(this.entity),
      toFocus = this.cfg.fCtxs.pnfind(function(fctx) {
        if (newEntity && !fctx.spec.showOnAdd) return false;
        var input = this.controls_[fctx.id],
            required = this.state_.isRequired(fctx.id);
        return input && input.focus && !fctx.spec.readonly && required;
      }, this);

  if (!toFocus) toFocus = this.cfg.fCtxs.pnfind(function(fctx) {
    var input = this.controls_[fctx.id];
    return input && input.focus && !fctx.spec.readonly;
  }, this);

  if (!toFocus) { return; }
  goog.Timer.callOnce(function() {
    try {
      var c = this.controls_[toFocus.id];
      c.selectionStart = c.selectionEnd = 0;
    } catch (ex) {}
  }, 1, this);
};


/**
 * @private
 * @param {pn.ui.edit.FieldCtx} fctx The field to attach events to.
 */
pn.ui.edit.Edit.prototype.enterDocumentOnChildrenField_ = function(fctx) {
  var fieldSpec = fctx.spec;
  if (!fieldSpec.tableType || fieldSpec.readonly) return;

  var grid = this.getControl(fctx.id);
  var ae = pn.web.WebAppEvents;
  this.getHandler().listen(grid, ae.ENTITY_ADD, function() {
    var e = new goog.events.Event(ae.CHILD_ENTITY_ADD, this);
    e.parent = this.entity;
    e.entityType = fieldSpec.tableType;
    e.parentField = fieldSpec.tableParentField;
    this.publishEvent_(e);
  });
  this.getHandler().listen(grid, ae.ENTITY_SELECT, function(ev) {
    var e = new goog.events.Event(ae.ENTITY_SELECT, this);
    e.entityId = ev.selected.id;
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
  if (!this.cfg.publishEventBusEvents) {
    this.dispatchEvent(e);
    return;
  }

  var ae = pn.web.WebAppEvents,
      ae2 = pn.app.AppEvents,
      args = null;
  switch (e.type) {
    case ae.CHILD_ENTITY_ADD:
      args = [e.type, e.parent, e.entityType, e.parentField];
      break;
    case ae.ENTITY_SELECT:
      args = [e.type, e.entityType, e.entityId];
      break;
    case ae2.ENTITY_VALIDATION_ERROR:
      args = [e.type, e.errors];
      break;
    default:
      args = [e.type, this.spec.type, e.data];
  }
  pn.app.ctx.pub.apply(null, args);
};
