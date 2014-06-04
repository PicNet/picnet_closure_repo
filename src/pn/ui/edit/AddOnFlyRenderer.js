;
goog.provide('pn.ui.edit.AddOnFlyRenderer');

goog.require('goog.events.Event');
goog.require('pn.ui.edit.AddOnFlyDialog');
goog.require('pn.ui.edit.AddOnFlyDialog.EventType');
goog.require('pn.ui.edit.ComplexRenderer');



/**
 * @constructor
 * @extends {pn.ui.edit.ComplexRenderer}
 * @param {!pn.data.Entity} entity The entity being edited.
 * @param {!pn.ui.UiSpec} spec The UiSpec of the entity to add on the fly.
 */
pn.ui.edit.AddOnFlyRenderer = function(entity, spec) {
  pn.assInst(entity, pn.data.Entity);
  pn.assInst(spec, pn.ui.UiSpec);

  pn.ui.edit.ComplexRenderer.call(this);

  /**
   * @private
   * @type {!pn.data.Entity}
   */
  this.entity_ = entity;

  /**
   * @private
   * @type {!pn.ui.UiSpec}
   */
  this.spec_ = spec;

  /**
   * @private
   * @type {pn.ui.edit.AddOnFlyDialog}
   */
  this.dialog_ = null;

  /**
   * @private
   * @type {!Element}
   */
  this.add_ = goog.dom.createDom('a', 'add-on-fly-add-button', 'Add');

  /**
   * @private
   * @type {!Element}
   */
  this.select_ = goog.dom.createDom('select', 'add-on-fly-select');
};
goog.inherits(pn.ui.edit.AddOnFlyRenderer, pn.ui.edit.ComplexRenderer);


/** @override */
pn.ui.edit.AddOnFlyRenderer.prototype.getValue = function() {
  return parseInt(this.select_.value, 10);
};


/** @param {number=} opt_selectedId The ID of the entity to select. */
pn.ui.edit.AddOnFlyRenderer.prototype.refresh = function(opt_selectedId) {
  var list = this.fctx.spec.additionalProperties.list ?
      this.fctx.spec.additionalProperties.list() :
      this.fctx.cache.get(this.spec_.type);

  var selected = opt_selectedId ? opt_selectedId :
      this.getValue() ? this.getValue() : 0;

  pn.data.EntityUtils.orderEntitiesByName(this.spec_.type, list);

  goog.dom.removeChildren(this.select_);
  goog.dom.appendChild(this.select_, goog.dom.createDom('option', {
    'value': '0' }, 'Select ' + this.spec_.name + '...'));
  list.pnforEach(function(e) {
    goog.dom.appendChild(this.select_, goog.dom.createDom('option', {
      'value': e.id,
      'selected': e.id === selected
    }, e.getValue(this.spec_.type + 'Name')));
  }, this);
};


/** @override */
pn.ui.edit.AddOnFlyRenderer.prototype.decorateInternal = function(element) {
  pn.ass(element);
  this.setElementInternal(element);

  var dom = goog.dom.createDom('div', 'add-on-fly', this.select_, this.add_);

  goog.dom.appendChild(element, dom);
};


/** @override */
pn.ui.edit.AddOnFlyRenderer.prototype.enterDocument = function() {
  pn.ui.edit.AddOnFlyRenderer.superClass_.enterDocument.call(this);

  var EventType = goog.events.EventType;
  this.getHandler().listen(this.add_, EventType.CLICK, this.addOnFly_);
  this.getHandler().listen(this.select_, EventType.CHANGE, this.fireChanged_);
  this.refresh(
      /** @type {number} */ (this.fctx.getEntityValue(this.entity_)));
};


/** @private */
pn.ui.edit.AddOnFlyRenderer.prototype.addOnFly_ = function () {  
  this.dialog_ = new pn.ui.edit.AddOnFlyDialog(
      this.spec_, this.fctx.cache, this.getNewEntity_());

  var eventType = pn.ui.edit.AddOnFlyDialog.EventType.AOF_ADDED;
  this.getHandler().listenOnce(this.dialog_, eventType, this.aofAdded_);
  this.dialog_.show();
};


/**
 * @private
 * @return {!pn.data.Entity} An object representing the entity to use as a
 *    template. This means that if any presets are required they can be set
 *    in a subclass or in an interceptor.
 */
pn.ui.edit.AddOnFlyRenderer.prototype.getNewEntity_ = function () {
  return !!this.fctx.spec.additionalProperties.getNewEntity ?
      this.fctx.spec.additionalProperties.getNewEntity() :
      pn.data.TypeRegister.create(this.spec_.type, {id: -goog.now()});
};


/**
 * @private
 * @param {goog.events.Event} e The AOF_ADDED event.
 */
pn.ui.edit.AddOnFlyRenderer.prototype.aofAdded_ = function(e) {
  goog.dispose(this.dialog_);
  this.dialog_ = null;

  this.refresh(e.entityId);
  this.fireChanged_();
};


/** @private */
pn.ui.edit.AddOnFlyRenderer.prototype.fireChanged_ = function() {
  var e = new goog.events.Event(goog.events.EventType.CHANGE);
  e.selectedid = this.getValue();
  this.dispatchEvent(e);
};
