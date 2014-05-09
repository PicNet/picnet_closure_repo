;
goog.provide('pn.data.Session');

goog.require('pn');
goog.require('pn.json');



/**
 * A simple JSON aware wrapper for sessionStorage. This supports any type and
 *    automatically serialises/deserialises to JSON before/after storing.
 * @constructor
 * @param {string} id The ID of this session storage. Used to partition memory
 *    space to avoid naming conflicts.
 */
pn.data.Session = function(id) {
  pn.assStr(id);

  /** @private @const @type {string} */
  this.id_ = id;
};


/**
 * @param {string} key The key to check
 * @return {boolean} Wether the key exists
 */
pn.data.Session.prototype.contains = function(key) {
  pn.assStr(key);
  return goog.isDef(window.sessionStorage[this.key_(key)]);
};


/**
 * @param {string} key The key to retreive
 * @return {Object} The object stored in the session storage for the given key.
 */
pn.data.Session.prototype.get = function(key) {
  pn.assStr(key);
  return pn.json.parseJson(window.sessionStorage[this.key_(key)]);
};


/**
 * @param {string} key The key to set
 * @param {Object} value The value to set for the given key.
 */
pn.data.Session.prototype.set = function(key, value) {
  pn.assStr(key);

  var json = pn.json.serialiseJson(value);
  window.sessionStorage[this.key_(key)] = json;
};


/** @param {string} key The key to remove */
pn.data.Session.prototype.remove = function(key) {
  pn.assStr(key);
  delete window.sessionStorage[this.key_(key)];
};


/**
 * @private
 * @param {string} key The key suffix
 * @return {string} The key
 */
pn.data.Session.prototype.key_ = function(key) {
  pn.assStr(key);
  return this.id_ + '::' + key;
};
