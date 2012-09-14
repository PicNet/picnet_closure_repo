
goog.provide('pn.demo.app1.DemoUtils');

goog.require('goog.date.DateTime');
goog.require('goog.object');

/** @type {number} */
pn.demo.app1.DemoUtils.counter = 0;

/** 
 * @return {!pn.data.Entity} The created row item.
 */
pn.demo.app1.DemoUtils.createUser = function() {
  var year = 1940 + Math.floor(Math.random() * 70);
  var id = (++pn.demo.app1.DemoUtils.counter);
  var entity = new pn.data.Entity('User', id);
  goog.object.extend(entity, {
    'ID': id,
    'FirstName': 'Name: ' + id, 
    'LastName': 'Surname: ' + id, 
    'Phone': Math.floor(Math.random() * 99999999), 
    'DateOfBirth': new goog.date.DateTime(year, 0, 1) 
  });
  return entity;
};
