
goog.provide('pn.model.ModelBase');

goog.require('pn');
goog.require('goog.events.EventTarget');
goog.require('pn.model.ChangeEvent');
goog.require('goog.async.Delay');


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pn.model.ModelBase = function() {

  /** 
   * @private
   * @type {goog.async.Delay}
   */
  this.delay_ = new goog.async.Delay(this.fire_.pnbind(this), 2);

  /** 
   * @private
   * @type {!Array.<!pn.model.Change>}
   */
  this.changes_ = [];
};
goog.inherits(pn.model.ModelBase, goog.events.EventTarget);

/** @return {!Array} The changes since last time getChanges were called. */
pn.model.ModelBase.prototype.getChanges = goog.abstractMethod;

/**
 * @param {*} a The first item to compare.
 * @param {*} b The second item to compare.
 * @return {boolean} Wether a and b are equivalent.
 */
pn.model.ModelBase.prototype.same = function(a, b) {
  if (!goog.isDefAndNotNull(a)) return !goog.isDefAndNotNull(b);
  return goog.isFunction(a.equals) ? a.equals(b) : a === b;
};

/**
 * @protected
 * @param {string} property The name of the property that changed.
 * @param {*} oldv The old value of the changed property.
 * @param {*} newv The new value of the changed property.
 */
pn.model.ModelBase.prototype.queueChange = function(prop, oldv, newv) {
  pn.assStr(prop);

  this.changes_.push(new pn.model.Change(this, prop, oldv, newv));
  this.startTimer_();
};

pn.model.ModelBase.prototype.startTimer_ = function() {
  this.delay_.start();
};

pn.model.ModelBase.prototype.fire_ = function() {
  var changes = this.changes_;
  this.changes_ = [];

  this.dispatchEvent(new pn.model.ChangeEvent(changes));
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

pn.model.Change.prototype.equals = function(other) {
  if (!other || !(other instanceof pn.model.Change)) return false;
  if (other === this) return true;  
  return other.model === this.model &&
    other.property == this.property &&
    other.oldv == this.oldv &&
    other.newv == this.newv;
};