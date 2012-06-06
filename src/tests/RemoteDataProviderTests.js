goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');

goog.require('pn.data.RemoteDataProvider');
goog.require('pn.data.InMemoryRepository');
goog.require('pn.data.AbstractRepository');

var type = 'TestEntity';  
var types = [type];
var data;
var provider;
var asyncTestCase;

var setUpPage = function() {  
  asyncTestCase.stepTimeout = 10000;  
};

var setUp = function() {      
  var ajax;  
  if (!useRealServer) {
    ajax = new pn.MockAjaxProvider(types);
  } else {
    ajax = new pn.MockAjaxProvider.RealServerAjax();
    ajax.url = 'http://127.0.0.1:8124/';              
  }
  provider = new pn.data.RemoteDataProvider(ajax, types);      
}

var testSaveEntities_Empty = function() {
  asyncTestCase.waitForAsync();    
  provider.saveEntities({'TestEntity': []}, function(err) {      
    provider.ajax_.getEntities(type, function(data) {
      assertEquals(0, data.length);
      asyncTestCase.continueTesting();
    }, this);    
  });
};

var testSaveEntities_NotEmpty = function() {
  asyncTestCase.waitForAsync();    
  provider.saveEntities({'TestEntity': [{ID:1,Name:'Data 1'}]}, function() {            
    provider.ajax_.getEntities(type, function(data) {
      assertEquals(1, data.length);
      assertEquals(1, data[0].ID);
      asyncTestCase.continueTesting();
    }, this);    
  });
};

var testGetEntities_Success = function () {
  asyncTestCase.waitForAsync();    
  provider.saveEntities({'TestEntity': [{ID:1,Name:'Data 1'}]}, function() {                    
    provider.ajax_.getEntities(type, function(data) {
      assertEquals(1, data.length);
      assertEquals(1, data[0].ID);
      assertEquals('Data 1', data[0].Name);
      asyncTestCase.continueTesting();
    }, this);   
  });
};  

var testDeleteEntity = function () {    
  asyncTestCase.waitForAsync();    
  provider.saveEntities({'TestEntity': [{ID:1,Name:'Data 1'}]}, function () {
    provider.deleteEntity(type, 1, function() {
      provider.ajax_.getEntities(type, function(entities) {
       console.dir(entities);
        assertEquals(0, entities.length);
        asyncTestCase.continueTesting();
      }, this);      
    });      
  });
};

var testDeleteEntity_2 = function () {    
  asyncTestCase.waitForAsync();    
  provider.saveEntities({'TestEntity': [{ID:1,Name:'Data 1'}, {ID:2,Name:'Data 2'}]}, function (err) {
    provider.deleteEntity(type, 2, function() {
      provider.ajax_.getEntities(type, function(entities) {
        assertEquals(1, entities.length);
        assertEquals(1, entities[0].ID);
        assertEquals('Data 1', entities[0].Name);
        asyncTestCase.continueTesting();
      }, this);      
    });      
  });
};

var testDeleteEntity_NotFound = function () {  
  asyncTestCase.waitForAsync();      
  provider.saveEntities({'TestEntity': [{ID:1,Name:'Data 1'}, {ID:2,Name:'Data 2'}]}, function (saveResults) {
    provider.deleteEntity(type, 3, function() {
      provider.ajax_.getEntities(type, function(entities) {
        assertEquals(2, entities.length);
        assertEquals(1, entities[0].ID);
        assertEquals(2, entities[1].ID);

        asyncTestCase.continueTesting();
      }, this);      
    });      
  });
};

var testSaveEntity_New = function () {  
  asyncTestCase.waitForAsync();      
  provider.saveEntity(type, {ID:1,Name:'Data 1'}, function () {          
    provider.ajax_.getEntities(type, function(entities) {
      assertEquals(1, entities.length);
      assertEquals(1, entities[0].ID);
      assertEquals('Data 1', entities[0].Name);

      asyncTestCase.continueTesting();
    }, this);    
  });
};  


var testSaveEntity_Update = function () {  
  asyncTestCase.waitForAsync();      
  provider.saveEntities({'TestEntity': [{ID:1,Name:'Data 1'}, {ID:2,Name:'Data 2'}]}, function(err) {
    provider.saveEntity(type, {ID:1,Name:'Data 123'}, function (err) {
      provider.ajax_.getEntities(type, function(entities) {
        assertEquals(2, entities.length);
        assertEquals(1, entities[0].ID);
        assertEquals(2, entities[1].ID);
        assertEquals('Data 123', entities[0].Name);
        assertEquals('Data 2', entities[1].Name);

        asyncTestCase.continueTesting();
      }, this);      
    });
  });
};  

var TODO_testUpdateServer = function () {    
  asyncTestCase.waitForAsync();    
  provider.saveEntities({'TestEntity': [{ID:1,Name:'Data 1'}, {ID:2,Name:'Data 2'}]}, function(err) { 
    var tosave = {};
    tosave[type] = [{ID:3,Name:'Data 3'}, {ID:4,Name:'Data 4'}];
    var todelete = {};
    todelete[type] = [1];

    provider.updateServer(tosave, todelete, function (err) {
      provider.ajax_.getEntities(type, function(entities) {
        assertEquals(3, entities.length);
        assertEquals(2, entities[0].ID);
        assertEquals(3, entities[1].ID);
        assertEquals(4, entities[2].ID);
        asyncTestCase.continueTesting();
      }, this);      
    });
  });    
};  

var TODO_testGetChangesSince = function() {
  asyncTestCase.waitForAsync();    
  provider.getChangesSince(-1, function(changes) {
    // Test that the whole database is brought over
    assertTrue('User' in changes);
    var users = changes['User'];
    assertEquals(1, users.length);
    assertTrue(users[0].Email);        
    // TODO: Improve this test
    asyncTestCase.continueTesting();
  });
};