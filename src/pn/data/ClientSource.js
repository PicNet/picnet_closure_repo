;
goog.provide('pn.data.ClientSource');

goog.require('goog.debug.Logger');
goog.require('pn.data.MemCache');



/**
 * @constructor
 * @extends {pn.data.BaseSource}
 */
pn.data.ClientSource = function() {
  pn.data.BaseSource.call(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.logger_ = pn.log.getLogger('pn.data.ClientSource');

  /**
   * @private
   * @type {!pn.data.ServerSource}
   */
  this.serverSource_ = new pn.data.ServerSource();
  this.registerDisposable(this.serverSource_);

  /**
   * @private
   * @type {!Object.<pn.model.Collection>}
   */
  this.cache_ = {};
};
goog.inherits(pn.data.ClientSource, pn.data.BaseSource);


/** @override */
pn.data.ClientSource.prototype.getEntityLists = function(types, callback) {
  goog.array.removeDuplicates(types);

  var cached = {};

  // Populate cache with collections in memory
  var unloaded = goog.array.filter(types, function(type) {
    if (goog.isDefAndNotNull(this.cache_[type])) {
      cached[type] = this.cache_[type];
      return false;
    } else { return true; }
  }, this);

  if (!unloaded.length) {
    callback(cached);
    return;
  }

  // Any missing lists get from the server source
  this.serverSource_.getEntityLists(unloaded, goog.bind(function(loaded) {
    for (var type in loaded) {
      var arr = loaded[type];
      this.cache_[type] = new pn.model.Collection(arr);
    }
    callback(cached);
  }, this));
};
