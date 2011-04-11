;
goog.provide('pn.bind.Source');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {function(Object=):*} getter
 * @param {Object=} ctx
 */
pn.bind.Source = function(getter, ctx) {
  goog.events.EventTarget.call(this);
  
  this.getter_ = getter;
  this.ctx_ = ctx;
};
goog.inherits(pn.bind.Source, goog.events.EventTarget);

goog.scope(function() {

  var s = pn.bind.Source;
  var sp = pn.bind.Source.prototype;
   
  sp.getValue = function() {    
    return this.getter_(this.ctx_);
  };
  
  /** @inheritDoc */
  sp.toString = function() { 
    return 'Source: ' + (this.ctx_ ? this.ctx_.toString() : 'unknown'); 
  };

  sp.fireChange_ = function(src) {
    var event = new goog.events.Event(goog.events.EventType.CHANGE, this);
    event.source = src;
    this.dispatchEvent(event);
  };

  ////////////////////////////////////////////////////////////////////////////////
  // Factories
  ////////////////////////////////////////////////////////////////////////////////

  s.createEventSource = function(src, eventName, getter) {
    var source = new s(getter, src);
    goog.events.listen(src, eventName, function(e) {
      this.fireChange_(src);
    }, false, source);
    return source;
  };

  s.createObjectPropertySource = function(src, getter, setter) {
    var source = new s(goog.bind(getter, src), src);
    s.interceptSetter_(source, src, setter);
    return source;
  };

  s.createObjectAllPropertiesSource = function(src) {
    var source = new s(function() { return src; }, src);

    for (var i in src) {
      if (i.indexOf('set') === 0) {      
        s.interceptSetter_(source, src, src[i]);
      }
    }

    return source;
  };

  s.interceptSetter_ = function(source, src, setter) {
    goog.asserts.assert(source != null, '[source] cannot be null');
    goog.asserts.assert(src != null, '[src] cannot be null');
    goog.asserts.assert(setter != null, '[setter] cannot be null');
    
    var newSetter = function(val, element, ignore) {      
      setter.call(src, val, element, true);
      if (ignore) return;           
      source.fireChange_(src);       
    };
    
    for (var i in src) {
      if (src[i] === setter) {
        src[i] = newSetter;
        return source;
      }
    }
    throw new Error('Could not override the default setter');
  };

});
