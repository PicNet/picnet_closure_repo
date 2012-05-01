
goog.require('goog.asserts');
goog.require('goog.dom');

goog.provide('pn.dom');


/**
 * Finds an element with the given id.  If that element does not exist an
 *    error is thrown.
 *
 * @param {string} id The element ID.
 * @return {!Element} the element with the specified ID.
 */
pn.dom.getElement = function(id) {
  goog.asserts.assert(id);

  var e = goog.dom.getElement(id);
  if (!e) throw new Error('Could not find the DOM element with ID: ' + id);
  return /** @type {!Element} */ (e);
};


/**
 * Gets the computed pixel width from the element or its ancestors.
 *
 * @param {!Element} e The element whose pixel width we want.
 * @return {number} The width in pixels.
 */
pn.dom.getComputedPixelWidth = function(e) {
  goog.asserts.assert(e);
  var w = goog.style.getComputedStyle(e, 'width');
  while (w.indexOf('px') < 0) {
    e = /** @type {!Element} */ (e.parentNode);
    w = goog.style.getComputedStyle(e, 'width');
  }
  return parseInt(w, 10);
};
