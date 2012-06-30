
goog.provide('pn.demo.app1.App1Demo');

goog.require('goog.dom');
goog.require('pn.app.BaseApp');
goog.require('pn.demo.app1.UserSpec');
goog.require('goog.date.Date');

/** 
 * @constructor 
 * @extends {pn.app.BaseApp}
 */
pn.demo.app1.App1Demo = function() {
  pn.app.BaseApp.call(this);


};
goog.inherits(pn.demo.app1.App1Demo, pn.app.BaseApp);
goog.exportSymbol('pn.demo.app1.App1Demo', pn.demo.app1.App1Demo);

/** @override */
pn.demo.app1.App1Demo.prototype.loadSchema = function(schemaLoaded) {
  schemaLoaded([
    {
      'name': 'User',
      'fields': [
        { 'name': 'ID', 'type': 'Int64' },
        { 'name': 'FirstName', 'type': 'String', 'length': 50 },
        { 'name': 'LastName', 'type': 'String', 'length': 50 },
        { 'name': 'Phone', 'type': 'String', 'length': 50 },
        { 'name': 'DateOfBirth', 'type': 'DateTime' }
      ]
    }
  ]);
};

/** @override */
pn.demo.app1.App1Demo.prototype.getUiSpecs = function() {
  return {
    'User': pn.demo.app1.UserSpec
  };
};

/** @override */
pn.demo.app1.App1Demo.prototype.getRoutes = function() {
  return {
    'list': goog.bind(this.list_, this),
    'edit': goog.bind(this.edit_, this)
  };
};

/** @override */
pn.demo.app1.App1Demo.prototype.getAppEventHandlers = function() {
  return {
    'event-name': function() { alert('got event-name'); }
  };
};

/** @private */
pn.demo.app1.App1Demo.prototype.list_ = function() {
  var cache = {};
  var users = [
    {
      'ID': 1,
      'FirstName': 'Guido', 
      'LastName': 'Tapia', 
      'Phone':'1234 1234', 
      'DateOfBirth': new goog.date.Date(1970, 0, 1) 
    }, {
      'ID': 2,
      'FirstName': 'Jon', 
      'LastName': 'Sellers', 
      'Phone':'4567 4567', 
      'DateOfBirth': new goog.date.Date(1980, 0, 1) 
    }, {
      'ID': 3,
      'FirstName': 'Steve', 
      'LastName': 'Miller', 
      'Phone':'9870 9870', 
      'DateOfBirth': new goog.date.Date(1940, 0, 1) 
    }
  ];
  var grid = new pn.ui.grid.Grid(this.specs.get('User'), users, cache);
  this.view.showComponent(grid);

  // Test changing data
  window.setInterval(function() {
    var user = users[Math.floor(Math.random() * users.length)];
    user['Phone'] = Math.floor(Math.random() * 99999999);
    user['DateOfBirth'].setYear(1940 + Math.floor(Math.random() * 70));
  }, 1000);
};

/** 
 * @private
 * @param {number} id The id of the User to edit.
 */
pn.demo.app1.App1Demo.prototype.edit_ = function(id) {
  window.alert('Not supported.');
};
