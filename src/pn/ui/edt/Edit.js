
goog.require('goog.dom.classes');
goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.date.Date');
goog.require('goog.events.Event');
goog.require('goog.ui.Component');
goog.require('goog.ui.ColorPicker');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('goog.ui.PopupColorPicker');
goog.require('goog.object');
goog.require('goog.date');
goog.require('goog.style');
goog.require('goog.events');
goog.require('goog.dom');

goog.require('picnet.ui.EntityEditEvents');
goog.require('picnet.ui.IUICustomValue');
goog.require('picnet.data.EntityDescriptionsManager');
goog.require('picnet.ui.GridOptions');
// goog.require('picnet.ui.GridCommand'); // Causes compiler circular dependency
// goog.require('picnet.ui.Grid'); // Causes compiler circular dependency
// goog.require('picnet.ui.GridExportSelect'); // Causes compiler circular dependency
goog.require('picnet.cdm.data.EUserRole');
goog.require('picnet.Utils');
goog.require('picnet.ui.DataFormat');
goog.require('picnet.ui.AddOnTheFly');
goog.require('picnet.ui.FileUpload');
goog.require('picnet.data.EntitySaveUtils');
goog.require('picnet.ui.EntityEditOptions');

goog.provide('picnet.ui.Edit');
goog.provide('picnet.ui.EntityEditEvent');
goog.provide('picnet.ui.IEntityEditCustomControlBuilder');

/**
 * @param {!picnetdata.externs.EntityDescription} template
 * @param {!picnetdata.externs.IEntity} data
 * @param {!picnet.ui.EntityEditOptions=} opts
 * @constructor
 * @extends {goog.ui.Component}
 */
picnet.ui.Edit = function(template, data, opts) {
	goog.ui.Component.call(this);
	/**
	 * @private
	 * @type {!picnet.ui.EntityEditOptions}
	 */
	this.opts = opts || new picnet.ui.EntityEditOptions(true);			
	this.opts.innerTablesOnAddEdit = this.opts.innerTablesOnAddEdit || function(template2, entity, opts2) { 
		cdm.nav.editEntity(template2, entity, opts2); 
	};

	/**
	 * @private
	 * @type {!picnetdata.externs.EntityDescription}
	 */
	this.template = template;	    		
	/**
	 * @private
	 * @type {!picnetdata.externs.IEntity}
	 */
	this.data = data;
	/**
	 * @private
	 * @type {!Array.<picnetdata.externs.EntityDescription>}
	 */
	this.fields = this.getFields();
	/**
	 * @private
	 * @type {picnet.ui.IUICustomValue}
	 */
	this.customValue = cdm.getCustomValue(this.template);
	/**
	 * @private
	 * @type {!Object.<string, Element|goog.ui.Component>}
	 */
	 this.controls = {};	 
	 /**
	 * @private
	 * @type {!Array.<picnet.ui.Grid>}
	 */
	 this.innerLists = [];
	 /**
	 * @private
	 * @type {!Array.<picnet.ui.Grid>}
	 */
	 this.innerSelectLists = [];
	 /**
	 * @private
	 * @type {!Element}
	 */
	 this.saveButton;
};
goog.inherits(picnet.ui.Edit, goog.ui.Component);

/** @inheritDoc */
picnet.ui.Edit.prototype.decorateInternal = function(el) {	
	picnet.ui.Edit.superClass_.decorateInternal.call(this, el);  
	var div = goog.dom.createDom('div', {'class':'picnet-edit'});	
	el.appendChild(div);

	var controls = this.createControlsHeader();
	if (controls) div.appendChild(controls);

    var fieldsCssClass = picnet.data.EntityDescriptionsManager.getPropertyValue(this.template, 'EntityEditFieldsCssClass') || 'picnet-edit-fields';
	var fieldsDiv = goog.dom.createDom('div', fieldsCssClass);	
    var groupDiv = null;
	goog.array.forEach(this.fields, function (f) { 
        var groupCssClass = picnet.data.EntityDescriptionsManager.getPropertyValue(f, 'EntityEditFieldGroupClass');
        if (groupCssClass) {
			var classAndTitle = groupCssClass.split('|');
            groupDiv = goog.dom.createDom('div', {'class':classAndTitle[0]});
			if (classAndTitle[1]) {
				goog.dom.appendChild(groupDiv, goog.dom.createDom('span', {'class':'group-label'}, classAndTitle[1]));
			}
            fieldsDiv.appendChild(groupDiv);  			
        }
		var field = this.createFieldHtml(f);	
        goog.dom.appendChild(groupDiv || fieldsDiv, field);  		
	}, this);        	
    div.appendChild(fieldsDiv);
	if (this.opts.edit) picnet.Utils.focusField(goog.dom.getElementsByTagNameAndClass('input', null, fieldsDiv)[0]);
    this.buildInternalLists(div);
	this.buildInternalSelectLists(div);	   		
};

/**
 * @return {Object.<string, picnetdata.externs.IEntity>}
 */
picnet.ui.Edit.prototype.getSelectedEntities = function() {
	var sel = {};
	var lists = picnet.data.EntityDescriptionsManager.getPropertyValue(this.template, 'SelectEntities');
	if (!lists || !this.data.ID) return sel;

	lists = lists.split(',');
	goog.array.forEach(this.innerSelectLists, function (sl, idx) {
		var listTypePath = lists[idx].split('.');
		var parentType = listTypePath[0];
		var childType = listTypePath[1];

		sel[parentType] = goog.array.map(sl.getSelectedRowIDs(), function(childId) {
			var child = /** @type {picnetdata.externs.IEntity} */ ({ID:0});
			child[this.template.TableName + 'ID'] = this.data.ID;
			child[childType + 'ID'] = childId;
			return child;
		}, this);		
	}, this);

	return sel;
};

/**
 * @private
 * @param {!Element} parent
 */
picnet.ui.Edit.prototype.buildInternalLists = function(parent) {
	var lists = picnet.data.EntityDescriptionsManager.getPropertyValue(this.template, 'ShowEntities');
	if (!this.opts.edit) {
		var viewLists = picnet.data.EntityDescriptionsManager.getPropertyValue(this.template, 'ShowEntitiesOnView');	
		if (viewLists) {
			if (!lists) lists = viewLists;
			else lists += ',' + viewLists;
		}
	}	
	if (this.data.ID && lists) {
        var listsDiv = goog.dom.createDom('div', 'picnet-edit-lists');
		lists = lists.split(',');
		goog.array.forEach(lists, function(l) { this.buildInternalList(l, listsDiv); }, this);										
        parent.appendChild(listsDiv);
	}
};

/**
 * @private
 * @param {!Element} parent
 */
picnet.ui.Edit.prototype.buildInternalSelectLists = function(parent) {
	var lists = picnet.data.EntityDescriptionsManager.getPropertyValue(this.template, 'SelectEntities');
	if (this.data.ID && lists) {
        var listsDiv = goog.dom.createDom('div', 'picnet-edit-select-lists');
		lists = lists.split(',');
		goog.array.forEach(lists, function(l) { this.buildInternalSelectList(l, listsDiv); }, this);										
        parent.appendChild(listsDiv);
	}
};

/**
 * @private
 * @param {string} listType
 * @param {!Element} parent
 */
picnet.ui.Edit.prototype.buildInternalList = function(listType, parent) {	
	var listDetails = listType.split(':');
	var type = listDetails[0];
	var parentType = listDetails[1] || this.template.TableName;
	var parentIDColumn = parentType + 'ID';	
	var listItems = goog.array.filter(cdm.data.getEntities(type), function (e) { return e[parentIDColumn] === this.data.ID; }, this);
	var listTemplate = cdm.templates.getTemplate(type);
	var opts = new picnet.ui.GridOptions();
	opts.hiddenFields = [parentType];
	opts.hiddenFieldValues = {};
	opts.hiddenFieldValues[parentIDColumn] = this.data.ID;
    opts.enableFilters = !goog.isDefAndNotNull(this.opts.enableFilterOnInnerTables) || this.opts.enableFilterOnInnerTables === true;
	if (this.opts.edit) {
		var editOpts = new picnet.ui.EntityEditOptions(true, opts.hiddenFields, opts.hiddenFieldValues);
		opts.rowCommands = [picnet.ui.GridCommand.buildActionCommand('Edit', 'edit', function(e) { this.opts.innerTablesOnAddEdit(listTemplate, e, editOpts); }, this)];
		opts.gridCommands = [picnet.ui.GridCommand.buildActionCommand('Add New ' + listTemplate.Name, 'addnew', function(e) { this.opts.innerTablesOnAddEdit(listTemplate, {ID:0}, editOpts); }, this)];								
	}		
	goog.dom.appendChild(parent, goog.dom.createDom('h2', {'class':'list-title'}, listTemplate.NamePlural));		
	var eg = new picnet.ui.Grid(parent, listTemplate, listItems, opts);
	this.innerLists.push(eg);			
};

/**
 * @private
 * @param {string} listTypePath
 * @param {!Element} parent
 */
picnet.ui.Edit.prototype.buildInternalSelectList = function(listTypePath, parent) {		
	var pathTypes = listTypePath.split('.');
	var parentType = pathTypes[0];
	var childType = pathTypes[1];			
	var listTemplate = cdm.templates.getTemplate(childType);
	var listItems;
	var opts = new picnet.ui.GridOptions();
	var exp = new picnet.ui.GridCommand();
	exp.customCommand = new picnet.ui.GridExportSelect(this.template, picnet.Utils.getServerDataUrl() + 'ImportExport.mvc/ExportData');
	opts.gridCommands.push(exp);

	if (this.opts.edit) {
		listItems = cdm.data.getEntities(childType);		
		opts.enableRowSelect = true;
	} else {
		var manyToManies = goog.array.filter(cdm.data.getEntities(parentType), function(mm) { return mm[this.template.TableName + 'ID'] === this.data.ID; }, this);	
		var itemIDs = goog.array.map(manyToManies, function(mm) { return mm[childType + 'ID']; });
		listItems = goog.array.filter(cdm.data.getEntities(childType), function (c) { return goog.array.indexOf(itemIDs, c.ID) >= 0; }, this);        
	}
	goog.dom.appendChild(parent, goog.dom.createDom('h2', {'class':'list-title'}, listTemplate.NamePlural));		
	
	var eg = new picnet.ui.Grid(parent, listTemplate, listItems, opts);
	this.innerSelectLists.push(eg);		

	var currentIds = [];
	goog.array.forEach(cdm.data.getEntities(parentType), function(e) {
		if (e[this.template.TableName + 'ID'] === this.data.ID) { currentIds.push(e[childType + 'ID']); }
	}, this);				
	eg.setSelectedRowIDs(currentIds);
};

/**   
 * @return {Element}
 * @private
 */
picnet.ui.Edit.prototype.createControlsHeader = function() {	
	var showHistory = this.data.ID && this.opts.edit && cdm.online && cdm.getCurrentUser().Role === picnet.cdm.data.EUserRole.WineryAdmin && "true" === picnet.data.EntityDescriptionsManager.getPropertyValue(this.template, 'TrackChanges');
	if (!showHistory && !this.opts.edit) { return null; }

	var div = goog.dom.createDom('div');
	div.className = goog.getCssName('picnet-edit-controls');	
    if (this.opts.edit) {	    
		this.saveButton = this.addButton(div, 'Save', 'picnet-edit-save', this.saveClicked);			
		if (this.data.ID && this.opts.allowDelete) { 			
			this.addButton(div, 'Delete', 'picnet-edit-delete', this.deleteClicked);	
		}
    }
	if (showHistory) { this.addButton(div, 'History', 'picnet-edit-history', this.historyClicked);	}	

	var customcommand = picnet.data.EntityDescriptionsManager.getPropertyValue(this.template, 'CustomEntityEditCommand');	
	if (customcommand && this.customValue.canShowCustomEntityEditCommand(this.opts.edit, customcommand, this.data)) {
		this.addButton(div, customcommand, 'picnet-edit-custom-command', function() {
			this.customValue.customEntityEditCommand(customcommand, this.data);
		});
	}

	return div;
};

/** 
 * @private
 * @param {!Element} div
 * @param {string} text
 * @param {string} css
 * @param {!function()} command
 * @return {!Element}
 */
picnet.ui.Edit.prototype.addButton = function(div, text, css, command) {	
	var b = goog.dom.createDom('button');	
	b.className = css;	
	b.innerHTML = text;
	div.appendChild(b);
	this.getHandler().listen(b, goog.events.EventType.MOUSEDOWN, command, false, this);	
	return b;
};

/** 
 * @protected
 */
picnet.ui.Edit.prototype.saveClicked = function() {	
	if (this.saveButton) {
		if (this.saveButton.getAttribute('disabled') === 'disabled') { return; }

		this.saveButton.setAttribute('disabled', 'disabled');
		goog.Timer.callOnce(function() {
			this.saveButton.removeAttribute('disabled');
		}, 250, this);
	}
	var entity = this.getFormData();	
	var saveEvent = new picnet.ui.EntityEditEvent(picnet.ui.EntityEditEvents.SAVE, this, entity);
	this.dispatchEvent(saveEvent);
};

/** 
 * @private
 */
picnet.ui.Edit.prototype.deleteClicked = function() {	
	if (window.confirm('Are you sure you want to delete this ' + this.template.Name + '?')) {
		var deleteEvent = new picnet.ui.EntityEditEvent(picnet.ui.EntityEditEvents.DELETE, this, this.data.ID);
		this.dispatchEvent(deleteEvent);
	}
};

/** 
 * @private
 */
picnet.ui.Edit.prototype.historyClicked = function() {	
	var historyEvent = new picnet.ui.EntityEditEvent(picnet.ui.EntityEditEvents.HISTORY, this, {'type':this.template.EntityTypeString,'id':this.data.ID});
	this.dispatchEvent(historyEvent);
}

/** 
 * @private
 * @return {!picnetdata.externs.IEntity}
 */
picnet.ui.Edit.prototype.getFormData = function() {	
	var entity = /** @type {!picnetdata.externs.IEntity} */ (goog.object.clone(this.data));
	goog.array.forEach(this.fields, function (f) { 
		if ("true" === picnet.data.EntityDescriptionsManager.getPropertyValue(f, 'ReadOnly')) { return; }
		this.getFieldValue(entity, f);
	}, this);  
	if (this.opts.hiddenFields) {
		goog.array.forEach(this.opts.hiddenFields, function (f) { 
			entity[f] = this.data.ID ? this.data[f] : this.opts.hiddenFieldValues[f];  
			var fid = f + 'ID';
			entity[fid] = this.data.ID ? this.data[fid] : this.opts.hiddenFieldValues[fid];  
		}, this);  
	}
	picnet.data.EntitySaveUtils.preSaveEntity(this.template, entity);
	return entity;
};

/** 
 * @return {boolean}
 */
picnet.ui.Edit.prototype.isDirty = function() {
	if (!this.opts.edit) { return false; }
	var nowvalues = this.getFormData();
	for (var i in this.controls) {
		if (i === 'ID') { continue; }
		var initial = this.data.ID ? (this.data[i] || '') : '';
		var nowval = nowvalues[i] || '';
		if (initial !== nowval) { 
			if (initial.getFullYear || nowval.getFullYear) {				
				if (initial.getFullYear && initial.getFullYear() === 1970) { initial = ''; }
				if (nowval.getFullYear && nowval.getFullYear() === 1970) { nowval = ''; }
				if (initial === nowval || (initial && nowval && goog.date.isSameDay(initial, nowval))) {
					continue;
				}
			}
			cdm.log('Found Dirty Field [' + i + '] Initial Value [' + initial + '] Now [' + nowval + ']');
			return true; 
		}
	}
	return false;
};

/** 
 * @private
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!picnetdata.externs.FieldDescription} template 
 */
picnet.ui.Edit.prototype.getFieldValue = function(entity, template) {
	var input = this.controls[template.FieldId];				
	if (!input) { throw new Error('Could not find an input control for field: ' + template.FieldId + ' ignoring this field.');  }
    var field = input.saveFieldID || template.FieldId;	
	var val = this.getControlValue(entity, template, input);		

	if (val === undefined || val === null || ((goog.string.endsWith(field, 'ID') || picnet.Utils.isNumber(template.FieldTypeName)) && val === '')) { 		
		delete entity[field]; 
	} 
	else { entity[field] = val; }
};

/**
 * @private
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!picnetdata.externs.FieldDescription} template
 * @param {!Element|goog.ui.Component} control
 */
picnet.ui.Edit.prototype.getControlValue = function(entity, template, control) {
	var val;		
	if (this.customValue) {
		val = this.customValue.getControlValue(entity, template, /** @type {!Element} */ (control));
		if (val !== undefined) return val;
	}
	var type = picnet.data.EntityDescriptionsManager.getFieldType(template)
	if (type === 'ImageFile') {
		var src = control.getAttribute('src');
		if (src) { src = src.substring(src.lastIndexOf('/') + 1); }
		val = src;		
	} else if (type === 'ColorPicker') {
		val = /** @type {!goog.ui.PopupColorPicker} */ (control).getSelectedColor();
	} else if (type === 'DateTime') {
		val = new Date(/** @type {!goog.ui.InputDatePicker} */ (control).getDate());						
	} else if (type === 'Boolean') {
		val = control.checked;
	} else if (picnet.Utils.isNumber(type)) {
		if ('currency' === picnet.data.EntityDescriptionsManager.getPropertyValue(template, 'FormatString')) {
			val = picnet.ui.DataFormat.readCurrency(control.value);
		} else {
			val = (control.value ? parseFloat(control.value) : 0);
		}
	} else {
		val = control.value2 || control.value;        
	}

	if ((!goog.isDefAndNotNull(val) || val === '') && template.DefaultValue) { 
		if (picnet.Utils.isNumber(type)) { val = parseFloat(template.DefaultValue); }
		else if (type === 'Boolean') { val = template.DefaultValue === 'true'; }
		else { val = template.DefaultValue; }
	}	

	return val;
};

/**
 * @private
 * @param {!picnetdata.externs.FieldDescription} template
 * @param {!Element|!goog.ui.Component} control
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!*} value
 */
picnet.ui.Edit.prototype.setControlValue = function(template, control, entity, value) {
	var type = picnet.data.EntityDescriptionsManager.getFieldType(template);
	if (this.customValue && this.customValue.setControlValue(template, control, entity, value)) { return; }

	if ('currency' === picnet.data.EntityDescriptionsManager.getPropertyValue(template, 'FormatString')) {
		control.value = (/** @type {number} */ (value) / 100).toFixed(2);
	} else if (type === 'Boolean') {
		control.checked = value === true || value === 'true';
	} else if (type === 'ImageFile') {
		this.setImageFileValue(/** @type {!Element} */ (control), /** @type {string} */ (value));		
	} else if (type === 'ColorPicker') {
		/** @type {!goog.ui.PopupColorPicker} */ (control).getColorPicker().setSelectedColor(/** @type {string} */ (value));
	} else if (type === 'DateTime') {
		if (!value || value.getFullYear() === 1970) {
			/** @type {!goog.ui.InputDatePicker} */ (control).getDatePicker().selectNone();
		} else {
			/** @type {!goog.ui.InputDatePicker} */ (control).setDate(new goog.date.Date(/** @type {!Date} */ (value)));
		}
	} else {
		control.value = value === undefined || value === null ? '' : value;
	}
};

/**
 * @private
 * @param {!Element} control
 * @param {string} value
 */
picnet.ui.Edit.prototype.setImageFileValue = function(control, value) {
	var uri = !value ? '' : (picnet.Utils.getServerDataUrl() + 'uploads/' + cdm.getCurrentUser().WineryID + '/' + value);
	control.setAttribute('src', uri);
	goog.style.showElement(control, value && value.length > 0);
	goog.style.showElement(goog.dom.getNextElementSibling(control), value);
};

/** 
 * @param {!picnetdata.externs.FieldDescription} f
 * @return {!Element}
 * @private
 */
picnet.ui.Edit.prototype.createFieldHtml = function(f) {			
	var p = goog.dom.createDom('p');
	if (this.opts.edit && f.Required) goog.dom.classes.set(p, 'required');
	var label = goog.dom.createDom('label');
	label['for'] = f.FieldId;
	if (f.ToolTip) label['description'] = f.ToolTip;
	label.innerHTML = f.Name;
	p.appendChild(label);
	this.appendFieldInputControlHtml(f, p, true);
	return p;
};

/**
 * @private
 * @param {!picnetdata.externs.FieldDescription} f
 * @param {!Element} parent
 * @param {boolean} allowAddEditOnFly 
 */
picnet.ui.Edit.prototype.appendFieldInputControlHtml = function(f, parent, allowAddEditOnFly) {
	var edit = this.opts.edit && "true" !== picnet.data.EntityDescriptionsManager.getPropertyValue(f, 'ReadOnly');
	var control = this.buildControl(edit, f, parent, allowAddEditOnFly);
	if (this.data.ID) { 
        if (edit) {
			this.setControlValue(f, control, this.data, this.data[f.FieldId]);            
        } else {
            goog.dom.setTextContent(/** @type {Element} */ (control), picnet.ui.DataFormat.formatEntityField(this.data, f, this.customValue)); 
        }
    } else if (edit && f.DefaultValue) {
		this.setControlValue(f, control, this.data, f.DefaultValue);
	} 	
    this.controls[f.FieldId] = control;
};

/**
 * @private
 * @param {boolean} edit
 * @param {!picnetdata.externs.FieldDescription} f
 * @param {!Element} parent
 * @param {boolean} allowAddEditOnFly 
 */
picnet.ui.Edit.prototype.buildControl = function(edit, f, parent, allowAddEditOnFly) {
	var e;
    if (!edit) {
        e = goog.dom.createDom('span');
        parent.appendChild(e);
		return e;
    } 
	
	if (this.customValue) {
		e = this.customValue.buildControl(f, parent);
		if (e !== undefined) { return e; }
	} 

	var selvalues = picnet.data.EntityDescriptionsManager.getPropertyValue(f, 'SelectValues');			
	if (selvalues) {
		var dict = picnet.data.EntityDescriptionsManager.getEnumDict(selvalues);		
		e = goog.dom.createDom('select');
		for (var name in dict) {
			goog.dom.appendChild(/** @type {!Node} */ (e), goog.dom.createDom('option', {'value':dict[name]}, name));
		}			
		parent.appendChild(e);
		return e;
	} 

	var fieldtype = picnet.data.EntityDescriptionsManager.getFieldType(f);
	switch (fieldtype) {
		case 'ImageFile':
			e = this.buildImageFileInput(f, parent, this.data);
			break;
		case 'ColorPicker': 
			e = this.buildColorPicker(f, parent, this.data);
			break;
		case 'DateTime': 
			e = this.buildDatePicker(f, parent, this.data);
			break;					
		case 'Boolean': 
			e = goog.dom.createDom('input');
			e.type = 'checkbox';					
			parent.appendChild(e);
			break;
		case 'String': 
			if (picnet.data.EntityDescriptionsManager.getPropertyValue(f, 'HideValue') === 'true') { e = goog.dom.createDom('input', {'type':'password'}); }
			else if (f.ValidationInformation.MaxLength > 1000) { e = goog.dom.createDom('textarea', {'rows':5}); } 
			else { e = goog.dom.createDom('input', {'type':'text'}); }
			parent.appendChild(e);
			break;
		default:  
			if (picnet.Utils.isNumber(fieldtype)) {
				e = goog.dom.createDom('input', {'type':'text'});
				parent.appendChild(e);
			} else if (cdm.templates.getTemplate(fieldtype)) {
				e = new picnet.ui.AddOnTheFly(this.template, f, cdm.templates.getTemplate(fieldtype), this.data, allowAddEditOnFly);		
				e.decorate(parent);		                
			} else {
                throw new Error('Field type: ' + fieldtype + ' not supported by Edit.  Field: ' + f.FieldId);
            }
	}
	return e;
};

/**
 * @private
 * @param {!picnetdata.externs.FieldDescription} f
 * @param {!Element} parent
 * @param {!picnetdata.externs.IEntity} data
 * @return {!goog.ui.PopupColorPicker}
 */
picnet.ui.Edit.prototype.buildColorPicker = function(f, parent, data) {
	var colpicker = goog.ui.ColorPicker.createSimpleColorGrid();	
	var picker = new goog.ui.PopupColorPicker(undefined, colpicker);
	var button = goog.dom.createDom('input', {'type':'button','class':'colour-popup-button'});	    
	picker.render();
    picker.attach(button);
	parent.appendChild(button);

	if (data && data[f.FieldId]) { button.style.backgroundColor = data[f.FieldId]; }
    this.getHandler().listen(picker, goog.events.EventType.CHANGE, function(e) {
      button.style.backgroundColor = picker.getSelectedColor();
    }, false, this);
	return picker;
};

/**
 * @private
 * @param {!picnetdata.externs.FieldDescription} f
 * @param {!Element} parent
 * @param {!picnetdata.externs.IEntity} data
 * @return {!Element}
 */
picnet.ui.Edit.prototype.buildImageFileInput = function(f, parent, data) {
	var img = goog.dom.createDom('img', {'class':'img-upload'});	
	var input = new picnet.ui.FileUpload(f.FieldId + 'upload', picnet.Utils.getServerDataUrl() + 'FileUpload.mvc/ImageFileUpload', parent, function(file, io) {		
		if (io.isSuccess()) {
			this.setImageFileValue(img, io.getResponseHtml());
		} else {
			cdm.nav.showError('Error uploading image file - ' + io.getLastError());
		}
	}, undefined, undefined, this);

	parent.appendChild(img);
	
	var del = goog.dom.createDom('div', {'class':'button','style':'display:none'}, 'Delete');	
	parent.appendChild(del);
	goog.style.showElement(del, false);

	this.getHandler().listen(del, goog.events.EventType.CLICK, function() {
		this.setImageFileValue(img, null);
	}, false, this);	
	return img;
};

/**
 * @private
 * @param {!picnetdata.externs.FieldDescription} f
 * @param {!Element} parent
 * @param {!picnetdata.externs.IEntity} data
 * @return {!goog.ui.InputDatePicker}
 */
picnet.ui.Edit.prototype.buildDatePicker = function(f, parent, data) {
	var PATTERN = 'dd/MMM/y';
    var formatter = new goog.i18n.DateTimeFormat(PATTERN);
    var parser = new goog.i18n.DateTimeParse(PATTERN);
	var picker = new goog.ui.InputDatePicker(formatter, parser);

    picker.render(parent);	

	picker.getDatePicker().setFirstWeekday(0);
	picker.getDatePicker().setShowToday(false);
	picker.getDatePicker().setAllowNone(false);
	
	if (data && data[f.FieldId]) { 
		this.setControlValue(f, picker, data, data[f.FieldId]);
	}			
	return picker;
};

/**
 * @private
 * @return {!Array.<picnetdata.externs.FieldDescription>}
 */
picnet.ui.Edit.prototype.getFields = function() {
	/** @type {!Array.<picnetdata.externs.FieldDescription>} */
	var fields = [];
	var tmpfields = this.template.Fields;
	for (var i = 0, f; f = tmpfields[i++];) {
		if (f.IgnoreOnAutoGenerateUI || !f.Visible || picnet.data.EntityDescriptionsManager.getPropertyValue(f, 'HideOnEditView') === 'true') { continue; }		
		if (!this.data.ID && picnet.data.EntityDescriptionsManager.getPropertyValue(f, 'HideOnAddNew') === 'true') { continue; }
		if (this.opts.hiddenFields && goog.array.indexOf(this.opts.hiddenFields, f.FieldId) >= 0) { continue; }				
		fields.push(f);
	}
	return fields;
}

/** @inheritDoc */
picnet.ui.Edit.prototype.createDom = function() {
  picnet.ui.Edit.superClass_.createDom.call(this);
  this.decorateInternal(this.getElement());
};


/** @inheritDoc */
picnet.ui.Edit.prototype.disposeInternal = function() {
	picnet.ui.Edit.superClass_.disposeInternal.call(this);

	goog.dispose(this.customValue);
	goog.array.forEach(this.innerLists, function(eg) { goog.dispose(eg); });
	this.innerLists = [];
	goog.array.forEach(this.innerSelectLists, function(eg) { goog.dispose(eg); });
	this.innerSelectLists = [];
	for (var i in this.controls) { goog.dispose(this.controls[i]); }
	this.controls = {};

	delete this.template;
	delete this.fields;
	delete this.data;
	
};


/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {string} type
 * @param {!picnet.ui.Edit} target 
 * @param {!*} data  
 */
picnet.ui.EntityEditEvent = function(type, target, data) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {!*}
   */
  this.data = data;
};
goog.inherits(picnet.ui.EntityEditEvent, goog.events.Event);