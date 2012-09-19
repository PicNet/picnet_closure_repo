
goog.require('goog.date.DateTime');
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

  if (!window['pn.date.fromMillis'])
    window['pn.date.fromMillis'] = pn.date.fromMillis;

  var jsonDateSafe = json.replace(regex, 'window["pn.date.fromMillis"]($1)');
  return goog.json.unsafeParse(jsonDateSafe);
};


/**
 * @param {Object} o The object to serialise to JSON.
 * @return {string} The string (json) representation of the specified object.
 */
pn.json.serialiseJson = function(o) {
  if (!goog.isDefAndNotNull(o)) return '';
  return goog.json.serialize(o, function(id, val) {
    if (val instanceof goog.date.Date ||
        val instanceof goog.date.DateTime || val instanceof Date) {
      return '\\/Date(' + val.getTime() + ')\\/';
    }
    return val;
  });
};
