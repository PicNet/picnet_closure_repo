
goog.provide('pn.model.ModelBase');

goog.require('pn');
goog.require('goog.events.EventTarget');
goog.require('pn.model.ChangeEvent');
goog.require('goog.async.Delay');
goog.require('pn.model.Change');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pn.model.ModelBase = function() {

  /** 
   * @private
   * @type {goog.async.Delay}
   */
  this.delay_ = new goog.async.Delay(this.fire.pnbind(this), 1);
  this.registerDisposable(this.delay_);

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
pn.model.ModelBase.same = function(a, b) {
  if (a === b) return true;
  if (!goog.isDefAndNotNull(a)) { return !goog.isDefAndNotNull(b); }
  return goog.isFunction(a.equals) ? a.equals(b) : a === b;
};


/**
 * Convenience alias for pn.model.ModelBase.same
 * @protected
 * @param {*} a The first item to compare.
 * @param {*} b The second item to compare.
 * @return {boolean} Wether a and b are equivalent.
 */
pn.model.ModelBase.prototype.same = pn.model.ModelBase.same;

/**
 * @protected
 * @param {string|number} prop The name of the property that changed.
 * @param {*} oldv The old value of the changed property.
 * @param {*} newv The new value of the changed property.
 */
pn.model.ModelBase.prototype.queueChange = function(prop, oldv, newv) {
  pn.assDef(prop);

  this.changes_.push(new pn.model.Change(this, prop, oldv, newv));
  this.startTimer_();
};

pn.model.ModelBase.prototype.startTimer_ = function() {
  this.delay_.start();
};

/** @protected Fires any queued changes immediatelly. */
pn.model.ModelBase.prototype.fire = function() {
  this.delay_.stop();
  var changes = this.changes_;
  this.changes_ = [];

  if (changes.length) this.dispatchEvent(new pn.model.ChangeEvent(changes));
};