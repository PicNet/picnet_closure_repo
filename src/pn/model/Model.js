
goog.provide('pn.model.Model');

goog.require('pn.model.ModelBase');
goog.require('pn.model.TimerInstance');



/**
 * @constructor
 * @extends {pn.model.ModelBase}
 * @param {!Object} src The source object to create the model from.
 * @param {boolean=} opt_register Wether to register this model in the timed
 *    check (default = true).
 */
pn.model.Model = function(src, opt_register) {
  goog.asserts.assert(goog.isObject(src));

  pn.model.ModelBase.call(this);

  /**
   * @private
   * @type {!Object}
   */
  this.src_ = src;

  /**
   * @private
   * @type {!Object}
   */
  this.last_ = {};

  for (var i in src) {
    var fld = src[i];
    var val = fld && goog.isFunction(fld.clone) ? fld.clone() : fld;
    this[i] = this.last_[i] = val;
  }

  if (opt_register !== false) { pn.model.TimerInstance.register(this); }
};
goog.inherits(pn.model.Model, pn.model.ModelBase);


/** @override */
pn.model.Model.prototype.getChanges = function() {
  var changes = [];
  for (var i in this.src_) {
    if (!this.areSame(this.src_[i], this.last_[i])) {
      /** @type {pn.model.Model.Change} */
      var change = {field: i, oldval: this.last_[i], newval: this.src_[i]};
      changes.push(change);
      this.last_[i] = this.src_[i];
    }
  }
  return changes;
};


/** @typedef {{field:string, oldval: *, newval: *}} */
pn.model.Model.Change;
