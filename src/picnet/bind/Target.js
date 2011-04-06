;
goog.provide('picnet.bind.Target');



/**
 * @constructor
 * @param {function(Object, Object, boolean=):undefined} setter
 */
picnet.bind.Target = function(setter) {
  this.setter_ = setter;  
  this.ignorableBindings_ = [];
};

goog.scope(function() {

  var t = picnet.bind.Target;
  var tp = picnet.bind.Target.prototype;

  tp.setValue = function(value, element) {    
    this.setter_(value, element, true); // true is for ignore
  };
  
  tp.setIgnorableInitiatingBindings = function(bindings) {
    this.ignorableBindings_ = bindings;
  };
  
  tp.getIgnorableInitiatingBindings = function() { 
    return this.ignorableBindings_; 
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Factories
  ////////////////////////////////////////////////////////////////////////////////

  t.createObjectSetterTarget = function(src, setter) {
    return new t(goog.bind(setter, src));
  };

  t.createTextElementTarget = function(element) {
    return new t(function(value) {
      goog.dom.setTextContent(element, value);
    });
  };

  t.createInnerHtmlTarget = function(element) {
    return new t(function(value) {
      element.innerHTML = value;
    });
  };

  t.createValueTarget = function(element) {
    return new t(function(value) {
      element.value = value;
    });
  };

  t.createListTarget = function(list) {
    return new t(function(sourceList) {
      // Reset the target array to be equal to array
      list.copy(sourceList.getInternalArray());
    });
  };

}); // End Scope
