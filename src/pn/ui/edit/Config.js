;
goog.provide('pn.ui.edit.Config');

goog.require('pn.ui.edit.IInterceptor');



/**
 * @constructor
 * @param {string} type The entity types of this grid.
 */
pn.ui.edit.Config = function(type) {

  /** @type {string} */
  this.type = type;

  /** @type {string} */
  this.cancelEvent = '';

  /** @type {string} */
  this.saveEvent = '';

  /** @type {pn.ui.edit.IInterceptor} */
  this.interceptor = null;
};
