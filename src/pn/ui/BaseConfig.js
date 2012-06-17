;
goog.provide('pn.ui.BaseConfig');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Array.<pn.ui.BaseFieldSpec>} fieldSpecs The fields being
 *    displayed by this config.
 */
pn.ui.BaseConfig = function(fieldSpecs) {
  goog.asserts.assert(fieldSpecs);

  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Array.<pn.ui.BaseFieldSpec>}
   */
  this.fieldSpecs_ = fieldSpecs;

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
  goog.array.forEach(this.fieldSpecs_, function(fSpec) {
    var additional = fSpec.additionalCacheTypes;
    if (additional.length) { types = goog.array.concat(types, additional); }

    if (fSpec.displayPath) {
      goog.array.forEach(fSpec.displayPath.split('.'), addIfType);
    }
    addIfType(fSpec.dataProperty);
    if (fSpec.tableSpec) {
      var spec = pn.app.ctx.specs.get(fSpec.tableSpec);
      var related = spec.gridConfig.getRelatedTypes();
      types = goog.array.concat(types, related);
      goog.dispose(spec);
    }
  });
  goog.array.removeDuplicates(types);
  return types;
};


/** @inheritDoc */
pn.ui.BaseConfig.prototype.disposeInternal = function() {
  pn.ui.BaseConfig.superClass_.disposeInternal.call(this);

  goog.array.forEach(this.fieldSpecs_, goog.dispose);
  delete this.fieldSpecs_;
};
