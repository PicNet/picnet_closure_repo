;
goog.provide('pn.mob.ui.Swiper');

goog.require('goog.Disposable');
goog.require('pn.mob.ui.DynSwiper');



/**
 * A fixed component array swiper.
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Element} el The parent element for the swiper.
 * @param {!Element} dots The element to use as the dots container.
 * @param {!Array.<!Element>} pages The pages to display in this swiper.
 */
pn.mob.ui.Swiper = function(el, dots, pages) {
  pn.assInst(el, HTMLElement);
  pn.assArrInst(pages, HTMLElement);

  goog.Disposable.call(this);

  var generator = function(i) { return pages[i]; };
  /**
   * @private
   * @type {!Object}
   */
  this.swiper_ = new pn.mob.ui.DynSwiper(el, dots, pages.length, generator);
  this.registerDisposable(this.swiper_);
};
goog.inherits(pn.mob.ui.Swiper, goog.Disposable);
