goog.require('goog.array');

goog.require('pn.Utils');
goog.require('pn.data.AbstractRepository');
goog.require('pn.data.IEntity');
goog.require('pn.data.IRepository');

goog.provide('pn.data.AbstractSQLRepository');



/**
 * @constructor
 * @implements {pn.data.IRepository}
 * @extends {pn.data.AbstractRepository}
 * @param {string} databaseName The name of the database to open or create.
 */
pn.data.AbstractSQLRepository = function(databaseName) {
  pn.data.AbstractRepository.call(this, databaseName);

  /**
   * @protected
   * @type {!Array.<string>}
   */
  this.types;
};
goog.inherits(pn.data.AbstractSQLRepository,
    pn.data.AbstractRepository);


/**
 * @protected
 * @param {string} sql The sql to execute.
 * @param {!Array.<Object>} args The args to pass to the executing command.
 * @param {!function(Array.<Object>)} successCallback The success callback.
 * @param {function(Object)|null} failCallback The fail callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.AbstractSQLRepository.prototype.execute = goog.abstractMethod;


/** @override */
pn.data.AbstractSQLRepository.prototype.isSupported = goog.abstractMethod;


/**
 * @protected
 * @type {!function()}
 */
pn.data.AbstractSQLRepository.prototype.db = function() { };


/** @override */
pn.data.AbstractSQLRepository.prototype.isInitialised =
    function(callback, opt_handler) {
  this.execute(
      "SELECT count(name) FROM sqlite_master WHERE name='UnsavedEntities'", [],
      function(results) {
        callback.call(opt_handler || this, (results.length === 1 &&
            parseInt(results[0], 10) > 0));
      },  // onsuccess
      function() {
        callback.call(opt_handler || this, false);
      }, this); // onerror
};


/** @override */
pn.data.AbstractSQLRepository.prototype.getList =
    function(type, callback, opt_handler) {
  this.execute('SELECT value FROM [' + type + ']', [], function(results) {
    var list = [];
    for (var i = 0; i < results.length; i++) {
      list.push(pn.Utils.parseJson(results[i]));
    }
    callback.call(opt_handler || this, list);
  }, null, this);
};


/** @override */
pn.data.AbstractSQLRepository.prototype.getLists =
    function(typeprefix, callback, opt_handler) {
  if (typeprefix === 'UnsavedEntities' || typeprefix === 'DeletedIDs') {
    this.getUnsavedLists(typeprefix, function(dict2) {
      callback.call(opt_handler || this, dict2);
    }, this);
  } else
  {
    var dict = {};
    var tables = goog.array.filter(this.types,
        function(t) { return t.indexOf(typeprefix) === 0; }
        );
    this.getListsImpl(tables, dict, callback, opt_handler);
  }
};


/** @override */
pn.data.AbstractSQLRepository.prototype.getUnsyncLists =
    function(typename, callback, opt_handler) {
  this.execute('SELECT [TYPE], value FROM [' + typename + '] ORDER BY type', [],
      function(results) {
        var dict = {};
        goog.array.forEach(results, function(dr) {
          var tablename = dr[0];
          if (!(tablename in dict)) { dict[tablename] = []; }
          dict[tablename].push(pn.Utils.parseJson(dr[1]));
        }, this);
        callback.call(opt_handler || this, dict);
      }, null, this);
};


/**
 * @param {!Array.<string>} types The types of lists to retreive.
 * @param {!Object.<string, Array.<pn.data.IEntity>>} dict The data map to
 *    fill with the retreived lists.
 * @param {!function(Object.<string, Array.<pn.data.IEntity>>)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.AbstractSQLRepository.prototype.getListsImpl =
    function(types, dict, callback, opt_handler) {
  if (types.length === 0) { callback.call(opt_handler || this, dict); return; }
  var type = types.pop();
  this.getList(type, function(list) {
    dict[type] = list; this.getListsImpl(types, dict, callback, opt_handler);
  }, this);
};


/** @override */
pn.data.AbstractSQLRepository.prototype.deleteList =
    function(type, callback, opt_handler) {
  this.execute('DELETE FROM [' + type + ']', [], function(results) {
    if (type === 'UnsavedEntities') {
      this.removeLocalUnsavedItems_(goog.array.clone(this.types), function() {
        callback.call(opt_handler || this, true);
      }, this);
    }
    else callback.call(opt_handler || this, true);
  }, null, this);
};


/**
 * @private
 * @param {!Array.<string>} types The types of lists to clear of unsaved items.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.AbstractSQLRepository.prototype.removeLocalUnsavedItems_ =
    function(types, callback, opt_handler) {
  if (types.length === 0) {callback.call(opt_handler || this); return; }
  var type = types.pop();
  this.execute('DELETE FROM [' + type + '] WHERE ID < 0', [], function() {
    this.removeLocalUnsavedItems_(types, callback, opt_handler);
  }, null, this);
};


/** @override */
pn.data.AbstractSQLRepository.prototype.getItem =
    function(type, id, callback, opt_handler) {
  this.execute('SELECT value FROM [' + type + '] WHERE ID = ?', [id],
      function(results) {
        var e = /** @type {pn.data.IEntity} */
            (results.length === 1 ? pn.Utils.parseJson(results[0]) : null);
        callback.call(opt_handler || this, e);
      }, null, this);
};


/** @override */
pn.data.AbstractSQLRepository.prototype.deleteItem =
    function(type, id, callback, opt_handler) {
  var typepos = type.split('|');
  var sql = typepos.length === 2 ?
      'DELETE FROM [' + typepos[0] + "] WHERE TYPE = '" + typepos[1] +
      "' AND ID = ?" :
      'DELETE FROM [' + typepos[0] + '] WHERE ID = ?';
  this.execute(sql, [id], function(results) {
    callback.call(opt_handler || this, true);
  }, null, this);
};


/** @override */
pn.data.AbstractSQLRepository.prototype.deleteItems =
    function(type, ids, callback, opt_handler) {
  var typepos = type.split('|');
  var idsstr = ids.join(',');
  var sql = typepos.length === 2 ?
      'DELETE FROM [' + typepos[0] + "] WHERE TYPE = '" +
      typepos[1] + "' AND ID IN (" + idsstr + ')' :
      'DELETE FROM [' + typepos[0] + '] WHERE ID IN (' + idsstr + ')';
  this.execute(sql, [], function(results) {
    callback.call(opt_handler || this, true);
  }, null, this);
};


/** @override */
pn.data.AbstractSQLRepository.prototype.saveItem =
    function(type, item, callback, opt_handler) {
  var typepos = type.indexOf('|');
  var itemid = (typeof(item) === 'number' ? item : item.ID);
  var str = (typeof(item) !== 'number' ? pn.Utils.serialiseJson(item) : item);
  this.execute(typepos !== -1 ?
      'INSERT OR REPLACE INTO [' + type.substring(0, typepos) +
      '] (ID, TYPE, value) VALUES(?, \'' + type.substring(typepos + 1) +
      '\', ?)' :
      'INSERT OR REPLACE INTO [' + type + '] (ID, value) VALUES(?, ?)',
      [itemid, str], function() { callback.call(opt_handler || this, true)},
      null, this);
};


/**
 * @protected
 * @param {string} sql The sql that caused the errors.
 * @param {!Array} args The arguments passed to the executing
 *    command that caused the error.
 * @param {Object=} opt_err The error throws by the specified sql and args.
 */
pn.data.AbstractSQLRepository.prototype.error = function(sql, args, opt_err) {
  throw ('Local SQL Database Error\n\tSQL: ' + sql + '\n\tMessage: ' +
      opt_err.message);
};
