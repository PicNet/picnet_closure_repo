;
goog.provide('pn.bind.Binding');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventType');



/**
 * @constructor
 * @param {!Array.<pn.bind.Source>} sources
 * @param {!Array.<pn.bind.Target>} targets 
 */
pn.bind.Binding = function(sources, targets) {
  goog.asserts.assert(sources != null, '[sources] cannot be null');
  goog.asserts.assert(sources.length > 0, '[sources] cannot be empty');
  goog.asserts.assert(targets != null, '[targets] cannot be null');
  goog.asserts.assert(targets.length > 0, '[targets] cannot be empty');

  this.sources_ = sources;
  this.targets_ = targets;

  this.setUpBindings_();  
};

goog.scope(function() {

  var b = pn.bind.Binding;
  var bp = pn.bind.Binding.prototype;
  
  b.initiatingBinding = null;
  
  bp.refresh = function() {
    this.fireToBindTargets_(function() {
      goog.array.forEach(this.sources_, function(s) {
        var value = s.getValue();
        if (!value) return;
        this.setTargetsValue_(s, null, true);
      }, this);
    }, this);
  };
  
  bp.setUpBindings_ = function() {
    goog.array.forEach(this.sources_, this.setUpBindingForSource_, this);
  };

  bp.setUpBindingForSource_ = function(s) {
    goog.events.listen(s, goog.events.EventType.CHANGE,
        this.sourceChanged_, false, this);
  };

  bp.sourceChanged_ = function(e) {
    this.fireToBindTargets_(function() {
      this.setTargetsValue_(e.target, e.source, false);
    }, this);
  }
  
  bp.fireToBindTargets_ = function(worker, ctx) {
    var isInitiating = !goog.isDefAndNotNull(b.initiatingBinding);    
    if (isInitiating) { b.initiatingBinding = this;  }
    try { worker.call(ctx); } 
    finally { if (isInitiating) { b.initiatingBinding = null; } }
  };

  bp.setTargetsValue_ = function(source, element, initial) {        
    var value = source.getValue();    
    goog.array.forEach(this.targets_, function(t) {
      if (t === source) return; // Don't set it on the source
      var ignorable = t.getIgnorableInitiatingBindings();
      if (ignorable && goog.array.contains(ignorable, b.initiatingBinding)) { 
        return; 
      }
      t.setValue(value, element, initial);
    }, this);
  };

});
