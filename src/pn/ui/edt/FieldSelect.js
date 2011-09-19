
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.array');
goog.require('goog.ui.Component');
goog.require('goog.fx.DragListGroup');
goog.require('goog.fx.DragListDirection');

goog.require('picnet.data.EntitySaveUtils');

goog.provide('picnet.ui.FieldSelect');


/**
 * @param {!picnetdata.externs.EntityDescription} template
 * @constructor
 * @extends {goog.ui.Component}
 */
picnet.ui.FieldSelect = function(template) {
	goog.ui.Component.call(this);
    /**
	 * @private
	 * @type {!picnetdata.externs.EntityDescription}
	 */
	this.template = template;    
	/**
	 * @private
	 * @type {!Array.<picnetdata.externs.FieldDescription>}
	 */
	this.fields = picnet.data.EntitySaveUtils.getEditFields(this.template);
	/**
	 * @private
	 * @type {!Element}
	 */
	this.availableFields;    
	/**
	 * @private
	 * @type {!Element}
	 */
	this.selectedFields;    
	/**
	 * @private
	 * @type {!goog.fx.DragListGroup}
	 */
	this.dragger;    
};
goog.inherits(picnet.ui.FieldSelect, goog.ui.Component);

/**
 * @return {Array.<string>}
 */
picnet.ui.FieldSelect.prototype.getSelectedFieldIDs = function() {
	return goog.array.map(goog.dom.getElementsByTagNameAndClass('div', 'entity-field-select-field', this.selectedFields), function (f) { return f.getAttribute('id'); });
};

/**
 * @param {Array.<string>} fields
 */
picnet.ui.FieldSelect.prototype.setSelectedFieldIDs = function(fields) {
	var availFields = goog.dom.getElementsByTagNameAndClass('div', 'entity-field-select-field', this.availableFields);
	goog.array.forEach(fields, function(f) { 
		var field = goog.array.find(availFields, function(af) { return af.getAttribute('id') === f; });
		if (field) this.fieldSelected(field); 
	}, this);
};

/**
 * @return {boolean}
 */
picnet.ui.FieldSelect.prototype.hasRequiredFieldsInAvailable = function() {
	var required = goog.dom.getElementsByTagNameAndClass('div', 'required', this.availableFields);
	return required.length > 0;
};

/** @inheritDoc */
picnet.ui.FieldSelect.prototype.decorateInternal = function(el) {
  picnet.ui.FieldSelect.superClass_.decorateInternal.call(this, el);  	

  var container = goog.dom.createDom('div', {'class':'entity-field-select'});
  var controls = goog.dom.createDom('div', {'class':'entity-field-select-controls'});
  
  this.availableFields = goog.dom.createDom('div', {'class':'entity-field-select-available'});
  this.selectedFields = goog.dom.createDom('div', {'class':'entity-field-select-selected'});  
  this.unselectField = goog.dom.createDom('div', {'class':'entity-field-select-unselected'});  
  
  this.buildControls(controls);
  this.buildAvailableFields();
  

  container.appendChild(controls);

  container.appendChild(goog.dom.createDom('div', {'class':'available-fields-container'}, 
	goog.dom.createDom('h3', {}, 'Available Fields'), 
	this.availableFields));
  container.appendChild(goog.dom.createDom('div', {'class':'selected-fields-container'}, 
	goog.dom.createDom('h3', {}, 'Selected Fields'), 
	this.selectedFields));
  container.appendChild(this.unselectField);
  
  el.appendChild(container);
};

/**
 * @private
 * @param {!Element} parent
 */
picnet.ui.FieldSelect.prototype.buildControls = function (parent) {
	var addEmpty = goog.dom.createDom('div', {'class':'button add-empty-field'}, 'Add Empty Field');
	parent.appendChild(addEmpty);	
	this.getHandler().listen(addEmpty, goog.events.EventType.CLICK, function() { 
		this.selectedFields.appendChild(this.buildField(null));
		this.internalStateChanged();
	}, false, this);                
	
	var reset = goog.dom.createDom('div', {'class':'button reset-fields'}, 'Reset');
	parent.appendChild(reset);	
	this.getHandler().listen(reset, goog.events.EventType.CLICK, function() { 
		goog.dom.removeChildren(this.availableFields);
		goog.dom.removeChildren(this.selectedFields);
		this.buildAvailableFields();
		this.internalStateChanged();
	}, false, this);                
};

/**
 * @private
 */
picnet.ui.FieldSelect.prototype.buildAvailableFields = function () {
	goog.array.forEach(this.fields, function(f) {
		this.availableFields.appendChild(this.buildField(f));
	}, this);
};

/**
 * @private
 * @param {!picnetdata.externs.FieldDescription} f
 */
 picnet.ui.FieldSelect.prototype.buildField = function (f) {
	var opts = {'class':'entity-field-select-field'};
	opts['id'] = f ? f.FieldId : 'ignore';
	if (f && f.ToolTip) { opts['title'] = f.ToolTip; }
	var html = f ? f.Name : 'Ignore Column';
	if (f && f.Required) { opts['class'] += ' required'; }

	var field = goog.dom.createDom('div', opts, html);
	this.getHandler().listen(field, [goog.events.EventType.CLICK, goog.events.EventType.DBLCLICK], function() { 
		if (field.parentNode === this.availableFields) { this.fieldSelected(field); }
	}, false, this); 
	return field;
 }

/**
 * @private
 * @param {Element} field
 */
picnet.ui.FieldSelect.prototype.fieldSelected = function(field) {
	if (field && field.getAttribute('id') === 'ignore') {
		goog.dom.removeNode(field);
		return;
	}	
	var selecting = !field || field.parentNode === this.availableFields;
	var newparent = selecting ? this.selectedFields : this.availableFields;

	newparent.appendChild(field);
	this.internalStateChanged();		
};

/**
 * @private
 */
picnet.ui.FieldSelect.prototype.internalStateChanged = function() {	
	this.rebuildDragger();
	this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE, this));
};

/**
 * @private
 */
picnet.ui.FieldSelect.prototype.rebuildDragger = function () {
	goog.dispose(this.dragger);
	this.dragger = new goog.fx.DragListGroup();
	this.dragger.setDraggerElClass('dragging');
	this.dragger.addDragList(this.selectedFields, goog.fx.DragListDirection.DOWN, true);  
	this.dragger.addDragList(this.unselectField, goog.fx.DragListDirection.DOWN, true);  	
	this.dragger.init();

	this.getHandler().listen(this.dragger, goog.fx.DragListGroup.EventType.DRAGEND, function() {
		goog.array.forEach(goog.dom.getElementsByTagNameAndClass('div', 'entity-field-select-field', this.unselectField), function(f) {
			this.fieldSelected(f);
		}, this);
		this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE, this));
	});
};

/** @inheritDoc */
picnet.ui.FieldSelect.prototype.createDom = function() {
  picnet.ui.FieldSelect.superClass_.createDom.call(this);
  this.decorateInternal(this.getElement());
};

/** @inheritDoc */
picnet.ui.FieldSelect.prototype.disposeInternal = function() {
	picnet.ui.FieldSelect.superClass_.disposeInternal.call(this);
   	
	goog.dispose(this.dragger); 

	delete this.availableFields;    	
	delete this.selectedFields;   
};