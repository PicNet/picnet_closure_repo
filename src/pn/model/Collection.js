
goog.provide('pn.model.Collection');

goog.require('pn.model.Model');
goog.require('pn.model.ModelBase');
goog.require('pn.model.TimerInstance');



/**
 * @constructor
 * @extends {pn.model.ModelBase}
 * @param {!Array.<!Object>} src The source array to create the model from.
 */
pn.model.Collection = function(src) {
  pn.assArr(src);

  pn.model.ModelBase.call(this);

  /**
   * @private
   * @type {!Array.<!Object>}
   */
  this.src_ = src;

  /**
   * @private
   * @type {!Object.<!Object>}
   */
  this.map_ = {};
  src.pnforEach(function(e) {
    this.map_[e.id] = new pn.model.Model(e, false);
  }, this);

  pn.model.TimerInstance.register(this);
};
goog.inherits(pn.model.Collection, pn.model.ModelBase);


/** @override */
pn.model.Collection.prototype.getChanges = function() {
  var map = goog.object.clone(this.map_);
  var changes = [];

  for (var i = 0, len = this.src_.length; i < len; i++) {
    var now = this.src_[i];
    if (!goog.isDef(now)) continue;
    var key = now.id.toString();
    var lastmodel = map[key];
    var mchanges = lastmodel ? lastmodel.getChanges() : null;
    delete map[key];

    if (!lastmodel) {
      pn.ass(!(key in this.map_));
      changes.push({item: now, inserted: true});
      this.map_[key] = new pn.model.Model(now, false);
    }
    else if (mchanges.length) {
      pn.ass(mchanges.length);
      changes.push({item: lastmodel.src_, changes: mchanges});
    }
  }

  for (var id in map) {
    var last = map[id];
    changes.push({item: last.src_, removed: true});

    var model = this.map_[id];
    goog.dispose(model);
    delete this.map_[id];
  }
  return changes;
};


/** @override */
pn.model.Collection.prototype.disposeInternal = function() {
  pn.model.Collection.superClass_.disposeInternal.call(this);

  goog.object.forEach(this.map_, goog.dispose);
  pn.model.TimerInstance.deregister(this);
};


/** @typedef {{item: !Object, changes: !Array.<pn.model.Model.Change>}} */
pn.model.Collection.CollectionChange;
