
goog.provide('pn.tests.typetest');

goog.provide('pn.tests.typetest.StaticInterface');
goog.provide('pn.tests.typetest.BaseClass');
goog.provide('pn.tests.typetest.Impl');

/**
 * @constructor
 * @param {pn.tests.typetest.StaticInterface} iface
 */
pn.tests.typetest.BaseClass = function(iface) {
  /**
   * @private
   * @type {pn.tests.typetest.StaticInterface}
   */
  this.iface_ = iface;
};


pn.tests.typetest.StaticInterface = {
  staticMember: goog.abstractMethod
};

/**
 * @constructor
 * @extends {pn.tests.typetest.BaseClass}
 */
pn.tests.typetest.Impl = function() {
  pn.tests.typetest.BaseClass.call(this, pn.tests.typetest.Impl);  
};

/** @override */
pn.tests.typetest.Impl.staticMember = function() {
  return 'HERE';
};


