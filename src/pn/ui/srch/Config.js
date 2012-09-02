;
goog.provide('pn.ui.srch.Config');

goog.require('pn.ui.edit.Config');



/**
 * @constructor
 * @extends {pn.ui.edit.Config} // Should this be grid.Config??
 * @param {pn.data.Type} type The type of the entity being searched.
 * @param {!Array.<pn.ui.edit.FieldCtx>} fCtxs An array of field context meta
 *    specifications that describes all fields to be searched.
 */
pn.ui.srch.Config = function(type, fCtxs) {
  goog.asserts.assert(type);
  goog.asserts.assert(fCtxs.length > 0);

  pn.ui.edit.Config.call(this, fCtxs, []);

  /**
   * @private
   * @type {pn.data.Type}
   */
  this.type_ = type;


  /** @type {boolean} */
  this.showTypePrefixes = false;
};
goog.inherits(pn.ui.srch.Config, pn.ui.edit.Config);
