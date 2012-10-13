
goog.require('goog.date.DateTime');
goog.require('goog.json');
goog.require('pn');
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
 * @param {boolean=} opt_useDotNetDates If this is true then dates are
 *    serialized as standard .Net /Date(...)/ format. Otherwise the epoch
 *    millis are used.
 */
pn.json.serialiseJson = function(o, opt_useDotNetDates) {
  if (!goog.isDefAndNotNull(o)) return '';
  var replacer = pn.json.replacer_.pnpartial(!!opt_useDotNetDates);
  return goog.json.serialize(o, replacer);
};

/**
 * @private
 * @param {boolean} dotNetDates If this is true then dates are
 *    serialized as standard .Net /Date(...)/ format. Otherwise the epoch
 *    millis are used.
 * @param {string} id The property name being stringified.
 * @param {*} val The value being stringified.
 */
pn.json.replacer_ = function(dotNetDates, id, val) {
  if (val instanceof goog.date.Date ||
      val instanceof goog.date.DateTime || val instanceof Date) {
    return dotNetDates ?
        '\\/Date(' + val.getTime() + ')\\/' :
        val.getTime();
  }
  return val;
};