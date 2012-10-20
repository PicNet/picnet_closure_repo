
goog.provide('pn.model.Collection');

goog.require('pn.model.Model');
goog.require('goog.events.EventHandler');


/**
 * @constructor
 * @extends {pn.model.ModelBase}
 * @param {Array.<!pn.model.ModelBase>=} opt_initial An optional array of 
 *    models to listen to.
 */
pn.model.Collection = function(opt_initial) {
  pn.ass(!goog.isDef(opt_initial) || goog.isArray(opt_initial));

  pn.model.ModelBase.call(this);

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler();
  this.registerDisposable(this.eh_);

  /**
   * @private
   * @type {!Array.<!pn.model.ModelBase>}
   */
  this.src_ = opt_initial || [];  
  this.src_.pnforEach(this.intern_, this);
};
goog.inherits(pn.model.Collection, pn.model.ModelBase);

/** 
 * @param {number} idx The index of the model to return.
 */
pn.model.Collection.prototype.get = function(idx) { return this.src_[idx]; };

/** 
 * @param {!pn.model.ModelBase} model The model to add to the end of the 
 *    collection. 
 */
pn.model.Collection.prototype.add = function(model) {
  pn.assInst(model, pn.model.ModelBase);

  this.intern_(model);    
  this.src_.push(model);
  this.queueChange(this.src_.length - 1, undefined, model);
};

/** 
 * @param {!pn.model.ModelBase} model The model to insert into the collection.
 * @param {number} idx The index to insert the specified model into.
 */
pn.model.Collection.prototype.insert = function(model, idx) {
  pn.assInst(model, pn.model.ModelBase);
  pn.assNum(idx);
  pn.ass(idx >= 0 && idx < this.src_.length);

  this.intern_(model);    
  this.src_.splice(idx, 0, model);
  this.queueChange(idx, undefined, model);
};

/** 
 * @param {!pn.model.ModelBase} model The model to add to the collection, 
 *    overwriting the existing model at the specified index.
 * @param {number} idx The index to add the specified model into.
 */
pn.model.Collection.prototype.replace = function(model, idx) {
  pn.assInst(model, pn.model.ModelBase);
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
pn.model.Collection.prototype.remove = function(idx) {
  pn.assNum(idx);
  pn.ass(idx >= 0 && idx < this.src_.length);
    
  var removed = this.src_.splice(idx, 1)[0];
  this.queueChange(idx, removed, undefined);
};

/**
 * @private
 * @param {!pn.model.ModelBase} model The model to listen to changes on.
 */
pn.model.Collection.prototype.intern_ = function(model) {
  var eventType = pn.model.EventType.CHANGE;
  this.eh_.listen(model, eventType, this.childChanged_.pnbind(this));
  this.registerDisposable(model);
};

/**
 * @private
 * @param {!pn.model.ChangeEvent} e The change event fired.
 */
pn.model.Collection.prototype.childChanged_ = function(e) {
  e.changes.pnforEach(function(change) {    
    var model = change.model;
    var idx = this.src_.pnindexOf(model);
    this.queueChange(idx, undefined, model);
  }, this);  
};