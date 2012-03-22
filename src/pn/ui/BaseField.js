;
goog.provide('pn.ui.BaseField');



/**
 * The BaseField is inherited by pn.ui.edit.Field and pn.ui.grid.Column and
 *    provides the base functionality required for defining fields and
 *    columns.
 *
 * BaseField types (Field / Column) should be constructed using the
 *    convenience methods in UiSpec.
 *
 * @constructor
 * @param {string} id The id of this column.
 * @param {!pn.ui.UiSpec} entitySpec The specifications (pn.ui.UiSpec) of
 *    the entity being displayed.
 * @param {string=} opt_name The optional name/caption of this column. If the
 *    name is omitted the the field id will be used (parsing cammel casing).
 */
pn.ui.BaseField = function(id, entitySpec, opt_name) {
  goog.asserts.assert(id);
  goog.asserts.assert(entitySpec);

  /**
   * The ID of this field or column.  An ID must be unique within a parent
   *    field/column enumeration.
   *
   * @type {string}
   */
  this.id = id;

  /**
   * @protected
   * @type {!pn.ui.UiSpec} The specifications of the entity
   *    being displayed (parent of this field).
   */
  this.entitySpec = entitySpec;

  /**
   * The name is the caption to use when labeling this field or column. If the
   *    name is omitted the the field id will be used (parsing cammel casing).
   *    However, if the id field ends in ID then the name will remove the 'ID'
   *    string before cammel parsing.
   *
   * @type {string}
   */
  this.name = opt_name || '';

  /**
   * This field should represent the value in the currently displayed entity
   *    that marks the start of the relationship to the related entity.
   *
   * Multiple fields may represent the same data.  For instance the ID of the
   *    parent may be represented by 2 fields, each showing different values
   *    of the parent entity.  However, the data column specifies the actual
   *    field that represents the relationshit to that parent entity.  Eg:
   *    we could have 2 fields with the following read only field ids.
   *    - ParentID.Name
   *    - ParentID.Description
   *
   * By convention this is the first step as specified by the id of the
   *    field (as in the example above).
   *
   * @type {string}
   */
  this.dataProperty = '';

  /**
   * The source entity type(s) path for the display of this field. This is an
   *    intelligent path to the source entity.  For instance:
   *    displayPath: 'Parent.GrandParent.GrandParentName' is a valid path.
   *    displayPath: 'Parent.ChildrenEntities.ChildEntityName' should also be
   *      supported.
   *
   *    If the displayPath ends with ID then we will append a path step to the
   *    default name property of the last step's entity.  Eg: If the
   *    id is 'ParentID' then we will make the display path:
   *    'Parent.ParentName'.
   *
   * @type {string}
   */
  this.displayPath = '';

  /**
   * Any additional entity types that need to be added to the context cache
   *    when showing this field.  This is only required if this entity type
   *    cannot be inferred by the dataProperty or displayPath.
   *
   * @type {!Array}
   */
  this.additionalCacheTypes = [];
};


/**
 * @param {!Object} props The properties to add this / Column.  After adding
 *    we will also apply default values to any field that was not
 *    explicitally set.
 */
pn.ui.BaseField.prototype.extend = function(props) {
  goog.asserts.assert(goog.isObject(props));

  goog.object.extend(this, props);

  if (!this.name) {
    var newName = this.id.split('.').pop();
    if (newName !== 'ID' && goog.string.endsWith(newName, 'ID')) {
      newName = newName.substring(0, newName.length - 2);
    } else if (newName !== 'Entities' &&
        goog.string.endsWith(newName, 'Entities')) {
      newName = newName.substring(0, newName.length - 8) + 's';
    }
    this.name = newName.replace(/([A-Z])/g, ' $1');
  }

  if (!this.dataProperty) {
    this.dataProperty = this.id.split('.')[0];
  }
  if (!this.displayPath) {
    if (this.id.indexOf('.') > 0) this.displayPath = this.id;
    else if (this.id !== 'ID' && goog.string.endsWith(this.id, 'ID')) {
      this.displayPath = this.id + '.' +
          this.id.substring(0, this.id.length - 2) + 'Name';
    }
  }
};
