;
goog.provide('pn.mob.ui.DynSwiper');

goog.require('goog.events.EventHandler');



/**
 * This class is a wrapper around the SwipeView component by cubiq.
 * @see http://cubiq.org/swipeview
 * @constructor
 * @extends {goog.events.EventHandler}
 * @param {!Element} el The parent element for the swiper.
 * @param {!Element} dots The element to use as the dots container.
 * @param {number} pagesLength The number of pages to display.
 * @param {!function(number):!Element} generator The function that takes a page
 *    index and returns the element for that page.  The swiper does cache these
 *    elements so its not neccessary to implement your own caching.
 */
pn.mob.ui.DynSwiper = function(el, dots, pagesLength, generator) {
  pn.assDef(window['SwipeView'], 'SwipeView library not found');
  pn.assInst(el, HTMLElement);
  pn.assInst(dots, HTMLElement);
  pn.assPosInt(pagesLength);
  pn.assFun(generator);

  goog.events.EventHandler.call(this);

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
   * @type {!Element}
   */
  this.dots_ = dots;

  /**
   * @private
   * @type {number}
   */
  this.pagesLength_ = pagesLength;

  /**
   * @private
   * @type {!function(number):!Element}
   */
  this.generator_ = generator;

  this.init_();
};
goog.inherits(pn.mob.ui.DynSwiper, goog.events.EventHandler);


/** @private */
pn.mob.ui.DynSwiper.prototype.init_ = function() {
  this.initSwiper_();
  this.initDots_();
  this.initEvents_();
};


/** @private */
pn.mob.ui.DynSwiper.prototype.initSwiper_ = function() {
  this.swiper_['updatePageCount'](this.pagesLength_);
  var mp = this.swiper_['masterPages'];
  mp[0].dataset['pageIndex'] = this.pagesLength_ - 1;
  mp[0].dataset['upcomingPageIndex'] = mp[0].dataset['pageIndex'];

  // Load initial data
  for (var i = 0; i < 3; i++) {
    var pageIndex = i == 0 ? this.pagesLength_ - 1 : i - 1;
    mp[i].appendChild(this.get_(pageIndex));
  }
};


/** @private */
pn.mob.ui.DynSwiper.prototype.initDots_ = function() {
  var lis = [goog.dom.createDom('li', {'id': 'prev'}, '-')];
  for (var i = 0; i < this.pagesLength_; i++) {
    var opts = { 'id': i.toString() };
    if (i === 0) opts['class'] = 'selected';
    lis.push(goog.dom.createDom('li', opts));
  }
  lis.push(goog.dom.createDom('li', {'id': 'next'}, '+'));
  goog.dom.append(this.dots_, lis);
};


/** @private */
pn.mob.ui.DynSwiper.prototype.initEvents_ = function() {
  this.swiper_['onFlip'](this.onFlip_.pnbind(this));
  var lis = pn.toarr(this.dots_.childNodes);
  var et = goog.events.EventType.TOUCHSTART;
  lis.pnforEach(function(li) { this.listen(li, et, this.goto_); }, this);
};


/**
 * @private
 * @param {goog.events.Event} ev The navigation event.
 */
pn.mob.ui.DynSwiper.prototype.goto_ = function(ev) {
  var id = ev.target.id;
  if (id === 'prev') this.swiper_['prev']();
  else if (id === 'next') this.swiper_['next']();
  else this.swiper_['goToPage'](parseInt(id, 10));
};


/** @private */
pn.mob.ui.DynSwiper.prototype.onFlip_ = function() {
  var mp = this.swiper_['masterPages'];
  for (var i = 0; i < 3; i++) {
    var upcoming = mp[i].dataset['upcomingPageIndex'];

    if (upcoming != mp[i].dataset['pageIndex']) {
      goog.dom.removeChildren(mp[i]);
      mp[i].appendChild(this.get_(upcoming));
    }
    this.updateDots_();
  }
};


/** @private */
pn.mob.ui.DynSwiper.prototype.updateDots_ = function() {
  var dots = pn.toarr(this.dots_.childNodes);
  dots.pnforEach(function(d) { d.className = ''; });
  dots[this.swiper_['pageIndex'] + 1].className = 'selected';
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
