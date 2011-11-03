;
goog.provide('pn.ui.edit.ComplexRenderer');

goog.require('goog.events.EventHandler');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
pn.ui.edit.ComplexRenderer = function() {
  goog.ui.Component.call(this);

  /**
   * @protected
   * @type {*}
   */
  this.val = null;

  /**
   * @protected
   * @type {Object}
   */
  this.entity = null;

  /**
   * @protected
   * @type {boolean}
   */
  this.inSearchFilter = false;
};
goog.inherits(pn.ui.edit.ComplexRenderer, goog.ui.Component);


/**
 * @param {*} val The value to display in this field.
 * @param {Object} entity The entity being displayed.
 * @param {boolean=} opt_search If this field is being created in search mode.
 */
pn.ui.edit.ComplexRenderer.prototype.initialise =
    function(val, entity, opt_search) {
  this.val = val;
  this.entity = entity;
  this.inSearchFilter = opt_search === true;
};


/**
 * @return {*} Gets the value in the current editor.
 */
pn.ui.edit.ComplexRenderer.prototype.getValue = goog.abstractMethod;


/**
 * Optional
 * @return {string} Any error (if any) for the specified field.
 */
pn.ui.edit.ComplexRenderer.prototype.validate = function() { return ''; };
