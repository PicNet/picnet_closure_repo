
var testDynamicallyAddingRowsThenRefresh = function() {   
  var filter = table.find('thead tr td:first input');    
  filter.val('text');
  goog.testing.events.fireKeySequence(filter[0], 0);  
  var visibletrs = table.find('tbody tr:visible');
  assertEquals(0, visibletrs.length);
  
  addAdditionalRows();

  tf.resetList(table[0]);
  
  visibletrs = table.find('tbody tr:visible');
  assertEquals(3, visibletrs.length);
};

var testRemovingLastRowAndRefresh = function() {
  table.find('tr:last').remove();
  tf.resetList(table[0]);
};

var addAdditionalRows = function() {
  var c = goog.dom.createDom;
  var cr = function(text) {
    return c('tr', {}, 
      c('td', {}, text), 
      c('td', {}, '1'), 
      c('td', {}, 'yes'), 
      c('td', {}, 'cold'), 
      c('td', {}, 'no filter text'), 
      c('td', {}, '01/01/2000'), 
      c('td', {}, ''));
  };
  var rows = [
    cr('text 1'),
    cr('text 2'),
    cr('text 3')
  ];
  goog.dom.append(table[0], rows);  
};