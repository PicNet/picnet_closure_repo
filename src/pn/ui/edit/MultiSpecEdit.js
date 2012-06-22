;
goog.provide('pn.ui.edit.MultiSpecEdit');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.TabBar');
goog.require('pn.dom');
goog.require('pn.object');
goog.require('pn.ui.IDirtyAware');
goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.CommandsComponent');
goog.require('pn.ui.edit.Config');
goog.require('pn.ui.edit.Edit');
goog.require('pn.ui.edit.FieldSpec');
goog.require('pn.ui.edit.ReadOnlyFields');
goog.require('pn.ui.grid.ColumnSpec');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.Grid');
goog.require('pn.ui.grid.Grid.EventType');



/**
 * @constructor
 * @extends {pn.ui.edit.CommandsComponent}
 * @implements {pn.ui.IDirtyAware}
 *
 * @param {!Object} entity The entity to edit, null for new entity.
 * @param {!Object.<Array>} cache The entities cache to use for
 *    related entities.
 * @param {!Object.<!pn.ui.UiSpec>} specs The edit specifications.
 * @param {string} mainSpecId The main specs id.  This is the specs that
 *    defines things like commands for the entire UI, etc.
 */
pn.ui.edit.MultiSpecEdit = function(entity, cache, specs, mainSpecId) {
  goog.asserts.assert(cache);
  goog.asserts.assert(entity);
  goog.asserts.assert(specs);
  goog.asserts.assert(mainSpecId);


  /**
   * @protected
   * @type {!Object.<Array>}
   */
  this.cache = cache;

  /**
   * @protected
   * @type {!Object.<!pn.ui.UiSpec>}
   */
  this.specs = specs;

  /**
   * @protected
   * @type {!Array.<!{div:Element, edit:pn.ui.edit.CommandsComponent}>}
   */
  this.edits = [];

  pn.ui.edit.CommandsComponent.call(this, this.specs[mainSpecId], entity);
};
goog.inherits(pn.ui.edit.MultiSpecEdit, pn.ui.edit.CommandsComponent);


/**
 * @protected
 * @param {!Element} parent The parent DOM container to add the edit control to.
 * @param {string} specid The edit specification id for the control to
 *    render.
 */
pn.ui.edit.MultiSpecEdit.prototype.decorateEdit = function(parent, specid) {
  var ui = new pn.ui.edit.Edit(this.specs[specid], this.entity, this.cache);
  ui.fireInterceptorEvents = false;
  this.edits.push({div: parent, edit: ui});
  ui.decorate(parent);
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.isValidForm = function() {
  var errors = this.getFormErrors();
  if (errors.length) {
    pn.app.ctx.pub(pn.app.AppEvents.ENTITY_VALIDATION_ERROR, errors);
  }
  return !errors.length;
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.updateRequiredClasses = function() {
  goog.array.forEach(this.edits, function(c) {
    c.edit.updateRequiredClasses();
  });
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.getFormErrors = function() {
  var errors = [];
  goog.array.forEach(this.edits, function(c) {
    if (c.edit.getFormErrors) {
      errors = goog.array.concat(errors, c.edit.getFormErrors());
    }
  });
  goog.object.forEach(this.specs, function(spec) {
    var customErrors = spec.editConfig.interceptor.getCustomValidationErrors();
    errors = goog.array.concat(errors, customErrors);
  }, this);
  return errors;
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.getCurrentFormData = function() {
  var current = {};
  goog.object.extend(current, this.entity);
  goog.array.forEach(this.edits, function(c) {
    if (c.edit.getFormData) {
      goog.object.extend(current, c.edit.getFormData());
    }
  }, this);
  return current;
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.isDirty = function() {
  return goog.array.findIndex(this.edits, function(c) {
    return c.edit && c.edit.isDirty && c.edit.isDirty();
  }, this) >= 0;
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.resetDirty = function() {
  goog.array.forEach(this.edits, function(c) {
    if (c.edit.resetDirty) c.edit.resetDirty();
  });
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.enterDocument = function() {
  pn.ui.edit.MultiSpecEdit.superClass_.enterDocument.call(this);

  var fields = {};
  var commands = this.getCommandButtons();

  goog.array.forEach(this.edits, function(edit) {
    var ed = edit.edit;
    if (ed.getFields) {
      goog.array.forEach(ed.getFields(), function(fctx) {
        if (fctx.id in fields) return;
        fields[fctx.id] = [ed.getControl(), ed.getParentControl()];
      });
    }
    if (ed.getCommandButtons) {
      pn.object.uniqueExtend(commands, ed.getCommandButtons());
    }
  }, this);

  goog.object.forEach(this.specs, function(spec) {
    spec.editConfig.interceptor.init(
        this, this.entity, this.cache, fields, commands);
  }, this);

  goog.object.forEach(this.specs, function(spec) {
    spec.editConfig.interceptor.postInit();
  }, this);
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.disposeInternal = function() {
  pn.ui.edit.MultiSpecEdit.superClass_.disposeInternal.call(this);

  goog.array.forEach(this.edits, function(c) {
    goog.dispose(c.div);
    goog.dispose(c.edit);
  });
  goog.object.forEach(this.specs, goog.dispose);

  delete this.specs;
  delete this.entity;
  delete this.cache;
  delete this.edits;
};
