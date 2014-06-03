;
goog.provide('pn.ui.LoadingPnl');

goog.require('goog.Disposable');



/**
 * @constructor
 */
pn.ui.LoadingPnl = function() {
  /**
   * @private
   * @type {number}
   */
  this.workCount_ = 0;
};


/**
 * @return {boolean} Wether this loading panel is currently being displayed.
 */
pn.ui.LoadingPnl.prototype.showing = function() {
  return this.workCount_ > 0;
};


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
  if (this.workCount_ <= 0) this.showLoadingPanel_(false);
};


/**
 * @private
 * @param {boolean} visible Wether the loading panel should be shown or hidden.
 */
pn.ui.LoadingPnl.prototype.showLoadingPanel_ = function(visible) {
  // Hiding the loading panel needs to be done async to allow any running
  // processes to complete.  And if another process sneak in we do not hide.
  if (visible) goog.dom.classes.enable(document.body, 'loading', visible);
  else goog.Timer.callOnce(function() {
    if (this.workCount_ > 0) { return; }
    goog.dom.classes.enable(document.body, 'loading', visible);
  }, 100, this);
};
