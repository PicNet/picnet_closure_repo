
goog.provide('pn.demo.app1.ShowEditPage');

goog.require('goog.array');
goog.require('pn.ui.edit.Edit');

/**
 * @constructor 
 * @param {number} id The ID of the user to show.
 */
pn.demo.app1.ShowEditPage = function(id) {
  var spec = pn.app.ctx.specs.get('User');
  var users = pn.app.ctx.users;
  var user = id <= 0 ? { 'ID': id } : /** @type {!Object} */ (
      goog.array.find(users, function(u) { return u['ID'] === id; }));
  var edit = new pn.ui.edit.Edit(spec, user, {});
  pn.app.ctx.view.showComponent(edit);
};
