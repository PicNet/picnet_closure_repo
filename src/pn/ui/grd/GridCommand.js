
goog.require('goog.Disposable');

goog.require('pn.ui.ICustomGridCommand');

goog.provide('pn.ui.GridCommand');

/**
 * @constructor 
 * @extends {goog.Disposable}
 */
pn.ui.GridCommand = function() {	
	goog.Disposable.call(this);

	/** @type {string} */
	this.linkText;
	/** @type {string} */
	this.cssClass;
	/** @type {!function(Object)|undefined} */	
	this.action;
	/** @type {!function(Object):string|undefined} */
	this.linkHref;
    /** @type {!Object|undefined} */
    this.handler;	
	/** @type {pn.ui.ICustomGridCommand} */
    this.customCommand;	
};
goog.inherits(pn.ui.GridCommand, goog.Disposable);

/** @inheritDoc */
pn.ui.GridCommand.prototype.disposeInternal = function() {
    pn.ui.GridCommand.superClass_.disposeInternal.call(this);

	goog.dispose(this.customCommand);

	delete this.action;
	delete this.linkHref;
	delete this.handler;
	
};

/** 
 * @param {string} linkText
 * @param {string} cssClass
 * @param {!function(Object)} action
 * @param {!Object=}  handler
 */
pn.ui.GridCommand.buildActionCommand = function(linkText, cssClass, action, handler) {
	var c = new pn.ui.GridCommand();
	
	c.linkText = linkText;
	c.cssClass = cssClass;
	c.action = action;	
    c.handler = handler;	
	return c;
};