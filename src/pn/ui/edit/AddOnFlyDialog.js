;
goog.provide('pn.ui.edit.AddOnFlyDialog');
goog.provide('pn.ui.edit.AddOnFlyDialog.EventType');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.Dialog');
goog.require('pn.app.EventHandlerTarget');
goog.require('pn.ui.Dialog');
goog.require('pn.ui.edit.Edit');



/**
 * @constructor
 * @extends {pn.app.EventHandlerTarget}
 * @param {!pn.ui.UiSpec} spec The spec to display in this add on the fly
 *    control.
 * @param {!pn.data.BaseDalCache} cache The current context cache.
 * @param {!pn.data.Entity} entity The entity being created.  Can have some
 *    prefilled values.
 */
pn.ui.edit.AddOnFlyDialog = function(spec, cache, entity) {
  pn.assInst(spec, pn.ui.UiSpec);
  pn.assInst(cache, pn.data.BaseDalCache);
  pn.assInst(entity, pn.data.Entity);

  pn.app.EventHandlerTarget.call(this);

  /**
   * @private
   * @type {!pn.ui.UiSpec}
   */
  this.spec_ = spec;

  /**
   * @private
   * @type {!pn.data.BaseDalCache}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {!pn.data.Entity}
   */
  this.entity_ = entity;

  /**
   * @private
   * @type {pn.ui.Dialog}
   */
  this.dialog_ = null;
};
goog.inherits(pn.ui.edit.AddOnFlyDialog, pn.app.EventHandlerTarget);


/** Shows the dialog */
pn.ui.edit.AddOnFlyDialog.prototype.show = function() {
  this.dialog_ = new pn.ui.Dialog();
  this.registerDisposable(this.dialog_);

  this.dialog_.setTitle('Add ' + this.spec_.name);
  this.dialog_.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());

  var el = this.dialog_.getContentElement();
  var edit = new pn.ui.edit.Edit(this.spec_, this.entity_, this.cache_);
  this.registerDisposable(edit);
  edit.render(el);

  this.dialog_.setVisible(true);

  this.listenTo(this.dialog_, goog.ui.Dialog.EventType.SELECT, function(e) {
    if (e.key === 'cancel') {
      // Ensure this dialog cannot be reused.
      goog.dispose(this);
      return;
    }
    if (this.validate_(edit)) { this.doAdd_(edit, this.spec_.type); }
    return false;
  });
};


/**
 * @private
 * @param {!pn.ui.edit.Edit} edit The Edit compoenent to validate.
 * @return {boolean} Wether the current form is valid.
 */
pn.ui.edit.AddOnFlyDialog.prototype.validate_ = function(edit) {
  var errors = edit.getFormErrors(null);
  if (!errors.length) return true;
  pn.web.ctx.pub(pn.web.WebAppEvents.ENTITY_VALIDATION_ERROR, errors);
  return false;
};


/**
 * @private
 * @param {!pn.ui.edit.Edit} edit The Edit compoenent that needs to be
 *    queried for entity to add.
 * @param {string} type The entity type being added.
 */
pn.ui.edit.AddOnFlyDialog.prototype.doAdd_ = function(edit, type) {
  pn.ass(edit);
  pn.assStr(type);

  var entity = edit.getCurrentFormData();
  var cb = goog.bind(this.entityAdded_, this, type);
  pn.web.ctx.pub(pn.app.AppEvents.ENTITY_SAVE, type, entity, cb);
};


/**
 * @private
 * @param {string} type The entity type saved.
 * @param {!pn.data.Entity} saved The server error or the entity that was added.
 */
pn.ui.edit.AddOnFlyDialog.prototype.entityAdded_ = function(type, saved) {
  pn.assInst(saved, pn.data.Entity);

  if (goog.isString(saved)) {
    pn.web.ctx.pub(pn.web.WebAppEvents.SHOW_ERROR, saved);
    return;
  }

  this.dialog_.setVisible(false);

  this.cache_.get(type).splice(0, 0, saved);
  var eventType = pn.ui.edit.AddOnFlyDialog.EventType.AOF_ADDED;
  var event = new goog.events.Event(eventType, this);
  event.entityId = saved.id;
  this.dispatchEvent(event);
};


/** @enum {string} The events of the AddOnFlyDialog control */
pn.ui.edit.AddOnFlyDialog.EventType = {
  AOF_ADDED: 'aof-added'
};
