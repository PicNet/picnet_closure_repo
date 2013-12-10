;
goog.provide('pn.ui.UiSpec');

goog.require('pn.ui.srch.Config');
goog.require('pn.ui.edit.Config');
goog.require('pn.ui.grid.Config');


/**
 * The base class for all entity rendering or panel specifications.  This class
 *    defines fields, columns, commands, configs, etc that should allow generic
 *    use of the pn.ui.edit.Edit / pn.ui.grid.Grid utility classes whilst being
 *    flexible enough to provide any kind of UI layer.

 * @constructor
 * @extends {goog.Disposable}
 * @param {string} id The unique identifier for this display spec.  There can
 *    not be more than one UiSpec in the system defined with this ID.
 * @param {string=} opt_type The optional type representing this
 *    display spec. If this is omitted it is inferred from the id.
 * @param {string=} opt_name The optional display name of this entity type. If
 *    If this is omitted it is inferred from the type.
 */
pn.ui.UiSpec = function(id, opt_type, opt_name) {
  pn.ass(id);

  goog.Disposable.call(this);

  /** @type {string} */
  this.id = id;

  /** @type {string} */
  this.type = opt_type || this.id;

  /** @type {string} */
  this.name = opt_name || this.type;
};
goog.inherits(pn.ui.UiSpec, goog.Disposable);

////////////////////////////////////////////////////////////////////////////////
// OPTIONAL TEMPLATE METHODS - IMPLEMENT AS REQUIRED
////////////////////////////////////////////////////////////////////////////////


/**
 * Gets the specifications for the pn.ui.edit.Edit component including all
 *  fields, commands and display details.
 *
 * @param {!pn.data.Entity} entity The entity being edited.
 * @param {!pn.data.BaseDalCache} cache The current cache context.
 * @return {!pn.ui.edit.Config} The edit page config.
 */
pn.ui.UiSpec.prototype.getEditConfig = goog.abstractMethod;


/**
 * Gets the specifications for the pn.ui.srch.SearchPanel component including
 *    all fields to be searcheable.
 *
 * @param {!pn.data.BaseDalCache} cache The current cache context.
 * @return {!pn.ui.srch.Config} The search component config.
 */
pn.ui.UiSpec.prototype.getSearchConfig = goog.abstractMethod;


/**
 * Gets the grid config.  The grid config specifies details such as columns,
 *    commands and internal slick grid details.  This configuration object is
 *    used by any pn.ui.grid.Grid entity to display a grid of entities of
 *    this type.
 *
 * @param {!pn.data.BaseDalCache} cache The current cache context.
 * @return {!pn.ui.grid.Config} The grid configuration.
 */
pn.ui.UiSpec.prototype.getGridConfig = goog.abstractMethod;


/**
 * Gets the additional types required when displaying this edit control.
 *
 * @return {!Array.<string>} The additional types to load.
 */
pn.ui.UiSpec.prototype.getEditAdditionalTypes = function() { return []; };


/**
 * Gets the additional types required when displaying this grid.
 *
 * @return {!Array.<string>} The additional types to load.
 */
pn.ui.UiSpec.prototype.getGridAdditionalTypes = function() { return []; };
