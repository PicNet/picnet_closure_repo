
goog.provide('pn.demo.Binddemo');

goog.require('goog.dom');
goog.require('goog.events');

goog.require('pn.bind.Binding')
goog.require('pn.bind.Source')
goog.require('pn.bind.Target')
goog.require('pn.bind.List');

/**
 * @constructor
 * @export 
 */
pn.demo.Binddemo = function() {  
  this.initdemo1();
  this.initdemo2();
  this.initdemo3();
  this.initdemo4();
  this.initdemo5();
};

/** 
 * @constructor
 * @param {string=} name
 * @param {number=} age
 */
pn.demo.SourceClass = function(name, age) {
  this.name = name || 'Initial Name';    
  this.age = age || 100;
};  

pn.demo.SourceClass.prototype.getName = function() { return this.name; };
pn.demo.SourceClass.prototype.setName = function(value) { this.name = value; };
pn.demo.SourceClass.prototype.getAge = function() { return this.age; };
pn.demo.SourceClass.prototype.setAge = function(value) { this.age = value; };
pn.demo.SourceClass.prototype.toString = function() { return ' name: ' + this.name + ' age: ' + this.age; };

pn.demo.Binddemo.prototype.initdemo1 = function() {    
  var link1 = goog.dom.getElement('link1');
  var lbl1 = goog.dom.getElement('lbl1');
  var source = new pn.demo.SourceClass();
  
  var binding = new pn.bind.Binding(
    [pn.bind.Source.createObjectPropertySource(source, source.getName, source.setName)],
    [pn.bind.Target.createInnerHtmlTarget(lbl1)]);
  binding.refresh(); // Set initial target value  
  
  setUpRandomLink(link1, source);
};

pn.demo.Binddemo.prototype.initdemo2 = function() {
  var link2 = goog.dom.getElement('link2');
  var lbl2 = goog.dom.getElement('lbl2');
  var inp2 = goog.dom.getElement('inp2');
  var source = new pn.demo.SourceClass();
  
  var binding = new pn.bind.Binding(
    [
      pn.bind.Source.createObjectPropertySource(source, source.getName, source.setName),
      pn.bind.Source.createEventSource(inp2, 'keyup', function() { return inp2.value; })
    ],
    [
      pn.bind.Target.createInnerHtmlTarget(lbl2),
      pn.bind.Target.createObjectSetterTarget(source, source.setName), 
      pn.bind.Target.createValueTarget(inp2)
    ]);
  binding.refresh(); // Set initial target value
  
  setUpRandomLink(link2, source);
};

pn.demo.Binddemo.prototype.initdemo3 = function() {  
  var inp3_1 = goog.dom.getElement('inp3_1');
  var inp3_2 = goog.dom.getElement('inp3_2');
  var source = new pn.demo.SourceClass();
  
  var binding = new pn.bind.Binding(
    [      
      pn.bind.Source.createEventSource(inp3_1, 'keyup', function() { return inp3_1.value; }),
      pn.bind.Source.createEventSource(inp3_2, 'keyup', function() { return inp3_2.value; })
    ],
    [      
      pn.bind.Target.createValueTarget(inp3_1),
      pn.bind.Target.createValueTarget(inp3_2)
    ]);
  binding.refresh(); // Set initial target value
};

pn.demo.Binddemo.prototype.initdemo4 = function() {  
  var list = new pn.bind.List([new pn.demo.SourceClass(), new pn.demo.SourceClass()]);
  var tbl4 = goog.dom.getElement('tbl4');
  var lbl4 = goog.dom.getElement('lbl4');
  var link4 = goog.dom.getElement('link4');
  
  var binding = new pn.bind.Binding([list], [
    new pn.bind.Target(function(modified) {        
      populateTableFromArray(list.getInternalArray(), false, 'demo4_', tbl4);    
    }),
    pn.bind.Target.createInnerHtmlTarget(lbl4)
  ]);
  binding.refresh(); // Set initial target value
  
  setUpRandomLink(link4, list);  
};

// TODO: Clean up API
pn.demo.Binddemo.prototype.initdemo5 = function() {  
  var list = new pn.bind.List([new pn.demo.SourceClass('Initial 1', 1), new pn.demo.SourceClass('Initial 2', 2)]);
  var tbl5 = goog.dom.getElement('tbl5');
  var lbl5 = goog.dom.getElement('lbl5');
  var link5 = goog.dom.getElement('link5');
    
  var target = new pn.bind.Target(function() {      
    var arr = list.getInternalArray();    
    populateTableFromArray(arr, true, 'demo5_', tbl5);        
    demo5CreateInnerBindings(target, arr, 'demo5_');      
  });  
 
  var binding = new pn.bind.Binding([list], [
    pn.bind.Target.createInnerHtmlTarget(lbl5),
    target
  ]);
  binding.refresh(); // Set initial target value  
    
  setUpRandomLink(link5, list);
};

function demo5CreateInnerBindings(tableTarget, arr, idprefix) {       
  var ignoreable = [];
  for (var i = 0, len = arr.length; i < len; i++) {          
    demo5CreateInnerBindingImpl(arr[i], i, idprefix, ignoreable);
  }  
  tableTarget.setIgnorableInitiatingBindings(ignoreable);
  tableTarget.toString = function() { return 'TABLE'; }
};

function demo5CreateInnerBindingImpl(r, i, idprefix, ignoreable) {
  var i_name = goog.dom.getElement(idprefix + i + '_name');
  var i_age = goog.dom.getElement(idprefix + i + '_age');
  
  var name_target = new pn.bind.Target(function (val) {                                        
    r.setName(val);                
  });      
         
  var age_target = new pn.bind.Target(function (val) {                                
    r.setAge(val);                
  });      
  
  var name_binding = new pn.bind.Binding(
    [pn.bind.Source.createEventSource(i_name, 'keyup', 
      function(src) { return src.value; })], 
    [name_target]); // Do not refresh on purpose (stackoverflow)
  
  var age_binding = new pn.bind.Binding(
    [pn.bind.Source.createEventSource(i_age, 'keyup', 
      function(src) { return src.value; })], 
    [age_target]); // Do not refresh on purpose (stackoverflow)
  ignoreable.push(name_binding, age_binding);
};

function populateTableFromArray(arr, editable, idprefix, container) {
  var html = '<table><tr><th>Name</th><th>Age</th></tr>';
  for (var i = 0, len = arr.length; i < len; i++) {
    var r = arr[i];      
    html += '<tr><td><input type="text" ' + (editable ? '' : 'readonly') + ' id="' + idprefix + i + '_name" value="' + r.name + 
      '"/></td><td><input type="text" ' + (editable ? '' : 'readonly') + ' id="' + idprefix + i + '_age" value="' + r.age + 
      '"/></td></tr>';
  }
  html += '</table>';
  container.innerHTML = html;
};

function setUpRandomLink(link, obj) {
  goog.events.listen(link, 'click', function() {    
    if (typeof (obj.getLength) === 'undefined') {
      populateItemWithRandoms(obj);
    } else {         
      goog.array.forEach(obj.getInternalArray(), populateItemWithRandoms);    
    }
  });
};

function populateItemWithRandoms(o) {
  o.setAge(parseInt(Math.random() * 100, 10));
  o.setName('Random: ' + parseInt(Math.random() * 1000, 10));      
};

goog.exportSymbol('pn.demo.Binddemo',
    pn.demo.Binddemo);