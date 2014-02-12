;
goog.provide('pn.guid');


/** @return {string} A random number with the appearance of a guid. */
pn.guid.generate = function() {
  var s4 = pn.guid.generate.s4_;
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
};


/** @private @return {string} */
pn.guid.generate.s4_ = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};
