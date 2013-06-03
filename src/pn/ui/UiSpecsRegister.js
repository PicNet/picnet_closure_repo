;
goog.provide('pn.ui.UiSpecsRegister');

goog.require('goog.asserts');
goog.require('goog.object');
goog.require('pn.ui.UiSpec');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Object.<!function(new:pn.ui.UiSpec)>} specs The UiSpecs object map
 *    containing all the IDs and UI specifications that will be used in this
 *    application.
 */
pn.ui.UiSpecsRegister = function(specs) {
  pn.ass(specs);

  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Object.<!function(new:pn.ui.UiSpec)>}
   */
  this.map_ = specs;
};
goog.inherits(pn.ui.UiSpecsRegister, goog.Disposable);


/**
 * @param {string} id The id of 'UiSpec' required.
 * @return {!pn.ui.UiSpec} The SpecBase specified by the 'id' arg.
 */
pn.ui.UiSpecsRegister.prototype.get = function(id) {
  pn.assStr(id);

  pn.ass(this.map_[id],
      'ID "' + id + ' was not found in the UiSpec register.');

  var instance = new this.map_[id]();
  pn.ass(instance.id === id, 'Spec ID: ' + instance.id +
      ' was registered with a different ID ' + id + ' this is not allowed.');

  this.protect_(instance);

  return instance;
};


/**
 * Reusing a UiSpec between multiple calls to getEditConfig (Grid/Search)
 *    causes memory issues.  This method protects an instance of UiSpec
 *    against this erronous usage by only allowing one call to these methods.
 *    Any subsequent call gets an error message.
 *
 * @private
 * @param {!pn.ui.UiSpec} spec The spec to protect from dangerous usage.
 */
pn.ui.UiSpecsRegister.prototype.protect_ = function(spec) {
  pn.assInst(spec, pn.ui.UiSpec);
  var err = function(method) {
    throw new Error(spec.id + '.' + method + ' has already been called.  To ' +
        'ensure proper clean up the UiSpec should always be disposed between ' +
        'calls to ' + method + '.');
  };

  spec.getGridConfig_original = spec.getGridConfig;
  spec.getEditConfig_original = spec.getEditConfig;
  spec.getSearchConfig_original = spec.getSearchConfig;

  spec.getGridConfig = function() {
    if (spec.getGridConfig_called) err('getGridConfig');
    spec.getGridConfig_called = true;
    return spec.getGridConfig_original.apply(spec, arguments);
  };
  spec.getEditConfig = function() {
    if (spec.getEditConfig_called) err('getEditConfig');
    spec.getEditConfig_called = true;
    return spec.getEditConfig_original.apply(spec, arguments);
  };
  spec.getSearchConfig = function() {
    if (spec.getSearchConfig_called) err('getSearchConfig');
    spec.getSearchConfig_called = true;
    return spec.getSearchConfig_original.apply(spec, arguments);
  };
};


/**
 * @return {!Object.<!function(new:pn.ui.UiSpec)>} All the registered specs.
 */
pn.ui.UiSpecsRegister.prototype.all = function() {
  return this.map_;
};
