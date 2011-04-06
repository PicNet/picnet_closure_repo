
goog.require('goog.testing.jsunit');

goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.testing.events');

goog.require('picnet.bind.Binding')
goog.require('picnet.bind.Source')
goog.require('picnet.bind.Target')
goog.require('picnet.bind.List');

var ns, tb, obj, list;

function setUpPage() { 
  list = picnet.bind.List;
  ns = picnet.bind; 
};

function setUp() {
  tb = goog.dom.createDom('input', {'type':'text'});
  obj = createTestObject('Guido Tapia');  
};

function testBindTextBoxToObject_InitialValue() {    
  tb.value = 'Initial Name';    
  var binding = new ns.Binding(
    [ns.Source.createEventSource(tb, 
      goog.events.EventType.KEYUP, function() { return tb.value ;} )],
    [ns.Target.createObjectSetterTarget(obj, obj.setName)]);
  binding.refresh(); // Set initial target value
  
  assertEquals('Initial Name', obj.name);// Bound  
};

function testBindTextBoxToObject() {      
  var binding = new ns.Binding(
    [ns.Source.createEventSource(tb, 
      goog.events.EventType.KEYUP, function() { return tb.value ;} )],
    [ns.Target.createObjectSetterTarget(obj, obj.setName)]);
  binding.refresh(); // Set initial target value
  
  tb.value = 'Test Name';  // Bound
  goog.testing.events.fireKeySequence(tb, 30);
  assertEquals('Test Name', obj.name);

  obj.setName('Test Name 2');  // Not bound  
  assertEquals('Test Name', tb.value);    
};

function testBindObjectToTextBox() {
  var binding = new ns.Binding(
    [ns.Source.createObjectPropertySource(obj, obj.getName, obj.setName)],
    [ns.Target.createValueTarget(tb)]);
  binding.refresh(); // Set initial target value
  
  tb.value = 'Test Name'; // Not bound
  goog.testing.events.fireKeySequence(tb, 30);
  assertEquals('Guido Tapia', obj.name);

  obj.setName('Test Name 2');  // Bound
  assertEquals('Test Name 2', tb.value);
};

function testTwoWayBindBetweenTextBoxAndObject() {
  var binding = new ns.Binding(
    [ns.Source.createObjectPropertySource(obj, obj.getName, obj.setName),
      ns.Source.createEventSource(tb, 
        goog.events.EventType.KEYUP, function() { return tb.value ;} )],
    [ns.Target.createObjectSetterTarget(obj, obj.setName),
      ns.Target.createValueTarget(tb)]);
  binding.refresh(); // Set initial target value
  
  tb.value = 'Test Name'; // Bound
  goog.testing.events.fireKeySequence(tb, 30);
  assertEquals('Test Name', obj.name);

  obj.setName('Test Name 2');  // Bound
  assertEquals('Test Name 2', tb.value);
};

function testObjToObjBind() {
  var obj1 = createTestObject('TESTING');
  var obj2 = { name: 'Guido Tapia', age:1 }; 
  obj2.setName = function(n) {     
    obj2.name = n; 
  };  

  var binding = new ns.Binding(
    [ns.Source.createObjectPropertySource(obj1, obj1.getName, obj1.setName)],
    [ns.Target.createObjectSetterTarget(obj2, obj2.setName)]);
  binding.refresh(); // Set initial target value

  obj1.setName('testObjToObjBind');
  assertEquals('testObjToObjBind', obj2.name); // Bound  
  obj2.setName('Random');  
  assertEquals('testObjToObjBind', obj1.name); // Not Bound      
};

function testListToListBind_Init() {
  var lst1 = new list([createTestObject('Name 1'), createTestObject('Name 2')]);
  var lst2 = new list([]);

  var binding = new ns.Binding(
    [lst1],
    [ns.Target.createListTarget(lst2)]);
  binding.refresh(); // Set initial target value
  assertListEquals(lst1, lst2);  
};

function testListToListBind_Add() {
  var lst1 = new list([createTestObject('Name 1'), createTestObject('Name 2')]);
  var lst2 = new list([]);

  var binding = new ns.Binding(
    [lst1],
    [ns.Target.createListTarget(lst2)]);
  binding.refresh(); // Set initial target value
  
  lst1.push(createTestObject('Name 3'));
  
  assertListEquals(lst1, lst2);
};

function testListToListBind_EditInternals() {
  var lst1 = new list([createTestObject('Name 1'), createTestObject('Name 2')]);
  var lst2 = new list([]);

  var binding = new ns.Binding(
    [lst1],
    [ns.Target.createListTarget(lst2)]);
  binding.refresh(); // Set initial target value
  
  lst1.setValueAt(0, createTestObject('Name 3'));
  assertListEquals(lst1, lst2);
};

function testListToInnerHtmlBind_EditInternalsWithSetName() {
  var o1 = createTestObject('Name 1');
  var o2 = createTestObject('Name 2');
  var lst1 = new list([o1, o2]);
  var lbl = {innerHTML: ''};

  var binding = new ns.Binding(
    [lst1],
    [ns.Target.createInnerHtmlTarget(lbl)]);
  binding.refresh(); // Set initial target value
    
  o1.setName('testListToInnerHtmlBind_EditInternalsWithSetName');
  assertEquals(lst1.toString(), lbl.innerHTML.toString());  
  
  var o1FromList = lst1.getInternalArray()[0];
  o1FromList.setName('testListToInnerHtmlBind_EditInternalsWithSetName2');
  assertEquals('testListToInnerHtmlBind_EditInternalsWithSetName2', o1.name);
  assertEquals(lst1.toString(), lbl.innerHTML.toString());  
};

function createTestObject(name) {
  var clazz = function(n) {
    this.name = n;
    this.age = 1;
  };
  clazz.prototype.setName = function(n) { this.name = n; };
  clazz.prototype.getName = function() { return this.name; };
  clazz.prototype.setAge = function(a) { this.age = a; };
  clazz.prototype.getAge = function() { return this.age; };
  clazz.prototype.toString = function() { return 'n: ' + this.name + ' a: ' + this.age; };
  
  return new clazz(name);
};
////////////////////////////////////////////////////////////////////////////////
// PRIVATE HELPERS
////////////////////////////////////////////////////////////////////////////////

function assertArrayEquals(exp, actual) {
  assertEquals(exp.length, actual.length);
  for (var i = 0, len = exp.length; i < len; i++) {    
    assertEquals(exp[i], actual[i]);
  }
};

function assertListEquals(exp, actual) {  
  assertEquals(exp.getLength(), actual.getLength());
  for (var i = 0, len = exp.getLength(); i < len; i++) {        
    var expv = exp.getValueAt(i);
    var actv = actual.getValueAt(i);
    assertEquals(expv, actv);
  }
};
