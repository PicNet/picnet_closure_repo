
goog.require('goog.asserts');
goog.require('goog.string');

goog.provide('pn.convert');


/**
 * @param {number} cents The cents to display as a dollar/cents string.
 * @return {string} The dollar / cents string.
 */
pn.convert.centsToDisplayString = function(cents) {
  goog.asserts.assert(goog.isNumber(cents));
  var actualDollars = Math.floor(cents / 100);
  var actualCents = Math.floor(cents % 100);
  return '$' + actualDollars + '.' + goog.string.padNumber(actualCents, 2);
};

