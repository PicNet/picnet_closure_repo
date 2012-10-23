;
goog.provide('pn.mvc.Change');



/**
 * @constructor
 * @param {!pn.mvc.ModelBase} model The model that changed.
 * @param {string|number} property The name or index of the property
 *    that changed.
 * @param {*} oldv The old value of the changed property.
 * @param {*} newv The new value of the changed property.
 */
pn.mvc.Change = function(model, property, oldv, newv) {
  pn.assInst(model, pn.mvc.ModelBase);
  pn.assDef(property);

  /** @type {!pn.mvc.ModelBase} */
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
pn.mvc.Change.prototype.equals = function(other) {
  if (!other || !(other instanceof pn.mvc.Change)) return false;
  if (other === this) return true;
  return other.model === this.model &&
      other.property == this.property &&
      other.oldv == this.oldv &&
      other.newv == this.newv;
};
