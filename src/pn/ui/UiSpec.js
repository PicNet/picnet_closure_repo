;
goog.provide('pn.ui.UiSpec');

goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.style');
goog.require('pn.data.TypeRegister');
goog.require('pn.ui.edit.FieldSpec');
goog.require('pn.ui.edit.cmd.Command');
goog.require('pn.ui.grid.ColumnSpec');
goog.require('pn.ui.grid.Command');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.ExportCommand');
goog.require('pn.ui.srch.Config');



/**
 * The base class for all entity rendering or panel specifications.  This class
 *    defines fields, columns, commands, configs, etc that should allow generic
 *    use of the pn.ui.edit.Edit / pn.ui.grid.Grid utility classes whilst being
 *    flexible enough to provide any kind of UI layer.

 * @constructor
 * @extends {goog.Disposable}
 * @param {string} id The unique identifier for this display spec.  There can
 *    not be more than one UiSpec in the system defined with this ID.
 * @param {pn.data.Type=} opt_type The optional type representing this
 *    display spec. If this is omitted it is inferred from the id.
 * @param {string=} opt_name The optional display name of this entity type. If
 *    If this is omitted it is inferred from the type.
 */
pn.ui.UiSpec = function(id, opt_type, opt_name) {
  goog.asserts.assert(id);

  goog.Disposable.call(this);

  /** @type {string} */
  this.id = id;

  /** @type {pn.data.Type} */
  this.type = opt_type || pn.data.TypeRegister.fromName(this.id);

  /** @type {string} */
  this.name = opt_name || this.type.type;
};
goog.inherits(pn.ui.UiSpec, goog.Disposable);

////////////////////////////////////////////////////////////////////////////////
// OPTIONAL TEMPLATE METHODS - IMPLEMENT AS REQUIRED
////////////////////////////////////////////////////////////////////////////////


/**
 * Gets the specifications for the pn.ui.edit.Edit component including all
 *  fields, commands and display details.
 *
 * @param {!Object} entity The entity being edited.
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
 * Gets a grid config with the specified width.  The grid config specifies
 *    details such as columns, commands and internal slick grid details.  This
 *    configuration object is used by any pn.ui.grid.Grid entity to display
 *    a grid of entities of this type.
 *
 * @param {!pn.data.BaseDalCache} cache The current cache context.
 * @return {!pn.ui.grid.Config} The grid configuration.
 */
pn.ui.UiSpec.prototype.getGridConfig = goog.abstractMethod;

////////////////////////////////////////////////////////////////////////////////
// PUBLIC HELPERS
////////////////////////////////////////////////////////////////////////////////


/**
 * @param {string} id The id representing this column.
 * @param {!pn.data.BaseDalCache} cache The current context cache.
 * @param {Object=} opt_props Any additional properties for this column.
 * @return {!pn.ui.grid.ColumnCtx} The created column.
 */
pn.ui.UiSpec.prototype.createColumn = function(id, cache, opt_props) {
  var spec = new pn.ui.grid.ColumnSpec(id, opt_props || {}, this);
  var fctx = new pn.ui.grid.ColumnCtx(spec, cache);
  this.registerDisposable(fctx);

  return fctx;
};


/**
 * @param {string} id The id representing this ordering column.
 * @param {!pn.data.BaseDalCache} cache The current context cache.
 * @return {!pn.ui.grid.ColumnCtx} The created column.
 */
pn.ui.UiSpec.prototype.createOrderingColumn = function(id, cache) {
  var spec = new pn.ui.grid.OrderingColumnSpec(id, this);
  var fctx = new pn.ui.grid.ColumnCtx(spec, cache);
  this.registerDisposable(fctx);

  return fctx;
};


/**
 * @param {string} id The id representing this field.
 * @param {!pn.data.BaseDalCache} cache The current context cache.
 * @param {Object=} opt_props Any additional properties for this field.
 * @return {!pn.ui.edit.FieldCtx} The field created.
 */
pn.ui.UiSpec.prototype.createField = function(id, cache, opt_props) {
  var spec = new pn.ui.edit.FieldSpec(id, opt_props || {}, this);
  var fctx = new pn.ui.edit.FieldCtx(spec, cache);
  this.registerDisposable(fctx);

  return fctx;
};
