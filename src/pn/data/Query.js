
goog.provide('pn.data.Query');

goog.require('goog.asserts');

/** 
 * @constructor
 * @param {string} type The entity type of this query.
 * @param {string} text The query text of this query.
 */
pn.data.Query = function(type, text) {
  goog.asserts.assert(goog.isString(type));
  goog.asserts.assert(!goog.isDef(text), 
      'Query.Text is not currently supported');

  /** 
   * @type {string}
   * @expose
   */
  this.Type = type;

  /** 
   * @type {string}
   * @expose
   */
  this.Text = text;
};
