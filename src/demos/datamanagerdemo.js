
goog.provide('pn.demo.datamanagerdemo');

goog.require('pn.data.DataManager');
goog.require('pn.MockAjaxProvider');
goog.require('pn.data.LocalStorageRepository');

/**
 * @export
 * @suppress {visibility}
 */
pn.demo.datamanagerdemo = function() {
  var type = 'demoEntity';
  var types = [type];  
  var currentId = 1;
  var memrepo = new MockAjaxProvider(types);
  var remoterepo = new MockAjaxProvider.RealServerAjax();
  // TODO: Demo allow selection of options
  // pn.data.DefaultRepositoryFactory.setRepository(rep);
	var data = new pn.data.DataManager(memrepo, types);				
  data.databaseName = 'picnetdemo';
  
  data.init(function() { data.clearEntireDatabase_(function() {
    document.getElementById('currentRepo').innerHTML = 
      data.local_.repository.constructor === pn.data.WebSQLRepository.prototype.constructor ? 'Web SQL' :
      data.local_.repository.constructor === pn.data.GearsRepository.prototype.constructor ? 'Gears' :
      data.local_.repository.constructor === pn.data.IndexedDBRepository.prototype.constructor ? 'IndexedDB' :
      data.local_.repository.constructor === pn.data.LocalStorageRepository.prototype.constructor ? 'localStorage' : 'unknown';
    
    goog.events.listen(document.getElementById('addDatabaseEntry'), 'click', function() {
      var e = {ID: currentId++, Name: 'Name - ' + currentId, Date: new Date()};
      data.saveEntity(type, e, function() {
        alert('Entity saved.  Refresh the table to see changes'); 
      }, this);
    });
    
    var table = document.getElementById('uilist');
    goog.events.listen(document.getElementById('refreshList'), 'click', refreshListLocally, this);
    goog.events.listen(document.getElementById('refreshListFromRemoteProvider'), 'click', refreshListRemotely, this);
    
    function refreshListLocally() { return refreshList(false); }
    function refreshListRemotely() { return refreshList(true); }
    var lastRemoteServer;
    function refreshList(remotely) {
      goog.dom.removeChildren(table);
      
      if (!remotely) return refreshListImpl(data.getEntities(type));
      var remoteServer = document.getElementById('remoteServerUrl').value;            
      if (lastRemoteServer != remoteServer) {        
        if (remoteServer) {
          data.remote_.ajax_ = remoterepo;
          data.remote_.ajax_.url = remoteServer;
        } else {
          data.remote_.ajax_ = memrepo;
        }
      }
      lastRemoteServer = remoteServer;
      
      data.remote_.ajax_.getEntities(type, function(entities) {
        refreshListImpl(entities);
      }, this);
    }
    
    function refreshListImpl(entities) {            
      goog.dom.appendChild(table, goog.dom.createDom('tr', {}, 
        goog.dom.createDom('th', {}),
        goog.dom.createDom('th', {}, 'ID'),
        goog.dom.createDom('th', {}, 'Name'),
        goog.dom.createDom('th', {}, 'Date')
      ));
      goog.array.forEach(entities, function(e) {
        var del;
        goog.dom.appendChild(table, goog.dom.createDom('tr', {}, 
          goog.dom.createDom('td', {}, 
            del = goog.dom.createDom('a', {'href':'#'}, 'Delete')
          ),
          goog.dom.createDom('td', {}, e.ID.toString()),
          goog.dom.createDom('td', {}, e.Name),
          goog.dom.createDom('td', {}, e.Date.toString())
        ));
        goog.events.listen(del, 'click', function() {
          data.deleteEntity(type, e.ID, function() { 
            alert('Entity deleted.  Refresh the table to see changes'); 
          }, this);
        });
      });
    };  
  });});
};

goog.exportSymbol('pn.demo.datamanagerdemo',
    pn.demo.datamanagerdemo);