var testAdditionalCheckBoxFilter_yes = function() {         
  var yes = $('#onlyyes');
  yes.attr('checked', 'checked');  
  goog.testing.events.fireClickSequence(yes[0]);

  var visibletrs = table.find('tbody tr:visible');
  assertEquals(1, visibletrs.length);
  assertEquals('Sydney', visibletrs.find('td:first').text());        
};  

var testAdditionalCheckBoxFilter_no = function() {         
  var no = $('#onlyno');
  no.attr('checked', true);  
  goog.testing.events.fireClickSequence(no[0]);
  
  var visibletrs = table.find('tbody tr:visible');
  assertEquals(2, visibletrs.length);
  assertEquals('MelbourneBrisbane', visibletrs.find('td:first').text());        
};  

var testAdditionalCheckBoxFilter_yes_and_no = function() {         
  var yes = $('#onlyyes');
  var no = $('#onlyno');
  no.attr('checked', 'checked');
  yes.attr('checked', 'checked');  
  goog.testing.events.fireClickSequence(no[0]);

  var visibletrs = table.find('tbody tr:visible');
  assertEquals(0, visibletrs.length);    
};  

var testCleanFilters_yesno_filters = function() {         
  var yes = $('#onlyyes');
  var no = $('#onlyno');
  no.attr('checked', 'checked');
  yes.attr('checked', 'checked');  
  goog.testing.events.fireClickSequence(no[0]);  
  goog.testing.events.fireClickSequence($('#cleanfilters')[0]);

  assertEquals(3, table.find('tbody tr:visible').length);  

  var qf = $('#quickfind');
  qf.val('MelbourNE');  
  goog.testing.events.fireKeySequence(qf[0], 0);  
};  