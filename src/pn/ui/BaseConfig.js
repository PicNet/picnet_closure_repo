;
goog.provide('pn.ui.BaseConfig');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Array.<pn.ui.FieldCtx>} fCtxs The fields being displayed by this
 *    config.
 */
pn.ui.BaseConfig = function(fCtxs) {
  goog.asserts.assert(fCtxs);

  goog.Disposable.call(this);

  /** @type {!Array.<pn.ui.FieldCtx>} */
  this.fCtxs = fCtxs;

  /**
   * The Grid and Edit controls will use pn.app.ctx.pub to publish events if
   *    this is true.  Otherwise traditional goog.events.Event will be used.
   * @type {boolean}
   */
  this.publishEventBusEvents = true;
};
goog.inherits(pn.ui.BaseConfig, goog.Disposable);


/** @return {!Array.<string>} The list of types related to this entity. */
pn.ui.BaseConfig.prototype.getRelatedTypes = function() {
  var types = [];
  var addIfType = function(f) {
    if (!f) return;
    var type = pn.data.EntityUtils.getTypeProperty(f);
    if (type !== f) types.push(type);
  };
  goog.array.forEach(this.fCtxs, function(fctx) {
    var additional = fctx.spec.additionalCacheTypes;
    if (additional.length) { types = goog.array.concat(types, additional); }

    if (fctx.spec.displayPath) {
      goog.array.forEach(fctx.spec.displayPath.split('.'), addIfType);
    }
    addIfType(fctx.spec.dataProperty);
    if (fctx.spec.tableSpec) {
      var spec = pn.app.ctx.specs.get(fctx.spec.tableSpec);
      var cfg = spec.getGridConfig(fctx.cache);
      var related = cfg.getRelatedTypes();
      types = goog.array.concat(types, related);
      goog.dispose(cfg);
      goog.dispose(spec);
    }
  });
  goog.array.removeDuplicates(types);
  return types;
};
