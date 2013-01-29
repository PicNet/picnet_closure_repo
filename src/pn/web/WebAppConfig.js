
goog.provide('pn.app.WebAppConfig');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.app.AppConfig');
goog.require('pn.data.BaseDalCache');
goog.require('pn.ui.edit.FieldRenderers');
goog.require('pn.ui.edit.ReadOnlyFields');
goog.require('pn.ui.grid.ColumnRenderers');



/**
 * Note: The defaultFieldRenderers and the defaultColumnRenderers map a field
 *    schema type property to a renderer.  Since the schema type comes from the
 *    server we need to specify them using strings.
 *
 * @constructor
 * @extends {pn.app.AppConfig}
 * @param {Object=} opt_opts The configuration options for the
 *    application. These options will be extended on top of the default
 *    pn.app.WebAppConfig options.
 */
pn.app.WebAppConfig = function(opt_opts) {
  var fr = pn.ui.edit.FieldRenderers,
      rr = pn.ui.edit.ReadOnlyFields,
      cr = pn.ui.grid.ColumnRenderers;

  /** @type {string} */
  this.viewContainerId = 'view-container';

  /** @type {string} */
  this.messagePanelId = 'message';

  /** @type {string} */
  this.loadPnlId = 'loading-panel';

  /** @type {boolean} */
  this.enableImpersonation = false;

  /** @type {!Object} */
  this.defaultFieldRenderers = {

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'boolean': fr.boolRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'goog.date.DateTime': fr.dateRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'string': fr.textFieldRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'number': fr.intRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'parent': fr.entityParentListField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'LongString': fr.textAreaRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'Enumeration': fr.enumRenderer,

    /** @type {number} */
    textAreaLengthThreshold: 500
  };

  /** @type {!Object} */
  this.defaultReadOnlyFieldRenderers = {
    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'boolean': rr.boolField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'goog.date.DateTime': rr.dateField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'number': rr.intField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'parent': rr.entityParentListField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'Enumeration': rr.enumField
  };

  /** @type {!Object} */
  this.defaultColumnRenderers = {

    /** @type {pn.ui.grid.ColumnSpec.Renderer} */
    'boolean': cr.yesNoBoolRenderer,

    /** @type {pn.ui.grid.ColumnSpec.Renderer} */
    'goog.date.DateTime': cr.dateRenderer,

    /** @type {pn.ui.grid.ColumnSpec.Renderer} */
    'parent': cr.parentColumnRenderer,

    /** @type {pn.ui.grid.ColumnSpec.Renderer} */
    'Enumeration': cr.enumRenderer
  };

  pn.app.AppConfig.call(this, opt_opts);
};
goog.inherits(pn.app.WebAppConfig, pn.app.AppConfig);
