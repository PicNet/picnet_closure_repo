;
goog.provide('pn.ui.edit.Config');



/**
 * @constructor
 * @param {string} type The entity types of this grid.
 */
pn.ui.edit.Config = function(type) {
  /** @type {string} */
  this.type = type;
};


/**
 * @return {Object} A SlickGrid compative object even when in COMPILE mode.
 */
pn.ui.edit.Config.prototype.toSlick = function() {
  return {};
};
