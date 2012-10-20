
goog.provide('pn.model.Change');

/**
 * @constructor
 * @param {!pn.model.ModelBase} model The model that changed.
 * @param {string|number} property The name or index of the property 
 *    that changed.
 * @param {*} oldv The old value of the changed property.
 * @param {*} newv The new value of the changed property.
 */
pn.model.Change = function(model, property, oldv, newv) {
  pn.assInst(model, pn.model.ModelBase);
  pn.assDef(property);

  /** @type {!pn.model.ModelBase} */
  this.model = model;

  /** @type {string|number} */
  this.property = property;

  /** @type {*} */
  this.oldv = oldv;

  /** @type {*} */
  this.newv = newv;
}; 

/** 
 * @param {*} other The other object to check equality against.
 * @return {boolean} Wether this instance is the same as 'other'.
 */
pn.model.Change.prototype.equals = function(other) {
  if (!other || !(other instanceof pn.model.Change)) return false;
  if (other === this) return true;  
  return other.model === this.model &&
    other.property == this.property &&
    other.oldv == this.oldv &&
    other.newv == this.newv;
};