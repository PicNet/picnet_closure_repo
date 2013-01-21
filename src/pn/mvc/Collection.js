
goog.provide('pn.mvc.Collection');

goog.require('goog.events.EventHandler');
goog.require('pn.mvc.Model');



/**
 * @constructor
 * @extends {pn.mvc.ModelBase}
 * @param {Array.<!pn.mvc.ModelBase>=} opt_initial An optional array of
 *    models to listen to.
 */
pn.mvc.Collection = function(opt_initial) {
  pn.ass(!goog.isDef(opt_initial) || goog.isArray(opt_initial));

  pn.mvc.ModelBase.call(this);

  /**
   * @private
   * @type {!Array.<!pn.mvc.ModelBase>}
   */
  this.src_ = opt_initial || [];
  this.src_.pnforEach(this.intern_, this);
};
goog.inherits(pn.mvc.Collection, pn.mvc.ModelBase);


/**
 * @param {number} idx The index of the model to return.
 * @return {!pn.mvc.ModelBase} The ModelBase at the selected index.
 */
pn.mvc.Collection.prototype.get = function(idx) {
  pn.ass(idx >= 0 && idx < this.src_.length);
  return this.src_[idx];
};


/**
 * @param {!pn.mvc.ModelBase} model The model to add to the end of the
 *    collection.
 */
pn.mvc.Collection.prototype.add = function(model) {
  pn.assInst(model, pn.mvc.ModelBase);

  this.intern_(model);
  this.src_.push(model);
  this.queueChange(this.src_.length - 1, undefined, model);
};


/**
 * @param {!pn.mvc.ModelBase} model The model to insert into the collection.
 * @param {number} idx The index to insert the specified model into.
 */
pn.mvc.Collection.prototype.insert = function(model, idx) {
  pn.assInst(model, pn.mvc.ModelBase);
  pn.assNum(idx);
  pn.ass(idx >= 0 && idx < this.src_.length);

  this.intern_(model);
  this.src_.splice(idx, 0, model);
  this.queueChange(idx, undefined, model);
};


/**
 * @param {!pn.mvc.ModelBase} model The model to add to the collection,
 *    overwriting the existing model at the specified index.
 * @param {number} idx The index to add the specified model into.
 */
pn.mvc.Collection.prototype.replace = function(model, idx) {
  pn.assInst(model, pn.mvc.ModelBase);
  pn.assNum(idx);
  pn.ass(idx >= 0 && idx < this.src_.length);

  var old = this.src_[idx];
  if (this.same(old, model)) return;

  this.intern_(model);
  this.src_[idx] = model;
  this.queueChange(idx, old, model);
};


/**
 * @param {number} idx The index to add the specified model into.
 */
pn.mvc.Collection.prototype.remove = function(idx) {
  pn.assNum(idx);
  pn.ass(idx >= 0 && idx < this.src_.length);

  var removed = this.src_.splice(idx, 1)[0];
  this.queueChange(idx, removed, undefined);
};


/**
 * @private
 * @param {!pn.mvc.ModelBase} model The model to listen to changes on.
 */
pn.mvc.Collection.prototype.intern_ = function(model) {
  if (!(model instanceof pn.mvc.ModelBase)) return;

  var eventType = pn.mvc.EventType.CHANGE;
  this.listenTo(model, eventType, this.childChanged_.pnbind(this));
  this.registerDisposable(model);
};


/**
 * @private
 * @param {!pn.mvc.ChangeEvent} e The change event fired.
 */
pn.mvc.Collection.prototype.childChanged_ = function(e) {
  e.changes.pnforEach(function(change) {
    var model = change.model;
    var idx = this.src_.pnindexOf(model);
    this.queueChange(idx, undefined, model);
  }, this);
};
