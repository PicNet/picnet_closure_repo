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
      for (var s = 0; s === 0 || s < steps.length - 1; s++) {
        var step = steps[s];
        if (goog.string.endsWith(step, 'Entities')) {
          step = goog.string.remove(step, 'Entities');
        } else if (step !== 'ID' && goog.string.endsWith(step, 'ID')) {
          step = goog.string.remove(step, 'ID');
        }
        types.push(step);
      }
    }
    if (field.tableSpec) {
      var spec = pn.ui.UiSpecsRegister.get(field.tableSpec);
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
