
goog.provide('pn.demo.app1.App1Demo');

goog.require('goog.dom');
goog.require('pn.app.BaseApp');
goog.require('pn.demo.app1.UserSpec');
goog.require('goog.date.DateTime');
goog.require('pn.app.AppEvents');
goog.require('pn.demo.app1.ShowListPage');
goog.require('pn.demo.app1.ShowEditPage');
goog.require('pn.demo.app1.DemoUtils');

/** 
 * @constructor 
 * @extends {pn.app.BaseApp}
 */
pn.demo.app1.App1Demo = function() {
  pn.app.BaseApp.call(this);

  /** @type {!Array.<Object>} */
  this.users = [
    pn.demo.app1.DemoUtils.createUser(),
    pn.demo.app1.DemoUtils.createUser(),
    pn.demo.app1.DemoUtils.createUser()
  ];   
};
goog.inherits(pn.demo.app1.App1Demo, pn.app.BaseApp);
goog.exportSymbol('pn.demo.app1.App1Demo', pn.demo.app1.App1Demo);

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
    'edit': goog.bind(this.edit_, this),
    'add': goog.bind(this.add_, this)
  };
};

/** @override */
pn.demo.app1.App1Demo.prototype.getAppEventHandlers = function() {
  var handlers = {},
      ae = pn.app.AppEvents;
  handlers[ae.ENTITY_SELECT] = goog.bind(function(type, id) { 
    this.router.navigate('edit/' + id);
  }, this)
  handlers[ae.ENTITY_ADD] = goog.bind(function() {    
    this.router.navigate('add');    
  }, this);
  handlers[ae.ENTITY_SAVED] = goog.bind(function() {
    this.msg.showMessage('User Saved');
    this.view.resetDirty();
    this.router.back();
  }, this);
  handlers[ae.ENTITY_CANCEL] = goog.bind(function() {
    this.view.resetDirty();
    this.router.back();
  }, this);
  
  return handlers;
};

/** @private */
pn.demo.app1.App1Demo.prototype.list_ = function() {  
  new pn.demo.app1.ShowListPage();  
};

/** 
 * @private
 * @param {string} id The id of the User to edit.  Since this ID is read
 *    from the query string, it will be a string not a number.
 */
pn.demo.app1.App1Demo.prototype.edit_ = function(id) {
  new pn.demo.app1.ShowEditPage(parseInt(id, 10));  
};

/** @private */
pn.demo.app1.App1Demo.prototype.add_ = function() {
  // Negative IDs are the convention for new entities.
  var id = new Date().getTime() * -1; 
  new pn.demo.app1.ShowEditPage(id);    
};
