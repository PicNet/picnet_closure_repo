goog.provide('pn.demo.app1.UserSpec');

goog.require('pn.ui.UiSpec');
goog.require('pn.ui.grid.Config');


/** 
 * @constructor
 * @extends {pn.ui.UiSpec}
 */
pn.demo.app1.UserSpec = function() {
  pn.ui.UiSpec.call(this, 'User');
};
goog.inherits(pn.demo.app1.UserSpec, pn.ui.UiSpec);

/** @override */
pn.demo.app1.UserSpec.prototype.getGridConfig = function(cache) {
  var columns = [
    this.createColumn('FirstName', cache),
    this.createColumn('LastName', cache),
    this.createColumn('Phone', cache),
    this.createColumn('DateOfBirth', cache)
  ];  
  return new pn.ui.grid.Config(columns, []);
};
