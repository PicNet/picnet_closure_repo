
goog.provide('pn.app.Model');
goog.provide('pn.app.Model.ChangeEvent');
goog.provide('pn.app.Model.Timer');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {!(Array|Object)} src The source object to create the model from.
 * @param {boolean=} opt_register Wether to register this model in the timed
 *    check (default = true).
 */
pn.app.Model = function(src, opt_register) {
  goog.asserts.assert(src);
  goog.asserts.assert(goog.isArray(src) || goog.isObject(src));

  goog.events.EventTarget.call(this);

  /**
   * @private
   * @type {boolean}
   */
  this.isArray_ = goog.isArray(src);

  /**
   * @private
   * @type {!Object}
   */
  this.src_ = src;

  /**
   * @private
   * @type {!Array.<!Object>}
   */
  this.arr_ = [];

  /**
   * @private
   * @type {!Object}
   */
  this.last_ = {};

  if (this.isArray_) {
    this.arr_ = goog.array.map(src, function(e) {
      return new pn.app.Model(e, false);
    });
  } else {
    for (var i in src) {
      var val = goog.isFunction(src[i].clone) ? src[i].clone() : src[i];
      this[i] = this.last_[i] = val;
    }
  }

  if (opt_register !== false) { pn.app.Model.TimerInstance_.register(this); }
};
goog.inherits(pn.app.Model, goog.events.EventTarget);


/** @private */
pn.app.Model.prototype.checkForChanges_ = function() {
  var changes = this.getChanges_();
  if (!changes.length) { return; }
  this.dispatchEvent(new pn.app.Model.ChangeEvent(changes));
};


/**
 * @private
 * @return {!Array.<!(pn.app.Model.Change|pn.app.Model.CollectionChange)>}
 *    The changes since last time getChanges were called.
 */
pn.app.Model.prototype.getChanges_ = function() {
  var changes = [];
  if (this.isArray_) {
    goog.array.forEach(this.arr_, function(model, idx) {
      var mchanges = model.getChanges_();
      if (mchanges.length) {
        changes.push({idx: idx, item: model.src_, changes: mchanges});
      }
    }, this);
  } else {
    for (var i in this.src_) {
      var same = goog.isFunction(this.src_[i].equals) ?
          this.src_[i].equals(this.last_[i]) :
          this.src_[i] === this.last_[i];

      if (!same) {
        changes.push({field: i, oldval: this.last_[i], newval: this.src_[i]});
        this.last_[i] = this.src_[i];
      }
    }
  }
  return changes;
};


/** @override */
pn.app.Model.prototype.disposeInternal = function() {
  pn.app.Model.superClass_.disposeInternal.call(this);

  pn.app.Model.TimerInstance_.deregister(this);
};


/** @enum {string} */
pn.app.Model.EventType = {
  CHANGE: 'model-change'
};


/** @typedef {{field:string, oldval: *, newval: *}} */
pn.app.Model.Change;


/** @typedef {{idx:number, item: !Object, changes: pn.app.Model.Change}} */
pn.app.Model.CollectionChange;



/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {!Array.<!(pn.app.Model.Change|pn.app.Model.CollectionChange)>}
 *    changes The details of the changes to this model.
 */
pn.app.Model.ChangeEvent = function(changes) {
  goog.asserts.assert(changes);

  goog.events.Event.call(this, pn.app.Model.EventType.CHANGE);

  /** @type {!Array.<!(pn.app.Model.Change|pn.app.Model.CollectionChange)>} */
  this.changes = changes;
};
goog.inherits(pn.app.Model.ChangeEvent, goog.events.Event);



/** @constructor */
pn.app.Model.Timer = function() {

  /**
   * @private
   * @const
   * @type {number}
   */
  this.REFRESH_MILLIS_ = 100;

  /**
   * @private
   * @type {!Array.<!pn.app.Model>}
   */
  this.models_ = [];

  /**
   * @private
   * @type {number}
   */
  this.intervalId_ = 0;
};


/** @param {!pn.app.Model} model The model to register. */
pn.app.Model.Timer.prototype.register = function(model) {
  goog.asserts.assert(model instanceof pn.app.Model);

  this.models_.push(model);
  if (this.intervalId_) { return; }

  var cb = goog.bind(model.checkForChanges_, model);
  this.intervalId_ = setInterval(cb, this.REFRESH_MILLIS_);
};


/** @param {!pn.app.Model} model The model to deregister. */
pn.app.Model.Timer.prototype.deregister = function(model) {
  goog.asserts.assert(model instanceof pn.app.Model);

  var idx = goog.array.indexOf(this.models_, model);
  this.models_.splice(idx, 1);
  if (this.models_.length) return;

  clearInterval(this.intervalId_);
};


/**
 * @private
 * @type {!pn.app.Model.Timer}
 */
pn.app.Model.TimerInstance_ = new pn.app.Model.Timer();
