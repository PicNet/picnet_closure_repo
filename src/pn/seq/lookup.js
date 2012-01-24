
goog.provide('pn.seq2.lookup');
goog.provide('pn.seq2.group');

goog.require('goog.structs.Map');

goog.require('pn.seq');

/**
 * @constructor
 * @extends {pn.seq}
 */
pn.seq2.lookup = function() {
  pn.seq.call(this, []);
  this.map_ = new goog.structs.Map();
};
goog.inherits(pn.seq2.lookup, pn.seq);

pn.seq2.lookup.prototype.containsKey = function(key, opt_comparer) {  
  if (!opt_comparer) return this.map_.containsKey(key);
  var keys = this.map_.getKeys();
  return goog.array.findIndex(keys, function(k) {      
    return opt_comparer(k, key); 
  }) >= 0;
};

pn.seq2.lookup.prototype.getKeys = function() { return this.map_.getKeys(); };

pn.seq2.lookup.prototype.get = function(key, opt_comparer) {  
  key = opt_comparer ? this.getCompatibleKey_(key, opt_comparer) : key;
  return this.map_.get(key);  
};

pn.seq2.lookup.prototype.set = function(key, value, opt_comparer) {  
  key = opt_comparer ? this.getCompatibleKey_(key, opt_comparer) : key;  
  this.map_.set(key, value);  
};

pn.seq2.lookup.prototype.getCompatibleKey_ = function(key, comparer) {
  var keys = this.map_.getKeys();
  var idx = goog.array.findIndex(keys, function(k) {     
    return comparer(k, key); 
  });
  return idx >= 0 ? keys[idx] : key;  
};

pn.seq2.lookup.prototype.collapse = function() {
  var arr = [];
  
  var keys = this.getKeys();  
  for (var i = 0, limit = keys.length; i < limit; i++) {
    var key = keys[i];
    var seq = this.get(key);
    arr.push(new pn.seq2.group(key, seq));
  }
};

/**
 * @constructor
 * @extends {pn.seq}
 */
pn.seq2.group = function(key, seq) {
  pn.seq.call(this, seq.array);
  
  /** @type {*} */
  this.key = key;
};
goog.inherits(pn.seq2.group, pn.seq);