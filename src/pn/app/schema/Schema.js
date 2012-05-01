
goog.provide('pn.app.schema.Schema');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.app.schema.Entity');
goog.require('pn.app.schema.Field');



/**
 * @constructor
 * @param {!Array} description The description of the schema from the server (
 *   i.e. Use object property string identifiers.).
 */
pn.app.schema.Schema = function(description) {
  goog.asserts.assert(description);

  /**
   * @private
   * @type {!Object.<!pn.app.schema.Entity>}
   */
  this.entities_ = {};

  goog.array.forEach(description, this.parseEntity_, this);
};


/**
 * @private
 * @param {!Object} entity The description of the entity from the server (
 *   i.e. Use object property string identifiers.).
 */
pn.app.schema.Schema.prototype.parseEntity_ = function(entity) {
  goog.asserts.assert(entity);

  var name = entity['name'];
  var fields = {};
  goog.array.forEach(entity['fields'], function(f) {
    var field = this.parseField_(f);
    fields[field.name] = field;
  }, this);
  var e = new pn.app.schema.Entity(name, fields);
  this.entities_[name] = e;
};


/**
 * @private
 * @param {!Object} f The description of the field from the server (
 *   i.e. Use object property string identifiers.).
 * @return {!pn.app.schema.Field} The parsed field.
 */
pn.app.schema.Schema.prototype.parseField_ = function(f) {
  goog.asserts.assert(f);

  return new pn.app.schema.Field(
      f['name'], f['type'], f['allowNull'], f['length']);

};
