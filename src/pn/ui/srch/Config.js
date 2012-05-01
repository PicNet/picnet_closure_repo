;
goog.provide('pn.ui.srch.Config');

goog.require('pn.ui.BaseConfig');



/**
 * @constructor
 * @extends {pn.ui.BaseConfig}
 * @param {string} type The type of the entity being searched.
 * @param {!Array.<pn.ui.edit.Field>} fields An array of field specifications
 *    that describes all fields to be searched.
 */
pn.ui.srch.Config = function(type, fields) {
  goog.asserts.assert(type);
  goog.asserts.assert(fields.length > 0);

  pn.ui.BaseConfig.call(this, fields);

  /**
   * @private
   * @type {string}
   */
  this.type_ = type;

  /** @type {!Array.<pn.ui.edit.Field>} */
  this.fields = fields;

  /** @type {boolean} */
  this.showTypePrefixes = false;
};
goog.inherits(pn.ui.srch.Config, pn.ui.BaseConfig);


/** @inheritDoc */
pn.ui.srch.Config.prototype.getRelatedTypes = function() {
  var types = pn.ui.srch.Config.superClass_.getRelatedTypes.call(this);
  types.push(this.type_);
  return types;
};
