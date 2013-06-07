;
goog.provide('pn.ui.filter.SelectFilter');

goog.require('pn.app.EventHandlerTarget');
goog.require('pn.ui.DelayedThrottleInputListener');



/**
 * @constructor
 * @extends {pn.app.EventHandlerTarget}
 * @param {!Element} select The select control.
 * @param {!Element} input The input filter control.
 */
pn.ui.filter.SelectFilter = function(select, input) {
  pn.assInst(select, Element);
  pn.assInst(input, Element);

  pn.app.EventHandlerTarget.call(this);

  /**
   * @private
   * @type {!Element}
   */
  this.select_ = select;

  /**
   * @private
   * @type {!Array.<!Element>}
   */
  this.options_ = pn.toarr(select.options);

  /**
   * @private
   * @type {!Element}
   */
  this.input_ = input;

  /**
   * @private
   * @type {!pn.ui.DelayedThrottleInputListener}
   */
  this.listener_ = new pn.ui.DelayedThrottleInputListener(100);
  this.registerDisposable(this.listener_);


  this.init_();
};
goog.inherits(pn.ui.filter.SelectFilter, pn.app.EventHandlerTarget);


/** @private */
pn.ui.filter.SelectFilter.prototype.init_ = function() {
  this.listener_.addInput(this.input_);
  this.listenTo(this.listener_, pn.ui.DelayedThrottleInputListener.CHANGED,
      this.filter_);
  this.listenTo(this.select_, goog.events.EventType.CHANGE, this.dispatchEvent);
};


/** @private */
pn.ui.filter.SelectFilter.prototype.filter_ = function() {
  var filter = goog.string.trim(this.input_.value).toLowerCase(),
      opts = !filter ? this.options_ : this.options_.pnfilter(function(o) {
        return goog.string.contains(o.innerText.toLowerCase(), filter);
      });
  if (!opts.length) {
    opts = [goog.dom.createDom('option', {'value': '0'}, 'No Matches.')];
  }
  goog.dom.removeChildren(this.select_);
  goog.dom.append(this.select_, opts);
};
