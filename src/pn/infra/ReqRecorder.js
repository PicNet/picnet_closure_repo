goog.provide('pn.infra.ReqRecorder');

goog.require('goog.ui.IdGenerator');
goog.require('pn');
goog.require('pn.data.Storage');
goog.require('pn.json');



/**
 * @constructor
 * @param {!pn.data.Storage} storage The mechanism to store login data.
 */
pn.infra.ReqRecorder = function(storage) {
  pn.assInst(storage, pn.data.Storage);

  /** @private @type {goog.debug.Logger} */
  this.log_ = pn.log.getLogger('pn.infra.ReqRecorder');

  /** @private @type {!pn.data.Storage} */
  this.storage_ = storage;
};


/**
 * @param {function(!Array.<{key:string,data:{uri:string,data:string}}>):undefined}
 *    cb The callback that takes the stored post in.
 */
pn.infra.ReqRecorder.prototype.getPosts = function(cb) {
  this.storage_.keys(goog.bind(function(keys) {
    var postkeys = keys.pnfilter(
        function(key) { return goog.string.startsWith(key, 'post-'); });
    this.storage_.get(postkeys, function(data) {
      var posts = /** @type {!Array.<{key:string,data:
          {uri:string,data:string}}>} */ (data);
      cb(posts);
    }
    );
  }, this));
};


/**
 * @param {string} key The key for post.
 */
pn.infra.ReqRecorder.prototype.removePost = function(key) {
  this.storage_.remove(key, goog.bind(function() {
    this.log_.fine('Remvoed Post [' + key + ']');
  }, this));
};


/**
 * @param {string} user The currently logged in username.
 * @param {string} method The HTTP method (Either GET/POST).
 * @param {string} uri The uri of the request.
 * @param {string} data The data to pass to the request.
 * @param {function(Object):undefined} cb The callback that takes the data in
 *    for the specified request.
 */
pn.infra.ReqRecorder.prototype.get = function(user, method, uri, data, cb) {
  pn.assStr(user);
  pn.assStr(method);
  pn.assStr(uri);
  pn.assStr(data);

  var key = this.key_(user, method, uri, data);
  this.storage_.get(key, function(response) {
    cb(!!response ? response['data'] : null);
  });
};


/**
 * @param {string} user The currently logged in username.
 * @param {string} uri The uri of the request.
 * @param {string} data The data to pass to the request.
 * @param {function():undefined} cb The callback that takes the data in
 *    for the specified request.
 */
pn.infra.ReqRecorder.prototype.post = function(user, uri, data, cb) {
  pn.assStr(user);
  pn.assStr(uri);
  pn.assStr(data);

  var key = 'post-' + new Date().valueOf();

  this.storage_.save({ 'key': key, 'data': { 'uri': uri, 'data': data } }, cb);
};


/**
 * @param {string} user The currently logged in username.
 * @param {string} method The HTTP method (Either GET/POST).
 * @param {string} uri The uri of the request.
 * @param {string} data The data to pass to the request.
 * @param {string} resp The response from the request.
 */
pn.infra.ReqRecorder.prototype.save =
    function(user, method, uri, data, resp) {
  pn.assStr(user);
  pn.assStr(method);
  pn.assStr(uri);
  pn.assStr(data);
  pn.assStr(resp);

  var key = this.key_(user, method, uri, data);
  this.storage_.save({ 'key' : key, 'data': resp }, goog.nullFunction);
};


/**
 * @private
 * @param {string} user The currently logged in username.
 * @param {string} method The HTTP method (Either GET/POST).
 * @param {string} uri The uri of the request.
 * @param {string} data The data to pass to the request.
 * @return {string} The local store key for the specified request.  This is
 *    the request details + the current user.
 */
pn.infra.ReqRecorder.prototype.key_ = function(user, method, uri, data) {
  pn.assStr(user);
  pn.assStr(method);
  pn.assStr(uri);
  pn.assStr(data);

  return user + '|' + method + '|' + uri + '|' + data;
};
