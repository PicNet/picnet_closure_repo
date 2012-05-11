;
goog.provide('pn.ui.BaseConfig');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Array.<pn.ui.BaseField>} fields The fields being displayed by
 *    this config.
 */
pn.ui.BaseConfig = function(fields) {
  goog.asserts.assert(fields);

  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Array.<pn.ui.BaseField>}
   */
  this.fields_ = fields;

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

  goog.array.forEach(this.fields_, function(field) {
    var additional = field.additionalCacheTypes;
    if (additional.length) { types = goog.array.concat(types, additional); }

    if (field.displayPath) {
      var steps = field.displayPath.split('.');
      goog.array.forEach(steps, function(step) {
        var type = pn.data.EntityUtils.getTypeProperty(step);
        if (type !== step) types.push(type);
      });
    }
    if (field.tableSpec) {
      var spec = pn.app.ctx.specs.get(field.tableSpec);
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

  delete this.fields_;
};
