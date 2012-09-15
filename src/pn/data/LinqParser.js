
goog.provide('pn.data.LinqParser');

goog.require('goog.array');
goog.require('goog.asserts');

/**
 * @param {string} expression The text representation of
 *    a Linq expression.
 * @return {function(!Array):!Array} The parsed Linq expression in
 *    the form of a function that filters an array.
 */
pn.data.LinqParser.parse = function(expression) {
  goog.asserts.assert(goog.isString(expression));
  if (!pn.data.LinqParser.isValidExpression_) 
      throw 'Expression is not valid: ' + expression;

  var filters;
  try { 
    filters = goog.array.map(pn.data.LinqParser.compileLinq_(expression), 
        function(js) { return eval(js); }); 
  } catch (ex) { throw 'Expression is not valid: ' + expression; }

  return function(arr) {
    return goog.array.filter(arr, function(x) {
      return goog.array.findIndex(filters, function(exp) {
        return !exp(x);
      }) < 0;
    });
  };
};

/**
 * @private
 * @param {string} expression The expression to check for validity.
 * @return {!Array.<string>} The parsed expressions in valid JS syntax.
 */
pn.data.LinqParser.compileLinq_ = function(expression) {
  goog.asserts.assert(goog.isString(expression));
  if (!pn.data.LinqParser.isValidExpression_(expression)) 
      throw 'Expression is not valid: ' + expression;

  var re1 = /\(([^)]+)\)/g,
      re2 = /([\w]+)\s*=>\s*(.*)/g,
      match,
      match2,
      js = '',
      expressions = [];
  while (match = re1.exec(expression)) {
    match = match[1];
    js = match.
        replace(/==/g, '===').
        replace(/!=/g, '!==');
        while (match2 = re2.exec(js)) {
          var exp = '[function (' + match2[1] + ') { return ' + match2[2] +'; }][0]';
          expressions.push(exp);
        };
  }
  return expressions;
};

/**
 * @private
 * @param {string} expression The expression to check for validity.
 * @return {boolean} Wether the specified expression was a valid Linq query.
 */
pn.data.LinqParser.isValidExpression_ = function(expression) {
  goog.asserts.assert(goog.isString(expression));

  var SUPPORTED_OPERATORS = ['Where'];
  var re = /([A-z]+)\s*\(/g,
      op,
      supported = 0;
  while (op = re.exec(expression)) {
    op = op[1];  
    if (goog.array.indexOf(SUPPORTED_OPERATORS, op) < 0) return false;    
    supported++;
  }
  return supported > 0;
};