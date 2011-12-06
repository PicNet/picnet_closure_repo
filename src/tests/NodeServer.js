var http = require('http');
var server = new TestServer();

http.createServer(function(req, res) {
  // if (req.method !== 'POST') { throw new Error('Only POST supported'); }
  res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin' : '*'});
  var respdata = getResponseJson(req.url.split('/')[1], parseQueryStringArgs(req.url.split('?')[1]));
  console.log('req: ' + req.url + ' response: ');
  console.dir(respdata);
  var json = JSON.stringify(respdata);
  res.end(json);
}).listen(8124, '127.0.0.1');

function parseQueryStringArgs(queryString) {
  var querystr = unescape(queryString).split('&');
  var argsArr = []; // Ignoring names
  for (var i = 0, len = querystr.length; i < len; i++) {
    var qsarg = querystr[i].split('=');
    var name = qsarg[0];
    var val = qsarg[1];
    if (name === 'id' || name === 'since') { val = parseInt(val, 10); }
    else if (name !== 'type') { val = JSON.parse(val); }

    argsArr.push(val);
  }
  return argsArr;
}

function getResponseJson(action, args) {
  if (typeof server[action] !== 'function') throw new Error('Could not find the specified action "' + action + '"');
  return server[action].apply(server, args);
}


////////////////////////////////////////////////////////////////////////////////
// DATA ACCESS INTERFACE METHODS
////////////////////////////////////////////////////////////////////////////////

function TestServer() {
  this.data = {};
}

TestServer.prototype.GetEntities = function(type) {
  return this.data[type];
};

TestServer.prototype.GetEntity = function(type, id) {
  var arr = this.data[type];
  if (arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
      var e = arr[i];
      if (e.ID === id) return e;
    }
  }
  return null;
};

TestServer.prototype.DeleteEntity = function(type, id) {
  var arr = this.data[type];
  var found = false;
  if (arr) {
    var newarr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i].ID !== id) {
        newarr.push(arr[i]);
      } else {
        found = true;
      }
    }
    this.data[type] = newarr;
  }
  return found;
};

TestServer.prototype.SaveEntity = function(type, entity) {
  var arr = this.data[type];
  if (!arr) arr = [];
  var found = false;
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i].ID === entity.ID) {
      found = true;
      arr[i] = entity;
    }
  }
  if (!found) { arr.push(entity); }
  this.data[type] = arr;
  return true;
};

TestServer.prototype.SaveEntities = function(data) {
  for (var type in data) {
    var arr = JSON.parse(data[type]);
    // This does not append which perhaps should be the better behaviour
    this.data[type] = arr;
  }
  return true;
};

TestServer.prototype.DeleteEntities = function(type, ids) {
  var arr = this.data[type];
  var found = false;
  if (arr) {
    var newarr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      if (ids.indexOf(arr[i].ID) < 0) {
        newarr.push(arr[i]);
      } else { found = true; }
    }
    this.data[type] = newarr;
  }
  return found;
};

TestServer.prototype.UpdateServer = function(tosave, todelete) {
  this.SaveEntities(tosave);
  for (var type in todelete) { this.DeleteEntities(type, todelete[type]); }
  return true;
};

TestServer.prototype.GetChangesSince = function(since) {
  return null;
};

console.log('Server running at http://127.0.0.1:8124/');
