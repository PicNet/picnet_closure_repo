
goog.provide('pn.model.Model');

goog.require('pn.model.ModelBase');



/**
 * @constructor
 * @extends {pn.model.ModelBase}
 */
pn.model.Model = function() {
  pn.model.ModelBase.call(this);

  /**
   * @private
   * @type {!Object.<*>}
   */
  this.values_ = {};  
};
goog.inherits(pn.model.Model, pn.model.ModelBase);

pn.model.Model.prototype.get = function(name) {
  return this.values_[name];
};

/**
 * @param {string} name The name of the property to set.
 * @param {*} val The new value of the property to set.
 */
pn.model.Model.prototype.set = function(name, val) {
  var old = this.values_[name];
  if (this.same(old, val)) return;  
  this.queueChange(this, name, old, val);
};

/**
 * @constructor
 * @param {!pn.model.ModelBase} model The model that changed.
 * @param {string} property The name of the property that changed.
 * @param {*} oldv The old value of the changed property.
 * @param {*} newv The new value of the changed property.
 */
pn.model.Change = function(model, property, oldv, newv) {
  pn.assInst(model, pn.model.ModelBase);
  pn.assStr(property);

  /** @type {!pn.model.ModelBase} */
  this.model = model;

  /** @type {string} */
  this.property = property;

  /** @type {*} */
  this.oldv = oldv;

  /** @type {*} */
  this.newv = newv;
}; 
