;
goog.provide('pn.ui.UiSpec');

goog.require('pn.ui.edit.Command');
goog.require('pn.ui.edit.Edit');
goog.require('pn.ui.edit.Field');
goog.require('pn.ui.grid.Column');
goog.require('pn.ui.grid.Command');
goog.require('pn.ui.grid.Config');
goog.require('pn.ui.grid.ExportCommand');
goog.require('pn.ui.grid.Grid');
goog.require('pn.ui.grid.Grid.EventType');



/**
 * @constructor
 * @param {string} id The unique identifier for this spec.
 * @param {string=} opt_type The type representing this spec.
 * @param {string=} opt_name The display name of this type.
 */
pn.ui.UiSpec = function(id, opt_type, opt_name) {
  goog.asserts.assert(id);

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
};


/** @return {!Array.<pn.ui.grid.Column>} The columns to display. */
pn.ui.UiSpec.prototype.getGridColumns = function() { return []; };


/** @return {!Array.<pn.ui.edit.Field>} The search fields to display. */
pn.ui.UiSpec.prototype.getSearchFields = function() {
  return this.getEditFields(true);
};


/** @param {boolean} isNew If Add or Edit.
 * @return {!Array.<pn.ui.edit.Field>} The edit fields to display. */
pn.ui.UiSpec.prototype.getEditFields = function(isNew) {
  return []; };


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
 * @param {!Object.<!Array.<Object>>} cache The current entities cache.
 * @return {!Array.<pn.ui.edit.Command>} The edit commands.
 */
pn.ui.UiSpec.prototype.getEditCommands = function(entity, cache) {
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
 * @param {string} caption The header caption for this column.
 * @param {Object=} opt_props Any additional properties
 *    for this column.
 * @return {pn.ui.grid.Column} The created column.
 */
pn.ui.UiSpec.prototype.createColumn =
    function(field, caption, opt_props) {
  return /** @type {pn.ui.grid.Column} */ (this.createDisplayItem_(
      field, caption, pn.ui.grid.Column, opt_props));
};


/**
 * @protected
 * @param {string} field The id representing this field.
 * @param {string} caption The header caption for this field.
 * @param {Object=} opt_props Any additional properties
 *    for this field.
 * @return {pn.ui.edit.Field} The field created.
 */
pn.ui.UiSpec.prototype.createField =
    function(field, caption, opt_props) {
  return /** @type {pn.ui.edit.Field} */ (this.createDisplayItem_(
      field, caption, pn.ui.edit.Field, opt_props));
};


/**
 * @private
 * @param {string} field The field in the data representing this column.
 * @param {string} caption The header caption for this column.
 * @param {function(new:pn.ui.SpecDisplayItem,string,string)} typeConst The
 *    constructor for the display item we are creating.  Expects a
 *    constructor with the 'field' and 'caption' params.
 * @param {Object=} opt_props Any additional properties
 *    for this column.
 * @return {pn.ui.SpecDisplayItem} The created column.
 */
pn.ui.UiSpec.prototype.createDisplayItem_ =
    function(field, caption, typeConst, opt_props) {
  goog.asserts.assert(field);
  goog.asserts.assert(caption);
  opt_props = opt_props || {};

  var di = new typeConst(field, caption);
  goog.object.extend(di, opt_props);

  var dataCol = di.dataColumn;
  if (!di.source && dataCol !== this.type.split('-')[0] + 'ID' &&
      dataCol !== 'ID' && goog.string.endsWith(dataCol, 'ID')) {
    di.source = dataCol.substring(0, dataCol.length - 2);
  }

  return di;
};


/**
 * @param {!Array.<!pn.ui.SpecDisplayItem>} items The fields or columns to
 *    parse for required related entities.
 * @return {!Array.<string>} The list of types required for related displays.
 */
pn.ui.UiSpec.getRelatedTypes = function(items) {
  var types = [];
  goog.array.forEach(items, function(i) {
    if (i.additionalCahceTypes.length) {
      goog.array.forEach(i.additionalCahceTypes, function(type) {
        types.push(type);
      });
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
      types.push(i.tableType);
      var spec = pn.ui.UiSpecsRegister.INSTANCE.get(i.tableSpec);
      var cols = spec.getGridColumns();
      types = goog.array.concat(types,
          pn.ui.UiSpec.getRelatedTypes(cols));
    }
  });
  goog.array.removeDuplicates(types);
  return types;
};
