;
goog.provide('pn.ui.UiSpecsRegister');
goog.provide('pn.ui.UiSpecsRegisterImpl');

goog.require('goog.asserts');
goog.require('goog.object');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.ui.UiSpecsRegisterImpl = function() {
  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Object.<!pn.ui.UiSpec>}
   */
  this.map_ = {};
};
goog.inherits(pn.ui.UiSpecsRegisterImpl, goog.Disposable);


/**
 * @param {pn.ui.UiSpec} impl The specs implementation.
 */
pn.ui.UiSpecsRegisterImpl.prototype.add = function(impl) {
  goog.asserts.assert(impl);
  this.map_[impl.id] = impl;
};


/**
 * @param {string} id The id of 'UiSpec' required.
 * @return {!pn.ui.UiSpec} The SpecBase specified by the 'id' arg.
 */
pn.ui.UiSpecsRegisterImpl.prototype.get = function(id) {
  goog.asserts.assert(this.map_[id],
      'ID "' + id + ' was not found in the UiSpec register.');
  return this.map_[id];
};


/**
 * @return {!Object.<pn.ui.UiSpec>} All the registered specs.
 */
pn.ui.UiSpecsRegisterImpl.prototype.all = function() {
  return this.map_;
};


/** @inheritDoc */
pn.ui.UiSpecsRegisterImpl.prototype.disposeInternal = function() {
  pn.ui.UiSpecsRegisterImpl.superClass_.disposeInternal.call(this);

  goog.object.forEach(this.map_, goog.dispose);
  delete this.map_;
};


/** @type {!pn.ui.UiSpecsRegisterImpl} */
pn.ui.UiSpecsRegister = new pn.ui.UiSpecsRegisterImpl();
