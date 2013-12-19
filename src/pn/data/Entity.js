;
goog.provide('pn.data.Entity');
goog.provide('pn.data.EntityCtor');

goog.require('pn');
goog.require('pn.data.FieldSchema');
goog.require('pn.log');



/**
 * @constructor
 * @struct
 * @param {string} type The entity type name.
 * @param {number} id The entity id.
 */
pn.data.Entity = function(type, id) {
  pn.assStr(type);
  pn.assNum(id);

  /** @type {string} */
  this.type = type;

  /** @type {number} */
  this.id = id;

  /**
   * @private
   * @const
   * @type {!Object.<*>}
   */
  this.extprops_ = {};
};


/**
 * @param {string} prop The property name
 * @return {*} The value of the specified extended property.
 */
pn.data.Entity.prototype.getExtValue = function(prop) {
  return this.extprops_[prop];
};


/**
 * @param {string} prop The property name
 * @param {*} val The value to set on the extended property.
 * @return {*} The value of the specified extended property.
 */
pn.data.Entity.prototype.setExtValue = function(prop, val) {
  return this.extprops_[prop] = val;
};


/**
 * @param {string} prop The property name
 * @return {boolean} Wether the specified prop exists in the extended
 *    properties map.
 */
pn.data.Entity.prototype.hasExtProp = function(prop) {
  return (prop in this.extprops_);
};


/**
 * @param {!pn.data.Entity} other The other entity for the equality comparison.
 * @return {boolean} Wether the specified other entity is equal to this entity.
 */
pn.data.Entity.prototype.equals = function(other) {
  if (!(other instanceof pn.data.Entity)) return false;

  return this.getAllProps().pnfindIndex(function(key) {
    if (key.indexOf('_') >= 0) return false;

    var v1 = this.getValue(key);
    var v2 = other.getValue(key);
    var eq;
    if (v1 instanceof goog.date.Date || v1 instanceof goog.date.DateTime) {
      eq = goog.date.Date.prototype.equals.call(
          /** @type {!goog.date.Date} */ (v1),
          /** @type {!goog.date.Date} */ (v2)); // Ignores hour/mins
    }
    else {
      eq = (!goog.isDefAndNotNull(v1) && !goog.isDefAndNotNull(v2)) ||
          v1 === v2;
    }
    if (!eq) {
      var msg = 'Entity not equal - field: ' + key + ' 1: ' + v1 + ' 2: ' + v2;
      pn.log.info(msg);
    }
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


/** @typedef {function(new:pn.data.Entity, Object):undefined} */
pn.data.EntityCtor;


/**
 * @param {string} name The name of the field.
 * @return {pn.data.FieldSchema} The schema for the given field.
 */
pn.data.Entity.prototype.getFieldSchema = goog.abstractMethod;


/**
 * @param {string} prop The name of the property to set.
 * @return {*} The value of the specified property.
 */
pn.data.Entity.prototype.getValue = goog.abstractMethod;


/** @return {!Array.<string>} All entity properties. */
pn.data.Entity.prototype.getProps = goog.abstractMethod;


/**
 * @param {string} prop The name of the property to set.
 * @param {*} val The value to set the given property to.
 * @return {*} The new value of the specified property.
 */
pn.data.Entity.prototype.setValue = goog.abstractMethod;


/**
 * @param {string} prop The name of the property to check.
 * @return {boolean} Wether the specified property exists in this entity.
 */
pn.data.Entity.prototype.hasProp = function(prop) {
  return this.getProps().pncontains(prop);
};


/**
 * @return {!Array.<string>} All entity properties
 * including extended properties.
 */
pn.data.Entity.prototype.getAllProps = function() {
  return this.getProps().
      pnconcat(goog.object.getKeys(this.extprops_));
};


/**
 * @param {string} prop The name of the property to set.
 * @param {*} val The value to set the given property to.
 * @return {*} The new value of the specified property.
 */
pn.data.Entity.prototype.setValueOrExt = function(prop, val) {
  if (this.hasProp(prop)) return this.setValue(prop, val);
  else return this.setExtValue(prop, val);
};


/**
 * @param {string} prop The name of the property to get.
 * @return {*} The value of the specified property.
 */
pn.data.Entity.prototype.getValueOrExt = function(prop) {
  if (this.hasProp(prop)) return this.getValue(prop);
  else return this.getExtValue(prop);
};


/**
 * @return {!Object} An object that can be stringified and understood
 *    by the server (No compiled property names).
 */
pn.data.Entity.prototype.toJsonObject = function() {
  var ps = this.getProps();
  var ps2 = goog.object.getKeys(this.extprops_);
  var obj = {};
  ps.pnforEach(function(p) { obj[p] = this.getValue(p); }, this);
  ps2.pnforEach(function(p) { obj[p] = this.getExtValue(p); }, this);
  return obj;
};


/** @return {!Array.<number|string>} A compressed version of this entity. */
pn.data.Entity.prototype.toCompressed = function() {
  var arr = [];
  goog.object.forEach(this, function(a, b) {
    if (goog.isFunction(a) || b === 'type') return;
    if (a instanceof goog.date.Date ||
        a instanceof goog.date.DateTime ||
        a instanceof Date) { a = '||DATE||' + a.getTime(); }
    arr.push(a);
  });
  return arr;
};


/** @param {!Array.<string|number>} arr The compressed data array. */
pn.data.Entity.prototype.fromCompressed = function(arr) {
  pn.assArr(arr);
  var keys = [];
  goog.object.forEach(this, function(a, b) {
    if (goog.isFunction(a) || b === 'type') return;
    keys.push(b);
  });
  arr.pnforEach(function(v, idx) {
    var key = keys[idx];
    if (v && goog.isString(v) && goog.string.startsWith(v, '||DATE||')) {
      v = pn.date.fromMillis(parseInt(v.substring(8), 10));
    }
    this.setValue(key, v);
  }, this);
};
