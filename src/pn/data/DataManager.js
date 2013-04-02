goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.net.cookies');
goog.require('goog.object');
goog.require('goog.string');

goog.require('pn.data.DefaultRepositoryFactory');
goog.require('pn.data.IDataAjaxRequest');
goog.require('pn.data.IDataProvider');
goog.require('pn.data.IEntity');
goog.require('pn.data.InMemoryProvider');
goog.require('pn.data.LocalDataProvider');
goog.require('pn.data.RemoteDataProvider');
goog.require('pn.data.TransactionResult');

goog.provide('pn.data.DataManager');



/**
 * @constructor
 * @implements {pn.data.IDataProvider}
 * @extends {goog.Disposable}
 * @param {!pn.data.IDataAjaxRequest} ajax The ajax interface to use for
 *    communications.
 * @param {!Array.<string>} types The types supported by this data manager.
 */
pn.data.DataManager = function(ajax, types) {
  goog.Disposable.call(this);
  /**
   * @private
   * @type {!Array.<string>}
   */
  this.types_ = types;
  /**
   * @private
   * @type {!pn.data.RemoteDataProvider}
   */
  this.remote_ = new pn.data.RemoteDataProvider(ajax);

  /**
    * @private
    * @type {!pn.data.InMemoryProvider}
    */
  this.memory_ = new pn.data.InMemoryProvider();

  /**
    * @private
    * @type {!pn.data.LocalDataProvider}
    */
  this.local_;

  /**
    * @type {string}
    */
  this.databaseName = 'picnetdb';

  /**
    * @private
    * @type {boolean} Wether the system is currently online.  This needs to be
    *    set from an external polling source.  This will ensure that only a
    *    local_ repository is used (with negative IDs)
    */
  this.isonline_ = true;

  /**
    * @type {function(string, !pn.data.IEntity):boolean}
    * This callback function gets called before validation of an entity (before
    * saving).  This is the ideal place to modify the data to be saved in any
    * way.  Return 'false' if you want to veto the save operation.
    */
  this.onPreSave;

  /**
    * @type {function(string, !pn.data.IEntity):!Array.<string>}
    * Before saving this function is called to validate the entity being saved.
    * This funciton should return an empty array if there are no errors or an
    * array of errors.
    */
  this.onValidateEntity;
};
goog.inherits(pn.data.DataManager, goog.Disposable);


/**
 * @private
 * @type {string} The last time the client database was updated from the remote
 *    server.
 */
pn.data.DataManager.LAST_SYNC_TIME_ = '-1';


/**
 * @param {string} key The key of the local setting to retreive.
 * @return {string|undefined} The setting value.
 */
pn.data.DataManager.getLocalSettings = function(key) {
  if (typeof(window['localStorage']) !== 'undefined') {
    return window['localStorage'][key];
  } else {
    return goog.net.cookies.get(key);
  }
};


/**
 * @param {string} key The key of the local setting to set.
 * @param {string} value The value of the local setting.
 */
pn.data.DataManager.setLocalSettings = function(key, value) {
  if (typeof(window['localStorage']) !== 'undefined') {
    window['localStorage'][key] = value;
  } else {
    goog.net.cookies.set(key, value, 99999999);
  }
};


/**
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.init = function(callback, opt_handler) {
  var rep =
      pn.data.DefaultRepositoryFactory.getRepository(this.databaseName);
  this.local_ = new pn.data.LocalDataProvider(rep);
  rep.isInitialised(function(isinit) {
    if (!isinit && !this.isonline_) {
      throw new Error('The local_ data repository is not initialised.  ' +
          'The application needs to be online until the ' +
          'local repository is initialised.');
    }
    var provider = isinit ? this.local_ : this.remote_;
    rep.init(this.types_, function() { callback.call(opt_handler || this); });
  }, this);
};


/**
 * @param {boolean} initialRequest Wether this is the initial data manager sync
 *    request.
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.synchronize =
    function(initialRequest, callback, opt_handler) {
  if (!this.isonline_) {
    this.updateClientWithLatestServerChanges_(initialRequest,
        function(results) {
          callback.call(opt_handler || this, results);
        }
    );
    return;
  }
  this.updateServerWithLocalChanges(function(serverResults) {
    this.updateClientWithLatestServerChanges_(initialRequest,
        function(clientResults) {
          callback.call(opt_handler || this, clientResults);
        });
  }, this);
};


/**
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.updateServerWithLocalChanges =
    function(callback, opt_handler) {
  if (!this.isonline_) {
    callback.call(opt_handler || this, null);
    return;
  }
  // We have just switched to online mode.  This is also called on first load
  this.local_.getAllUnsavedEntities(function(unsaved) {
    this.local_.getAllDeletedEntities(function(deleted) {
      if (goog.object.isEmpty(unsaved) && goog.object.isEmpty(deleted)) {
        this.local_.resetLocalChanges(function() {
          this.removeAllLocalUsavedItems_(callback, opt_handler);
        }, this);
      } else {
        this.remote_.updateServer(unsaved, deleted, function(results) {
          this.local_.resetLocalChanges(function() {
            this.removeAllLocalUsavedItems_(callback, opt_handler);
          }, this);
        }, this);
      }
    }, this);
  }, this);
};


/**
 * @private
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.removeAllLocalUsavedItems_ =
    function(callback, opt_handler) {
  goog.array.forEach(this.types_, function(t) {
    this.memory_.repository.deleteLocalUnsavedItems(t);
  }, this);
  callback.call(opt_handler || this);
};


/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.updateClientWithLatestServerChanges_ =
    function(initialRequest, callback, opt_handler) {
  if (!this.isonline_) {
    this.updateEntireInMemoryStore(callback, opt_handler);
    return;
  }
  this.updateClientWithLatestServerChangesImpl_(
      initialRequest, callback, opt_handler);
};


/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.updateClientWithLatestServerChangesImpl_ =
    function(initialRequest, callback, opt_handler) {
  var lastupdate = pn.data.DataManager.getLocalSettings(
      pn.data.DataManager.LAST_SYNC_TIME_) || '-1';
  if (lastupdate === 'undefined') lastupdate = '-1';
  this.remote_.getChangesSince(lastupdate, function(changes) {
    this.local_.reset(this.types_, function() {
      var start = goog.now();
      this.updateLocalChanges_(initialRequest, changes, function() {
        this.deleteLocalEntities_(initialRequest, changes, function() {
          this.log('this.updateLocalChanges_ took: ' +
              (goog.now() - start) + 'ms');
          pn.data.DataManager.setLocalSettings(
              pn.data.DataManager.LAST_SYNC_TIME_, changes['ServerTime']);
          if (initialRequest) {
            this.updateEntireInMemoryStore(function() {
              callback.call(opt_handler || this, null);
            } , opt_handler);
          } else {
            callback.call(opt_handler || this, null);
          }
        }, this);
      }, this);
    }, this);
  }, this);
};


/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {!Object.<string, Array.<pn.data.IEntity>>} changes The remote
 *    changes that need to be applied to the local repository.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.updateLocalChanges_ =
    function(initialRequest, changes, callback, opt_handler) {
  var arr = [];
  goog.object.forEach(changes, function(o, type) {
    if (type !== 'DeletedIDs' && type !== 'ServerTime')
      arr.push({'entities': o, 'type': type});
  });
  this.updateLocalChangesImpl_(initialRequest, arr, function() {
    callback.call(opt_handler || this);
  }, this);
};


/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {Array.<Array.<{entities:pn.data.IEntity,type:string}>>} arr The
 *    changes to be applied to the local repository
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.updateLocalChangesImpl_ =
    function(initialRequest, arr, callback, opt_handler) {
  if (arr.length === 0) {callback.call(opt_handler || this); return; }
  var elementsData =
      /** @type {{entities:!Array.<pn.data.IEntity>,type:string}} */
      (arr.pop());
  this.local_.repository.saveList(elementsData.type, elementsData.entities,
      function() {
        if (!initialRequest) {
          this.memory_.repository.saveList(
              elementsData.type, elementsData.entities, function() {}, this); }
        this.updateLocalChangesImpl_(
            initialRequest, arr, callback, opt_handler);
      }, this);
};


/**
 * @private
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.clearEntireDatabase_ =
    function(callback, opt_handler) {
  this.local_.clearEntireDatabase(callback, opt_handler);
};


/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {!Object.<string, Array.<pn.data.IEntity>>} changes The entities
 *    that need to be removed from the local repository.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.deleteLocalEntities_ =
    function(initialRequest, changes, callback, opt_handler) {
  var arr = [];
  goog.object.forEach(changes['DeletedIDs'], function(o) {
    var idpos = o.indexOf('_');
    var type = o.substring(0, idpos);
    var id = parseInt(o.substring(idpos + 1), 10);
    arr.push({'type': type, 'id': id});
  });

  this.deleteLocalEntitiesImpl_(initialRequest, arr, function() {
    callback.call(opt_handler || this);
  }, this);
};

/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {Array.<Array.<{entities:pn.data.IEntity,type:string}>>} arr The
 *    entities that need to be removed from the local repository.
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */

pn.data.DataManager.prototype.deleteLocalEntitiesImpl_ =
    function(initialRequest, arr, callback, opt_handler) {
  if (arr.length === 0) {callback.call(opt_handler || this); return; }
  var elementsData = /** @type {{type:string,id:number}} */ (arr.pop());
  this.local_.repository.deleteItem(elementsData.type, elementsData.id,
      function() {
        this.deleteLocalEntitiesImpl_(initialRequest, arr, callback,
            opt_handler);
      }, this);
  if (!initialRequest) {
    this.memory_.deleteEntity(elementsData.type, elementsData.id,
        function() {});
  }
};


/**
 * @param {!function()} callback The success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 */
pn.data.DataManager.prototype.updateEntireInMemoryStore =
    function(callback, opt_handler) {
  var start = goog.now();

  var alldata = {};
  this.local_.repository.getListsImpl(this.types_, alldata, function() {
    for (var type in alldata) {
      this.memory_.repository.saveList(type, alldata[type],
          function() {}, this);
    }
    this.log('updateEntireInMemoryStore took: ' +
        (goog.now() - start) + 'ms');
    callback.call(opt_handler || this);
  }, this);
};


/** @override */
pn.data.DataManager.prototype.getEntities = function(type) {
  return this.memory_.getEntities(type);
};


/** @override */
pn.data.DataManager.prototype.getEntity = function(type, id) {
  return this.memory_.getEntity(type, id);
};


/** @override */
pn.data.DataManager.prototype.saveEntity =
    function(type, data, callback, opt_handler) {
  if (this.onPreSave && !this.onPreSave(type, data)) return;
  var errors = this.onValidateEntity ? this.onValidateEntity(type, data) : [];
  if (errors.length > 0) {
    callback.call(opt_handler || this,
        /** @type {pn.data.TransactionResult} */ ({'Errors': errors}));
    return;
  }

  this.remote_.saveEntity(type, data, function(results) {
    if (!this.isonline_) {
      this.local_.saveEntity(type, data, function(results2) {
        if (results2.Errors && results2.Errors.length > 0) {
          callback.call(opt_handler || this, results2);
          return;
        }
        data.ID = results2.ID;
        this.memory_.saveEntity(type, data);
        this.local_.saveUnsavedEntity(type, data, function() {
          callback.call(opt_handler || this, results2);
        }, this);
      }, this);
    } else {
      if (results.Errors && results.Errors.length > 0) {
        callback.call(opt_handler || this, results);
        return;
      }
      data.ID = results.ID;
      this.local_.saveEntity(type, data, function() {
        this.memory_.saveEntity(type, data);
        callback.call(opt_handler || this, results);
      }, this);
    }
  }, this);
};


/** @override */
pn.data.DataManager.prototype.deleteEntity =
    function(type, id, callback, opt_handler) {
  this.remote_.deleteEntity(type, id, function(results) {
    if (results === pn.data.RemoteDataProvider.OFFLINE) {
      this.local_.deleteEntity(type, id, function(results2) {
        if (results2.Errors && results2.Errors.length > 0) {
          callback.call(opt_handler || this, results2);
          return;
        }
        this.local_.saveDeletedEntity(type, id, function() {
          this.memory_.deleteEntity(type, id, function() {
            callback.call(opt_handler || this, results2);
          });
        }, this);
      }, this);
    } else {
      if (results.Errors && results.Errors.length > 0) {
        callback.call(opt_handler || this, results);
        return;
      }
      this.local_.deleteEntity(type, id, function() {
        this.memory_.deleteEntity(type, id, function() {
          callback.call(opt_handler || this, results);
        });
      }, this);
    }
  }, this);
};


/** @override */
pn.data.DataManager.prototype.deleteEntities =
    function(type, ids, callback, opt_handler) {
  if (!ids || ids.length === 0) {
    callback.call(opt_handler || this, []);
    return;
  }

  this.remote_.deleteEntities(type, ids, function(results) {
    if (results === pn.data.RemoteDataProvider.OFFLINE) {
      this.local_.deleteEntities(type, ids, function(results2) {
        var errors2 = [];
        goog.array.forEach(results2, function(tr) { if (tr.Errors) {
          errors2 = goog.array.concat(errors, tr.Errors);
        } });
        if (errors2 && errors2.length > 0) {
          callback.call(opt_handler || this, results2);
          return;
        }
        this.local_.saveDeletedEntities(type, ids, function() {
          this.memory_.deleteEntities(type, ids, function() {});
          callback.call(opt_handler || this, results2);
          return;
        }, this);
      }, this);
    } else {
      var errors = [];
      goog.array.forEach(results, function(tr) { if (tr.Errors) {
        errors = goog.array.concat(errors, tr.Errors); }
      });
      if (errors && errors.length > 0) {
        callback.call(opt_handler || this, results);
        return;
      }

      this.local_.deleteEntities(type, ids, function() {
        this.memory_.deleteEntities(type, ids, function() {
          callback.call(opt_handler || this, results);
        });
      }, this);
    }
  }, this);
};


/** @override */
pn.data.DataManager.prototype.saveEntities =
    function(data, callback, opt_handler) {
  for (var type in data) {
    var entities = data[type];
    if (this.onPreSave) {
      var exit = false;
      goog.array.forEach(entities, function(e) {
        if (!this.onPreSave(type, e)) { exit = true; }
      }, this);
      if (exit) { return; }
    }
    if (this.onValidateEntity) {
      var errors = [];
      goog.array.forEach(entities, function(e) {
        var theseErrors = this.onValidateEntity(type, e);
        if (theseErrors && theseErrors.length > 0) {
          errors = goog.array.concat(errors, theseErrors);
        }
      }, this);
      if (errors.length > 0) {
        callback.call(opt_handler || this, [{'Errors': errors}]);
        return;
      }
    }

  }

  this.remote_.saveEntities(data, function(results) {
    if (results === pn.data.RemoteDataProvider.OFFLINE) {
      this.local_.saveEntities(data, function(results2) {
        if (!this.postSave_(data, results2, callback, opt_handler)) { return; }
        this.memory_.saveEntities(data);
        this.local_.saveUnsavedEntities(data, function() {
          callback.call(opt_handler || this, results2);
        }, this);
      }, this);
    } else {
      if (!this.postSave_(data, results, callback, opt_handler)) { return; }
      this.local_.saveEntities(data, function() {
        this.memory_.saveEntities(data);
        callback.call(opt_handler || this, results);
        return;
      }, this);
    }
  }, this);
};


/**
 * @private
 * @param {!Object.<string, Array.<pn.data.IEntity>>} data The data just
 *    saved.
 * @param {!Array.<pn.data.TransactionResult>} results The results of the
 *    save operation.
 * @param {!function(Array.<pn.data.TransactionResult>)} callback The
 *    success callback.
 * @param {Object=} opt_handler The context to use when calling the callback.
 * @return {boolean} Wether the postSave operation was successful.
 */
pn.data.DataManager.prototype.postSave_ =
    function(data, results, callback, opt_handler) {
  var errors = [];
  goog.array.forEach(results, function(tr) {
    if (tr.Errors) { errors = goog.array.concat(errors, tr.Errors); }
  });
  if (errors && errors.length > 0) {
    callback.call(opt_handler || this, results);
    return false;
  }

  goog.array.forEach(results, function(tr) {
    if (tr.ClientID > 0) { return; }
    goog.array.find(data[tr.Type], function(e) {
      return e.ID === tr.ClientID;
    }).ID = tr.ID;
  });
  if (goog.object.getCount(data) <= 1) { return true; }

  for (var type in data) {
    goog.array.forEach(data[type], function(e) {
      for (var prop in e) {
        if (prop !== 'ID' && e[prop] < 0 && goog.string.endsWith(prop, 'ID')) {
          var type2 = prop.substring(0, prop.length - 2);
          if (!data[type2])
            throw new Error('Found a negative relationship property [' + prop +
                '] but did not save entities of this type[' + type2 + '].');
          var newid = goog.array.find(results, function(tr) {
            return tr.Type === type2 && tr.ClientID === e[prop];
          }).ID;
          e[prop] = newid;
        }
      }
    });
  }
  return true;
};


/** @override */
pn.data.DataManager.prototype.disposeInternal = function() {
  pn.data.DataManager.superClass_.disposeInternal.call(this);

  goog.dispose(this.remote_);
  goog.dispose(this.memory_);
  goog.dispose(this.local_);
};
