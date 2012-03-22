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

  /**
   * @protected
   * @type {!Object} The entity being edited.  This is set in the
   *  initEdit method and unset in the dispose method.
   */
  this.entity = {};

  /**
   * @protected
   * @type {!Object.<Array>} The cache with all related entities.  This is
   *    set in the  initEdit method and unset in the dispose method.
   */
  this.cache = {};

  /**
   * @protected
   * @type {!Object.<Element|goog.ui.Component>} The fields map in the UI.
   *    This is set in the  initEdit method and unset in the dispose method.
   */
  this.fields = {};

  /**
   * @protected
   * @type {!goog.events.EventHandler}
   */
  this.eh = new goog.events.EventHandler(this);
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
 * @protected
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
 * @protected
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


/**
 * Called after an Edit.js is created.  This is only used to initialise
 * the values related to the entity being edited. To attach events, etc
 * override the documentEntered method.
 *
 * Note: This method is an internal method and should not be called or
 *    inherited. Currently only called by Edit.js to initialise the spec
 *    to allow documentEntered functionality.
 *
 * @param {!Object} entity The entity that was just decorated.
 * @param {!Object.<Array>} cache The cache with all related entities.
 * @param {!Object.<Element|goog.ui.Component>} fields The fields map in the UI.
 */
pn.ui.UiSpec.prototype.initEdit = function(entity, cache, fields) {
  this.entity = entity;
  this.cache = cache;
  this.fields = fields;
};


/**
 * Override this method to add events to any fields or do any custom UI
 * processing.  At this stage you will have access to this.entity, this.cache
 * and this.fields.
 */
pn.ui.UiSpec.prototype.documentEntered = function() {
  if (!this.entity['ID']) {
    this.showCommand('Delete', false);
    this.showCommand('Clone', false);
  }
};


/**
 * @param {string} id The id of the field (and its label) to check
 *    for visibility.
 * @return {boolean} visible Wether the specified field element is currently
 *    visible.
 */
pn.ui.UiSpec.prototype.isShown = function(id) {
  return goog.style.isElementShown(this.getFieldContainer_(id));
};


/**
 * @param {string} id The id of the field (and its label) to show/hide.
 * @param {boolean} visible Wether to show or hide the element.
 */
pn.ui.UiSpec.prototype.showElement = function(id, visible) {
  goog.style.showElement(this.getFieldContainer_(id), visible);
};


/**
 * @param {string} id The id of the command to hide.
 * @param {boolean} visible Wether to show or hide the command.
 */
pn.ui.UiSpec.prototype.showCommand = function(id, visible) {
  var commandsContainer = goog.dom.getElementByClass('commands-container');  
  var el = goog.dom.getElementByClass(id.toLowerCase(), commandsContainer);
  goog.style.showElement(el, visible);
};


/**
 * @private
 * @param {string} id The id of the element to get the container for.
 * @return {!Element} The parent container of the speicified field id.
 */
pn.ui.UiSpec.prototype.getFieldContainer_ = function(id) {
  goog.asserts.assert(this.fields);
  goog.asserts.assert(this.fields[id]);

  var el = this.fields[id];
  var element = el.getElement ? el.getElement() : el;
  while (element.id !== id) { element = element.parentNode; }
  return /** @type {!Element} */ (element);
};


/** @inheritDoc */
pn.ui.UiSpec.prototype.disposeInternal = function() {
  pn.ui.UiSpec.superClass_.disposeInternal.call(this);

  this.eh.removeAll();

  goog.dispose(this.eh);
  goog.dispose(this.editConfig);
  goog.dispose(this.gridConfig);

  delete this.eh;
  delete this.entity;
  delete this.cache;
  delete this.fields;
  delete this.editConfig;
  delete this.gridConfig;
};
