var testTextColumnFilter = function() {         
  var filter = table.find('thead tr td:first input');    
  filter.val('Sydney');
  goog.testing.events.fireKeySequence(filter[0], 0);  

  var visibletrs = table.find('tbody tr:visible');
  assertEquals(1, visibletrs.length);
  assertEquals('Sydney', visibletrs.find('td:first').text());        
};  

var testTextColumnFilterWithQuotes = function() {         
  var filter = table.find('thead tr td:first input');    
  filter.val('s y');
  goog.testing.events.fireKeySequence(filter[0], 0);  

  var visibletrs = table.find('tbody tr:visible');
  assertEquals(1, visibletrs.length);
  assertEquals('Sydney', visibletrs.find('td:first').text());        

  filter.val('"s y"');
  goog.testing.events.fireKeySequence(filter[0], 0);  

  visibletrs = table.find('tbody tr:visible');
  assertEquals(0, visibletrs.length);
};  