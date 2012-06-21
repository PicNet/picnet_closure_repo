
goog.require('goog.json');
goog.require('pn.date');

goog.provide('pn.json');


/**
 * @param {string} json The json string to parse.
 * @return {Object|string} The parsed object.
 */
pn.json.parseJson = function(json) {
  if (!json || typeof(json) !== 'string') return json;
  var regex = /\"[\\]+\/Date\((-?\d+(\+\d+)?)\)[\\]+\/\"/g;
  var jsonDateSafe = json.replace(regex, 'pn.date.fromMillis($1)');

  return goog.json.unsafeParse(jsonDateSafe);
};


/**
 * @param {Object} o The object to serialise to JSON.
 * @return {string} The string (json) representation of the specified object.
 */
pn.json.serialiseJson = function(o) {
  return goog.isDefAndNotNull(o) ? window['JSON']['stringify'](o) : '';
};


/**
 * @return {string} The date's json string.
 * @this {Date}
 */
Date.prototype['toJSON'] = function() {
  return '\\/Date(' + this.getTime() + ')\\/';
};
