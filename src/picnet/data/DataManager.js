goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.net.cookies');
goog.require('goog.object');
goog.require('goog.string');

goog.require('picnet.data.DefaultRepositoryFactory');
goog.require('picnet.data.IDataAjaxRequest');
goog.require('picnet.data.IDataProvider');
goog.require('picnet.data.IEntity');
goog.require('picnet.data.InMemoryProvider');
goog.require('picnet.data.LocalDataProvider');
goog.require('picnet.data.RemoteDataProvider');
goog.require('picnet.data.TransactionResult');

goog.provide('picnet.data.DataManager');



/**
 * @constructor
 * @implements {picnet.data.IDataProvider}
 * @extends {goog.Disposable}
 * @param {!picnet.data.IDataAjaxRequest} ajax The ajax interface to use for
 *    communications.
 * @param {!Array.<string>} types The types supported by this data manager.
 */
picnet.data.DataManager = function(ajax, types) {
  goog.Disposable.call(this);
  /**
   * @private
   * @type {!Array.<string>}
   */
  this.types_ = types;
  /**
   * @private
   * @type {!picnet.data.RemoteDataProvider}
   */
  this.remote_ = new picnet.data.RemoteDataProvider(ajax);

  /**
    * @private
    * @type {!picnet.data.InMemoryProvider}
    */
  this.memory_ = new picnet.data.InMemoryProvider();

  /**
    * @private
    * @type {!picnet.data.LocalDataProvider}
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
    * @type {function(string, !picnet.data.IEntity):boolean}
    * This callback function gets called before validation of an entity (before
    * saving).  This is the ideal place to modify the data to be saved in any
    * way.  Return 'false' if you want to veto the save operation.
    */
  this.onPreSave;

  /**
    * @type {function(string, !picnet.data.IEntity):!Array.<string>}
    * Before saving this function is called to validate the entity being saved.
    * This funciton should return an empty array if there are no errors or an
    * array of errors.
    */
  this.onValidateEntity;
};
goog.inherits(picnet.data.DataManager, goog.Disposable);


/**
 * @private
 * @type {string} The last time the client database was updated from the remote
 *    server.
 */
picnet.data.DataManager.LAST_SYNC_TIME_ = '-1';


/**
 * TODO: This should use localStorage
 * @param {string} key The key of the local setting to retreive.
 * @return {string|undefined} The setting value.
 */
picnet.data.DataManager.getLocalSettings = function(key) {
  return goog.net.cookies.get(key);
};


/**
 * TODO: This should use localStorage
 * @param {string} key The key of the local setting to set.
 * @param {string} value The value of the local setting.
 * @return {string} The specified value.
 */
picnet.data.DataManager.setLocalSettings = function(key, value) {
  return goog.net.cookies.set(key, value, 99999999);
};


/**
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.init = function(callback, handler) {
  var rep =
      picnet.data.DefaultRepositoryFactory.getRepository(this.databaseName);
  this.local_ = new picnet.data.LocalDataProvider(rep);
  rep.isInitialised(function(isinit) {
    if (!isinit && !this.isonline_) {
      throw new Error('The local_ data repository is not initialised.  ' +
          'The application needs to be online until the ' +
          'local repository is initialised.');
    }
    var provider = isinit ? this.local_ : this.remote_;
    rep.init(this.types_, function() { callback.call(handler || this); });
  }, this);
};


/**
 * @param {boolean} initialRequest Wether this is the initial data manager sync
 *    request.
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.synchronize =
    function(initialRequest, callback, handler) {
  if (!this.isonline_) {
    this.updateClientWithLatestServerChanges_(initialRequest,
        function(results) {
          callback.call(handler || this, results);
        }
    );
    return;
  }
  this.updateServerWithLocalChanges(function(serverResults) {
    this.updateClientWithLatestServerChanges_(initialRequest,
        function(clientResults) {
          callback.call(handler || this, clientResults);
        });
  }, this);
};


/**
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.updateServerWithLocalChanges =
    function(callback, handler) {
  if (!this.isonline_) {
    callback.call(handler || this, null);
    return;
  }
  // We have just switched to online mode.  This is also called on first load
  this.local_.getAllUnsavedEntities(function(unsaved) {
    this.local_.getAllDeletedEntities(function(deleted) {
      if (goog.object.isEmpty(unsaved) && goog.object.isEmpty(deleted)) {
        this.local_.resetLocalChanges(function() {
          this.removeAllLocalUsavedItems_(callback, handler);
        }, this);
      } else {
        this.remote_.updateServer(unsaved, deleted, function(results) {
          this.local_.resetLocalChanges(function() {
            this.removeAllLocalUsavedItems_(callback, handler);
          }, this);
        }, this);
      }
    }, this);
  }, this);
};


/**
 * @private
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.removeAllLocalUsavedItems_ =
    function(callback, handler) {
  goog.array.forEach(this.types_, function(t) {
    this.memory_.repository.deleteLocalUnsavedItems(t);
  }, this);
  callback.call(handler || this);
};


/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.updateClientWithLatestServerChanges_ =
    function(initialRequest, callback, handler) {
  if (!this.isonline_) {
    this.updateEntireInMemoryStore(callback, handler);
    return;
  }
  this.updateClientWithLatestServerChangesImpl_(
      initialRequest, callback, handler);
};


/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.updateClientWithLatestServerChangesImpl_ =
    function(initialRequest, callback, handler) {
  var lastupdate = picnet.data.DataManager.getLocalSettings(
      picnet.data.DataManager.LAST_SYNC_TIME_) || '-1';
  if (lastupdate === 'undefined') lastupdate = '-1';
  this.remote_.getChangesSince(lastupdate, function(changes) {
    this.local_.reset(this.types_, function() {
      var start = new Date().getTime();
      this.updateLocalChanges_(initialRequest, changes, function() {
        this.deleteLocalEntities_(initialRequest, changes, function() {
          this.log('this.updateLocalChanges_ took: ' +
              (new Date().getTime() - start) + 'ms');
          picnet.data.DataManager.setLocalSettings(
              picnet.data.DataManager.LAST_SYNC_TIME_, changes['ServerTime']);
          if (initialRequest) {
            this.updateEntireInMemoryStore(function() {
              callback.call(handler || this, null);
            } , handler);
          } else {
            callback.call(handler || this, null);
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
 * @param {!Object.<string, Array.<picnet.data.IEntity>>} changes The remote
 *    changes that need to be applied to the local repository.
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.updateLocalChanges_ =
    function(initialRequest, changes, callback, handler) {
  var arr = [];
  goog.object.forEach(changes, function(o, type) {
    if (type !== 'DeletedIDs' && type !== 'ServerTime')
      arr.push({'entities': o, 'type': type});
  });
  this.updateLocalChangesImpl_(initialRequest, arr, function() {
    callback.call(handler || this);
  }, this);
};


/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {Array.<Array.<{entities:picnet.data.IEntity,type:string}>>} arr The
 *    changes to be applied to the local repository
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.updateLocalChangesImpl_ =
    function(initialRequest, arr, callback, handler) {
  if (arr.length === 0) {callback.call(handler || this); return; }
  var elementsData =
      /** @type {{entities:!Array.<picnet.data.IEntity>,type:string}} */
      (arr.pop());
  this.local_.repository.saveList(elementsData.type, elementsData.entities,
      function() {
        if (!initialRequest) {
          this.memory_.repository.saveList(
              elementsData.type, elementsData.entities, function() {}, this); }
        this.updateLocalChangesImpl_(initialRequest, arr, callback, handler);
      }, this);
};


/**
 * @private
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.clearEntireDatabase_ =
    function(callback, handler) {
  this.local_.clearEntireDatabase(callback, handler);
};


/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {!Object.<string, Array.<picnet.data.IEntity>>} changes The entities
 *    that need to be removed from the local repository.
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.deleteLocalEntities_ =
    function(initialRequest, changes, callback, handler) {
  var arr = [];
  goog.object.forEach(changes['DeletedIDs'], function(o) {
    var idpos = o.indexOf('_');
    var type = o.substring(0, idpos);
    var id = parseInt(o.substring(idpos + 1), 10);
    arr.push({'type': type, 'id': id});
  });

  this.deleteLocalEntitiesImpl_(initialRequest, arr, function() {
    callback.call(handler || this);
  }, this);
};

/**
 * @private
 * @param {boolean} initialRequest Wether this is the intial request to the
 *    server.
 * @param {Array.<Array.<{entities:picnet.data.IEntity,type:string}>>} arr The
 *    entities that need to be removed from the local repository.
 * @param {!function()} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */

picnet.data.DataManager.prototype.deleteLocalEntitiesImpl_ =
    function(initialRequest, arr, callback, handler) {
  if (arr.length === 0) {callback.call(handler || this); return; }
  var elementsData = /** @type {{type:string,id:number}} */ (arr.pop());
  this.local_.repository.deleteItem(elementsData.type, elementsData.id,
      function() {
        this.deleteLocalEntitiesImpl_(initialRequest, arr, callback, handler);
      }, this);
  if (!initialRequest) {
    this.memory_.deleteEntity(elementsData.type, elementsData.id,
        function() {});
  }
};


/**
 * @param {!function(Array.<string>)} callback The success callback.
 * @param {Object=} handler The context to use when calling the callback.
 */
picnet.data.DataManager.prototype.updateEntireInMemoryStore =
    function(callback, handler) {
  var start = new Date().getTime();

  var alldata = {};
  this.local_.repository.getListsImpl(this.types_, alldata, function() {
    for (var type in alldata) {
      this.memory_.repository.saveList(type, alldata[type],
          function() {}, this);
    }
    this.log('updateEntireInMemoryStore took: ' +
        (new Date().getTime() - start) + 'ms');
    callback.call(handler || this);
  }, this);
};


/** @inheritDoc */
picnet.data.DataManager.prototype.getEntities = function(type) {
  return this.memory_.getEntities(type);
};


/** @inheritDoc */
picnet.data.DataManager.prototype.getEntity = function(type, id) {
  return this.memory_.getEntity(type, id);
};


/** @inheritDoc */
picnet.data.DataManager.prototype.saveEntity =
    function(type, data, callback, handler) {
  if (this.onPreSave && !this.onPreSave(type, data)) return;
  var errors = this.onValidateEntity ? this.onValidateEntity(type, data) : [];
  if (errors.length > 0) {
    callback.call(handler || this,
        /** @type {picnet.data.TransactionResult} */ ({'Errors': errors}));
    return;
  }

  this.remote_.saveEntity(type, data, function(results) {
    if (!this.isonline_) {
      this.local_.saveEntity(type, data, function(results2) {
        if (results2.Errors && results2.Errors.length > 0) {
          callback.call(handler || this, results2);
          return;
        }
        data.ID = results2.ID;
        this.memory_.saveEntity(type, data);
        this.local_.saveUnsavedEntity(type, data, function() {
          callback.call(handler || this, results2);
        }, this);
      }, this);
    } else {
      if (results.Errors && results.Errors.length > 0) {
        callback.call(handler || this, results);
        return;
      }
      data.ID = results.ID;
      this.local_.saveEntity(type, data, function() {
        this.memory_.saveEntity(type, data);
        callback.call(handler || this, results);
      }, this);
    }
  }, this);
};


/** @inheritDoc */
picnet.data.DataManager.prototype.deleteEntity =
    function(type, id, callback, handler) {
  this.remote_.deleteEntity(type, id, function(results) {
    if (results === picnet.data.RemoteDataProvider.OFFLINE) {
      this.local_.deleteEntity(type, id, function(results2) {
        if (results2.Errors && results2.Errors.length > 0) {
          callback.call(handler || this, results2);
          return;
        }
        this.local_.saveDeletedEntity(type, id, function() {
          this.memory_.deleteEntity(type, id, function() {
            callback.call(handler || this, results2);
          });
        }, this);
      }, this);
    } else {
      if (results.Errors && results.Errors.length > 0) {
        callback.call(handler || this, results);
        return;
      }
      this.local_.deleteEntity(type, id, function() {
        this.memory_.deleteEntity(type, id, function() {
          callback.call(handler || this, results);
        });
      }, this);
    }
  }, this);
};


/** @inheritDoc */
picnet.data.DataManager.prototype.deleteEntities =
    function(type, ids, callback, handler) {
  if (!ids || ids.length === 0) {
    callback.call(handler || this, []);
    return;
  }

  this.remote_.deleteEntities(type, ids, function(results) {
    if (results === picnet.data.RemoteDataProvider.OFFLINE) {
      this.local_.deleteEntities(type, ids, function(results2) {
        var errors2 = [];
        goog.array.forEach(results2, function(tr) { if (tr.Errors) {
          errors2 = goog.array.concat(errors, tr.Errors);
        } });
        if (errors2 && errors2.length > 0) {
          callback.call(handler || this, results2);
          return;
        }
        this.local_.saveDeletedEntities(type, ids, function() {
          this.memory_.deleteEntities(type, ids, function() {});
          callback.call(handler || this, results2);
          return;
        }, this);
      }, this);
    } else {
      var errors = [];
      goog.array.forEach(results, function(tr) { if (tr.Errors) {
        errors = goog.array.concat(errors, tr.Errors); }
      });
      if (errors && errors.length > 0) {
        callback.call(handler || this, results);
        return;
      }

      this.local_.deleteEntities(type, ids, function() {
        this.memory_.deleteEntities(type, ids, function() {
          callback.call(handler || this, results);
        });
      }, this);
    }
  }, this);
};


/** @inheritDoc */
picnet.data.DataManager.prototype.saveEntities =
    function(data, callback, handler) {
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
        callback.call(handler || this, [{'Errors': errors}]);
        return;
      }
    }

  }

  this.remote_.saveEntities(data, function(results) {
    if (results === picnet.data.RemoteDataProvider.OFFLINE) {
      this.local_.saveEntities(data, function(results2) {
        if (!this.postSave_(data, results2, callback, handler)) { return; }
        this.memory_.saveEntities(data);
        this.local_.saveUnsavedEntities(data, function() {
          callback.call(handler || this, results2);
        }, this);
      }, this);
    } else {
      if (!this.postSave_(data, results, callback, handler)) { return; }
      this.local_.saveEntities(data, function() {
        this.memory_.saveEntities(data);
        callback.call(handler || this, results);
        return;
      }, this);
    }
  }, this);
};


/**
 * @private
 * @param {!Object.<string, Array.<picnet.data.IEntity>>} data The data just
 *    saved.
 * @param {!Array.<picnet.data.TransactionResult>} results The results of the
 *    save operation.
 * @param {!function(Array.<picnet.data.TransactionResult>)} callback The
 *    success callback.
 * @param {Object=} handler The context to use when calling the callback.
 * @return {boolean} Wether the postSave operation was successful.
 */
picnet.data.DataManager.prototype.postSave_ =
    function(data, results, callback, handler) {
  var errors = [];
  goog.array.forEach(results, function(tr) {
    if (tr.Errors) { errors = goog.array.concat(errors, tr.Errors); }
  });
  if (errors && errors.length > 0) {
    callback.call(handler || this, results);
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


/** @inheritDoc */
picnet.data.DataManager.prototype.disposeInternal = function() {
  picnet.data.DataManager.superClass_.disposeInternal.call(this);

  goog.dispose(this.remote_);
  goog.dispose(this.memory_);
  goog.dispose(this.local_);
};
