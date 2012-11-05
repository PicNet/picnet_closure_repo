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
  this.swiper_ = new window['SwipeView'](el, { 'hastyPageFlip' : true });

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

  this.swiper_['updatePageCount'](pagesLength);
  var mp = this.swiper_['masterPages'];
  mp[0].dataset['pageIndex'] = pagesLength - 1;
  mp[0].dataset['upcomingPageIndex'] = mp[0].dataset['pageIndex'];

  // Load initial data
  for (var i = 0; i < 3; i++) {
    var pageIndex = i == 0 ? pagesLength - 1 : i - 1;
    mp[i].appendChild(this.get_(pageIndex));
  }

  this.swiper_['onFlip'](this.onFlip_.pnbind(this));
};
goog.inherits(pn.mob.ui.DynSwiper, goog.Disposable);


/** @private */
pn.mob.ui.DynSwiper.prototype.onFlip_ = function() {
  var mp = this.swiper_['masterPages'];
  for (var i = 0; i < 3; i++) {
    var upcoming = mp[i].dataset['upcomingPageIndex'];

    if (upcoming != mp[i].dataset['pageIndex']) {
      goog.dom.removeChildren(mp[i]);
      mp[i].appendChild(this.get_(upcoming));
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
