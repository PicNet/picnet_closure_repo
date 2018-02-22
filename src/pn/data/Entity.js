;
goog.provide('pn.data.Entity');
goog.provide('pn.data.EntityCtor');

goog.require('pn.data.FieldSchema');
goog.require('pn.log');



/**
 * @constructor
 * @param {string} type The entity type name.
 * @param {number} id The entity id.
 */
pn.data.Entity = function(type, id) {
  pn.ass(goog.isString(type), 'Type [%s] is invalid', type);
  pn.ass(goog.isNumber(id), 'ID [%s] is invalid', id);

  /**
   * @export
   * @type {string}
   */
  this.type = type;

  /**
   * @export
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

  return goog.object.getKeys(this).pnfindIndex(function(key) {
    if (key.indexOf('_') >= 0) return false;

    var v1 = this[key];
    var v2 = other[key];
    var eq;
    if (v1 instanceof goog.date.Date || v1 instanceof goog.date.DateTime) {
      eq = goog.date.Date.prototype.equals.call(v1, v2); // Ignores hour/mins
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


/** @typedef {function(new:pn.data.Entity, Object=):undefined} */
pn.data.EntityCtor;


/**
 * @param {string} name The name of the field.
 * @return {pn.data.FieldSchema} The schema for the given field.
 */
pn.data.Entity.prototype.getFieldSchema = goog.abstractMethod;


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
    this[key] = v;
  }, this);
};
