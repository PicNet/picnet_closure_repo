;
goog.provide('pn.ui.edit.Edit');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.CommandsComponent');
goog.require('pn.ui.edit.ComplexRenderer');
goog.require('pn.ui.edit.Config');
goog.require('pn.ui.edit.Field');
goog.require('pn.ui.edit.FieldBuilder');
goog.require('pn.ui.edit.FieldValidator');
goog.require('pn.ui.grid.Column');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.Grid');



/**
 * @constructor
 * @extends {pn.ui.edit.CommandsComponent}
 * @param {!Object} data The data object to edit, null for new entity.
 * @param {!Array.<pn.ui.edit.Command>} commands The commands to show in the
 *    edit page.
 * @param {!Array.<pn.ui.edit.Field>} fields The field specs to show in the
 *    edit page.
 * @param {!pn.ui.edit.Config} cfg Global options for this control.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 */
pn.ui.edit.Edit = function(data, commands, fields, cfg, cache) {

  goog.asserts.assert(data);
  goog.asserts.assert(commands);
  goog.asserts.assert(fields);
  goog.asserts.assert(cfg);
  goog.asserts.assert(cache);

  pn.ui.edit.CommandsComponent.call(this, commands);

  /**
   * @private
   * @type {!Object}
   */
  this.data_ = data;

  /**
   * @private
   * @type {!Array.<pn.ui.edit.Field>}
   */
  this.fields_ = fields;

  /**
   * @private
   * @type {!pn.ui.edit.Config}
   */
  this.cfg_ = cfg;

  /**
   * @private
   * @type {!Object.<!Array>}
   */
  this.cache_ = cache;


  /**
   * @private
   * @type {!Object.<!Element|!goog.ui.Component>}
   */
  this.inputs_ = {};

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.LogUtils.getLogger('pn.ui.edit.Edit');
};
goog.inherits(pn.ui.edit.Edit, pn.ui.edit.CommandsComponent);


/**
 * @return {boolean} Wether the current edit screen is dirty.
 */
pn.ui.edit.Edit.prototype.isDirty = function() {
  if (!this.data_) return false;

  var current = this.getCurrentFormData();
  for (var field in current) {
    var curr = current[field];
    var orig = this.data_[field];
    if ((curr === '0' || !curr) && !orig) continue;
    // goog.string.canonicalizeNewlines required for IE7 which handles newlines
    // differenctly adding a keycode 13,10 rather than just 10
    curr = curr ? goog.string.canonicalizeNewlines(curr.toString()) : '';
    orig = orig ? orig.toString() : '';

    if (curr !== orig) {
      this.log_.info('Found dirty field: [' + field + '] ' +
          'original\n[' + orig + '] current\n[' + curr + ']');
      return true;
    }
  }
  return false;
};


/**
 * Resets the dirty state of the current view
 */
pn.ui.edit.Edit.prototype.resetDirty = function() {
  this.data_ = this.getCurrentFormData();
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  var opts = {'class': 'details-container', 'style': 'display:none'};
  var div = goog.dom.createDom('div', opts);
  goog.dom.appendChild(element, div);

  pn.ui.edit.Edit.superClass_.decorateInternal.call(this, div);
  this.decorateFields_(div);

  goog.style.showElement(div, true);
};


/**
 * @private
 * @param {!Element} parent The parent element to attach the fields to.
 */
pn.ui.edit.Edit.prototype.decorateFields_ = function(parent) {
  var fb = pn.ui.edit.FieldBuilder;
  var fr = pn.ui.edit.FieldRenderers;

  var fieldset = goog.dom.createDom('fieldset', {'class': 'fields'});
  goog.dom.appendChild(parent, fieldset);

  goog.array.forEach(this.fields_, function(f, idx) {
    // Do not do child tables on new entities
    var newEntity = !this.data_['ID'];
    var isChildTable = f.table || f.readOnlyTable;
    if (newEntity && (isChildTable || !f.showOnAdd)) { return; }

    var fieldParent = fieldset;
    if (!f.renderer || f.renderer.showLabel !== false) {
      fieldParent = fb.getFieldLabel(f.id, f.name, f.className);
      if (fr.hiddenTextField === f.renderer) {
        goog.style.showElement(fieldParent, false);
      }
      goog.dom.appendChild(fieldset, fieldParent);
    }

    var input = fb.createAndAttach(f, fieldParent, this.data_, this.cache_);
    if (f.oncreate) {
      f.oncreate(input, this.data_);
    }
    // If displaying data from a parent (and not a parent selector) then
    // disable the field as its obviousle there as a reference.  See:
    // FormulaMaterial for an example.
    if (!goog.string.endsWith(f.id, 'ID') &&
        f.source && f.source.indexOf('.') > 0) {
      input['disabled'] = 'disabled';
    }

    this.inputs_[f.id] = input;
    this.attachOnChangeListenerIfRequired_(f, input);

    if (idx === 0) { goog.Timer.callOnce(function() {
      if (input.focus) input.focus();
    }, 0); }
  }, this);
};


/**
 * @private
 * @param {!pn.ui.edit.Field} field The field to create a dom tree for.
 * @param {!Element} input The element to attach the change listener to.
 */
pn.ui.edit.Edit.prototype.attachOnChangeListenerIfRequired_ =
    function(field, input) {
  var gfb = pn.ui.edit.FieldBuilder.getFieldValue;
  if (field.onchange) {
    this.eh.listen(input, goog.events.EventType.CHANGE, function() {
      field.onchange(gfb(input), input, this.data_);
    });
    field.onchange(gfb(input), input, this.data_);
  }
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.isValidForm = function() {
  var errors = this.getFormErrors();
  if (errors.length) {
    var et = pn.ui.edit.Edit.EventType.VALIDATION_ERROR;
    var event = new goog.events.Event(et, this);
    event.errors = errors;
    this.dispatchEvent(event);
  }

  return !errors.length;
};


/** @return {!Array.<string>} Any errors in the form. */
pn.ui.edit.Edit.prototype.getFormErrors = function() {
  var errors = [];
  goog.array.forEach(this.getEditableFields_(), function(f) {
    var error = pn.ui.edit.FieldValidator.validateFieldValue(
        f, pn.ui.edit.FieldBuilder.getFieldValue(this.inputs_[f.id]));
    if (error) errors.push(error);
  }, this);
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
  goog.array.forEach(this.getEditableFields_(), function(f) {
    var val = pn.ui.edit.FieldBuilder.getFieldValue(this.inputs_[f.id]);
    if (val !== undefined) current[f.dataColumn] = val;
  }, this);
  return current;
};


/**
 * @private
 * @return {!Array.<pn.ui.edit.Field>} All editable fields.
 */
pn.ui.edit.Edit.prototype.getEditableFields_ = function() {
  var newEntity = !this.data_['ID'];
  return goog.array.filter(this.fields_, function(f) {
    return f.id.indexOf('.') < 0 &&
        !f.table && !f.readOnlyTable &&
        (f.showOnAdd || !newEntity) &&
        f.renderer !== pn.ui.edit.FieldRenderers.readOnlyTextField;
  });
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.shouldFireCommandEvent = function(command) {
  if (command.onclick && !command.onclick(this.getCurrentFormData()))
    return false;
  if (command.validate && !this.isValidForm()) return false;
  return true;
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.fireCommandEvent = function(eventType, data) {
  var event = new goog.events.Event(eventType, this);
  event.data = data;
  this.dispatchEvent(event);
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.enterDocument = function() {
  pn.ui.edit.Edit.superClass_.enterDocument.call(this);

  if (this.data_['ID']) {
    goog.array.forEach(this.fields_, this.enterDocumentOnChildrenField_, this);
  }
};


/**
 * @private
 * @param {pn.ui.edit.Field} field The field to attach events to.
 */
pn.ui.edit.Edit.prototype.enterDocumentOnChildrenField_ = function(field) {
  var table = field.table || field.readOnlyTable;
  if (!table) return;
  var readonly = !field.table;

  var relationship = table.split('.');
  var grid = this.inputs_[field.id];
  if (readonly) return;

  this.eh.listen(grid, pn.ui.grid.Grid.EventType.ADD, function() {
    var e = new goog.events.Event(pn.ui.edit.Edit.EventType.ADD_CHILD, this);
    e.parent = this.data_;
    e.entityType = relationship[0];
    e.parentField = relationship[1];
    this.dispatchEvent(e);
  });
  this.eh.listen(grid, pn.ui.grid.Grid.EventType.ROW_SELECTED, function(ev) {
    var e = new goog.events.Event(pn.ui.edit.Edit.EventType.EDIT_CHILD, this);
    e.entity = ev.selected;
    e.parent = this.data_;
    e.entityType = relationship[0];
    e.parentField = relationship[1];
    this.dispatchEvent(e);
  });
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.disposeInternal = function() {
  pn.ui.edit.Edit.superClass_.disposeInternal.call(this);

  goog.dispose(this.log_);
  goog.object.forEach(this.inputs_, goog.dispose);

  delete this.inputs_;
  delete this.fields_;
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
