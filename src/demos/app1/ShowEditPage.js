
goog.provide('pn.demo.app1.ShowEditPage');

goog.require('goog.array');
goog.require('pn.ui.edit.Edit');
goog.require('pn.data.BaseDalCache');

/**
 * @constructor 
 * @param {number} id The ID of the user to show.
 */
pn.demo.app1.ShowEditPage = function(id) {
  var spec = pn.app.ctx.specs.get('User');
  var users = pn.app.ctx.users;
  var user = id <= 0 ? 
      new pn.data.Entity('User', id) : 
      users.pnfind(function(u) { return u.id === id; });

  var edit = new pn.ui.edit.Edit(spec, user, new pn.data.BaseDalCache({}));
  pn.app.ctx.view.showComponent(edit);
};
