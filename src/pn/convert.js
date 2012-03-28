
goog.require('goog.asserts');
goog.require('goog.string');

goog.provide('pn.convert');


/**
 * @param {number} cents The cents to display as a dollar/cents string.
 * @return {string} The dollar / cents string.
 */
pn.convert.centsToCurrency = function(cents) {
  goog.asserts.assert(goog.isNumber(cents));
  var actualDollars = Math.floor(cents / 100);
  var actualCents = Math.floor(cents % 100);
  return '$' + actualDollars + '.' + goog.string.padNumber(actualCents, 2);
};

/**
 * @param {string} currency The dollar / cents string.
 * @return {number} The cents value amount.
 */
pn.convert.currencyToCents = function(currency) {
  goog.asserts.assert(goog.isDefAndNotNull(currency));  
  if (goog.isNumber(currency)) return currency;

  if (currency.indexOf('$') === 0) currency = currency.substring(1);
  var cents = parseInt(parseFloat(currency) * 100, 10);
  return cents;
};