goog.require('goog.array');
goog.require('goog.debug');

goog.require('pn.Utils');
goog.require('pn.data.AbstractSQLRepository');
goog.provide('pn.data.WebSQLRepository');



/**
 * @constructor
 * @extends {pn.data.AbstractSQLRepository}
 * @param {string} databaseName The name of the database to open or create.
 */
pn.data.WebSQLRepository = function(databaseName) {
  pn.data.AbstractSQLRepository.call(this, databaseName);

  /**
   * @private
   * @type {Object}
   */
  this.transaction_;

  this.log.fine('using the pn.data.WebSQLRepository');
};
goog.inherits(pn.data.WebSQLRepository, pn.data.AbstractSQLRepository);


/**
 * @private
 * @type {Database}
 */
pn.data.WebSQLRepository.prototype.db_;


/**
 * @return {boolean} Wether this database type is supported.
 */
pn.data.WebSQLRepository.isSupported = function() {
  return typeof (window.openDatabase) === 'function';
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.isSupported =
    pn.data.WebSQLRepository.isSupported;


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.db = function() {
  return this.db_ || (this.db_ =
      window.openDatabase(this.databaseName, '1', this.databaseName, 10485760));
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.init =
    function(types, callback, opt_handler) {
  var start = goog.now();
  this.types = types;
  this.isInitialised(function(isInitialised) {
    if (isInitialised) return callback.call(opt_handler || this);
    this.db().transaction(goog.bind(function(t) {
      goog.array.forEach(this.types, function(type) {
        t.executeSql('CREATE TABLE IF NOT EXISTS [' + type +
            '] (ID INTEGER UNIQUE PRIMARY KEY, value TEXT)');
      });
      t.executeSql('CREATE TABLE IF NOT EXISTS [UnsavedEntities] ' +
          '([TYPE] VARCHAR(30), ID INTEGER, value TEXT, PRIMARY KEY ' +
          '([TYPE], ID))');
      t.executeSql('CREATE TABLE IF NOT EXISTS [DeletedIDs] ' +
          '([TYPE] VARCHAR(30), ID INTEGER, value INTEGER, PRIMARY KEY ' +
          '([TYPE], ID))');
      this.log.fine('init took: ' + (goog.now() - start) + 'ms');
      callback.call(opt_handler || this);
    }, this),    
    goog.bind(function(tx, err) {
      this.error('initialisation', [], err);
    }, this));
  }, this);
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.saveList =
    function(type, list, callback, opt_handler) {
  var typepos = type.indexOf('|');
  this.db().transaction(goog.bind(function(t) {
    goog.array.forEach(list, function(item) {
      var itemid = typeof(item) === 'number' ? item : item.ID;
      var str = typeof(item) !== 'number' ? pn.Utils.serialiseJson(item) : item;
      t.executeSql(typepos !== -1 ?
          'INSERT OR REPLACE INTO [' + type.substring(0, typepos) +
          '] (ID, TYPE, value) VALUES(?, \'' + type.substring(typepos + 1) +
          '\', ?)' :
          'INSERT OR REPLACE INTO [' + type + '] (ID, value) VALUES(?, ?)',
          [itemid, str]);      
    }, this);
    callback.call(opt_handler || this, true); 
  }, this), goog.bind(function(tx, err) { 
    this.error('savelist', [], err); 
  }));
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.clearEntireDatabase =
    function(callback, opt_handler) {
  this.db().transaction(goog.bind(function(t) {
    goog.array.forEach(this.types, function(type) {
      t.executeSql('DELETE FROM [' + type + ']', []);
    }, this);
    callback.call(opt_handler || this);
  }, this), goog.bind(function(tx, err) {
    this.error('clearEntireDatabase', [], err);
  }, this));
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.execute =
    function(sql, args, successCallback, failCallback, opt_handler) {
  if (this.transaction_) {
    this.executeImpl_(sql, args, successCallback, failCallback,
        opt_handler, false);
    return;
  }
  this.db().transaction(goog.bind(function(t) {
    this.transaction_ = t;
    this.executeImpl_(sql, args, successCallback, failCallback,
        opt_handler, true);
  }, this));
};


/**
 * @private
 * @param {string} sql The SQL statement to execute.
 * @param {!Array.<Object>} args The args to pass to the executing statement.
 * @param {!function(Array.<Object>)} successCallback The success callback.
 * @param {function(Object)|null} failCallback The fail callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 * @param {boolean=} opt_kill Wether to kill the transaction after this
 *    command.
 */
pn.data.WebSQLRepository.prototype.executeImpl_ =
    function(sql, args, successCallback, failCallback, opt_handler, opt_kill) {
  this.transaction_.executeSql(sql, args, goog.bind(function(tx, results) {
    var list = [];
    for (var i = 0; i < results.rows.length; i++) {
      var item = results.rows.item(i);
      var vals = [];
      for (var j in item) { vals.push(item[j]); }
      list.push(vals.length === 1 ? vals[0] : vals);
    }
    successCallback.call(opt_handler || this, list);
    if (opt_kill) { this.transaction_ = null; }
  }, this), goog.bind(function(tx, err) {
    if (failCallback) { failCallback.call(opt_handler || this, err); }
    else { this.error(sql, args, err); }

    if (opt_kill) this.transaction_ = null;
  }, this));
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.disposeInternal = function() {
  pn.data.WebSQLRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.db_);
};
