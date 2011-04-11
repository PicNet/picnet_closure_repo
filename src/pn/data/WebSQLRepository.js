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
    function(types, callback, handler) {
  var start = new Date().getTime();
  this.types = types;
  this.isInitialised(function(isInitialised) {
    if (isInitialised) return callback.call(handler || this);
    var that = this;
    this.db().transaction(function(t) {
      goog.array.forEach(that.types, function(type) {
        t.executeSql('CREATE TABLE IF NOT EXISTS [' + type +
            '] (ID INTEGER UNIQUE PRIMARY KEY, value TEXT)');
      });
      t.executeSql('CREATE TABLE IF NOT EXISTS [UnsavedEntities] ' +
          '([TYPE] VARCHAR(30), ID INTEGER, value TEXT, PRIMARY KEY ' +
          '([TYPE], ID))');
      t.executeSql('CREATE TABLE IF NOT EXISTS [DeletedIDs] ' +
          '([TYPE] VARCHAR(30), ID INTEGER, value INTEGER, PRIMARY KEY ' +
          '([TYPE], ID))');
    },
    function(tx, err) { that.error('initialisation', [], err); },
    function() {
      that.log.fine('init took: ' + (new Date().getTime() - start) + 'ms');
      callback.call(handler || that);
    });
  }, this);
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.saveList =
    function(type, list, callback, handler) {
  var typepos = type.indexOf('|');
  var that = this;
  this.db().transaction(function(t) {
    goog.array.forEach(list, function(item) {
      var itemid = (typeof(item) === 'number' ? item : item.ID);
      var itemstr = (typeof(item) !== 'number' ?
          pn.Utils.serialiseJson(that.makeDateSafe(item)) : item);

      t.executeSql(typepos !== -1 ?
          'INSERT OR REPLACE INTO [' + type.substring(0, typepos) +
          '] (ID, TYPE, value) VALUES(?, \'' + type.substring(typepos + 1) +
          '\', ?)' :
          'INSERT OR REPLACE INTO [' + type + '] (ID, value) VALUES(?, ?)',
          [itemid, itemstr]);
    }, this);
  }, function(tx, err) { that.error('savelist', [], err); }, function() {
    callback.call(handler || that, true);
  });
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.clearEntireDatabase =
    function(callback, handler) {
  var that = this;
  this.db().transaction(function(t) {
    goog.array.forEach(that.types, function(type) {
      t.executeSql('DELETE FROM [' + type + ']', []);
    }, this);
  }, function(tx, err) { that.error('clearEntireDatabase', [], err); }
  , function() {
    callback.call(handler || that);
  });
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.execute =
    function(sql, args, successCallback, failCallback, handler) {
  if (this.transaction_) {
    this.executeImpl_(sql, args, successCallback, failCallback, handler, false);
    return;
  }
  var that = this;
  this.db().transaction(function(t) {
    that.transaction_ = t;
    that.executeImpl_(sql, args, successCallback, failCallback, handler, true);
  });
};


/**
 * @private
 * @param {string} sql The SQL statement to execute.
 * @param {!Array.<Object>} args The args to pass to the executing statement.
 * @param {!function(Array.<Object>)} successCallback The success callback.
 * @param {function(Object)|null} failCallback The fail callback.
 * @param {Object} handler The context to use when calling the callback.
 * @param {boolean=} kill Wether to kill the transaction after this
 *    command.
 */
pn.data.WebSQLRepository.prototype.executeImpl_ =
    function(sql, args, successCallback, failCallback, handler, kill) {
  var that = this;
  this.transaction_.executeSql(sql, args, function(tx, results) {
    var list = [];
    for (var i = 0; i < results.rows.length; i++) {
      var item = results.rows.item(i);
      var vals = [];
      for (var j in item) { vals.push(item[j]); }
      list.push(vals.length === 1 ? vals[0] : vals);
    }
    successCallback.call(handler || this, list);
    if (kill) { that.transaction_ = null; }
  }, function(tx, err) {
    if (failCallback) { failCallback.call(handler || this, err); }
    else { that.error(sql, args, err); }

    if (kill) that.transaction_ = null;
  });
};


/** @inheritDoc */
pn.data.WebSQLRepository.prototype.disposeInternal = function() {
  pn.data.WebSQLRepository.superClass_.disposeInternal.call(this);

  goog.dispose(this.db_);
};
