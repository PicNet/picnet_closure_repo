
goog.provide('picnet.closure.repo.demoscripts');

goog.require('picnet.ui.DateRangePicker');
goog.require('picnet.ui.TabSlideMenu');
goog.require('picnet.ui.TabSlideMenuSettings');
goog.require('picnet.data.DataManager');
goog.require('picnet.MockAjaxProvider');
goog.require('picnet.data.LocalStorageRepository');

/**
 * @export
 */
picnet.closure.repo.demoscripts.daterangepicker = function() {
  var drp = new picnet.ui.DateRangePicker();
  drp.setFirstWeekday(0);
  drp.setAllowedDateRange(new Date(2010, 1, 1), new Date(2011, 1, 1));
  drp.render(document.getElementById('range_picker'));

  goog.events.listen(drp, 'change', updateLog);
  updateLog();

  function updateLog() {
    var desc = 'Event Received[' + new Date().getTime() + '] ';
    var from = drp.getDateRangeFrom();
    var to = drp.getDateRangeTo();

    desc += 'Start[' + (from ? from.toIsoString(true) : 'n/a') +
        '] End[' + (to ? to.toIsoString(true) : 'n/a') + ']';
    goog.dom.setTextContent(document.getElementById('picker_log'), desc);
  };
};
goog.exportSymbol('picnet.closure.repo.demoscripts.daterangepicker',
    picnet.closure.repo.demoscripts.daterangepicker);


/**
 * @export
 */
picnet.closure.repo.demoscripts.tabslidemenu = function() {
  var opts = new picnet.ui.TabSlideMenuSettings();
  opts.tabHandle = goog.dom.getElement('panel1_handle');
  opts.pathToTabImage = 'images/window_left_tab.png';
  opts.imageHeight = 153;
  opts.imageWidth = 19;
  opts.tabLocation = 'left';
  opts.speed = 150;
  opts.action = 'click';
  opts.topPos = 100;
  opts.fixedPosition = false;
  opts.onLoadSlideOut = true;
  new picnet.ui.TabSlideMenu(goog.dom.getElement('panel1'), opts);

  opts.tabHandle = goog.dom.getElement('panel2_handle');
  opts.pathToTabImage = 'images/window_right_tab.png';
  opts.imageHeight = 102;
  opts.imageWidth = 18;
  opts.tabLocation = 'right';
  new picnet.ui.TabSlideMenu(goog.dom.getElement('panel2'), opts);
};
goog.exportSymbol('picnet.closure.repo.demoscripts.tabslidemenu',
    picnet.closure.repo.demoscripts.tabslidemenu);

    
/**
 * @export
 * @suppress {visibility}
 */
picnet.closure.repo.demoscripts.datamanager = function() {
  var type = 'TestEntity';
  var types = [type];  
  var currentId = 1;
  var memrepo = new MockAjaxProvider(types);
  var remoterepo = new MockAjaxProvider.RealServerAjax();
  // TODO: Demo allow selection of options
  // picnet.data.DefaultRepositoryFactory.setRepository(rep);
	var data = new picnet.data.DataManager(memrepo, types);				
  data.databaseName = 'picnetdemo';
  
  data.init(function() { data.clearEntireDatabase_(function() {
    document.getElementById('currentRepo').innerHTML = 
      data.local_.repository.constructor === picnet.data.WebSQLRepository.prototype.constructor ? 'Web SQL' :
      data.local_.repository.constructor === picnet.data.GearsRepository.prototype.constructor ? 'Gears' :
      data.local_.repository.constructor === picnet.data.IndexedDBRepository.prototype.constructor ? 'IndexedDB' :
      data.local_.repository.constructor === picnet.data.LocalStorageRepository.prototype.constructor ? 'localStorage' : 'unknown';
    
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
          goog.dom.createDom('td', {}, e.Date.toLocaleDateString())
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

goog.exportSymbol('picnet.closure.repo.demoscripts.datamanager',
    picnet.closure.repo.demoscripts.datamanager);