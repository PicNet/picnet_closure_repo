;
goog.provide('pn.ui.edit.AddOnFlyDialog');
goog.provide('pn.ui.edit.AddOnFlyDialog.EventType');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Dialog');
goog.require('pn.ui.edit.Edit');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {string} specId The ID of the specs to display in this add on the
 *    fly control.
 * @param {!Object.<!Array.<!Object>>} cache The current context cache.
 */
pn.ui.edit.AddOnFlyDialog = function(specId, cache) {
  goog.events.EventTarget.call(this);

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
};
goog.inherits(pn.ui.edit.AddOnFlyDialog, goog.events.EventTarget);


/** Shows the dialog */
pn.ui.edit.AddOnFlyDialog.prototype.show = function() {
  var dialog = new goog.ui.Dialog();
  this.registerDisposable(dialog);

  var spec = pn.app.ctx.specs.get(this.specId_);
  this.registerDisposable(spec);

  dialog.setTitle('Add ' + spec.name);
  dialog.setModal(true);
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());

  var el = dialog.getContentElement();
  var edit = new pn.ui.edit.Edit(spec, { 'ID': 0 }, this.cache_);
  this.registerDisposable(edit);
  edit.render(el);

  dialog.setVisible(true);

  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, function(e) {
    if (e.key === 'cancel') {
      // Ensure this dialog cannot be reused.
      goog.dispose(this);
      return;
    }
    if (this.validate_(edit)) { this.doAdd_(edit, spec.type); }
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
  pn.app.ctx.pub(pn.oms.OmsEvents.ENTITY_SAVE, type, entity, cb);
};


/**
 * @private
 * @param {string} type The entity type being added.
 * @param {(string|Object)} saved The server error or the entity that was added.
 */
pn.ui.edit.AddOnFlyDialog.prototype.entityAdded_ = function(type, saved) {
  if (goog.isString(saved)) { alert(saved); return; }
  this.cache_[type].splice(0, 0, saved);
  var eventType = pn.ui.edit.AddOnFlyDialog.EventType.AOF_ADDED;
  var event = new goog.events.Event(eventType, this);
  event.entityId = saved['ID'];
  this.dispatchEvent(event);
};


/** @enum {string} The events of the AddOnFlyDialog control */
pn.ui.edit.AddOnFlyDialog.EventType = {
  AOF_ADDED: 'aof-added'
};
