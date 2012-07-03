
goog.provide('pn.model.Timer');
goog.provide('pn.model.TimerInstance');



/** @constructor */
pn.model.Timer = function() {

  /**
   * @private
   * @const
   * @type {number}
   */
  this.REFRESH_MILLIS_ = 100;

  /**
   * @private
   * @type {!Array.<!pn.model.Model>}
   */
  this.models_ = [];

  /**
   * @private
   * @type {number}
   */
  this.intervalId_ = 0;
};


/** @param {!pn.model.ModelBase} model The model to register. */
pn.model.Timer.prototype.register = function(model) {
  goog.asserts.assert(model instanceof pn.model.ModelBase);
  this.models_.push(model);
  if (this.intervalId_) { return; }
  this.startTimer_();
};


/** @param {!pn.model.ModelBase} model The model to deregister. */
pn.model.Timer.prototype.deregister = function(model) {
  goog.asserts.assert(model instanceof pn.model.ModelBase);
  var idx = goog.array.indexOf(this.models_, model);
  this.models_.splice(idx, 1);
  if (this.models_.length) return;

  clearInterval(this.intervalId_);
};


/** @private */
pn.model.Timer.prototype.checkForChanges_ = function() {
  goog.array.forEach(this.models_, function(model) {
    var changes = model.getChanges();
    if (!changes.length) { return; }
    model.dispatchEvent(new pn.model.ChangeEvent(changes));
  });
};


/** @private */
pn.model.Timer.prototype.startTimer_ = function() {
  var cb = goog.bind(this.checkForChanges_, this);
  this.intervalId_ = setInterval(cb, this.REFRESH_MILLIS_);
};


/** @type {!pn.model.Timer} */
pn.model.TimerInstance = new pn.model.Timer();
