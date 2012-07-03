
goog.provide('pn.demo.app1.DemoUtils');

goog.require('goog.date.Date');

/** @type {number} */
pn.demo.app1.DemoUtils.counter = 0;

/** 
 * @return {!Object} The created row item.
 */
pn.demo.app1.DemoUtils.createUser = function() {
  var year = 1940 + Math.floor(Math.random() * 70);
  var id = (++pn.demo.app1.DemoUtils.counter);
  return {
    'ID': id,
    'FirstName': 'Name: ' + id, 
    'LastName': 'Surname: ' + id, 
    'Phone': Math.floor(Math.random() * 99999999), 
    'DateOfBirth': new goog.date.Date(year, 0, 1) 
  };
};
