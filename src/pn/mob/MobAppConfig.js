
goog.provide('pn.mob.MobAppConfig');

goog.require('pn.app.AppConfig');
goog.require('pn.ui.MobDefaultRenderer');
goog.require('pn.ui.edit.FieldSpec');
goog.require('pn.ui.grid.ColumnSpec');



/**
 * Note: The defaultFieldRenderers and the defaultColumnRenderers map a field
 *    schema type property to a renderer.  Since the schema type comes from the
 *    server we need to specify them using strings.
 *
 * @constructor
 * @extends {pn.app.AppConfig}
 * @param {Object=} opt_opts The configuration options for the
 *    application. These options will be extended on top of the default
 *    pn.mob.MobAppConfig options.
 */
pn.mob.MobAppConfig = function(opt_opts) {
  /** @type {string} */
  this.messagePanelId = 'message';

  /** @type {string} */
  this.loadPnlId = 'loading-panel';

  /** @type {!Object} */
  this.defaultFieldRenderers = {
  };

  /** @type {!Object} */
  this.defaultReadOnlyFieldRenderers = {
  };

  /** @type {!Object} */
  this.defaultColumnRenderers = {
  };

  pn.app.AppConfig.call(this, opt_opts);
};
goog.inherits(pn.mob.MobAppConfig, pn.app.AppConfig);


/** @override */
pn.mob.MobAppConfig.prototype.defaultRendererCreator =
    function() { return new pn.ui.MobDefaultRenderer(); };
