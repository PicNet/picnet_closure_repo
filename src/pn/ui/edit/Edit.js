;
goog.provide('pn.ui.edit.Edit');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.Field');



/**
 * The pn.ui.edit.Edit is built atop SlickEdit
 * (https://github.com/mleibman/SlickEdit/).  See SlickEdit documentation for
 * full detauils.
 *
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!Object} data The data object to edit.
 * @param {!Array.<pn.ui.edit.Command>} commands The commands to show in the
 *    edit page.
 * @param {!Array.<pn.ui.edit.Field>} fields The field specs to show in the
 *    edit page.
 * @param {!Object} cfg Global options for this control.
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 */
pn.ui.edit.Edit = function(data, commands, fields, cfg, cache) {
  goog.asserts.assert(data);
  goog.asserts.assert(commands);
  goog.asserts.assert(fields);
  goog.asserts.assert(cfg);

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
   * @type {!Object}
   */
  this.cfg_ = cfg;

  /**
   * @private
   * @type {!Object.<Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {!Array.<goog.ui.Button>}
   */
  this.buttons_ = [];

  /**
   * @private
   * @type {!Object.<!Element>}
   */
  this.inputs_ = {};

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
};
goog.inherits(pn.ui.edit.Edit, goog.ui.Component);


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
  goog.array.forEach(this.fields_, function(f, idx) {
    var input = this.createInput_(f);
    this.inputs_[f.id] = input;
    var fieldDom = goog.dom.createDom('div', {'class': f.className || 'field'},
        goog.dom.createDom('label', {'for': f.id}), input);
    goog.dom.append(parent, fieldDom);
    if (idx === 0) { goog.Timer.callOnce(function() { input.focus(); }, 0); }
  }, this);
};


/**
 * @private
 * @param {!pn.ui.edit.Field} field The field to create a dom tree for.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.Edit.prototype.createInput_ = function(field) {
  var val = this.data_[field.id];
  return field.renderer ?
      field.renderer(val) :
      field.source ? this.createParentEntitySelect_(field, val) :
      goog.dom.createDom('input',
      {'id': field.id, 'type': 'text', 'value': val});
};


/**
 * @private
 * @param {!pn.ui.edit.Field} field The field to create a dom tree for.
 * @param {number} id The admin entity ID.
 * @return {!Element} The created dom element.
 */
pn.ui.edit.Edit.prototype.createParentEntitySelect_ = function(field, id) {
  var list = this.cache_[field.source];
  var select = goog.dom.createDom('select', { 'id': field.id });
  goog.array.forEach(list, function(e) {
    var eid = e[field.source + 'ID'];
    var opts = {'value': eid};
    if (eid === id) { opts['selected'] = 'selected'; }
    goog.dom.append(select,
        goog.dom.createDom('option', opts, e[field.sourceField]));
  }, this);
  return select;
};


/**
 * @private
 * @return {Object} The current form data (Read from input controls).
 */
pn.ui.edit.Edit.prototype.getCurrentFormData_ = function() {
  var current = {};
  goog.object.extend(current, this.data_);
  goog.array.forEach(this.fields_, function(f) {
    current[f.id] = this.getFieldValue_(f);
  }, this);
  return current;
};


/**
 * @private
 * @param {pn.ui.edit.Field} field The Field to get the current value.
 * @return {Object} The value in the specified field.
 */
pn.ui.edit.Edit.prototype.getFieldValue_ = function(field) {
  return this.inputs_[field.id].value;
};


/** @inheritDoc */
pn.ui.edit.Edit.prototype.enterDocument = function() {
  pn.ui.edit.Edit.superClass_.enterDocument.call(this);

  goog.array.forEach(this.commands_, function(c, i) {
    var button = this.buttons_[i];
    this.eh_.listen(button, goog.ui.Component.EventType.ACTION, function() {
      var event = new goog.events.Event(c.eventType, this);
      event.data = this.getCurrentFormData_();
      this.dispatchEvent(event);
    });
  }, this);
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
  goog.array.forEach(this.buttons_, goog.dispose);
  delete this.eh_;
  delete this.fields_;
  delete this.cfg_;
};


/**
 * @enum {string}
 */
pn.ui.edit.Edit.EventType = {
  SAVE: 'save',
  CANCEL: 'cancel',
  DELETE: 'delete',
  CLONE: 'clone'
};
