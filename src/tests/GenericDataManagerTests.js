;
goog.require('goog.array');
goog.require('goog.debug.Console');
goog.require('pn.MockAjaxProvider');
goog.require('pn.data.AbstractRepository');
goog.require('pn.data.DataManager');
goog.require('pn.data.DefaultRepositoryFactory');
goog.require('pn.data.IndexedDBRepository');
goog.require('pn.data.LocalStorageRepository');
goog.require('pn.data.WebSQLRepository');


// TODO

var type = 'TestEntity';
var types = [type, 'Parent', 'Child'];
var data;
var log;
var rep;

var setUpPage = function() {  
  log = goog.debug.Logger.getLogger('GenericDataManagerTests');
  log.setLevel(goog.debug.Logger.Level.FINEST);
  new goog.debug.Console().setCapturing(true);

  rep = new pn.data[repname]('unittestdb2');
};

var preTest = function(test) {
  if (!rep.isSupported()) {
    log.fine('Repository ' + repname + ' is not suppored in the current browser.  Skipping test');
    return;
  }

  asyncTestCase.stepTimeout = 10000;
  asyncTestCase.waitForAsync();
  if (!data) {
    pn.data.DefaultRepositoryFactory.setRepository(rep);
    data = new pn.data.DataManager(new pn.MockAjaxProvider(types), types);
    data.databaseName = 'unittestdb';
    data.init(function() { data.clearEntireDatabase_(test, this); }, this);
  } else {
    data.remote_.ajax_.memory.db_ = {};
    data.clearEntireDatabase_(test, this);
  }
};

var testSaveEntityRemoteUpdatesLocal = function() {
  preTest(function() {
    data.saveEntity(type, {ID: 1, Name: 'Name 1'}, function() {
      data.local_.repository.getList(type, function(data) {
        assertEquals(1, data.length);
        assertEquals(1, data[0].ID);
        assertEquals('Name 1', data[0].Name);
        asyncTestCase.continueTesting();
      });
    });
  });
};

var testDeleteEntityRemoteUpdatesLocal = function() {
  preTest(function() {
    data.saveEntity(type, {ID: 1, Name: 'Name 1'}, function() {
      data.deleteEntity(type, 1, function() {
        data.local_.repository.getList(type, function(d) {
          assertEquals(0, d.length);
          assertTrue(!localStorage['Unsaved_' + type]);
          assertTrue(!localStorage['Deleted_' + type]);
          asyncTestCase.continueTesting();
        });
      });
    });
  });
};

var testGetEntitiesRemoteDataUpdatesLocal = function() {  
  preTest(function() {    
    var entities = {'TestEntity': [{ID: 1, Name: 'Name 1'}, {ID: 2, Name: 'Name 2'}]};
    data.saveEntities(entities, function(err) {
      var d1 = data.remote_.ajax_.getEntities(type);
      assertEquals(2, d1.length);
      var d2 = data.local_.repository.getList(type, function(d2) {
        assertEquals('Remote ID of first', 1, d1[0].ID);
        assertEquals('Name 1', d1[0].Name);
        assertEquals('Remote ID of second', 2, d1[1].ID);
        assertEquals('Name 2', d1[1].Name);

        assertEquals(2, d2.length);
        assertEquals('Local ID of first', 1, d2[0].ID);
        assertEquals('Name 1', d2[0].Name);
        assertEquals('Local ID of second', 2, d2[1].ID);
        assertEquals('Name 2', d2[1].Name);

        asyncTestCase.continueTesting();
      });
    });
  });
};

var testUpdateServerWithLocalChanges = function() {
  preTest(function() {
    data.local_.saveEntity(type, {ID: 1, Name: 'Name 1'}, function() {
      data.local_.saveUnsavedEntity(type, {ID: 1, Name: 'Name 1'}, function() {
        data.local_.saveEntity(type, {ID: 2, Name: 'Name 2'}, function() {
          data.local_.saveUnsavedEntity(type, {ID: 2, Name: 'Name 2'}, function() {
            var d1 = data.remote_.ajax_.getEntities(type);
            assertEquals(0, d1.length);
            data.updateServerWithLocalChanges(function() {
              var d2 = data.remote_.ajax_.getEntities(type);
              assertEquals(2, d2.length);
              assertEquals(1, d2[0].ID);
              assertEquals('Name 1', d2[0].Name);
              assertEquals(2, d2[1].ID);
              assertEquals('Name 2', d2[1].Name);

              asyncTestCase.continueTesting();
            });
          });
        });
      });
    });
  });
};

var testUpdateServerWithLocalNewEntities = function() {
  preTest(function() {
    var e1 = {ID: -1, Name: 'Name 1'};
    var e2 = {ID: -2, Name: 'Name 2'};
    data.local_.saveEntity(type, e1, function() {
      data.local_.saveUnsavedEntity(type, e1, function() {
        data.local_.saveEntity(type, e2, function() {
          data.local_.saveUnsavedEntity(type, e2, function() {
            var d1 = data.remote_.ajax_.getEntities(type);

            assertEquals(0, d1.length);
            data.updateServerWithLocalChanges(function() {
              var d2 = data.remote_.ajax_.getEntities(type);
              assertEquals(2, d2.length);

              assertTrue(goog.array.findIndex(d2, function(e) { return e.Name === 'Name 1'; }) >= 0);
              assertTrue(goog.array.findIndex(d2, function(e) { return e.Name === 'Name 2'; }) >= 0);
              assertTrue(d2[0].ID > 0);
              assertTrue(d2[1].ID > 0);

              asyncTestCase.continueTesting();
            });
          });
        });
      });
    });
  });
};

var testUpdateServerWithLocalNewCascadingEntities = function() {
  preTest(function() {
    var parent = {ID: -1, Name: 'Parent'};
    var child = {ID: -2, Name: 'Child', ParentID: -1};
    data.local_.saveEntity('Parent', parent, function() {
      data.local_.saveUnsavedEntity('Parent', parent, function() {
        data.local_.saveEntity('Child', child, function() {
          data.local_.saveUnsavedEntity('Child', child, function() {
            assertEquals(0, data.remote_.ajax_.getEntities(type).length);

            data.updateServerWithLocalChanges(function() {
              var parents = data.remote_.ajax_.getEntities('Parent');
              assertEquals(1, parents.length);
              var actParent = parents[0];
              assertTrue(actParent.ID > 0);
              assertEquals('Parent', actParent.Name);
              var children = data.remote_.ajax_.getEntities('Child');
              assertEquals(1, children.length);
              var actChild = children[0];
              assertTrue(actChild.ID > 0);
              assertEquals('Child', actChild.Name);
              // This does not getupdated until DataManager calls: remote.getChangesSince
              // assertEquals(actParent.ID, actChild.ParentID);

              asyncTestCase.continueTesting();
            });
          });
        });
      });
    });
  });
};

var testUpdateServerWithDeletedEntities = function() {
  preTest(function() {
    data.saveEntity(type, {ID: 1, Name: 'Name 1'}, function() {
      data.saveEntity(type, {ID: 2, Name: 'Name 2'}, function() {
        data.local_.deleteEntity(type, 1, function() {
          data.local_.saveDeletedEntity(type, 1, function() {
            var d1 = data.remote_.ajax_.getEntities(type);
            assertEquals('1) length', 2, d1.length);
            assertEquals('1) ID1', 1, d1[0].ID);
            assertEquals('1) ID2', 2, d1[1].ID);

            data.updateServerWithLocalChanges(function() {
              var d2 = data.remote_.ajax_.getEntities(type);
              assertEquals('2) length', 1, d2.length);
              assertEquals('2) ID1', 2, d2[0].ID);
              asyncTestCase.continueTesting();
            });
          });
        });
      });
    });
  });
};

var TODO_testSynchronize = function() {
  preTest(function() {
    // TODO: Implement
    asyncTestCase.continueTesting();
  });
};

var TODO_testUpdateClientWithLatestServerChanges = function() {
  preTest(function() {
    // TODO: Implement
    asyncTestCase.continueTesting();
  });
};

var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();
