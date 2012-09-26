
goog.require('goog.asserts');
goog.require('goog.net.cookies');

goog.provide('pn.storage');


/**
 * @param {string} id The ID of the item to retreive from local storage.
 * @return {string} The value from storage.
 */
pn.storage.get = function(id) {
  pn.ass(id && goog.isString(id));
  var ls = window['localStorage'];
  return ls ? ls[id] : goog.net.cookies.get(id);
};


/**
 * @param {string} id The ID of the item to store in local storage.
 * @param {string} value The value of the item to store in local storage.
 */
pn.storage.set = function(id, value) {
  pn.ass(id && goog.isString(id));
  pn.ass(goog.isString(value));

  var ls = window['localStorage'];
  if (ls) ls[id] = value;
  else goog.net.cookies.set(id, value);
};


/**
 * Clear the current site local storage.
 */
pn.storage.clear = function() {
  pn.ass(goog.isDef(window['localStorage']));
  for (var key in window['localStorage']) {
    delete window['localStorage'][key];
  }
};
