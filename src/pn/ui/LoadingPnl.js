;
goog.provide('pn.ui.LoadingPnl');

goog.require('goog.Disposable');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Element} element The element that represents the loading panel DOM.
 */
pn.ui.LoadingPnl = function(element) {
  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Element}
   */
  this.element_ = element;

  /**
   * @private
   * @type {number}
   */
  this.workCount_ = 0;
};
goog.inherits(pn.ui.LoadingPnl, goog.Disposable);


/**
 * Increments the work counter by one.  If there was no work previously then
 * the loading panel is shown.
 */
pn.ui.LoadingPnl.prototype.increment = function() {
  this.workCount_++;
  if (this.workCount_ === 1) this.showLoadingPanel_(true);
};


/**
 * Decrements the work counter by one.  If there is no work remaining then
 * the loading panel is hidden.
 */
pn.ui.LoadingPnl.prototype.decrement = function() {
  this.workCount_--;
  if (this.workCount_ === 0) this.showLoadingPanel_(false);
};


/**
 * @private
 * @param {boolean} visible Wether the loading panel should be shown or hidden.
 */
pn.ui.LoadingPnl.prototype.showLoadingPanel_ = function(visible) {
  var action = pn.dom.show.pnpartial(this.element_, visible);

  // Hiding the loading panel needs to be done async to allow any running
  // processes to complete.
  if (visible) action.call(this);
  else goog.Timer.callOnce(action, 1, this);
};
