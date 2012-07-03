
goog.provide('pn.demo.app1.ShowListPage');

goog.require('pn.demo.app1.DemoUtils');
goog.require('pn.ui.grid.Grid');
goog.require('pn.app.AppEvents');

/** @constructor */
pn.demo.app1.ShowListPage = function() {  
  var spec = pn.app.ctx.specs.get('User');
  var grid = new pn.ui.grid.Grid(spec, pn.app.ctx.users, {});
  pn.app.ctx.view.showComponent(grid);

  // Test changing data
  // window.setInterval(goog.bind(this.doDataUpdate_, this), 1000);
};

/** @private */
pn.demo.app1.ShowListPage.prototype.doDataUpdate_ = function() {    
  if (Math.random() < 0.4) {
    var id = pn.app.ctx.users.length + 100;    
    pn.app.ctx.pub(pn.app.AppEvents.SHOW_MESSAGE, 'ADDING')    
    pn.app.ctx.users.push(pn.demo.app1.DemoUtils.createUser());
  } else if (pn.app.ctx.users.length && Math.random() < 0.3) {
     pn.app.ctx.pub(pn.app.AppEvents.SHOW_MESSAGE, 'REMOVING')
     var idx = Math.floor(Math.random() * pn.app.ctx.users.length);
     pn.app.ctx.users.splice(idx, 1);
  } else {
    pn.app.ctx.pub(pn.app.AppEvents.SHOW_MESSAGE, 'UPDATING')
    var idx = Math.floor(Math.random() * pn.app.ctx.users.length);
    var user = pn.app.ctx.users[idx];
    user['Phone'] = Math.floor(Math.random() * 99999999);
    user['DateOfBirth'].setYear(1940 + Math.floor(Math.random() * 70));
  }
};
