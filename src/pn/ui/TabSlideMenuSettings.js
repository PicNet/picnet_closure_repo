
goog.provide('pn.ui.TabSlideMenuSettings');



/**
 * @constructor
 */
pn.ui.TabSlideMenuSettings = function() {
  /** @type {Element} */
  this.tabHandle;
  /** @type {number} */
  this.speed;
  /** @type {string} */
  this.action;
  /** @type {string} */
  this.tabLocation;
  /** @type {number} */
  this.topPos;
  /** @type {number} */
  this.leftPos;
  /** @type {boolean} */
  this.fixedPosition;
  /** @type {string} */
  this.positioning;
  /** @type {string?} */
  this.pathToTabImage;
  /** @type {number?} */
  this.imageHeight;
  /** @type {number?} */
  this.imageWidth;
  /** @type {boolean} */
  this.onLoadSlideOut;
  /** @type {string|Element} */
  this.toggleButton;
  /** @type {number} */
  this.handleOffset;
  /** @type {Function} */
  this.onOpen;
  /** @type {Function} */
  this.onClose;
};
