;
goog.provide('pn.mob.ui.DynSwiper');

goog.require('goog.events.EventHandler');
goog.require('pn.mob.ui.ISwipeable');



/**
 * This class is a wrapper around the SwipeView component by cubiq.
 * @see http://cubiq.org/swipeview
 * @constructor
 * @extends {goog.events.EventHandler}
 * @param {!Element} el The parent element for the swiper.
 * @param {!Element} dots The element to use as the dots container.
 * @param {number} pagesLength The number of pages to display.
 * @param {!pn.mob.ui.ISwipeable} swipeable The pn.mob.ui.ISwipeable that takes
 *    a page index and returns the element for that page.  The swiper does
 *    not cache these elements so its neccessary to implement your own caching
 *    if required.
 */
pn.mob.ui.DynSwiper = function(el, dots, pagesLength, swipeable) {
  pn.assDef(window['SwipeView'], 'SwipeView library not found');
  pn.assInst(el, HTMLElement);
  pn.assInst(dots, HTMLElement);
  pn.assPosInt(pagesLength);
  pn.assObj(swipeable);

  goog.events.EventHandler.call(this);

  /**
   * @private
   * @type {!Object}
   */
  this.swiper_ = new window['SwipeView'](el, {
    'hastyPageFlip' : true,
    'numberOfPages': pagesLength
  });


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
   * @type {!pn.mob.ui.ISwipeable}
   */
  this.swipeable_ = swipeable;

  /**
   * @private
   * @type {number}
   */
  this.current_ = 0;

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
  var mp = this.swiper_['masterPages'];

  for (var i = 0; i < 3; i++) {
    var pageIndex = i === 0 ? this.pagesLength_ - 1 : i - 1;
    mp[i].appendChild(this.swipeable_.generate(pageIndex));
  }
  this.swipeable_.showing(this.current_ = 0);
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
  // GOTO index: Disabled as it causes lots of issues with controls that
  // already have parents (caching issues).
  // else this.swiper_['goToPage'](parseInt(id, 10));
};


/** @private */
pn.mob.ui.DynSwiper.prototype.onFlip_ = function() {
  var mp = this.swiper_['masterPages'];
  for (var i = 0; i < 3; i++) {
    var mpdom = mp[i];
    var idx = parseInt(mpdom.dataset['upcomingPageIndex'], 10);
    var exp = parseInt(mpdom.dataset['pageIndex'], 10);
    if (idx !== exp) {
      goog.dom.removeChildren(mpdom);
      var div = this.swipeable_.generate(idx);
      mpdom.appendChild(div);
    }
  }

  var idx = this.swiper_['pageIndex'];
  this.updateDots_(idx);
  this.updateAnim_(idx);
};


/**
 * @private
 * @param {number} idx The index of the dot that is selected;.
 */
pn.mob.ui.DynSwiper.prototype.updateDots_ = function(idx) {
  var dots = pn.toarr(this.dots_.childNodes);
  dots.pnforEach(function(d) { d.className = ''; });
  dots[idx + 1].className = 'selected';
};


/**
 * @private
 * @param {number} idx The index of the anim that is selected;.
 */
pn.mob.ui.DynSwiper.prototype.updateAnim_ = function(idx) {
  if (this.current_ === idx) { return; }
  this.swipeable_.showing(this.current_ = idx);
};
