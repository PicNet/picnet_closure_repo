
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('pn');

goog.provide('pn.dom');


/**
 * Finds an element with the given id.  If that element does not exist an
 *    error is thrown.
 *
 * @param {string} id The element ID.
 * @return {!Element} the element with the specified ID.
 */
pn.dom.get = function(id) {
  pn.assStr(id);

  var e = goog.dom.getElement(id);
  if (!e) throw new Error('Could not find the DOM element with ID: ' + id);
  return /** @type {!Element} */ (e);
};


/**
 * @param {string|Element} idorelem The ID or the actual element to show/hide.
 * @param {boolean} visible Wether to show or hide the specified element.
 */
pn.dom.show = function(idorelem, visible) {
  pn.assBool(visible);
  var elem = goog.isString(idorelem) ?
      pn.dom.get(idorelem) :
      /** @type {!Element} */ (idorelem);
  pn.assInst(elem, Element);

  goog.style.showElement(elem, visible);
};


/**
 * Alias to goog.dom.createDom
 *
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * @param {string} tagName Tag to create.
 * @param {(Object|Array.<string>|string)=} opt_attributes If object, then a map
 *     of name-value pairs for attributes. If a string, then this is the
 *     className of the new element. If an array, the elements will be joined
 *     together as the className of the new element.
 * @param {...(Object|string|Array|NodeList)} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or NodeList,i
 *     its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
pn.dom.create = goog.dom.createDom;


/**
 * Finds an element with the given class name.  If that element does not exist
 *    an error is thrown.
 *
 * @param {string} className The element class.
 * @param {Element=} opt_el The optional parent element to search.
 * @return {!Element} the element with the specified class.
 */
pn.dom.byClass = function(className, opt_el) {
  pn.assStr(className);
  pn.ass(!opt_el || opt_el instanceof HTMLElement);

  var e = goog.dom.getElementByClass(className, opt_el);
  if (!e) {
    throw new Error('Could not find the DOM element with class: ' + className);
  }
  return /** @type {!Element} */ (e);
};


/**
 * Gets the computed pixel width from the element or its ancestors.
 *
 * @param {!Element} e The element whose pixel width we want.
 * @return {number} The width in pixels.
 */
pn.dom.getComputedPixelWidth = function(e) {
  pn.ass(e);
  var w = goog.style.getComputedStyle(e, 'width');
  while (w.indexOf('px') < 0) {
    e = /** @type {!Element} */ (e.parentNode);
    w = goog.style.getComputedStyle(e, 'width');
  }
  return parseInt(w, 10);
};


/**
 * Adds the speicified html string to the DOM element (parent).
 *
 * @param {Element} parent The parent to add the given html into.
 * @param {string} html The html string to add to the speicified parent.
 * @return {!Element} The created node from the specified HTML.
 */
pn.dom.addHtml = function(parent, html) {
  pn.ass(parent);
  pn.assStr(html);

  var el = pn.dom.htmlToEl(html);
  goog.dom.appendChild(parent, el);
  return /** @type {!Element} */ (el);
};


/**
 * @param {string} html The html to convert to an element.
 * @return {!Element} The generated document fragment element.
 */
pn.dom.htmlToEl = function(html) {
  pn.assStr(html);

  return /** @type {!Element} */ (goog.dom.htmlToDocumentFragment(html));
};
