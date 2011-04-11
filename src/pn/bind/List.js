;
goog.provide('pn.bind.List');

goog.require('goog.asserts');



/**
 * @constructor
 * @extends {pn.bind.Source}
 * @param {Array.<*>=} initial
 * @param {!function(*):pn.bind.Source=} elementSourceCreator
 */
pn.bind.List = function(initial, elementSourceCreator) {
  pn.bind.Source.call(this,
      goog.bind(function() { return this; }, this));

  this.elementSourceCreator_ = elementSourceCreator ||
      pn.bind.Source.createObjectAllPropertiesSource;
  this.internal_ = [];
  this.pushAll(initial);
};
goog.inherits(pn.bind.List, pn.bind.Source);

goog.scope(function() {

  var l = pn.bind.List;
  var lp = pn.bind.List.prototype;

  lp.getInternalArray = function() {
    return goog.array.map(this.internal_, function(i) { return i.getValue(); });
  };

  lp.push = function(o) {
    goog.asserts.assert(typeof (o.getValue) === 'undefined',
        'push cannot be called with a source object');

    this.internal_.push(this.createArrayElementSource_(o));
    this.fireChange_(this);
  };

  lp.copy = function(arr) {
    this.internal_ = [];
    this.pushAll(arr);
  };

  lp.pushAll = function(arr) {
    if (!arr) return;
    goog.array.forEach(arr, function(o) {
      goog.asserts.assert(typeof (o.getValue) === 'undefined',
          'pushAll cannot be called with a source object');
      this.internal_.push(this.createArrayElementSource_(o));
    }, this);
    this.fireChange_(this);
  };

  lp.clear = function() {
    this.internal_ = [];
    this.fireChange_(this);
  };

  lp.remove = function(idx) {
    delete this.internal_[idx];
    this.fireChange_(this);
  };

  lp.setValueAt = function(o, idx) {
    goog.asserts.assert(typeof (o.getValue) === 'undefined',
        'setValueAt cannot be called with a source object');
    this.internal_[idx] = this.createArrayElementSource_(o);
    this.fireChange_(this);
  };

  lp.getValueAt = function(idx) {
    return this.internal_[idx].getValue();
  };

  lp.getLength = function() { return this.internal_.length; }

  lp.toString = function() {
    return '[\n\t' + this.getInternalArray().join('\n\t') + '\n]';
  };

  /**
   * @param {!*} o
   * @return {pn.bind.Source}
   */
  lp.createArrayElementSource_ = function(o) {
    var s = this.elementSourceCreator_(o);
    goog.events.listen(s, goog.events.EventType.CHANGE, 
      function(item) { this.fireChange_(this); }, false, this);
    return s;
  };

});
