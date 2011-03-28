goog.require('goog.array');

goog.require('picnet.Utils');
goog.require('picnet.data.AbstractRepository');
goog.require('picnet.data.IEntity');
goog.require('picnet.data.IRepository');

goog.provide('picnet.data.AbstractSQLRepository');



/**
 * @constructor
 * @implements {picnet.data.IRepository}
 * @extends {picnet.data.AbstractRepository}
 * @param {string} databaseName The name of the database to open or create.
 */
picnet.data.AbstractSQLRepository = function(databaseName) {
  picnet.data.AbstractRepository.call(this, databaseName);

  /**
   * @protected
   * @type {!Array.<string>}
   */
  this.types;
};
goog.inherits(picnet.data.AbstractSQLRepository,
    picnet.data.AbstractRepository);


/**
 * @protected
 * @param {string} sql The sql to execute.
 * @param {!Array.<Object>} args The args to pass to the executing command.
 * @param {!function(Array.<Object>)} successCallback The success callback.
 * @param {function(Object)|null} failCallback The fail callback.
 * @param {Object} handler The context to use when calling the callback.
 */
picnet.data.AbstractSQLRepository.prototype.execute = goog.abstractMethod;


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.isSupported = goog.abstractMethod;


/**
 * @protected
 * @type {!function()}
 */
picnet.data.AbstractSQLRepository.prototype.db = function() { };


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.isInitialised =
    function(callback, handler) {
  this.execute(
      "SELECT count(name) FROM sqlite_master WHERE name='UnsavedEntities'", [],
      function(results) {
        callback.call(handler || this, (results.length === 1 &&
            parseInt(results[0], 10) > 0));
      },  // onsuccess
      function() {
        callback.call(handler || this, false);
      }, this); // onerror
};


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.getList =
    function(type, callback, handler) {
  var that = this;
  this.execute('SELECT value FROM [' + type + ']', [], function(results) {
    var list = [];
    for (var i = 0; i < results.length; i++) {
      list.push(this.recreateDates(picnet.Utils.parseJson(results[i])));
    }
    callback.call(handler || this, list);
  }, null, this);
};


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.getLists =
    function(typeprefix, callback, handler) {
  if (typeprefix === 'UnsavedEntities' || typeprefix === 'DeletedIDs') {
    this.getUnsavedLists(typeprefix, function(dict2) {
      callback.call(handler || this, dict2);
    }, this);
  } else
  {
    var dict = {};
    var tables = goog.array.filter(this.types,
        function(t) { return t.indexOf(typeprefix) === 0; }
        );
    this.getListsImpl(tables, dict, callback, handler);
  }
};


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.getUnsyncLists =
    function(typename, callback, handler) {
  this.execute('SELECT [TYPE], value FROM [' + typename + '] ORDER BY type', [],
      function(results) {
        var dict = {};
        goog.array.forEach(results, function(dr) {
          var tablename = dr[0];
          if (!(tablename in dict)) { dict[tablename] = []; }
          var safeVal = this.recreateDates(picnet.Utils.parseJson(dr[1]));
          dict[tablename].push(safeVal);
        }, this);
        callback.call(handler || this, dict);
      }, null, this);
};


/**
 * @param {!Array.<string>} types The types of lists to retreive.
 * @param {!Object.<string, Array.<picnet.data.IEntity>>} dict The data map to
 *    fill with the retreived lists.
 * @param {!function(Object.<string, Array.<picnet.data.IEntity>>)} callback The
 *    success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.AbstractSQLRepository.prototype.getListsImpl =
    function(types, dict, callback, handler) {
  if (types.length === 0) { callback.call(handler || this, dict); return; }
  var type = types.pop();
  this.getList(type, function(list) {
    dict[type] = list; this.getListsImpl(types, dict, callback, handler);
  }, this);
};


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.deleteList =
    function(type, callback, handler) {
  this.execute('DELETE FROM [' + type + ']', [], function(results) {
    if (type === 'UnsavedEntities') {
      this.removeLocalUnsavedItems_(goog.array.clone(this.types), function() {
        callback.call(handler || this, true);
      }, this);
    }
    else callback.call(handler || this, true);
  }, null, this);
};


/**
 * @private
 * @param {!Array.<string>} types The types of lists to clear of unsaved items.
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.AbstractSQLRepository.prototype.removeLocalUnsavedItems_ =
    function(types, callback, handler) {
  if (types.length === 0) {callback.call(handler || this); return; }
  var type = types.pop();
  this.execute('DELETE FROM [' + type + '] WHERE ID < 0', [], function() {
    this.removeLocalUnsavedItems_(types, callback, handler);
  }, null, this);
};


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.getItem =
    function(type, id, callback, handler) {
  this.execute('SELECT value FROM [' + type + '] WHERE ID = ?', [id],
      function(results) {
        var e = results.length === 1 ?
            this.recreateDates(picnet.Utils.parseJson(results[0])) : null;
        callback.call(handler || this, e);
      }, null, this);
};


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.deleteItem =
    function(type, id, callback, handler) {
  var typepos = type.split('|');
  var sql = typepos.length === 2 ?
      'DELETE FROM [' + typepos[0] + "] WHERE TYPE = '" + typepos[1] +
      "' AND ID = ?" :
      'DELETE FROM [' + typepos[0] + '] WHERE ID = ?';
  this.execute(sql, [id], function(results) {
    callback.call(handler || this, true);
  }, null, this);
};


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.deleteItems =
    function(type, ids, callback, handler) {
  var typepos = type.split('|');
  var idsstr = ids.join(',');
  var sql = typepos.length === 2 ?
      'DELETE FROM [' + typepos[0] + "] WHERE TYPE = '" +
      typepos[1] + "' AND ID IN (" + idsstr + ')' :
      'DELETE FROM [' + typepos[0] + '] WHERE ID IN (' + idsstr + ')';
  this.execute(sql, [], function(results) {
    callback.call(handler || this, true);
  }, null, this);
};


/** @inheritDoc */
picnet.data.AbstractSQLRepository.prototype.saveItem =
    function(type, item, callback, handler) {
  var typepos = type.indexOf('|');
  var itemid = (typeof(item) === 'number' ? item : item.ID);
  var itemstr = (typeof(item) !== 'number' ?
      picnet.Utils.serialiseJson(/** @type {Object} */
      (this.makeDateSafe(item))) : item);
  this.execute(typepos !== -1 ?
      'INSERT OR REPLACE INTO [' + type.substring(0, typepos) +
      '] (ID, TYPE, value) VALUES(?, \'' + type.substring(typepos + 1) +
      '\', ?)' :
      'INSERT OR REPLACE INTO [' + type + '] (ID, value) VALUES(?, ?)',
      [itemid, itemstr], function() { callback.call(handler || this, true)},
      null, this);
};


/**
 * @protected
 * @param {string} sql The sql that caused the errors.
 * @param {!Array} args The arguments passed to the executing
 *    command that caused the error.
 * @param {Object=} err The error throws by the specified sql and args.
 */
picnet.data.AbstractSQLRepository.prototype.error = function(sql, args, err) {
  throw ('Local SQL Database Error\n\tSQL: ' + sql + '\n\tMessage: ' +
      err.message);
};
