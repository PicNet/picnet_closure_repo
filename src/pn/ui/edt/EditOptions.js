
goog.provide('picnet.ui.EntityEditOptions');

/**
 * @constructor
 * @param {boolean} edit
 * @param {!Array.<string>=} hiddenFields
 * @param {!Object.<string,*>=} hiddenFieldValues
 */
picnet.ui.EntityEditOptions = function(edit, hiddenFields, hiddenFieldValues) {	
    /**
     * @type {boolean}
     */
    this.edit = edit;	

	/**
     * @type {boolean}
     */
    this.allowDelete = edit;	

	/** 
	 * @type {!Array.<string>|undefined} 
	 */
	this.hiddenFields = hiddenFields;	

	/** 
	 * @type {!Object.<string,*>|undefined} 
	 */
	this.hiddenFieldValues = hiddenFieldValues;

    /**
     * @type {boolean}
     */
    this.enableFilterOnInnerTables = true;	

	/**
     * @type {function(!picnetdata.externs.EntityDescription, picnetdata.externs.IEntity, picnet.ui.EntityEditOptions=)}
     */
    this.innerTablesOnAddEdit;	
};