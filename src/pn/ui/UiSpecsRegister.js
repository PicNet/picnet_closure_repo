;
goog.provide('pn.ui.UiSpecsRegister');

goog.require('goog.asserts');
goog.require('goog.object');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Array.<!function(new:pn.ui.UiSpec)>} specs The UiSpecs array
 *    containing all the UI specifications that will be used in this
 *    application.
 */
pn.ui.UiSpecsRegister = function(specs) {
  goog.asserts.assert(specs.length);

  goog.Disposable.call(this);
  
  /**
   * @private
   * @type {!Object.<!function(new:pn.ui.UiSpec)>}
   */
  this.map_ = {};
  goog.array.forEach(specs, function(spec) {
    var instance = new spec();
    this.map_[instance.id] = spec;
    goog.dispose(instance);  
  }, this);
};
goog.inherits(pn.ui.UiSpecsRegister, goog.Disposable);


/**
 * @param {string} id The id of 'UiSpec' required.
 * @return {!pn.ui.UiSpec} The SpecBase specified by the 'id' arg.
 */
pn.ui.UiSpecsRegister.prototype.get = function(id) {
  goog.asserts.assert(this.map_[id],
      'ID "' + id + ' was not found in the UiSpec register.');
  return new this.map_[id]();
};


/**
 * @return {!Object.<!function(new:pn.ui.UiSpec)>} All the registered specs.
 */
pn.ui.UiSpecsRegister.prototype.all = function() {
  return this.map_;
};


/** @inheritDoc */
pn.ui.UiSpecsRegister.prototype.disposeInternal = function() {
  pn.ui.UiSpecsRegister.superClass_.disposeInternal.call(this);

  goog.object.forEach(this.map_, goog.dispose);
  delete this.map_;
};
