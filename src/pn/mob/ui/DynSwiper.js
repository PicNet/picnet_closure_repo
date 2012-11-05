;
goog.provide('pn.mob.ui.DynSwiper');

goog.require('goog.Disposable');



/**
 * This class is a wrapper around the SwipeView component by cubiq.
 * @see http://cubiq.org/swipeview
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Element} el The parent element for the swiper.
 * @param {number} pagesLength The number of pages to display.
 * @param {!function(number):!Element} generator The function that takes a page
 *    index and returns the element for that page.  The swiper does cache these
 *    elements so its not neccessary to implement your own caching.
 */
pn.mob.ui.DynSwiper = function(el, pagesLength, generator) {
  pn.assDef(window['SwipeView'], 'SwipeView library not found');
  pn.assInst(el, HTMLElement);
  pn.assPosInt(pagesLength);
  pn.assFun(generator);

  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Object}
   */
  this.DynSwiper_ = new window['SwipeView'](el, { 'hastyPageFlip' : true });

  /**
   * @private
   * @type {!Object.<!Element>}
   */
  this.cache_ = {};

  /**
   * @private
   * @type {!function(number):!Element}
   */
  this.generator_ = generator;

  this.DynSwiper_['updatePageCount'](pagesLength);
  this.DynSwiper_['masterPages'][0].dataset.pageIndex = pagesLength - 1;
  this.DynSwiper_['masterPages'][0].dataset.upcomingPageIndex =
      this.DynSwiper_['masterPages'][0].dataset.pageIndex;

  // Load initial data
  for (var i = 0; i < 3; i++) {
    var pageIndex = i == 0 ? pagesLength - 1 : i - 1;
    this.DynSwiper_['masterPages'][i].appendChild(this.get_(pageIndex));
  }

  this.DynSwiper_.onFlip(this.onFlip_.pnbind(this));
};
goog.inherits(pn.mob.ui.DynSwiper, goog.Disposable);


/** @private */
pn.mob.ui.DynSwiper.prototype.onFlip_ = function() {
  for (var i = 0; i < 3; i++) {
    var upcoming = this.DynSwiper_['masterPages'][i].dataset.upcomingPageIndex;

    if (upcoming != this.DynSwiper_['masterPages'][i].dataset.pageIndex) {
      goog.dom.removeChildren(this.DynSwiper_['masterPages'][i]);
      this.DynSwiper_['masterPages'][i].appendChild(this.get_(upcoming));
    }
  }
};


/**
 * @private
 * @param {number} idx The index of the page to retreive.
 * @return {!Element} The cached or generated element for the specified index.
 */
pn.mob.ui.DynSwiper.prototype.get_ = function(idx) {
  pn.assInt(idx);

  if (idx in this.cache_) return this.cache_[idx];
  return this.cache_[idx] = this.generator_(idx);
};
