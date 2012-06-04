
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

  var fr = pn.ui.edit.FieldRenderers,
      cr = pn.ui.grid.ColumnRenderers;

  /** @type {boolean} */
  this.useAsyncEventBus = false;

  /** @type {Object} */
  this.defaultFieldRenderers = {

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'YesNo': fr.boolRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'DateTime': fr.dateRenderer,

    /** @type {number} */
    textAreaLengthThreshold: 250
  };

  /** @type {Object} */
  this.defaultColumnRenderers = {

    /** @type {function(!pn.ui.FieldCtx):string} */
    'YesNo': cr.yesNoBoolRenderer,

    /** @type {function(!pn.ui.FieldCtx):string} */
    'DateTime': cr.dateRenderer,

    /** @type {function(!pn.ui.FieldCtx):string} */
    'Int64': cr.parentColumnRenderer
  };
};
goog.inherits(pn.app.AppConfig, goog.Disposable);


/** @inheritDoc */
pn.app.AppConfig.prototype.disposeInternal = function() {
  pn.app.AppConfig.superClass_.disposeInternal.call(this);

  delete this.defaultFieldRenderers;
  delete this.defaultColumnRenderers;
};
