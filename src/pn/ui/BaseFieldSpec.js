;
goog.provide('pn.ui.BaseFieldSpec');



/**
 * The BaseField is inherited by pn.ui.edit.FieldSpec and pn.ui.grid.ColumnSpec
 *    and provides the base functionality required for defining fields and
 *    columns.
 *
 * BaseField types (Field / Column) should be constructed using the
 *    convenience methods in UiSpec.
 *
 * @constructor
 * @extends {goog.Disposable}
 * @param {string} id The id of this column.
 * @param {!pn.ui.UiSpec} entitySpec The specifications (pn.ui.UiSpec) of
 *    the entity being displayed.
 * @param {string=} opt_name The optional name/caption of this column. If the
 *    name is omitted the the field id will be used (parsing cammel casing).
 */
pn.ui.BaseFieldSpec = function(id, entitySpec, opt_name) {
  goog.Disposable.call(this);

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
   * Overrides the entity type of this field.  This is usually determined by
   *    the EntityTypeNameID where ID is removed and EntityTypeName is assumed
   *    to be the type of the entity.  This may not always be the case.
   *
   * @type {string}
   */
  this.entityType = '';

  /**
   * The source entity type(s) path for the display of this field. This is an
   *    intelligent path to the source entity.  For instance:
   *    displayPath: 'Parent.GrandParent.GrandParentName' is a valid path.
   *    displayPath: 'Parent.ChildrenEntities.ChildEntityName' is also be
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
goog.inherits(pn.ui.BaseFieldSpec, goog.Disposable);


/**
 * @param {!Object} props The properties to add this / Column.  After adding
 *    we will also apply default values to any field that was not
 *    explicitally set.
 */
pn.ui.BaseFieldSpec.prototype.extend = function(props) {
  goog.asserts.assert(goog.isObject(props));

  goog.object.extend(this, props);

  var steps = this.id.split('.');
  if (!this.name) {
    var nameProp = steps[steps.length - 1];
    if (goog.string.endsWith(nameProp, 'Entities')) {
      nameProp = pn.data.EntityUtils.getTypeProperty(nameProp) + 's';
    } else {
      nameProp = pn.data.EntityUtils.getTypeProperty(nameProp);
    }

    this.name = nameProp.replace(/([A-Z])/g, ' $1');
  }

  if (!this.dataProperty) { this.dataProperty = steps[0]; }
  if (!this.displayPath &&
      pn.data.EntityUtils.isRelationshipProperty(steps[0])) {
    this.displayPath = this.id;
    var last = steps[steps.length - 1];
    var type = pn.data.EntityUtils.getTypeProperty(last);
    if (type !== last) {
      steps.push(type + 'Name');
      this.displayPath = steps.join('.');
    }
  }
};


/** @inheritDoc */
pn.ui.BaseFieldSpec.prototype.disposeInternal = function() {
  pn.ui.BaseFieldSpec.superClass_.disposeInternal.call(this);

  goog.dispose(this.entitySpec);

  delete this.entitySpec;
  delete this.additionalCacheTypes;
};
