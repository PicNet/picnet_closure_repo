;
goog.provide('pn.ui.grid.pipe.DoubleClickMobileHandler');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 */
pn.ui.grid.pipe.DoubleClickMobileHandler = function() {
  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {Object}
   */
  this.lastEl_ = null;

  /**
   * @private
   * @type {number}
   */
  this.lastT_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.delay_ = 300;
};
goog.inherits(pn.ui.grid.pipe.DoubleClickMobileHandler,
    pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.DoubleClickMobileHandler.prototype.postRender = function() {
  if (!goog.userAgent.MOBILE) return;

  this.listen(this.slick.getCanvasNode(),
      goog.events.EventType.TOUCHEND, this.tap_);
};


/**
 * @private
 * @param {!goog.events.Event} e The touch end event
 */
pn.ui.grid.pipe.DoubleClickMobileHandler.prototype.tap_ = function(e) {
  pn.assInst(e, goog.events.Event);
  pn.assObj(e.target);

  var now = goog.now();
  if (e.target !== this.lastEl_) {
    this.lastEl_ = /** @type {Object} */ (e.target);
    this.lastT_ = now;
    return;
  }
  var delta = now - this.lastT_;
  this.lastT_ = now;
  if (delta < this.delay_) {
    this.lastEl_ = null;
    $(e.target).trigger('dblclick');
  }
};
