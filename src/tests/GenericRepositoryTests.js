
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Console');

goog.require('pn.MockAjaxProvider');      
goog.require("pn.data.AbstractRepository")
goog.require('pn.data.LocalStorageRepository');
goog.require('pn.data.WebSQLRepository');
goog.require('pn.data.GearsRepository');
goog.require('pn.data.IndexedDBRepository');

var type = 'TestEntity';		
var log;
var rep;

var setUpPage = function () {
    log = goog.debug.Logger.getLogger('GenericRepositoryTests');
    log.setLevel(goog.debug.Logger.Level.FINEST);
    new goog.debug.Console().setCapturing(true);     

    rep = new pn.data[repname]('testgendb');
    var types = [type, type + '2', '3' + type];	
    rep.types = types;
}	

function preTest(test) {
  if (!rep.isSupported()) {
      log.fine('Repository ' + repname + ' is not suppored in the current browser.  Skipping test');
      return;
  }
  asyncTestCase.stepTimeout = 5000;
	asyncTestCase.waitForAsync();    

  rep.init(rep.types, function() { 
    rep.clearEntireDatabase(test, this)    
  }, this);
}

function preTest2(test) { 
	rep.deleteList(type, function() { 
    rep.deleteList(type + '2', function() {
      test();
    }, this);	
  }, this); 
}

var testGetList = function() {			
	preTest(function() {    
		var exp = [{ID:1,Name:'Name 1',DateVal:new Date()}];        
    var exptime = exp[0].DateVal.getTime();    
		rep.saveList(type, exp, function() {				
			rep.getList(type, function(arr) {				        
				assertEquals(1, arr.length);
				assertEquals(1, arr[0].ID);
				assertEquals('Name 1', arr[0].Name);                
        assertEquals(exptime, arr[0].DateVal.getTime());
        asyncTestCase.continueTesting();
			});		
		});
	});
};

var testGetItem = function() {
	preTest(function() {
		var exp = [{ID:1,Name:'Name 1'}, {ID:2,Name:'Name 2'}, {ID:3,Name:'Name 3'}, {ID:4,Name:'Name 4'}];
		rep.saveList(type, exp, function() {
			rep.getItem(type, 3, function(item) {				
				assertEquals(3, item.ID);
				assertEquals('Name 3', item.Name);
        asyncTestCase.continueTesting();
			});		
		});
	});
};

var testDeleteItem = function() {
	preTest(function() {
		var exp = [{ID:1,Name:'Name 1'}, {ID:2,Name:'Name 2'}, {ID:3,Name:'Name 3'}, {ID:4,Name:'Name 4'}];
		rep.saveList(type, exp, function() {    
			rep.deleteItem(type, 3, function(result) {      
				assertEquals(true, result);
				rep.getList(type, function (arr) {					
					assertEquals(3, arr.length);
					for (var i = 0, e; e = arr[i++]; ) {
						assertNotEquals(3, e.ID);
					}
                    asyncTestCase.continueTesting();
				});			
			});		
		});
	});
};
			
var testDeleteListNoPrefix = function() {
	preTest(function() {
		var exp = [{ID:1,Name:'Name 1'}, {ID:2,Name:'Name 2'}, {ID:3,Name:'Name 3'}, {ID:4,Name:'Name 4'}];
		rep.saveList(type, exp, function() {
			rep.saveList(type + '2', exp, function() {
				rep.deleteList(type, function (result) {
					rep.getList(type, function(arr) {
						assertEquals(0, arr.length);
						rep.getList(type + '2', function (arr2) {							
							assertEquals(4, arr2.length);		
                            asyncTestCase.continueTesting();
						});				
					});			
				});		
			})
		});
	});
};		

var testDeleteItems = function() {
	preTest(function() {
		var exp = [{ID:1,Name:'Name 1'}, {ID:2,Name:'Name 2'}, {ID:3,Name:'Name 3'}, {ID:4,Name:'Name 4'}];
		rep.saveList(type, exp, function() {
			rep.deleteItems(type, [3, 4], function(result) {
				assertEquals(true, result);
				rep.getList(type, function (arr) {					
					assertEquals(2, arr.length);
					for (var i = 0, e; e = arr[i++]; ) {
						assertNotEquals(3, e.ID);
						assertNotEquals(4, e.ID);
					}
                    asyncTestCase.continueTesting();
				});			
			});		
		});
	});
};
	
var testGetLists = function() {  
	preTest(function() {				                
		var exp = [{ID:1,Name:'Name 1'}, {ID:2,Name:'Name 2'}, {ID:3,Name:'Name 3'}, {ID:4,Name:'Name 4'}];
		rep.saveList(type, exp, function() {                
			rep.saveList(type + '2', exp, function() {                    
				rep.saveList('3' + type, exp, function() {		                                  
					rep.getLists(type, function (dict) {						          
						assertTrue(type in dict);
						assertTrue(type + '2' in dict);
						assertFalse('3' + type in dict);
            asyncTestCase.continueTesting();
					});		
				});
			});
		});
	});
};

var testSaveList = function() {
	preTest(function() {
		rep.deleteList(type, function() {
			var exp = [{ID:1,Name:'Name 1'}, {ID:2,Name:'Name 2'}, {ID:3,Name:'Name 3'}, {ID:4,Name:'Name 4'}];      
			rep.saveList(type, exp, function (result) {        
				assertEquals(true, result);
				rep.getList(type, function(actual) {					
					assertEquals(4, actual.length);
					for (var i = 0; i < 4; i++) {            
						assertEquals(exp[i].ID, actual[i].ID);
						assertEquals(exp[i].Name, actual[i].Name);
					}
          asyncTestCase.continueTesting();
				});				
			});		
		});	
	});	
};

		
var testSaveItem_Existing = function() {
  window.onerror = function (){};
	preTest(function() {
		var exp = [{ID:1,Name:'Name 1'}, {ID:2,Name:'Name 2'}, {ID:3,Name:'Name 3'}, {ID:4,Name:'Name 4'}];
		rep.saveList(type, exp, function (result) {      
			rep.saveItem(type, {ID:3,Name:'Name 3.1'}, function (result) {        
				assertEquals(true, result);
				rep.getList(type, function (list) {
					assertEquals(4, list.length);
					rep.getItem(type, 3, function(item) {						
						assertEquals('Name 3.1', item.Name);
            asyncTestCase.continueTesting();
					});				
				});			
			});		
		});
	});
};
		
var testSaveItem_New = function() {
	preTest(function() {
		var exp = [{ID:1,Name:'Name 1'}, {ID:2,Name:'Name 2'}, {ID:3,Name:'Name 3'}, {ID:4,Name:'Name 4'}];
		rep.saveList(type, exp, function (result) {
			rep.saveItem(type, {ID:5,Name:'Name 5'}, function (result) {
				assertEquals(true, result);
				rep.getList(type, function (list) {
					assertEquals(5, list.length);
					rep.getItem(type, 5, function (item) {						
						assertEquals(5, item.ID);
						assertEquals('Name 5', item.Name);
                        asyncTestCase.continueTesting();
					});				
				});			
			});		
		});
	});
};		

var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();