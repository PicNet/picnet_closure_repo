;
goog.provide('pn.data.Storage');
goog.provide('pn.data.Storage.Type');



/**
 * @constructor
 * @param {string} id The id of this storage.
 * @param {!function(!pn.data.Storage):undefined} cb The on loaded callback.
 * @param {pn.data.Storage.Type=} opt_type The type of storage (websql,
 *    memory or localStorage);
 */
pn.data.Storage = function(id, cb, opt_type) {
  pn.assStr(id);
  pn.assFun(cb);
  pn.ass(!goog.isDef(opt_type) || goog.isString(opt_type));

  this.checkLawnchair_();

  var opts = { 'name': id };
  if (!!opt_type) { opts['adapter'] = opt_type; }
  new window['Lawnchair'](opts, goog.bind(function(lc) {
    this.lc_ = lc;
    cb(this);
  }, this));
};

///////////////////////////////////////////////////////////////////////////////
// LAWNCHAIR API (http://brian.io/lawnchair/api/)
///////////////////////////////////////////////////////////////////////////////


/**
 * @param {!function(!Array.<string>):undefined} cb returns all the keys in
 *    the store
 */
pn.data.Storage.prototype.keys = function(cb) {
  pn.assFun(cb);

  this.lc_['keys'](cb);
};


/**
 * @param {!Object} o The object to save
 * @param {function():undefined} cb The success callback.
 */
pn.data.Storage.prototype.save = function(o, cb) {
  pn.assObj(o);
  pn.assFun(cb);

  this.lc_['save'](o, cb);
};


/**
 * @param {!Array.<!Object>} arr Batch save array of objs
 * @param {function():undefined} cb The success callback.
 */
pn.data.Storage.prototype.batch = function(arr, cb) {
  pn.assArr(arr);
  pn.assFun(cb);

  this.lc_['batch'](arr, cb);
};


/**
 * @param {string|Array.<string>} keys The key or array of keys to retreive.
 * @param {function((Object|Array.<Object>)):undefined} cb The callback with the
 *    retreived items.
 */
pn.data.Storage.prototype.get = function(keys, cb) {
  pn.ass(goog.isString(keys) || goog.isArray(keys));
  pn.assFun(cb);

  this.lc_['get'](keys, cb);
};


/**
 * @param {string|Array.<string>} keys The key or array of keys to validate.
 * @param {function((Object|Array.<Object>)):undefined} cb The callback with the
 *    booleans of the validated items.
 */
pn.data.Storage.prototype.exists = function(keys, cb) {
  pn.assFun(cb);

  this.lc_['exists'](keys, cb);
};


/**
 * @param {function(Object):undefined} cb The callback to call for each item
 *    in the store.
 */
pn.data.Storage.prototype.each = function(cb) {
  pn.assFun(cb);

  this.lc_['each'](cb);
};


/**
 * @param {!function(!Array.<!Object>):undefined} cb returns all the objs to
 *    the callback as an array
 */
pn.data.Storage.prototype.all = function(cb) {
  pn.assFun(cb);

  this.lc_['all'](cb);
};


/**
 * @param {string|Array.<string>} keys The key or array of keys to remove.
 * @param {function():undefined} cb The callback once deleted.
 */
pn.data.Storage.prototype.remove = function(keys, cb) {
  pn.ass(goog.isString(keys) || goog.isArray(keys));
  pn.assFun(cb);

  this.lc_['remove'](keys, cb);
};


/** @param {function():undefined} cb The callback once store is cleared. */
pn.data.Storage.prototype.nuke = function(cb) {
  pn.assFun(cb);

  this.lc_['nuke'](cb);
};

///////////////////////////////////////////////////////////////////////////////
// MISC HELPERS
///////////////////////////////////////////////////////////////////////////////


/** @private */
pn.data.Storage.prototype.checkLawnchair_ = function() {
  if (!window['Lawnchair']) throw 'Lawnchair and adapters not loaded.';
};


/** @enum {string} */
pn.data.Storage.Type = {
  websql: 'webkit-sqlite',
  indexeddb: 'indexed-db',
  memory: 'memory',
  localStorage: 'dom'
};
