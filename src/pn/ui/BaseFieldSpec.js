;
goog.provide('pn.ui.BaseFieldSpec');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.data.EntityUtils');



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
 *    name is omitted the the field id will be used (parsing cammel casing).
 */
pn.ui.BaseFieldSpec = function(id, entitySpec) {
  goog.Disposable.call(this);

  pn.ass(id);
  pn.ass(entitySpec);

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
  this.name = '';

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
};
goog.inherits(pn.ui.BaseFieldSpec, goog.Disposable);


/**
 * @protected
 * @param {!Object} props The properties to add this / Column.  After adding
 *    we will also apply default values to any field that was not
 *    explicitally set.
 */
pn.ui.BaseFieldSpec.prototype.extend = function(props) {
  pn.assObj(props);

  goog.object.extend(this, props);

  this.inferName_();
  this.inferDataProperty_();
  this.inderDisplayPath_();
};


/** @private */
pn.ui.BaseFieldSpec.prototype.inferName_ = function() {
  if (this.name) { return; }

  var steps = this.id.split('.');
  var nameProperty = steps[steps.length - 1];
  if (nameProperty.pnstartsWith('_')) {
    nameProperty = nameProperty.substring(1);
  }

  // Not using EntityUtils.getTypeProperty as this is the name not the type
  // property.  I.e. This could be a field called 'ReviewerID' not
  // just 'UserID' and the name should be 'Reviewer' not 'User'.
  if (nameProperty.pnendsWith('Entities')) {
    nameProperty = nameProperty.substring(0, nameProperty.length - 8) + 's';
  } else if (nameProperty.pnendsWith('ID')) {
    nameProperty = nameProperty.substring(0, nameProperty.length - 2);
  }

  this.name = nameProperty.replace(/([A-Z])/g, ' $1').pntrim();
};


/** @private */
pn.ui.BaseFieldSpec.prototype.inferDataProperty_ = function() {
  if (this.dataProperty) return;
  this.dataProperty = this.id.split('.')[0];
};


/** @private */
pn.ui.BaseFieldSpec.prototype.inderDisplayPath_ = function() {
  if (this.displayPath) return;
  var steps = this.id.split('.');
  // Only infer displayPath for relations
  if (!pn.data.EntityUtils.isRelationshipProperty(steps[0])) { return; }

  this.displayPath = this.id;
  var last = steps[steps.length - 1];
  if (!pn.data.EntityUtils.isRelationshipProperty(last)) { return; }

  // Need to append 'Name' to the last step to get the last entity name
  var type = this.getLastRelationshipType_(this.entitySpec.type, steps);
  steps.push(type + 'Name');
  this.displayPath = steps.join('.');
};


/**
 * @private
 * @param {string} type The starting entity type for the path.
 * @param {!Array.<string>} steps The path to the target entity property.
 * @return {string} The final entity type in this entity path.
 */
pn.ui.BaseFieldSpec.prototype.getLastRelationshipType_ = function(type, steps) {
  pn.assStr(type);
  pn.ass(steps.length);

  steps = steps.pnclone();

  var ltype = type;
  while (true) {
    var step = steps.shift();
    if (!step || !pn.data.EntityUtils.isRelationshipProperty(step))
      return ltype;
    ltype = pn.data.EntityUtils.getTypeProperty(ltype, step);
  }
};
