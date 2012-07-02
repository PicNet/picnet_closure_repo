;
goog.provide('pn.data.Data');



/**
 * @constructor
 * @implements {pn.data.IDataSource}
 * @param {boolean} serverSync If true all client data is kept upto date live
 *    with the server. That is, when any data change is done on the server that
 *    change is reflected live on the client.
 */
pn.data.Data = function(serverSync) {
  /**
   * @private
   * @type {boolean}
   */
  this.serverSync_ = serverSync;

  /**
   * @private
   * @type {!pn.data.BaseSource}
   */
  this.source_ = serverSync ?
      new pn.data.ClientSource(new pn.data.ServerSource()) :
      new pn.data.ServerSource();
};


/** @override */
pn.data.Data.prototype.getEntityLists = function(types, callback) {
  this.source_.getEntityLists(types, callback);
};


/** @override */
pn.data.Data.prototype.getEntity = function(type, id, callback) {
  this.source_.getEntity(type, id, callback);
};
