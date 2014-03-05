;
goog.provide('pn.infra.Ajax');

goog.require('goog.net.XhrManager');
goog.require('goog.structs.Map');
goog.require('goog.uri.utils');
goog.require('pn.log');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {string} appPath The application path for server requests.
 */
pn.infra.Ajax = function(appPath) {
  pn.assStr(appPath);

  goog.events.EventTarget.call(this);

  /** @private @type {goog.debug.Logger} */
  this.log_ = pn.log.getLogger('pn.infra.Ajax');

  /** @private @const @type {string} */
  this.appPath_ = appPath;

  /** @private @type {goog.net.XhrManager} */
  this.xhr_ = null;

  /** @private @type {number} */
  this.rid_ = 0;
};
goog.inherits(pn.infra.Ajax, goog.events.EventTarget);


/**
 * @param {string} action The name of the action to call on the server.
 * @param {string} method The name of the HTTP method to use for the call.
 * @param {!Object} data The map of data to pass to the server.
 * @param {function(string, Object):undefined} success The success callback.
 * @param {function(string, Object):undefined} fail The failure callback.
 */
pn.infra.Ajax.prototype.request =
    function(action, method, data, success, fail) {
  pn.assStr(action);
  pn.assStr(method);
  pn.assObj(data);
  pn.assFun(success);
  pn.assFun(fail);

  ++this.rid_;

  var uri = this.appPath_ + '/' + action,
      reqdata = this.requestData(method, data);

  // TODO: if any exceptions in the communication,
  //    need to use offline mode
  this.ajax_(uri, method, reqdata, success, fail);
};


/**
 * @param {string} method The name of the HTTP method to use for the call.
 * @param {!Object} data The map of data to pass to the server.
 * @return {string} The string representation of the request data.
 */
pn.infra.Ajax.prototype.requestData = function(method, data) {
  pn.assStr(method);
  pn.assObj(data);
  return method === 'GET' ?
      goog.uri.utils.buildQueryDataFromMap(data) :
      pn.json.serialiseJson(data);
};


/**
 * @private
 * @param {string} uri The full uri for the request.
 * @param {string} method The POST/GET method.
 * @param {string} data The query data for the request.
 * @param {function(string, Object):undefined} success The success callback.
 * @param {function(string, Object):undefined} fail The failure callback.
 */
pn.infra.Ajax.prototype.ajax_ = function(uri, method, data, success, fail) {
  pn.assStr(uri);
  pn.assStr(method);
  pn.assStr(data);
  pn.assFun(success);
  pn.assFun(fail);

  if (method === 'GET' && data) {
    uri += '?' + data.replace(/%7C/g, ',');
    data = '';
  }

  this.log_.fine('making request request uri[' + uri + '] method[' +
      method + '] data[' + data.substring(0, 20) + ']');

  var callback = this.ajaxcb_.pnbind(this, uri, method, data, success, fail);
  if (this.xhr_) {
    var rid = this.rid_.toString();
    this.xhr_.send(rid, uri, method, data, undefined, undefined, callback);
  } else {
    var headers = new goog.structs.Map({ 'Content-Type': 'application/json' });
    goog.net.XhrIo.send(uri, callback, method, data, headers);
  }
};


/**
 * @private
 * @param {function(string, Object):undefined} success The success callback.
 * @param {function(string, Object):undefined} fail The failure callback.
 * @param {!goog.events.Event} e The XHR event
 */
pn.infra.Ajax.prototype.ajaxcb_ = function(success, fail, e) {
  pn.assFun(success);
  pn.assFun(fail);
  pn.assInst(e, goog.events.Event);

  var xhr = e.target,
      error = xhr.getLastError(),
      text = xhr.getResponseText(),
      serverreply = {};

  if (!error && goog.string.startsWith(text, '<')) {
    // Server side error, returned as html
    // <title>IIS 7.5 Detailed Error - 404.0 - Not Found</title>
    error = text.match('<title>(.*)?</title>')[1];
  }

  if (!error) {
    serverreply = pn.json.parseJson(text) || {};
    if (serverreply['errorMessage']) {
      error = serverreply['errorMessage'].replace(/\|/, '<br />');
    }
  }

  if (error) { fail(error, serverreply); }
  else { success(text, serverreply); }
};
