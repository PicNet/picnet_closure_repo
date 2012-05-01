;
goog.provide('pn.ui.UiSpec');

goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.style');
goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.Edit.EventType');
goog.require('pn.ui.edit.Field');
goog.require('pn.ui.grid.Column');
goog.require('pn.ui.grid.Command');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.ExportCommand');
goog.require('pn.ui.grid.Grid.EventType');
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
 * @param {string=} opt_type The optional type representing this display spec.
 *    If this is omitted it is inferred from the id.
 * @param {string=} opt_name The optional display name of this entity type. If
 *    If this is omitted it is inferred from the type.
 */
pn.ui.UiSpec = function(id, opt_type, opt_name) {
  goog.asserts.assert(id);

  goog.Disposable.call(this);

  /** @type {string} */
  this.id = id;

  /** @type {string} */
  this.type = opt_type || this.id;

  /** @type {string} */
  this.name = opt_name || this.type;

  /** @type {pn.ui.edit.Config} */
  this.editConfig = this.getEditConfig();

  /** @type {pn.ui.srch.Config} */
  this.searchConfig = this.getSearchConfig();

  /** @type {pn.ui.grid.Config} */
  this.gridConfig = this.getGridConfig();
};
goog.inherits(pn.ui.UiSpec, goog.Disposable);


/**
 * @protected
 * Gets the specifications for the pn.ui.edit.Edit component including all
 *  fields, commands and display details.
 *
 * Note: This is a template method and should only be called by this
 *    constructor to initialise this UiSpec.
 *
 * @return {pn.ui.edit.Config} The edit page config.
 */
pn.ui.UiSpec.prototype.getEditConfig = function() { return null; };


/**
 * @protected
 * Gets the specifications for the pn.ui.srch.SearchPanel component including
 *    all fields to be searcheable.
 *
 * Note: This is a template method and should only be called by this
 *    constructor to initialise this UiSpec.
 *
 * @return {pn.ui.srch.Config} The search component config.
 */
pn.ui.UiSpec.prototype.getSearchConfig = function() { return null; };


/**
 * @protected
 *
 * Gets a grid config with the specified width.  The grid config specifies
 *    details such as columns, commands and internal slick grid details.  This
 *    configuration object is used by any pn.ui.grid.Grid entity to display
 *    a grid of entities of this type.
 *
 * Note: This is a template method and should only be called by this
 *    constructor to initialise this UiSpec.
 *
 * @return {pn.ui.grid.Config} The grid configuration.
 */
pn.ui.UiSpec.prototype.getGridConfig = function() { return null; };


/**
 * @param {string} field The field in the data representing this column.
 * @param {(string|Object)=} opt_captionOrProps The optional header caption for
 *    this field or the properties map. If caption is omitted the the field id
 *    will be used (parsing cammel casing).
 * @param {Object=} opt_props Any additional properties
 *    for this column.
 * @return {!pn.ui.grid.Column} The created column.
 */
pn.ui.UiSpec.prototype.createColumn =
    function(field, opt_captionOrProps, opt_props) {
  return /** @type {!pn.ui.grid.Column} */ (this.createDisplayItem_(
      field, pn.ui.grid.Column, opt_captionOrProps, opt_props));
};


/**
 * @param {string} id The id representing this field.
 * @param {(string|Object)=} opt_captionOrProps The optional header caption for
 *    this field or the properties map. If caption is omitted the the field id
 *    will be used (parsing cammel casing).
 * @param {Object=} opt_props Any additional properties
 *    for this field.
 * @return {!pn.ui.edit.Field} The field created.
 */
pn.ui.UiSpec.prototype.createField =
    function(id, opt_captionOrProps, opt_props) {
  return /** @type {!pn.ui.edit.Field} */ (this.createDisplayItem_(
      id, pn.ui.edit.Field, opt_captionOrProps, opt_props));
};


/**
 * @private
 * @param {string} field The field in the data representing this column.
 * @param {function(new:pn.ui.BaseField,string,pn.ui.UiSpec!,string)} typeConst
 *    The constructor for the display item we are creating.  Expects a
 *    constructor with the 'field' and 'caption' params.
 * @param {(string|Object)=} opt_captionOrProps The optional header caption for
 *    this field or the properties map. If caption is omitted the the field id
 *    will be used (parsing cammel casing).
 * @param {Object=} opt_props Any additional properties
 *    for this column.
 * @return {!pn.ui.BaseField} The created column or field.
 */
pn.ui.UiSpec.prototype.createDisplayItem_ =
    function(field, typeConst, opt_captionOrProps, opt_props) {
  goog.asserts.assert(field);
  goog.asserts.assert(typeConst);

  if (goog.isObject(opt_captionOrProps) && opt_props) {
    throw new Error('Cannot specify both opt_captionOrProps and opt_props ' +
        'as properties object');
  }

  var props = goog.isObject(opt_captionOrProps) ?
      opt_captionOrProps :
      (opt_props || {});

  var caption = goog.isString(opt_captionOrProps) ? opt_captionOrProps : '';
  var di = new typeConst(field, this, caption);
  di.extend(props);
  return di;
};


/** @inheritDoc */
pn.ui.UiSpec.prototype.disposeInternal = function() {
  pn.ui.UiSpec.superClass_.disposeInternal.call(this);

  goog.dispose(this.editConfig);
  goog.dispose(this.gridConfig);
  goog.dispose(this.searchConfig);

  delete this.editConfig;
  delete this.gridConfig;
  delete this.searchConfig;
};
