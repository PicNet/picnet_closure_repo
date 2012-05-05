
goog.provide('pn.app.schema.AppConfig');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.app.schema.Entity');
goog.require('pn.app.schema.Field');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.app.schema.AppConfig = function() {
  goog.Disposable.call(this);

  var fr = pn.ui.edit.FieldRenderers;

  /** @type {Object} */
  this.defaultRenderers = {
    
    /** @type {function(!*, !Object, !Element):undefined} */
    this.bool = fr.boolRenderer;

    /** @type {function(!*, !Object, !Element):undefined} */
    this.date = fr.dateRenderer;

    /** @type {function(!*, !Object, !Element):undefined} */
    this.decimal = fr.centsRenderer;

    /** @type {number} */
    this.textAreaLengthThreshold = 250;
  };  
};
goog.inherits(pn.app.schema.AppConfig, goog.Disposable);

/** @inheritDoc */
pn.app.schema.AppConfig.prototype.disposeInternal = function() {
  pn.app.schema.AppConfig.superClass_.disposeInternal.call(this);

  delete this.defaultRenderers;
};