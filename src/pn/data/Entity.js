;
goog.provide('pn.data.Entity');
goog.provide('pn.data.Entity.EntityType');

goog.require('pn.data.FieldSchema');



/**
 * @constructor
 * @param {string} type The entity type name.
 * @param {number} id The entity id.
 */
pn.data.Entity = function(type, id) {
  goog.asserts.assert(goog.isString(type), 'Type [' + type + '] is invalid');
  goog.asserts.assert(goog.isNumber(id), 'ID [' + id + '] is invalid');

  /**
   * @expose
   * @type {string}
   */
  this.type = type;

  /**
   * @expose
   * @type {number}
   */
  this.id = id;
};


/**
 * @param {!pn.data.Entity} other The other entity for the equality comparison.
 * @return {boolean} Wether the specified other entity is equal to this entity.
 */
pn.data.Entity.prototype.equals = function(other) {
  if (!(other instanceof pn.data.Entity)) return false;

  return goog.array.findIndex(goog.object.getKeys(this), function(key) {
    if (key.indexOf('_') >= 0) return false;

    var v1 = this[key];
    var v2 = other[key];
    var eq;
    if (v1 instanceof goog.date.Date || v1 instanceof goog.date.DateTime) {
      eq = goog.date.Date.prototype.equals.call(v1, v2); // Ignores hour/mins
    } else { eq = v1 === v2; }
    // if (!eq) console.log('not equal: ', key, v1, v2);
    return !eq;
  }, this) < 0;
};


/**
 * @return {!pn.data.Entity} A cloned copy of this entity.
 */
pn.data.Entity.prototype.clone = function() {
  var cloned = this.constructor === pn.data.Entity ?
      new pn.data.Entity(this.type, this.id) :
      new this.constructor({id: this.id});

  goog.object.extend(cloned, this);
  return cloned;
};

////////////////////////////////////////////////////////////////////////////////
// ABSTRACT MEMBERS
////////////////////////////////////////////////////////////////////////////////


/**
 * @expose
 * @param {string} name The name of the field.
 * @return {pn.data.FieldSchema} The schema for the given field.
 */
pn.data.Entity.prototype.getFieldSchema = goog.abstractMethod;


/** @typedef {function(new:pn.data.Entity, Object=):undefined} */
pn.data.Entity.EntityType;
