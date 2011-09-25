goog.require('goog.array');

goog.require('pn.Utils');
goog.require('pn.data.AbstractSQLRepository');

goog.provide('pn.data.GearsRepository');



/**
 * @constructor
 * @extends {pn.data.AbstractSQLRepository}
 * @param {string} databaseName The name of the database to open or create.
 */
pn.data.GearsRepository = function(databaseName) {
  pn.data.AbstractSQLRepository.call(this, databaseName);
  this.log.fine('using the pn.data.GearsRepository');
};
goog.inherits(pn.data.GearsRepository, pn.data.AbstractSQLRepository);


/**
 * @const
 * @type {string}
 */
pn.data.GearsRepository.GOOGLE_GEARS_SUPPORT_URL =
    'http://gears.google.com/?action=install&message=Welcome. You need to' +
    ' install Google Gears to use this application.';


/**
 * @private
 * @type {Object}
 */
pn.data.GearsRepository.prototype.db_;


/** @inheritDoc */
pn.data.GearsRepository.prototype.isSupported = function() {
  return typeof (google) !== 'undefined' &&
      typeof (google.gears) !== 'undefined';
};


/** @inheritDoc */
pn.data.GearsRepository.prototype.db = function() {
  if (this.db_) { return this.db_; }
  this.db_ = google.gears.factory.create('beta.database');
  this.db_.open(this.databaseName);
  return this.db_;
};


/** @inheritDoc */
pn.data.GearsRepository.prototype.init =
    function(types, callback, opt_handler) {
  var start = new Date().getTime();
  this.types = types;
  this.isInitialised(function(isInitialised) {
    if (isInitialised) return callback.call(opt_handler || this);
    this.db().execute('BEGIN');

    goog.array.forEach(this.types, function(t) {
      this.db().execute('CREATE TABLE IF NOT EXISTS [' + t + '] ' +
          '(ID INTEGER UNIQUE PRIMARY KEY, value TEXT)');
    }, this);
    this.db().execute('CREATE TABLE IF NOT EXISTS [UnsavedEntities] ' +
        '([TYPE] VARCHAR(50), ID INTEGER, value TEXT)');
    this.db().execute('CREATE TABLE IF NOT EXISTS [DeletedIDs] ' +
        '([TYPE] VARCHAR(50), ID INTEGER, value INTEGER)');
    this.db().execute('COMMIT');

    this.log.fine('init took: ' + (new Date().getTime() - start) + 'ms');
    callback.call(opt_handler || this);
  }, this);
};


/** @inheritDoc */
pn.data.GearsRepository.prototype.saveList =
    function(type, list, callback, opt_handler) {
  var typepos = type.indexOf('|');
  this.db().execute('BEGIN');
  goog.array.forEach(list, function(item) {
    var itemid = (typeof(item) === 'number' ? item : item.ID);
    var itemstr = (typeof(item) !== 'number' ?
        pn.Utils.serialiseJson(this.makeDateSafe(item)) : item);

    this.db().execute(typepos !== -1 ?
        'INSERT OR REPLACE INTO [' + type.substring(0, typepos) +
        '] (ID, TYPE, value) VALUES(?, \'' + type.substring(typepos + 1) +
        '\', ?)' :
        'INSERT OR REPLACE INTO [' + type + '] (ID, value) VALUES(?, ?)',
        [itemid, itemstr]);
  }, this);
  this.db().execute('COMMIT');
  callback.call(opt_handler || this, true);
};


/** @inheritDoc */
pn.data.GearsRepository.prototype.clearEntireDatabase =
    function(callback, opt_handler) {
  this.db().execute('BEGIN');
  goog.array.forEach(this.types, function(t) {
    this.db().execute('DELETE FROM [' + t + ']', []);
  }, this);
  this.db().execute('DELETE FROM [UnsavedEntities]');
  this.db().execute('DELETE FROM [DeletedIDs]');
  this.db().execute('COMMIT');
  callback.call(opt_handler || this);
};


/** @inheritDoc */
pn.data.GearsRepository.prototype.execute =
    function(sql, args, successCallback, failCallback, opt_handler) {
  var list = [];
  try {
    var rs = this.db().execute(sql, args);
    while (rs.isValidRow()) {
      var fieldcount = rs.fieldCount();
      if (fieldcount === 1) {
        list.push(rs.field(0));
      } else {
        var vals = [];
        for (var i = 0; i < fieldcount; i++) { vals[i] = rs.field(i); }
        list.push(vals);
      }
      rs.next();
    }
    rs.close();
  } catch (e) {
    if (failCallback) { failCallback.call(opt_handler || this, e); }
    else { this.error(sql, args, e); }
    return;
  }

  successCallback.call(opt_handler || this, list);
};


/**
 * @param {function()} callback The succcess callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.GearsRepository.installGears = function(callback, opt_handler) {
  pn.data.GearsRepository.setUpGreasFactory();
  if (!window['google'] || !google.gears)
    document.location.href =
        pn.data.GearsRepository.GOOGLE_GEARS_SUPPORT_URL +
        '&return=' + document.location.href;
  else
    callback.call(opt_handler);
};


/**
 */
pn.data.GearsRepository.setUpGreasFactory = function() {
  if (window.google && google.gears) { return; }
  var factory = null;

  // Firefox
  if (typeof GearsFactory !== 'undefined') {
    factory = new GearsFactory();
  } else {
    // IE
    try {
      factory = new ActiveXObject('Gears.Factory');
      // privateSetGlobalObject is only required and supported on IE Mobile on
      // WinCE.
      if (factory.getBuildInfo().indexOf('ie_mobile') !== -1) {
        factory.privateSetGlobalObject(window);
      }
    } catch (e) {
      // Safari
      if ((typeof navigator.mimeTypes !== 'undefined') &&
          navigator.mimeTypes['application/x-googlegears']) {
        factory = document.createElement('object');
        factory.style.display = 'none';
        factory.width = 0;
        factory.height = 0;
        factory.type = 'application/x-googlegears';
        document.documentElement.appendChild(factory);
      }
    }
  }

  // *Do not* define any objects if Gears is not installed. This mimics the
  // behavior of Gears defining the objects in the future.
  if (!factory) { return; }

  // Now set up the objects, being careful not to overwrite anything.
  //
  // Note: In Internet Explorer for Windows Mobile, you can't add properties to
  // the window object. However, global objects are automatically added as
  // properties of the window object in all browsers.
  if (!window.google) {
    google = {};
  }

  if (!google.gears) {
    google.gears = {factory: factory};
  }
};


/** @inheritDoc */
pn.data.GearsRepository.prototype.disposeInternal = function() {
  pn.data.GearsRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.db_);
};
