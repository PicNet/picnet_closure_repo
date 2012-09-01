var testDemoSetupCorrectly = function() {                   
  var headers = table.find('thead tr td');
  assertEquals(3, table.find('tbody tr').length);
  assertEquals(4, headers.find('input').length);
  assertEquals(1, headers.find('select').length);
  assertEquals(3, table.find('tbody tr:visible').length);
};

var testNoFilterColumn = function() {         
  var headers = table.find('thead tr td');
  // Col 4 and 6 have filter='false'
  assertEquals(0, $(headers[4]).children().length); 
  assertEquals(0, $(headers[6]).children().length);
};  

var testSelectOneTableFilter = function() {         
  var select = table.find('thead tr td select:first');
  assertEquals(3, select.find('option').length);
  assertEquals('Select...', select.find('option:first').html());
  assertEquals('cold', select.find('option:eq(1)').html());
  assertEquals('hot', select.find('option:eq(2)').html());
};  