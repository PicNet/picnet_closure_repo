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
  return instance;
};


/**
 * @return {!Object.<!function(new:pn.ui.UiSpec)>} All the registered specs.
 */
pn.ui.UiSpecsRegister.prototype.all = function() {
  return this.map_;
};
