
goog.require('goog.Uri.QueryData');
goog.require('goog.net.XhrIo');

goog.require('picnet.data.IDataAjaxRequest');

goog.provide('picnet.MockAjaxProvider');

/**
 * @constructor
 * @implements {picnet.data.IDataAjaxRequest}
 * @param {!Array.<string>} types
 */
function MockAjaxProvider(types) {
    this.log = goog.debug.Logger.getLogger('picnet.data.MockAjaxProvider');
    this.log.setLevel(goog.debug.Logger.Level.FINEST);
	
    this.memory = new picnet.data.InMemoryRepository();    	    	
};

/** @inheritDoc */
MockAjaxProvider.prototype.makeAjaxRequest = function(method, data, callback, offlineCallback, handler) {
    this.log.fine('MockAjaxProvider.makeAjaxRequest: ' + method);	

    switch(method) {
      case 'SaveEntity': 
        var entity = picnet.Utils.parseJson(data.entity);
        this.memory.saveItem(data.type, /** @type {picnet.data.IEntity} */ (entity)); 
        return callback.call(handler, {ClientID:entity.ID,ID:entity.ID,Errors:[]});
      case 'SaveEntities': 	
        var allEntities = picnet.Utils.parseJson(data.data);
        var results = [];
        for (var type in allEntities) {
          var entities = /** @type {!Array} */ (picnet.Utils.parseJson(allEntities[type]));				
          goog.array.forEach(entities, function(e, idx) { if (e.ID < 0) e.ID = new Date().getTime() + idx; })
          this.memory.saveList(type, entities); 
          allEntities[type] = entities;				
          goog.array.concat(results, goog.array.map(entities, function(entity) { return {ClientID:entity.ID,ID:entity.ID,Errors:[]} }));
        }														
        return callback.call(handler, results);
      case 'GetEntities': 
        return callback.call(handler, this.memory.getList(data.type));
      case 'GetEntity': 
        return callback.call(handler, this.memory.getItem(data.type, data.id));
      case 'DeleteEntity':			 
        this.memory.deleteItem(data.type, data.id); 
        return callback.call(handler, {ClientID:data.id,ID:data.id,Errors:[]});
      case 'DeleteEntities':            
        goog.array.forEach(data.ids, function(id) { this.memory.deleteItem(data.type, id) }, this); 
        return callback.call(handler, goog.array.map(data.ids, function(id) { return {ClientID:id,ID:id,Errors:[]} }));
      case 'UpdateServer':			
        var todelete = picnet.Utils.parseJson(data.todelete);
        this.makeAjaxRequest('SaveEntities', {data:data.tosave}, function() {}, null, this);
        for (var i in todelete) { this.makeAjaxRequest('DeleteEntities', {type:i,ids:todelete[i]}, function() {}, null, this); }
        return callback.call(handler);
      // case 'GetChangesSince'            
      default: throw 'method [' + method + '] not supported';
    }    
};

MockAjaxProvider.prototype.getEntities = function(type, callback, handler) { 
  var list = this.memory.getList(type);
  if (callback) callback.call(handler, list);
  return list; 
};

/**
 * @constructor
 */
MockAjaxProvider.RealServerAjax = function() {
  this.url = 'http://localhost/';
};

MockAjaxProvider.RealServerAjax.prototype.getEntities = function(type, callback, handler) {
  this.makeAjaxRequest('GetEntities', {type:type}, callback, null, handler);
};
  
MockAjaxProvider.RealServerAjax.prototype.makeAjaxRequest = function(method, data, callback, offlineCallback, handler) {        
  var datastr = goog.Uri.QueryData.createFromMap(data || {}).toString();
  var url = this.url + method + '/?' + datastr;                 
  goog.net.XhrIo.send(url, function (e) {
      var xhr = /** @type {goog.net.XhrIo} */ (e.target);        
      if (!xhr.isSuccess()) {                         
        throw new Error('Error: ' + xhr);
      }

      var txt = xhr.getResponseText();                                
      var json = picnet.Utils.parseJson(txt);                    
      callback.call(handler, json);          
  }, 'POST'); 
};