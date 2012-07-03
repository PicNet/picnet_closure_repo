
goog.provide('pn.model.ModelBase');

goog.require('goog.events.EventTarget');
goog.require('pn.model.ChangeEvent');
goog.require('pn.model.TimerInstance');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pn.model.ModelBase = function() {};
goog.inherits(pn.model.ModelBase, goog.events.EventTarget);


/** @return {!Array} The changes since last time getChanges were called. */
pn.model.ModelBase.prototype.getChanges = goog.abstractMethod;


/**
 * @param {*} a The first item to compare.
 * @param {*} b The second item to compare.
 * @return {boolean} Wether a and b are equivalent.
 */
pn.model.ModelBase.prototype.areSame = function(a, b) {
  if (!goog.isDefAndNotNull(a)) return !goog.isDefAndNotNull(b);
  return goog.isFunction(a.equals) ? a.equals(b) : a === b;
};
