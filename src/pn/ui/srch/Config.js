;
goog.provide('pn.ui.srch.Config');

goog.require('pn.ui.BaseConfig');



/**
 * @constructor
 * @extends {pn.ui.BaseConfig}
 * @param {string} type The type of the entity being searched.
 * @param {!Array.<pn.ui.edit.FieldSpec>} fieldSpecs An array of field meta
 *    specifications that describes all fields to be searched.
 */
pn.ui.srch.Config = function(type, fieldSpecs) {
  goog.asserts.assert(type);
  goog.asserts.assert(fieldSpecs.length > 0);

  pn.ui.BaseConfig.call(this, fieldSpecs);

  /**
   * @private
   * @type {string}
   */
  this.type_ = type;

  /** @type {!Array.<pn.ui.edit.FieldSpec>} */
  this.fieldSpecs = fieldSpecs;

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
