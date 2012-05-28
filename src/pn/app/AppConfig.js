
goog.provide('pn.app.AppConfig');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.app.schema.EntitySchema');
goog.require('pn.app.schema.FieldSchema');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.app.AppConfig = function() {
  goog.Disposable.call(this);

  var fr = pn.ui.edit.FieldRenderers;

  /** @type {boolean} */
  this.useAsyncEventBus = false;

  /** @type {Object} */
  this.defaultRenderers = {

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    bool: fr.boolRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    date: fr.dateRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    decimal: fr.centsRenderer,

    /** @type {number} */
    textAreaLengthThreshold: 250
  };
};
goog.inherits(pn.app.AppConfig, goog.Disposable);


/** @inheritDoc */
pn.app.AppConfig.prototype.disposeInternal = function() {
  pn.app.AppConfig.superClass_.disposeInternal.call(this);

  delete this.defaultRenderers;
};
