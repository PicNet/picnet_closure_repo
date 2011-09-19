
goog.require('pn.ui.GridCommand');
goog.require('goog.Disposable');
goog.require('goog.array');

goog.provide('pn.ui.GridOptions');

/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.ui.GridOptions = function() {		
	goog.Disposable.call(this);

	/** @type {!Array.<pn.ui.GridCommand>} */
	this.rowCommands = [];
	/** @type {!Array.<pn.ui.GridCommand>} */
	this.gridCommands = [];
	/** @type {!Array.<string>} */
	this.hiddenFields = [];
	/** @type {boolean} */
	this.enableInGridEdit = false;
	/** @type {boolean} */
	this.enableRowSelect = false;
    /** @type {boolean} */
	this.enableFilters = true;
};
goog.inherits(pn.ui.GridOptions, goog.Disposable);

/** @inheritDoc */
pn.ui.GridOptions.prototype.disposeInternal = function() {
    pn.ui.GridOptions.superClass_.disposeInternal.call(this);

	goog.array.forEach(this.gridCommands, goog.dispose);
	delete this.gridCommands;
	goog.array.forEach(this.rowCommands, goog.dispose);
	delete this.rowCommands;
  delete this.hiddenFields;
}