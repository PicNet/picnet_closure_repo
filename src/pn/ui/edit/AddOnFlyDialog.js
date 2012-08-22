;
goog.provide('pn.ui.edit.AddOnFlyDialog');
goog.provide('pn.ui.edit.AddOnFlyDialog.EventType');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Dialog');
goog.require('pn.ui.Dialog');
goog.require('pn.ui.edit.Edit');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {string} specId The ID of the specs to display in this add on the
 *    fly control.
 * @param {!Object.<!Array.<!Object>>} cache The current context cache.
 * @param {!Object} entity The entity being created.  Can have some prefilled
 *    values.
 */
pn.ui.edit.AddOnFlyDialog = function(specId, cache, entity) {
  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {!Object}
   */
  this.entity_ = entity;

  /**
   * @private
   * @type {string}
   */
  this.specId_ = specId;

  /**
   * @private
   * @type {!Object.<!Array.<!Object>>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {pn.ui.Dialog}
   */
  this.dialog_ = null;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eh_);
};
goog.inherits(pn.ui.edit.AddOnFlyDialog, goog.events.EventTarget);


/** Shows the dialog */
pn.ui.edit.AddOnFlyDialog.prototype.show = function() {
  this.dialog_ = new pn.ui.Dialog();
  this.registerDisposable(this.dialog_);

  var spec = pn.app.ctx.specs.get(this.specId_);
  this.registerDisposable(spec);

  this.dialog_.setTitle('Add ' + spec.name);
  this.dialog_.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());

  var el = this.dialog_.getContentElement();
  var edit = new pn.ui.edit.Edit(spec, this.entity_, this.cache_);
  this.registerDisposable(edit);
  edit.render(el);

  this.dialog_.setVisible(true);

  this.eh_.listen(this.dialog_, goog.ui.Dialog.EventType.SELECT, function(e) {
    if (e.key === 'cancel') {
      // Ensure this dialog cannot be reused.
      goog.dispose(this);
      return;
    }
    if (this.validate_(edit)) { this.doAdd_(edit, spec.type); }
    return false;
  }, false, this);
};


/**
 * @private
 * @param {!pn.ui.edit.Edit} edit The Edit compoenent to validate.
 * @return {boolean} Wether the current form is valid.
 */
pn.ui.edit.AddOnFlyDialog.prototype.validate_ = function(edit) {
  var errors = edit.getFormErrors();
  if (!errors.length) return true;
  pn.app.ctx.pub(pn.app.AppEvents.ENTITY_VALIDATION_ERROR, errors);
  return false;
};


/**
 * @private
 * @param {!pn.ui.edit.Edit} edit The Edit compoenent that needs to be
 *    queried for entity to add.
 * @param {string} type The entity type being added.
 */
pn.ui.edit.AddOnFlyDialog.prototype.doAdd_ = function(edit, type) {
  goog.asserts.assert(edit);
  goog.asserts.assert(type);

  var entity = edit.getCurrentFormData();
  var cb = goog.bind(this.entityAdded_, this, type);
  pn.app.ctx.pub(pn.app.AppEvents.ENTITY_SAVE, type, entity, cb);
};


/**
 * @private
 * @param {string} type The entity type being added.
 * @param {(string|Object)} saved The server error or the entity that was added.
 */
pn.ui.edit.AddOnFlyDialog.prototype.entityAdded_ = function(type, saved) {
  if (goog.isString(saved)) {
    pn.app.ctx.pub(pn.app.AppEvents.SHOW_ERROR, saved);
    return;
  }

  this.dialog_.setVisible(false);

  this.cache_[type].splice(0, 0, saved);
  var eventType = pn.ui.edit.AddOnFlyDialog.EventType.AOF_ADDED;
  var event = new goog.events.Event(eventType, this);
  event.entityId = saved.id;
  this.dispatchEvent(event);
};


/** @enum {string} The events of the AddOnFlyDialog control */
pn.ui.edit.AddOnFlyDialog.EventType = {
  AOF_ADDED: 'aof-added'
};
