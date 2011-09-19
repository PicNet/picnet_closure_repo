
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.ui.Option');
goog.require('goog.ui.Select');
goog.require('goog.ui.MenuSeparator');
goog.require('goog.Disposable');
goog.require('goog.ui.Component.EventType');
goog.require('goog.json');
goog.require('goog.net.IframeIo');

goog.require('pn.Utils');
goog.require('pn.ui.ICustomGridCommand');
goog.require('pn.ui.Grid');
goog.require('pn.data.EntityDescriptionsManager');
goog.require('pn.ui.DataExport');

goog.provide('pn.ui.GridExportSelect');

/**
 * @param {!picnetdata.externs.EntityDescription} template 
 * @param {string} exportUrl 
 * @implements {pn.ui.ICustomGridCommand}
 * @extends {goog.Disposable}
 * @constructor
 */
pn.ui.GridExportSelect = function(template, exportUrl) {
	goog.Disposable.call(this);

	/**
	 * @type {!picnetdata.externs.EntityDescription}
	 */
	this.template = template;		

	/**
	 * @type {string}
	 */
	this.exportUrl = exportUrl;				
	
	/**
	 * @type {!pn.ui.Grid}
	 */
	this.grid;		
};
goog.inherits(pn.ui.GridExportSelect, goog.Disposable);

/** @inheritDoc */
pn.ui.GridExportSelect.prototype.createCommandElement = function(grid, parent) {
	this.grid = grid;

	var select = new goog.ui.Select('Export Data...');
	select.addItem(new goog.ui.Option('Export Data...', ''));
    select.addItem(new goog.ui.Option('CSV', 'csv'));
    select.addItem(new goog.ui.Option('TXT (tab delimited)', 'txt'));
	select.addItem(new goog.ui.Option('Excel', 'xls'));
	select.addItem(new goog.ui.Option('PDF', 'pdf'));
	var customExporters = pn.data.EntityDescriptionsManager.getPropertyValue(this.template, 'CustomExporters');
	if (customExporters) {
		select.addItem(new goog.ui.MenuSeparator());
		customExporters = customExporters.split(';');
		goog.array.forEach(customExporters, function(exp) { select.addItem(new goog.ui.Option(exp.split('|')[0])); }, this);
	}
    select.setSelectedIndex(0);
	goog.events.listen(select, goog.ui.Component.EventType.ACTION,
		function(e) {
			var val = select.getValue();			
			if (!val) return;
			select.setSelectedIndex(0);
			this.exportDataImpl(parent, val);
		}, false, this);

		
	select.render(parent);
};

/**  
 * @param {!Element} parent
 * @private  
 * @param {string} exportType
 */
pn.ui.GridExportSelect.prototype.exportDataImpl = function(parent, exportType) {			
	var data = {
		'entityType':this.template.TableName,
		'exportIds':goog.json.serialize(this.grid.getVisibleDataIDs()),
		'exportType':exportType,
		'exportData':goog.json.serialize(this.grid.getVisibleData())
	};
	new pn.ui.DataExport(parent, this.exportUrl, data, this.onComplete);
};

/**
 * @private
 * @param {goog.net.IframeIo} io
 */
pn.ui.GridExportSelect.prototype.onComplete = function(io) {
	if (io.isSuccess()) {
		var errors = /** @type {!Array.<Array.<string>>} */ (pn.Utils.parseJson(io.getResponseHtml()));
		if (errors && errors.length > 0) {
			cdm.nav.showErrors(errors);
		} else {
			cdm.nav.showMessage('Successfully exported');
		}
	} else {
		cdm.nav.showError('Error exporting data  - ' + io.getLastError());
	}
};

/** @inheritDoc */
pn.ui.GridExportSelect.prototype.disposeInternal = function() {
    pn.ui.GridExportSelect.superClass_.disposeInternal.call(this);
	goog.dispose(this.grid);
};