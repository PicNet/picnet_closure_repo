
goog.require('goog.events');
goog.require('goog.events.EventHandler');

goog.require('pn.ui.EntityEditEvents');
goog.require('pn.data.EntityDescriptionsManager');
goog.require('pn.ui.RowEdit');

goog.provide('pn.ui.GridRowEdit');


/**
 * @param {!picnetdata.externs.EntityDescription} template
 * @param {!Array.<picnetdata.externs.EntityDescription>} fields
 * @param {number} rowCommandsCount
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pn.ui.GridRowEdit = function(template, fields, rowCommandsCount) {
	goog.events.EventTarget.call(this);
	/**
	 * @private
	 * @type {!picnetdata.externs.EntityDescription}
	 */
	this.template = template;			
	/**
	 * @private
	 * @type {!Array.<picnetdata.externs.EntityDescription>}
	 */
	this.fields = fields;	
	/**
	 * @private
	 * @type {pn.ui.RowEdit}
	 */
	 this.editor;
	/**
	 * @private
	 * @type {goog.events.EventHandler}
	 */
	 this.eventHandler = new goog.events.EventHandler(this);
	 /**
	  * @private
	  * @type {number}
	  */
	  this.rowCommandsCount = rowCommandsCount;
};
goog.inherits(pn.ui.GridRowEdit, goog.events.EventTarget);

/**
 *
 */
pn.ui.GridRowEdit.prototype.hide = function() {
	goog.dispose(this.editor);
	delete this.editor;
};

/** 
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!Element} row
 */
pn.ui.GridRowEdit.prototype.addInRowEditToRow = function(entity, row) {
	if (pn.data.EntityDescriptionsManager.getPropertyValue(this.template, 'AllowInGridEditing') !== 'true') { return; }
	this.eventHandler.listen(row, goog.events.EventType.DBLCLICK, function() { this.inGridEditRow(entity, row); }, false, this);   
};

/** 
 * @private 
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!Element} row
 */
pn.ui.GridRowEdit.prototype.inGridEditRow = function(entity, row) {
	if (this.editor && !this.editor.isDisposed()) {
		if (!confirm('Cancel the current row editing?')) { return; }
		goog.dispose(this.editor);
		delete this.editor;
	}
	this.editor = new pn.ui.RowEdit(this.template, entity, this.fields, this.rowCommandsCount);
	this.eventHandler.listen(this.editor, pn.ui.EntityEditEvents.SAVE, this.dispatchEvent);
	this.editor.decorate(row);
};

/** 
 * @return {boolean}
 */
pn.ui.GridRowEdit.prototype.isDirty = function() {
	return goog.isDefAndNotNull(this.editor) && !this.editor.isDisposed() && this.editor.isDirty();
};

/** @inheritDoc */
pn.ui.GridRowEdit.prototype.disposeInternal = function() {
  pn.ui.GridRowEdit.superClass_.disposeInternal.call(this);
  
  goog.dispose(this.eventHandler);
  delete this.eventHandler;

  goog.dispose(this.editor);
  delete this.editor;
};