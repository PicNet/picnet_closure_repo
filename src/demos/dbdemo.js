var db;
moz_indexedDB.open('MydemoDatabase', 'MydemoDatabase').onsuccess = function(event) {
  db = event.result;

  // If the database is at the correct version then we can skip straight to using it.
  if (db.version == '1.0') {
    useDatabase(db);
    return;
  }

  // Otherwise we need to change the version.
  var request = db.setVersion('1.0');
  request.onblocked = function(event) {
    // If some other tab is loaded with the database, then it needs to be closed
    // before we can proceed.
    alert('Please close all other tabs with this site open!');
  };
  request.onsuccess = function(event) {
    // All other databases have been closed. Set everything up.
    db.createObjectStore(/* ... */);
    useDatabase(db);
  };
};

function useDatabase(db) {
  // Make sure to add a handler to be notified if another page requests a version
  // change. We must close the database.
  db.onversionchange = function(event) {
    db.close();
    alert('A new version of this page is ready. Please reload!');
  };
  var os = db.createObjectStore('demo', 'ID');
  // Do stuff with the database.
}
