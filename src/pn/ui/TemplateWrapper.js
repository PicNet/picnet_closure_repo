;
goog.provide('pn.ui.TemplateWrapper');

goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {string} html The template html to display.
 * @param {string} idOfParent The id of the parent DOM element in the specified
 *    html to attach the component to.
 * @param {!goog.ui.Component} component The component to attach to the
 *    specified html.
 */
pn.ui.TemplateWrapper = function(html, idOfParent, component) {
  goog.asserts.assert(html);
  goog.asserts.assert(idOfParent);
  goog.asserts.assert(component);

  goog.ui.Component.call(this);

  /**
   * @private
   * @const
   * @type {string}
   */
  this.html_ = html;

  /**
   * @private
   * @const
   * @type {string}
   */
  this.idOfParent_ = idOfParent;

  /**
   * @private
   * @const
   * @type {!goog.ui.Component}
   */
  this.component_ = component;
  this.registerDisposable(component);
};
goog.inherits(pn.ui.TemplateWrapper, goog.ui.Component);


/** @inheritDoc */
pn.ui.TemplateWrapper.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @inheritDoc */
pn.ui.TemplateWrapper.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  var node = /** @type {!Element} */ (
      goog.dom.htmlToDocumentFragment(this.html_));
  goog.dom.appendChild(element, node);
  var parent = pn.dom.getElement(this.idOfParent_);
  this.component_.decorate(parent);
};
