;
goog.provide('pn.ui.edit.Edit');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.ui.edit.Command');
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
 * @extends {goog.ui.Component}
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

  goog.ui.Component.call(this);

  /**
   * @private
   * @type {!Object}
   */
  this.data_ = data;

  /**
   * @private
   * @type {!Array.<pn.ui.edit.Command>}
   */
  this.commands_ = commands;

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
   * @type {!Array.<goog.ui.Button>}
   */
  this.buttons_ = [];

  /**
   * @private
   * @type {!Object.<!Element|!goog.ui.Component>}
   */
  this.inputs_ = {};

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.LogUtils.getLogger('pn.ui.edit.Edit');
};
goog.inherits(pn.ui.edit.Edit, goog.ui.Component);


/**
 * @return {boolean} Wether the current edit screen is dirty.
 */
pn.ui.edit.Edit.prototype.isDirty = function() {
  if (!this.data_) return false;

  var current = this.getCurrentFormData_();
  for (var field in current) {
    var curr = current[field];
    var orig = this.data_[field];
    if (!curr && !orig) continue;
    curr = curr + '';
    orig = orig + '';
    if (curr !== orig) {
      this.log_.info('Found dirty field: ' + field + ' original: ' +
          orig + ' current: ' + curr);
      return true;
    }
  }
  return false;
};


/**
 * Resets the dirty state of the current view
 */
pn.ui.edit.Edit.prototype.resetDirty = function() {
  delete this.data_;
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

  this.decorateCommands_(div);
  this.decorateFields_(div);

  goog.style.showElement(div, true);
};


/**
 * @private
 * @param {!Element} parent The parent element to attach the controls to.
 */
pn.ui.edit.Edit.prototype.decorateCommands_ = function(parent) {
  goog.array.forEach(this.commands_, function(c) {
    var button = new goog.ui.Button(c.name);
    button.render(parent);
    this.buttons_.push(button);
  }, this);
};


/**
 * @private
 * @param {!Element} parent The parent element to attach the fields to.
 */
pn.ui.edit.Edit.prototype.decorateFields_ = function(parent) {
  var fieldset = goog.dom.createDom('fieldset', {'class': 'fields'});
  goog.dom.appendChild(parent, fieldset);
  goog.array.forEach(this.fields_, function(f, idx) {
    // Do not do child tables on new entities
    if (f.table && !this.data_['ID']) { return; }
    
    var dom = goog.dom.createDom('div', { 'class': f.className || 'field' },
        goog.dom.createDom('label', { 'for': f.id }, f.name));
    goog.dom.appendChild(fieldset, dom);

    var input = pn.ui.edit.FieldBuilder.createAndAttachInput(
        f, dom, this.data_, this.cache_);
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
  if (field.onchange) {
    this.eh_.listen(input, goog.events.EventType.CHANGE, function(e) {
      field.onchange(pn.ui.edit.FieldBuilder.getFieldValue(input), input, e);
    });
    field.onchange(pn.ui.edit.FieldBuilder.getFieldValue(input), input, null);
  }
};


/**
 * @private
 * @return {boolean} If this form is valid.
 */
pn.ui.edit.Edit.prototype.isValidForm_ = function() {
  var errors = [];
  goog.array.forEach(this.fields_, function(f) {
    var error = pn.ui.edit.FieldValidator.validateFieldValue(
        f, pn.ui.edit.FieldBuilder.getFieldValue(this.inputs_[f.id]));
    if (error) errors.push(error);
  }, this);

  if (errors.length) {
    var et = pn.ui.edit.Edit.EventType.VALIDATION_ERROR;
    var event = new goog.events.Event(et, this);
    event.errors = errors;
    this.dispatchEvent(event);
  }

  return !errors.length;
};


/**
 * @private
 * @return {Object} The current form data (Read from input controls).
 */
pn.ui.edit.Edit.prototype.getCurrentFormData_ = function() {
  var current = {};
  goog.object.extend(current, this.data_);
  goog.array.forEach(this.fields_, function(f) {
    var val = pn.ui.edit.FieldBuilder.getFieldValue(this.inputs_[f.id]);
    if (val === undefined) delete current[f.id];
    else current[f.id] = val;
  }, this);
  return current;
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.enterDocument = function() {
  pn.ui.edit.Edit.superClass_.enterDocument.call(this);

  goog.array.forEach(this.commands_, this.enterDocumentOnCommand_, this);
  if (this.data_['ID']) {
    goog.array.forEach(this.fields_, this.enterDocumentOnChildrenField_, this);
  }
};


/**
 * @private
 * @param {pn.ui.edit.Command} command The command to attach events to.
 * @param {number} idx The index of the specified command.
 */
pn.ui.edit.Edit.prototype.enterDocumentOnCommand_ = function(command, idx) {
  var button = this.buttons_[idx];
  this.eh_.listen(button, goog.ui.Component.EventType.ACTION, function() {
    if (command.validate && !this.isValidForm_()) { return; }
    var event = new goog.events.Event(command.eventType, this);
    event.data = this.getCurrentFormData_();
    this.dispatchEvent(event);
  });
};


/**
 * @private
 * @param {pn.ui.edit.Field} field The field to attach events to.
 */
pn.ui.edit.Edit.prototype.enterDocumentOnChildrenField_ = function(field) {
  if (!field.table) return;
  var relationship = field.table.split('.');
  var grid = this.inputs_[field.id];
  this.eh_.listen(grid, pn.ui.grid.Grid.EventType.ADD, function() {
    var e = new goog.events.Event(pn.ui.edit.Edit.EventType.ADD_CHILD, this);
    e.parent = this.data_;
    e.entityType = relationship[0];
    e.parentField = relationship[1];
    this.dispatchEvent(e);
  });
  this.eh_.listen(grid, pn.ui.grid.Grid.EventType.ROW_SELECTED, function(ev) {
    var e = new goog.events.Event(pn.ui.edit.Edit.EventType.EDIT_CHILD, this);
    e.entity = ev.selected;
    e.parent = this.data_;
    e.entityType = relationship[0];
    e.parentField = relationship[1];
    this.dispatchEvent(e);
  });
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.exitDocument = function() {
  pn.ui.edit.Edit.superClass_.exitDocument.call(this);

  this.eh_.removeAll();
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.disposeInternal = function() {
  pn.ui.edit.Edit.superClass_.disposeInternal.call(this);

  goog.dispose(this.eh_);
  goog.dispose(this.log_);
  goog.array.forEach(this.buttons_, goog.dispose);
  goog.object.forEach(this.inputs_, goog.dispose);

  delete this.inputs_;
  delete this.eh_;
  delete this.fields_;
  delete this.cfg_;
  delete this.log_;
};


/**
 * @enum {string}
 */
pn.ui.edit.Edit.EventType = {
  SAVE: 'save',
  CANCEL: 'cancel',
  DELETE: 'delete',
  CLONE: 'clone',
  ADD_CHILD: 'add-child',
  EDIT_CHILD: 'edit-child',
  VALIDATION_ERROR: 'validation-error'
};
