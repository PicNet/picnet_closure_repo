$(document).ready(function() {
  module("picnet.tablefilter.TableFilterTests");  
  $.cookie('testtable_filters', '', { expires: 999 }); // Clear the cookie
  var options = {
    filterDelay: -1, // Instant
    selectOptionLabel: 'Select...',
    additionalFilterTriggers: [$('#onlyyes'), $('#onlyno'), $('#quickfind')],
    clearFiltersControls: [$('#cleanfilters')],
    matchingRow: function(state, tr, textTokens) {                
      if (!state || !state.id) { return true; }          
      var val =  tr.children('td:eq(2)').text();
      var ret;
      switch (state.id) {
        case 'onlyyes': 
          ret = state.value !== true || val === 'yes'; 
          break;
        case 'onlyno': ret = state.value !== true || val === 'no'; break;
        default: ret = true; break;
      }
      return ret;
    }
  };
  var table = $('#testtable');  
  var tf = new picnet.tablefilter.TableFilter(table, options);        
  var headers = table.find('thead tr td');

  function setup() {
    tf.clearAllFilters();
  }

  test("testDemoSetupCorrectly", function() {                   
    setup();
    strictEqual(3, table.find('tbody tr').length);
    strictEqual(4, headers.find('input').length);
    strictEqual(1, headers.find('select').length);
    strictEqual(3, table.find('tbody tr:visible').length);
  });

  test("testNoFilterColumn", function() {         
    setup();
    var headers = table.find('thead tr td');
    // Col 4 and 6 have filter='false'
    strictEqual(0, $(headers[4]).children().length); 
    strictEqual(0, $(headers[6]).children().length);
  });  

  test("testTextColumnFilter", function() {         
    setup();
    var filter = table.find('thead tr td:first input');    
    filter.val('Sydney');
    filter.trigger('keyup');
    var visibletrs = table.find('tbody tr:visible');
    strictEqual(1, visibletrs.length);
    strictEqual('Sydney', visibletrs.find('td:first').text());        
  });  

  test("testSelectOneTableFilter", function() {         
    setup();
    var select = table.find('thead tr td select:first');
    strictEqual(3, select.find('option').length);
    strictEqual('Select...', select.find('option:first').html());
    strictEqual('cold', select.find('option:eq(1)').html());
    strictEqual('hot', select.find('option:eq(2)').html());
  });  

  test("testQuickFindFilter", function() {         
    setup();
    var qf = $('#quickfind');
    qf.val('MelbourNE');
    qf.trigger('keyup');
    var visibletrs = table.find('tbody tr:visible');
    strictEqual(1, visibletrs.length);
    strictEqual('Melbourne', visibletrs.find('td:first').text());        

    qf.val('no filter text');
    qf.trigger('keyup');
    visibletrs = table.find('tbody tr:visible');
    strictEqual(3, visibletrs.length);
  });  

  test("testAdditionalCheckBoxFilter_yes", function() {         
    setup();
    var yes = $('#onlyyes');
    var no = $('#onlyno');
    yes.attr('checked', 'checked');
    yes.trigger('click');

    var visibletrs = table.find('tbody tr:visible');
    strictEqual(1, visibletrs.length);
    strictEqual('Sydney', visibletrs.find('td:first').text());        
  });  

  test("testAdditionalCheckBoxFilter_no", function() {         
    setup();
    var yes = $('#onlyyes');
    var no = $('#onlyno');
    no.attr('checked', 'checked');
    no.trigger('click');

    var visibletrs = table.find('tbody tr:visible');
    strictEqual(2, visibletrs.length);
    strictEqual('MelbourneBrisbane', visibletrs.find('td:first').text());        
  });  

  test("testAdditionalCheckBoxFilter_yes_and_no", function() {         
    setup();
    var yes = $('#onlyyes');
    var no = $('#onlyno');
    no.attr('checked', 'checked');
    yes.attr('checked', 'checked');
    no.trigger('click');

    var visibletrs = table.find('tbody tr:visible');
    strictEqual(0, visibletrs.length);    
  });  

  test("testCleanFilters_yesno_filters", function() {         
    var yes = $('#onlyyes');
    var no = $('#onlyno');
    no.attr('checked', 'checked');
    yes.attr('checked', 'checked');
    no.trigger('click');

    $('#cleanfilters').trigger('click');

    strictEqual(3, table.find('tbody tr:visible').length);  

    var qf = $('#quickfind');
    qf.val('MelbourNE');
    qf.trigger('keyup');
  });  

  test("testCleanFilters_quickfind", function() {         
    var qf = $('#quickfind');
    qf.val('MelbourNE');
    qf.trigger('keyup');

    $('#cleanfilters').trigger('click');

    strictEqual(3, table.find('tbody tr:visible').length);  
  });  
});