goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.events.EventType');
goog.require('goog.date');
goog.require('goog.ui.Component');
goog.require('goog.ui.TableSorter');
 
goog.require('pn.Utils');
goog.require('pn.data.EntityDescriptionsManager');

goog.require('pn.ui.EntityEditEvents');
goog.require('pn.ui.IUICustomValue');
goog.require('pn.ui.DataFormat');
goog.require('pn.ui.GridCommand');
goog.require('pn.ui.GridRowEdit');
goog.require('pn.ui.filter.TableFilter');
goog.require('pn.ui.filter.TableFilterOptions');

goog.provide('pn.ui.Grid');

/**
 * @param {!Element} elementToDecorate
 * @param {!picnetdata.externs.EntityDescription} template
 * @param {!Array} data
 * @param {!pn.ui.GridOptions=} opts
 * @constructor
 * @extends {goog.ui.Component}
 */
pn.ui.Grid = function(elementToDecorate, template, data, opts) {
	goog.ui.Component.call(this);
	/**
	 * @type {!picnetdata.externs.EntityDescription}
	 */
	this.template = template;		
	/**
	 * @private
	 * @type {!Array.<picnetdata.externs.IEntity>}
	 */
	this.data = pn.Utils.filterEntities(data, this.template) || [];	
	/**
	 * @private
	 * @type {!pn.ui.GridOptions}
	 */
	this.opts = opts || new pn.ui.GridOptions();			
	/**
	 * @private
	 * @type {!Element}
	 */
	this.table;
	/**
	 * @private
	 * @type {!Array.<picnetdata.externs.EntityDescription>}
	 */
	this.fields = this.getGridFields();
	/**
	 * @private
	 * @type {!Object.<string, number>}
	 */
	this.fieldTotals = {};
	/**
	 * @private
	 * @type {boolean}
	 */
	this.hasTotals = false;
	/**
	 * @private
	 * @type {Object.<string, !Element>}
	 */
	this.selectRowCheckboxes = {};
	/**
	 * @private
	 * @type {pn.ui.IUICustomValue}
	 */
	this.customValue = cdm.getCustomValue(this.template);
	/**
	 * @private
	 * @type {pn.ui.GridRowEdit}
	 */
	this.rowedit = opts && opts.enableInGridEdit ? new pn.ui.GridRowEdit(this.template, this.fields, this.getColumnCount() - this.fields.length) : null;
	if (this.rowedit) { this.getHandler().listen(this.rowedit, pn.ui.EntityEditEvents.SAVE, this.dispatchEvent); }
	
	this.decorate(elementToDecorate);
};

goog.inherits(pn.ui.Grid, goog.ui.Component);

/**
 * @private
 * @return {number}
 */
pn.ui.Grid.prototype.getColumnCount = function() {
	return (this.opts.rowCommands ? this.opts.rowCommands.length : 0) + (this.opts.enableRowSelect ? 1 : 0) + this.fields.length;
};

/**
 */
pn.ui.Grid.prototype.hideCurrentRowEdit = function() { this.rowedit.hide(); };

/** 
 * @return {boolean}
 */
pn.ui.Grid.prototype.isDirty = function() {
	return goog.isDefAndNotNull(this.rowedit) && this.rowedit.isDirty();
};

/** @inheritDoc */
pn.ui.Grid.prototype.decorateInternal = function(el) {
	pn.ui.Grid.superClass_.decorateInternal.call(this, el);
	this.fieldTotals = {};
	this.hasTotals = false;

	var headerrow, tbody, tfoot;
	this.table = goog.dom.createDom('table', {'class':'picnet-entitygrid'}, 
		goog.dom.createDom('thead', null, headerrow = goog.dom.createDom('tr', {'class':'picnet-entitygrid-header'})),
		tbody = goog.dom.createDom('tbody', null), 
		tfoot = goog.dom.createDom('tfoot', null));

	this.buildHeaderRow(headerrow);
	this.buildDataRows(tbody);
	this.buildFooterRows(tfoot);	
	
	this.appendGridCommands(/** @type {!Element} */ (el));	

	el.appendChild(this.table);
	if (this.data.length > 0) {
		this.addTableSorter();
		this.addTableFilter();
	}
};

/** 
 * @private 
 * @param {!Element} tr
 */
pn.ui.Grid.prototype.buildHeaderRow = function(tr) { 	
	if (this.opts.enableRowSelect) { 
		goog.dom.appendChild(tr, goog.dom.createDom('th', {'class':'row-select-head'})); 
	};
	if (this.opts.rowCommands) {
		goog.array.forEach(this.opts.rowCommands, function (command) { 			
			goog.dom.appendChild(tr, goog.dom.createDom('th', {'class':'command ' + command.cssClass}));
		});
	}
	goog.array.forEach(this.fields, function (f) { 
		var nofilter = pn.data.EntityDescriptionsManager.getPropertyValue(f, 'NoTableFilter') === 'true';
		var filtertype = pn.data.EntityDescriptionsManager.getPropertyValue(f, 'FilterType') || 'text';
		var th = goog.dom.createDom('th', {'title':f.ToolTip,'filterType':filtertype, 'class': (this.isFieldSoratable(f) ? 'sortable' : '')}, f.Name);
		
		if (nofilter) { th.setAttribute('filter', 'false'); }
		else { th.setAttribute('filter-type', filtertype); }

		goog.dom.appendChild(tr, th);
	}, this);  
};

/**
 * @param {!picnetdata.externs.FieldDescription} field
 * @return {boolean}
 */
pn.ui.Grid.prototype.isFieldSoratable = function(field) {
	return this.data.length > 0 && this.getAppropriateSorterForField(field) !== goog.ui.TableSorter.noSort;
};

/** 
 * @private 
 * @param {!Element} tbody
 */
pn.ui.Grid.prototype.buildDataRows = function(tbody) {
	if (this.data.length === 0) {
		goog.dom.appendChild(tbody, goog.dom.createDom('tr', {}, goog.dom.createDom('td', {'colspan':this.getColumnCount()}, 'No ' + this.template.NamePlural + ' found')));
	} else {    
		this.buildDataRowsImpl(tbody);		
	}
};

/** 
 * @private 
 * @param {!Element} tbody
 */
pn.ui.Grid.prototype.buildDataRowsImpl = function(tbody) {
	goog.array.forEach(this.data, function(entity) {	
		var row = goog.dom.createDom('tr', {'id':entity.ID});
		goog.dom.appendChild(tbody, row);
		this.rebuildDataRow(entity, row);		
	}, this);
};

/** 
 * @param {!picnetdata.externs.IEntity} entity
 */
pn.ui.Grid.prototype.rebuildEntityRow = function(entity) {
	var row = /** @type {!Element} */ (goog.dom.getElement(entity.ID.toString()));
	goog.dom.removeChildren(row);
	this.rebuildDataRow(entity, row);
};

/** 
 * @private 
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!Element} row
 */
pn.ui.Grid.prototype.rebuildDataRow = function(entity, row) {
	this.addSelectColumn(entity, row);
	this.addRowCommands(entity, row);
	this.addRowData(entity, row);		
};

/** 
 * @private 
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!Element} row
 */
pn.ui.Grid.prototype.addSelectColumn = function(entity, row) {
	if (!this.opts.enableRowSelect) return;

	var id = entity.ID.toString();
	var cb = goog.dom.createDom('input', {'type':'checkbox','class':'row-select-input'});
	goog.dom.appendChild(row, goog.dom.createDom('td', {}, cb));
	this.selectRowCheckboxes[id] = cb;
};

/** 
 * @private 
 * @return {!Array.<number>}
 */
pn.ui.Grid.prototype.getSelectedRowIDs = function() {
	if (!this.opts.enableRowSelect) throw 'opts.enableRowSelect is false';

	var ids = [];
	for (var i in this.selectRowCheckboxes) {
		var cb = this.selectRowCheckboxes[i];
		if (cb.checked) ids.push(parseInt(i, 10));
	}
	return ids;
};

/** 
 * @param {!Array.<number>} ids
 */
pn.ui.Grid.prototype.setSelectedRowIDs = function(ids) {
	if (!this.opts.enableRowSelect) throw 'opts.enableRowSelect is false';

	for (var id in this.selectRowCheckboxes) {
		var cb = this.selectRowCheckboxes[id];
		cb.checked = goog.array.indexOf(ids, parseInt(id, 10)) >= 0;
	}
};

/** 
 * @private 
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!Element} row
 */
pn.ui.Grid.prototype.addRowCommands = function(entity, row) {
	if (!this.opts.rowCommands) { return; }
	goog.array.forEach(this.opts.rowCommands, function (command) { 				
		var opts = {};
		if (command.linkHref) { opts['href'] = '#' + command.linkHref(entity); }

		var link;
		goog.dom.appendChild(row, goog.dom.createDom('td', null, link = goog.dom.createDom('a', opts, command.linkText)));            				
		if (command.action) { 
			this.getHandler().listen(link, goog.events.EventType.CLICK, function() { 
				command.action.call(command.handler || this, entity); 
			}, false, this);
		}                
	}, this);  
};

/** 
 * @private 
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!Element} row
 */
pn.ui.Grid.prototype.addRowData = function(entity, row) {
	row.setAttribute('id', entity.ID);
	goog.array.forEach(this.fields, function (f) { 					
		this.addFieldRunningTotals(entity, f);
		var val;
		if (this.customValue) { val = this.customValue.getEntityListCustomFieldValue(f, entity); } 
		if (val === undefined) {
			val = pn.ui.DataFormat.formatEntityField(entity, f, this.customValue);
		}
		var td = goog.dom.createDom('td', null);
		td.innerHTML = val;
		goog.dom.appendChild(row, td);            				
	}, this); 

	if (this.rowedit) this.rowedit.addInRowEditToRow(entity, row);	
};

/** 
 * @private 
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!picnetdata.externs.FieldDescription} f
 */
pn.ui.Grid.prototype.addFieldRunningTotals = function(entity, f) {
	if (pn.data.EntityDescriptionsManager.getPropertyValue(f, 'TotalOnGrid') !== 'true') { return; }	
	var field = f.FieldId;
	var val = parseFloat(entity[field]) || 0;
	this.fieldTotals[field] = this.fieldTotals[field] ? this.fieldTotals[field] + val : val;
	this.hasTotals = true;
};

/** 
 * @private 
 * @param {!Element} tfoot
 */
pn.ui.Grid.prototype.buildFooterRows = function(tfoot) { 		
	if (!this.hasTotals) { return; }

	var tr = goog.dom.createDom('tr', {'class':'sub-total'});
	goog.dom.appendChild(tfoot, tr);	
	if (this.opts.rowCommands) { 		
		goog.array.forEach(this.opts.rowCommands, function (command) { goog.dom.appendChild(tr, goog.dom.createDom('td', {}));}); 
	}
	
	goog.array.forEach(this.fields, function(f) {
		var fieldid = f.FieldId;
		var val = this.fieldTotals[fieldid];
		var td = goog.dom.createDom('td', {}, val === undefined ? '' : pn.ui.DataFormat.formatValue(f, val));		
		goog.dom.appendChild(tr, td);
	}, this);	

	var grandTotalFields = pn.data.EntityDescriptionsManager.getPropertyValue(this.template, 'GrandTotalRow');
	if (!grandTotalFields) { return; }	
	var gtfields = grandTotalFields.split(',');	
	var gt = pn.ui.DataFormat.formatValue(
		/** @type {!picnetdata.externs.FieldDescription} */ (goog.array.find(this.fields, function(f) { return f.FieldId === gtfields[gtfields.length - 1]; }))
		, goog.array.reduce(gtfields, function(v, f) { return v + (this.fieldTotals[f] || 0); }, null, this));
	
	goog.dom.appendChild(tfoot, 
		goog.dom.createDom('tr', {'class':'grand-total'}, 
			goog.dom.createDom('td', {'colspan':this.getColumnCount() - 1}),
			goog.dom.createDom('td', {}, gt.toString())
		)
	);
};


/** 
 * @private
 * @param {!Element} el
 */
pn.ui.Grid.prototype.appendGridCommands = function(el) { 
	if (!this.opts.gridCommands) return;
	goog.array.forEach(this.opts.gridCommands, function (c) {		
		this.createGridCommand(c, el);		
	}, this);	
}

/**
 * @private
 * @param {!pn.ui.GridCommand} c
 * @param {!Element} parent
 */
pn.ui.Grid.prototype.createGridCommand = function(c, parent) {
	if (c.customCommand) { c.customCommand.createCommandElement(this, parent); return; }

	var elem = goog.dom.createDom('div', {'class': c.cssClass || 'button'}, c.linkText);
	this.getHandler().listen(elem, goog.events.EventType.CLICK, c.action, false, c.handler);   
	goog.dom.appendChild(parent, elem);	
};

/**
 * @private
 */
pn.ui.Grid.prototype.addTableSorter = function() {
	var sorter = new goog.ui.TableSorter();
    sorter.decorate(this.table);
	var offset = this.getColumnCount() - this.fields.length;
	goog.array.forEach(this.fields, function (f, idx) { 
		sorter.setSortFunction(offset + idx, this.getAppropriateSorterForField(f));
    }, this); 
};

/**
 * @param {!picnetdata.externs.FieldDescription} field
 * @return {null|function(*,*):number} sorter
 * @private
 */
pn.ui.Grid.prototype.getAppropriateSorterForField = function(field) {
	
	if ("false" === pn.data.EntityDescriptionsManager.getPropertyValue(field, 'AllowSort')) return goog.ui.TableSorter.noSort;
	var type = field.FieldTypeName === 'custom' ? this.customValue.getEntityListCustomFieldDataType(field) : field.FieldTypeName;	
	if (pn.data.EntityDescriptionsManager.getPropertyValue(field, 'SelectValues')) type = 'String';

	return pn.Utils.isNumber(type) 
		? ('currency' === type || 'currency' === pn.data.EntityDescriptionsManager.getPropertyValue(field, 'FormatString'))
			? pn.ui.Grid.currencySorter
			: goog.ui.TableSorter.numericSort
		: (type === 'DateTime') 
			? pn.ui.Grid.dateSorter
			: goog.ui.TableSorter.alphaSort;
};

/**
 * @param {!*} a
 * @param {!*} b
 * @return {number} a
 */
pn.ui.Grid.dateSorter = function (a, b) { 
	a = a.split('/');
	b = b.split('/');
	var sort = goog.ui.TableSorter.numericSort(a[2], b[2]);
	if (sort !== 0) return sort;
	
	sort = goog.ui.TableSorter.numericSort(pn.Utils.getIndexOfProperty(goog.date.month, a[1].toUpperCase()), pn.Utils.getIndexOfProperty(goog.date.month, b[1].toUpperCase()));
	if (sort !== 0) return sort;

	return goog.ui.TableSorter.numericSort(a[0], b[0]);
}

/**
 * @param {!*} a
 * @param {!*} b
 * @return {number} a
 */
pn.ui.Grid.currencySorter = function (a, b) { return goog.ui.TableSorter.numericSort(a.substring(1), b.substring(1)); }

/**
 * @private
 */
pn.ui.Grid.prototype.addTableFilter = function() {
    if(this.opts.enableFilters === false) return;
	var opts = new pn.ui.filter.TableFilterOptions();
	opts.enableCookies = false;
	new pn.ui.filter.TableFilter(this.table, opts);
};

/**
 * @private
 * @return {!Array.<picnetdata.externs.FieldDescription>}
 */
pn.ui.Grid.prototype.getGridFields = function() {	
	/** @type {!Array.<picnetdata.externs.FieldDescription>} */
	var fields = [];
	var tmpfields = this.template.Fields;
	goog.array.forEach(this.template.Fields, function(f) {
		if (f.IgnoreOnAutoGenerateUI || !f.Visible || pn.data.EntityDescriptionsManager.getPropertyValue(f, 'HideOnList') === 'true') { return; }
		if (this.opts.hiddenFields && goog.array.indexOf(this.opts.hiddenFields, f.FieldId) >= 0) { return; }		
		fields.push(f);
	}, this);
	var customColumns = pn.data.EntityDescriptionsManager.getPropertyValue(this.template, 'CustomGridColumns');
	if (customColumns) {
		customColumns = customColumns.split(';');
		goog.array.forEach(customColumns, function (cf) {
			var cfvals = cf.split('|');
			fields.push({'FieldId':cfvals[0],'FieldTypeName':'custom','Name':cfvals[1]});
		}, this);
	}
	return fields;
}

/**
 * @return {!Array.<Array.<string>>}
 */
pn.ui.Grid.prototype.getVisibleData = function() {
	var data = [];	
	this.appendRowData(data, this.table.tHead.rows[0]);	
	goog.array.forEach(this.table.tBodies[0].rows, function(tr) { this.appendRowData(data, tr); }, this);	
	return data;
};


/**
 * @private
 * @param {!Array.<Array.<string>>} data
 * @param {!Element} tr
 */
pn.ui.Grid.prototype.appendRowData = function(data, tr) {
	if (!goog.style.isElementShown(tr)) { return; }
	if (this.opts.enableRowSelect) {
		var id = parseInt(tr.getAttribute('id'), 10);		
		if (id && !this.selectRowCheckboxes[id.toString()].checked) { return; }
	}

	var rowdata = [];
	var offset = this.getColumnCount() - this.fields.length;
	for (var i = offset; i < tr.cells.length; i++) {
		rowdata.push(goog.dom.getTextContent(tr.cells[i]));
	}
	data.push(rowdata);
};

/**
 * @return {!Array.<number>}
 */
pn.ui.Grid.prototype.getVisibleDataIDs = function() {
	var ids = [];	
	goog.array.forEach(this.table.tBodies[0].rows, function(tr) { 
		if (!goog.style.isElementShown(tr)) { return; }
		var id = parseInt(tr.getAttribute('id'), 10);		
		if (this.opts.enableRowSelect && !this.selectRowCheckboxes[id.toString()].checked) { return; }
		ids.push(parseInt(id, 10));
	}, this);	
	return ids;
};

/** @inheritDoc */
pn.ui.Grid.prototype.createDom = function() {
  pn.ui.Grid.superClass_.createDom.call(this);
  this.decorateInternal(this.getElement());
};


/** @inheritDoc */
pn.ui.Grid.prototype.disposeInternal = function() {
  pn.ui.Grid.superClass_.disposeInternal.call(this);  
  
  goog.dispose(this.rowedit);
  goog.dispose(this.opts);
  goog.dispose(this.customValue);

  delete this.table;
};