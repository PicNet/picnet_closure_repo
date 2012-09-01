var testQuickFindFilter = function() {         
  var qf = $('#quickfind');
  qf.val('MelbourNE');
  goog.testing.events.fireKeySequence(qf[0], 0);  

  var visibletrs = table.find('tbody tr:visible');  
  assertEquals(1, visibletrs.length);
  assertEquals('Melbourne', visibletrs.find('td:first').text());        

  qf.val('');
  goog.testing.events.fireKeySequence(qf[0], 0);  
  visibletrs = table.find('tbody tr:visible');  
  assertEquals(3, visibletrs.length);
};  

var testQuickFindFilterWithNumericalExpression = function() {         
  var qf = $('#quickfind');
  qf.val('> 1');
  goog.testing.events.fireKeySequence(qf[0], 0);  

  var visibletrs = table.find('tbody tr:visible');  
  assertEquals(2, visibletrs.length);  
};  

var testCleanFilters_quickfind = function() {         
  var qf = $('#quickfind');
  qf.val('MelbourNE');
  goog.testing.events.fireKeySequence(qf[0], 0);  

  goog.testing.events.fireClickSequence($('#cleanfilters')[0]);

  assertEquals(3, table.find('tbody tr:visible').length);  
};  