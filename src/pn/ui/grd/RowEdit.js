
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.array');
goog.require('goog.events.EventType');
    
goog.require('pn.ui.Edit');

goog.provide('pn.ui.RowEdit');

/**
 * @param {!picnetdata.externs.EntityDescription} template
 * @param {!picnetdata.externs.IEntity} data
 * @param {!Array.<picnetdata.externs.EntityDescription>} fields
 * @param {number} rowCommandsCount
 * @constructor
 * @extends {pn.ui.Edit}
 */
pn.ui.RowEdit = function(template, data, fields, rowCommandsCount) {
	pn.ui.Edit.call(this, template, data);
	
	/**
	 * @private
	 * @type {!Array.<picnetdata.externs.EntityDescription>}
	 */
	this.fields = fields;

	/**
	 * @private
	 * @type {!Element}
	 */
	 this.dataRow;

	 /**
	  * @private
	  * @type {!Element}
	  */
	 this.editRow;

	 /**
	  * @private
	  * @type {!Element}
	  */
	 this.rowControls;

	 /**
	  * @private
	  * @type {number}
	  */
	 this.rowCommandsCount = rowCommandsCount;
};
goog.inherits(pn.ui.RowEdit, pn.ui.Edit);

/** @inheritDoc */
pn.ui.RowEdit.prototype.decorateInternal = function(tr) {		
	this.dataRow = /** @type {!Element} */ (tr);
	goog.style.showElement(this.dataRow, false);

	this.editRow = this.buildEditRow(this.dataRow);	
	this.rowControls = this.buildEditRowControls();
};

/**
 * @private
 * @param {!Element} dataRow
 * @return {!Element}
 */
pn.ui.RowEdit.prototype.buildEditRow = function(dataRow) {		
	var editRow = goog.dom.createDom('tr', {'class':'edit-row'});
	goog.dom.insertSiblingAfter(editRow, dataRow);

	for (var i = 0; i < this.rowCommandsCount; i++) { goog.dom.appendChild(editRow, goog.dom.createDom('td')); }

	goog.array.forEach(this.fields, function(f) {		
		var td = goog.dom.createDom('td');
		goog.dom.appendChild(editRow, td);  
		this.appendFieldInputControlHtml(f, td, false);		
	}, this);

	return editRow;
};

/**
 * @private
 * @return {!Element}
 */
pn.ui.RowEdit.prototype.buildEditRowControls = function() {
	var save, cancel;
	var controls = goog.dom.createDom('div', {'class':'row-edit-controls'},
		save = goog.dom.createDom('div', {'class':'row-edit-control-save button'}, 'Save'),
		cancel = goog.dom.createDom('div', {'class':'row-edit-control-cancel button'}, 'Cancel'));	
	goog.dom.appendChild(goog.dom.getElement('contents'), controls);		
	var top = goog.style.getPageOffsetTop(this.editRow) + goog.style.getSize(this.editRow).height;
	goog.style.setPosition(controls, '45%', top + 'px');

	this.getHandler().listen(save, goog.events.EventType.CLICK, this.saveClicked, false, this);        
    this.getHandler().listen(cancel, goog.events.EventType.CLICK, this.dispose, false, this);                
	
	return controls;
};

/** @inheritDoc */
pn.ui.RowEdit.prototype.disposeInternal = function() {
  pn.ui.RowEdit.superClass_.disposeInternal.call(this);  

  goog.style.showElement(this.dataRow, true);
  delete this.dataRow;

  goog.dom.removeNode(this.editRow);
  delete this.editRow;

  goog.dom.removeNode(this.rowControls);
  delete this.rowControls;
};