
goog.provide('pn.ui.edit.Config');

goog.require('pn.ui.BaseConfig');


/**
 * @constructor
 * @extends {pn.ui.BaseConfig}
 * @param {!Array.<pn.ui.edit.Field>} fields An array of field specifications
 *    that describe how each of the display fields should be displayed,
 *    captioned and validated.
 * @param {function(?):string=} opt_template The optional template to render
 *    this edit control.
 */
pn.ui.edit.Config = function(fields, opt_template) {  
  goog.asserts.assert(fields);  

  pn.ui.BaseConfig.call(this, fields);

  /** @type {null|function(?):string} */
  this.template = opt_template || null;

  /** @type {!Array.<pn.ui.edit.Field>} */
  this.fields = fields;
};
goog.inherits(pn.ui.edit.Config, pn.ui.BaseConfig);