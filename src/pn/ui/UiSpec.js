;
goog.provide('pn.ui.UiSpec');

goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');

goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.Edit.EventType');
goog.require('pn.ui.edit.Field');
goog.require('pn.ui.grid.Column');
goog.require('pn.ui.grid.Command');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.ExportCommand');
goog.require('pn.ui.grid.Grid.EventType');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {string} id The unique identifier for this spec.
 * @param {string=} opt_type The type representing this spec.
 * @param {string=} opt_name The display name of this type.
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

  /** @type {!Object.<*>} */
  this.additionalData = {};

  /**
   * @protected
   * @type {boolean}
   */
  this.allowClone = true;

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


/** @return {!Array.<pn.ui.grid.Column>} The columns to display. */
pn.ui.UiSpec.prototype.getGridColumns = function() { return []; };


/** @return {!Array.<pn.ui.edit.Field>} The search fields to display. */
pn.ui.UiSpec.prototype.getSearchFields = function() {
  return this.getEditFields(true);
};


/**
 * @param {boolean} isNew If Add or Edit.
 * @return {!Array.<pn.ui.edit.Field>} The edit fields to display.
 */
pn.ui.UiSpec.prototype.getEditFields = function(isNew) { return []; };


/**
 * Gets a default grid config with the specified width
 * @param {number} width The width of this grid.  This cannot be generic.
 * @return {!pn.ui.grid.Config} The grid configuration.
 */
pn.ui.UiSpec.prototype.getGridConfig = function(width) {
  var cfg = new pn.ui.grid.Config(this.type);
  cfg.width = width;
  return cfg;
};


/**
 * @param {!Object} entity The entity being displayed.
 * @param {!Object.<!Array.<Object>>=} opt_cache The current entities cache.
 * @return {!Array.<pn.ui.edit.Command>} The edit commands.
 */
pn.ui.UiSpec.prototype.getEditCommands = function(entity, opt_cache) {
  var eventType = pn.ui.edit.Edit.EventType;
  var del = new pn.ui.edit.Command('Delete', eventType.DELETE);
  del.preclick = function() {
    return window.confirm('Are you sure you want to delete this item?');
  };
  var clone = new pn.ui.edit.Command('Clone', eventType.CLONE);
  var commands = [new pn.ui.edit.Command('Save', eventType.SAVE, true)];
  if (!!entity['ID'] && this.allowClone) commands.push(clone);
  if (!!entity['ID']) commands.push(del);
  commands.push(new pn.ui.edit.Command('Cancel', eventType.CANCEL));
  return commands;
};


/** @return {!Array.<pn.ui.grid.Command>} The edit commands. */
pn.ui.UiSpec.prototype.getGridCommands = function() {
  return [
    new pn.ui.grid.Command('Add', pn.ui.grid.Grid.EventType.ADD),
    new pn.ui.grid.ExportCommand()
  ];
};


/** @return {!pn.ui.edit.Config} The edit page config. */
pn.ui.UiSpec.prototype.getEditConfig = function() {
  return new pn.ui.edit.Config(this.type);
};


/**
 * @protected
 * @param {string} field The field in the data representing this column.
 * @param {(string|Object)=} opt_captionOrProps The optional header caption for
 *    this field or the properties map. If caption is omitted the the field id
 *    will be used (parsing cammel casing).
 * @param {Object=} opt_props Any additional properties
 *    for this column.
 * @return {pn.ui.grid.Column} The created column.
 */
pn.ui.UiSpec.prototype.createColumn =
    function(field, opt_captionOrProps, opt_props) {
  return /** @type {pn.ui.grid.Column} */ (this.createDisplayItem_(
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
 * @return {pn.ui.edit.Field} The field created.
 */
pn.ui.UiSpec.prototype.createField =
    function(id, opt_captionOrProps, opt_props) {
  var field = /** @type {pn.ui.edit.Field} */ (this.createDisplayItem_(
      id, pn.ui.edit.Field, opt_captionOrProps, opt_props));
  // TODO: Add all of the post create massaging here not in FieldBuilder, etc
  if (goog.string.endsWith(id, 'Entities') && !field.tableType) {
    field.tableType = id.replace('Entities', '');
  }
  if (field.tableType && !field.tableSpec) {
    field.tableSpec = field.tableType;
  }
  if (field.tableType && !field.tableParentField) {
    throw new Error('Field: ' + id + ' has a table field but did ' +
        'not specify the "tableParentField" property.');
  }
  return field;
};


/**
 * @private
 * @param {string} field The field in the data representing this column.
 * @param {function(new:pn.ui.SpecDisplayItem,string,string)} typeConst The
 *    constructor for the display item we are creating.  Expects a
 *    constructor with the 'field' and 'caption' params.
 * @param {(string|Object)=} opt_captionOrProps The optional header caption for
 *    this field or the properties map. If caption is omitted the the field id
 *    will be used (parsing cammel casing).
 * @param {Object=} opt_props Any additional properties
 *    for this column.
 * @return {pn.ui.SpecDisplayItem} The created column.
 */
pn.ui.UiSpec.prototype.createDisplayItem_ =
    function(field, typeConst, opt_captionOrProps, opt_props) {
  goog.asserts.assert(field);
  goog.asserts.assert(typeConst);

  if (goog.isObject(opt_captionOrProps) && opt_props) {
    throw new Error('Cannot specify both opt_captionOrProps and opt_props ' +
        'as properties object');
  }
  var caption = this.getCaption_(field, opt_captionOrProps);
  var props = goog.isObject(opt_captionOrProps) ?
      opt_captionOrProps :
      (opt_props || {});

  var di = new typeConst(field, caption);
  goog.object.extend(di, props);
  var dataCol = di.dataColumn;
  if (!di.source && dataCol !== this.type.split('-')[0] + 'ID' &&
      dataCol !== 'ID' && goog.string.endsWith(dataCol, 'ID')) {
    di.source = dataCol.substring(0, dataCol.length - 2);
  }

  return di;
};

/**
 * @private
 * @param {string} id The id representing this field or column.
 * @param {(string|Object)=} opt_caption The optional header caption for
 *    this field. If caption is omitted the the field id
 *    will be used (parsing cammel casing).
 * @return {string} The caption of this field or column.
 */

pn.ui.UiSpec.prototype.getCaption_ = function(id, opt_caption) {
  if (opt_caption && goog.isString(opt_caption))
    return /** @type {string} */ (opt_caption);

  var caption = id.split('.').pop();
  if (caption !== 'ID' && goog.string.endsWith(caption, 'ID')) {
    caption = caption.substring(0, caption.length - 2);
  }
  return caption.replace(/([A-Z])/g, ' $1');
};


/** @return {!Array.<string>} The list of types related to this entity. */
pn.ui.UiSpec.prototype.getRelatedTypes = function() {
  return pn.ui.UiSpec.getRelatedTypes(this.type, this.getEditFields(false));
};


/**
 * @param {string} type The type we are querying as this will also be related
 *    for duplicate checking.
 * @param {!Array.<!pn.ui.SpecDisplayItem>} items The fields or columns to
 *    parse for required related entities.
 * @return {!Array.<string>} The list of types required for related displays.
 */
pn.ui.UiSpec.getRelatedTypes = function(type, items) {
  var types = [];
  if (type && type.indexOf(' ') < 0) { types.push(type); }

  goog.array.forEach(items, function(i) {
    var additional = i.additionalCahceTypes;
    if (additional.length) {
      goog.array.forEach(additional, function(at) { types.push(at); });
    }
    if (i.source) {
      var steps = i.source.split('.');
      for (var s = 0; s === 0 || s < steps.length - 1; s++) {
        var step = steps[s];
        if (goog.string.endsWith(step, 'Entities')) {
          step = goog.string.remove(step, 'Entities');
        }
        types.push(step);  // Always include at lease one
      }
    }
    else if (i.tableType) {
      var spec = pn.ui.UiSpecsRegister.get(i.tableSpec);
      var cols = spec.getGridColumns();
      var related = pn.ui.UiSpec.getRelatedTypes(i.tableType, cols);
      types = goog.array.concat(types, related);
      goog.dispose(spec);
    }
  });
  goog.array.removeDuplicates(types);
  return types;
};


/**
 * Called after an Edit.js is created.  This is only used to initialise
 * the values related to the entity being edited. To attach events, etc
 * override the documentEntered method.
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
pn.ui.UiSpec.prototype.documentEntered = function() {};


/** @inheritDoc */
pn.ui.UiSpec.prototype.disposeInternal = function() {
  pn.ui.UiSpec.superClass_.disposeInternal.call(this);

  this.eh.removeAll();
  goog.dispose(this.eh);

  delete this.eh;
  delete this.entity;
  delete this.cache;
  delete this.fields;
};
