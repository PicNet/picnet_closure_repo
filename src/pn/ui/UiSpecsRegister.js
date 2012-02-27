;
goog.provide('pn.ui.UiSpecsRegister');

goog.require('goog.asserts');
goog.require('goog.object');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.ui.UiSpecsRegister = function() {
  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Object.<!pn.ui.UiSpec>}
   */
  this.map_ = {};
};
goog.inherits(pn.ui.UiSpecsRegister, goog.Disposable);


/** @type {!pn.ui.UiSpecsRegister} */
pn.ui.UiSpecsRegister.INSTANCE = new pn.ui.UiSpecsRegister();


/**
 * @param {pn.ui.UiSpec} impl The specs implementation.
 */
pn.ui.UiSpecsRegister.prototype.add = function(impl) {
  goog.asserts.assert(impl);
  this.map_[impl.id] = impl;
};


/**
 * @param {string} id The id of 'UiSpec' required.
 * @return {!pn.ui.UiSpec} The SpecBase specified by the 'id' arg.
 */
pn.ui.UiSpecsRegister.prototype.get = function(id) {
  goog.asserts.assert(this.map_[id],
      'ID "' + id + ' was not found in the UiSpec register.');
  return this.map_[id];
};


/**
 * @return {!Object.<pn.ui.UiSpec>} All the registered specs.
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
