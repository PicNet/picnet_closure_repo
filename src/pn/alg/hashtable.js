;
goog.provide('pn.alg.hashtable');

goog.require('goog.string.StringBuffer');



/**
 * NOTE: This is much slower than using an object literal as the
 *    store and just using JSON.stringify for the literal keys. So DO NOT
 *    USE THIS!!
 * @constructor
 * @param {function(*):number=} opt_hasher An optional hasher function
 *    that returns a positive num hash from the given object.
 */
pn.alg.hashtable = function(opt_hasher) {
  this.hasher_ = opt_hasher || pn.alg.hashtable.defaultHasher;
  this.count_ = 0;
  this.arr_ = [];
};


/**
 * @param {*} o The object to hash.
 * @return {number} The hash of the given object.
 */
pn.alg.hashtable.defaultHasher = function(o) {
  pn.assDef(o);

  if (o === null || goog.isFunction(o)) return 0;
  if (goog.isNumber(o)) { return 17 + o; }
  if (goog.isString(o)) {
    var hash1 = 0;
    for (var i = 0, len = o.length; i < len; i++) {
      hash1 = hash1 * 31 + o.charAt(i);
    }
    return hash1;

  }
  if (goog.isBoolean(o)) { return o ? 1231 : 1237; }

  var hash2 = 1;
  for (var prop in o) {
    if (o.hasOwnProperty(prop)) {
      hash2 = hash2 * 31 + pn.alg.hashtable.defaultHasher(o[prop]);
    }
  }
  return hash2;
};


/**
 * @param {*} key The key to add or replace to the hashmap.
 * @param {*} val The value to store for the specified key.
 */
pn.alg.hashtable.prototype.set = function(key, val) {
  pn.assDefAndNotNull(key);
  pn.assDefAndNotNull(val);

  var hash = this.hasher_(key);
  var node = {key: key, val: val};
  if (!(hash in this.arr_)) {
    this.arr_[hash] = [node];
    this.count_++;
    return;
  }
  var arr = this.arr_[hash];
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i].key === key) {
      arr[i].val = val;
      return;
    }
  }
  this.count_++;
  arr.push(node);
};


/**
 * @param {*} key The key whose value to retreive.
 * @return {*} The value for the specified key or null if the key is not found.
 */
pn.alg.hashtable.prototype.get = function(key) {
  pn.assDefAndNotNull(key);

  var hash = this.hasher_(key);
  if (!(hash in this.arr_)) { return null; }
  var arr = this.arr_[hash];
  if (arr.length === 1) return arr[0].val;
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i].key === key) { return arr[i].val; }
  }
  return null;
};


/**
 * @param {*} key The key to remove.
 * @return {boolean} Wether the specified key was found and removed.
 */
pn.alg.hashtable.prototype.remove = function(key) {
  pn.assDefAndNotNull(key);

  var hash = this.hasher_(key);
  if (!(hash in this.arr_)) { return false; }
  var arr = this.arr_[hash],
      found = false;
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i] && arr[i].key === key) {
      arr.splice(i, 1);
      if (arr.length === 0) this.arr_.splice(hash, 1);
      this.count_--;
      found = true;
    }
  }
  return found;
};


/** @return {number} The count of this hashtable. */
pn.alg.hashtable.prototype.count = function() { return this.count_; };
