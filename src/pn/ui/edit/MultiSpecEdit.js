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
goog.require('pn.ui.edit.Edit');
goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.CommandsComponent');
goog.require('pn.ui.edit.Config');
goog.require('pn.ui.edit.Field');
goog.require('pn.ui.edit.ReadOnlyFields');
goog.require('pn.ui.grid.Column');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.Grid');
goog.require('pn.ui.grid.Grid.EventType');



/**
 * @constructor
 * @extends {pn.ui.edit.CommandsComponent}
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
   * @type {!Object}
   */
  this.entity = entity;

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

  pn.ui.edit.CommandsComponent.call(this, this.specs[mainSpecId]);
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
  this.edits.push({div: parent, edit: ui});
  ui.decorate(parent);
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.isValidForm = function() {
  return !this.getFormErrors().length;
};


/** @inheritDoc */
pn.ui.edit.MultiSpecEdit.prototype.getFormErrors = function() {
  var errors = [];
  goog.array.forEach(this.edits, function(c) {
    if (c.edit.getFormErrors) {
      errors = goog.array.concat(errors, c.edit.getFormErrors());
    }
  });
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


/**
 * @return {boolean} Wether the current edit screen is dirty.
 */
pn.ui.edit.MultiSpecEdit.prototype.isDirty = function() {
  return goog.array.findIndex(this.edits, function(c) {
    return c.edit && c.edit.isDirty && c.edit.isDirty();
  }, this) >= 0;
};


/** Resets the dirty state of the current view */
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
    if (edit.edit.getInputs) {
      pn.object.uniqueExtend(fields, edit.edit.getInputs());
    }
    if (edit.edit.getCommandButtons) {
      pn.object.uniqueExtend(commands, edit.edit.getCommandButtons());
    }
  }, this);

  goog.object.forEach(this.specs, function(spec) {
    spec.editConfig.interceptor.init(this.entity, this.cache, fields, commands);
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
